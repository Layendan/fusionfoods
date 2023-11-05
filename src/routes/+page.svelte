<script lang="ts">
	import { previousFusions } from '$lib/stores';
	import {
		faMagnifyingGlass,
		faRotate,
		faRotateRight,
		faShuffle,
	} from '@fortawesome/free-solid-svg-icons';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { Confetti } from 'svelte-confetti';
	import Fa from 'svelte-fa';
	import { blur, fade } from 'svelte/transition';
	import type { Recipe, RecipeData } from '../lib/types';
	import type { PageData } from './$types';
	import Semaphore from '$lib/Semaphore';

	export let data: PageData;

	const toastStore = getToastStore();
	const semaphore = new Semaphore<Response>(1, 2000);

	let search1Text = '';
	let search2Text = '';

	let results1: Recipe[] | undefined = undefined;
	let results2: Recipe[] | undefined = undefined;

	let timer1: NodeJS.Timeout;
	let timer2: NodeJS.Timeout;

	let selectedValue1: Recipe | undefined = undefined;
	let selectedValue2: Recipe | undefined = undefined;

	let recipe1: (RecipeData & { image: string }) | undefined = undefined;
	let recipe2: (RecipeData & { image: string }) | undefined = undefined;
	let customRecipe: (RecipeData & { image: string }) | undefined = undefined;

	let stage = 0;

	let isHidden = true;

	async function handleSearch1() {
		clearTimeout(timer1);
		const temp = search1Text.trim();
		if (temp.length < 3) {
			results1 = undefined;
			return;
		}

		// search through data for names matching search and add them to results
		await new Promise((resolve) => {
			results1 = [];
			data.recipes.forEach((recipe) => {
				if (recipe.title.toLowerCase().includes(temp.toLowerCase())) {
					results1!.push(recipe);
				}
			});
			// Trigger rerender
			results1 = results1;
			resolve(results1);
		});

		console.log(temp);
	}

	async function handleSearch2() {
		clearTimeout(timer2);
		const temp = search2Text.trim();
		if (temp.length < 3) {
			results2 = undefined;
			return;
		}

		await new Promise((resolve) => {
			results2 = [];
			data.recipes.forEach((recipe) => {
				if (recipe.title.toLowerCase().includes(temp.toLowerCase())) {
					results2!.push(recipe);
				}
			});
			// Trigger rerender
			results2 = results2;
			resolve(results2);
		});

		console.log(temp);
	}

	async function fuse() {
		stage = 1;
		try {
			console.log(selectedValue1, selectedValue2);
			const [response0, response1] = await Promise.all([
				fetch(`/api?id=${selectedValue1!.id}`),
				fetch(`/api?id=${selectedValue2!.id}`),
			]);
			const [tempRecipe1, tempRecipe2] = await Promise.all([
				response0.json(),
				response1.json(),
			]);
			console.log(tempRecipe1, tempRecipe2);
			const [aiResponse1, aiResponse2, tempCustomRecipe] = await Promise.all([
				semaphore.callFunction(() => {
					return fetch(`/api/generate`, {
						method: 'POST',
						body: JSON.stringify({
							prompt: `Create an image representation of this recipe called ${
								tempRecipe1!.title
							}, following the directions ${tempRecipe1!.directions}`,
						}),
					});
				}, ''),
				semaphore.callFunction(() => {
					return fetch(`/api/generate`, {
						method: 'POST',
						body: JSON.stringify({
							prompt: `Create an image representation of this recipe called ${
								tempRecipe2!.title
							}, following the directions ${tempRecipe2!.directions}`,
						}),
					});
				}, ''),
				semaphore.callFunction(() => {
					return fetch(`/api/generateCustom`, {
						method: 'POST',
						body: JSON.stringify({ recipe1: tempRecipe1, recipe2: tempRecipe2 }),
					});
				}, ''),
			]);

			const timer = new Promise((resolve) => {
				setTimeout(() => {
					resolve(null);
				}, 1000);
			});

			recipe1 = { ...tempRecipe1, image: await aiResponse1.text() };
			recipe2 = { ...tempRecipe2, image: await aiResponse2.text() };
			const parsedCustomRecipe = await tempCustomRecipe.json();
			console.log('parsedCustomRecipe', parsedCustomRecipe);

			await timer;

			const customRecipeImage = await fetch(`/api/generate`, {
				method: 'POST',
				body: JSON.stringify({
					prompt: `Create an image representation of this recipe called ${parsedCustomRecipe.title}, following the directions ${parsedCustomRecipe.directions}`,
				}),
			});

			console.log('customRecipeImage', customRecipeImage);
			customRecipe = {
				...parsedCustomRecipe,
				image: await customRecipeImage.text(),
			} as RecipeData & { image: string };

			console.log(recipe1, recipe2, customRecipe);

			if (recipe1 === undefined || recipe2 === undefined || customRecipe === undefined) {
				throw new Error('Something went wrong');
			}

			stage = 2;
		} catch (e) {
			console.error(e);
			const t: ToastSettings = {
				message: String(e),
				background: 'variant-filled-error',
				hoverable: true,
			};
			toastStore.trigger(t);
			results1 = undefined;
			results2 = undefined;
			selectedValue1 = undefined;
			selectedValue2 = undefined;
			recipe1 = undefined;
			recipe2 = undefined;
			stage = 0;
			isHidden = true;
		}
		previousFusions.update((fusions) => {
			if (
				customRecipe &&
				customRecipe.title &&
				customRecipe.directions &&
				customRecipe.image &&
				customRecipe.ingredients
			) {
				fusions.push({
					title: customRecipe.title,
					directions: customRecipe.directions,
					image: customRecipe.image,
					ingredients: customRecipe.ingredients,
				});
			}
			return fusions;
		});

		if (customRecipe?.title && customRecipe?.image)
			console.log(
				await fetch('/api/saveFusion', {
					method: 'POST',
					body: JSON.stringify({
						title: customRecipe.title,
						image: encodeURIComponent(customRecipe.image),
					}),
				})
			);
	}

	function clearData() {
		search1Text = '';
		search2Text = '';
		results1 = undefined;
		results2 = undefined;
		selectedValue1 = undefined;
		selectedValue2 = undefined;
		recipe1 = undefined;
		recipe2 = undefined;
		stage = 0;
		isHidden = true;
	}

	function onImageError(e: Event) {
		const target = e.target as HTMLImageElement;
		target.src = '/logo.png';
	}
</script>

<div class="container mx-auto p-8 space-y-8">
	{#if stage === 0}
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
							timer1 = setTimeout(handleSearch1, 200);
						}}
						bind:value={search1Text}
					/>
					<button class="variant-filled-secondary" disabled={search1Text.length < 3}>
						Search
					</button>
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
				{#each results1 || [] as result, i (result.id)}
					<option value={result} selected={results1.length === 1} on:click={() => {}}>
						{result.title}
					</option>
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
							timer2 = setTimeout(handleSearch2, 200);
						}}
						bind:value={search2Text}
					/>
					<button class="variant-filled-secondary" disabled={search2Text.length < 3}>
						Search
					</button>
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
				{#each results2 || [] as result (result.id)}
					<option value={result} selected={results2.length === 1} on:click={() => {}}>
						{result.title}
					</option>
				{:else}
					<option value={undefined} disabled selected>No results found</option>
				{/each}
			</select>
		{/if}

		<hr />

		<div class="flex gap-2">
			<button
				type="button"
				class="btn variant-filled-primary h-fit mx-auto uppercase font-semibold w-full"
				disabled={selectedValue1 === undefined || selectedValue2 === undefined}
				on:click={fuse}
			>
				<span><Fa icon={faRotate} /></span>
				<span>Fuse</span>
			</button>
			<button
				type="button"
				class="btn variant-soft-secondary h-fit mx-auto uppercase font-semibold w-full"
				on:click={() => {
					selectedValue1 = data.recipes[Math.floor(Math.random() * data.recipes.length)];
					selectedValue2 = data.recipes[Math.floor(Math.random() * data.recipes.length)];
					fuse();
				}}
			>
				<span><Fa icon={faShuffle} /></span>
				<span>Random Fusion</span>
			</button>
		</div>
	{:else if stage === 1}
		<iframe
			src="https://lottie.host/?file=072c975a-c0de-42a0-baff-3d8835f31553/jCImVMpKrs.json"
			title="fusing"
			class="w-full h-96"
			in:fade
		/>
	{:else if stage === 2 && recipe1 && recipe2 && customRecipe}
		<div class="grid grid-cols-2 grid-rows-1 gap-4" in:fade>
			<div class="flex flex-col gap-4">
				<h2 class="text-center h2 font-semibold">{recipe1.title}</h2>
				<img
					src="data:image/png;base64,{recipe1.image}"
					alt={recipe1.title}
					class="w-full h-fit aspect-square rounded-lg object-cover"
					on:error={onImageError}
					in:blur={{ opacity: 1, delay: 400, amount: 12 }}
				/>
				<section class="w-full h-fit card p-4 space-y-4 text-center">
					<p class="font-bold text-left">Ingredients</p>
					<ul class="list text-token">
						{#each recipe1.ingredients || [] as ingredient}
							<li>
								<span class="flex-auto">
									{ingredient}
								</span>
							</li>
						{/each}
					</ul>
				</section>
				<section class="w-full h-fit card p-4 space-y-4 text-center">
					<p class="font-bold text-left">Directions</p>
					<ol class="list text-token">
						{#each recipe1.directions || [] as direction, i}
							<li>
								<span class="badge-icon p-4 variant-soft-secondary">
									{i + 1}
								</span>
								<span class="flex-auto">
									{direction}
								</span>
							</li>
						{/each}
					</ol>
				</section>
			</div>
			<div class="flex flex-col gap-4">
				<h2 class="text-center h2 font-semibold">{recipe2.title}</h2>
				<img
					src="data:image/png;base64,{recipe2.image}"
					alt={recipe2.title}
					class="w-full h-fit aspect-square rounded-lg object-cover"
					on:error={onImageError}
					in:blur={{ opacity: 1, delay: 400, amount: 12 }}
				/>
				<section class="w-full h-fit card p-4 space-y-4 text-center">
					<p class="font-bold text-left">Ingredients</p>
					<ul class="list text-token">
						{#each recipe2.ingredients || [] as ingredient}
							<li>
								<span class="flex-auto">
									{ingredient}
								</span>
							</li>
						{/each}
					</ul>
				</section>
				<section class="w-full h-fit card p-4 space-y-4 text-center">
					<p class="font-bold text-left">Directions</p>
					<ol class="list text-token">
						{#each recipe2.directions || [] as direction, i}
							<li>
								<span class="badge-icon p-4 variant-soft-secondary">
									{i + 1}
								</span>
								<span class="flex-auto">
									{direction}
								</span>
							</li>
						{/each}
					</ol>
				</section>
			</div>
		</div>

		<hr />

		<div>
			<button class="relative w-full" on:click={() => (isHidden = !isHidden)}>
				<div
					class="grid grid-cols-2 w-full gap-4 transition-all duration-500"
					class:blur-md={isHidden}
					class:brightness-50={isHidden}
				>
					<div class="flex flex-col gap-4">
						<img
							src="data:image/png;base64,{customRecipe.image}"
							alt={customRecipe.title}
							class="w-full aspect-square rounded-lg"
							on:error={onImageError}
						/>
						<ul class="list text-token w-full h-fit card p-4 space-y-4">
							{#each customRecipe.ingredients || [] as ingredient}
								<li>
									<span class="flex-auto">
										{ingredient}
									</span>
								</li>
							{/each}
						</ul>
					</div>
					<div class="flex flex-col gap-4">
						<h2 class="text-center h2 font-semibold">{customRecipe.title}</h2>
						<ol class="list text-token card p-4 space-y-4">
							{#each customRecipe.directions || [] as direction, i (direction)}
								<li>
									<span class="badge-icon p-4 variant-soft-primary">
										{i + 1}
									</span>
									<span class="flex-auto">
										{direction}
									</span>
								</li>
							{/each}
						</ol>
					</div>
				</div>
				{#if isHidden}
					<div
						class="absolute inset-0 flex items-center justify-center pointer-events-none"
						transition:fade
					>
						<p class="text-2xl font-semibold">Click to reveal</p>
					</div>
				{:else}
					<div
						class="absolute inset-0 flex items-center justify-center pointer-events-none"
					>
						<Confetti
							amount={customRecipe.title.length * 50}
							x={[-3, 3]}
							y={[-1, 2]}
							delay={[0, 10000]}
							colorRange={[200, 300]}
						/>
						<Confetti
							amount={customRecipe.title.length * 10}
							x={[-3, 3]}
							y={[-1, 2]}
							delay={[9000, 20000]}
							colorRange={[200, 300]}
						/>
					</div>
				{/if}
			</button>
		</div>

		<hr />

		<button
			class="btn variant-soft-secondary uppercase font-semibold w-full"
			on:click={clearData}
		>
			<span><Fa icon={faRotateRight} /></span>
			<span>Fuse Again</span>
		</button>
	{/if}

	<!-- Hidden so that it preloads the iframe -->
	<iframe
		src="https://lottie.host/?file=072c975a-c0de-42a0-baff-3d8835f31553/jCImVMpKrs.json"
		title="mixing animation preloader"
		class="hidden"
	/>
</div>
