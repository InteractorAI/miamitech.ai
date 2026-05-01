export interface CapitalEntry {
    name: string;
    topTen: boolean;
    website: string;
    checkSize: string;
    contact: string;
    location: string;
    description: string;
    type: string;
    stage: string;
    focus: string;
    leads: string;
    notes: string;
}

export interface SpaceEntry {
    name: string;
    handle: string;
    location: string;
    url: string;
    calendar: string;
    aliases: string;
    notes: string;
}

export interface CommunityEntry {
    name: string;
    handle: string;
    url: string;
    calendar: string;
    aliases: string;
    notes: string;
}

export interface AmbassadorEntry {
    name: string;
    linkedin: string;
    twitter: string;
}

export interface ContributorEntry {
    name: string;
    twitter: string;
    linkedin: string;
}

export interface ConferenceEntry {
    name: string;
    handle: string;
    website: string;
    calendar: string;
    aliases: string;
    notes: string;
}

export interface ResourceEntry {
    name: string;
    handle: string;
    category: string;
    website: string;
    calendar: string;
    aliases: string;
    notes: string;
}

export interface NewsEntry {
    name: string;
    desc: string;
    url: string;
}

export interface FAQEntry {
    question: string;
}

export interface AcceleratorEntry {
    name: string;
    website: string;
    stage: string;
    checkSize: string;
    note: string;
}

export const SHEET_CONFIG = {
    BASE_URL: 'https://docs.google.com/spreadsheets/d/1hqKbGMHKT3pbgFRLKVWcJ7xgInwe6FLwYaMn1uld_Pg/export?format=csv',
    TABS: {
        VCs: '0',
        Spaces: '1501823864',
        Communities: '585764250',
        Resources: '358470130',
        Ambassadors: '1836408446',
        Contributors: '18134085',
        Conferences: '1124651295',
        News: '156713271',
        FAQs: '418679874',
        Accelerators: '1044145407'
    }
} as const;

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

export function parseSheetCSV<T>(csvText: string, mapper: (cols: string[]) => T, skipRows: number = 0): T[] {
    const lines = csvText.split(/\r?\n/);
    const dataLines = lines.slice(skipRows).filter(l => l.trim() !== '');

    return dataLines.map(line => {
        const cols = parseCSVLine(line);
        return mapper(cols);
    }).filter(e => {
        // Filter out empty rows (usually checked by name, question, or first column)
        const entry = e as any;
        return entry && (entry.name || entry.question) && (entry.name !== '' || entry.question !== '');
    });
}

export const mappers = {
    capital: (cols: string[]): CapitalEntry => ({
        name: cols[0] || '',
        topTen: (cols[1] || '').toLowerCase() === 'yes',
        website: cols[2] || '',
        checkSize: cols[3] || '',
        contact: cols[4] || '',
        location: cols[5] || '',
        description: cols[6] || '',
        type: cols[7] || '',
        stage: cols[8] || '',
        focus: cols[9] || '',
        leads: cols[10] || '',
        notes: cols[11] || '',
    }),
    spaces: (cols: string[]): SpaceEntry => {
        const hasHandle = !isProbablyUrl(cols[1]) && isProbablyUrl(cols[3]);
        return {
            name: cols[0] || '',
            handle: hasHandle ? cols[1] || '' : '',
            location: hasHandle ? cols[2] || '' : cols[1] || '',
            url: hasHandle ? cols[3] || '' : cols[2] || '',
            calendar: hasHandle ? cols[4] || '' : cols[3] || '',
            aliases: hasHandle ? cols[5] || '' : cols[4] || '',
            notes: hasHandle ? cols[6] || '' : cols[5] || '',
        };
    },
    communities: (cols: string[]): CommunityEntry => {
        const hasHandle = !isProbablyUrl(cols[1]) && isProbablyUrl(cols[2]);
        return {
            name: cols[0] || '',
            handle: hasHandle ? cols[1] || '' : '',
            url: hasHandle ? cols[2] || '' : cols[1] || '',
            calendar: hasHandle ? cols[3] || '' : cols[2] || '',
            aliases: hasHandle ? cols[4] || '' : cols[3] || '',
            notes: hasHandle ? cols[5] || '' : cols[4] || '',
        };
    },
    ambassadors: (cols: string[]): AmbassadorEntry => ({
        name: cols[0] || '',
        linkedin: cols[1] || '',
        twitter: cols[2] || '',
    }),
    contributors: (cols: string[]): ContributorEntry => ({
        name: cols[0] || '',
        twitter: cols[2] || '',
        linkedin: cols[1] || '',
    }),
    conferences: (cols: string[]): ConferenceEntry => {
        const hasHandle = !isProbablyUrl(cols[1]) && isProbablyUrl(cols[2]);
        return {
            name: cols[0] || '',
            handle: hasHandle ? cols[1] || '' : '',
            website: hasHandle ? cols[2] || '' : cols[1] || '',
            calendar: hasHandle ? cols[3] || '' : '',
            aliases: hasHandle ? cols[4] || '' : '',
            notes: hasHandle ? cols[5] || '' : cols[2] || '',
        };
    },
    resources: (cols: string[]): ResourceEntry => {
        const hasHandle = !isProbablyUrl(cols[1]) && !isProbablyUrl(cols[2]) && isProbablyUrl(cols[3]);
        return {
            name: cols[0] || '',
            handle: hasHandle ? cols[1] || '' : '',
            category: hasHandle ? cols[2] || '' : cols[1] || '',
            website: hasHandle ? cols[3] || '' : cols[2] || '',
            calendar: hasHandle ? cols[4] || '' : '',
            aliases: hasHandle ? cols[5] || '' : '',
            notes: hasHandle ? cols[6] || '' : cols[3] || '',
        };
    },
    news: (cols: string[]): NewsEntry => ({
        name: cols[0] || '',
        desc: cols[1] || '',
        url: cols[2] || '',
    }),
    faqs: (cols: string[]): FAQEntry => ({
        question: cols[0] || '',
    }),
    accelerators: (cols: string[]): AcceleratorEntry => ({
        name: cols[0] || '',
        website: cols[1] || '',
        stage: cols[2] || '',
        checkSize: cols[3] || '',
        note: cols[4] || '',
    }),
};

function isProbablyUrl(value: string | undefined): boolean {
    return /^https?:\/\//i.test((value || '').trim()) || /^[a-z0-9.-]+\.[a-z]{2,}/i.test((value || '').trim());
}
