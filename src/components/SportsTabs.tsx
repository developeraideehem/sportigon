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
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto scrollbar-hide scrollbar-thin">
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap border-b-2 ${selectedSport === sport.id
                  ? 'text-livescore-primary border-livescore-primary bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
                }`}
            >
              <span className="text-xl">{sport.icon}</span>
              <span className="text-sm md:text-base">{sport.name}</span>
              {selectedSport === sport.id && (
                <span className="ml-1 px-1.5 py-0.5 bg-livescore-primary text-white text-xs rounded-full">
                  •
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
