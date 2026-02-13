interface PanelProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
    noPadding?: boolean;
}

export function Panel({ title, subtitle, children, className = '', action, noPadding = false }: PanelProps) {
    return (
        <div className={`bg-bg-card flex flex-col overflow-hidden ${className}`}>
            <div className="px-5 py-4 flex items-baseline justify-between border-b border-bg-border">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-[15px] font-semibold text-fg-primary tracking-tight">{title}</h2>
                    {subtitle && <span className="text-xs text-fg-muted font-normal">{subtitle}</span>}
                </div>
                {action}
            </div>
            <div className={`flex-1 overflow-auto ${noPadding ? '' : 'p-5'}`}>
                {children}
            </div>
        </div>
    );
}
