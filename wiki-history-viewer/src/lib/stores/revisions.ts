// src/lib/stores/revisions.ts
import { derived, writable } from "svelte/store";
import * as d3 from "d3";

import type { WikimediaRevision } from "$lib/queries";

import { dataSettingsStore } from "$lib/stores/datasettings";


export interface RevisionsState {
    revisions: WikimediaRevision[];
    continueKey: string | null;     // pagination key from API
    hasMore: boolean;               // convenient flag
    isLoading: boolean;             // loading indicator
}

function createRevisionsStore() {
    const { subscribe, update, set } = writable<RevisionsState>({
        revisions: [],
        continueKey: null,
        hasMore: false,
        isLoading: false
    });

    return {
        subscribe,

        reset: () =>
            set({
                revisions: [],
                continueKey: null,
                hasMore: false,
                isLoading: false,
            }),

        setLoading: (value: boolean) =>
            update(state => ({ ...state, isLoading: value })),

        append: (
            newBatch: WikimediaRevision[],
            continueKey: string | null
        ) =>
            update(state => {
                newBatch = newBatch.map(r => ({ ...r, timestamp: new Date(r.timestamp) })).filter(r => r.user.name && r.user.id);
                const merged: WikimediaRevision[] = [
                    ...state.revisions,
                    ...newBatch
                ];

                merged.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                return {
                    revisions: merged,
                    continueKey,
                    hasMore: continueKey !== null && merged.length > 0,
                    isLoading: state.isLoading,
                };
            })
    };
}

export const revisionsStore = createRevisionsStore();
export const hasRevisionsStore = derived(revisionsStore, ($state) => ($state).revisions.length > 0);
export const isLoadingStore = derived(
    revisionsStore,
    state => state.isLoading
);
export const filteredRevisionsStore = derived(
    [revisionsStore, dataSettingsStore],
    ([$revisionsStore, $dataSettingsStore]) => {
        const { revisions } = $revisionsStore;
        const { allowMinors, allowUnknownEditors } = $dataSettingsStore;

        return revisions.filter(rev => {
            if (!allowMinors && rev.minor) return false;
            if (!allowUnknownEditors && !rev.user?.name) return false;
            return true;
        });
    }
);
export const userRevisionsStore = derived(
    [revisionsStore, dataSettingsStore],
    ([$revisionsStore, $dataSettingsStore]) => {
        const { revisions } = $revisionsStore;
        const { allowMinors, allowUnknownEditors } = $dataSettingsStore;

        const filteredRevisions = revisions.filter(rev => {
            if (!allowMinors && rev.minor) return false;
            if (!allowUnknownEditors && !rev.user?.name) return false;
            return true;
        });
        return d3.groups(filteredRevisions, r => r.user.name).map(
            (g) => ({
                id: g[1][0].id,
                name: g[0],
                count: g[1].length,
                minorCount: g[1].filter(r => r.minor).length,
                since: d3.extent(g[1], r => r.timestamp)[0],
                total: d3.sum(g[1], r => Math.abs(r.delta)),
                revisions: g[1]
            })
        ).sort((a, b) => b.count - a.count);
    }
)