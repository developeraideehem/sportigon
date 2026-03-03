import type { MatchStatus } from '@/lib/supabase';

interface LiveBadgeProps {
    minute?: number;
    status: MatchStatus;
    size?: 'sm' | 'md';
}

export default function LiveBadge({ minute, status, size = 'sm' }: LiveBadgeProps) {
    const label = status === 'halftime' ? 'HT' : minute ? `${minute}'` : 'LIVE';

    return (
        <div
            className="flex items-center gap-1.5 rounded-full font-semibold"
            style={{
                padding: size === 'md' ? '4px 12px' : '2px 8px',
                fontSize: size === 'md' ? '0.8rem' : '0.7rem',
                background: 'var(--live-red-dim)',
                color: 'var(--live-red)',
                border: '1px solid rgba(252,68,68,0.35)',
                boxShadow: '0 0 10px rgba(252,68,68,0.2)',
            }}
            aria-label={`Match is live${minute ? `, minute ${minute}` : ''}`}
        >
            <span
                className="live-dot w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: 'var(--live-red)' }}
            />
            {label}
        </div>
    );
}
