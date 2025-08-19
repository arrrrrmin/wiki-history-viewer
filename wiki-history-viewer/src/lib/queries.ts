import { revisionsStore } from "$lib/stores/revisions";


const USERAGENT_NAME = "WikiHistoryViewer/1.0"
const USERAGENT_MAIL_ALIAS = "wikihistoryview.reload331@passinbox.com";
const DEFAULT_HEADERS = {
    'Accept': 'application/json',
    'Api-User-Agent': `${USERAGENT_NAME} (${USERAGENT_MAIL_ALIAS})`
}

export interface WikimediaUser {
    id: number;
    name: string;
}

export interface WikimediaRevision {
    id: number;
    timestamp: Date;
    minor: boolean;
    size: number;
    comment?: string;
    user: WikimediaUser;
    delta: number;
}

export interface WikimediaHistoryResponse {
    revisions: WikimediaRevision[];
    latest: string;
    older: string;
    newer: string;
}

function sleep(ms: number, signal?: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        const id = setTimeout(() => resolve(), ms);
        if (signal) {
            signal.addEventListener('abort', () => {
                clearTimeout(id);
                reject(new DOMException('Aborted', 'AbortError'));
            });
        }
    });
}

async function fetchNextBatch(
    input: RequestInfo | URL, init?: RequestInit
): Promise<{ revisions: WikimediaRevision[], continueKey: (string | null) }> {
    const res = (await fetch(input, init));
    if (!res.ok) {
        throw new Error(`Wikimedia API error: ${res.status} ${res.statusText}`);
    }
    let data = (await res.json()) as WikimediaHistoryResponse
    return { revisions: data.revisions, continueKey: data.older };
}

export async function* fetchPageHistoryPaginated(
    lang: string,
    title: string,
    maxPages = 10,
    delayMs = 250,
    signal?: AbortSignal,
) {
    let endpoint: string | null = null;
    revisionsStore.subscribe(state => { endpoint = state.continueKey; });
    if (!endpoint) {
        endpoint = `https://api.wikimedia.org/core/v1/wikipedia/${lang}/page/${encodeURIComponent(title)}/history`;
    }
    let pageCount = 0;

    while (endpoint && pageCount < maxPages) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        let { revisions, continueKey } = await fetchNextBatch(endpoint, { headers: DEFAULT_HEADERS, signal });
        revisionsStore.append(revisions, continueKey)

        // Yield this batch immediately
        yield { revisions, continueKey };
        await sleep(delayMs);

        // Update loop condition variables
        revisionsStore.subscribe(state => { endpoint = state.continueKey; });
        pageCount++;
    }
}