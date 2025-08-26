<script lang="ts">
    import type { WikimediaRevision } from "$lib/queries";
    import { hasRevisionsStore, revisionsStore } from "$lib/stores/revisions";
    import { exportAsJSON, exportAsCSV } from "$lib/utils/download";

    const getRevisions = (): WikimediaRevision[] | undefined => {
        let revs;
        revisionsStore.subscribe((state) => {
            revs = state.revisions;
        });
        return revs;
    };
</script>

{#if $hasRevisionsStore}
    <div class="m-auto max-w-4xl mt-8 mb-8 px-4 sm:px-6 lg:px-8">
        <div>
            <p
                class="mt-1 md:mt-2 pb-4 md:pb-4 max-w-4xl text-sm md:text-base text-gray-700"
            >
                You can also download the data for local usage, further analysis
                or to build you'r own plots for example in <a
                    class="underline text-indigo-500"
                    target="_blank"
                    href="https://www.datawrapper.de">Datawrapper</a
                > or some other tool that you publish with. No matter the format,
                when you download filters are ignored and you'll download all the
                available data that you queried.
            </p>
        </div>
        <div class="flex gap-x-2">
            <div
                class="flex rounded-md bg-indigo-600 px-2 md:px-2 py-0.5 md:py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                <svg
                    class="w-6 h-6 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"
                    />
                </svg>

                <button onclick={() => exportAsJSON(getRevisions())}
                    >JSON</button
                >
            </div>
            <div
                class="flex rounded-md bg-indigo-600 px-2 md:px-2 py-0.5 md:py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                <svg
                    class="w-6 h-6 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"
                    />
                </svg>

                <button onclick={() => exportAsCSV(getRevisions())}>CSV</button>
            </div>
        </div>
    </div>
{/if}
