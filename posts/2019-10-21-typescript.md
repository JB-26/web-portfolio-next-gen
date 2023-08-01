---
title:  "A quick look at TypeScript"
date:   '2019-10-21'
---
I hate JavaScript.

I really do.

I don't get along with it, and I often end up hitting brick walls with it.

But then a colleague of mine showed me [TypeScript](https://www.typescriptlang.org/index.html) and ever since then I've become a supporter of it.

For reference, [here](https://gitlab.com/JoshBl_/typescript-practice/tree/master/Class) is the code that we are looking at. In fact, this code is based on a JavaScript [project](https://gitlab.com/JoshBl_/videogame-list-javascript).

I decided to rewrite the JavaScript project in TypeScript and compile it to see the differences (compiling is achieved by typing 'tsc' followed by the TypeScript file in a CLI)

Here's a class declared in TypeScript:

```
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
```

And here's the same class in JavaScript:

```
lass videoGame {
    constructor(name, platform, year)
    {
        this._name = name
        this._platform = platform
        this._year = year
    }

    //getters for each of the specified parameters
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

The biggest difference is that there is no need for getters in TypeScript in a class for parameters. Also, the constructor in TypeScript allows you to define properties with annotations. In this case, the annotation is defining if the property is public and what type it is.

TypeScript is object orientated with classes where it is very similar to C# so if you're coming from a C# or Java background then TypeScript allows you to write JavaScript the way you want.

Plus, Visual Studio Code offers a huge amount of support for it.

I think TypeScript is an interesting language and I want to learn more and build more with it.

Apologies for the short post again this week - I've been busy working on something next week. Ruby on Rails!

Thanks for reading!