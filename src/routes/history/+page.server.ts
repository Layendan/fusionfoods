import { error } from '@sveltejs/kit';
import 'dotenv/config';
import { createClient } from 'redis';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const REDIS_KEY = process.env.REDIS_KEY;

	if (!REDIS_KEY) return error(500, 'Internal Server Error - Missing Redis Key');

	const client = createClient({
		url: `redis://default:${REDIS_KEY}@redis-10781.c309.us-east-2-1.ec2.cloud.redislabs.com:10781`,
	});

	try {
		await client.connect();

		const response = await client.lRange(`fusionLeaderboard`, -1, -51);

		return {
			fusions: response as string[],
		};
	} catch (e) {
		console.error('There was a problem with the redis operation:', e);
		return error(500, 'Internal Server Error - Redis Error');
	}
}) satisfies PageServerLoad;
