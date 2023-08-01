---
title:  "Building a Video Game Library in JavaScript (with classes, inheritance and methods!)"
date:   '2019-09-11'
---
So fairly recently, I've been learning about JavaScript. A good language that's used across so many web applications today. It's also very accessible and a decent starting point if you are new to programming. (Plus, you can do your work in a text editor such as Visual Studio Code!)

So in this post, we'll be going through an example where I create a program that creates instances of a class (and another class which inherits from another class) and methods. It may not be the most <i>interactive</i> program ever, but it's an excellent example of putting some of my JavaScript knowledge to the test.

Okay, so what does this program do exactly? Well it will:
- Create a class (which will have getters, a setter, and a method)
- Create another class that inherits from another class
- Create instances of both classes
- Using the instances, call the methods on the classes.

For reference, you can find the code for this post [here](https://gitlab.com/JoshBl_/videogame-list-javascript).

For those who know me, I'm a big fan of video games, so I wrote a small program that lists some of the games and consoles I have (along with some additional information, such as the platform and release year).

Let's start by taking a look at the parent class:

```
class videoGame {
    constructor(name, platform, year)
    {
        this._name = name
        this._platform = platform
        this._year = year
    }

    //getters for each of the specified properties
    get name() {return this._name}
    get platform() {return this._platform}
    get year() {return this._year}

    //setter for year parameter
    set year(number) {
        //if statement to check the the format (using typeof is a number)
        if (typeof number === 'number')
        {
            this._year = number
        }
        //if input is not a number, return a error message
        else
        {
            return 'Input is in the wrong format!'
        }
    }

    //method to display
    displayGames() {
        console.log(`Name : ${this._name}`)
        console.log(`Platform : ${this._platform}`)
        console.log(`Year of release : ${this._year}\n`)
    }
}
```

In this class we have created, the constructor has three parameters (which will be assigned to a property) - the name of the game, the platform the game was released on and the release year. (So if we create an instance of this class, we will need to have a value for each property defined).

Following that, we have getters for each property (using the 'this' keyword referring to the specific instance of the class) and a setter for the year property. This setter checks to make sure that whaterver is passed to the year property is a number. If it is, it will assign the value (the parameter called 'number' in this case) to the property. If it isn't, a message is returned saying the the format is wrong.

Finally, we have a method that displays each paramter to the user via string interpolation.

So then we move onto creating a class that inherits from videoGame class.

```
//class inherits from videoGame class
class gameConsole extends videoGame {
    constructor(name, year, manufacturer, controllerPorts)
    {
        //super should always be declared before anything else in the constructor
        //remember - all parameters from the parent class need to be defined in super, even if you give them a default value, like Console!
        super(name, 'Console', year)
        this._manufacturer = manufacturer
        this._controllerPorts = controllerPorts
    }

    //getters for the new parameters in the gameConsole class
    get manufacturer() {return this._manufacturer}
    get controllerPorts() {return this._controllerPorts}

    //setter for the controllerPorts parameter, checks if it is a number
    set controllerPorts(number) {
        if (typeof number === "number")
        {
            this._controllerPorts = number
        }
        else
        {
            return 'Input is in the wrong format!'
        }
    }

    //method to display
    displayConsole() {
        console.log(`Name: ${this._name}`)
        console.log(`Year : ${this._year}`)
        console.log(`Manufacturer : ${this._manufacturer}`)
        console.log(`Number of controller ports : ${this._controllerPorts}\n`)
    }
}
```

For those who are unfamiliar with JavaScript - class inheritance is done with the extends keyword.

An area that tripped me up slightly is with the constructor. I knew I had to call the super keyword first before I defined the properties for the class, but I forgot that <i>every</i> parameter from the parent class needs to be called.

In this case, I forgot about the 'platform' parameter and so whenever I tried to create a new instance of the gameConsole class, one of the properties would display undefined. After doing some research, I realised that I can give a default value for parameters in the constructor.

So, I gave the parameter 'platform' the string value of 'Console'.

In the method to display properties - I don't refer to the platform property so it would never be displayed to the user.

And finally, I create several instances of each class and call the method for each class.

```
//greeting message
console.log("Welcome to your Video Game Database! \nLet's view some games!\n")
//creating a new object of the videoGame class
const waveRave64 = new videoGame ('Wave Race 64', 'Nintendo 64', 1996)
const tacticsOgre = new videoGame ('Tactics Ogre: Let us cling together', 'Super Nintendo Entertainment System', 1995)
//calling the method to display games
waveRave64.displayGames()
tacticsOgre.displayGames()
console.log("\nLet's view some consoles!\n")
//creating a new object of the gameConsole class
const superNintendo = new gameConsole ("Super Nintendo Entertainment System", 1992, "Nintendo", 2)
const segaSaturn = new gameConsole ("Sega Saturn", 1994, "Sega", 2)

//calling the method to display game console
superNintendo.displayConsole()
segaSaturn.displayConsole()
```

Which will print the following to the console:

```
Welcome to your Video Game Database!
Let's view some games!

Name : Wave Race 64
Platform : Nintendo 64
Year of release : 1996

Name : Tactics Ogre: Let us cling together
Platform : Super Nintendo Entertainment System
Year of release : 1995


Let's view some consoles!

Name: Super Nintendo Entertainment System
Year : 1992
Manufacturer : Nintendo
Number of controller ports : 2

Name: Sega Saturn
Year : 1994
Manufacturer : Sega
Number of controller ports : 2
```

And that's it! We can successfully create instances of classes and call methods!

This may not call an API (yet!) but it is a good exercise for me to practice my JavaScript skills.

Thanks for reading!
