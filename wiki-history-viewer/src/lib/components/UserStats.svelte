<script lang="ts">
    import { userRevisionsStore } from "$lib/stores/revisions";

    let { input = $bindable() } = $props();
    let url = new URL(input.trim());

    const dateString = (d: Date): string => {
        // return `${d.getFullYear()}/${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${d.getMinutes()}`;
        return d
            .toISOString()
            .replace("T", " ")
            .replace(/(\:\d\d\.\d\d\dZ)/, "");
    };

    const getUserSite = (user: string): string => {
        const project = url.pathname.split("/")[1];
        const userPath = `User:${encodeURIComponent(user)}`;
        return `${url.origin}/${project}/${userPath}`;
    };
</script>

<div class="m-auto max-w-4xl py-4 px-4 sm:px-6 lg:px-8">
    <!-- svelte-ignore a11y_missing_content -->
    <h3 class="text-xl md:text-2xl font-semibold text-gray-900">
        User Activity Leaderboard
    </h3>
</div>
<ul
    role="list"
    class="grid grid-cols-1 gap-4 pl-4 sm:px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
>
    {#each $userRevisionsStore.slice(0, 15) as userRevisions}
        <li
            class="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
        >
            <div class="flex flex-1 flex-col p-3">
                <dl class="mt-1 grid grid-col-1">
                    <div
                        class="flex gap-x-2 pb-1 items-baseline w-full truncate"
                    >
                        <a
                            href={getUserSite(userRevisions.name)}
                            class="underline text-indigo-500 hover:text-gray-900 whitespace-nowrap"
                            target="_blank"
                        >
                            <h4 class="text-sm font-medium">
                                {userRevisions.name}
                            </h4>
                        </a>
                    </div>
                    <div class="flex gap-x-2 items-baseline">
                        <dt class="text-sm text-gray-900 whitespace-nowrap">
                            First article edit
                        </dt>
                        <dd class="text-sm text-gray-500">
                            <span
                                class="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20"
                                >{userRevisions.since
                                    ? dateString(userRevisions.since)
                                    : ""}</span
                            >
                        </dd>
                    </div>
                    <div class="flex gap-x-2 items-baseline">
                        <dt class="text-sm text-gray-900 whitespace-nowrap">
                            Edited
                        </dt>
                        <dd class="text-sm text-gray-500">
                            <span
                                class="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20"
                                >{`${userRevisions.total} KB`}</span
                            >
                        </dd>
                    </div>
                    <div class="flex gap-x-2 items-baseline">
                        <dt class="text-sm text-gray-900 whitespace-nowrap">
                            Count/Minor
                        </dt>
                        <dd class="text-sm text-gray-500">
                            <span
                                class="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                                >{userRevisions.count}</span
                            >/<span
                                class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                                >{userRevisions.minorCount}</span
                            >
                        </dd>
                    </div>
                </dl>
            </div>
        </li>
    {/each}
</ul>
