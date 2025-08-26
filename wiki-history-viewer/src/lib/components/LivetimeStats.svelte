<script lang="ts">
    import { apiCountLimits, type CountResponse } from "$lib/queries";
    import { pageStatsStore } from "$lib/stores/pagestats";

    const statisticalValue = (
        value: CountResponse | Object,
        key: string,
    ): string => {
        if ("count" in value) {
            return `${(value as CountResponse).count}`;
        }
        if (
            value instanceof Object &&
            "errorKey" in value &&
            value.errorKey == "rest-pagehistorycount-too-many-revisions"
        ) {
            return `${apiCountLimits[key]}+`;
        }
        return "-";
    };
</script>

<div class="m-auto max-w-4xl py-4 px-4 sm:px-6 lg:px-8">
    <div>
        <!-- svelte-ignore a11y_missing_content -->
        <h3 class="text-xl md:text-2xl font-semibold text-gray-900">
            Articles lifetime stats
        </h3>
    </div>
    <div>
        <dl class="grid sm:grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 mt-4">
            <div
                class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20"
            >
                <dt class="text-sm sm:text-base font-medium text-gray-900">Anonymous editors</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">
                    {statisticalValue($pageStatsStore.anonymous!, "anonymous")}
                </dd>
            </div>

            <div
                class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20"
            >
                <dt class="text-sm sm:text-base font-medium text-gray-900">Editing Bots</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">
                    {statisticalValue($pageStatsStore.bot!, "bot")}
                </dd>
            </div>

            <div
                class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20"
            >
                <dt class="text-sm sm:text-base font-medium text-gray-900">Account editors</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">
                    {statisticalValue($pageStatsStore.editors!, "editors")}
                </dd>
            </div>

            <div
                class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20"
            >
                <dt class="text-sm sm:text-base font-medium text-gray-900">Total edits</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">
                    {statisticalValue($pageStatsStore.edits!, "edits")}
                </dd>
            </div>

            <div
                class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20"
            >
                <dt class="text-sm sm:text-base font-medium text-gray-900">Minor edits</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">
                    {statisticalValue($pageStatsStore.minor!, "minor")}
                </dd>
            </div>

            <div
                class="py-2 px-2 text-gray-700 rounded ring-1 ring-inset ring-gray-600/20"
            >
                <dt class="text-sm sm:text-base font-medium text-gray-900">Reverted edits</dt>
                <dd class="text-2xl text-indigo-500 font-semibold">
                    {statisticalValue($pageStatsStore.reverted!, "reverted")}
                </dd>
            </div>
        </dl>
    </div>
</div>
