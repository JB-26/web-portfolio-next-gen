---
title: "Building an API in .NET and deploying it to Azure 🧙‍♂️"
date: "2021-10-07"
description: "Taking a look at building something and putting in in production"
image: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2068&q=80
---

![Server](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2068&q=80)

A while back, I looked at creating an [API in Python](https://joshblewitt.dev/blog/2021-03-11-video-game-api/) and getting it hosted on Heroku. It was a great project to do and recently, I've been thinking of doing some smaller projects in .NET again.

I'm not a stranger to .NET. When I studied Computer Science at University, C# was the first programming language I studied. I worked on several projects using C# but I didn't go beyond the basics (I remember building a pretty cool address book as my first assignment at University though!). When I joined my current work place in 2016, C# is used as the main language. So after some time, I decided to get back into the language by building a few small projects!

But I will say that .NET has made some big changes over the past few years, especially with [.NET Core](https://dotnet.microsoft.com/learn/aspnet/what-is-aspnet-core), which was an effort to include cross platform support for Linux and MacOS and the successor to .NET Framework. With all these changes and good documentation, I decided to jump back in.

My first small project is the [game shop](https://github.com/JB-26/cSharp-game-shop). A simple program that creates objects and stores them in a list. Has the capability of writing the objects to a text file or even JSON so you import them into the program again (to save time from entering your collection again!).

But then I decided I wanted to take another step into making an API and hosting it on Azure.

If you want to take a look at the completed API (and run the Postman collection when you can make requests to it), you can see it [here](https://github.com/JB-26/videoGameApi)!

Azure is used in so many businesses so it would be good to get some more experience with it. So let's jump in!

### Building the API

This API will be taking the game shop project but just making it so that a user can:
- __C__ reate
- __R__ read
- __U__ pdate
- __D__ elete

For this API, it won't be writing information to a databse _yet_ so for now it will store the objects in memory. Which isn't good if there are lots of users writing information to it, but for now - it'll do.

Since this will be holding objects, let's take a look at the class for the objects:

```
namespace videoGameApi.Models
{
    public class VideoGame
    {
        public string name {get; set;}
        public string publisher {get; set;}
        public string developer {get; set;}
        public string platform {get; set;}
        public DateTime releaseDate {get; set;} 

        public double id {get; set;}
    }
}
```

Nothing special in this class. A couple of strings, a date time and a double will be used to store information about video games that the user enters.

Let's take a look into the service for the API.

```
 public static class VideoGameService
    {
        static List<VideoGame> Games {get;}

        static int nextId = 3;

        static VideoGameService()
        {
            Games = new List<VideoGame>
            {
                new VideoGame{ name = "Super Mario 64", publisher = "Nintendo", developer = "Nintendo", platform = "Nintendo 64", releaseDate = new System.DateTime(1996, 06, 23), id = 1},
                new VideoGame{ name = "X-Men Vs Street Fighter", publisher = "Capcom", developer = "Capcom", platform = "Sega Saturn", releaseDate = new System.DateTime(1997, 11, 27), id = 2}
            };
        }

        public static List<VideoGame> GetAll() => Games;

        public static VideoGame Get(int id) => Games.FirstOrDefault(p => p.id == id);

        public static void Add(VideoGame game)
        {
            game.id = nextId++;
            Games.Add(game);
        }

        public static void Delete(int id)
        {
            var game = Get(id);
            if (game is null)
                return;
            Games.Remove(game);
        }

        public static void Update(VideoGame game)
        {
            var index = Games.FindIndex(p => p.id == game.id);
            if (index == -1)
                return;
            Games[index] = game;
        }
    }
```

Since I'm holding objects in memroy, I decided to store them in a list and pre-populate it with two entries. The next game will start with an ID of 3. There are a few additional methods that add, delete and update the objects in the list (as well as get all items in the list or find games in a list).

With this in mind, let's take a look at the controller which will use the service.

```
namespace videoGameApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class VideoGameController : ControllerBase
    {
        public VideoGameController()
        {
        }

        // GET all action
        [HttpGet("getAll")]
        public ActionResult<List<VideoGame>> GetAll() =>
    VideoGameService.GetAll();

        // GET by Id action
        [HttpGet("findGame/{id}")]
        public ActionResult<VideoGame> Get(int id)
        {
            var game = VideoGameService.Get(id);

            if (game == null)
                return NotFound();

            return game;
        }

        // POST action
        [HttpPost("addGame")]
        public IActionResult Create(VideoGame game)
        {
            VideoGameService.Add(game);
            return CreatedAtAction(nameof(Create), new { id = game.id }, game);
        }

        // PUT action
        [HttpPut("updateGame/{id}")]
        public IActionResult Update(int id, VideoGame game)
        {
            if (id != game.id)
                return BadRequest();

            var existingGame = VideoGameService.Get(id);
            if (existingGame is null)
                return NotFound();

            VideoGameService.Update(game);

            return NoContent();
        }

        // DELETE action
        [HttpDelete("deleteGame/{id}")]
        public IActionResult Delete(int id)
        {
            var pizza = VideoGameService.Get(id);

            if (pizza is null)
                return NotFound();

            VideoGameService.Delete(id);

            return NoContent();
        }
    }
}
```


We'll break each action down.

__GET all action__

This uses the 'GetAll' method in the service for returning all the objects in the list.

__GET by ID action__

This requires the user to enter an integer value in the request. If the method finds the matching object, then it will return the object. If the method doesn't find a matching object, then it will return a status of not found.

__POST action__

This endpoint requires the user to enter the details for a new game they want to add. The API returns the information of what was added to the list.

__PUT action__

This endpoint updates an item that already exists in the list. The user needs to provide the ID of the object they want to update and details of what needs to be updated. Once the operation is complete, the API will return a 204.

__DELETE action__

This endpoint requires the user to provide an ID of the object that they want to delete. If the ID matches an object, then the object is deleted from the list with a status of no content. If there is no match, then a status of not found is returned.

So that's the API itself. If you want to run the API locally you can and you can use the included Postman collection to see it working!

Now comes the next step, getting it deployed to Azure (and with a little help from GitHub actions).

I've never deployed anything to Azure before, so I decided to do some research on how to deploy my API to it. Thankfully, I found a [post](https://medium.com/@lifei.8886196/how-to-deploy-net-core-web-api-to-azure-a127bfb20d09) that goes into detail about deploying an API to an App Service on Azure.

After configuring the service (and choosing a free subscription tier - _phew!_), my application was live! 🎉

![Azure](https://i.imgur.com/wscqJkA.jpg)

If you want to give it a spin, why not visit this [endpoint](https://videogameapidotnet.azurewebsites.net/VideoGame/getAll) and see all the games in the API.

There's one more side to this and that is the use of GitHub actions.

![GitHub actions](https://i.imgur.com/Iijk0Ci.jpg)

Now whenever I push a change to the main branch of the repo, GitHub actions will deploy the latest change to the app service on Azure. It's amazing on how simple it is to set up a GitHub action to handle the deployment of the API to Azure.

(If you do send a request, it might be slightly slow at first as I'm using a free tier on Azure)

And that's about it!

Clone the repo, run it locally or even use the postman collection to interact with the API on Azure!

Thanks for reading! 👏