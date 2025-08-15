/** Validate user input for wikipedia pages. Allow 'flexible' lang and title, but user
 *  input needs to match the rest of a valid wikipedia page structure.
 */

import * as errors from "./validation.errors";


export type WikipediaLang =
    | 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'ru' | 'ja' | 'zh' | 'ar' | 'simple';

const WIKIPEDIA_LANGS: Set<WikipediaLang> = new Set([
    'en', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'ja', 'zh', 'ar', 'simple'
]);


export type WikiUrlParts = {
    lang: WikipediaLang;
    title: string;
}

export function parseWikipediaUrl(input: string): WikiUrlParts { //throws WikipediaUrlError
    let url = null;
    try {
        url = new URL(input.trim());
    } catch (typeErr) {
        throw new errors.WikipediaUrlError("Invalid URL.");
    }

    // Enforce https
    if (url.protocol !== 'https:') throw new errors.WrongProtocolError();

    // Look for .wikipedia.org
    if (!url.hostname.includes('.wikipedia.org')) throw new errors.WrongHostnameError();

    // Make sure it links /wiki/
    if (!url.pathname.startsWith('/wiki/')) throw new errors.PathnameError();

    // Match <lang>.wikipedia.org or <lang>.m.wikipedia.org
    const hostMatch = url.hostname.match(/([\w]+)(\.m)?(\.wikipedia.org)/i);
    if (!hostMatch || hostMatch.length < 2) throw new errors.UnsupportedLanguageError("");
    const lang = hostMatch[1].toLowerCase() as WikipediaLang;

    // Check if lang is supported
    if (!WIKIPEDIA_LANGS.has(lang)) throw new errors.UnsupportedLanguageError(lang);

    // Find wiki page title in url
    const rawTitle = url.pathname.slice('/wiki/'.length);
    if (!rawTitle) throw new errors.PathnameError();
    const title = decodeURIComponent(rawTitle);

    /** Todo check if the found title exists as wikimedia core api entry
     *  If not `throw errors.TitleNotFoundError;`
     */

    return { lang, title };
}