import type { PageStatistics } from '$lib/queries';
import { writable, derived } from 'svelte/store';

const defaultStats: PageStatistics = {
    anonymous: null,
    bot: null,
    editors: null,
    edits: null,
    minor: null,
    reverted: null
};

function createPageStatsStore() {
    const { subscribe, set } = writable<PageStatistics>(defaultStats);

    return {
        subscribe,
        set,
        reset: () => {
            set(defaultStats)
        }
    }
}

export const pageStatsStore = createPageStatsStore();
export const totalEdits = derived(pageStatsStore, ($stats) =>
    $stats.edits?.count ?? 0
);
export const totalUsers = derived(pageStatsStore, ($stats) =>
    ($stats.anonymous?.count ?? 0) + ($stats.editors?.count ?? 0)
);