<script lang="ts">
    import { onDestroy } from "svelte";

    import { parseWikipediaUrl } from "$lib/validation";
    import {
        hasRevisionsStore,
        revisionsStore,
        isLoadingStore,
    } from "$lib/stores/revisions";
    import { errorStore } from "$lib/stores/errors";
    import { parserStore, hasParsedStore } from "$lib/stores/parser";
    import { dataSettingsStore } from "$lib/stores/datasettings";
    import { isMobileStore } from "$lib/stores/mobile";
    import { pageStatsStore } from "$lib/stores/pagestats";

    import * as errors from "$lib/validation.errors";
    import {
        fetchPageHistoryPaginated,
        fetchPageStatistics,
        type PageStatistics,
    } from "$lib/queries";
    import { projectConfig, queryConfig } from "$lib/config";
    import WarningMessage from "$lib/components/WarningMessage.svelte";
    import LifetimeState from "$lib/components/LivetimeStats.svelte";
    import DataOptions from "$lib/components/DataOptions.svelte";
    import Simpleline from "$lib/d3js/Simpleline.svelte";
    import UserStats from "$lib/components/UserStats.svelte";
    import Download from "$lib/components/Download.svelte";
    import { isLoggedIn } from "$lib/stores/user";

    let input: string = $state("");

    let controller: AbortController | null = null;

    function parseAction() {
        try {
            const parts = parseWikipediaUrl(input);
            parserStore.setParsed(parts.lang, parts.project, parts.title);
            errorStore.reset();
        } catch (err) {
            if (err instanceof errors.WikipediaUrlError) {
                errorStore.setError(err);
            } else {
                // This could be send to a custom API endpoint for analytics purposes
                console.log("Unhandled error occured");
                console.log(err);
                errorStore.setError(
                    new errors.WikipediaUrlError(`Unknown error: ${err}`),
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
        next: boolean = false,
    ) {
        try {
            revisionsStore.setLoading(true);
            // Query basic page statistics
            if (!next) {
                // Only perform this query on initial load
                const pageStatistics: PageStatistics =
                    await fetchPageStatistics(
                        $parserStore?.project!,
                        $parserStore?.lang!,
                        $parserStore?.title!,
                        controller.signal,
                    );
                pageStatsStore.set(pageStatistics);
                pageStatsStore.subscribe((state) => console.log(state));
            }
            for await (const _ of fetchPageHistoryPaginated(
                $parserStore?.project!,
                $parserStore?.lang!,
                $parserStore?.title!,
                n,
                decay,
                controller.signal,
            )) {
            }
        } catch (err) {
            if (err instanceof errors.WikipediaUrlError) {
                errorStore.setError(err);
            } else {
                errorStore.setError(
                    new errors.WikipediaUrlError(`Unknown error: ${err}`),
                );
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
        await performQueries(1, queryConfig.decay, controller, true);
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
            >. Additionally when you'r logged in with your wikimedia account
            (the same account you use to edit), you get to <b>download</b> the
            queried data or get some <b>article lifetime stats</b>
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
                        id="input"
                        type="url"
                        name="input"
                        placeholder="Paste a Wikipedia URL"
                        class="block w-full rounded-sm md:rounded-l-none md:rounded-r-sm bg-white px-2 md:px-2 py-1.5 md:py-2 text-sm md:text-base text-gray-900 shadow-sm outline -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        bind:value={input}
                    />
                    <div class="mt-2 md:mt-0 md:ml-2 flex gap-2">
                        <button
                            type="submit"
                            class="flex items-center rounded-md bg-indigo-600 px-2 md:px-2 py-0.5 md:py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {#if $isLoadingStore}
                                <svg
                                    aria-hidden="true"
                                    role="status"
                                    class="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="#1C64F2"
                                    />
                                </svg>
                            {/if}
                            Show</button
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
        <WarningMessage />
    </div>
    {#if $hasParsedStore && $hasRevisionsStore}
        {#if isLoggedIn}
            <div
                class="mx-auto mt-4 sm:mt-8 max-w-6xl border-t-1 border-gray-200"
            >
                <LifetimeState />
            </div>
        {/if}
        <div class="mx-auto mt-4 sm:mt-8 max-w-6xl border-t-1 border-gray-200">
            <DataOptions />
        </div>
        <div class="mx-auto mt-4 sm:mt-8 max-w-6xl border-t-1 border-gray-200">
            <Simpleline id="revoverview" isMobile={$isMobileStore} />
        </div>
        {#if isLoggedIn}
            <div
                class="mx-auto mt-4 sm:mt-8 max-w-6xl border-t-1 border-gray-200"
            >
                <Download />
            </div>
        {/if}
        <div class="mx-auto mt-4 sm:mt-8 max-w-6xl border-t-1 border-gray-200">
            <UserStats bind:input />
        </div>
    {/if}
</main>
