---
title:  "Even more TypeScript!"
date:   '2019-11-12'
---
A while back, I looked at TypeScript, a superset of JavaScript. I haven't always gotten along with JavaScript so recently, I've been trying to change that. So, I've been learning TypeScript - where according to StackOverflow's 2019 developer [survey](https://insights.stackoverflow.com/survey/2019#most-loved-dreaded-and-wanted) - it's the third most loved language and the least dreaded language. The code I will be looking at will be in this [repo](https://gitlab.com/JoshBl_/typescript-practice). The code in this repo is from the exercises in the [Eloquent JavaScript](https://eloquentjavascript.net/index.html) book. Which by the way, is an excellent resource in learning JavaScript. 👍

There's a good reason why TypeScript is popular, with good support from Microsoft on new features such as async functions, plus being able to compile to JavaScript to ES3 or higher.

But I'll cover one unique feature that I've been looking at while I've been learning more TypeScript/JavaScript is the use of the TypeScript config JSON file.

Here's an example of a TypeScript config file that I've been using

```
{
    "compilerOptions": {
      "target": "es5",
      "module": "commonjs",
      "allowJs": true,
      //changing the output directory
      "outDir": "out"
    }
}
//set to compile to ES5
```

So when you run the command 'tsc' in your terminal (where there is a TypeScript config file and TypeScript file present) - it will refer to the config file for instructions on what to do. In this case, it will compile the JavaScript file with:
- Targeting JavaScript ES5
- Using the commonjs module
- The JavaScript file will be allowed to compile
- The output file will be stored in a new directory called 'out'

This is useful if you are working on a large project and want to manage your TypeScript project.

There's a lot you can do with the TypeScript config file, check out this [page](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for more information about it.

Alright, let's take a look at some TypeScript - this is looking at recursion (calling a function, in a function):

```
//below is a puzzle - by starting from 1 and repeatedly either adding 5 or multiplying by 3, an infinite set of numbers can produced
//here's a function that given a number 
function findSolution(target:number) {
    //this inner function does the actual recursing - takes two arguments, the current number and a string of how we reached that number
    function find(current:number, history:string) {
        if (current == target) {
            //if the current number is the target number - return the history string
            return history;
        } else if (current > target) {
            //if no solution can be found - return null
            //this is also a way of resetting
            return null;
        } else {
            //it tries both possible paths that start from the current number by calling itself twice
            //once for addition and once for multiplication
            //if the first call (addition) returns something that is not null, it's returned
            //otherwise, the second call is returned (even if it produces a string or a null)
            return find(current + 5, `(${history} + 5)`) || find(current * 3, `(${history} * 3)`);
        }
    }
    //the first time find is called, it calls itself to explore
    return find(1, "1");
}

console.log(findSolution(24))
//this will return (((1 * 3) + 5) * 3)
```

So, when you call the findSolution function and pass in a number parameter. It will attempt to reach that number by multiplying by 3 or adding 5 to the number 1 until it reaches the target number.
As you can see where I define the function and the parameters - I state the type for each parameter. In this case, it's number. So when a value is assigned to the parameter, it has to be number. If it isn't a number (like a string or boolean) - then TypeScript will refuse to compile it and throw an error.

What I've also found with TypeScript is that Visual Studio Code provides some great extensions for it, such as intellisense and informing you of problems in real time. It's neat! I find that this gives me greater confidence when developing TypeScript applications.

Let's take a look at another example - this one will print a chessboard to the screen.

```
//new variables defined - size set and chessboard set to empty string
let size:number = 8;
let chessboard:string = ""

//first for loop, y initialised, which checks to see if it's less than the size and then increments it by 1
for (let y:number = 0; y < size; y++) {
    //second for loop, x initialised, which checks to if it's less than the size and then increments it by 1
    for (let x:number = 0; x < size; x++) {
        //if the combined value of x and y are divisible by 2 (even) - insert a blank space on the chessboard
        if ((x + y) % 2 == 0) {
            chessboard += " ";
        }
        //if not, enter a #
        else {
            chessboard += "#";
        }
    }
    //after the for loop for the x coordiantes are done, insert a new line
    chessboard += "\n";
}

console.log(chessboard);
```

This will print out a chessboard. This program has a nested for loop and if statement which determines wether a hash (#) or a space is needed. Once the variable 'y' is greater than the size variable, it inserts a new line.

And finally, something a little more complex....

```
//defining a new class
class VideoGame {
    //constructor with three properties and annotations
    constructor (public name: string, public platform: string, public year: number) {
        this.name = name;
        this.platform = platform;
        this.year = year;
    }

    //method to display games (calls each property)
    displayGames() {
        console.log('Name : ' + this.name)
        console.log('Platform : ' + this.platform)
        console.log('Year : ' + this.year + '\n')
    }
}

//sub class that inherits from VideoGame class
class VideoConsole extends VideoGame {
    constructor(public name: string, public year: number, public manufacturer: string, public controllerPorts: number)
    {
        //super declared as this is a sub class - all parameters from the parent class need to be defined in super, even if you give them a default value!
        super (name, 'Console', year);
        this.manufacturer = manufacturer;
        this.controllerPorts = controllerPorts;
    }

    //method to display consoles (calls each property)
    displayConsoles() {
        console.log('Name : ' + this.name);
        console.log('Year : ' + this.year);
        console.log('Manufacturer : ' + this.manufacturer);
        console.log('Number of controller ports : ' + this.controllerPorts + '\n');
    }
}

//function with a rest parameter - when you don't know how many parameters you need
function Greet (greeting: string, ...names:string[]) {
    console.log(greeting + " " + names.join(", ") + "!");
}

Greet("Hello", "Joshua", "Blewitt");

console.log("Welcome to your Video Game Database! \nLet's view some games!\n")
//create new instances of the VideoGame class
const WaveRace64 = new VideoGame ('Wave Race 64', "Nintendo 64", 1996)
const tacticsOgre = new VideoGame ('Tactics Ogre: Let us cling together', 'Super Nintendo Entertainment System', 1995)
const elevatorActionReturns = new VideoGame ('Elevator Action Returns', 'Sega Saturn', 1997)

//each instance calls the method displayGames
WaveRace64.displayGames()
tacticsOgre.displayGames()
elevatorActionReturns.displayGames()

console.log("Let's view some consoles!\n")
//create new instances of the VideoConsole sub class
const superNintendo = new VideoConsole ('Super Nintendo Entertainment System', 1992, 'Nintendo', 2)
const segaSaturn = new VideoConsole ('Sega Saturn', 1994, 'Sega', 2)
const nintendo64 = new VideoConsole ('Nintendo 64', 1996, 'Nintendo', 4)

//each instance calls the method displayConsoles
superNintendo.displayConsoles()
segaSaturn.displayConsoles()
nintendo64.displayConsoles()


let newArray = ['Wave Race 64', 'Tactics Ogre: Let us cling together', 'Elevator Action Returns']
console.log('Iterating through an array of game names!')
//for of loop to iterate each element in the array
for (var val of newArray) {
    console.log(val)
}
```

This creates a class, a subclass, a function with a rest parameter and more! It's a good example of what you can do in TypeScript.


I think TypeScript has made it easier for me to learn and enjoy JavaScript more - it's absolutely worth a look. I'm still learning it myself and the documentation that Microsoft have put together in the TypeScript [handbook](https://www.typescriptlang.org/docs/handbook/basic-types.html) is a good place to start.

Next week - coding problems!

Thanks for reading!