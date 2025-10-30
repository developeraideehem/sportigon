import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import SportsTabs from '@/components/SportsTabs';
import LiveScores from '@/pages/LiveScores';
import Standings from '@/pages/Standings';
import { useMatchStore } from '@/store/matchStore';

function App() {
  const { selectedSport, setSelectedSport } = useMatchStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Header />
        <SportsTabs selectedSport={selectedSport} onSelectSport={setSelectedSport} />

        <Routes>
          <Route path="/" element={<LiveScores />} />
          <Route path="/fixtures" element={<LiveScores />} />
          <Route path="/results" element={<LiveScores />} />
          <Route path="/standings" element={<Standings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
