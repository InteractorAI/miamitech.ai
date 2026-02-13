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

export interface SheetData {
    entries: CapitalEntry[];
}

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

export const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1hqKbGMHKT3pbgFRLKVWcJ7xgInwe6FLwYaMn1uld_Pg/export?format=csv';

export function parseCSV(csvText: string): SheetData {
    const lines = csvText.split(/\r?\n/);


    const dataLines = lines.slice(4).filter(l => l.trim() !== '');
    const entries = dataLines.map(line => {
        const cols = parseCSVLine(line);
        return {
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
        };
    }).filter(e => e.name !== '');

    return { entries };
}
