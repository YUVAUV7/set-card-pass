import React from "react";
import { HelpCircle, Users, Shuffle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface HowToPlayPlayerInfo {
  name: string;
  cards: number;
  isYou?: boolean;
  isHost?: boolean;
  position?: number;
}

interface HowToPlayProps {
  mode: "Single Player" | "Multiplayer";
  category?: string;
  turnDirection?: "clockwise" | "counterclockwise";
  players: HowToPlayPlayerInfo[];
  rules?: string[];
  triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "game" | "category";
  triggerSize?: "default" | "sm" | "lg" | "icon";
}

const defaultRules = (turnDirection?: string) => [
  "Objective: Collect 4 matching cards to form a SET.",
  "On your turn, select one card and pass it to the next player.",
  `Turn order follows the room setting${turnDirection ? `: ${turnDirection}` : ""}.`,
  "When you have 4 of the same item, press 'Declare SET!' to win.",
];

export const HowToPlay: React.FC<HowToPlayProps> = ({
  mode,
  category,
  turnDirection,
  players,
  rules,
  triggerVariant = "outline",
  triggerSize = "sm",
}) => {
  const rulesToShow = rules && rules.length > 0 ? rules : defaultRules(turnDirection);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className="gap-2">
          <HelpCircle className="w-4 h-4" />
          How to Play
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>How to Play</SheetTitle>
          <SheetDescription>
            Quick guide tailored to this game.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Summary */}
          <section className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-card-foreground">
                <Users className="w-4 h-4" />
                <span className="font-medium">{mode}</span>
              </div>
              {turnDirection && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shuffle className="w-4 h-4" />
                  <span className="capitalize">{turnDirection}</span>
                </div>
              )}
            </div>
            {category && (
              <p className="text-sm text-muted-foreground">
                Category: <span className="text-foreground font-medium">{category}</span>
              </p>
            )}
          </section>

          {/* Players */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Players</h3>
            <ul className="space-y-2">
              {players.map((p, idx) => (
                <li
                  key={`${p.name}-${idx}`}
                  className={`flex items-center justify-between bg-muted/40 border border-border rounded-md px-3 py-2 ${p.isYou ? "ring-1 ring-primary" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {typeof p.position === "number" && (
                      <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-semibold">
                        {p.position}
                      </span>
                    )}
                    <span className="text-card-foreground font-medium">
                      {p.name}
                      {p.isYou ? " (You)" : ""}
                    </span>
                    {p.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{p.cards} cards</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Rules */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Rules</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              {rulesToShow.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ol>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HowToPlay;
