import AWS from 'aws-sdk';
import csv from 'csv-parser';
import 'dotenv/config';
import type { PageServerLoad } from './$types';
import type { Recipe } from '../lib/types';

export const load = (async () => {
	const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
	const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
	const AWS_REGION = process.env.AWS_REGION;
	const AWS_BUCKET = process.env.AWS_BUCKET;

	if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_BUCKET) {
		throw new Error('Missing AWS env variables');
	}

	AWS.config.update({
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
		region: AWS_REGION,
	});

	const s3 = new AWS.S3();

	const recipes: Recipe[] = [];

	await new Promise<void>((resolve, reject) => {
		s3.getObject({ Bucket: AWS_BUCKET, Key: 'index.csv' })
			.createReadStream()
			.pipe(csv())
			.on('data', (row) => {
				recipes.push(row); // Store each row of the CSV file
			})
			.on('end', () => {
				console.log('Recipes index file finished reading');
				resolve();

				// const randomRow = rows[Math.floor(Math.random() * rows.length)];
				// console.log('Random Row:', randomRow);
			})
			.on('error', (err) => {
				console.error(err);
				reject(err);
			});
	});

	return {
		recipes: recipes,
	};
}) satisfies PageServerLoad;
