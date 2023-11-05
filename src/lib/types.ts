export type Recipe = { id: number; title: string };

export type RecipeData = {
	title: string;
	ingredients: string[];
	directions: string[];
	link: string;
	source: string;
	NER: string[];
	site: string;
};

export type AIResponse = {
	stabilityai: {
		items: { image: string; image_resource_url: string }[];
		status: 'success' | 'fail';
	};
};
