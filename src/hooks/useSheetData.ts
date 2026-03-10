'use client';
import { useState, useEffect, useCallback } from 'react';
import { parseSheetCSV, SHEET_CONFIG, mappers, type CapitalEntry, type SpaceEntry, type CommunityEntry, type AmbassadorEntry, type ContributorEntry, type ConferenceEntry } from '../lib/googleSheets';

export function useGoogleSheet<T>(
    gid: string,
    mapper: (cols: string[]) => T,
    skipRows: number = 0,
    refreshInterval: number = 60_000
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const url = `${SHEET_CONFIG.BASE_URL}&gid=${gid}`;
            const res = await fetch(url);
            const text = await res.text();
            const parsed = parseSheetCSV(text, mapper, skipRows);
            setData(parsed);
        } catch (err) {
            console.error(`Failed to fetch sheet data (gid: ${gid}):`, err);
        } finally {
            setLoading(false);
        }
    }, [gid, mapper, skipRows]);

    useEffect(() => {
        fetchData();
        if (refreshInterval > 0) {
            const interval = setInterval(fetchData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, refreshInterval]);

    return { data, loading, refetch: fetchData };
}

export function useCapitalData() {
    return useGoogleSheet<CapitalEntry>(
        SHEET_CONFIG.TABS.VCs,
        mappers.capital,
        4 // Skip 4 rows for Capital tab
    );
}

export function useSpacesData() {
    return useGoogleSheet<SpaceEntry>(
        SHEET_CONFIG.TABS.Spaces,
        mappers.spaces,
        1 // Skip 1 row for Spaces tab
    );
}

export function useCommunitiesData() {
    return useGoogleSheet<CommunityEntry>(
        SHEET_CONFIG.TABS.Communities,
        mappers.communities,
        1 // Skip 1 row for Communities tab
    );
}

export function useAmbassadorsData() {
    return useGoogleSheet<AmbassadorEntry>(
        SHEET_CONFIG.TABS.Ambassadors,
        mappers.ambassadors,
        1 // Skip 1 row for Ambassadors tab
    );
}

export function useContributorsData() {
    return useGoogleSheet<ContributorEntry>(
        SHEET_CONFIG.TABS.Contributors,
        mappers.contributors,
        1 // Skip 1 header row
    );
}

// Deprecated: use useCapitalData instead (providing compatibility for now)
export const useSheetData = useCapitalData;

export function useConferencesData() {
    return useGoogleSheet<ConferenceEntry>(
        SHEET_CONFIG.TABS.Conferences,
        mappers.conferences,
        1 // Skip 1 header row
    );
}
