import { Link, useLocation } from 'react-router-dom';
import { useMatchStore } from '@/store/matchStore';
import type { SportType } from '@/lib/supabase';

const SPORTS: { id: SportType; label: string; emoji: string; path: string }[] = [
    { id: 'Football', label: 'Football', emoji: '⚽', path: '/' },
    { id: 'Basketball', label: 'Basketball', emoji: '🏀', path: '/' },
    { id: 'Tennis', label: 'Tennis', emoji: '🎾', path: '/' },
    { id: 'Baseball', label: 'Baseball', emoji: '⚾', path: '/' },
    { id: 'Hockey', label: 'Hockey', emoji: '🏒', path: '/' },
];

interface SidebarProps {
    expanded: boolean;
    onToggle: () => void;
}

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
    const location = useLocation();
    const { selectedSport, setSelectedSport } = useMatchStore();

    return (
        <>
            {/* Mobile overlay */}
            {expanded && (
                <div
                    className="fixed inset-0 z-20 md:hidden"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                className="fixed left-0 top-0 h-screen z-30 flex flex-col transition-all duration-300 overflow-hidden"
                style={{
                    width: expanded ? 'var(--sidebar-w)' : 'var(--sidebar-w-collapsed)',
                    background: 'var(--bg-sidebar)',
                    borderRight: '1px solid var(--border)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center h-16 px-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-xl"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-ember), #ff4500)',
                            boxShadow: 'var(--shadow-ember)',
                        }}
                    >
                        S
                    </div>
                    {expanded && (
                        <span
                            className="ml-3 font-bold text-lg whitespace-nowrap overflow-hidden"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Sportigon
                        </span>
                    )}
                    <button
                        onClick={onToggle}
                        className="ml-auto p-1 rounded-lg transition-colors"
                        style={{ marginLeft: expanded ? 'auto' : undefined }}
                        aria-label="Toggle sidebar"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x={expanded ? 2 : 1} y="3" width="12" height="1.5" rx=".75" fill="var(--text-secondary)" />
                            <rect x="2" y="7.25" width="12" height="1.5" rx=".75" fill="var(--text-secondary)" />
                            <rect x={expanded ? 2 : 3} y="11.5" width="12" height="1.5" rx=".75" fill="var(--text-secondary)" />
                        </svg>
                    </button>
                </div>

                {/* Navigation label */}
                {expanded && (
                    <p className="px-4 pt-6 pb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        Sports
                    </p>
                )}

                {/* Sport nav */}
                <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
                    {SPORTS.map(sport => {
                        const isActive = selectedSport === sport.id;
                        return (
                            <button
                                key={sport.id}
                                onClick={() => setSelectedSport(sport.id)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-left transition-all duration-200 group"
                                style={{
                                    background: isActive ? 'var(--accent-ember-dim)' : 'transparent',
                                    borderLeft: isActive ? '3px solid var(--accent-ember)' : '3px solid transparent',
                                    color: isActive ? 'var(--accent-ember)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 600 : 400,
                                }}
                                title={!expanded ? sport.label : undefined}
                            >
                                <span className="text-xl shrink-0 leading-none">{sport.emoji}</span>
                                {expanded && (
                                    <span className="text-sm whitespace-nowrap">{sport.label}</span>
                                )}
                                {expanded && isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-ember)' }} />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--border)' }}>
                    {/* Page nav */}
                    <nav className="flex flex-col gap-1 px-2 py-4">
                        {[
                            { label: 'Live Scores', path: '/', icon: '🔴' },
                            { label: 'Standings', path: '/standings', icon: '🏆' },
                        ].map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
                                    style={{
                                        background: isActive ? 'var(--accent-ember-dim)' : 'transparent',
                                        color: isActive ? 'var(--accent-ember)' : 'var(--text-secondary)',
                                        fontWeight: isActive ? 600 : 400,
                                        fontSize: '0.875rem',
                                    }}
                                    title={!expanded ? item.label : undefined}
                                >
                                    <span>{item.icon}</span>
                                    {expanded && <span className="whitespace-nowrap">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
}
