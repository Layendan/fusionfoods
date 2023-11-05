import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';
import type { RecipeData } from './types';

export const previousFusions: Writable<
	(Pick<RecipeData, 'title' | 'directions' | 'ingredients'> & { image: string })[]
> = localStorageStore('fusionfoods', []);
