/** Validate user input for wikipedia pages. Allow 'flexible' lang and title, but user
 *  input needs to match the rest of a valid wikipedia page structure.
 */

import * as errors from "./validation.errors";


export type WikimediaLang =
    | 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'ru' | 'ja' | 'zh' | 'ar';

const WIKIPEDIA_LANGS: Set<WikimediaLang> = new Set([
    'en', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'ja', 'zh', 'ar'
]);

// Only wikipedia support for now
export type WikimediaProject = 'wikipedia';


export type WikimediaUrl = {
    lang: WikimediaLang;
    project: WikimediaProject;
    title: string;
}

export function parseWikipediaUrl(input: string): WikimediaUrl {
    let url = null;
    try {
        url = new URL(input.trim());
    } catch (typeErr) {
        throw new errors.WikipediaUrlError("Invalid URL.");
    }

    // Enforce https
    if (url.protocol !== 'https:') throw new errors.WrongProtocolError();

    // Look for .wikipedia.org or check which project is queried (only 'wiki' supported currently)
    const project = "wikipedia"
    if (!url.hostname.includes('.wikipedia.org')) {
        throw new errors.UnsupportedProjectError(input)
    }

    // Make sure it links /wiki/
    if (!url.pathname.startsWith('/wiki/')) throw new errors.PathnameError();

    // Match <lang>.wikipedia.org or <lang>.m.wikipedia.org
    const hostMatch = url.hostname.match(/([\w]+)(\.m)?(\.wikipedia.org)/i);
    if (!hostMatch || hostMatch.length < 2) throw new errors.UnsupportedLanguageError("");
    const lang = hostMatch[1].toLowerCase() as WikimediaLang;

    // Check if lang is supported
    if (!WIKIPEDIA_LANGS.has(lang)) throw new errors.UnsupportedLanguageError(lang);


    // Find wiki page title in url
    const rawTitle = url.pathname.slice('/wiki/'.length);
    if (!rawTitle) throw new errors.PathnameError();
    const title = decodeURIComponent(rawTitle);

    return { lang, project, title };
}