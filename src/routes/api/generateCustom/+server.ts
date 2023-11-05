import type { RecipeData } from '$lib/types';
import 'dotenv/config';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch }) => {
	const body = (await request.body?.getReader().read())?.value?.toString();
	const { recipe1, recipe2 } = JSON.parse(body || '{}');
	const EDENAI_API_KEY = process.env.EDENAI_API_KEY;
	console.log(EDENAI_API_KEY);
	const apiEndpointURL =
		'https://361zc9ejha.execute-api.us-east-2.amazonaws.com/fusiongenerator/generatecustom';

	if (!recipe1)
		return new Response(null, {
			status: 400,
			statusText: 'Bad Request - Missing recipe1 body Parameter',
		});
	if (!recipe2)
		return new Response(null, {
			status: 400,
			statusText: 'Bad Request - Missing recipe2 body Parameter',
		});
	if (!EDENAI_API_KEY)
		return new Response(null, {
			status: 500,
			statusText: 'Internal Server Error - Missing API Key',
		});

	try {
		const response = await fetch(apiEndpointURL, {
			method: 'POST',
			body: JSON.stringify({ recipe1, recipe2, apiKey: EDENAI_API_KEY }),
		});

		console.log('Response from Lambda:', response);

		console.log(response);

		if (!response.ok)
			return new Response(null, {
				status: 500,
				statusText: 'Internal Server Error - Response not OK',
			});

		const data: RecipeData = await response.json();
		console.log('ResponsJSON.stringify(e fr)bda:', data);

		return new Response(JSON.stringify(data));
	} catch (error) {
		console.error('There was a problem with the fetch operation:', error);
		return new Response(null, {
			status: 500,
			statusText: 'Internal Server Error - Fetch Error',
		});
	}
};
