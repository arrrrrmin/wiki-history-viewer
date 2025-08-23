<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
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
	<div class="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8"></div>
</footer>
