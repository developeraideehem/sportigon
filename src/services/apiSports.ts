import { Match, Standing } from '@/lib/supabase';

// API Configuration
const API_CONFIG = {
    football: {
        baseUrl: import.meta.env.VITE_API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io',
        key: import.meta.env.VITE_API_FOOTBALL_KEY || '',
    },
    basketball: {
        baseUrl: import.meta.env.VITE_API_BASKETBALL_BASE_URL || 'https://v1.basketball.api-sports.io',
        key: import.meta.env.VITE_API_FOOTBALL_KEY || '',
    },
    baseball: {
        baseUrl: import.meta.env.VITE_API_BASEBALL_BASE_URL || 'https://v1.baseball.api-sports.io',
        key: import.meta.env.VITE_API_FOOTBALL_KEY || '',
    },
    // Tennis, Cricket, and Hockey use the same key but different endpoints
    tennis: {
        baseUrl: 'https://v1.tennis.api-sports.io',
        key: import.meta.env.VITE_API_FOOTBALL_KEY || '',
    },
    cricket: {
        baseUrl: 'https://v1.cricket.api-sports.io',
        key: import.meta.env.VITE_API_FOOTBALL_KEY || '',
    },
    hockey: {
        baseUrl: 'https://v1.hockey.api-sports.io',
        key: import.meta.env.VITE_API_FOOTBALL_KEY || '',
    },
};

// Track API usage to stay within rate limits
let apiCallCount = 0;
const MAX_DAILY_CALLS = 100; // Free tier limit

// Sport name mapping
const SPORT_MAP: Record<string, keyof typeof API_CONFIG> = {
    'Football': 'football',
    'Basketball': 'basketball',
    'Tennis': 'tennis',
    'Cricket': 'cricket',
    'Baseball': 'baseball',
    'Hockey': 'hockey',
};

/**
 * Check if we can make an API call without exceeding rate limits
 */
function canMakeApiCall(): boolean {
    return apiCallCount < MAX_DAILY_CALLS;
}

/**
 * Increment API call counter
 */
function trackApiCall() {
    apiCallCount++;
    console.log(`API Calls today: ${apiCallCount}/${MAX_DAILY_CALLS}`);
}

/**
 * Get API usage statistics
 */
export function getApiUsage() {
    return {
        callsToday: apiCallCount,
        maxCalls: MAX_DAILY_CALLS,
        remaining: MAX_DAILY_CALLS - apiCallCount,
        percentage: (apiCallCount / MAX_DAILY_CALLS) * 100,
    };
}

/**
 * Make a request to API-Sports endpoint
 */
async function apiRequest(sport: string, endpoint: string): Promise<any> {
    const sportKey = SPORT_MAP[sport];
    if (!sportKey) {
        console.warn(`Sport "${sport}" not supported by API`);
        return null;
    }

    const config = API_CONFIG[sportKey];
    if (!config.key) {
        console.warn(`API key not configured for ${sport}`);
        return null;
    }

    if (!canMakeApiCall()) {
        console.warn('API rate limit reached for today. Using cached data.');
        return null;
    }

    const url = `${config.baseUrl}${endpoint}`;

    try {
        trackApiCall();

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': config.key,
                'x-rapidapi-host': config.baseUrl.replace('https://', ''),
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // API-Sports wraps responses in a "response" field
        return data.response || [];
    } catch (error) {
        console.error(`Error fetching ${sport} data from API:`, error);
        return null;
    }
}

/**
 * Transform API-Sports match data to our Match interface
 */
function transformApiMatch(apiMatch: any, sport: string): Match {
    // Different sports have slightly different response structures
    const isFootball = sport === 'Football';
    const isBasketball = sport === 'Basketball';
    const isBaseball = sport === 'Baseball';

    let homeScore = 0;
    let awayScore = 0;
    let status: 'live' | 'scheduled' | 'finished' = 'scheduled';
    let minute: number | null = null;

    if (isFootball) {
        homeScore = apiMatch.goals?.home ?? 0;
        awayScore = apiMatch.goals?.away ?? 0;
        status = getFootballStatus(apiMatch.fixture?.status?.short);
        minute = apiMatch.fixture?.status?.elapsed;
    } else if (isBasketball) {
        homeScore = apiMatch.scores?.home?.total ?? 0;
        awayScore = apiMatch.scores?.away?.total ?? 0;
        status = getBasketballStatus(apiMatch.status?.short);
    } else if (isBaseball) {
        homeScore = apiMatch.scores?.home?.total ?? 0;
        awayScore = apiMatch.scores?.away?.total ?? 0;
        status = getBaseballStatus(apiMatch.status?.short);
    }

    return {
        id: String(apiMatch.fixture?.id || apiMatch.id || Math.random()),
        home_team: apiMatch.teams?.home?.name || apiMatch.home?.name || 'Unknown',
        away_team: apiMatch.teams?.away?.name || apiMatch.away?.name || 'Unknown',
        home_score: homeScore,
        away_score: awayScore,
        status,
        sport,
        league: apiMatch.league?.name || apiMatch.tournament?.name || 'Unknown League',
        match_time: apiMatch.fixture?.date || apiMatch.date || new Date().toISOString(),
        minute: minute ?? undefined,
        stadium: apiMatch.fixture?.venue?.name || apiMatch.venue?.name || null,
    };
}

/**
 * Map Football API status codes to our status
 */
function getFootballStatus(apiStatus: string): 'live' | 'scheduled' | 'finished' {
    const liveStatuses = ['1H', '2H', 'ET', 'HT', 'LIVE', 'P', 'INT', 'BT'];
    const finishedStatuses = ['FT', 'AET', 'PEN', 'AWD', 'WO', 'ABD', 'CANC', 'SUSP'];

    if (liveStatuses.includes(apiStatus)) return 'live';
    if (finishedStatuses.includes(apiStatus)) return 'finished';
    return 'scheduled';
}

/**
 * Map Basketball API status codes to our status
 */
function getBasketballStatus(apiStatus: string): 'live' | 'scheduled' | 'finished' {
    const liveStatuses = ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'HT', 'LIVE'];
    const finishedStatuses = ['FT', 'AOT', 'CANC'];

    if (liveStatuses.includes(apiStatus)) return 'live';
    if (finishedStatuses.includes(apiStatus)) return 'finished';
    return 'scheduled';
}

/**
 * Map Baseball API status codes to our status
 */
function getBaseballStatus(apiStatus: string): 'live' | 'scheduled' | 'finished' {
    const liveStatuses = ['LIVE', 'IN1', 'IN2', 'IN3', 'IN4', 'IN5', 'IN6', 'IN7', 'IN8', 'IN9'];
    const finishedStatuses = ['FT', 'CANC', 'SUSP', 'POST'];

    if (liveStatuses.includes(apiStatus)) return 'live';
    if (finishedStatuses.includes(apiStatus)) return 'finished';
    return 'scheduled';
}

/**
 * Fetch live matches for a specific sport
 */
export async function fetchLiveMatches(sport: string): Promise<Match[] | null> {
    console.log(`Fetching live matches for ${sport} from API-Sports...`);

    const apiData = await apiRequest(sport, '/fixtures/live');

    if (!apiData || !Array.isArray(apiData)) {
        return null;
    }

    const matches = apiData.map((match) => transformApiMatch(match, sport));
    console.log(`Fetched ${matches.length} live ${sport} matches from API`);

    return matches;
}

/**
 * Fetch matches for a specific date
 */
export async function fetchMatchesByDate(sport: string, date: string): Promise<Match[] | null> {
    console.log(`Fetching ${sport} matches for ${date} from API-Sports...`);

    const apiData = await apiRequest(sport, `/fixtures?date=${date}`);

    if (!apiData || !Array.isArray(apiData)) {
        return null;
    }

    const matches = apiData.map((match) => transformApiMatch(match, sport));
    console.log(`Fetched ${matches.length} ${sport} matches for ${date} from API`);

    return matches;
}

/**
 * Fetch today's matches (live + scheduled + finished)
 */
export async function fetchTodayMatches(sport: string): Promise<Match[] | null> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return fetchMatchesByDate(sport, today);
}

/**
 * Fetch standings for a specific league
 * Note: This requires league ID which varies by API
 */
export async function fetchStandings(sport: string, leagueId: number, season: number): Promise<Standing[] | null> {
    console.log(`Fetching ${sport} standings for league ${leagueId}, season ${season}...`);

    const apiData = await apiRequest(sport, `/standings?league=${leagueId}&season=${season}`);

    if (!apiData || !Array.isArray(apiData)) {
        return null;
    }

    // Transform API standings to our format
    // Note: Structure varies by sport, this is a simplified version
    const standings = apiData.flatMap((leagueData: any) => {
        const standingsList = leagueData.league?.standings?.[0] || [];
        return standingsList.map((team: any, index: number) => ({
            id: String(team.team?.id || index),
            team_name: team.team?.name || 'Unknown',
            league: leagueData.league?.name || 'Unknown League',
            position: team.rank || index + 1,
            played: team.all?.played || 0,
            won: team.all?.win || 0,
            drawn: team.all?.draw || 0,
            lost: team.all?.lose || 0,
            goals_for: team.all?.goals?.for || 0,
            goals_against: team.all?.goals?.against || 0,
            goal_difference: (team.all?.goals?.for || 0) - (team.all?.goals?.against || 0),
            points: team.points || 0,
            sport,
            created_at: new Date().toISOString(),
        }));
    });

    console.log(`Fetched ${standings.length} standings entries`);
    return standings;
}

/**
 * Test API connection
 */
export async function testApiConnection(sport: string = 'Football'): Promise<boolean> {
    console.log(`Testing API connection for ${sport}...`);

    const sportKey = SPORT_MAP[sport];
    if (!sportKey) return false;

    const config = API_CONFIG[sportKey];
    if (!config.key) {
        console.error('API key not configured');
        return false;
    }

    try {
        const url = `${config.baseUrl}/status`;
        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': config.key,
                'x-rapidapi-host': config.baseUrl.replace('https://', ''),
            },
        });

        if (response.ok) {
            console.log('✅ API connection successful');
            return true;
        } else {
            console.error('❌ API connection failed:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ API connection error:', error);
        return false;
    }
}
