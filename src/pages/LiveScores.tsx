import { useMatchStore } from '@/store/matchStore';
import { useMatches } from '@/hooks/useMatches';
import MatchCard from '@/components/MatchCard';
import LeagueChips from '@/components/LeagueChips';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { RefreshCw, Wifi, WifiOff, Database } from 'lucide-react';

function SectionHeader({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 rounded-full" style={{ background: color }} />
      <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{label}</h2>
      <span
        className="px-2.5 py-0.5 rounded-full text-xs font-bold"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {count}
      </span>
    </div>
  );
}

function DataSourceBadge({ source, lastUpdate }: { source: string; lastUpdate: Date }) {
  const cfg = {
    api: { icon: Wifi, label: 'Live API', color: 'var(--success)' },
    supabase: { icon: Database, label: 'Supabase', color: 'var(--info)' },
    mock: { icon: WifiOff, label: 'Demo Data', color: 'var(--text-muted)' },
  }[source] ?? { icon: WifiOff, label: 'Demo', color: 'var(--text-muted)' };

  const Icon = cfg.icon;
  const mins = Math.floor((Date.now() - lastUpdate.getTime()) / 60_000);

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        background: `${cfg.color}18`,
        color: cfg.color,
        border: `1px solid ${cfg.color}30`,
      }}
    >
      <Icon size={11} />
      <span>{cfg.label}</span>
      {mins > 0 && <span style={{ color: 'var(--text-muted)' }}>• {mins}m ago</span>}
    </div>
  );
}

export default function LiveScores() {
  const { selectedSport } = useMatchStore();
  const {
    loading, error, dataSource, lastUpdate, leagues,
    liveMatches, finishedMatches, scheduledMatches, matches,
    selectedLeague, setSelectedLeague, refetch,
  } = useMatches();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Live Scores
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {selectedSport} · Real-time scores and results
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DataSourceBadge source={dataSource} lastUpdate={lastUpdate} />
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* League filter chips */}
      <div className="mb-6">
        <LeagueChips
          leagues={leagues}
          selected={selectedLeague}
          onSelect={setSelectedLeague}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm"
          style={{
            background: 'rgba(247,183,49,0.08)',
            border: '1px solid rgba(247,183,49,0.2)',
            color: 'var(--accent-amber)',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-8">
          <LoadingSkeleton count={3} />
          <LoadingSkeleton count={3} />
        </div>
      ) : (
        <div className="space-y-10">

          {/* Live Now */}
          {liveMatches.length > 0 && (
            <section className="fade-up">
              <SectionHeader label="Live Now" count={liveMatches.length} color="var(--live-red)" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {liveMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {scheduledMatches.length > 0 && (
            <section className="fade-up" style={{ animationDelay: '0.05s' }}>
              <SectionHeader label="Upcoming" count={scheduledMatches.length} color="var(--accent-ember)" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scheduledMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          {/* Finished */}
          {finishedMatches.length > 0 && (
            <section className="fade-up" style={{ animationDelay: '0.1s' }}>
              <SectionHeader label="Finished" count={finishedMatches.length} color="var(--text-muted)" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {finishedMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {matches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 fade-up">
              <div className="text-6xl mb-4">🏟️</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                No matches today
              </h3>
              <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                No {selectedSport.toLowerCase()} matches are scheduled for this date. Try a different day.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
