interface SportsTabsProps {
  selectedSport: string;
  onSelectSport: (sport: string) => void;
}

const sports = [
  { id: 'Football', name: 'Football', icon: '⚽' },
  { id: 'Basketball', name: 'Basketball', icon: '🏀' },
  { id: 'Tennis', name: 'Tennis', icon: '🎾' },
  { id: 'Cricket', name: 'Cricket', icon: '🏏' },
  { id: 'Baseball', name: 'Baseball', icon: '⚾' },
  { id: 'Hockey', name: 'Hockey', icon: '🏒' },
];

export default function SportsTabs({ selectedSport, onSelectSport }: SportsTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto scrollbar-hide">
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                selectedSport === sport.id
                  ? 'text-livescore-primary border-b-2 border-livescore-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{sport.icon}</span>
              <span>{sport.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
