<script lang="ts">
    import { parseWikipediaUrl, type WikiUrlParts } from "$lib/validation";
    import * as errors from "$lib/validation.errors";
    import {
        fetchPageHistoryPaginated,
        type WikimediaRevision,
    } from "$lib/queries";
    import { projectConfig, queryConfig } from "$lib/config";
    import { onDestroy } from "svelte";
    import Rideline from "$lib/components/Rideline.svelte";

    interface InputState {
        input: string;
        loading: boolean;
        result: WikiUrlParts | null;
        errorMsg: string;
    }

    let input = $state("");
    let loading = $state(false);
    let result: WikiUrlParts | null = $state(null);
    let errorMsg = $state("");

    let allRevisions: WikimediaRevision[] = $state([]);
    let nextEndpoint: string = $state("");

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
            loading = false;
        }
    }

    async function performQueries(
        lang: string,
        title: string,
        n: number,
        decay: number,
        controller: AbortController,
    ) {
        try {
            for await (const {
                revisions,
                endpoint,
            } of fetchPageHistoryPaginated(
                lang,
                title,
                n,
                decay,
                controller.signal,
            )) {
                nextEndpoint = endpoint;
                allRevisions = [...allRevisions, ...revisions];
            }
        } catch (err) {
            errorMsg = err instanceof Error ? err.message : String(err);
        } finally {
            loading = false;
        }
    }

    async function handleFetch() {
        if (loading) return; // Avoid concurrent queries
        errorMsg = "";
        loading = true;
        controller = new AbortController();
        parseAction();
        allRevisions = [];
        if (result) {
            await performQueries(
                result.lang,
                result.title,
                queryConfig.n,
                queryConfig.decay,
                controller,
            );
        }
    }

    async function handleNext() {
        if (!result) return; // No language or title provided
        if (loading) return; // Avoid concurrent queries
        if (!controller) return; // Controller is set on initial load
        errorMsg = "";
        loading = true;
        controller = new AbortController();
        for await (const { revisions, endpoint } of fetchPageHistoryPaginated(
            result.lang,
            result.title,
            1,
            queryConfig.decay,
            controller.signal,
            nextEndpoint,
        )) {
            nextEndpoint = endpoint;
            allRevisions = [...allRevisions, ...revisions];
        }
        loading = false;
    }

    function handleCancel() {
        controller?.abort();
    }

    // Cancel when component is destroyed
    onDestroy(() => {
        controller?.abort();
    });
</script>

<div>
    <h1>Welcome to {projectConfig.title}</h1>
    <p>{projectConfig.description}</p>

    <h2>Usage</h2>
    <p>{projectConfig.introduction}</p>
    <h2>Credits</h2>
    <p>
        {projectConfig.credits}
        <br />
        This is an open source tool. If you want to check the source code you can
        do so:
        <a href={projectConfig.source.url} target="_blank"
            >{projectConfig.source.name}</a
        >.
    </p>

    <form onsubmit={handleFetch}>
        <input bind:value={input} placeholder="Paste a Wikipedia URL" />
        <button type="submit">Submit</button>
    </form>
    <button onclick={handleCancel} disabled={!loading}>Cancel</button>
    <button onclick={handleNext} disabled={loading || allRevisions.length == 0}
        >Next</button
    >
    {#if errorMsg}
        <p style="color: red">{errorMsg}</p>
    {/if}
    {#if result}
        <p>
            Querying the change history of '{result.title}' in language '{result.lang}'.
        </p>
    {/if}

    {#if allRevisions && allRevisions.length > 0}
        <Rideline id="rev-con" bind:revisions={allRevisions} />
    {/if}
</div>
