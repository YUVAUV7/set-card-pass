-- Create game rooms table
CREATE TABLE public.game_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code text UNIQUE NOT NULL,
  host_user_id uuid REFERENCES auth.users(id) NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'selecting', 'playing', 'finished')),
  max_players integer NOT NULL DEFAULT 4,
  current_turn integer DEFAULT 0,
  turn_direction text DEFAULT 'clockwise' CHECK (turn_direction IN ('clockwise', 'counterclockwise')),
  turn_deadline timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create game players table
CREATE TABLE public.game_players (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_room_id uuid REFERENCES public.game_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  username text NOT NULL,
  player_position integer NOT NULL CHECK (player_position >= 0 AND player_position < 4),
  chosen_item text,
  is_ready boolean DEFAULT false,
  hand jsonb DEFAULT '[]'::jsonb,
  matching_cards integer DEFAULT 0,
  has_set boolean DEFAULT false,
  final_rank integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(game_room_id, user_id),
  UNIQUE(game_room_id, player_position),
  UNIQUE(game_room_id, chosen_item)
);

-- Create game cards table for tracking all cards in a game
CREATE TABLE public.game_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_room_id uuid REFERENCES public.game_rooms(id) ON DELETE CASCADE NOT NULL,
  card_id text NOT NULL,
  item text NOT NULL,
  current_owner_position integer,
  is_dealt boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create game events table for real-time event tracking
CREATE TABLE public.game_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_room_id uuid REFERENCES public.game_rooms(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('player_joined', 'player_left', 'game_started', 'card_passed', 'set_called', 'game_ended', 'turn_timeout')),
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_rooms
CREATE POLICY "Anyone can view game rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create game rooms" ON public.game_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "Host can update their game rooms" ON public.game_rooms FOR UPDATE TO authenticated USING (auth.uid() = host_user_id);
CREATE POLICY "Host can delete their game rooms" ON public.game_rooms FOR DELETE TO authenticated USING (auth.uid() = host_user_id);

-- RLS Policies for game_players
CREATE POLICY "Anyone can view game players" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join games" ON public.game_players FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Players can update their own data" ON public.game_players FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Players can leave games" ON public.game_players FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for game_cards
CREATE POLICY "Game participants can view cards" ON public.game_cards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.game_players 
    WHERE game_players.game_room_id = game_cards.game_room_id 
    AND game_players.user_id = auth.uid()
  )
);

-- RLS Policies for game_events
CREATE POLICY "Game participants can view events" ON public.game_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.game_players 
    WHERE game_players.game_room_id = game_events.game_room_id 
    AND game_players.user_id = auth.uid()
  )
);
CREATE POLICY "Game participants can create events" ON public.game_events FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.game_players 
    WHERE game_players.game_room_id = game_events.game_room_id 
    AND game_players.user_id = auth.uid()
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_game_rooms_updated_at
  BEFORE UPDATE ON public.game_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all game tables
ALTER TABLE public.game_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.game_players REPLICA IDENTITY FULL;
ALTER TABLE public.game_cards REPLICA IDENTITY FULL;
ALTER TABLE public.game_events REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_events;