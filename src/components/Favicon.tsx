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

// Crisp SVG fallback shown when no real favicon exists
function FallbackIcon({ size, className }: { size: number; className: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 ${className}`}
            style={{ width: size, height: size }}
        >
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
            <ellipse cx="8" cy="8" rx="3" ry="7" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
            <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
            <line x1="2.5" y1="5" x2="13.5" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.25" />
            <line x1="2.5" y1="11" x2="13.5" y2="11" stroke="currentColor" strokeWidth="1" opacity="0.25" />
        </svg>
    );
}

export function Favicon({ url, size = 16, className = '' }: FaviconProps) {
    const [useFallback, setUseFallback] = useState(false);

    const domain = getDomain(url);
    // Google has the best favicon coverage. sz=64 keeps real favicons crisp on retina.
    // Their generic globe fallback always comes back as 16×16 regardless of sz,
    // so we can detect it reliably via naturalWidth.
    const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    if (useFallback) {
        return <FallbackIcon size={size} className={className} />;
    }

    return (
        <img
            src={src}
            alt=""
            width={size}
            height={size}
            className={`rounded-sm object-contain shrink-0 ${className}`}
            style={{ width: size, height: size, imageRendering: 'auto' }}
            onError={() => setUseFallback(true)}
            onLoad={(e) => {
                // Google's generic globe is always 16×16; real favicons at sz=64 are larger.
                const img = e.currentTarget;
                if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
                    setUseFallback(true);
                }
            }}
        />
    );
}
