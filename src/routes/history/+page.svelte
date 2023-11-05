<script lang="ts">
	import { previousFusions } from '$lib/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	let fusions = data.fusions as unknown as string[];

	let parsedFusions: { title: string; image: string }[] = [];

	$: if ($previousFusions || fusions) {
		parsedFusions = [
			...$previousFusions,
			...fusions.map((fusion) => {
				return JSON.parse(fusion);
			}),
		].filter(
			(fusion, index, self) => index === self.findIndex((t) => t.title === fusion.title)
		);
	}

	console.log(data);
	console.log(parsedFusions);
</script>

<div class="container mx-auto p-8 space-y-8 w-full">
	<h1 class="h1">History</h1>
	<section class="grid grid-cols-2 md:grid-cols-3 gap-4">
		{#each parsedFusions as fusion}
			<div class="fusion w-fit h-auto flex flex-col gap-2">
				<h3 class="h3 font-semibold">{fusion.title}</h3>
				<img
					src="data:image/png;base64,{fusion.image}"
					alt={fusion.title}
					class="aspect-square rounded-lg"
				/>
			</div>
		{:else}
			<p class="text-center">
				No previous Fusions
				<a href="/" class="underline text-primary-500">Make Some Here</a>
			</p>
		{/each}
	</section>
</div>
