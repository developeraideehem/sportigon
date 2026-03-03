import { useState, useEffect, useCallback } from 'react';
import { supabase, type Match, type DataSource } from '@/lib/supabase';
import { useMatchStore } from '@/store/matchStore';
import { fetchTodayMatches, getApiUsage } from '@/services/apiSports';
import { storeMatchesInCache, fetchMatchesFromCache, shouldFetchFromApi } from '@/services/cacheService';
import { addDays, subDays } from 'date-fns';

function generateMockMatches(sport: string): Match[] {
    const now = new Date();
    const leagueMap: Record<string, string[][]> = {
        Football: [
            ['Premier League', 'Manchester United', 'Liverpool'],
            ['Premier League', 'Chelsea', 'Arsenal'],
            ['Premier League', 'Manchester City', 'Tottenham'],
            ['La Liga', 'Real Madrid', 'Barcelona'],
            ['La Liga', 'Atletico Madrid', 'Sevilla'],
            ['Serie A', 'AC Milan', 'Inter Milan'],
            ['Bundesliga', 'Bayern Munich', 'Borussia Dortmund'],
        ],
        Basketball: [
            ['NBA', 'LA Lakers', 'Golden State Warriors'],
            ['NBA', 'Boston Celtics', 'Miami Heat'],
            ['NBA', 'Milwaukee Bucks', 'Brooklyn Nets'],
            ['EuroLeague', 'Real Madrid', 'CSKA Moscow'],
        ],
        Tennis: [
            ['ATP Tour', 'Djokovic N.', 'Alcaraz C.'],
            ['ATP Tour', 'Medvedev D.', 'Sinner J.'],
            ['WTA Tour', 'Swiatek I.', 'Sabalenka A.'],
        ],
        Baseball: [
            ['MLB', 'New York Yankees', 'Boston Red Sox'],
            ['MLB', 'LA Dodgers', 'San Francisco Giants'],
        ],
        Hockey: [
            ['NHL', 'Toronto Maple Leafs', 'Montreal Canadiens'],
            ['NHL', 'Boston Bruins', 'New York Rangers'],
        ],
    };

    const rows = leagueMap[sport] ?? leagueMap['Football'];
    return rows.map(([league, home, away], idx) => {
        const isLive = idx === 0;
        const isFinished = idx === 1;
        const matchTime = isLive ? now : isFinished ? subDays(now, 0.1) : addDays(now, idx - 1);
        return {
            id: `mock-${sport}-${idx}`,
            home_team: home,
            away_team: away,
            home_score: isLive || isFinished ? Math.floor(Math.random() * 4) : 0,
            away_score: isLive || isFinished ? Math.floor(Math.random() * 4) : 0,
            status: isLive ? 'live' : isFinished ? 'finished' : 'scheduled',
            sport,
            league,
            match_time: matchTime.toISOString(),
            minute: isLive ? 45 + Math.floor(Math.random() * 45) : undefined,
            stadium: `${home} Arena`,
        } as Match;
    });
}

export function useMatches() {
    const { matches, selectedSport, selectedLeague, filterDate, setMatches, setSelectedLeague } = useMatchStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<DataSource>('mock');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [leagues, setLeagues] = useState<string[]>([]);
    const [apiUsage, setApiUsage] = useState({ callsToday: 0, maxCalls: 100, remaining: 100 });

    const fetchMatches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setApiUsage(getApiUsage());

            const cachedData = await fetchMatchesFromCache(selectedSport);
            const needsApiFetch = cachedData
                ? shouldFetchFromApi(cachedData.matches, cachedData.metadata.lastUpdate)
                : true;

            if (needsApiFetch) {
                const apiMatches = await fetchTodayMatches(selectedSport);
                if (apiMatches && apiMatches.length > 0) {
                    await storeMatchesInCache(apiMatches);
                    setMatches(apiMatches);
                    setDataSource('api');
                    setLastUpdate(new Date());
                    setLeagues([...new Set(apiMatches.map((m: Match) => m.league))]);
                    setApiUsage(getApiUsage());
                    return;
                }
            }

            if (cachedData && cachedData.matches.length > 0) {
                setMatches(cachedData.matches);
                setDataSource('supabase');
                setLastUpdate(new Date(cachedData.metadata.lastUpdate));
                setLeagues([...new Set(cachedData.matches.map((m: Match) => m.league))]);
                return;
            }

            const mockMatches = generateMockMatches(selectedSport);
            setMatches(mockMatches);
            setDataSource('mock');
            setLastUpdate(new Date());
            setLeagues([...new Set(mockMatches.map(m => m.league))]);

        } catch (err) {
            const mockMatches = generateMockMatches(selectedSport);
            setMatches(mockMatches);
            setDataSource('mock');
            setLastUpdate(new Date());
            setLeagues([...new Set(mockMatches.map(m => m.league))]);
            setError('Could not reach live data — showing demo data');
        } finally {
            setLoading(false);
        }
    }, [selectedSport, filterDate, setMatches]);

    // Initial load + reload on sport/date change
    useEffect(() => { fetchMatches(); }, [fetchMatches]);

    // Supabase realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel(`matches:${selectedSport}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, payload => {
                const updated = payload.new as Match;
                setMatches(
                    matches.map(m => m.id === updated.id ? { ...m, ...updated } : m)
                );
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [selectedSport, matches, setMatches]);

    // Auto-refresh live matches every 30s
    useEffect(() => {
        const hasLive = matches.some(m => m.status === 'live');
        if (!hasLive) return;
        const interval = setInterval(fetchMatches, 30_000);
        return () => clearInterval(interval);
    }, [matches, fetchMatches]);

    const filtered = selectedLeague
        ? matches.filter(m => m.league === selectedLeague)
        : matches;

    return {
        matches: filtered,
        allMatches: matches,
        loading,
        error,
        dataSource,
        lastUpdate,
        leagues,
        apiUsage,
        refetch: fetchMatches,
        liveMatches: filtered.filter(m => m.status === 'live' || m.status === 'halftime'),
        finishedMatches: filtered.filter(m => m.status === 'finished'),
        scheduledMatches: filtered.filter(m => m.status === 'scheduled'),
        selectedLeague,
        setSelectedLeague,
    };
}
