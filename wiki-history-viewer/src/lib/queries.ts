import { isLoggedIn, userStore } from "$lib/stores/user";
import { revisionsStore } from "$lib/stores/revisions";
import mockData from "../mocks/api-response.json";
import { WikimediaAPIAccountError } from "./validation.errors";
import { parserStore } from "./stores/parser";

const USERAGENT_NAME = "WikiHistoryViewer/1.0"
const USERAGENT_MAIL_ALIAS = "wikihistoryview.reload331@passinbox.com";

//@ts-ignore
const useMock = __MOCK_RESPONSE__ === 'true';

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
    input: RequestInfo | URL, init?: RequestInit, pageCount?: number
): Promise<{ revisions: WikimediaRevision[], continueKey: (string | null) }> {

    if (useMock && pageCount !== undefined) {
        const mockedResponse = mockData["responses"][pageCount];
        let revisions = mockedResponse["revisions"].map(d => ({ ...d, timestamp: new Date(d.timestamp) } as WikimediaRevision));
        let continueKey = mockedResponse["older"];
        return { revisions, continueKey }
    } else {
        const res = (await fetch(input, init));
        if (!res.ok) {
            let username;
            userStore.subscribe((state) => username = state?.name)
            let lang;
            let project;
            parserStore.subscribe((state) => {
                lang = state?.lang;
                project = state?.project;
            })
            throw new WikimediaAPIAccountError(username, project, lang)
        }
        let data = (await res.json()) as WikimediaHistoryResponse
        return { revisions: data.revisions, continueKey: data.older };
    }
}

const constructHeader = () => {
    let token;
    userStore.subscribe(state => { token = state?.access_token as string });
    let headers: Record<string, string> = {
        'Accept': 'application/json',
        'Api-User-Agent': `${USERAGENT_NAME} (${USERAGENT_MAIL_ALIAS})`
    };
    if (isLoggedIn && token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    return headers;
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

        let { revisions, continueKey } = await fetchNextBatch(endpoint, { headers: constructHeader(), signal }, pageCount);
        revisionsStore.append(revisions, continueKey)

        // Yield this batch immediately
        yield { revisions, continueKey };
        await sleep(delayMs);

        // Update loop condition variables
        revisionsStore.subscribe(state => { endpoint = state.continueKey; });
        pageCount++;
    }
}