<script lang="ts">
    import RevisionsSizeLine from "$lib/components/RevisionsSizeLine.svelte";
    import {
        fetchPageHistoryPaginated,
        type WikimediaRevision,
    } from "$lib/queries";
    import { parseWikipediaUrl, type WikiUrlParts } from "$lib/validation";
    import * as errors from "$lib/validation.errors";

    let input = $state("");
    let errorMsg = $state("");
    let result: WikiUrlParts | null = $state(null);
    let allRevisions: WikimediaRevision[] = $state([]);
    let loading = $state(false);

    let controller: AbortController | null = null;

    function parseAction() {
        try {
            result = parseWikipediaUrl(input);
            errorMsg = "";
        } catch (err) {
            if (err instanceof errors.WikipediaUrlError) {
                errorMsg = err.message;
            } else {
                console.log("Unhandled error occured");
                console.log(err);
                errorMsg = "Ok, sorry haven't seen this type of url so far.";
            }
            result = null;
        }
    }

    async function handleFetch() {
        if (loading) return; // Avoid multiple queries
        controller = new AbortController();
        errorMsg = "";
        allRevisions = [];
        loading = true;
        parseAction();
        if (result) {
            try {
                for await (const batch of fetchPageHistoryPaginated(
                    result.lang,
                    result.title,
                    10,
                    200,
                    controller.signal,
                )) {
                    allRevisions = [...allRevisions, ...batch];
                }
            } catch (err) {
                errorMsg = err instanceof Error ? err.message : String(err);
            } finally {
                loading = false;
            }
        }
    }

    function handleCancel() {
        controller?.abort();
    }

    // Cancel when component is destroyed
    import { onDestroy } from "svelte";
    onDestroy(() => {
        controller?.abort();
    });
</script>

<div>
    <h1>Welcome to SvelteKit</h1>

    <form onsubmit={handleFetch}>
        <input bind:value={input} placeholder="Paste a Wikipedia URL" />
        <button type="submit">Submit</button>
        <button onclick={handleCancel} disabled={!loading}>Cancel</button>
        {#if errorMsg}
            <p style="color: red">{errorMsg}</p>
        {/if}
        {#if result}
            <p>
                Querying the change history of '{result.title}' in language '{result.lang}'.
            </p>
        {/if}
    </form>

    {#if allRevisions.length > 0}
        <span>{allRevisions.length}</span>
        <RevisionsSizeLine
            id="rev-con"
            width={1200}
            height={600}
            bind:revisions={allRevisions}
        />
    {/if}
</div>
