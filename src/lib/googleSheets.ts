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
    location: string;
    url: string;
}

export interface CommunityEntry {
    name: string;
    url: string;
    calendar: string;
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
    website: string;
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
    spaces: (cols: string[], row?: SheetRow): SpaceEntry => ({
        name: getColumn(row, cols, ['Name'], 0),
        location: getColumn(row, cols, ['Location'], 1),
        url: normalizeExternalUrl(getColumn(row, cols, ['Website', 'URL'], 2)),
    }),
    communities: (cols: string[], row?: SheetRow): CommunityEntry => ({
        name: getColumn(row, cols, ['Name'], 0),
        url: normalizeExternalUrl(getColumn(row, cols, ['Website', 'URL'], 1)),
        calendar: normalizeExternalUrl(getColumn(row, cols, ['Event calendar', 'Calendar'], 2)),
    }),
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
    conferences: (cols: string[], row?: SheetRow): ConferenceEntry => ({
        name: getColumn(row, cols, ['Name'], 0),
        website: normalizeExternalUrl(getColumn(row, cols, ['Website', 'URL'], 1)),
        notes: getColumn(row, cols, ['Notes', 'Note'], 2),
    }),
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
