import type { AIResponse } from '$lib/types';
import type { RequestHandler } from './$types';
import 'dotenv/config';

export const POST: RequestHandler = async ({ request, fetch }) => {
	const body = (await request.body?.getReader().read())?.value?.toString();
	const { prompt } = JSON.parse(body || '{}');
	const apiKey = process.env.EDENAI_API_KEY;

	if (!prompt)
		return new Response(null, {
			status: 400,
			statusText: 'Bad Request - Missing prompt body Parameter',
		});
	if (!apiKey)
		return new Response(null, {
			status: 500,
			statusText: 'Internal Server Error - Missing API Key',
		});

	const apiEndpointURL = 'https://api.edenai.run/v2/image/generation';

	try {
		const response = await fetch(apiEndpointURL, {
			method: 'POST',
			headers: {
				authorization: `Bearer ${apiKey}`,
				accept: 'application/json',
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				show_original_response: false,
				fallback_providers: '',
				providers: 'stabilityai',
				text: prompt,
				resolution: '512x512',
			}),
		});

		if (!response.ok)
			return new Response(null, {
				status: 500,
				statusText: 'Internal Server Error - Response not OK',
			});

		const data: AIResponse = await response.json();

		console.log('Response from AI:', data);

		const image = data.stabilityai.items[0].image;

		if (!image)
			return new Response(null, {
				status: 500,
				statusText: 'Internal Server Error - No image in response',
			});

		return new Response(image);
	} catch (error) {
		console.error('There was a problem with the fetch operation:', error);
		return new Response(null, {
			status: 500,
			statusText: 'Internal Server Error - Fetch Error',
		});
	}
};
