import random
import json
import requests


def generate_custom(recipes_dict, context):
    ### GENERATE UNIQUE TITLE ###
    recipe1_title = recipes_dict["recipe1"]["title"]
    recipe2_title = recipes_dict["recipe2"]["title"]
    api_key = recipes_dict["apiKey"]

    print(api_key)

    recipe1_title = recipe1_title.replace('"', " ")
    recipe1_title = recipe1_title.replace("(", " ")
    recipe1_title = recipe1_title.replace(")", " ")
    recipe2_title = recipe2_title.replace('"', " ")
    recipe2_title = recipe2_title.replace("(", " ")
    recipe2_title = recipe2_title.replace(")", " ")

    words_list = []
    for word in recipe1_title.split():
        if "-" in word:
            dash_split = recipe1_title.split("-")
            for i in range(len(dash_split)):
                if i != len(dash_split) - 1:
                    dash_word = dash_split[i] + "-"
                else:
                    dash_word = dash_split[i]
                words_list.append(dash_word)
        else:
            words_list.append(word)

    for word in recipe2_title.split():
        if "-" in word:
            dash_split = recipe2_title.split("-")
            for i in range(len(dash_split)):
                if i != len(dash_split) - 1:
                    dash_word = dash_split[i] + "-"
                else:
                    dash_word = dash_split[i]
                words_list.append(dash_word)
        else:
            words_list.append(word)
    # print(words_list)

    # Get list of unique indexes to create a unique title
    random_indices = []
    for i in range((len(words_list) // 2) + 1):
        random_index = random.randint(0, len(words_list) - 1)
        while random_index in random_indices:
            random_index = random.randint(0, len(words_list) - 1)
        random_indices.append(random_index)
        if i == len(words_list) // 2:
            while words_list[random_index][-1] == "-":
                random_index = random.randint(0, len(words_list) - 1)
                if words_list[random_index][-1] != "-":
                    random_indices.append(random_index)
    # print(random_indices)

    combined_title = ""
    for index in random_indices:
        if words_list[index][-1] == "-":
            combined_title += words_list[index]
        else:
            combined_title += words_list[index] + " "

    combined_title = combined_title.strip()

    if combined_title == recipe1_title or combined_title == recipe2_title:
        combined_title += " 2"

    ### GENERATE CUSTOM INGREDIENTS & DIRECTIONS ###
    recipe1_ingredients = recipes_dict["recipe1"]["ingredients"]
    recipe2_ingredients = recipes_dict["recipe2"]["ingredients"]
    recipe1_directions = recipes_dict["recipe1"]["directions"]
    recipe2_directions = recipes_dict["recipe2"]["directions"]

    headers = {"Authorization": f"Bearer {api_key}"}
    directions_query = (
        "Generate a fusion recipe with instructions between "
        + recipe1_title
        + " and "
        + recipe2_title
        + " and return it in a JSON format with the key-values of 'ingredients: string[], directions: string[]'"
    )
    url = "https://api.edenai.run/v2/text/code_generation"
    payload = {
        "providers": "openai",
        "prompt": "",
        "instruction": directions_query,
        "temperature": 0.1,
        "max_tokens": 500,
    }
    response = requests.post(url, json=payload, headers=headers)
    result = json.loads(response.text)
    print(result, response)
    result = result["openai"]["generated_text"]
    result = json.loads(result)

    custom_ingredients = result["ingredients"]
    custom_directions = result["directions"]

    data = {
        "title": combined_title,
        "ingredients": custom_ingredients,
        "directions": custom_directions,
    }
    return data
