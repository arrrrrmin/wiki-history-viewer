<script lang="ts">
    import { parseWikipediaUrl, type WikiUrlParts } from "$lib/validation";
    import {
        hasRevisionsStore,
        revisionsStore,
        isLoadingStore,
    } from "$lib/stores/revisions";
    import { errorStore, hasErrorStore } from "$lib/stores/errors";
    import { parserStore, hasParsedStore } from "$lib/stores/parser";
    import { isMobileStore } from "$lib/stores/mobile";

    import * as errors from "$lib/validation.errors";
    import {
        fetchPageHistoryPaginated,
        // type WikimediaRevision,
    } from "$lib/queries";
    import { projectConfig, queryConfig } from "$lib/config";
    import { onDestroy } from "svelte";
    import WarningMessage from "$lib/components/WarningMessage.svelte";
    import DataOptions from "$lib/components/DataOptions.svelte";
    import Simpleline from "$lib/components/Simpleline.svelte";
    import { dataSettingsStore } from "$lib/stores/datasettings";
    import UserStats from "$lib/components/UserStats.svelte";

    let input: string = $state("");

    let controller: AbortController | null = null;

    function parseAction() {
        try {
            const parts = parseWikipediaUrl(input);
            parserStore.setParsed(parts.lang, parts.title);
            errorStore.reset();
        } catch (err) {
            if (err instanceof errors.WikipediaUrlError) {
                errorStore.setError(err.message);
            } else {
                // This could be send to a custom API endpoint for analytics purposes
                console.log("Unhandled error occured");
                console.log(err);
                errorStore.setError(
                    "Ok, sorry haven't seen this type of url so far.",
                );
            }
            parserStore.reset();
            revisionsStore.setLoading(false);
        }
    }

    async function performQueries(
        n: number,
        decay: number,
        controller: AbortController,
    ) {
        try {
            revisionsStore.setLoading(true);
            for await (const _ of fetchPageHistoryPaginated(
                $parserStore?.lang!,
                $parserStore?.title!,
                n,
                decay,
                controller.signal,
            )) {
            }
        } catch (err) {
            if (err instanceof Error) {
                errorStore.setError(err.message);
            } else {
                errorStore.setError(String(err));
            }
        } finally {
            revisionsStore.setLoading(false);
        }
    }

    async function handleFetch() {
        if ($isLoadingStore) return; // Avoid concurrent queries
        parserStore.reset();
        errorStore.reset();
        controller = new AbortController();
        parseAction();
        revisionsStore.reset();
        if ($hasParsedStore) {
            await performQueries(queryConfig.n, queryConfig.decay, controller);
        }
    }

    async function handleNext() {
        if (!$hasParsedStore) return; // No language or title provided
        if ($isLoadingStore) return; // Avoid concurrent queries
        controller = new AbortController();
        errorStore.reset();
        await performQueries(1, queryConfig.decay, controller);
    }

    function handleStop() {
        console.log("Stop clicked");
        controller?.abort();
    }

    // Cancel when component is destroyed
    onDestroy(() => {
        controller?.abort();
        parserStore.reset();
        errorStore.reset();
        revisionsStore.reset();
        dataSettingsStore.reset();
    });
</script>

<header>
    <div class="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            {projectConfig.title}
        </h1>
        <p class="text-xl/6 md:text-2xl/12">{projectConfig.description}</p>
    </div>
</header>
<main class="pt-4 md:pt-8 bg-white">
    <div class="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <h3 class="text-lg md:text-xl font-semibold text-gray-900">Usage</h3>
        <p
            class="mt-1 md:mt-2 pb-4 md:pb-8 max-w-4xl text-sm md:text-base text-gray-700"
        >
            {projectConfig.introduction}
        </p>
        <h3 class="text-lg md:text-xl font-semibold text-gray-900">Credits</h3>
        <p
            class="mt-1 md:mt-2 pb-4 md:pb-8 max-w-4xl text-sm md:text-base text-gray-700"
        >
            {projectConfig.credits}
            <br />
            This is an open source tool. If you want to check the source code you
            can do so:
            <a
                href={projectConfig.source.url}
                target="_blank"
                class="text-indigo-600">{projectConfig.source.name}</a
            >.
        </p>
        <p
            class="block md:hidden mt-1 md:mt-2 pb-4 md:pb-8 max-w-4xl text-sm md:text-base text-gray-700"
        >
            {#if $isMobileStore}
                The site is running in mobile mode. If you want to get more
                insight into the data tilt you'r device or use it on a desktop
                device.
            {/if}
        </p>
        <div class="mt-4">
            <form onsubmit={handleFetch}>
                <div class="mt-2 md:flex">
                    <label
                        for="input"
                        class="hidden md:flex shrink-0 items-center rounded-l-sm bg-white px-3 text-base text-gray-500 shadow-sm outline -outline-offset-1 outline-gray-300"
                    >
                        Wikipedia URL:
                    </label>

                    <input
                        id="email"
                        type="url"
                        name="input"
                        placeholder="Paste a Wikipedia URL"
                        class="block w-full rounded-sm md:rounded-l-none md:rounded-r-sm bg-white px-2 md:px-2 py-1.5 md:py-2 text-sm md:text-base text-gray-900 shadow-sm outline -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        bind:value={input}
                    />
                    <div class="mt-2 md:mt-0 md:ml-2 flex gap-2">
                        <button
                            type="submit"
                            class="rounded-md bg-indigo-600 px-2 md:px-2 py-0.5 md:py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >Show</button
                        >
                        <!-- Stop loading -->
                        {#if $isLoadingStore}
                            <button
                                type="button"
                                class="rounded-md bg-white px-2 md:px-2 py-1.5 md:py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                onclick={handleStop}
                                disabled={false}>Stop</button
                            >
                        {:else}
                            <button
                                type="button"
                                class="rounded-md bg-gray-300 px-2 md:px-2 py-1.5 md:py-2 text-sm font-semibold text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300"
                                disabled={true}>Stop</button
                            >
                        {/if}
                        {#if $hasRevisionsStore}
                            <!-- Load more -->
                            {#if $revisionsStore.hasMore && !$isLoadingStore}
                                <button
                                    type="button"
                                    class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 whitespace-nowrap"
                                    onclick={handleNext}
                                    disabled={false}>Load more</button
                                >
                            {:else}
                                <button
                                    type="button"
                                    class="rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 whitespace-nowrap"
                                    disabled={true}>Load more</button
                                >
                            {/if}
                        {/if}
                    </div>
                </div>
            </form>
        </div>
        {#if $hasErrorStore}
            <div class="pt-2">
                <WarningMessage message={$errorStore.message} />
            </div>
        {/if}
    </div>
    {#if $hasParsedStore && $hasRevisionsStore}
        <div class="mx-auto mt-8 max-w-6xl border-t-1 border-gray-200">
            <DataOptions />
            <Simpleline id="revoverview" isMobile={$isMobileStore} />
            <UserStats bind:input={input}/>
        </div>
    {/if}
</main>
