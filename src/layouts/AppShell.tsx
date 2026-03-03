import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AppShellProps {
    children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    return (
        <div
            className="flex min-h-screen"
            style={{ background: 'var(--bg-base)' }}
        >
            {/* Sidebar */}
            <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(v => !v)} />

            {/* Main Column */}
            <div
                className="flex flex-col flex-1 min-w-0 transition-all duration-300"
                style={{ marginLeft: sidebarExpanded ? 'var(--sidebar-w)' : 'var(--sidebar-w-collapsed)' }}
            >
                <TopBar />
                <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
