export interface CapitalEntry {
    name: string;
    website: string;
    checkSize: string;
    contact: string;
    location: string;
    description: string;
    type: string;
    stage: string;
    focus: string;
}

export const parseCSV = (csvText: string): CapitalEntry[] => {
    const lines = csvText.split('\n');
    // const headers = lines[0].split(',');

    // Basic CSV parsing (skipping complex quote handling for MVP unless needed)
    return lines.slice(1).filter(line => line.trim() !== '').map(line => {
        // Handle quoted fields simply by checking for "
        // A robust CSV parser is better, but for MVP we do basic split or regex
        // Using a regex to split by comma but ignoring commas inside quotes
        // const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        // Fallback if regex fails or matches weirdly, manual split is safer for simple CSVs
        // strict split:
        // const values = line.split(','); 
        // Cleaning:
        const clean = (val: string) => val ? val.replace(/^"|"$/g, '').trim() : '';

        // Values mapping based on assumed column order from inspection:
        // Name, Top 10 Cited, Website, Typical Check Size, Key Miami Contact, Location, Description, Type, Investment Stage, Focus Industries...

        // We need to map correctly. Since we don't have a robust parser lib installed, 
        // and the data might contain commas in "Description", we should be careful.
        // For now, let's assume standard CSV structure and use a simple regex split.

        // Better regex for CSV:
        const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        const cols = matches ? matches.map(m => clean(m)) : [];

        return {
            name: cols[0] || '',
            website: cols[2] || '',
            checkSize: cols[3] || '',
            contact: cols[4] || '',
            location: cols[5] || '',
            description: cols[6] || '',
            type: cols[7] || '',
            stage: cols[8] || '',
            focus: cols[9] || '',
        };
    });
};
