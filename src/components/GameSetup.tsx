import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface GameSetupProps {
  category: Category;
  onStartGame: (players: SetupPlayer[]) => void;
  onBack: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({
  category,
  onStartGame,
  onBack
}) => {
  const [players, setPlayers] = useState<SetupPlayer[]>([
    { id: 1, name: '', selectedItem: '' },
    { id: 2, name: '', selectedItem: '' },
    { id: 3, name: '', selectedItem: '' },
    { id: 4, name: '', selectedItem: '' }
  ]);

  const [currentStep, setCurrentStep] = useState<'names' | 'items'>('names');

  const handleNameChange = (playerId: number, name: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, name } : p
    ));
  };

  const handleItemSelect = (playerId: number, item: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, selectedItem: item } : p
    ));
  };

  const canContinueNames = players.every(p => p.name.trim().length > 0);
  const canStartGame = players.every(p => p.selectedItem.length > 0) && 
                      new Set(players.map(p => p.selectedItem)).size === 4;

  const usedItems = players.map(p => p.selectedItem).filter(Boolean);

  const handleContinue = () => {
    if (currentStep === 'names' && canContinueNames) {
      setCurrentStep('items');
    } else if (currentStep === 'items' && canStartGame) {
      onStartGame(players);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Game Setup</h1>
            <p className="text-muted-foreground capitalize">
              Category: {category.name} {category.icon}
            </p>
          </div>
          <div className="w-20"></div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
              currentStep === 'names' ? "bg-primary text-primary-foreground" : "bg-success text-success-foreground"
            )}>
              1
            </div>
            <div className="w-12 h-1 bg-border"></div>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
              currentStep === 'items' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              2
            </div>
          </div>
        </div>

        {/* Player Names Step */}
        {currentStep === 'names' && (
          <div className="animate-slide-in">
            <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
              Enter Player Names
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="bg-card border border-border rounded-xl p-6 shadow-card"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">
                      Player {player.id}
                    </h3>
                  </div>
                  <Input
                    placeholder="Enter name..."
                    value={player.name}
                    onChange={(e) => handleNameChange(player.id, e.target.value)}
                    className="text-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Item Selection Step */}
        {currentStep === 'items' && (
          <div className="animate-slide-in">
            <h2 className="text-2xl font-bold text-center mb-4 text-foreground">
              Choose Your Items
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Each player must choose a different item from {category.name}
            </p>
            
            <div className="space-y-6 mb-8">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="bg-card border border-border rounded-xl p-6 shadow-card"
                >
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    {player.name}'s choice:
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {category.items.map((item) => {
                      const isUsed = usedItems.includes(item) && player.selectedItem !== item;
                      const isSelected = player.selectedItem === item;
                      
                      return (
                        <Button
                          key={item}
                          variant={isSelected ? "default" : "category"}
                          disabled={isUsed}
                          onClick={() => handleItemSelect(player.id, item)}
                          className={cn(
                            "h-12 text-sm",
                            isSelected && "ring-2 ring-primary ring-offset-2"
                          )}
                        >
                          {item}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          {currentStep === 'names' ? (
            <Button
              variant="game"
              size="lg"
              onClick={handleContinue}
              disabled={!canContinueNames}
              className="px-8"
            >
              Continue to Item Selection
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="game"
              size="lg"
              onClick={handleContinue}
              disabled={!canStartGame}
              className="px-8"
            >
              Start Game!
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameSetup;