interface ScoreDisplayProps {
    score: number;
    isLive: boolean;
    pop?: boolean;
}

export default function ScoreDisplay({ score, isLive, pop }: ScoreDisplayProps) {
    return (
        <span
            className={pop ? 'score-pop' : ''}
            style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.75rem',
                fontWeight: 700,
                lineHeight: 1,
                color: isLive ? 'var(--accent-ember)' : 'var(--text-primary)',
                textShadow: isLive ? '0 0 20px rgba(255,107,43,0.5)' : 'none',
                transition: 'color 0.3s',
                minWidth: '1ch',
                display: 'inline-block',
                textAlign: 'center',
            }}
        >
            {score}
        </span>
    );
}
