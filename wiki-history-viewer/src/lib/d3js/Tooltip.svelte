<script lang="ts">
    import * as d3 from "d3";
    import * as utils from "$lib/d3js/utils";

    let { id, selectRevision = $bindable() } = $props();

    const closeTooltip = () => {
        d3.select(`div#${id}-tooltip`).attr("class", "hidden bg-white/50");
    };
</script>

<div class="relative items-center justify-center">
    <div id={`${id}-tooltip`}>
        {#if selectRevision}
            <div class="flex justify-between">
                <div>
                    {#if selectRevision.prevId !== undefined}
                        <a
                            href={utils.getDiffUrl(selectRevision)}
                            class="underline text-indigo-500 hover:text-gray-900 whitespace-nowrap"
                            target="_blank"
                        >
                            <h4 class="text-base font-medium">See the diff</h4>
                        </a>
                    {:else}
                        <h4 class="text-base font-medium">See the diff</h4>
                    {/if}
                </div>
                <button
                    aria-label="close tooltip"
                    onclick={closeTooltip}
                    class="flex items-center rounded ring-1 ring-inset ring-gray-600/20 hover:ring-gray-600/50"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
            <div class="grid grid-cols-1">
                <div class="flex gap-x-2 items-baseline text-sm">
                    <span class="text-gray-900 whitespace-nowrap">User</span>
                    <span
                        class="inline-flex items-center rounded-md text-gray-700 bg-gray-50 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-gray-600/20"
                        >{selectRevision.username}</span
                    >
                </div>
                <div class="flex gap-x-2 items-baseline text-sm">
                    <span class="text-gray-900 whitespace-nowrap"
                        >Current Id</span
                    >
                    <span
                        class="inline-flex items-center rounded-md text-gray-700 bg-gray-50 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-gray-600/20"
                        >{selectRevision.currId}</span
                    >
                </div>
                <div class="flex gap-x-2 items-baseline text-sm">
                    <span class="text-gray-900 whitespace-nowrap"
                        >Previous Id</span
                    >
                    <span
                        class="inline-flex items-center rounded-md text-gray-700 bg-gray-50 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-gray-600/20"
                        >{selectRevision.prevId}</span
                    >
                </div>
                <div class="flex gap-x-2 items-baseline text-sm">
                    <span class="text-gray-900 whitespace-nowrap"
                        >Minor/Delta</span
                    >
                    <div class="flex items-center justify-center">
                        <span
                            id={`${id}-minor-span`}
                            class="inline-flex items-center rounded-md text-gray-700 bg-yellow-50 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-yellow-600/20"
                            >{selectRevision.minor}</span
                        >/
                        <span
                            id={`${id}-delta-span`}
                            class="inline-flex items-center rounded-md text-gray-700 bg-gray-50 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-gray-600/20"
                            >{selectRevision.delta}</span
                        >
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
