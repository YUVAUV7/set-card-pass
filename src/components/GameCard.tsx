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
}

const GameCard: React.FC<GameCardProps> = ({
  item,
  category,
  isFlipped = false,
  isSelected = false,
  onClick,
  className,
  size = 'md'
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

  const gradient = categoryGradients[category as keyof typeof categoryGradients] || categoryGradients.default;

  return (
    <div
      className={cn(
        "relative cursor-pointer transform transition-all duration-300",
        "hover:scale-105 hover:shadow-card-hover",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      <div className={cn(
        "w-full h-full rounded-card shadow-card",
        "flex items-center justify-center",
        "border-2 transition-all duration-300",
        isSelected ? "border-primary shadow-glow" : "border-border",
        isFlipped ? gradient : "bg-muted"
      )}>
        {isFlipped ? (
          <div className="text-center p-2">
            <div className="font-semibold text-card-foreground">
              {item}
            </div>
            <div className="text-xs text-muted-foreground mt-1 capitalize">
              {category}
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;