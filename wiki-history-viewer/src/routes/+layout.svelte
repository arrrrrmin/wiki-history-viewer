<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { projectConfig } from "$lib/config";
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-white">
	<div class="py-10">
		{@render children?.()}
	</div>
</div>
<footer class="border-t-1 border-gray-400">
	<div class="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
		<h3 class="text-xl font-semibold text-gray-900">Credits</h3>
		<p class="mt-2 max-w-4xl text-base text-gray-700">
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
	</div>
</footer>
