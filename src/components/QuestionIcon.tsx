export function QuestionIcon({ className = 'w-4 h-4' }: { className?: string }) {
    return (
        <span className={`${className} inline-flex items-center justify-center text-[13px] font-semibold leading-none`} aria-hidden="true">
            ?
        </span>
    );
}
