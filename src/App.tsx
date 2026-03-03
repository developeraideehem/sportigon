import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppShell from '@/layouts/AppShell';
import LiveScores from '@/pages/LiveScores';
import Standings from '@/pages/Standings';
import MatchDetail from '@/pages/MatchDetail';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
      <AppShell>
        <Routes>
          <Route path="/" element={<LiveScores />} />
          <Route path="/fixtures" element={<LiveScores />} />
          <Route path="/results" element={<LiveScores />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/match/:id" element={<MatchDetail />} />
        </Routes>
      </AppShell>
    </Router>
  );
}

export default App;
