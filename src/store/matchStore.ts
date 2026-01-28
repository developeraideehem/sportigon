import { create } from 'zustand';
import { Match } from '@/lib/supabase';

interface MatchState {
  matches: Match[];
  selectedSport: string;
  selectedLeague: string | null;
  filterDate: Date;

  setMatches: (matches: Match[]) => void;
  setSelectedSport: (sport: string) => void;
  setSelectedLeague: (league: string | null) => void;
  setFilterDate: (date: Date) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  matches: [],
  selectedSport: 'Football',
  selectedLeague: null,
  filterDate: new Date(),

  setMatches: (matches) => set({ matches }),

  setSelectedSport: (sport) => set({ selectedSport: sport, selectedLeague: null }),

  setSelectedLeague: (league) => set({ selectedLeague: league }),

  setFilterDate: (date) => set({ filterDate: date }),

  updateMatch: (matchId, updates) => set((state) => ({
    matches: state.matches.map((match) =>
      match.id === matchId ? { ...match, ...updates } : match
    ),
  })),
}));
