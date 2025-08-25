import type { WikimediaLang, WikimediaProject, WikimediaUrl } from "$lib/validation";
import { writable, derived } from "svelte/store";


function createParserStore() {
    const { subscribe, set } = writable<WikimediaUrl | null>(null);

    return {
        subscribe,

        setParsed: (lang: WikimediaLang, project: WikimediaProject, title: string) => set({ lang, title, project }),

        reset: () => set(null),

        getLang: () => subscribe(state => state?.lang),
        getProject: () => subscribe(state => state?.project)
    };
}

export const parserStore = createParserStore();
export const hasParsedStore = derived(parserStore, state => state);
