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

export interface CoffeeShopEntry {
    name: string;
    area: string;
    wifi: string;
    note: string;
    url: string;
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
        CoffeeShops: '982435771',
        Ambassadors: '1836408446',
        Contributors: '18134085',
        Conferences: '1124651295',
        News: '156713271',
        FAQs: '418679874',
        Accelerators: '1044145407'
    }
} as const;

function normalizeExternalUrl(value: string): string {
    const url = value.trim();
    if (!url) return '';
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(url)) return url;
    return `https://${url}`;
}

type SheetRow = Record<string, string>;

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

function normalizeHeader(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function makeSheetRow(headers: string[], cols: string[]): SheetRow {
    return headers.reduce<SheetRow>((row, header, index) => {
        const key = normalizeHeader(header);
        if (key) row[key] = cols[index] || '';
        return row;
    }, {});
}

function getColumn(row: SheetRow | undefined, cols: string[], names: string[], fallbackIndex: number): string {
    for (const name of names) {
        const value = row?.[normalizeHeader(name)];
        if (value !== undefined) return value;
    }

    if (fallbackIndex < 0) return '';

    return cols[fallbackIndex] || '';
}

export function parseSheetCSV<T>(csvText: string, mapper: (cols: string[], row?: SheetRow) => T, skipRows: number = 0): T[] {
    const lines = csvText.split(/\r?\n/);
    const headers = skipRows > 0 ? parseCSVLine(lines[skipRows - 1] || '') : [];
    const dataLines = lines.slice(skipRows).filter(l => l.trim() !== '');

    return dataLines.map(line => {
        const cols = parseCSVLine(line);
        return mapper(cols, makeSheetRow(headers, cols));
    }).filter(e => {
        // Filter out empty rows (usually checked by name, question, or first column)
        const entry = e as any;
        return entry && (entry.name || entry.question) && (entry.name !== '' || entry.question !== '');
    });
}

export const mappers = {
    capital: (cols: string[], row?: SheetRow): CapitalEntry => ({
        name: getColumn(row, cols, ['Name'], 0),
        topTen: getColumn(row, cols, ['Top 10', 'Top Ten'], 1).toLowerCase() === 'yes',
        website: normalizeExternalUrl(getColumn(row, cols, ['Website', 'URL'], 2)),
        checkSize: getColumn(row, cols, ['Check Size', 'Check'], 3),
        contact: getColumn(row, cols, ['Contact'], 4),
        location: getColumn(row, cols, ['Location'], 5),
        description: getColumn(row, cols, ['Description'], 6),
        type: getColumn(row, cols, ['Type'], 7),
        stage: getColumn(row, cols, ['Stage'], 8),
        focus: getColumn(row, cols, ['Focus'], 9),
        leads: getColumn(row, cols, ['Leads'], 10),
        notes: getColumn(row, cols, ['Notes', 'Note'], 11),
    }),
    spaces: (cols: string[], row?: SheetRow): SpaceEntry => {
        const hasHeader = Boolean(row?.name);
        const hasHandle = !isProbablyUrl(cols[1]) && isProbablyUrl(cols[3]);
        return {
            name: hasHeader ? getColumn(row, cols, ['Name'], 0) : cols[0] || '',
            handle: hasHeader ? getColumn(row, cols, ['Handle'], -1) : hasHandle ? cols[1] || '' : '',
            location: hasHeader ? getColumn(row, cols, ['Location'], 2) : hasHandle ? cols[2] || '' : cols[1] || '',
            url: normalizeExternalUrl(hasHeader ? getColumn(row, cols, ['Website', 'URL'], 3) : hasHandle ? cols[3] || '' : cols[2] || ''),
            calendar: normalizeExternalUrl(hasHeader ? getColumn(row, cols, ['Event calendar', 'Calendar'], 4) : hasHandle ? cols[4] || '' : cols[3] || ''),
            aliases: hasHeader ? getColumn(row, cols, ['Aliases', 'Alias'], 5) : hasHandle ? cols[5] || '' : cols[4] || '',
            notes: hasHeader ? getColumn(row, cols, ['Notes', 'Note'], 6) : hasHandle ? cols[6] || '' : cols[5] || '',
        };
    },
    coffeeShops: (cols: string[], row?: SheetRow): CoffeeShopEntry => ({
        name: getColumn(row, cols, ['Name'], 0),
        area: getColumn(row, cols, ['Area', 'Location'], 1),
        wifi: getColumn(row, cols, ['Wi-Fi', 'Wifi'], 2),
        note: getColumn(row, cols, ['Note', 'Notes'], 3),
        url: normalizeExternalUrl(getColumn(row, cols, ['URL', 'Website'], 4)),
    }),
    communities: (cols: string[], row?: SheetRow): CommunityEntry => {
        const hasHeader = Boolean(row?.name);
        const hasHandle = !isProbablyUrl(cols[1]) && isProbablyUrl(cols[2]);
        return {
            name: hasHeader ? getColumn(row, cols, ['Name'], 0) : cols[0] || '',
            handle: hasHeader ? getColumn(row, cols, ['Handle'], -1) : hasHandle ? cols[1] || '' : '',
            url: normalizeExternalUrl(hasHeader ? getColumn(row, cols, ['Website', 'URL'], hasHandle ? 2 : 1) : hasHandle ? cols[2] || '' : cols[1] || ''),
            calendar: normalizeExternalUrl(hasHeader ? getColumn(row, cols, ['Event calendar', 'Calendar'], hasHandle ? 3 : 2) : hasHandle ? cols[3] || '' : cols[2] || ''),
            aliases: hasHeader ? getColumn(row, cols, ['Aliases', 'Alias'], -1) : hasHandle ? cols[4] || '' : cols[3] || '',
            notes: hasHeader ? getColumn(row, cols, ['Notes', 'Note'], -1) : hasHandle ? cols[5] || '' : cols[4] || '',
        };
    },
    ambassadors: (cols: string[], row?: SheetRow): AmbassadorEntry => ({
        name: getColumn(row, cols, ['Name'], 0),
        linkedin: getColumn(row, cols, ['LinkedIn', 'Linkedin'], 1),
        twitter: getColumn(row, cols, ['Twitter', 'X'], 2),
    }),
    contributors: (cols: string[], row?: SheetRow): ContributorEntry => ({
        name: getColumn(row, cols, ['Name'], 0),
        twitter: getColumn(row, cols, ['Twitter', 'X'], 2),
        linkedin: getColumn(row, cols, ['LinkedIn', 'Linkedin'], 1),
    }),
    conferences: (cols: string[], row?: SheetRow): ConferenceEntry => {
        const hasHeader = Boolean(row?.name);
        const hasHandle = !isProbablyUrl(cols[1]) && isProbablyUrl(cols[2]);
        return {
            name: hasHeader ? getColumn(row, cols, ['Name'], 0) : cols[0] || '',
            handle: hasHeader ? getColumn(row, cols, ['Handle'], -1) : hasHandle ? cols[1] || '' : '',
            website: normalizeExternalUrl(hasHeader ? getColumn(row, cols, ['Website', 'URL'], hasHandle ? 2 : 1) : hasHandle ? cols[2] || '' : cols[1] || ''),
            calendar: normalizeExternalUrl(hasHeader ? getColumn(row, cols, ['Event calendar', 'Calendar'], hasHandle ? 3 : 2) : hasHandle ? cols[3] || '' : ''),
            aliases: hasHeader ? getColumn(row, cols, ['Aliases', 'Alias'], hasHandle ? 4 : 3) : hasHandle ? cols[4] || '' : '',
            notes: hasHeader ? getColumn(row, cols, ['Notes', 'Note'], hasHandle ? 5 : 2) : hasHandle ? cols[5] || '' : cols[2] || '',
        };
    },
    resources: (cols: string[], row?: SheetRow): ResourceEntry => {
        const hasHeader = Boolean(row?.name);
        const hasHandle = !isProbablyUrl(cols[1]) && !isProbablyUrl(cols[2]) && isProbablyUrl(cols[3]);
        return {
            name: hasHeader ? getColumn(row, cols, ['Name'], 0) : cols[0] || '',
            handle: hasHeader ? getColumn(row, cols, ['Handle'], -1) : hasHandle ? cols[1] || '' : '',
            category: hasHeader ? getColumn(row, cols, ['Category'], hasHandle ? 2 : 1) : hasHandle ? cols[2] || '' : cols[1] || '',
            website: normalizeExternalUrl(hasHeader ? getColumn(row, cols, ['Website', 'URL'], hasHandle ? 3 : 2) : hasHandle ? cols[3] || '' : cols[2] || ''),
            calendar: normalizeExternalUrl(hasHeader ? getColumn(row, cols, ['Event calendar', 'Calendar'], hasHandle ? 4 : 3) : hasHandle ? cols[4] || '' : ''),
            aliases: hasHeader ? getColumn(row, cols, ['Aliases', 'Alias'], hasHandle ? 5 : 4) : hasHandle ? cols[5] || '' : '',
            notes: hasHeader ? getColumn(row, cols, ['Notes', 'Note'], hasHandle ? 6 : 3) : hasHandle ? cols[6] || '' : cols[3] || '',
        };
    },
    news: (cols: string[], row?: SheetRow): NewsEntry => ({
        name: getColumn(row, cols, ['Name'], 0),
        desc: getColumn(row, cols, ['Description', 'Desc', 'Notes', 'Note'], 1),
        url: normalizeExternalUrl(getColumn(row, cols, ['URL', 'Website'], 2)),
    }),
    faqs: (cols: string[], row?: SheetRow): FAQEntry => ({
        question: getColumn(row, cols, ['Question'], 0),
    }),
    accelerators: (cols: string[], row?: SheetRow): AcceleratorEntry => ({
        name: getColumn(row, cols, ['Name'], 0),
        website: normalizeExternalUrl(getColumn(row, cols, ['Website', 'URL'], 1)),
        stage: getColumn(row, cols, ['Stage'], 2),
        checkSize: getColumn(row, cols, ['Check Size', 'Check'], 3),
        note: getColumn(row, cols, ['Note', 'Notes'], 4),
    }),
};

function isProbablyUrl(value: string | undefined): boolean {
    return /^https?:\/\//i.test((value || '').trim()) || /^[a-z0-9.-]+\.[a-z]{2,}/i.test((value || '').trim());
}
