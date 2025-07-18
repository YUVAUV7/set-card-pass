import React, { useState } from 'react';
import StartScreen from '@/components/StartScreen';
import CategorySelection from '@/components/CategorySelection';
import GameSetup from '@/components/GameSetup';

interface Category {
  name: string;
  items: string[];
  icon: string;
  gradient: string;
}

interface Player {
  id: number;
  name: string;
  selectedItem: string;
}

type GameScreen = 'start' | 'category' | 'setup' | 'game';

const GamePage: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('start');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  const handleStartGame = () => {
    setCurrentScreen('category');
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCurrentScreen('setup');
  };

  const handleGameStart = (gamePlayers: Player[]) => {
    setPlayers(gamePlayers);
    setCurrentScreen('game');
  };

  const handleBackToStart = () => {
    setCurrentScreen('start');
    setSelectedCategory(null);
    setPlayers([]);
  };

  const handleBackToCategory = () => {
    setCurrentScreen('category');
  };

  const handleShowRules = () => {
    // TODO: Implement rules modal
    console.log('Show rules');
  };

  const handleShowSettings = () => {
    // TODO: Implement settings modal
    console.log('Show settings');
  };

  const handleExit = () => {
    // TODO: Implement exit logic
    console.log('Exit game');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'start':
        return (
          <StartScreen
            onStartGame={handleStartGame}
            onShowRules={handleShowRules}
            onShowSettings={handleShowSettings}
            onExit={handleExit}
          />
        );
      case 'category':
        return (
          <CategorySelection
            onCategorySelect={handleCategorySelect}
            onBack={handleBackToStart}
          />
        );
      case 'setup':
        return selectedCategory ? (
          <GameSetup
            category={selectedCategory}
            onStartGame={handleGameStart}
            onBack={handleBackToCategory}
          />
        ) : null;
      case 'game':
        return (
          <div className="min-h-screen bg-gradient-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Game Board</h1>
              <p className="text-muted-foreground">Game implementation coming soon...</p>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Players:</h3>
                <div className="grid grid-cols-2 gap-4">
                  {players.map((player) => (
                    <div key={player.id} className="bg-card p-4 rounded-lg border border-border">
                      <p className="font-semibold text-card-foreground">{player.name}</p>
                      <p className="text-sm text-muted-foreground">Item: {player.selectedItem}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="w-full">{renderCurrentScreen()}</div>;
};

export default GamePage;