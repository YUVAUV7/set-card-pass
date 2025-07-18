import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Settings, X } from 'lucide-react';
import setLogo from '@/assets/set-logo.jpg';

interface StartScreenProps {
  onStartGame: () => void;
  onShowRules: () => void;
  onShowSettings: () => void;
  onExit: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onShowRules,
  onShowSettings,
  onExit
}) => {
  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center animate-slide-in">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={setLogo} 
            alt="SET Game Logo" 
            className="w-full h-40 object-cover rounded-xl shadow-glow"
          />
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            SET
          </h1>
          <p className="text-muted-foreground text-lg">
            Collect 4 matching cards to win!
          </p>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-4">
          <Button
            variant="game"
            size="lg"
            onClick={onStartGame}
            className="w-full h-14 text-lg animate-bounce-in"
            style={{ animationDelay: '0.1s' }}
          >
            <Play className="w-6 h-6" />
            Play Game
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onShowRules}
            className="w-full h-12 animate-bounce-in"
            style={{ animationDelay: '0.2s' }}
          >
            <BookOpen className="w-5 h-5" />
            How to Play
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onShowSettings}
            className="w-full h-12 animate-bounce-in"
            style={{ animationDelay: '0.3s' }}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={onExit}
            className="w-full h-12 animate-bounce-in"
            style={{ animationDelay: '0.4s' }}
          >
            <X className="w-5 h-5" />
            Exit
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            A strategic card-passing game for 4 players
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;