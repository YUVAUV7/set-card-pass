import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Clock, Crown } from 'lucide-react';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { useToast } from '@/hooks/use-toast';

interface MultiplayerLobbyProps {
  onBack: () => void;
  onGameStart?: (roomCode: string) => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onBack, onGameStart }) => {
  const [joinCode, setJoinCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const { 
    gameRoom, 
    players, 
    loading, 
    currentPlayer,
    isHost,
    createGameRoom, 
    joinGameRoom, 
    leaveGameRoom,
    setPlayerReady,
    startGame
  } = useMultiplayerGame();

  const { toast } = useToast();

  // Auto-navigate to game when it starts
  React.useEffect(() => {
    if (gameRoom?.status === 'playing' && onGameStart) {
      onGameStart(gameRoom.room_code);
    }
  }, [gameRoom?.status, gameRoom?.room_code, onGameStart]);

  const handleCreateRoom = async () => {
    const room = await createGameRoom();
    if (room) {
      // Automatically join the room as host
      await joinGameRoom(room.room_code);
    }
  };

  const handleJoinRoom = async () => {
    if (joinCode.trim()) {
      const success = await joinGameRoom(joinCode.trim());
      if (success) {
        setJoinCode('');
        setShowJoinForm(false);
      }
    }
  };

  const handleCopyRoomCode = () => {
    if (gameRoom) {
      navigator.clipboard.writeText(gameRoom.room_code);
      toast({ title: "Copied!", description: "Room code copied to clipboard" });
    }
  };

  const handleToggleReady = () => {
    if (currentPlayer) {
      setPlayerReady(!currentPlayer.is_ready);
    }
  };

  const getPlayerStatusBadge = (player: any) => {
    if (player.is_ready) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Ready</Badge>;
    }
    return <Badge variant="outline">Waiting</Badge>;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    return `${diffInMinutes} minutes ago`;
  };

  // If not in a room, show lobby options
  if (!gameRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/10 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">Multiplayer SET</h1>
            <p className="text-muted-foreground">Create or join a game room</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <Button 
                onClick={handleCreateRoom} 
                disabled={loading}
                className="w-full h-12 text-lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Create New Room
              </Button>

              <div className="text-center text-muted-foreground">or</div>

              {!showJoinForm ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinForm(true)}
                  className="w-full h-12 text-lg"
                >
                  Join Existing Room
                </Button>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Enter room code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono"
                    maxLength={6}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleJoinRoom} 
                      disabled={loading || !joinCode.trim()}
                      className="flex-1"
                    >
                      Join Room
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowJoinForm(false);
                        setJoinCode('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                variant="ghost" 
                onClick={onBack}
                className="w-full"
              >
                Back to Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show game room lobby
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/10 to-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Room Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Room: {gameRoom.room_code}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyRoomCode}
                    className="p-1 h-auto"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Created {formatTimeAgo(gameRoom.created_at)}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {players.length}/{gameRoom.max_players} Players
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: gameRoom.max_players }, (_, index) => {
            const player = players.find(p => p.player_position === index);
            
            return (
              <Card key={index} className={`${player ? 'border-primary/50' : 'border-dashed border-muted-foreground/30'}`}>
                <CardContent className="p-4">
                  {player ? (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="font-medium">{player.username}</span>
                        {gameRoom.host_user_id === player.user_id && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      {getPlayerStatusBadge(player)}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-3 h-3 rounded-full border-2 border-dashed border-muted-foreground/50" />
                      <span>Waiting for player...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Game Status */}
        {gameRoom.status === 'waiting' && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                <Clock className="w-5 h-5" />
                <span>Waiting for all players to join and ready up</span>
              </div>
              
              {currentPlayer && (
                <Button
                  onClick={handleToggleReady}
                  variant={currentPlayer.is_ready ? "outline" : "default"}
                  className="mb-4"
                >
                  {currentPlayer.is_ready ? "Not Ready" : "Ready Up"}
                </Button>
              )}

              {isHost && players.length >= 2 && players.every(p => p.is_ready) && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">All players are ready!</p>
                  <Button 
                    size="lg" 
                    className="font-semibold"
                    onClick={() => startGame('Animals')}
                  >
                    Start Game
                  </Button>
                </div>
              )}

              {isHost && players.length < 2 && (
                <p className="text-sm text-muted-foreground">
                  Need at least 2 players to start
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Leave Room Button */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={leaveGameRoom}>
            Leave Room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerLobby;