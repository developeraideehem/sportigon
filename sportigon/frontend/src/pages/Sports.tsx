import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, Calendar, Search } from 'lucide-react';
import { sportsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Sport {
  id: string;
  name: string;
  leagues: string[];
  icon?: string;
  color?: string;
  followers?: number;
  trending?: boolean;
}

const Sports: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Sports', icon: Trophy },
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'team', label: 'Team Sports', icon: Users },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  ];

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setLoading(true);
      const response = await sportsApi.getAll();
      if (response.success) {
        setSports(response.sports);
      }
    } catch (error: any) {
      toast.error('Failed to load sports');
      console.error('Sports fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSports = sports.filter((sport) => {
    const matchesSearch = sport.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sportsData = [
    {
      id: '1',
      name: 'Football',
      icon: '⚽',
      followers: 2500000,
      trending: true,
      leagues: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga'],
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: '2',
      name: 'Basketball',
      icon: '🏀',
      followers: 1800000,
      trending: true,
      leagues: ['NBA', 'EuroLeague', 'NCAA'],
      color: 'from-orange-500 to-red-600',
    },
    {
      id: '3',
      name: 'Tennis',
      icon: '🎾',
      followers: 1200000,
      trending: false,
      leagues: ['ATP Tour', 'WTA Tour', 'Grand Slam'],
      color: 'from-yellow-500 to-amber-600',
    },
    {
      id: '4',
      name: 'Baseball',
      icon: '⚾',
      followers: 950000,
      trending: false,
      leagues: ['MLB', 'NPB', 'KBO'],
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: '5',
      name: 'American Football',
      icon: '🏈',
      followers: 2100000,
      trending: true,
      leagues: ['NFL', 'NCAA Football'],
      color: 'from-red-500 to-rose-600',
    },
    {
      id: '6',
      name: 'Cricket',
      icon: '🏏',
      followers: 1600000,
      trending: false,
      leagues: ['IPL', 'Test Cricket', 'T20 World Cup'],
      color: 'from-teal-500 to-cyan-600',
    },
  ];

  const displaySports = filteredSports.length > 0 ? filteredSports : sportsData;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 mb-2"
        >
          Explore Sports
        </motion.h1>
        <p className="text-lg text-gray-600">
          Follow your favorite sports and stay updated with live scores
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search sports, teams, or leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              {category.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySports.map((sport, index) => (
            <motion.div
              key={sport.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className={`h-32 bg-gradient-to-br ${sport.color} p-6 relative overflow-hidden`}>
                <div className="absolute -right-6 -bottom-6 text-9xl opacity-20">
                  {sport.icon}
                </div>
                <div className="relative z-10">
                  {sport.trending && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{sport.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {sport.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {(sport.followers || 0).toLocaleString()} followers
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Popular Leagues:</h4>
                  <div className="flex flex-wrap gap-2">
                    {sport.leagues.slice(0, 3).map((league, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {league}
                      </span>
                    ))}
                    {sport.leagues.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                        +{sport.leagues.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  Follow
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {displaySports.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No sports found</h3>
          <p className="text-gray-600">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default Sports;
