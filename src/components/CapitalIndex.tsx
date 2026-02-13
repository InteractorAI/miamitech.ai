import React, { useEffect, useState } from 'react';
import { TerminalBlock } from './TerminalBlock';
import { parseCSV, type CapitalEntry } from '../lib/googleSheets';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1hqKbGMHKT3pbgFRLKVWcJ7xgInwe6FLwYaMn1uld_Pg/export?format=csv';

export const CapitalIndex: React.FC = () => {
    const [data, setData] = useState<CapitalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch(SHEET_CSV_URL);
            const text = await response.text();
            const entries = parseCSV(text);
            setData(entries);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch capital data', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleRowClick = (entry: CapitalEntry) => {
        window.interactor?.message.send(`Tell me more about ${entry.name} (${entry.type})`);
    };

    return (
        <TerminalBlock title="CAPITAL_INDEX" className="h-full">
            {loading ? (
                <div className="animate-pulse flex space-y-2 flex-col">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 bg-gray-800 rounded w-full"></div>)}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="text-gray-500 uppercase border-b border-gray-800 sticky top-0 bg-miami-black">
                            <tr>
                                <th className="py-2 pr-4">Name</th>
                                <th className="py-2 pr-4">Stage</th>
                                <th className="py-2 pr-4">Check Size</th>
                                <th className="py-2">Focus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {data.map((entry, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => handleRowClick(entry)}
                                    className="hover:bg-miami-pink/10 cursor-pointer transition-colors group"
                                >
                                    <td className="py-2 pr-4 font-bold text-gray-200 group-hover:text-miami-pink">{entry.name}</td>
                                    <td className="py-2 pr-4 text-gray-400">{entry.stage}</td>
                                    <td className="py-2 pr-4 text-gray-400">{entry.checkSize}</td>
                                    <td className="py-2 text-gray-400 truncate max-w-[150px]">{entry.focus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </TerminalBlock>
    );
};
