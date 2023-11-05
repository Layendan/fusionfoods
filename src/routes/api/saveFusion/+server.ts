import 'dotenv/config';
import { createClient } from 'redis';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const REDIS_KEY = process.env.REDIS_KEY;

	if (!REDIS_KEY)
		return new Response(null, {
			status: 500,
			statusText: 'Internal Server Error - Missing Redis Key',
		});

	const result = await request.body?.getReader().read();
	console.log('result', result);
	const body = result?.value?.toString();
	console.log('body', body);
	const recipe = JSON.parse(body || '{}');

	if (!recipe)
		return new Response(null, {
			status: 400,
			statusText: 'Bad Request - Missing recipe body Parameter',
		});

	const client = createClient({
		url: `redis://default:${REDIS_KEY}@redis-10781.c309.us-east-2-1.ec2.cloud.redislabs.com:10781`,
	});

	try {
		await client.connect();

		await client.lPush(
			`fusionLeaderboard`,
			JSON.stringify({ title: recipe.title, image: decodeURIComponent(recipe.image) })
		);

		return new Response(null, { status: 200, statusText: 'OK' });
	} catch (error) {
		console.error('There was a problem with the redis operation:', error);
		return new Response(null, {
			status: 500,
			statusText: 'Internal Server Error - Redis Error',
		});
	}
};
