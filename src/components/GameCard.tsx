import React from 'react';
import { cn } from '@/lib/utils';

// Sports images
import soccerImg from '@/assets/items/sports/soccer.svg';
import basketballImg from '@/assets/items/sports/basketball.svg';
import tennisImg from '@/assets/items/sports/tennis.svg';
import baseballImg from '@/assets/items/sports/baseball.svg';
import cricketImg from '@/assets/items/sports/cricket.svg';
import rugbyImg from '@/assets/items/sports/rugby.svg';
import golfImg from '@/assets/items/sports/golf.svg';
import hockeyImg from '@/assets/items/sports/hockey.svg';

// Country flags
import usFlag from '@/assets/items/countries/us.svg';
import caFlag from '@/assets/items/countries/ca.svg';
import brFlag from '@/assets/items/countries/br.svg';
import deFlag from '@/assets/items/countries/de.svg';
import inFlag from '@/assets/items/countries/in.svg';
import jpFlag from '@/assets/items/countries/jp.svg';
import auFlag from '@/assets/items/countries/au.svg';
import frFlag from '@/assets/items/countries/fr.svg';

// Instruments images
import guitarImg from '@/assets/items/instruments/guitar.svg';
import pianoImg from '@/assets/items/instruments/piano.svg';
import violinImg from '@/assets/items/instruments/violin.svg';
import drumsImg from '@/assets/items/instruments/drums.svg';
import fluteImg from '@/assets/items/instruments/flute.svg';
import saxophoneImg from '@/assets/items/instruments/saxophone.svg';
import trumpetImg from '@/assets/items/instruments/trumpet.svg';
import celloImg from '@/assets/items/instruments/cello.svg';

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
    sports: 'bg-gradient-sports',
    countries: 'bg-gradient-countries',
    instruments: 'bg-gradient-instruments',
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

  const itemImages: Record<string, string> = {
    // Sports
    'Soccer': soccerImg,
    'Basketball': basketballImg,
    'Tennis': tennisImg,
    'Baseball': baseballImg,
    'Cricket': cricketImg,
    'Rugby': rugbyImg,
    'Golf': golfImg,
    'Hockey': hockeyImg,
    // Countries
    'USA': usFlag,
    'Canada': caFlag,
    'Brazil': brFlag,
    'Germany': deFlag,
    'India': inFlag,
    'Japan': jpFlag,
    'Australia': auFlag,
    'France': frFlag,
    // Instruments
    'Guitar': guitarImg,
    'Piano': pianoImg,
    'Violin': violinImg,
    'Drums': drumsImg,
    'Flute': fluteImg,
    'Saxophone': saxophoneImg,
    'Trumpet': trumpetImg,
    'Cello': celloImg,
  };

  const gradient = categoryGradients[category as keyof typeof categoryGradients] || categoryGradients.default;
  const icon = itemIcons[item] || categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default;
  const imageSrc = itemImages[item];

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
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={`${item} ${category}`}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain mx-auto mb-1"
                loading="lazy"
              />
            ) : (
              <div className="text-2xl mb-1">{icon}</div>
            )}
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