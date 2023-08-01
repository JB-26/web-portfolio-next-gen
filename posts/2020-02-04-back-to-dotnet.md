---
title:  "Getting back into .NET"
date:   '2020-02-04'
---
It's been a while since I've looked at C# and .NET. It's a popular language and platform for developing applications so I thought I'd jump back in and see what I think of it now that I've had experience with several languages.

So, I decided to write an application that allows the user to create a list of video games that they own and print them to an external file.

You can view the code for this application [here](https://gitlab.com/JoshBl_/dotnet/-/tree/master/gameLibrary).

I thought of the fields that the user would need to fill in to add a game to the library:
- Name
- Developer
- Publisher
- Platform
- Year

And since there are going to multiple games, it made sense to me to create a class and store each game in a list.

```
// new class
public class VideoGame
{
    // list that is part of the class
    public static List<VideoGame> library = new List<VideoGame>();
    // variables with get and set
    private string name {get; set;}
    private string developer {get; set;}
    private string publisher {get; set;}
    private string platform {get; set;}
    private double releaseYear {get; set;}
    private double gameId {get; set;}

    // methods to add to list
    public static void addGameToList(string gameName, string dev, string pub, string plat, double year) {
        Console.WriteLine("You have entered " + gameName);
        Console.WriteLine("Adding game to list!");
        double counter = 0;
        // counting each game in the library to ensure that the game ID is unique
        foreach (var game in library) {
            counter++;
        }
        // adding a new instance of the VideoGame class to the library
        library.Add(new VideoGame {gameId = counter, name = gameName, developer = dev, publisher = pub, platform = plat, releaseYear = year });
    }

    public static void displayLibrary() {
        // displaying all the items in the library
        foreach (var game in library) {
            Console.WriteLine(game);
        }
    }

    public static void printToFile() {
        // boolean variable
        bool printLoop = true;
        // while the boolean is true, run the following
        while (printLoop == true)
        {
            Console.WriteLine("Please enter the path to where you want the file to be written to:");
            // creating the path for where the file needs to be written to
            string path = Console.ReadLine();
            path = path + "\\library.txt";
            // if the file already exists, display message and exit method
            if (File.Exists(path))
            {
                Console.WriteLine("This file already exists! Please try again!");
            }
            // if it doesn't exist, run the following
            else
            {
                // error handling on writing file
                try
                {
                    // empty string to store every item in the library
                    string gameString = "";
                    // iterate through the the game list
                    foreach (VideoGame game in VideoGame.library)
                    {
                        // add each game to the string and add a new line on the end
                        gameString += game + "\n";
                    }

                    // write the file to the path location
                    File.WriteAllText(path, gameString);

                    Console.WriteLine("File written to: " + path);
                    Console.WriteLine("File is called 'library.txt'");
                    // set boolean to false so loop can end
                    printLoop = false;
                    Console.WriteLine("Press enter to return to main menu.");
                    Console.ReadLine();
                }
                // error handling
                catch (Exception e)
                {
                    Console.WriteLine("Error! Please try again!");
                    Console.WriteLine(e);
                }
            }
        }
    }

    //this method is used to print items on the list to the screen
    //remember - this override method cannot use the new, static or virtual modifiers 
    //provides a new implementation of a member that is inherited from a base class
    //in this case, we are overriding the default ToString method!
    public override string ToString()
    {
        return "Game ID: " + gameId + "\nGame: " + name + "\nDeveloper: " + developer + "\nPublisher: " + publisher + "\nPlatform: " + platform + "\nYear: " + releaseYear +"\n";
    }
}
```

So apart from listing the variables needed and creating a new list, let's take a look at adding a new game to the list.

```
static void addGame() {
    // getting input from the user for each field
    Console.WriteLine("Enter the game name");
    string gameName = Console.ReadLine();
    Console.WriteLine("Enter the developer of the game");
    string gameDeveloper = Console.ReadLine();
    Console.WriteLine("Enter the name of the publisher of the game");
    string gamePublisher = Console.ReadLine();
    Console.WriteLine("Enter the name of the platform of the game");
    string gamePlatform = Console.ReadLine();
    Console.WriteLine("Enter the year the game came out");
    double gameYear = Convert.ToDouble(Console.ReadLine());
    // calling the method from the VideoGame class to add values to list
    VideoGame.addGameToList(gameName, gameDeveloper, gamePublisher, gamePlatform, gameYear);
    // confirmation message
    Console.WriteLine(gameName + " has been added!");
}
```


```
// methods to add to list
public static void addGameToList(string gameName, string dev, string pub, string plat, double year) {
    Console.WriteLine("You have entered " + gameName);
    Console.WriteLine("Adding game to list!");
    double counter = 0;
    // counting each game in the library to ensure that the game ID is unique
    foreach (var game in library) {
        counter++;
    }
    // adding a new instance of the VideoGame class to the library
    library.Add(new VideoGame {gameId = counter, name = gameName, developer = dev, publisher = pub, platform = plat, releaseYear = year });
}
```

So this method takes five arguments; the game name, the developer, the publisher, the platform and the year the game was released.

The first thing the method does is print the name of the game that it is adding to the user and then set the ID for the game being entered. A foreach loop is used to count each game in the list and for every game it finds, the counter value is incremented by one. This ensures that the ID for each game is unique.

Now that we have all the values in place, we can add the new game to the list! This is achieved by using the built in Add method.

It's all well and good adding games to the list, but what about displaying them?

Well....

```
public static void displayLibrary() {
    // displaying all the items in the library
    foreach (var game in library) {
        Console.WriteLine(game);
    }
}
```

That would display this...

```
gameLibrary.VideoGame
```

Wait, how come it's not displaying all the games in the list? 🤔

For all the games in a list to be displayed, we need to <i>override<i> an existing method.

```
//this method is used to print items on the list to the screen
//remember - this override method cannot use the new, static or virtual modifiers 
//provides a new implementation of a member that is inherited from a base class
//in this case, we are overriding the default ToString method!
public override string ToString()
{
    return "Game ID: " + gameId + "\nGame: " + name + "\nDeveloper: " + developer + "\nPublisher: " + publisher + "\nPlatform: " + platform + "\nYear: " + releaseYear +"\n";
}
```

So when the Console.WriteLine(game) is run in the foreach loop, it will actually run the overridden ToString instead, which will show us the details for all the games in the list!

```
Game ID: 0
Game: Super Mario 64
Developer: Nintendo
Publisher: Nintendo
Platform: Nintendo 64
Year: 1996

Game ID: 1
Game: X-Men Vs Street Fighter
Developer: Capcom
Publisher: Capcom
Platform: Sega Saturn
Year: 1997

Game ID: 2
Game: Sonic 3
Developer: Sega
Publisher: Sega
Platform: Sega Mega Drive
Year: 1994
```

Displaying the items in the list is good but the user can print them to an external file and view the list at any time without opening the program!

```
public static void printToFile() {
    // boolean variable
    bool printLoop = true;
    // while the boolean is true, run the following
    while (printLoop == true)
    {
        Console.WriteLine("Please enter the path to where you want the file to be written to:");
        // creating the path for where the file needs to be written to
        string path = Console.ReadLine();
        path = path + "\\library.txt";
        // if the file already exists, display message and exit method
        if (File.Exists(path))
        {
            Console.WriteLine("This file already exists! Please try again!");
        }
        // if it doesn't exist, run the following
        else
        {
            // error handling on writing file
            try
            {
                // empty string to store every item in the library
                string gameString = "";
                // iterate through the the game list
                foreach (VideoGame game in VideoGame.library)
                {
                    // add each game to the string and add a new line on the end
                    gameString += game + "\n";
                }

                // write the file to the path location
                File.WriteAllText(path, gameString);

                Console.WriteLine("File written to: " + path);
                Console.WriteLine("File is called 'library.txt'");
                // set boolean to false so loop can end
                printLoop = false;
                Console.WriteLine("Press enter to return to main menu.");
                Console.ReadLine();
            }
            // error handling
            catch (Exception e)
            {
                Console.WriteLine("Error! Please try again!");
                Console.WriteLine(e);
            }
        }
    }
}
```

Printing to a file is held in a while loop. The first check is looking at if the file already exists in the directory specified by the user. If it does already exist, then the user will be prompted to enter a location again. If it doesn't exist, then the file will be written to the location.

Writing the file starts with creating an empty string called gameString, which is used in a foreach loop that for every item in the library, it will add it to the gameString variable. Once the variable has been populated, the WriteAllText method for the File class takes the path and the string with every game in the library and writes it.

This is held in a try/catch loop in case any errors occur.

In terms of interacting with the program, this is done in a while loop where the user interacts with the methods in a switch statement.

```
static void Main(string[] args)
{
    Console.Title = "Video Game Library";
    Console.WriteLine("Welcome to the Video Game Library!");
    bool activeMenu = true;
    while (activeMenu == true)
    {
        Console.WriteLine("Press the key to run a command!");
        Console.WriteLine("A) Add game to library\nV) View library\nP) Print to file\nQ) Quit");
        string menuChoice = Console.ReadLine();
        // changing user input to upper case
        menuChoice = menuChoice.ToUpper();
        switch (menuChoice)
        {
            case "A":
                addGame();
                break;
            case "V":
                displayGames();
                break;
            case "P":
                VideoGame.printToFile();
                break;
            case "Q":
                activeMenu = false;
                Console.WriteLine("Goodbye!");
                break;
            // error handling
            default:
                Console.WriteLine("Error! Please try again!");
                break;
        }
    }
}
```

It's good to get back into C# and .NET. However, I've been making CLI for a while now. I think it's time I looked into making web applications 👀

Thanks for reading!