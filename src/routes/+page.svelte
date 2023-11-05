<script lang="ts">
	import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;

	let search1Text = '';
	let search2Text = '';

	let results1: string[] | undefined = undefined;
	let results2: string[] | undefined = undefined;

	let timer1: NodeJS.Timeout;
	let timer2: NodeJS.Timeout;

	let selectedValue1: string | undefined = undefined;
	let selectedValue2: string | undefined = undefined;

	async function handleSearch1() {
		clearTimeout(timer1);
		if (search1Text === '') {
			results1 = undefined;
			return;
		}

		// search through data for names matching search and add them to results
		await new Promise((resolve) => {
			results1 = [];
			data.recipes.forEach((recipe) => {
				if (recipe.toLowerCase().includes(search1Text.toLowerCase())) {
					results1!.push(recipe);
				}
			});
			// Trigger rerender
			results1 = results1;
			resolve(results1);
		});

		console.log(search1Text);
	}

	async function handleSearch2() {
		clearTimeout(timer2);
		if (search2Text === '') {
			results2 = undefined;
			return;
		}

		await new Promise((resolve) => {
			results2 = [];
			data.recipes.forEach((recipe) => {
				if (recipe.toLowerCase().includes(search2Text.toLowerCase())) {
					results2!.push(recipe);
				}
			});
			// Trigger rerender
			results2 = results2;
			resolve(results2);
		});

		console.log(search2Text);
	}
</script>

<div class="container mx-auto p-8 space-y-8">
	<form on:submit={handleSearch1}>
		<label class="label">
			<p>Search for a recipe</p>
			<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
				<div class="input-group-shim"><Fa icon={faMagnifyingGlass} /></div>
				<input
					type="search"
					placeholder="Search for a recipe..."
					on:keyup={() => {
						clearTimeout(timer1);
						timer1 = setTimeout(handleSearch1, 750);
					}}
					bind:value={search1Text}
				/>
				<button class="variant-filled-secondary">Submit</button>
			</div>
		</label>
	</form>

	{#if results1 !== undefined}
		<select
			class="select"
			size={Math.min(results1.length, 4)}
			bind:value={selectedValue1}
			transition:fade
		>
			{#each results1 as result}
				<option value={result} on:click={() => {}}>{result}</option>
			{:else}
				<option value={undefined} disabled selected>No results found</option>
			{/each}
		</select>
	{/if}

	<hr />

	<form on:submit={handleSearch2}>
		<label class="label">
			<p>Search for another recipe</p>
			<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
				<div class="input-group-shim"><Fa icon={faMagnifyingGlass} /></div>
				<input
					type="search"
					placeholder="Search for another recipe..."
					on:keyup={() => {
						clearTimeout(timer2);
						timer2 = setTimeout(handleSearch2, 750);
					}}
					bind:value={search2Text}
				/>
				<button class="variant-filled-secondary">Submit</button>
			</div>
		</label>
	</form>

	{#if results2 !== undefined}
		<select
			class="select"
			size={Math.min(results2.length, 4)}
			bind:value={selectedValue2}
			transition:fade
		>
			{#each results2 as result}
				<option value={result} on:click={() => {}}>{result}</option>
			{:else}
				<option value={undefined} disabled selected>No results found</option>
			{/each}
		</select>
	{/if}

	<hr />

	<button
		type="button"
		class="btn variant-soft-primary h-fit mx-auto uppercase font-semibold w-full"
		disabled={selectedValue1 === undefined || selectedValue2 === undefined}
		on:click={() => {}}
	>
		Fuse
	</button>

	<iframe
		src="https://lottie.host/?file=072c975a-c0de-42a0-baff-3d8835f31553/jCImVMpKrs.json"
		title="mixing animation"
		class="w-full h-96"
	/>
</div>
