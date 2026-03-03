import { useStandings } from '@/hooks/useStandings';
import StandingsTable from '@/components/StandingsTable';
import { RowSkeleton } from '@/components/LoadingSkeleton';
import { useMatchStore } from '@/store/matchStore';

export default function Standings() {
  const { selectedSport } = useMatchStore();
  const { standings, loading, error, availableLeagues, selectedLeague, setSelectedLeague } = useStandings();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Standings
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {selectedSport} league tables
        </p>
      </div>

      {/* League Tabs */}
      <div
        className="flex items-center gap-1 mb-6 p-1 rounded-xl overflow-x-auto"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', width: 'fit-content' }}
      >
        {availableLeagues.map(league => (
          <button
            key={league}
            onClick={() => setSelectedLeague(league)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap"
            style={{
              background: selectedLeague === league ? 'var(--accent-ember)' : 'transparent',
              color: selectedLeague === league ? 'white' : 'var(--text-secondary)',
              boxShadow: selectedLeague === league ? 'var(--shadow-ember)' : 'none',
            }}
          >
            {league}
          </button>
        ))}
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm"
          style={{
            background: 'rgba(247,183,49,0.08)',
            border: '1px solid rgba(247,183,49,0.2)',
            color: 'var(--accent-amber)',
          }}
        >
          ⚠️ {error} — showing demo data
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        {[
          { color: 'var(--success)', label: 'Champions League' },
          { color: 'var(--info)', label: 'Europa League' },
          { color: 'var(--live-red)', label: 'Relegation' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      ) : (
        <div className="fade-up">
          <StandingsTable standings={standings} />
        </div>
      )}
    </div>
  );
}
