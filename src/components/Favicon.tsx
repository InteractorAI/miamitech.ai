import { useState } from 'react';

interface FaviconProps {
    url: string;
    size?: number;
    className?: string;
}

function getDomain(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

export function Favicon({ url, size = 16, className = '' }: FaviconProps) {
    const [failed, setFailed] = useState(false);
    if (failed) return null;

    const domain = getDomain(url);
    const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    return (
        <img
            src={src}
            alt=""
            width={size}
            height={size}
            className={`rounded-sm object-contain shrink-0 ${className}`}
            style={{ width: size, height: size }}
            onError={() => setFailed(true)}
        />
    );
}
