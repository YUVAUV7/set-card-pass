export interface Category {
  name: string;
  items: string[];
  icon: string;
  gradient: string;
}

export interface Player {
  id: number;
  name: string;
  selectedItem: string;
  hand: GameCard[];
  matchingCards: number;
  hasSet: boolean;
  rank?: number;
  isBot?: boolean;
}

export interface GameCard {
  id: string;
  item: string;
  category: string;
  ownerId?: number;
}

export interface GameState {
  phase: 'setup' | 'dealing' | 'playing' | 'finished';
  currentTurn: number;
  players: Player[];
  deck: GameCard[];
  passedCard?: GameCard;
  winner?: Player;
  rankings: Player[];
  turnDirection: 'clockwise' | 'counterclockwise';
  gameStartTime: number;
}

export type GameAction = 
  | { type: 'DEAL_CARDS' }
  | { type: 'PASS_CARD'; card: GameCard; fromPlayer: number }
  | { type: 'DECLARE_SET'; player: Player }
  | { type: 'NEXT_TURN' }
  | { type: 'END_GAME' };