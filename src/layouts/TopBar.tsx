import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Search, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMatchStore } from '@/store/matchStore';
import { addDays, subDays } from 'date-fns';

export default function TopBar() {
    const { filterDate, setFilterDate } = useMatchStore();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);

    const handleSearchToggle = () => {
        setSearchOpen(v => !v);
        if (!searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
    };

    const isToday = format(filterDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    return (
        <header
            className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-8 shrink-0"
            style={{
                background: 'rgba(13, 13, 26, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            {/* Left: Date Navigator */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setFilterDate(subDays(filterDate, 1))}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: 'var(--text-secondary)' }}
                    aria-label="Previous day"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-2">
                    <span
                        className="px-4 py-1.5 rounded-full text-sm font-semibold"
                        style={{
                            background: 'var(--accent-ember-dim)',
                            color: 'var(--accent-ember)',
                            border: '1px solid rgba(255,107,43,0.3)',
                        }}
                    >
                        {isToday ? 'Today' : format(filterDate, 'EEE, MMM d')}
                    </span>

                    {!isToday && (
                        <button
                            onClick={() => setFilterDate(new Date())}
                            className="text-xs px-3 py-1.5 rounded-full transition-colors"
                            style={{
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            Today
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setFilterDate(addDays(filterDate, 1))}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: 'var(--text-secondary)' }}
                    aria-label="Next day"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Right: Search + Notifs + Avatar */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div
                    className="flex items-center rounded-xl overflow-hidden transition-all duration-300"
                    style={{
                        width: searchOpen ? 240 : 36,
                        background: searchOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: searchOpen ? '1px solid var(--border)' : '1px solid transparent',
                    }}
                >
                    <button onClick={handleSearchToggle} className="p-2 shrink-0" style={{ color: 'var(--text-secondary)' }}>
                        <Search size={16} />
                    </button>
                    {searchOpen && (
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value)}
                            placeholder="Search teams, leagues…"
                            className="flex-1 bg-transparent border-none outline-none text-sm pr-2"
                            style={{ color: 'var(--text-primary)' }}
                            onBlur={() => { if (!searchVal) setSearchOpen(false); }}
                        />
                    )}
                </div>

                {/* Bell */}
                <button
                    className="relative p-2 rounded-xl transition-colors hover:bg-white/5"
                    style={{ color: 'var(--text-secondary)' }}
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                    <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                        style={{ background: 'var(--live-red)', boxShadow: 'var(--shadow-live)' }}
                    />
                </button>

                {/* Avatar */}
                <button
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold"
                    style={{
                        background: 'linear-gradient(135deg, var(--accent-ember), #ff4500)',
                        color: 'white',
                    }}
                    aria-label="Profile"
                >
                    U
                </button>
            </div>
        </header>
    );
}
