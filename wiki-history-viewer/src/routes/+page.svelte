<script lang="ts">
    import { parseWikipediaUrl, type WikiUrlParts } from "$lib/validation";
    import * as errors from "$lib/validation.errors";
    import {
        fetchPageHistoryPaginated,
        type WikimediaRevision,
    } from "$lib/queries";
    import { projectConfig, queryConfig } from "$lib/config";
    import { onDestroy } from "svelte";
    import WarningMessage from "$lib/components/WarningMessage.svelte";
    import DataOptions from "$lib/components/DataOptions.svelte";
    import Simpleline from "$lib/components/Simpleline.svelte";
    import UserActivity from "$lib/components/UserActivity.svelte";

    let input = $state("");
    let loading = $state(false);
    let result: WikiUrlParts | null = $state(null);
    let errorMsg = $state("");

    let allRevisions: WikimediaRevision[] = $state([]);
    let nextEndpoint: string = $state("");

    // Options for data transformation
    let dataOptions = $state({
        allowMinors: true,
        allowUnknownEditors: true,
        filterMinValue: 0,
    });

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

    function handleStop() {
        console.log("Cancle clicked");
        controller?.abort();
    }

    // Cancel when component is destroyed
    onDestroy(() => {
        controller?.abort();
    });
</script>

<header>
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
            {projectConfig.title}
        </h1>
        <p class="text-2xl">{projectConfig.description}</p>
    </div>
</header>
<main class="pt-8">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h3 class="text-xl font-semibold text-gray-900">Usage</h3>
        <p class="mt-2 pb-8 max-w-4xl text-base text-gray-700">
            {projectConfig.introduction}
        </p>

        <div>
            <form onsubmit={handleFetch}>
                <div class="mt-2 flex">
                    <label
                        for="input"
                        class="flex shrink-0 items-center rounded-l-md bg-white px-3 text-base text-gray-500 shadow-sm outline -outline-offset-1 outline-gray-300 sm:text-sm/6"
                    >
                        Wikipedia URL:
                    </label>

                    <input
                        id="email"
                        type="url"
                        name="input"
                        placeholder="Paste a Wikipedia URL"
                        class="block w-full rounded-r-sm bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm outline -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        bind:value={input}
                    />
                    <div class="ml-2 flex gap-2">
                        <button
                            type="submit"
                            class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >Show</button
                        >
                        <!-- Stop loading -->
                        {#if !loading}
                            <button
                                type="button"
                                class="rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300"
                                disabled={true}>Stop</button
                            >
                        {:else}
                            <button
                                type="button"
                                class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                onclick={handleStop}
                                disabled={false}>Stop</button
                            >
                        {/if}
                        <!-- Load more -->
                        {#if (nextEndpoint === undefined || nextEndpoint === "") && loading}
                            <button
                                type="button"
                                class="rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 whitespace-nowrap"
                                disabled={true}>Load more</button
                            >
                        {:else}
                            <button
                                type="button"
                                class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 whitespace-nowrap"
                                onclick={handleNext}
                                disabled={false}>Load more</button
                            >
                        {/if}
                    </div>
                </div>
            </form>
        </div>
        {#if errorMsg}
            <div class="pt-2">
                <WarningMessage message={errorMsg} />
            </div>
        {/if}
    </div>
    {#if allRevisions && allRevisions.length > 0}
        <div class="mx-auto max-w-6xl mt-12 border-t-1 border-gray-200">
            <DataOptions bind:dataOptions />
            <UserActivity
                id="revuseractiv"
                {result}
                bind:revisions={allRevisions}
                bind:dataOptions
            />
            <Simpleline
                id="revoverview"
                {result}
                bind:revisions={allRevisions}
                bind:dataOptions
            />
            
            <!-- <Rideline
                id="revrideline"
                {result}
                bind:revisions={allRevisions}
                bind:dataOptions
            /> -->
        </div>
    {/if}
</main>
