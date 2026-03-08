import { useState } from 'react';
import { Panel } from './TerminalBlock';
import { Favicon } from './Favicon';

const NEWS_SOURCES = [
    { name: 'Refresh Miami', url: 'https://refreshmiami.com', desc: 'Local tech community' },
    { name: 'TechCrunch Miami', url: 'https://techcrunch.com/tag/miami/', desc: 'Startup coverage' },
    { name: 'The Miami Tech Pod', url: 'https://miamitechpod.com', desc: 'Podcast' },
    { name: 'eMerge Americas', url: 'https://emergeamericas.com', desc: 'Annual conference' },
    { name: 'South Florida Business Journal', url: 'https://bizjournals.com/southflorida/news/technology', desc: 'Business news' },
    { name: 'Miami Herald Tech', url: 'https://miamiherald.com/news/business/', desc: 'Local reporting' },
    { name: 'Wired Miami', url: 'https://wired.com/tag/miami/', desc: 'Tech culture' },
];

const PREVIEW_COUNT = 4;

export function NewsSources() {
    const [expanded, setExpanded] = useState(false);
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
                        className="flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover transition-colors duration-100 group"
                    >
                        <span className="flex items-center gap-2 text-sm font-medium text-fg-primary group-hover:text-accent-blue transition-colors">
                            <Favicon url={source.url} />
                            {source.name}
                        </span>
                        <span className="text-[11px] text-fg-muted font-medium">{source.desc}</span>
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
