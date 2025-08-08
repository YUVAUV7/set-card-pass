import React from 'react';
import { Player } from '@/types/game';
import { cn } from '@/lib/utils';
import { Cpu } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BotRingProps {
  bots: Player[];
  currentTurn: number;
}

const positions = [
  'top-2 left-1/2 -translate-x-1/2',           // top center
  'left-2 top-1/2 -translate-y-1/2',           // middle left
  'right-2 top-1/2 -translate-y-1/2',          // middle right
];

const BotRing: React.FC<BotRingProps> = ({ bots, currentTurn }) => {
  if (!bots?.length) return null;

  return (
    <div className="relative mx-auto mb-6 h-64 w-full max-w-3xl rounded-full border border-border bg-muted/30">
      <TooltipProvider>
        {bots.slice(0, 3).map((bot, idx) => {
          const isActive = bot.id === currentTurn;
          const handCount = bot.hand?.length ?? 0;
          return (
            <div
              key={bot.id}
              className={cn(
                'absolute flex -translate-y-1/2 items-center gap-3 rounded-full border border-border bg-card px-3 py-2 shadow-card',
                positions[idx] || positions[0],
                isActive ? 'ring-2 ring-primary animate-pulse' : ''
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn('flex items-center gap-2')}>
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-semibold text-card-foreground">{bot.name}</div>
                      <div className="text-xs text-muted-foreground">{handCount} cards</div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{isActive ? 'Bot is taking a turn…' : 'Waiting…'}</TooltipContent>
              </Tooltip>

              {/* card backs preview (limited) */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(handCount, 4) }).map((_, i) => (
                  <div key={i} className="h-5 w-3 rounded-[2px] bg-muted/70 border border-border" />
                ))}
                {handCount > 4 && (
                  <span className="text-xs text-muted-foreground">+{handCount - 4}</span>
                )}
              </div>
            </div>
          );
        })}
      </TooltipProvider>
    </div>
  );
};

export default BotRing;
