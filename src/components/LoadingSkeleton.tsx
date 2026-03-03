interface LoadingSkeletonProps {
    count?: number;
    compact?: boolean;
}

function MatchSkeleton() {
    return (
        <div
            className="rounded-xl p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
            {/* League row */}
            <div className="flex items-center justify-between mb-3">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-5 w-14 rounded-full" />
            </div>
            {/* Teams + score */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="skeleton w-9 h-9 rounded-full" />
                    <div className="skeleton h-3 w-16 rounded" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="skeleton h-8 w-16 rounded-md" />
                </div>
                <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="skeleton w-9 h-9 rounded-full" />
                    <div className="skeleton h-3 w-16 rounded" />
                </div>
            </div>
        </div>
    );
}

export default function LoadingSkeleton({ count = 6, compact = false }: LoadingSkeletonProps) {
    return (
        <div className={`grid gap-4 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {Array.from({ length: count }).map((_, i) => (
                <MatchSkeleton key={i} />
            ))}
        </div>
    );
}

export function RowSkeleton() {
    return (
        <div className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="skeleton h-4 w-4 rounded" />
            <div className="flex items-center gap-2 flex-1">
                <div className="skeleton w-7 h-7 rounded-full" />
                <div className="skeleton h-4 w-28 rounded" />
            </div>
            {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-4 w-8 rounded" />
            ))}
        </div>
    );
}
