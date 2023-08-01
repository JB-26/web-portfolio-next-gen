---
title: "Creating a CLI Python to communicate with the video game API 👾 (Plus, thoughts on PyCharm)"
date: "2021-07-13"
---

I haven't written some Python in a while so I decided to jump back in and write something new.

So I decided to write a small CLI application that communicates to the Video Game API. For those, who don't remember, I wrote the [API in Flask](https://github.com/JB-26/video-game-api) a few months back. The API is hosted on [Heroku](https://mighty-cliffs-81365.herokuapp.com/) and anyone can access it.

Also, I'll be using [PyCharm](https://www.jetbrains.com/pycharm/) for this project. I still love Visual Studio Code to death, but I wanted to try something new for a change. I'm aware of JetBrains' range of products so I thought I'd take PyCharm for a spin.

If you want to check out the code for this project, you can view the GitHub repo [here](https://github.com/JB-26/VideoGameAPIPythonCLI).

With that out of the way, let's get started!

## Introducing the Requests library

The Video Game API has various endpoints which use different HTTP request methods. After doing some research, I came across a Python library called [Requests](https://docs.python-requests.org/en/master/). The library has good documentation and it looked easy to implement, so I decided to give it a go.

The first endpoint I'll be looking at is the Login endpoint, which returns a JWT for authorisation. This will be a good way to introduce the requests library.

## Building requests (and decoding JSON)

Let's get started with building a request.
First, we need to look at constructing the headers and payload for the request.

```
# construct payload for request
payload = json.dumps({
    "username": username,
    "password": password
})

# construct headers
    headers_login = {
        'Content-Type': 'application/json'
}
```

The payload uses the JSON library and uses the 'dumps' method that serialises an object to a JSON formatted string, and the header is a dictionary.

We use these variables in creating the request, like so.

```
r = requests.post(f'{apiUrl}/login', headers=headers_login, data=payload)
```

The requests library is easy to use, the methods available for each HTTP request method use the same arguments.

This creates a response object which has access to several attributes such as the status code. Which we'll use in this if statement:

```
if r.status_code != 200:
    print('Error with logging in - please try again!')
    pass
else:
    # grab access token from response
    json_response = r.json()
    access_token = json_response['access_token']
    return access_token
```

We then get the response by using the JSON library to return the JSON encoded content of a response to be stored in a dictionary. The value of the key is then stored in a string (which will be used later on).

But some endpoints required me to decode the response, so I created a function for that:

```
def decode_json(json_data):
    """
    :param json_data:
    :return:
    Decodes JSON response from API
    """
    # decode JSON
    json_response = json_data.json()
    games = json_response.get('Games')

    # iterate through response
    for i in range(len(games)):
        temp_dict = games[i]
        game = temp_dict['Game']
        for x, y in game.items():
            print(f'{x}:{y}')
        print('\n')
```

This function takes the JSON Data, decodes it, which creates a dictionary. After converting the response to a dictionary, I convert it to an Array (just to make iterating through the individual dictionaries in the array easier).

With the new array, I iterate through it by taking the range of the length of the games array. For each item in the array, a temporary dictionary is created which holds the current dictionary. This temporary dictionary is used to iterate through the keys and values.

When I was writing this program, I found myself using this function a few times so I put in a method to save myself time.

With this in mind, let's take a look at how this is used in accessing parts of the API.

## Finding a game

Finding a game on the API requires a search term from the user. So let's set that up:

```
print('Please enter a search term')
search = input('Enter input')
print(f'Now searching for {search}....')
```

Of course, we need to set up some headers and the payload:

```
# construct headers
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

# construct payload for request
payload = json.dumps({
    "name": search
})
```

Okay! Now we can send the request and store it in a object called 'r'

```
r = requests.get(f'{apiUrl}/findGame', headers=headers, data=payload)
```

And now we move onto handling if the response code is anything other than 200 with an if statement.

```
if r.status_code != 200:
    print(f'Unable to locate a game with the following search term - {search}')
else:
    decode_json(r)
```

If the response code is 200, then it will run the function for decoding the JSON response!

It's not the most technical or exciting post - but it was a good way for me to jump back in with Python.

## On PyCharm...

This was my first project using PyCharm - and I think it's pretty good! It's a step up from using Visual Studio Code (which I still love), but the debugger in PyCharm is great. Plus, the the available tools for code refractoring is pretty handy as well. Setting up an interpreter and creating new project was easy and there is a lot of documentation on PyCharm available.

I'd say give the community edition a spin if you want to take a look.

## What's next?

Next time, I'll be taking a look at more Python and SQL by combining them both for some data analysis. 🔎

Thanks for reading! 👏