import type { Standing } from '@/lib/supabase';

interface StandingsTableProps {
    standings: Standing[];
    highlightTeam?: string;
}

function teamColor(name: string): string {
    const colors = ['#ff6b2b', '#f7b731', '#48bb78', '#63b3ed', '#9f7aea', '#fc4444', '#38b2ac'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
    return colors[Math.abs(h) % colors.length];
}

function FormPip({ result }: { result: string }) {
    const color = result === 'W' ? 'var(--success)' : result === 'L' ? 'var(--live-red)' : 'var(--text-muted)';
    return (
        <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
            style={{ background: color, color: 'white', fontSize: '0.6rem' }}
        >
            {result}
        </span>
    );
}

export default function StandingsTable({ standings, highlightTeam }: StandingsTableProps) {
    const total = standings.length;

    return (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                        {['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts'].map(h => (
                            <th
                                key={h}
                                className={`px-3 py-3 font-semibold text-xs uppercase tracking-wider ${h === 'Team' ? 'text-left' : 'text-center'}`}
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {h}
                            </th>
                        ))}
                        <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-center" style={{ color: 'var(--text-muted)' }}>
                            Form
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((s, idx) => {
                        const isChampions = s.position <= 4;
                        const isEuropa = s.position === 5 || s.position === 6;
                        const isRelegation = s.position > total - 3;
                        const isHighlighted = highlightTeam === s.team_name;

                        const rowStyle: React.CSSProperties = {
                            borderBottom: '1px solid var(--border)',
                            background: isHighlighted
                                ? 'rgba(247,183,49,0.07)'
                                : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                            transition: 'background 0.15s',
                        };

                        const posColor = isChampions
                            ? 'var(--success)'
                            : isEuropa
                                ? 'var(--info)'
                                : isRelegation
                                    ? 'var(--live-red)'
                                    : 'var(--text-muted)';

                        return (
                            <tr key={s.id} style={rowStyle} className="hover:bg-white/5 transition-colors">
                                {/* Pos with color bar */}
                                <td className="px-3 py-3 text-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-0.5 h-5 rounded-full shrink-0" style={{ background: posColor }} />
                                        <span className="font-semibold w-4 text-center" style={{ color: posColor }}>
                                            {s.position}
                                        </span>
                                    </div>
                                </td>

                                {/* Team */}
                                <td className="px-3 py-3">
                                    <div className="flex items-center gap-2">
                                        {s.team_logo ? (
                                            <img src={s.team_logo} alt={s.team_name} className="w-6 h-6 rounded-full object-contain" />
                                        ) : (
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                                                style={{ background: teamColor(s.team_name), fontSize: '0.55rem' }}
                                            >
                                                {s.team_name.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                                            {s.team_name}
                                        </span>
                                        {isHighlighted && (
                                            <span className="pill pill-amber text-xs" style={{ fontSize: '0.55rem', padding: '1px 6px' }}>
                                                ★
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Stats */}
                                {[s.played, s.won, s.drawn, s.lost].map((val, i) => (
                                    <td key={i} className="px-3 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                                        {val}
                                    </td>
                                ))}

                                <td
                                    className="px-3 py-3 text-center font-semibold"
                                    style={{ color: s.goal_difference > 0 ? 'var(--success)' : s.goal_difference < 0 ? 'var(--live-red)' : 'var(--text-secondary)' }}
                                >
                                    {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                                </td>

                                <td
                                    className="px-3 py-3 text-center font-bold"
                                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                                >
                                    {s.points}
                                </td>

                                {/* Form */}
                                <td className="px-3 py-3">
                                    <div className="flex items-center gap-0.5 justify-center">
                                        {(s.form || '-----').split('').map((r, i) => (
                                            <FormPip key={i} result={r} />
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
