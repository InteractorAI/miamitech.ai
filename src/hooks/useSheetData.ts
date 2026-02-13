import { useState, useEffect } from 'react';
import { parseCSV, SHEET_CSV_URL, type CapitalEntry } from '../lib/googleSheets';

export function useSheetData() {
    const [data, setData] = useState<CapitalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch(SHEET_CSV_URL);
            const text = await res.text();
            const parsed = parseCSV(text);
            setData(parsed.entries);
        } catch (err) {
            console.error('Failed to fetch sheet data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60_000);
        return () => clearInterval(interval);
    }, []);

    return { data, loading, refetch: fetchData };
}
