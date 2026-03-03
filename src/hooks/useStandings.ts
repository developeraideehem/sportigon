import { useState, useEffect } from 'react';
import { supabase, type Standing } from '@/lib/supabase';
import { useMatchStore } from '@/store/matchStore';

function generateMockStandings(sport: string, league: string): Standing[] {
    const footballTeams = ['Manchester City', 'Arsenal', 'Liverpool', 'Manchester United',
        'Chelsea', 'Newcastle', 'Brighton', 'Tottenham', 'Aston Villa', 'West Ham',
        'Crystal Palace', 'Brentford', 'Fulham', 'Wolves', 'Everton',
        'Nottingham Forest', 'Bournemouth', 'Burnley', 'Sheffield United', 'Luton Town'];
    const nbaTeams = ['Boston Celtics', 'Milwaukee Bucks', 'Denver Nuggets', 'Phoenix Suns',
        'LA Clippers', 'New York Knicks', 'Philadelphia 76ers', 'Cleveland Cavaliers',
        'Indiana Pacers', 'Miami Heat', 'Orlando Magic', 'Chicago Bulls', 'Atlanta Hawks',
        'Brooklyn Nets', 'Toronto Raptors'];
    const teams = sport === 'Basketball' ? nbaTeams : footballTeams;

    return teams.slice(0, sport === 'Football' ? 20 : 15).map((team, idx) => {
        const played = 28;
        const won = Math.max(0, played - idx * 1.2 - Math.floor(Math.random() * 3)) | 0;
        const drawn = Math.floor(Math.random() * 6);
        const lost = played - won - drawn;
        const gf = 70 - idx * 3 + Math.floor(Math.random() * 8);
        const ga = 20 + idx * 3 + Math.floor(Math.random() * 8);
        const form = ['W', 'W', 'D', 'L', 'W'].sort(() => Math.random() - 0.5).slice(0, 5).join('');
        return {
            id: `mock-standing-${sport}-${idx}`,
            team_name: team,
            league,
            sport,
            position: idx + 1,
            played,
            won,
            drawn,
            lost: Math.max(0, lost),
            goals_for: gf,
            goals_against: ga,
            goal_difference: gf - ga,
            points: won * 3 + drawn,
            form,
        } as Standing;
    });
}

export function useStandings() {
    const { selectedSport } = useMatchStore();
    const [selectedLeague, setSelectedLeague] = useState<string>('');
    const [standings, setStandings] = useState<Standing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const leagues: Record<string, string[]> = {
        Football: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'],
        Basketball: ['NBA', 'EuroLeague'],
        Tennis: ['ATP Rankings', 'WTA Rankings'],
        Baseball: ['MLB'],
        Hockey: ['NHL'],
    };

    const availableLeagues = leagues[selectedSport] ?? ['Premier League'];

    // Set default league when sport changes
    useEffect(() => {
        setSelectedLeague(availableLeagues[0]);
    }, [selectedSport]);

    useEffect(() => {
        if (!selectedLeague) return;
        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error: sbError } = await supabase
                    .from('standings')
                    .select('*')
                    .eq('sport', selectedSport)
                    .eq('league', selectedLeague)
                    .order('position', { ascending: true });

                if (sbError || !data || data.length === 0) {
                    // Fallback to mock
                    setStandings(generateMockStandings(selectedSport, selectedLeague));
                } else {
                    setStandings(data as Standing[]);
                }
            } catch {
                setStandings(generateMockStandings(selectedSport, selectedLeague));
                setError('Using demo data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selectedSport, selectedLeague]);

    return { standings, loading, error, availableLeagues, selectedLeague, setSelectedLeague };
}
