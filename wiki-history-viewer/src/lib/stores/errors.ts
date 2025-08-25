import type { WikipediaUrlError } from "$lib/validation.errors";
import { writable, derived } from "svelte/store";


function createErrorStore() {
    const { subscribe, set } = writable<WikipediaUrlError | null>();

    return {
        subscribe,

        setError: (err: WikipediaUrlError) => set(err),

        reset: () => set(null)
    };
}

export const errorStore = createErrorStore();
export const hasErrorStore = derived(errorStore, $state => $state instanceof Error);
