interface LeagueChipsProps {
    leagues: string[];
    selected: string | null;
    onSelect: (league: string | null) => void;
}

export default function LeagueChips({ leagues, selected, onSelect }: LeagueChipsProps) {
    if (leagues.length === 0) return null;

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {/* "All" chip */}
            <LeagueChip label="All" active={selected === null} onClick={() => onSelect(null)} />
            {leagues.map(league => (
                <LeagueChip
                    key={league}
                    label={league}
                    active={selected === league}
                    onClick={() => onSelect(selected === league ? null : league)}
                />
            ))}
        </div>
    );
}

function LeagueChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap"
            style={{
                background: active ? 'var(--accent-ember)' : 'rgba(255,255,255,0.05)',
                color: active ? 'white' : 'var(--text-secondary)',
                border: active ? '1px solid rgba(255,107,43,0.5)' : '1px solid var(--border)',
                boxShadow: active ? 'var(--shadow-ember)' : 'none',
                transform: active ? 'translateY(-1px)' : 'none',
            }}
        >
            {label}
        </button>
    );
}
