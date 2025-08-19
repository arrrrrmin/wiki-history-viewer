import type { WikipediaLang, WikiUrlParts } from "$lib/validation";
import { writable, derived } from "svelte/store";


function createParserStore() {
    const { subscribe, set, update } = writable<WikiUrlParts | null>(null);

    return {
        subscribe,

        setParsed: (lang: WikipediaLang, title: string) => set({ lang, title }),

        reset: () => set(null)
    };
}

export const parserStore = createParserStore();
export const hasParsedStore = derived(parserStore, state => state);
