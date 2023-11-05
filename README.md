# FusionFoods

![](./static/logo.png)

FusionFoods is a joke website where you can fuse two recipes together. The website is built using SvelteKit and TailwindCSS alongside SkeletonUI.

## Contributing

You will need to host an AWS S3 bucket that will store a csv file with the recipes.
[Link to the dataset used for our project](https://www.kaggle.com/datasets/wilmerarltstrmberg/recipe-dataset-over-2m)

To add the data from the dataset into your S3 bucket, there is a python script called `extract_data.py` provided in the `scripts` folder. Be aware that it may create extra files on your system (up to 2 million, if you're not careful):

You will also need to create a .env file with the following variables:

```bash
USER="USERNAME"
PASSWORD="PASSWORD"
AWS_ACCESS_KEY_ID="AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="AWS_SECRET_ACCESS_KEY"
AWS_REGION="AWS_REGION"
AWS_BUCKET="AWS_BUCKET"
```

Or you can check the `.env.example` file for an example.

Then download the dependencies with

```bash
yarn
```
