import type { RequestHandler } from './$types';
import AWS from 'aws-sdk';
import 'dotenv/config';

export const GET: RequestHandler = async ({ url }) => {
	const param = url.searchParams.get('id');

	if (!param)
		return new Response(null, {
			status: 400,
			statusText: 'Bad Request - Missing id Parameter',
		});

	const id = Number(param);

	// query the database for id, then return that
	AWS;

	return new Response();
};

export const POST: RequestHandler = async ({ url }) => {
	return new Response();
};
