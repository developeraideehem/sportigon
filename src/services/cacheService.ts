import { supabase, Match, Standing } from '@/lib/supabase';

interface CacheMetadata {
    lastUpdate: string;
    source: 'api' | 'cache' | 'mock';
    sport: string;
}

// Cache duration in milliseconds
const CACHE_DURATIONS = {
    live: 30 * 1000, // 30 seconds for live matches
    scheduled: 60 * 60 * 1000, // 1 hour for scheduled matches
    finished: 24 * 60 * 60 * 1000, // 24 hours for finished matches
    standings: 60 * 60 * 1000, // 1 hour for standings
};

/**
 * Store matches in Supabase for caching
 */
export async function storeMatchesInCache(matches: Match[]): Promise<void> {
    if (!matches || matches.length === 0) return;

    try {
        // Delete old matches for this sport first
        const sport = matches[0].sport;
        const today = new Date().toISOString().split('T')[0];

        await supabase
            .from('matches')
            .delete()
            .eq('sport', sport)
            .gte('match_time', `${today}T00:00:00`)
            .lte('match_time', `${today}T23:59:59`);

        // Insert new matches
        const { error } = await supabase.from('matches').insert(matches);

        if (error) {
            console.error('Error storing matches in cache:', error);
        } else {
            console.log(`Cached ${matches.length} ${sport} matches in Supabase`);
        }
    } catch (error) {
        console.error('Failed to cache matches:', error);
    }
}

/**
 * Fetch matches from Supabase cache
 */
export async function fetchMatchesFromCache(
    sport: string,
    date?: string
): Promise<{ matches: Match[]; metadata: CacheMetadata } | null> {
    try {
        let query = supabase.from('matches').select('*').eq('sport', sport);

        if (date) {
            // Fetch matches for a specific date
            query = query
                .gte('match_time', `${date}T00:00:00`)
                .lte('match_time', `${date}T23:59:59`);
        } else {
            // Fetch today's matches by default
            const today = new Date().toISOString().split('T')[0];
            query = query
                .gte('match_time', `${today}T00:00:00`)
                .lte('match_time', `${today}T23:59:59`);
        }

        const { data, error } = await query.order('match_time', { ascending: true });

        if (error) {
            console.error('Error fetching from cache:', error);
            return null;
        }

        if (!data || data.length === 0) {
            return null;
        }

        // Calculate cache age from the most recent match update
        const mostRecent = data.reduce((latest, match) => {
            const matchTime = new Date(match.created_at || match.match_time);
            const latestTime = new Date(latest.created_at || latest.match_time);
            return matchTime > latestTime ? match : latest;
        }, data[0]);

        return {
            matches: data,
            metadata: {
                lastUpdate: mostRecent.created_at || mostRecent.match_time,
                source: 'cache',
                sport,
            },
        };
    } catch (error) {
        console.error('Failed to fetch from cache:', error);
        return null;
    }
}

/**
 * Check if cache is still fresh for a given match status
 */
export function isCacheFresh(lastUpdate: string, status: 'live' | 'scheduled' | 'finished'): boolean {
    const updateTime = new Date(lastUpdate).getTime();
    const now = Date.now();
    const age = now - updateTime;

    const maxAge = CACHE_DURATIONS[status];
    return age < maxAge;
}

/**
 * Determine if we should fetch from API based on cache freshness and live match presence
 */
export function shouldFetchFromApi(matches: Match[], lastUpdate: string): boolean {
    // If no matches in cache, fetch from API
    if (!matches || matches.length === 0) {
        return true;
    }

    // Check if there are any live matches
    const hasLiveMatches = matches.some((m) => m.status === 'live');

    if (hasLiveMatches) {
        // For live matches, refresh if cache is older than 30 seconds
        return !isCacheFresh(lastUpdate, 'live');
    }

    // For non-live matches, check the oldest match's cache freshness
    const oldestStatus = matches.reduce((oldest, match) => {
        if (match.status === 'live') return 'live';
        if (match.status === 'scheduled' && oldest !== 'live') return 'scheduled';
        return oldest;
    }, 'finished' as 'live' | 'scheduled' | 'finished');

    return !isCacheFresh(lastUpdate, oldestStatus);
}

/**
 * Store standings in Supabase cache
 */
export async function storeStandingsInCache(standings: Standing[]): Promise<void> {
    if (!standings || standings.length === 0) return;

    try {
        const sport = standings[0].sport;
        const league = standings[0].league;

        // Delete old standings for this league
        await supabase
            .from('standings')
            .delete()
            .eq('sport', sport)
            .eq('league', league);

        // Insert new standings
        const { error } = await supabase.from('standings').insert(standings);

        if (error) {
            console.error('Error storing standings in cache:', error);
        } else {
            console.log(`Cached ${standings.length} ${league} standings in Supabase`);
        }
    } catch (error) {
        console.error('Failed to cache standings:', error);
    }
}

/**
 * Fetch standings from Supabase cache
 */
export async function fetchStandingsFromCache(
    sport: string,
    league?: string
): Promise<Standing[] | null> {
    try {
        let query = supabase
            .from('standings')
            .select('*')
            .eq('sport', sport)
            .order('position', { ascending: true });

        if (league) {
            query = query.eq('league', league);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching standings from cache:', error);
            return null;
        }

        return data || null;
    } catch (error) {
        console.error('Failed to fetch standings from cache:', error);
        return null;
    }
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
    try {
        const { count: matchCount } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true });

        const { count: standingsCount } = await supabase
            .from('standings')
            .select('*', { count: 'exact', head: true });

        return {
            totalMatches: matchCount || 0,
            totalStandings: standingsCount || 0,
        };
    } catch (error) {
        console.error('Failed to get cache stats:', error);
        return {
            totalMatches: 0,
            totalStandings: 0,
        };
    }
}
