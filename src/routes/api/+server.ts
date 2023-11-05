import AWS from 'aws-sdk';
import 'dotenv/config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const param = url.searchParams.get('id');

		if (!param)
			return new Response(null, {
				status: 400,
				statusText: 'Bad Request - Missing id Parameter',
			});

		const id = Number(param);

		// query the database for id, then return that
		AWS.config.update({
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.AWS_REGION,
		});

		const params = {
			Bucket: 'fusionfoods',
			Key: 'recipes/' + id.toString() + '.json',
		};

		const s3 = new AWS.S3();

		const returnData = await new Promise<string | null>((resolve, reject) => {
			s3.getObject(params, function (err, data) {
				if (err) {
					console.error(err, err.stack);
					reject(err);
				} else {
					const body = data.Body ? data.Body.toString() : null;
					// console.log(body);
					if (!body) reject('No body');
					resolve(body);
				}
			});
		});

		if (returnData) return new Response(returnData);
		else
			return new Response(null, {
				status: 404,
				statusText: 'Not Found',
			});
	} catch (err) {
		console.error(err);
		return new Response(null, {
			status: 500,
			statusText: 'Internal Server Error',
		});
	}
};

export const POST: RequestHandler = async ({ url }) => {
	return new Response();
};
