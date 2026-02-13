import React from 'react';
import { TerminalBlock } from './TerminalBlock';

const SPACES = [
    { name: "The Lab Miami", hood: "Wynwood", type: "Coworking" },
    { name: "EcoSystem @ Ampersand", hood: "Edgewater", type: "Office" },
    { name: "Büro", hood: "Multiple", type: "Coworking" },
    { name: "O&O", hood: "Wynwood", type: "Event Space" },
];

export const SpacesDirectory: React.FC = () => {
    const handleRowClick = (space: { name: string, hood: string }) => {
        window.interactor?.message.send(`What amenities does ${space.name} in ${space.hood} have?`);
    };

    return (
        <TerminalBlock title="SPACES_DIRECTORY" className="h-full">
            <table className="w-full text-xs text-left">
                <thead className="text-gray-500 uppercase border-b border-gray-800">
                    <tr>
                        <th className="py-2">Name</th>
                        <th className="py-2">Hood</th>
                        <th className="py-2">Type</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {SPACES.map((space, idx) => (
                        <tr
                            key={idx}
                            onClick={() => handleRowClick(space)}
                            className="hover:bg-miami-orange/10 cursor-pointer transition-colors group"
                        >
                            <td className="py-2 font-bold text-gray-200 group-hover:text-miami-orange">{space.name}</td>
                            <td className="py-2 text-gray-400">{space.hood}</td>
                            <td className="py-2 text-gray-400">{space.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TerminalBlock>
    );
};
