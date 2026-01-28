import { Search, Menu, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-livescore-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-livescore-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold">Sportigon</span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="hover:text-livescore-primary transition-colors font-medium">
                Live Scores
              </Link>
              <Link to="/fixtures" className="hover:text-livescore-primary transition-colors font-medium">
                Fixtures
              </Link>
              <Link to="/results" className="hover:text-livescore-primary transition-colors font-medium">
                Results
              </Link>
              <Link to="/standings" className="hover:text-livescore-primary transition-colors font-medium">
                Standings
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-livescore-gray rounded-lg px-4 py-2">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search teams, leagues..."
                className="bg-transparent border-none outline-none text-sm w-64 text-white placeholder-gray-400"
              />
            </div>

            <button className="p-2 hover:bg-livescore-gray rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            <button className="p-2 hover:bg-livescore-gray rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </button>

            <button className="md:hidden p-2 hover:bg-livescore-gray rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
