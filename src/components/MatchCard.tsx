import { Match } from '@/lib/supabase';
import { Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === 'live' || match.status === 'halftime';
  const isFinished = match.status === 'finished';

  const getStatusDisplay = () => {
    if (match.status === 'live') return `${match.minute}'`;
    if (match.status === 'halftime') return 'HT';
    if (match.status === 'finished') return 'FT';
    return format(new Date(match.match_time), 'HH:mm');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 flex-1">
              <span className="font-semibold text-gray-900">{match.home_team}</span>
            </div>
            {(isLive || isFinished) && (
              <span className="text-2xl font-bold text-gray-900 ml-4">
                {match.home_score}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <span className="font-semibold text-gray-900">{match.away_team}</span>
            </div>
            {(isLive || isFinished) && (
              <span className="text-2xl font-bold text-gray-900 ml-4">
                {match.away_score}
              </span>
            )}
          </div>
        </div>

        <div className="ml-6 flex flex-col items-center justify-center min-w-[60px]">
          {isLive && (
            <div className="flex items-center space-x-1 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-500">LIVE</span>
            </div>
          )}
          <span className={`text-sm font-semibold ${
            isLive ? 'text-red-500' : isFinished ? 'text-gray-500' : 'text-gray-700'
          }`}>
            {getStatusDisplay()}
          </span>
          {match.stadium && (
            <div className="flex items-center space-x-1 mt-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{match.stadium}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <span className="font-medium">{match.league}</span>
        {!isLive && !isFinished && (
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{format(new Date(match.match_time), 'MMM dd, HH:mm')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
