import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, Users, Crown, CheckCircle, ArrowRight } from 'lucide-react';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import GameCard from './GameCard';

interface MultiplayerGameBoardProps {
  roomCode: string;
  onBack: () => void;
}

const MultiplayerGameBoard: React.FC<MultiplayerGameBoardProps> = ({ roomCode, onBack }) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const { 
    gameRoom, 
    players, 
    currentPlayer,
    timeRemaining,
    isCurrentTurn,
    isHost,
    passCard,
    declareSet,
    leaveGameRoom
  } = useMultiplayerGame(roomCode);

  const handleCardSelect = (cardId: string) => {
    if (isCurrentTurn && gameRoom?.status === 'playing') {
      setSelectedCard(selectedCard === cardId ? null : cardId);
    }
  };

  const handlePassCard = async () => {
    if (selectedCard && isCurrentTurn) {
      await passCard(selectedCard);
      setSelectedCard(null);
    }
  };

  const handleDeclareSet = async () => {
    if (currentPlayer && hasValidSet()) {
      await declareSet();
    }
  };

  const hasValidSet = (): boolean => {
    if (!currentPlayer) return false;
    
    const hand = Array.isArray(currentPlayer.hand) ? currentPlayer.hand : JSON.parse(currentPlayer.hand as string);
    const itemCounts: { [key: string]: number } = {};
    
    hand.forEach((card: any) => {
      itemCounts[card.item] = (itemCounts[card.item] || 0) + 1;
    });

    return Object.values(itemCounts).some(count => count >= 4);
  };

  const getPlayerHand = (player: any) => {
    return Array.isArray(player.hand) ? player.hand : JSON.parse(player.hand as string || '[]');
  };

  const formatTime = (seconds: number): string => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getCurrentTurnPlayer = () => {
    return players.find(p => p.player_position === gameRoom?.current_turn);
  };

  const getNextPlayerPosition = () => {
    if (!gameRoom || !currentPlayer) return null;
    
    return gameRoom.turn_direction === 'clockwise' 
      ? (currentPlayer.player_position + 1) % players.length
      : (currentPlayer.player_position - 1 + players.length) % players.length;
  };

  const getNextPlayer = () => {
    const nextPos = getNextPlayerPosition();
    return nextPos !== null ? players.find(p => p.player_position === nextPos) : null;
  };

  if (!gameRoom || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/10 to-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Loading game...</p>
            <Button variant="outline" onClick={onBack}>
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game finished screen
  if (gameRoom.status === 'finished') {
    const winner = players.find(p => p.has_set);
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.has_set) return -1;
      if (b.has_set) return 1;
      return b.matching_cards - a.matching_cards;
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/10 to-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Victory Header */}
          <Card className="text-center bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400/50">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold mb-2">Game Over!</h1>
              {winner && (
                <p className="text-xl text-muted-foreground">
                  <span className="font-semibold text-foreground">{winner.username}</span> wins with a SET!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Final Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Final Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{player.username}</span>
                      {player.has_set && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.has_set ? 'SET!' : `${player.matching_cards} matching cards`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button onClick={onBack} size="lg">
              Back to Lobby
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentTurnPlayer = getCurrentTurnPlayer();
  const nextPlayer = getNextPlayer();
  const playerHand = getPlayerHand(currentPlayer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/10 to-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Game Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Room: {gameRoom.room_code}</h1>
                <Badge variant="outline">{gameRoom.category}</Badge>
              </div>
              
              <div className="flex items-center gap-6">
                {timeRemaining !== null && (
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    <span className={`font-mono ${timeRemaining <= 10 ? 'text-red-500' : ''}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
                
                <Button variant="ghost" onClick={leaveGameRoom}>
                  Leave Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Turn Indicator */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span className="font-medium">
                  {isCurrentTurn ? "Your turn" : `${currentTurnPlayer?.username || 'Player'}'s turn`}
                </span>
              </div>
              
              {nextPlayer && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Next: {nextPlayer.username}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Player's Hand */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Hand ({playerHand.length} cards)</CardTitle>
              {hasValidSet() && (
                <Button 
                  onClick={handleDeclareSet}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Declare SET!
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {playerHand.map((card: any, index: number) => (
                <div key={card.id || index} className="relative">
                  <GameCard
                    item={card.item}
                    category={card.category || gameRoom.category || ''}
                    isFlipped={true}
                    isSelected={selectedCard === (card.id || `card-${index}`)}
                    onClick={() => handleCardSelect(card.id || `card-${index}`)}
                  />
                  {selectedCard === (card.id || `card-${index}`) && isCurrentTurn && (
                    <div className="absolute inset-0 ring-4 ring-primary ring-opacity-75 rounded-lg pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
            
            {isCurrentTurn && selectedCard && gameRoom.status === 'playing' && (
              <div className="mt-4 flex justify-center">
                <Button onClick={handlePassCard} size="lg">
                  Pass Selected Card
                  {nextPlayer && ` to ${nextPlayer.username}`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Players */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {players
            .filter(p => p.user_id !== currentPlayer.user_id)
            .map((player) => {
              const hand = getPlayerHand(player);
              return (
                <Card key={player.id} className={`${
                  player.player_position === gameRoom.current_turn ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{player.username}</span>
                      <div className="flex items-center gap-2">
                        {gameRoom.host_user_id === player.user_id && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        {player.has_set && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {hand.length} cards
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-1">
                      {hand.slice(0, 4).map((_: any, index: number) => (
                        <div 
                          key={index}
                          className="aspect-[3/4] bg-muted rounded border-2 border-dashed border-muted-foreground/30"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Game Instructions */}
        {gameRoom.status === 'playing' && (
          <Card className="bg-muted/30">
            <CardContent className="p-4 text-sm text-muted-foreground text-center">
              {isCurrentTurn ? (
                <>Select a card from your hand and pass it to the next player. 
                If you have 4 matching cards, declare SET to win!</>
              ) : (
                <>Wait for your turn. Watch for opportunities to declare SET when you have 4 matching cards!</>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGameBoard;
