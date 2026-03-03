import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});

/* ─── Core Types ─── */

export type MatchStatus = 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed' | 'cancelled';
export type SportType = 'Football' | 'Basketball' | 'Tennis' | 'Baseball' | 'Hockey';
export type DataSource = 'api' | 'supabase' | 'mock';

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: MatchStatus;
  sport: SportType | string;
  league: string;
  league_logo?: string;
  home_logo?: string;
  away_logo?: string;
  match_time: string;
  minute?: number;
  stadium?: string;
  referee?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Standing {
  id: string;
  team_name: string;
  team_logo?: string;
  league: string;
  sport: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form?: string; // e.g. "WWDLW"
}

export interface League {
  id: string;
  name: string;
  sport: string;
  country: string;
  logo?: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  team_name?: string;
  league?: string;
  sport?: string;
}
