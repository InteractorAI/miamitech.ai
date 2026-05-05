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
            <div className="panel-header px-5 h-[52px] flex items-center justify-between gap-3 border-b border-bg-border min-w-0 bg-gradient-to-r from-accent-green/[0.03] to-transparent shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-[15px] font-semibold text-accent-green tracking-tight">{title}</h2>
                    {subtitle && <span className="text-xs text-fg-muted font-normal">{subtitle}</span>}
                </div>
                {action && <div className="panel-action flex min-w-0 flex-1 justify-end">{action}</div>}
            </div>
            <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${noPadding ? '' : 'p-5'}`}>
                {children}
            </div>
        </div>
    );
}
