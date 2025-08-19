// src/lib/stores/revisions.ts
import { derived, writable } from "svelte/store";
import type { WikimediaRevision } from "$lib/queries";

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
export const hasRevisionsStore = derived(revisionsStore, state => state.revisions.length > 0);
export const isLoadingStore = derived(
    revisionsStore,
    state => state.isLoading
);
