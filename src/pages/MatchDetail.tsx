import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Match } from '@/lib/supabase';
import { useMatchStore } from '@/store/matchStore';
import LiveBadge from '@/components/LiveBadge';
import ScoreDisplay from '@/components/ScoreDisplay';
import { ArrowLeft, MapPin, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

function FormPips({ form }: { form: string }) {
    return (
        <div className="flex gap-1">
            {form.split('').map((r, i) => (
                <span
                    key={i}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                        background: r === 'W' ? 'var(--success)' : r === 'L' ? 'var(--live-red)' : 'var(--text-muted)',
                    }}
                >
                    {r}
                </span>
            ))}
        </div>
    );
}

function teamColor(name: string): string {
    const colors = ['#ff6b2b', '#f7b731', '#48bb78', '#63b3ed', '#9f7aea', '#fc4444', '#38b2ac'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
    return colors[Math.abs(h) % colors.length];
}

function teamInitials(name: string) {
    const words = name.trim().split(/\s+/);
    return words.length >= 2
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
}

export default function MatchDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { matches } = useMatchStore();
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try local store first
        const local = matches.find(m => m.id === id);
        if (local) { setMatch(local); setLoading(false); return; }

        // Otherwise fetch from Supabase
        const fetch = async () => {
            try {
                const { data } = await supabase.from('matches').select('*').eq('id', id).single();
                setMatch(data ?? null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id, matches]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-ember)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!match) {
        return (
            <div className="flex flex-col items-center justify-center py-24 fade-up">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Match not found</h3>
                <button onClick={() => navigate(-1)} className="btn-ghost mt-4">← Go back</button>
            </div>
        );
    }

    const isLive = match.status === 'live' || match.status === 'halftime';
    const isScheduled = match.status === 'scheduled';
    const homeColor = teamColor(match.home_team);
    const awayColor = teamColor(match.away_team);

    // Mock H2H and form data when not in DB
    const homeForm = 'WWDLW';
    const awayForm = 'WLDWL';

    return (
        <div className="max-w-3xl mx-auto fade-up">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-6 text-sm transition-colors hover:text-white"
                style={{ color: 'var(--text-secondary)' }}
            >
                <ArrowLeft size={16} />
                Back to matches
            </button>

            {/* Hero Card */}
            <div
                className="rounded-2xl p-8 mb-6 relative overflow-hidden"
                style={{
                    background: isLive
                        ? 'linear-gradient(135deg, #1a0a0a 0%, #2a1010 50%, #1a0a1a 100%)'
                        : 'var(--bg-card)',
                    border: isLive ? '1px solid rgba(252,68,68,0.25)' : '1px solid var(--border)',
                    boxShadow: isLive ? 'var(--shadow-live)' : 'var(--shadow-card)',
                }}
            >
                {/* Top glow when live */}
                {isLive && (
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--live-red), transparent)' }} />
                )}

                {/* League + status */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{match.league}</span>
                    {isLive && <LiveBadge minute={match.minute} status={match.status} size="md" />}
                </div>

                {/* Teams + Score */}
                <div className="flex items-center justify-between gap-4">
                    {/* Home */}
                    <div className="flex flex-col items-center gap-3 flex-1">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white" style={{ background: homeColor }}>
                            {teamInitials(match.home_team)}
                        </div>
                        <span className="font-bold text-center leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {match.home_team}
                        </span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        {isScheduled ? (
                            <>
                                <span className="text-3xl font-bold" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>vs</span>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {format(new Date(match.match_time), 'HH:mm')}
                                </span>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <ScoreDisplay score={match.home_score} isLive={isLive} />
                                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '2rem' }}>–</span>
                                <ScoreDisplay score={match.away_score} isLive={isLive} />
                            </div>
                        )}
                    </div>

                    {/* Away */}
                    <div className="flex flex-col items-center gap-3 flex-1">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white" style={{ background: awayColor }}>
                            {teamInitials(match.away_team)}
                        </div>
                        <span className="font-bold text-center leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {match.away_team}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                    { icon: Calendar, label: 'Date', value: format(new Date(match.match_time), 'EEE, MMM d yyyy') },
                    { icon: Clock, label: 'Kick-off', value: format(new Date(match.match_time), 'HH:mm') },
                    { icon: MapPin, label: 'Venue', value: match.stadium ?? 'TBC' },
                ].map(({ icon: Icon, label, value }) => (
                    <div
                        key={label}
                        className="rounded-xl p-4"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Icon size={14} style={{ color: 'var(--accent-ember)' }} />
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
                        </div>
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                ))}
            </div>

            {/* Form */}
            <div
                className="rounded-xl p-5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
                <h3 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Recent Form (last 5)
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{match.home_team}</span>
                        <FormPips form={homeForm} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{match.away_team}</span>
                        <FormPips form={awayForm} />
                    </div>
                </div>
            </div>
        </div>
    );
}
