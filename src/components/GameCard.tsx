import React from 'react';
import { cn } from '@/lib/utils';

interface GameCardProps {
  item: string;
  category: string;
  isFlipped?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBack?: boolean;
  isPassable?: boolean;
  animationDelay?: number;
}

const GameCard: React.FC<GameCardProps> = ({
  item,
  category,
  isFlipped = false,
  isSelected = false,
  onClick,
  className,
  size = 'md',
  showBack = false,
  isPassable = false,
  animationDelay = 0
}) => {
  const sizeClasses = {
    sm: 'w-16 h-20 text-xs',
    md: 'w-20 h-28 text-sm',
    lg: 'w-24 h-32 text-base'
  };

  const categoryGradients = {
    animals: 'bg-gradient-animals',
    colors: 'bg-gradient-colors', 
    fruits: 'bg-gradient-fruits',
    vehicles: 'bg-vehicles',
    default: 'bg-gradient-card'
  };

  const categoryIcons = {
    animals: '🦁',
    colors: '🎨',
    fruits: '🍎',
    vehicles: '🚗',
    default: '🎯'
  };

  const itemIcons: Record<string, string> = {
    // Animals
    'Tiger': '🐅', 'Lion': '🦁', 'Cat': '🐱', 'Dog': '🐕', 
    'Elephant': '🐘', 'Bear': '🐻', 'Wolf': '🐺', 'Fox': '🦊',
    // Colors  
    'Red': '🔴', 'Blue': '🔵', 'Green': '🟢', 'Yellow': '🟡',
    'Purple': '🟣', 'Orange': '🟠', 'Pink': '🌸', 'Black': '⚫',
    // Fruits
    'Apple': '🍎', 'Banana': '🍌', 'Grape': '🍇',
    'Strawberry': '🍓', 'Mango': '🥭', 'Kiwi': '🥝', 'Pineapple': '🍍',
    // Vehicles
    'Car': '🚗', 'Truck': '🚛', 'Bike': '🚲', 'Bus': '🚌',
    'Train': '🚂', 'Plane': '✈️', 'Boat': '🚤', 'Motorcycle': '🏍️'
  };

  const gradient = categoryGradients[category as keyof typeof categoryGradients] || categoryGradients.default;
  const icon = itemIcons[item] || categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default;

  return (
    <div
      className={cn(
        "relative cursor-pointer transform transition-all duration-300",
        "hover:scale-105 hover:shadow-card-hover animate-card-deal",
        isPassable && "ring-2 ring-accent ring-opacity-50 animate-pulse-glow",
        sizeClasses[size],
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={onClick}
    >
      <div className={cn(
        "w-full h-full rounded-card shadow-card relative overflow-hidden",
        "flex items-center justify-center",
        "border-2 transition-all duration-300",
        isSelected ? "border-primary shadow-glow" : "border-border",
        showBack || !isFlipped ? "bg-muted" : gradient
      )}>
        {/* Card Back */}
        {(showBack || !isFlipped) && (
          <div className="text-center">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mb-1">
              <div className="w-4 h-4 bg-primary rounded"></div>
            </div>
            <div className="text-xs text-muted-foreground font-bold">SET</div>
          </div>
        )}

        {/* Card Front */}
        {isFlipped && !showBack && (
          <div className="text-center p-2 h-full flex flex-col justify-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="font-bold text-card-foreground text-xs leading-tight">
              {item}
            </div>
            <div className="text-xs text-card-foreground/60 mt-1 capitalize">
              {category}
            </div>
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full animate-bounce-in"></div>
        )}

        {/* Passable indicator */}
        {isPassable && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
            <div className="text-xs">→</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;