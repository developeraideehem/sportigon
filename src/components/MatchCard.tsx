import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Match } from '@/lib/supabase';
import LiveBadge from './LiveBadge';
import ScoreDisplay from './ScoreDisplay';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

/** Returns 1-2 letter initials from a team name */
function teamInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Hash a string to one of several colors for the avatar placeholder */
function teamColor(name: string): string {
  const colors = ['#ff6b2b', '#f7b731', '#48bb78', '#63b3ed', '#9f7aea', '#fc4444', '#38b2ac'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

function TeamAvatar({ name, logo }: { name: string; logo?: string }) {
  const [imgErr, setImgErr] = useState(false);
  const color = teamColor(name);

  if (logo && !imgErr) {
    return (
      <img
        src={logo}
        alt={name}
        onError={() => setImgErr(true)}
        className="w-9 h-9 rounded-full object-contain"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      />
    );
  }

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
      style={{ background: color }}
    >
      {teamInitials(name)}
    </div>
  );
}

export default function MatchCard({ match, compact = false }: MatchCardProps) {
  const navigate = useNavigate();
  const isLive = match.status === 'live' || match.status === 'halftime';
  const isFinished = match.status === 'finished';
  const isScheduled = match.status === 'scheduled';
  const prevScoreRef = useRef({ h: match.home_score, a: match.away_score });
  const [popHome, setPopHome] = useState(false);
  const [popAway, setPopAway] = useState(false);

  // Animate score pop on change
  useEffect(() => {
    if (match.home_score !== prevScoreRef.current.h) {
      setPopHome(true);
      setTimeout(() => setPopHome(false), 400);
    }
    if (match.away_score !== prevScoreRef.current.a) {
      setPopAway(true);
      setTimeout(() => setPopAway(false), 400);
    }
    prevScoreRef.current = { h: match.home_score, a: match.away_score };
  }, [match.home_score, match.away_score]);

  const cardStyle: React.CSSProperties = {
    background: isLive
      ? 'linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(30,15,15,0.95) 100%)'
      : 'rgba(26,26,46,0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: isLive ? '1px solid rgba(252,68,68,0.25)' : '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: isLive ? 'var(--shadow-live), var(--shadow-card)' : 'var(--shadow-card)',
    cursor: 'pointer',
    transition: 'all 0.2s var(--ease-smooth)',
    padding: compact ? '12px 14px' : '16px 18px',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <article
      style={cardStyle}
      className="group hover:-translate-y-1"
      onClick={() => navigate(`/match/${match.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/match/${match.id}`)}
      aria-label={`${match.home_team} vs ${match.away_team}`}
    >
      {/* Live glow stripe at top */}
      {isLive && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, var(--live-red), transparent)' }}
        />
      )}

      {/* League row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium truncate max-w-[160px]" style={{ color: 'var(--text-muted)' }}>
          {match.league}
        </span>
        {isLive && <LiveBadge minute={match.minute} status={match.status} />}
        {isFinished && (
          <span className="pill pill-neutral text-xs">FT</span>
        )}
        {isScheduled && (
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {format(new Date(match.match_time), 'HH:mm')}
          </span>
        )}
      </div>

      {/* Teams + Score */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamAvatar name={match.home_team} logo={match.home_logo} />
          <span className="text-xs font-semibold text-center leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {match.home_team}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {isScheduled ? (
            <span className="text-2xl font-bold" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>vs</span>
          ) : (
            <div className="flex items-center gap-2">
              <ScoreDisplay
                score={match.home_score}
                isLive={isLive}
                pop={popHome}
              />
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '1.25rem' }}>–</span>
              <ScoreDisplay
                score={match.away_score}
                isLive={isLive}
                pop={popAway}
              />
            </div>
          )}
          {isLive && match.status === 'halftime' && (
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-amber)' }}>HT</span>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamAvatar name={match.away_team} logo={match.away_logo} />
          <span className="text-xs font-semibold text-center leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {match.away_team}
          </span>
        </div>
      </div>

      {/* Hover shine */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(255,107,43,0.03) 0%, transparent 60%)',
          borderRadius: 'var(--radius-lg)',
        }}
      />
    </article>
  );
}
