<script lang="ts">
    import { dataSettingsStore } from "$lib/stores/datasettings";

    // All `setFilterMinValue` if needed, currently not used anyway
</script>

<div class="m-auto max-w-4xl mt-12 pb-12 px-4 sm:px-6 lg:px-8">
    <legend class="sr-only">Options</legend>
    <!-- allowMinors -->
    <div class="flex gap-3">
        <div
            class="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 outline-offset-2 outline-indigo-600 ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out has-[:checked]:bg-indigo-600 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 dark:bg-white/5 dark:outline-indigo-500 dark:ring-white/10 dark:has-[:checked]:bg-indigo-500"
        >
            <span
                class="relative size-5 rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-[:checked]:translate-x-5"
            >
                <span
                    aria-hidden="true"
                    class="absolute inset-0 flex size-full items-center justify-center opacity-100 transition-opacity duration-200 ease-in group-has-[:checked]:opacity-0 group-has-[:checked]:duration-100 group-has-[:checked]:ease-out"
                >
                    <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        class="size-3 text-gray-400 dark:text-gray-600"
                    >
                        <path
                            d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </span>
                <span
                    aria-hidden="true"
                    class="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-has-[:checked]:opacity-100 group-has-[:checked]:duration-200 group-has-[:checked]:ease-in"
                >
                    <svg
                        viewBox="0 0 12 12"
                        fill="currentColor"
                        class="size-3 text-indigo-600 dark:text-indigo-500"
                    >
                        <path
                            d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
                        />
                    </svg>
                </span>
            </span>
            <input
                type="checkbox"
                name="allowMinors"
                aria-label="Allow minor edits"
                checked
                onchange={dataSettingsStore.toggleAllowMinors}
                class="absolute inset-0 appearance-none focus:outline-none"
            />
        </div>
        <div class="text-sm/6">
            <label
                for="allowMinors"
                class="font-medium text-gray-900 dark:text-white"
                >Minor edits</label
            >
            <p
                id="allow-minors-description"
                class="text-gray-500 dark:text-gray-400 hidden"
            >
                Show minor edits
            </p>
        </div>
    </div>
    <!-- allowUnknownEditors -->
    <div class="flex gap-3 pt-2">
        <div
            class="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 outline-offset-2 outline-indigo-600 ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out has-[:checked]:bg-indigo-600 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 dark:bg-white/5 dark:outline-indigo-500 dark:ring-white/10 dark:has-[:checked]:bg-indigo-500"
        >
            <span
                class="relative size-5 rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-[:checked]:translate-x-5"
            >
                <span
                    aria-hidden="true"
                    class="absolute inset-0 flex size-full items-center justify-center opacity-100 transition-opacity duration-200 ease-in group-has-[:checked]:opacity-0 group-has-[:checked]:duration-100 group-has-[:checked]:ease-out"
                >
                    <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        class="size-3 text-gray-400 dark:text-gray-600"
                    >
                        <path
                            d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </span>
                <span
                    aria-hidden="true"
                    class="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-has-[:checked]:opacity-100 group-has-[:checked]:duration-200 group-has-[:checked]:ease-in"
                >
                    <svg
                        viewBox="0 0 12 12"
                        fill="currentColor"
                        class="size-3 text-indigo-600 dark:text-indigo-500"
                    >
                        <path
                            d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
                        />
                    </svg>
                </span>
            </span>
            <input
                type="checkbox"
                name="allowMinors"
                aria-label="Allow unknown/anonymous or banned users"
                checked
                onchange={dataSettingsStore.toggleAllowUnknownEditors}
                class="absolute inset-0 appearance-none focus:outline-none"
            />
        </div>
        <div class="text-sm/6">
            <label
                for="allowUnknownEditors"
                class="font-medium text-gray-900 dark:text-white"
                >Edits by anonymous or banned users</label
            >
            <p
                id="allow-unknown-editors-description"
                class="text-gray-500 dark:text-gray-400 hidden"
            >
                Allow unknown/anonymous or banned users
            </p>
        </div>
    </div>
</div>
