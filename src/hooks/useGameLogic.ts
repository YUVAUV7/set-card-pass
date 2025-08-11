import { useState, useCallback } from 'react';
import { GameState, Player, GameCard, GameAction } from '@/types/game';

export const useGameLogic = (initialPlayers: Player[], category: string) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Create 16 cards (4 of each selected item)
    const deck: GameCard[] = [];
    initialPlayers.forEach((player) => {
      for (let i = 0; i < 4; i++) {
        deck.push({
          id: `${player.selectedItem}-${i + 1}`,
          item: player.selectedItem,
          category,
          ownerId: player.id
        });
      }
    });

    // Shuffle deck
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);

    return {
      phase: 'setup',
      currentTurn: 1,
      players: initialPlayers.map(p => ({ ...p, hand: [], matchingCards: 0, hasSet: false })),
      deck: shuffledDeck,
      winner: undefined,
      rankings: [],
      turnDirection: 'clockwise',
      gameStartTime: Date.now()
    };
  });

  const dealCards = useCallback(() => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const remainingDeck = [...prev.deck];
      
      // Deal 4 cards to each player
      for (let i = 0; i < 4; i++) {
        newPlayers.forEach((player, playerIndex) => {
          if (remainingDeck.length > 0) {
            const card = remainingDeck.pop()!;
            newPlayers[playerIndex].hand.push(card);
          }
        });
      }

      // Check for initial sets
      newPlayers.forEach(player => {
        const { matchingCards, hasSet } = checkPlayerSet(player);
        player.matchingCards = matchingCards;
        player.hasSet = hasSet;
      });

      return {
        ...prev,
        phase: 'playing' as const,
        players: newPlayers,
        deck: remainingDeck
      };
    });
  }, []);

  const checkPlayerSet = (player: Player) => {
    const itemCounts: Record<string, number> = {};
    player.hand.forEach(card => {
      itemCounts[card.item] = (itemCounts[card.item] || 0) + 1;
    });

    const maxMatching = Math.max(...Object.values(itemCounts));
    const hasSet = maxMatching >= 4;

    return { matchingCards: maxMatching, hasSet };
  };

  const passCard = useCallback((cardToPass: GameCard, fromPlayerId: number) => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;

      const newPlayers = [...prev.players];
      const fromPlayerIndex = newPlayers.findIndex(p => p.id === fromPlayerId);
      const nextPlayerIndex = prev.turnDirection === 'clockwise' 
        ? (fromPlayerIndex + 1) % newPlayers.length
        : (fromPlayerIndex - 1 + newPlayers.length) % newPlayers.length;

      // Remove card from current player
      newPlayers[fromPlayerIndex].hand = newPlayers[fromPlayerIndex].hand.filter(
        card => card.id !== cardToPass.id
      );

      // Add card to next player
      newPlayers[nextPlayerIndex].hand.push(cardToPass);

      // Check for sets
      newPlayers.forEach(player => {
        const { matchingCards, hasSet } = checkPlayerSet(player);
        player.matchingCards = matchingCards;
        player.hasSet = hasSet;
      });

      // Check if anyone has a set
      const playerWithSet = newPlayers.find(p => p.hasSet);
      if (playerWithSet) {
        return endGame(newPlayers, playerWithSet);
      }

      // Move to next turn
      const nextTurn = (prev.currentTurn % newPlayers.length) + 1;

      return {
        ...prev,
        players: newPlayers,
        currentTurn: nextTurn,
        passedCard: cardToPass
      };
    });
  }, []);

  const declareSet = useCallback((player: Player) => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const declaringPlayer = newPlayers.find(p => p.id === player.id);
      
      if (declaringPlayer && declaringPlayer.hasSet) {
        return endGame(newPlayers, declaringPlayer);
      }
      
      return prev;
    });
  }, []);

  const endGame = (players: Player[], winner: Player) => {
    // Calculate rankings
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.hasSet && !b.hasSet) return -1;
      if (!a.hasSet && b.hasSet) return 1;
      return b.matchingCards - a.matchingCards;
    });

    sortedPlayers.forEach((player, index) => {
      player.rank = index + 1;
    });

    return {
      phase: 'finished' as const,
      currentTurn: 0,
      players,
      deck: [],
      winner,
      rankings: sortedPlayers,
      turnDirection: 'clockwise' as const,
      gameStartTime: Date.now()
    };
  };

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'setup',
      currentTurn: 1,
      players: prev.players.map(p => ({ 
        ...p, 
        hand: [], 
        matchingCards: 0, 
        hasSet: false, 
        rank: undefined 
      })),
      winner: undefined,
      rankings: [],
      passedCard: undefined
    }));
  }, []);

  const endByTimer = useCallback(() => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;

      // Ensure players have up-to-date matching/hasSet values
      const updatedPlayers = prev.players.map(p => {
        const { matchingCards, hasSet } = checkPlayerSet(p);
        return { ...p, matchingCards, hasSet };
      });

      // Determine provisional winner by current standings
      const provisionalSorted = [...updatedPlayers].sort((a, b) => {
        if (a.hasSet && !b.hasSet) return -1;
        if (!a.hasSet && b.hasSet) return 1;
        return b.matchingCards - a.matchingCards;
      });

      const winner = provisionalSorted[0];
      return endGame(updatedPlayers, winner);
    });
  }, []);

  return {
    gameState,
    dealCards,
    passCard,
    declareSet,
    resetGame,
    endByTimer
  };
};