import { useEffect, useState } from 'react';
import { supabase, Standing } from '@/lib/supabase';
import { Trophy } from 'lucide-react';

export default function Standings() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      const { data, error } = await supabase
        .from('standings')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setStandings(data);
      } else {
        setStandings(getMockStandings());
      }
    } catch (error) {
      setStandings(getMockStandings());
    } finally {
      setLoading(false);
    }
  };

  const getMockStandings = (): Standing[] => {
    const teams = [
      'Manchester City', 'Liverpool', 'Arsenal', 'Tottenham',
      'Manchester United', 'Chelsea', 'Newcastle', 'Brighton',
      'West Ham', 'Aston Villa'
    ];

    return teams.map((team, idx) => {
      const played = 15;
      const won = 15 - idx - Math.floor(Math.random() * 3);
      const drawn = Math.floor(Math.random() * 4);
      const lost = played - won - drawn;
      const goalsFor = 30 - idx * 2 + Math.floor(Math.random() * 5);
      const goalsAgainst = 10 + idx * 2 + Math.floor(Math.random() * 5);

      return {
        id: `${idx + 1}`,
        team,
        played,
        won,
        drawn,
        lost,
        goals_for: goalsFor,
        goals_against: goalsAgainst,
        goal_difference: goalsFor - goalsAgainst,
        points: won * 3 + drawn,
        position: idx + 1
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center space-x-3">
          <Trophy className="w-8 h-8 text-livescore-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Standings</h1>
            <p className="text-gray-600">Premier League 2024/25</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-livescore-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      P
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      W
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      D
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      L
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      GF
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      GA
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      GD
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {standings.map((standing) => (
                    <tr
                      key={standing.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        standing.position <= 4
                          ? 'bg-blue-50'
                          : standing.position <= 6
                          ? 'bg-green-50'
                          : standing.position >= standings.length - 2
                          ? 'bg-red-50'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900">{standing.position}</span>
                          {standing.position <= 4 && (
                            <div className="w-1 h-8 bg-blue-600 ml-2"></div>
                          )}
                          {standing.position === 5 || standing.position === 6 && (
                            <div className="w-1 h-8 bg-green-600 ml-2"></div>
                          )}
                          {standing.position >= standings.length - 2 && (
                            <div className="w-1 h-8 bg-red-600 ml-2"></div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{standing.team}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {standing.played}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {standing.won}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {standing.drawn}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {standing.lost}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {standing.goals_for}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {standing.goals_against}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                        {standing.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600"></div>
                  <span className="text-gray-600">Champions League</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600"></div>
                  <span className="text-gray-600">Europa League</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600"></div>
                  <span className="text-gray-600">Relegation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
