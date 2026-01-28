import { useEffect, useState } from 'react';
import { useMatchStore } from '@/store/matchStore';
import { supabase, Match } from '@/lib/supabase';
import MatchCard from '@/components/MatchCard';
import { Calendar, Filter, Wifi, WifiOff, Database } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { fetchTodayMatches, getApiUsage } from '@/services/apiSports';
import {
  storeMatchesInCache,
  fetchMatchesFromCache,
  shouldFetchFromApi,
} from '@/services/cacheService';

export default function LiveScores() {
  const { matches, selectedSport, selectedLeague, filterDate, setMatches, setSelectedLeague, setFilterDate } = useMatchStore();
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<'api' | 'cache' | 'mock'>('cache');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [apiUsage, setApiUsage] = useState({ callsToday: 0, maxCalls: 100, remaining: 100 });

  useEffect(() => {
    fetchMatches();

    // Set up real-time subscription for cache updates
    const subscription = supabase
      .channel('matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          const updatedMatch = payload.new as Match;
          setMatches(matches.map(m => m.id === updatedMatch.id ? updatedMatch : m));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedSport, filterDate]);

  // Auto-refresh live matches every 30 seconds
  useEffect(() => {
    const hasLiveMatches = matches.some(m => m.status === 'live');

    if (!hasLiveMatches) {
      return;
    }

    console.log('Setting up auto-refresh for live matches...');
    const interval = setInterval(() => {
      console.log('Auto-refreshing live matches...');
      fetchMatches();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [matches, selectedSport]);

  const fetchMatches = async () => {
    try {
      setLoading(true);

      // Update API usage stats
      setApiUsage(getApiUsage());

      // Step 1: Check cache first
      const cachedData = await fetchMatchesFromCache(selectedSport);

      // Step 2: Decide if we need to fetch from API
      const needsApiFetch = cachedData
        ? shouldFetchFromApi(cachedData.matches, cachedData.metadata.lastUpdate)
        : true;

      if (needsApiFetch) {
        console.log(`Fetching fresh ${selectedSport} data from API-Sports...`);

        // Try to fetch from API
        const apiMatches = await fetchTodayMatches(selectedSport);

        if (apiMatches && apiMatches.length > 0) {
          // Success! Store in cache and use API data
          await storeMatchesInCache(apiMatches);
          setMatches(apiMatches);
          setDataSource('api');
          setLastUpdate(new Date());

          const uniqueLeagues = [...new Set(apiMatches.map(m => m.league))];
          setLeagues(uniqueLeagues);

          console.log(`✅ Loaded ${apiMatches.length} matches from API`);
          setApiUsage(getApiUsage());
          return;
        } else {
          console.log('API returned no data, falling back to cache...');
        }
      }

      // Step 3: Use cache if available
      if (cachedData && cachedData.matches.length > 0) {
        setMatches(cachedData.matches);
        setDataSource('cache');
        setLastUpdate(new Date(cachedData.metadata.lastUpdate));

        const uniqueLeagues = [...new Set(cachedData.matches.map(m => m.league))];
        setLeagues(uniqueLeagues);

        console.log(`📦 Loaded ${cachedData.matches.length} matches from cache`);
        return;
      }

      // Step 4: Fallback to mock data
      console.log('No API or cache data available, using mock data...');
      const mockMatches = generateMockMatches(selectedSport);
      setMatches(mockMatches);
      setDataSource('mock');
      setLastUpdate(new Date());

      const uniqueLeagues = [...new Set(mockMatches.map(m => m.league))];
      setLeagues(uniqueLeagues);

    } catch (error) {
      console.error('Error fetching matches:', error);

      // Final fallback to mock data
      const mockMatches = generateMockMatches(selectedSport);
      setMatches(mockMatches);
      setDataSource('mock');
      setLastUpdate(new Date());

      const uniqueLeagues = [...new Set(mockMatches.map(m => m.league))];
      setLeagues(uniqueLeagues);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMatches = (sport: string): Match[] => {
    const now = new Date();
    const leagues = sport === 'Football'
      ? ['Premier League', 'La Liga', 'Serie A', 'Bundesliga']
      : sport === 'Basketball'
        ? ['NBA', 'EuroLeague']
        : ['ATP Tour', 'WTA Tour'];

    const teams = {
      'Premier League': [
        ['Manchester United', 'Liverpool'],
        ['Chelsea', 'Arsenal'],
        ['Manchester City', 'Tottenham'],
        ['Newcastle', 'Brighton']
      ],
      'La Liga': [
        ['Real Madrid', 'Barcelona'],
        ['Atletico Madrid', 'Sevilla'],
        ['Valencia', 'Villarreal']
      ],
      'NBA': [
        ['Lakers', 'Warriors'],
        ['Celtics', 'Heat'],
        ['Bucks', 'Nets']
      ],
      'ATP Tour': [
        ['Djokovic', 'Alcaraz'],
        ['Medvedev', 'Sinner']
      ]
    };

    const mockMatches: Match[] = [];
    let id = 1;

    leagues.forEach((league) => {
      const leagueTeams = teams[league as keyof typeof teams] || teams['Premier League'];

      leagueTeams.forEach(([home, away], idx) => {
        const isLive = idx === 0;
        const isFinished = idx === 1;
        const matchTime = isLive ? now : isFinished ? subDays(now, 0.1) : addDays(now, idx - 1);

        mockMatches.push({
          id: `${id++}`,
          home_team: home,
          away_team: away,
          home_score: isLive || isFinished ? Math.floor(Math.random() * 4) : 0,
          away_score: isLive || isFinished ? Math.floor(Math.random() * 4) : 0,
          status: isLive ? 'live' : isFinished ? 'finished' : 'scheduled',
          sport,
          league,
          match_time: matchTime.toISOString(),
          minute: isLive ? 45 + Math.floor(Math.random() * 45) : undefined,
          stadium: `${home} Stadium`
        });
      });
    });

    return mockMatches;
  };

  const filteredMatches = selectedLeague
    ? matches.filter(m => m.league === selectedLeague)
    : matches;

  const liveMatches = filteredMatches.filter(m => m.status === 'live' || m.status === 'halftime');
  const finishedMatches = filteredMatches.filter(m => m.status === 'finished');
  const scheduledMatches = filteredMatches.filter(m => m.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Scores</h1>
          <p className="text-gray-600">
            Real-time sports scores and updates
            {dataSource === 'api' && ' • Live from API-Football'}
            {dataSource === 'cache' && ` • Cached data (updated ${Math.floor((Date.now() - lastUpdate.getTime()) / 1000 / 60)}m ago)`}
            {dataSource === 'mock' && ' • Demo data'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <button
                onClick={() => setFilterDate(subDays(filterDate, 1))}
                className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                Previous
              </button>
              <span className="px-4 py-1 bg-livescore-primary text-white rounded font-medium text-sm">
                {format(filterDate, 'MMM dd, yyyy')}
              </span>
              <button
                onClick={() => setFilterDate(addDays(filterDate, 1))}
                className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                Next
              </button>
              <button
                onClick={() => setFilterDate(new Date())}
                className="px-3 py-1 text-sm font-medium text-livescore-primary hover:bg-green-50 rounded"
              >
                Today
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedLeague || ''}
                onChange={(e) => setSelectedLeague(e.target.value || null)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-livescore-primary"
              >
                <option value="">All Leagues</option>
                {leagues.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>

            {/* Data Source Indicator */}
            <div className="ml-auto flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${dataSource === 'api'
                  ? 'bg-green-100 text-green-700'
                  : dataSource === 'cache'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {dataSource === 'api' ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span>Live API</span>
                  </>
                ) : dataSource === 'cache' ? (
                  <>
                    <Database className="w-3 h-3" />
                    <span>Cached</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>Mock Data</span>
                  </>
                )}
              </div>

              {/* API Usage Tracker */}
              <div className="text-xs text-gray-500">
                API: {apiUsage.callsToday}/{apiUsage.maxCalls}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-livescore-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {liveMatches.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <h2 className="text-xl font-bold text-gray-900">Live Now</h2>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                    {liveMatches.length}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {liveMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {finishedMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Finished</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {finishedMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {scheduledMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {scheduledMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {filteredMatches.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No matches found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
