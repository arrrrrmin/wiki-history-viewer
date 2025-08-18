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

export async function fetchPageHistoryOnce(lang: string, title: string) {
    const endpoint = `https://api.wikimedia.org/core/v1/wikipedia/${lang}/page/${encodeURIComponent(title)}/history`;

    const res = await fetch(endpoint, { headers: DEFAULT_HEADERS });

    if (!res.ok) {
        throw new Error(`Wikimedia API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
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

export async function* fetchPageHistoryPaginated(
    lang: string,
    title: string,
    maxPages = 10,
    delayMs = 250,
    signal?: AbortSignal,
    endpoint?: string,
) {
    if (!endpoint) {
        endpoint = `https://api.wikimedia.org/core/v1/wikipedia/${lang}/page/${encodeURIComponent(title)}/history`;
    }
    let pageCount = 0;

    while (endpoint && pageCount < maxPages) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

        const res = await fetch(endpoint, { headers: DEFAULT_HEADERS, signal });

        if (!res.ok) {
            throw new Error(`Wikimedia API error: ${res.status} ${res.statusText}`);
        }

        let data = (await res.json()) as WikimediaHistoryResponse;
        data.revisions = data.revisions.map(r => ({ ...r, timestamp: new Date(r.timestamp) })).filter(r => r.user.name && r.user.id);
        console.log("New batch queried")
        // Yield this batch immediately
        yield { revisions: data.revisions, endpoint: data.older };

        // Prepare the next page URL if available
        if (data.older) {
            endpoint = data.older;
            await sleep(delayMs);
        } else {
            endpoint = '';
        }

        pageCount++;
    }
}