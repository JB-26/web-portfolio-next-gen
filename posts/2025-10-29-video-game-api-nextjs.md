---
title: "Making the Video Game API (again) in NextJS"
date: "2025-10-29" #YYYY-MM-DD
tags: ["Blog", "Code"]
ogImage: "public/images/opengraph-image.png"
description: Now with MongoDB!
---

After several years, I’m back with making the Video Game API project again. But this time, it’s using the following technologies:

- NextJS
- TypeScript
- React
- Node
- Tailwind CSS
- DaisyUI
- MongoDB
- Mongoose

It’s possibly my first steps into making a small full stack application of some kind.

I’ve been doing a lot of tutorials over the past few months about web development and being able to put the knowledge I have together into one project and get it running in production has been hugely enjoyable.

In this post, I want to show the work I’ve put into the project, the technologies I used, how they work and share my thoughts on the process.

If you want to check this out on GitHub, here is the [link](https://github.com/JB-26/video-game-api-nextjs). This will also include a Postman collection so you can go and send a few requests to this API. Feel free to explore and use the API! But please don’t send any personal information, this is a public API.

And if you want to see this in production, you can view it [here.](https://video-game-api-nextjs.vercel.app/)

## MongoDB

One of my previous attempts at making the video game API resulted in the data being stored in memory, and not a database. That’s not great if you are going to have hundreds (maybe thousands) of entries.

This time, I used MongoDB, which is hosted on Atlas. After configuring a (free) cluster, I needed to install the driver for my project:

```
npm install mongodb
```

The credentials are stored in a `.env` file (which are not committed to the repo on GitHub). But to interact with the database, I needed to use Mongoose, which provides a straight-forward, schema-based solution to model application data.

I created a file called `db.ts` which would handle connecting to the database via Mongoose:



```tsx
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  // check if connected, so we don't connect twice
  // Connection ready state
  // 0 = disconnected
  // 1 = connected
  // 2 = connecting
  // 3 = disconnecting
  // 99 = uninitialized
  const connectionState = mongoose.connection.readyState;
  if (connectionState === 1) {
    console.log("Already connected to MongoDB");
    return;
  }

  if (connectionState === 2) {
    console.log("Connecting to MongoDB...");
    return;
  }

  // ensure that the connection is established before proceeding
  try {
    await mongoose.connect(MONGODB_URI!, {
      dbName: "videogameapi",
      bufferCommands: true,
    });
    console.log("Connected!");
  } catch (err) {
    console.log(`Error - ${err}`);
    throw new Error(`Error - ${err}`);
  }
};
export default connect;

```

The `connect` promise will be called when a user tries to submit a request to the API. It will return a message to the console displaying if it connected to the DB, or if it’s already been connected.

### The model

The next piece of the puzzle is to create a model, which describes the schema for the database. This is what I created for the video game API (in a file called `videogame.ts`):

```tsx
import { Schema, model, models } from "mongoose";

const VideogameSchema = new Schema(
  {
    title: { type: String, required: true },
    platform: { type: String, required: true },
    developer: { type: String, required: true },
    releaseDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);

// check if the model exists before creating one
// fun fact: mongoose is case sensitive, so we need to use the same casing as the model name. Otherwise it will try to overwrite the existing model.
const Videogame = models.Videogame || model("Videogame", VideogameSchema);

// exported so it can be used in other files
export default Videogame;

```

The model will have the title, platform, developer and release date. After defining the model, I have a check for if the model exists before creating one.

I fell into a trap where I accidentally used different casing when checking if the model exists, which caused my application to crash as it tried to create another model if I sent another request to my API.

## The API itself

When working with NextJS, there are a few things to keep in mind when creating an API:

- Everything backend will be in the api folder.
- The `videogame` folder will be an API once we have the `route.ts` file, the name cannot be changed.
- If we have a folder with parentheses, `(auth)`, this will be ignored in the URL on the backend and frontend.
- If we have a folder with square brackets, `[category]`, this will be dynamic.

This is an example of the `GET` request in the `route.ts` file:

```tsx
// GET endpoint
export const GET = async () => {
  try {
    // connect to the db
    await connect();
    const videogames = await Videogame.find();
    return new NextResponse(JSON.stringify(videogames), { status: 200 });
  } catch (error) {
    return new NextResponse(`Error in retrieving video games - ${error}`, {
      status: 500,
    });
  }
};
```

This will use [NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-response), which extends the Web Response API and does the following:

- Connect to the database (using the database file mentioned above)
- Retrieve all entries using the `find` method
- Return the results and give a status of 200.

This is wrapped up in a try/catch block, so should something go wrong, I can return an error message with a status of 500.

I won’t go over each function in this post, if you want to take a deeper look, check out the GitHub repo and look at the `route.ts` file under `app` → `api` → `dashboard` → `videogame`.

## The frontend

This time around, I’m using [TailwindCSS](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/) for the frontend. This is brand new to me so I was eager to jump in and try it. It feels strange to write in line CSS but I do appreciate how easy it is to make elements bold, change the font size, etc.

And I think this home page is a good example that I am *extremely* new at this:

```tsx
import Link from "next/link";
import Footer from "./components/Footer/footer";
import Header from "./components/Header/header";

export default function Home() {
  return (
    <div data-theme="lofi" className="min-h-screen flex flex-col">
      <Header />
      <div className="hero bg-base-200 flex-1">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">The Video Game API</h1>
            <p className="py-6">
              Welcome to the Video Game API! A small portfolio project to
              showcase my skills in the following technologies:
            </p>
            <ul>
              <li>NextJS</li>
              <li>TypeScript</li>
              <li>Node</li>
              <li>MongoDB</li>
              <li>Mongoose</li>
              <li>TailwindCSS</li>
              <li>DaisyUI</li>
            </ul>
            <p className="py-6">
              Looking for the GitHub repo? Check out the{" "}
              <Link
                href="https://github.com/JB-26/video-game-api-nextjs"
                className="link"
                rel="noopener noreferrer"
                target="_blank"
              >
                link here!
              </Link>
            </p>
            <p>
              The GitHub repo also has a JSON Postman collection, which can be
              used to send requests to the API. There are some example requests
              below.
            </p>
            <div
              role="alert"
              className="alert alert-warning py-3 text-center text-xl"
            >
              <span>
                Warning: <strong>Do not enter any personal information!</strong>{" "}
                <br />
                This is a public API. Please use this API responsibly.
                <br />
                Do not use this API for any illegal or unethical purposes.
                <br />
                This is designed to demonstrate my skills.
              </span>
            </div>
            <h2 className="text-2xl font-bold py-4">API Documentation</h2>
            <h3 className="text-xl font-bold">Endpoints</h3>
            <h4 className="text-lg font-bold p-3">GET</h4>
            <p>Retrieves a list of all games in the database.</p>
            <p>Example request</p>
            <div className="mockup-code w-full">
              <pre data-prefix="$">
                <code>
                  curl --location
                  &apos;http://localhost:3000/api/videogame&apos;
                </code>
              </pre>
            </div>
            <h4 className="text-lg font-bold p-3">POST</h4>
            <p>Creates a new video game in the database.</p>
            <p>Example request:</p>
            <div className="mockup-code w-full">
              <pre data-prefix="$">
                <code>
                  {`curl --location 'http://localhost:3000/api/videogame' \\
            --header 'Content-Type: application/json' \\
            --data '{
                "title": "Teleroboxer",
                "platform": "Virtual Boy",
                "developer": "Nintendo",
                "releaseDate": "1995-07-21"
            }'`}
                </code>
              </pre>
            </div>
            <h4 className="text-lg font-bold p-3">PATCH</h4>
            <p>Updates an existing video game in the database.</p>
            <p>Example request:</p>
            <div className="mockup-code w-full">
              <pre data-prefix="$">
                <code>
                  {`curl --location --request PATCH 'http://localhost:3000/api/videogame' \
                  --header 'Content-Type: application/json' \
                  --data '{
                      "id": "68f132db91b7c422b855f547",
                      "newTitle": "Super Smash Bros. Melee",
                      "newPlatform": "GameCube",
                      "newDeveloper": "Nintendo",
                      "newReleaseDate": "2001-11-21"
                  }'`}
                </code>
              </pre>
            </div>
            <h4 className="text-lg font-bold p-3">DELETE</h4>
            <p>Deletes a video game from the database.</p>
            <p>Example request</p>
            <div className="mockup-code w-full">
              <pre data-prefix="$">
                <code>
                  {`curl --location --request DELETE 'http://localhost:3000/api/videogame?gameId=68f3618fe2a8856bd22843ad'`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

```

Then there is the page that displays all the video games that are currently in the database:

```tsx
import Footer from "../components/Footer/footer";
import Header from "../components/Header/header";
import connect from "@/lib/db";
import Videogame from "@/lib/models/videogame";

// disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface VideoGame {
  id: number;
  title: string;
  platform: string;
  developer: string;
  releaseDate: string;
}

const VideoGame = async () => {
  // connect to the db
  await connect();
  // get all video games from the database
  //.lean() returns plain JavaScript objects instead of Mongoose documents
  const videoGames = await Videogame.find().lean();
  console.log(videoGames);
  return (
    <div data-theme="lofi" className="min-h-screen flex flex-col">
      <Header />
      <div className="hero bg-base-200 flex-1">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Video Games in the API</h1>
            <p>
              Here you will find what is currently stored in MongoDB! If you
              have added a new game, it will be displayed here. You might need
              to refresh the page if you had this page opened when you added a
              new game.
            </p>
            <h2 className="text-3xl font-bold p-3.5">Video Games</h2>
            <p>This fetch was made at {new Date().toLocaleTimeString()}</p>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Platform</th>
                  <th>Developer</th>
                  <th>Release Date</th>
                </tr>
              </thead>
              <tbody>
                {videoGames.map((game) => (
                  <tr key={game.id}>
                    <td>{game.title}</td>
                    <td>{game.platform}</td>
                    <td>{game.developer}</td>
                    <td>{new Date(game.releaseDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VideoGame;
```

I originally planned on using `fetch` on my own environment, but I ran into the problem of trying to use `localhost` on the server, not my deployed application.

So I switched this out to using a familiar approach of retrieving all the entries in the database by connecting to it. Something I did learn was the use of the `lean()` method, which returns JavaScript objects. This makes it much easier to map the individual entries on the table.

I also disabled the caching of the page as I wanted to ensure that if someone added a new entry to the database, they could refresh the page and see the changes made instantly.

## Things that could be improved

### Adding Bearer tokens (authentication)

Having an authentication scheme is important for modern APIs, and one way would be using [Bearer Authentication](https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/), which gives access to users who provide the token.

This can be added to NextJS via authentication middleware to check if the user has an appropriate token. This could be achieved using the following setup in the directory; `middlewares -> api -> authMiddleware.ts`

```tsx
// checking if the bearer token from the client is passed
// if not, return a 401 Unauthorized response

const validate = (token: string | undefined) => {
  const validToken = true;
  if (!validToken || !token) {
    return false;
  }
  return true;
};

export function authMiddleware(req: Request) {
  // get the token from the header
  const token = req.headers.get("authorization")?.split(" ")[1];

  return { isValid: validate(token) };
}
```

### Tailwind CSS and DaisyUI

This is definitely my weakest area, the UI on the front end is *okay* at best. It absolutely could do with some improvement. I’m planning on learning a little more about Tailwind and Daisy and make improvements to the frontend. It feels extremely weird writing in line CSS.

I think the themes and components available on DaisyUI are nice, and I want to spend more time exploring the components that are available.

### More API functionalities

Although you can find everything in the database, you can’t search it for a specific entry. This is something that I want to improve in the near future. I was also thinking of pulling all games for a particular platform (think of it as a category).

### Interact with the API via the frontend

At the moment, the frontend is quite limited. All you can do is view the documentation and see what is in the database via a table. I plan on expanding the functionality so that a user can add, delete and modify a video game from the frontend.

## How is this better than the previous attempts?

The biggest improvement is that this uses a database, so not storing all the entries as objects in memory, and being able to view the results of the API directly in the frontend is a huge improvement compared to my previous attempts.

Although the functionality is the same, I think the overall ‘product’ is much better this time around.

## Wrap up

It’s been good to build a more ‘complete’ product, especially using a modern framework and database. Remember, you can send requests to the API! Be sure to send me a message if you have any questions.

I’ll write another post once I make updates to this small project in the future.
