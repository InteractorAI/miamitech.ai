import React from 'react';
import { SysInfo } from '../components/SysInfo';
import { CapitalIndex } from '../components/CapitalIndex';
import { SpacesDirectory } from '../components/SpacesDirectory';
import { AmbassadorsRegistry } from '../components/AmbassadorsRegistry';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    return (
        <div className="p-4 h-screen flex flex-col gap-4 overflow-hidden">
            <header className="flex justify-between items-end border-b-2 border-miami-pink pb-2 mb-2 shrink-0">
                <h1 className="text-4xl font-bold text-miami-pink tracking-tighter">
                    MIAMITECH.AI_
                </h1>
                <div className="text-xs text-miami-purple animate-pulse">
                    SYSTEM_READY
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
                {/* Column 1: Info & Registry */}
                <div className="md:col-span-3 flex flex-col gap-4 min-h-0">
                    <div className="flex-none">
                        <SysInfo />
                    </div>
                    <div className="flex-1 min-h-0">
                        <AmbassadorsRegistry />
                    </div>
                </div>

                {/* Column 2: Capital (Main) */}
                <div className="md:col-span-6 min-h-0 flex flex-col relative group">
                    <CapitalIndex />
                    <Link
                        to="/capital"
                        className="absolute top-2 right-2 text-xs text-miami-pink/50 hover:text-miami-pink border border-transparent hover:border-miami-pink px-2 py-1 transition-all opacity-0 group-hover:opacity-100 bg-miami-black"
                    >
                        [EXPAND_VIEW]
                    </Link>
                </div>

                {/* Column 3: Spaces */}
                <div className="md:col-span-3 min-h-0">
                    <SpacesDirectory />
                </div>
            </div>

            <footer className="shrink-0 text-[10px] text-gray-600 flex justify-between uppercase mt-2">
                <div>Terminal_ID: MIA_001</div>
                <div>Lat: 25.7617° N | Lon: 80.1918° W</div>
            </footer>
        </div>
    );
};
