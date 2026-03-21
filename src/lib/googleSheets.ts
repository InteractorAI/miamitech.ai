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
    linkedin: string;
    twitter: string;
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
        Conferences: '1124651295'
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
        // Filter out empty rows (usually checked by name or first column)
        const entry = e as any;
        return entry && entry.name && entry.name !== '';
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
    spaces: (cols: string[]): SpaceEntry => ({
        name: cols[0] || '',
        location: cols[1] || '',
        url: cols[2] || '',
    }),
    communities: (cols: string[]): CommunityEntry => ({
        name: cols[0] || '',
        url: cols[1] || '',
        calendar: cols[2] || '',
    }),
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
    conferences: (cols: string[]): ConferenceEntry => ({
        name: cols[0] || '',
        website: cols[1] || '',
        linkedin: cols[2] || '',
        twitter: cols[3] || '',
    }),
};
