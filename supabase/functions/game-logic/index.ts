import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface GameCard {
  id: string;
  item: string;
  category: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, gameRoomId, playerId, data } = await req.json();

    switch (action) {
      case 'start_game':
        return await startGame(gameRoomId, data.category);
      case 'deal_cards':
        return await dealCards(gameRoomId);
      case 'pass_card':
        return await passCard(gameRoomId, playerId, data.cardId);
      case 'declare_set':
        return await declareSet(gameRoomId, playerId);
      case 'handle_timeout':
        return await handleTimeout(gameRoomId);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Game logic error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function startGame(gameRoomId: string, category: string) {
  console.log(`Starting game for room ${gameRoomId} with category ${category}`);
  
  // Get all players
  const { data: players, error: playersError } = await supabase
    .from('game_players')
    .select('*')
    .eq('game_room_id', gameRoomId)
    .order('player_position');

  if (playersError || !players || players.length < 2) {
    throw new Error('Not enough players to start game');
  }

  // Validate all players have selected items
  const playerItems = players.map(p => p.chosen_item).filter(Boolean);
  if (playerItems.length !== players.length) {
    throw new Error('All players must select items before starting');
  }

  // Generate cards (4 of each selected item)
  const gameCards: GameCard[] = [];
  playerItems.forEach(item => {
    for (let i = 0; i < 4; i++) {
      gameCards.push({
        id: `${item}-${i}`,
        item: item!,
        category
      });
    }
  });

  // Shuffle cards
  for (let i = gameCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
  }

  // Store cards in database
  const cardsToInsert = gameCards.map(card => ({
    game_room_id: gameRoomId,
    card_id: card.id,
    item: card.item,
    is_dealt: false
  }));

  const { error: cardsError } = await supabase
    .from('game_cards')
    .insert(cardsToInsert);

  if (cardsError) {
    throw new Error('Failed to create game cards');
  }

  // Update room status to playing
  const { error: roomError } = await supabase
    .from('game_rooms')
    .update({ 
      status: 'playing',
      current_turn: 0,
      turn_deadline: new Date(Date.now() + 30000).toISOString() // 30 second timer
    })
    .eq('id', gameRoomId);

  if (roomError) {
    throw new Error('Failed to update room status');
  }

  // Deal cards
  await dealCards(gameRoomId);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function dealCards(gameRoomId: string) {
  console.log(`Dealing cards for room ${gameRoomId}`);
  
  // Get players and undealt cards
  const { data: players } = await supabase
    .from('game_players')
    .select('*')
    .eq('game_room_id', gameRoomId)
    .order('player_position');

  const { data: cards } = await supabase
    .from('game_cards')
    .select('*')
    .eq('game_room_id', gameRoomId)
    .eq('is_dealt', false);

  if (!players || !cards || cards.length < players.length * 4) {
    throw new Error('Not enough cards to deal');
  }

  // Deal 4 cards to each player
  for (let i = 0; i < players.length; i++) {
    const playerCards = cards.slice(i * 4, (i + 1) * 4);
    const hand = playerCards.map(card => ({
      id: card.card_id,
      item: card.item,
      category: 'game' // Will be updated with actual category
    }));

    // Update player hand
    await supabase
      .from('game_players')
      .update({ hand: JSON.stringify(hand) })
      .eq('id', players[i].id);

    // Mark cards as dealt
    const cardIds = playerCards.map(c => c.id);
    await supabase
      .from('game_cards')
      .update({ 
        is_dealt: true,
        current_owner_position: players[i].player_position 
      })
      .in('id', cardIds);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function passCard(gameRoomId: string, playerId: string, cardId: string) {
  console.log(`Player ${playerId} passing card ${cardId} in room ${gameRoomId}`);
  
  // Get game room and validate turn
  const { data: gameRoom } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('id', gameRoomId)
    .single();

  if (!gameRoom || gameRoom.status !== 'playing') {
    throw new Error('Game is not in playing state');
  }

  // Get current player and validate it's their turn
  const { data: currentPlayer } = await supabase
    .from('game_players')
    .select('*')
    .eq('game_room_id', gameRoomId)
    .eq('user_id', playerId)
    .single();

  if (!currentPlayer || currentPlayer.player_position !== gameRoom.current_turn) {
    throw new Error('Not your turn');
  }

  // Get all players
  const { data: players } = await supabase
    .from('game_players')
    .select('*')
    .eq('game_room_id', gameRoomId)
    .order('player_position');

  if (!players) {
    throw new Error('Failed to get players');
  }

  // Validate player has the card
  const playerHand = JSON.parse(currentPlayer.hand as string || '[]');
  const cardIndex = playerHand.findIndex((card: any) => card.id === cardId);
  
  if (cardIndex === -1) {
    throw new Error('You do not have that card');
  }

  // Remove card from current player's hand
  const cardToPass = playerHand[cardIndex];
  playerHand.splice(cardIndex, 1);

  // Find next player
  const nextPlayerPosition = gameRoom.turn_direction === 'clockwise'
    ? (currentPlayer.player_position + 1) % players.length
    : (currentPlayer.player_position - 1 + players.length) % players.length;

  const nextPlayer = players.find(p => p.player_position === nextPlayerPosition);
  if (!nextPlayer) {
    throw new Error('Next player not found');
  }

  // Add card to next player's hand
  const nextPlayerHand = JSON.parse(nextPlayer.hand as string || '[]');
  nextPlayerHand.push(cardToPass);

  // Update both players' hands
  await supabase
    .from('game_players')
    .update({ hand: JSON.stringify(playerHand) })
    .eq('id', currentPlayer.id);

  await supabase
    .from('game_players')
    .update({ hand: JSON.stringify(nextPlayerHand) })
    .eq('id', nextPlayer.id);

  // Check for sets after card is passed
  const hasSet = checkForSet(nextPlayerHand);
  if (hasSet) {
    await supabase
      .from('game_players')
      .update({ has_set: true })
      .eq('id', nextPlayer.id);

    // End game
    await endGame(gameRoomId, nextPlayer.id);
  } else {
    // Move to next turn
    const newCurrentTurn = (gameRoom.current_turn + 1) % players.length;
    const newDeadline = new Date(Date.now() + 30000).toISOString();

    await supabase
      .from('game_rooms')
      .update({ 
        current_turn: newCurrentTurn,
        turn_deadline: newDeadline
      })
      .eq('id', gameRoomId);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function declareSet(gameRoomId: string, playerId: string) {
  console.log(`Player ${playerId} declaring set in room ${gameRoomId}`);
  
  // Get player
  const { data: player } = await supabase
    .from('game_players')
    .select('*')
    .eq('game_room_id', gameRoomId)
    .eq('user_id', playerId)
    .single();

  if (!player) {
    throw new Error('Player not found');
  }

  // Validate player has a set
  const playerHand = JSON.parse(player.hand as string || '[]');
  const hasSet = checkForSet(playerHand);

  if (!hasSet) {
    throw new Error('You do not have a valid set');
  }

  // Mark player as having set and end game
  await supabase
    .from('game_players')
    .update({ has_set: true })
    .eq('id', player.id);

  await endGame(gameRoomId, player.id);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleTimeout(gameRoomId: string) {
  console.log(`Handling timeout for room ${gameRoomId}`);
  
  // Get current game state
  const { data: gameRoom } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('id', gameRoomId)
    .single();

  if (!gameRoom || gameRoom.status !== 'playing') {
    return new Response(
      JSON.stringify({ success: false, message: 'Game not in playing state' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get current player
  const { data: currentPlayer } = await supabase
    .from('game_players')
    .select('*')
    .eq('game_room_id', gameRoomId)
    .eq('player_position', gameRoom.current_turn)
    .single();

  if (!currentPlayer) {
    throw new Error('Current player not found');
  }

  // Auto-pass a random card
  const playerHand = JSON.parse(currentPlayer.hand as string || '[]');
  if (playerHand.length > 0) {
    const randomCardIndex = Math.floor(Math.random() * playerHand.length);
    const randomCard = playerHand[randomCardIndex];
    
    // Use the existing pass card logic
    await passCard(gameRoomId, currentPlayer.user_id, randomCard.id);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function endGame(gameRoomId: string, winnerId: string) {
  console.log(`Ending game for room ${gameRoomId}, winner: ${winnerId}`);
  
  // Update room status to finished
  await supabase
    .from('game_rooms')
    .update({ status: 'finished' })
    .eq('id', gameRoomId);

  // Calculate final rankings based on matching cards
  const { data: players } = await supabase
    .from('game_players')
    .select('*')
    .eq('game_room_id', gameRoomId);

  if (players) {
    const rankings = players.map(player => {
      const hand = JSON.parse(player.hand as string || '[]');
      const matchingCards = calculateMatchingCards(hand);
      return { ...player, matching_cards: matchingCards };
    });

    // Sort by has_set first, then by matching cards
    rankings.sort((a, b) => {
      if (a.has_set && !b.has_set) return -1;
      if (!a.has_set && b.has_set) return 1;
      return b.matching_cards - a.matching_cards;
    });

    // Update player rankings
    for (let i = 0; i < rankings.length; i++) {
      await supabase
        .from('game_players')
        .update({ 
          final_rank: i + 1,
          matching_cards: rankings[i].matching_cards
        })
        .eq('id', rankings[i].id);
    }
  }

  // Create game ended event
  await supabase
    .from('game_events')
    .insert({
      game_room_id: gameRoomId,
      event_type: 'game_ended',
      event_data: { winner_id: winnerId }
    });
}

function checkForSet(hand: any[]): boolean {
  const itemCounts: { [key: string]: number } = {};
  
  hand.forEach(card => {
    itemCounts[card.item] = (itemCounts[card.item] || 0) + 1;
  });

  return Object.values(itemCounts).some(count => count >= 4);
}

function calculateMatchingCards(hand: any[]): number {
  const itemCounts: { [key: string]: number } = {};
  
  hand.forEach(card => {
    itemCounts[card.item] = (itemCounts[card.item] || 0) + 1;
  });

  return Math.max(...Object.values(itemCounts), 0);
}