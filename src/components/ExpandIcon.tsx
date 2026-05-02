export function ExpandIcon({ className = 'w-4 h-4' }: { className?: string }) {
    return (
        <svg className={`${className} scale-x-[-1]`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75h-4.5v4.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75 9 9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 20.25h4.5v-4.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 20.25 15 15" />
        </svg>
    );
}
