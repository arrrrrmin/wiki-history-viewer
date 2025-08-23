<script lang="ts">
    import {
        hasRevisionsStore,
        filteredRevisionsStore,
    } from "$lib/stores/revisions";
    // import type { WikimediaRevision } from "$lib/queries";
    
    const dateString = (d: Date): string => {
        return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    };
</script>

{#if $hasRevisionsStore}
    <div class="m-auto mt-8 md:max-w-full lg:max-w-6xl">
        <div class="px-0 sm:px-2 md:px-4 mt-8 -mx-0">
            <table class="divide-y divide-gray-300">
                <thead>
                    <tr>
                        <th
                            scope="col"
                            class="px-2 py-3 text-left text-md font-semibold text-gray-900 sm:pl-0"
                            >User</th
                        >
                        <th
                            scope="col"
                            class="hidden px-2 py-3 text-left text-md font-semibold text-gray-900 lg:table-cell"
                            >Date</th
                        >
                        <th
                            scope="col"
                            class="hidden px-2 py-3 text-left text-md font-semibold text-gray-900 sm:table-cell"
                            >Comment</th
                        >
                        <th
                            scope="col"
                            class="hidden px-2 py-3 text-left text-md font-semibold text-gray-900 md:table-cell"
                            >Minor</th
                        >
                        <th
                            scope="col"
                            class="hidden px-2 py-3 text-left text-md font-semibold text-gray-900 md:table-cell"
                            >Delta</th
                        >
                        <th
                            scope="col"
                            class="hidden px-2 py-3 text-left text-md font-semibold text-gray-900 md:table-cell"
                            >Size</th
                        >
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    {#each $filteredRevisionsStore.reverse() as revision}
                        <tr>
                            <td
                                class="w-auto px-2 py-2 text-sm font-medium text-gray-900 sm:pl-0"
                            >
                                <b class="font-bold">{revision.user.name}</b>
                                <dl class="font-normal lg:hidden">
                                    <dt class="sr-only">Date</dt>
                                    <dd
                                        class="mt-0.5 sm:mt-1 text-gray-500 flex"
                                    >
                                        <div class="pr-1 font-bold">Date:</div>
                                        {dateString(revision.timestamp)}
                                    </dd>
                                    <dt class="sr-only">Comment</dt>
                                    <dd
                                        class="mt-0.5 sm:mt-1 text-gray-500 break-all sm:break-normal sm:hidden"
                                    >
                                        <b class="font-bold break-keep"
                                            >Comment:</b
                                        >
                                        {revision.comment}
                                    </dd>
                                </dl>
                            </td>
                            <td
                                class="hidden px-2 py-2 text-sm text-gray-500 lg:table-cell"
                                >{revision.timestamp.toLocaleString(
                                    "en-US",
                                )}</td
                            >
                            <td
                                class="hidden sm:max-w-md md:max-w-md lg:max-w-lg px-2 py-2 truncate text-sm text-gray-500 sm:table-cell"
                                >{revision.comment}</td
                            >
                            <td
                                class="hidden px-2 py-2 text-sm text-gray-500 md:table-cell"
                            >
                                {#if revision.minor}
                                    <span
                                        class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"
                                    >
                                        minor</span
                                    >
                                {/if}
                            </td>
                            {#if revision.delta < 0}
                                <td
                                    class="hidden px-2 py-2 text-sm text-red-500 md:table-cell"
                                    >{revision.delta}</td
                                >
                            {:else}
                                <td
                                    class="hidden px-2 py-2 text-sm text-gray-500 md:table-cell"
                                    >{revision.delta}</td
                                >
                            {/if}
                            <td
                                class="hidden px-2 py-2 text-sm text-gray-500 whitespace-nowrap md:table-cell"
                                >{revision.size / 1000} KB</td
                            >
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
{/if}
