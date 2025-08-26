import type { WikimediaRevision } from "$lib/queries";

/**Download a file and provide a download url.
 * 
 * @param data: Json stringified list of WikimediaRevision
 * @param filename: File to write to
 * @param type: Extension
 */
export function downloadFile(data: string, filename: string, type: string) {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/** User exports a json file for download from the queried data.
 * 
 * @param revisions List of WikimediaRevision which should come from the corresponding svelte store
 */
export function exportAsJSON(revisions?: WikimediaRevision[]) {
    if (!revisions) return;
    const jsonString = JSON.stringify(revisions, null, 4);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(jsonString, `wikipedia_revisions_${timestamp}.json`, 'application/json');
}

/** User exports a csv file for download from the queried data.
 * 
 * @param revisions List of WikimediaRevision which should come from the corresponding svelte store
 */
export function exportAsCSV(revisions?: WikimediaRevision[]) {
    if (!revisions) return;
    const header = ['id', 'timestamp', 'minor', 'size', 'comment', 'userId', 'userName', 'delta'];
    const rows = revisions.map(r => [
        r.id,
        r.timestamp.toISOString(),
        r.minor,
        r.size,
        r.comment ? `"${r.comment.replace(/"/g, '""')}"` : '',
        r.user.id,
        r.user.name,
        r.delta
    ]);

    const csv = [header.join(','), ...rows.map(row => row.join(','))].join('\n');
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csv, `wikipedia_revisions_${timestamp}.csv`, 'text/csv');
}
