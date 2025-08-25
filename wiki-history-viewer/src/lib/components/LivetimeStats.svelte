<script lang="ts">
    import { pageStatsStore } from "$lib/stores/pagestats";
</script>

<div class="m-auto max-w-4xl py-4 px-4 sm:px-6 lg:px-8">
    <div>
        <!-- svelte-ignore a11y_missing_content -->
        <h3 class="text-xl md:text-2xl font-semibold text-gray-900">
            Articles lifetime stats
        </h3>
    </div>
    <div>
        <dl class="grid grid-cols-3 gap-2 mt-4">
            <div class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20">
                <dt class="font-medium text-gray-900">Anonymous editors</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">{$pageStatsStore.anonymous!.count}</dd>
            </div>

            <div class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20">
                <dt class="font-medium text-gray-900">Editing Bots</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">{$pageStatsStore.bot!.count}</dd>
            </div>

            <div class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20">
                <dt class="font-medium text-gray-900">Account editors</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">{$pageStatsStore.editors!.count}</dd>
            </div>

            <div class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20">
                <dt class="font-medium text-gray-900">Total edits</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">{$pageStatsStore.edits!.count}</dd>
            </div>

            <div class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20">
                <dt class="font-medium text-gray-900">Minor edits</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">{$pageStatsStore.minor!.count}</dd>
            </div>

            <div class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20">
                <dt class="font-medium text-gray-900">Reverted edits</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">{$pageStatsStore.reverted!.count}</dd>
            </div>
        </dl>
    </div>
</div>
