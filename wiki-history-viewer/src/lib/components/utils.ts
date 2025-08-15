import type { WikimediaRevision } from "$lib/queries";
import * as d3 from "d3";

export function getRevisionDateRange(
    revisions: WikimediaRevision[]
): [Date, Date] {
    if (!revisions || revisions.length === 0) {
        const now = new Date();
        return [now, now];
    }

    const min = d3.min(revisions, d => new Date(d.timestamp))!;
    const max = d3.max(revisions, d => new Date(d.timestamp))!;

    return [min, max];
}
