import { writable, derived } from "svelte/store";

export interface ErrorState {
    message: string | null;
    code?: string; // optional error code (e.g. "UNSUPPORTED_LANG")
}

function createErrorStore() {
    const { subscribe, set, update } = writable<ErrorState>({
        message: null
    });

    return {
        subscribe,

        setError: (message: string, code?: string) =>
            set({ message, code }),

        reset: () =>
            set({ message: null })
    };
}

export const errorStore = createErrorStore();
export const hasErrorStore = derived(errorStore, state => state.message !== null);
