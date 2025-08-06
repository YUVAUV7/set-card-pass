import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Clock, Users, Zap } from 'lucide-react';
import GameCard from './GameCard';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Player, GameCard as GameCardType } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  category: string;
  players: Player[];
  onBack: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ category, players, onBack }) => {
  const { gameState, dealCards, passCard, declareSet, resetGame } = useGameLogic(players, category);
  const [gameTime, setGameTime] = useState(0);

  // Start game automatically
  useEffect(() => {
    if (gameState.phase === 'setup') {
      setTimeout(() => dealCards(), 1000);
    }
  }, [gameState.phase, dealCards]);

  // Game timer
  useEffect(() => {
    if (gameState.phase === 'playing') {
      const interval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - gameState.gameStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.phase, gameState.gameStartTime]);

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurn);
  const isCurrentPlayerTurn = (playerId: number) => playerId === gameState.currentTurn;

  const handleCardSelect = (card: GameCardType, playerId: number) => {
    if (gameState.phase !== 'playing' || !isCurrentPlayerTurn(playerId)) return;
    
    // Automatically pass the card when clicked
    const player = gameState.players.find(p => p.id === playerId);
    if (player) {
      passCard(card, playerId);
    }
  };

  const handleDeclareSet = (player: Player) => {
    if (player.hasSet) {
      declareSet(player);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-yellow-900';
      case 2: return 'bg-gray-400 text-gray-900';
      case 3: return 'bg-amber-600 text-amber-100';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (gameState.phase === 'dealing') {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center animate-bounce-in">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Dealing Cards...</h2>
          <p className="text-muted-foreground">Get ready to play!</p>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
              Back to Menu
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Game Over!</h1>
            <Button variant="outline" onClick={resetGame}>
              Play Again
            </Button>
          </div>

          {/* Winner Celebration */}
          {gameState.winner && (
            <div className="text-center mb-8 animate-bounce-in">
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
                <Trophy className="w-16 h-16 text-primary-foreground" />
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-2">
                {gameState.winner.name} Wins!
              </h2>
              <p className="text-xl text-muted-foreground">
                Completed a SET with {gameState.winner.matchingCards} matching cards!
              </p>
            </div>
          )}

          {/* Final Rankings */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-2xl font-bold text-card-foreground mb-6 text-center">Final Rankings</h3>
            <div className="space-y-4">
              {gameState.rankings.map((player, index) => (
                <div
                  key={player.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg transition-all duration-300",
                    index === 0 ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Badge className={getRankColor(player.rank || index + 1)}>
                      #{player.rank || index + 1}
                    </Badge>
                    <div>
                      <h4 className="font-bold text-lg">{player.name}</h4>
                      <p className="text-sm opacity-80">
                        {player.matchingCards} matching cards 
                        {player.hasSet && " (SET!)"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {player.hand.map((card, cardIndex) => (
                      <GameCard
                        key={card.id}
                        item={card.item}
                        category={card.category}
                        isFlipped={true}
                        size="sm"
                        animationDelay={cardIndex * 100}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="font-mono text-lg text-foreground">{formatTime(gameTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{gameState.players.length} Players</span>
            </div>
          </div>
        </div>

        {/* Current Turn Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-card border border-border rounded-lg px-6 py-3 shadow-card">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold text-card-foreground">
              {currentPlayer?.name}'s Turn
            </span>
          </div>
        </div>

        {/* Game Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gameState.players.map((player, playerIndex) => (
            <div
              key={player.id}
              className={cn(
                "bg-card border-2 rounded-xl p-6 shadow-card transition-all duration-300",
                isCurrentPlayerTurn(player.id) ? "border-primary shadow-glow" : "border-border"
              )}
            >
              {/* Player Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                    isCurrentPlayerTurn(player.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {player.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-card-foreground">{player.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {player.matchingCards} matching cards
                    </p>
                  </div>
                </div>

                {/* SET Button */}
                {player.hasSet && (
                  <Button
                    variant="game"
                    size="sm"
                    onClick={() => handleDeclareSet(player)}
                    className="animate-pulse-glow"
                  >
                    <Trophy className="w-4 h-4" />
                    SET!
                  </Button>
                )}
              </div>

              {/* Player's Hand */}
              <div className="grid grid-cols-4 gap-3">
                {player.hand.map((card, cardIndex) => (
                  <GameCard
                    key={card.id}
                    item={card.item}
                    category={card.category}
                    isFlipped={true}
                    isSelected={false}
                    isPassable={isCurrentPlayerTurn(player.id)}
                    onClick={() => handleCardSelect(card, player.id)}
                    animationDelay={cardIndex * 150}
                    className={cn(
                      isCurrentPlayerTurn(player.id) ? "cursor-pointer hover:scale-105 transition-transform" : "cursor-not-allowed opacity-75"
                    )}
                  />
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Game Instructions */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-2">
            <span className="text-sm text-muted-foreground">
              Click any card to automatically pass it to the next player. Collect 4 matching cards to win!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;