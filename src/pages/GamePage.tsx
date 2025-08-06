import React, { useState } from 'react';
import StartScreen from '@/components/StartScreen';
import CategorySelection from '@/components/CategorySelection';
import GameSetup from '@/components/GameSetup';
import GameBoard from '@/components/GameBoard';
import MultiplayerLobby from '@/components/MultiplayerLobby';
import MultiplayerGameBoard from '@/components/MultiplayerGameBoard';
import { Player } from '@/types/game';

interface Category {
  name: string;
  items: string[];
  icon: string;
  gradient: string;
}

interface SetupPlayer {
  id: number;
  name: string;
  selectedItem: string;
}

type GameScreen = 'start' | 'category' | 'setup' | 'game' | 'multiplayer-lobby' | 'multiplayer-game';

const GamePage: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('start');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [players, setPlayers] = useState<SetupPlayer[]>([]);
  const [roomCode, setRoomCode] = useState<string>('');

  const handleStartGame = () => {
    setCurrentScreen('category');
  };

  const handleStartMultiplayer = () => {
    setCurrentScreen('multiplayer-lobby');
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCurrentScreen('setup');
  };

  const handleGameStart = (gamePlayers: SetupPlayer[]) => {
    setPlayers(gamePlayers);
    setCurrentScreen('game');
  };

  const handleBackToStart = () => {
    setCurrentScreen('start');
    setSelectedCategory(null);
    setPlayers([]);
    setRoomCode('');
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

  const handleGameRoomJoined = (code: string) => {
    setRoomCode(code);
    setCurrentScreen('multiplayer-game');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'start':
        return (
          <StartScreen
            onStartGame={handleStartGame}
            onStartMultiplayer={handleStartMultiplayer}
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
        return selectedCategory ? (
          <GameBoard
            category={selectedCategory.name}
            players={players.map(p => ({ 
              ...p, 
              hand: [], 
              matchingCards: 0, 
              hasSet: false 
            }))}
            onBack={handleBackToStart}
          />
        ) : null;
      case 'multiplayer-lobby':
        return (
          <MultiplayerLobby
            onBack={handleBackToStart}
            onGameStart={handleGameRoomJoined}
          />
        );
      case 'multiplayer-game':
        return roomCode ? (
          <MultiplayerGameBoard
            roomCode={roomCode}
            onBack={handleBackToStart}
          />
        ) : null;
      default:
        return null;
    }
  };

  return <div className="w-full">{renderCurrentScreen()}</div>;
};

export default GamePage;