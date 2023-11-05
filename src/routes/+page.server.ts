import AWS from 'aws-sdk';
import 'dotenv/config';
import type { PageServerLoad } from './$types';

export const load = (() => {
	const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
	const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
	const AWS_REGION = process.env.AWS_REGION;
	const AWS_BUCKET = process.env.AWS_BUCKET;

	AWS.config.update({
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
		region: AWS_REGION,
	});

	const s3 = new AWS.S3();

	const params = {
		Bucket: AWS_BUCKET,
		Key: 'index.csv',
	};

	// const rows = [];

	const recipeLeft = 'aaaaaa';
	const recipeRight = 'bbb';

	// S3 getObject() to get left recipe
	// s3.getObject(params)
	// 	.createReadStream()
	// 	.pipe(csv())
	// 	.on('end', () => {
	// 		console.log('CSV file reading finished');

	// 		// const randomRow = rows[Math.floor(Math.random() * rows.length)];
	// 		// console.log('Random Row:', randomRow);
	// 	});

	// S3 getObject() to get right recipe
	// s3.getObject(params)
	// 	.createReadStream()
	// 	.pipe(csv())
	// 	.on('end', () => {
	// 		console.log('CSV file reading finished');

	// 		// const randomRow = rows[Math.floor(Math.random() * rows.length)];
	// 		// console.log('Random Row:', randomRow);
	// 	});

	const recipeCombined = 'kjasjdfbahd';
	// AWS Lambda call combine code

	return {
		recipes: [recipeLeft, recipeRight],
	};
}) satisfies PageServerLoad;
