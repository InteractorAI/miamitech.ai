'use client';
import { useState } from 'react';
import { Panel } from './TerminalBlock';
import { Favicon } from './Favicon';
import type { NewsEntry } from '../lib/googleSheets';
import { track } from '@vercel/analytics';

const PREVIEW_COUNT = 4;

export function NewsSources({ initialData = [] }: { initialData?: NewsEntry[] }) {
    const [expanded, setExpanded] = useState(false);
    const NEWS_SOURCES = initialData;
    const visible = expanded ? NEWS_SOURCES : NEWS_SOURCES.slice(0, PREVIEW_COUNT);
    const remaining = NEWS_SOURCES.length - PREVIEW_COUNT;

    return (
        <Panel title="News" subtitle={`${NEWS_SOURCES.length} sources`} noPadding>
            <div>
                {visible.map((source, i) => (
                    <a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track('news_link_clicked', { title: source.name, url: source.url })}
                        className="focus-row flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover transition-colors duration-100 group"
                    >
                        <span className="flex items-center gap-2 text-sm font-medium text-fg-primary group-hover:text-accent-blue transition-colors">
                            <Favicon url={source.url} />
                            {source.name}
                        </span>
                        <span className="text-[11px] text-fg-muted font-medium truncate ml-4">{source.desc}</span>
                    </a>
                ))}
                {NEWS_SOURCES.length > PREVIEW_COUNT && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-accent-pink transition-colors duration-150 text-center"
                    >
                        {expanded ? '↑ Show less' : `↓ ${remaining} more`}
                    </button>
                )}
            </div>
        </Panel>
    );
}
