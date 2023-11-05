import csv
import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET = os.getenv("AWS_BUCKET")

# Client to access our S3 resources
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

data = []

# READ RECIPES FROM THE DATASET OF 2 MILLION (https://www.kaggle.com/datasets/wilmerarltstrmberg/recipe-dataset-over-2m)
with open("recipes_data.csv", "r", newline="") as f:
    csv_reader = csv.reader(f)
    count = 0
    for row in csv_reader:
        if count == 959106:
            print("AAAAAAAAAAAAAAA")
            print(f"{row}")
            print("AAAAAAAAAAAAAAA")
            break
        print(f"Reading recipe {count}: {row}")
        data.append(row)
        count += 1

# CREATE index.csv AND CORRESPONDING RECIPE JSON FILES
with open("index.csv", "w", newline="") as f:
    csv_writer = csv.writer(f)
    count = 0
    for row in data:
        # WRITE HEADER ROW TO INDEX FILE
        if count == 0:
            csv_writer.writerow(["id", "title"])
            count += 1
            continue

        # WRITE ENTRY TO INDEX FILE
        index_entry = [count, row[0]]
        print(f"Writing row to index.csv: {index_entry}")
        csv_writer.writerow(index_entry)

        # PUT THE DATA INTO DICTIONARY FORM (then json.dumps() it)
        keys = ["title", "ingredients", "directions", "link", "source", "NER", "site"]
        title = row[0].replace("'S", "'s")
        values = [
            row[0],
            json.loads(row[1]),
            json.loads(row[2]),
            row[3],
            row[4],
            json.loads(row[5]),
            row[6],
        ]
        result_dict = {}
        for i in range(len(keys)):
            result_dict[keys[i]] = values[i]
        data = json.dumps(result_dict, indent=4)

        file_name = f"recipes/{count}.json"

        # WRITE TO FILE LOCALLY (COMMENT THIS OUT IF YOU DON'T WANT 100000s OF RECIPES IN JSON FILES ON YOUR PC)
        # if not os.path.exists("recipes"):
        #     os.mkdir("recipes")
        # with open(file_name, "w") as f:
        #     f.write(data)

        # WRITE TO S3 BUCKET
        print(f"Writing data to S3 bucket at ({file_name}): {data}")
        s3_client.put_object(Body=data, Bucket=AWS_BUCKET, Key=file_name)

        count += 1

# WRITE INDEX FILE TO S3 BUCKET
with open("index.csv", "rb") as f:
    s3_client.put_object(Body=f, Bucket=AWS_BUCKET, Key="index.csv")
