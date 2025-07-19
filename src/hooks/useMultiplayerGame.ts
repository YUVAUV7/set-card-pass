import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type GameRoom = Database['public']['Tables']['game_rooms']['Row'];
type GamePlayer = Database['public']['Tables']['game_players']['Row'];
type GameCard = Database['public']['Tables']['game_cards']['Row'];
type GameEvent = Database['public']['Tables']['game_events']['Row'];

export const useMultiplayerGame = (roomCode?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Generate random room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Create a new game room
  const createGameRoom = useCallback(async () => {
    if (!user) return null;

    setLoading(true);
    try {
      const newRoomCode = generateRoomCode();
      const { data, error } = await supabase
        .from('game_rooms')
        .insert({
          room_code: newRoomCode,
          host_user_id: user.id,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      setGameRoom(data);
      toast({ title: "Game room created!", description: `Room code: ${newRoomCode}` });
      return data;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Join an existing game room
  const joinGameRoom = useCallback(async (roomCodeToJoin: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      // First, find the game room
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', roomCodeToJoin.toUpperCase())
        .single();

      if (roomError) throw new Error('Room not found');

      // Check if room is full
      const { data: existingPlayers, error: playersError } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_room_id', room.id);

      if (playersError) throw playersError;

      if (existingPlayers.length >= room.max_players) {
        throw new Error('Room is full');
      }

      // Check if player is already in the room
      const isAlreadyInRoom = existingPlayers.some(p => p.user_id === user.id);
      if (isAlreadyInRoom) {
        setGameRoom(room);
        return true;
      }

      // Get username from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      // Join the room
      const { error: joinError } = await supabase
        .from('game_players')
        .insert({
          game_room_id: room.id,
          user_id: user.id,
          username: profile?.username || user.email?.split('@')[0] || 'Player',
          player_position: existingPlayers.length,
          is_ready: false
        });

      if (joinError) throw joinError;

      // Create join event
      await supabase
        .from('game_events')
        .insert({
          game_room_id: room.id,
          event_type: 'player_joined',
          event_data: { username: profile?.username || user.email?.split('@')[0] || 'Player' }
        });

      setGameRoom(room);
      toast({ title: "Joined game room!", description: `Room: ${roomCodeToJoin}` });
      return true;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Leave game room
  const leaveGameRoom = useCallback(async () => {
    if (!user || !gameRoom) return;

    try {
      await supabase
        .from('game_players')
        .delete()
        .eq('game_room_id', gameRoom.id)
        .eq('user_id', user.id);

      await supabase
        .from('game_events')
        .insert({
          game_room_id: gameRoom.id,
          event_type: 'player_left',
          event_data: { user_id: user.id }
        });

      setGameRoom(null);
      setPlayers([]);
      setGameCards([]);
      setGameEvents([]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [user, gameRoom, toast]);

  // Set player ready status
  const setPlayerReady = useCallback(async (isReady: boolean) => {
    if (!user || !gameRoom) return;

    try {
      await supabase
        .from('game_players')
        .update({ is_ready: isReady })
        .eq('game_room_id', gameRoom.id)
        .eq('user_id', user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [user, gameRoom, toast]);

  // Select item for player
  const selectItem = useCallback(async (item: string) => {
    if (!user || !gameRoom) return;

    try {
      await supabase
        .from('game_players')
        .update({ chosen_item: item })
        .eq('game_room_id', gameRoom.id)
        .eq('user_id', user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [user, gameRoom, toast]);

  // Start game (host only)
  const startGame = useCallback(async (category: string) => {
    if (!user || !gameRoom || gameRoom.host_user_id !== user.id) return;

    try {
      // Update room status and category
      await supabase
        .from('game_rooms')
        .update({ 
          status: 'selecting',
          category: category
        })
        .eq('id', gameRoom.id);

      await supabase
        .from('game_events')
        .insert({
          game_room_id: gameRoom.id,
          event_type: 'game_started',
          event_data: { category }
        });

      toast({ title: "Game started!", description: "Players can now select their items" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [user, gameRoom, toast]);

  // Pass card to next player
  const passCard = useCallback(async (cardId: string) => {
    if (!user || !gameRoom) return;

    try {
      const currentPlayer = players.find(p => p.user_id === user.id);
      if (!currentPlayer) return;

      // Find next player based on turn direction
      const nextPosition = gameRoom.turn_direction === 'clockwise' 
        ? (currentPlayer.player_position + 1) % 4
        : (currentPlayer.player_position - 1 + 4) % 4;

      // Handle hand as array (converting from Json if needed)
      const playerHand = Array.isArray(currentPlayer.hand) ? currentPlayer.hand : JSON.parse(currentPlayer.hand as string);
      
      // Remove card from current player's hand and add to next player
      const updatedHand = playerHand.filter((card: any) => card.id !== cardId);
      const cardToPass = playerHand.find((card: any) => card.id === cardId);

      if (!cardToPass) return;

      await supabase
        .from('game_players')
        .update({ hand: updatedHand })
        .eq('id', currentPlayer.id);

      const nextPlayer = players.find(p => p.player_position === nextPosition);
      if (nextPlayer) {
        const nextPlayerHand = Array.isArray(nextPlayer.hand) ? nextPlayer.hand : JSON.parse(nextPlayer.hand as string);
        const newHand = [...nextPlayerHand, cardToPass];
        await supabase
          .from('game_players')
          .update({ hand: newHand })
          .eq('id', nextPlayer.id);
      }

      // Create card passed event
      await supabase
        .from('game_events')
        .insert({
          game_room_id: gameRoom.id,
          event_type: 'card_passed',
          event_data: { 
            from_player: currentPlayer.player_position,
            to_player: nextPosition,
            card: cardToPass
          }
        });

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [user, gameRoom, players, toast]);

  // Declare set
  const declareSet = useCallback(async () => {
    if (!user || !gameRoom) return;

    try {
      const currentPlayer = players.find(p => p.user_id === user.id);
      if (!currentPlayer) return;

      await supabase
        .from('game_players')
        .update({ has_set: true })
        .eq('id', currentPlayer.id);

      await supabase
        .from('game_events')
        .insert({
          game_room_id: gameRoom.id,
          event_type: 'set_called',
          event_data: { 
            player_position: currentPlayer.player_position,
            username: currentPlayer.username
          }
        });

      toast({ title: "SET!", description: "You declared a set!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [user, gameRoom, players, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!gameRoom) return;

    const channel = supabase.channel(`game-room-${gameRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${gameRoom.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setGameRoom(payload.new as GameRoom);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `game_room_id=eq.${gameRoom.id}`
        },
        async () => {
          // Refetch players when any player data changes
          const { data } = await supabase
            .from('game_players')
            .select('*')
            .eq('game_room_id', gameRoom.id)
            .order('player_position');
          if (data) setPlayers(data);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_events',
          filter: `game_room_id=eq.${gameRoom.id}`
        },
        async () => {
          // Refetch events when new events are added
          const { data } = await supabase
            .from('game_events')
            .select('*')
            .eq('game_room_id', gameRoom.id)
            .order('created_at', { ascending: false })
            .limit(10);
          if (data) setGameEvents(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameRoom]);

  // Load game data when room changes
  useEffect(() => {
    if (!gameRoom) return;

    const loadGameData = async () => {
      try {
        // Load players
        const { data: playersData } = await supabase
          .from('game_players')
          .select('*')
          .eq('game_room_id', gameRoom.id)
          .order('player_position');
        
        if (playersData) setPlayers(playersData);

        // Load events
        const { data: eventsData } = await supabase
          .from('game_events')
          .select('*')
          .eq('game_room_id', gameRoom.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (eventsData) setGameEvents(eventsData);

        // Load cards if game is in progress
        if (gameRoom.status === 'playing') {
          const { data: cardsData } = await supabase
            .from('game_cards')
            .select('*')
            .eq('game_room_id', gameRoom.id);
          
          if (cardsData) setGameCards(cardsData);
        }
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    };

    loadGameData();
  }, [gameRoom]);

  // Auto-join room if roomCode is provided
  useEffect(() => {
    if (roomCode && user && !gameRoom) {
      joinGameRoom(roomCode);
    }
  }, [roomCode, user, gameRoom, joinGameRoom]);

  // Timer countdown effect
  useEffect(() => {
    if (!gameRoom?.turn_deadline) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const deadline = new Date(gameRoom.turn_deadline!);
      const now = new Date();
      const remaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        // Handle timeout logic here
        toast({ title: "Time's up!", description: "A random card will be passed", variant: "destructive" });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [gameRoom?.turn_deadline, toast]);

  const currentPlayer = players.find(p => p.user_id === user?.id);
  const isHost = user?.id === gameRoom?.host_user_id;
  const isCurrentTurn = currentPlayer?.player_position === gameRoom?.current_turn;

  return {
    // State
    gameRoom,
    players,
    gameCards,
    gameEvents,
    currentPlayer,
    loading,
    timeRemaining,
    
    // Computed values
    isHost,
    isCurrentTurn,
    
    // Actions
    createGameRoom,
    joinGameRoom,
    leaveGameRoom,
    setPlayerReady,
    selectItem,
    startGame,
    passCard,
    declareSet
  };
};