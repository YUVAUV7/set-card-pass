import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

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
  isBot?: boolean;
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
  const { user } = useAuth();
  
  // Get user display name - prefer username from email or use email
  const getUserDisplayName = () => {
    if (!user?.email) return 'Player';
    const emailUsername = user.email.split('@')[0];
    return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
  };

const [players, setPlayers] = useState<SetupPlayer[]>([
  { id: 1, name: '', selectedItem: '', isBot: false },
  { id: 2, name: '', selectedItem: '', isBot: true },
  { id: 3, name: '', selectedItem: '', isBot: true },
  { id: 4, name: '', selectedItem: '', isBot: true }
]);

  // Auto-populate player names when component mounts
  useEffect(() => {
    const displayName = getUserDisplayName();
    setPlayers(prev => prev.map((player, index) => ({
      ...player,
      name: index === 0 ? displayName : `Bot ${index + 1}`
    })));
  }, [user]);

  const handleItemSelect = (playerId: number, item: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, selectedItem: item } : p
    ));
  };

  const canStartGame = !!players.find(p => p.id === 1)?.selectedItem;


  const usedItems = players.map(p => p.selectedItem).filter(Boolean);

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

        {/* Step Indicator - Names completed, Items active */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-success text-success-foreground">
              ✓
            </div>
            <div className="w-12 h-1 bg-primary"></div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground">
              2
            </div>
          </div>
        </div>

        {/* Item Selection Step */}
        <div className="animate-slide-in">
          <h2 className="text-2xl font-bold text-center mb-4 text-foreground">
            Choose Your Item
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Pick one item from {category.name}. The 3 bots will auto-pick different items.
          </p>
          
          <div className="space-y-6 mb-8">
            {players.filter(p => !p.isBot).map((player) => (
              <div
                key={player.id}
                className="bg-card border border-border rounded-xl p-6 shadow-card"
              >
                <h3 className="text-lg font-semibold text-card-foreground mb-4">
                  {player.name}'s choice:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {category.items.map((item) => {
                    const isSelected = player.selectedItem === item;
                    return (
                      <Button
                        key={item}
                        variant={isSelected ? "default" : "category"}
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

        {/* Start Game Button */}
        <div className="text-center">
          <Button
            variant="game"
            size="lg"
            onClick={() => {
              const human = players.find(p => !p.isBot);
              if (!human || !human.selectedItem) return;
              const remaining = category.items.filter(i => i !== human.selectedItem);
              const botPlayers = players.filter(p => p.isBot);
              const assignedBots = botPlayers.map((bot, idx) => ({
                ...bot,
                selectedItem: remaining[idx] ?? remaining[0] ?? category.items[0]
              }));
              onStartGame([human, ...assignedBots]);
            }}
            disabled={!canStartGame}
            className="px-8"
          >
            Start Game!
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;