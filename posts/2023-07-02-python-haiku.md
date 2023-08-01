---
title: "Checking the number of syllables in a haiku"
date: "2023-07-02" #YYYY-MM-DD
description: "A small Python program!"
image: https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=4800
---

It’s been a while since I actually sat down and wrote some Python code. So recently I decided to write a small program that:

- Calculates the number of syllables in a haiku
- Tells the user if their haiku has too many syllables or not
- Tells the user which line has too many syllables
- Writes the haiku and other information to a file

Nothing too complex, I just wanted to go ahead and write this because I wanted to write some fun Python code, and at the place I work at, I was told once to give the team’s update in a Haiku. I worked on a Haiku, but to my horror, it turns out that what I wrote *wasn’t* a haiku.

So I guess I decided to write something that will check if a haiku is actually a haiku! If you want to see the code for this, you can check out the repo on [GitHub](https://github.com/JB-26/haiku-check-terminal).

But how can this be done?

I checked the Python Package index and sure enough, there is a package for checking the number of [syllables](https://pypi.org/project/syllables/) there are in a string.

And to make this terminal application look fancy, I decided to use [rich](https://github.com/Textualize/rich) because it’s fantastic.

That’s all there is to this application, nothing special!

Let’s take a look at the main function

```python
def main():
    """
    The main function for the application
    """
    console = Console()
    console.print(Panel.fit("Welcome to [bold green]Haiku Check![/bold green]"))
    console.print(Panel.fit(
        "[italic yellow]Please type the letters that are highlighted in green to access the functions[/italic yellow]\n[bold green]C[/bold green]heck Haiku\n[bold green]Q[/bold green]uit",
            title="Haiku Check ⛩️", subtitle="By Joshua Blewitt"))
    while True:

        console.print(Panel.fit("[bold yellow]Enter your command[/bold yellow]"))
        choice = input().upper()

        if choice == 'C':
            checkHaiku()
        elif choice == 'Q':
            console.print("Goodbye!")
            break
        else:
            console.print("[bold red]Your command was invalid! Please try again![/bold red]")

if __name__ == "__main__":
    main()
```

This main function is more of an excuse to use rich to make a nice looking interface in the terminal. 

Next, the more interesting part of the application; actually checking if a user entered haiku, is a haiku.

```python
def checkHaiku():
    """
    Checks entered text to find the syllables in each word
    """
    try:
        console = Console()
        console.print("Let's check your haiku!")

        console.print('This program assumes your haiku has three lines, following the 5-7-5 pattern for syllables.')

        console.print('Enter your first line of your haiku')

        firstLine = input()

        firstLineList = firstLine.split()

        firstSyllables = iteratelist(firstLineList, '1')

        console.print(f'The first line had {firstSyllables} syllables')

        console.print("Enter your second line of your haiku")

        secondLine = input()

        secondLineList = secondLine.split()

        secondSyllables = iteratelist(secondLineList, '2')

        console.print(f'The second line had {secondSyllables} syllables')

        console.print("Enter your third line of your haiku")

        thirdLine = input()

        thirdLineList = thirdLine.split()

        thirdSyllables = iteratelist(thirdLineList, '3')

        console.print(f'The third line had {thirdSyllables} syllables')

        if firstSyllables == 5 & secondSyllables == 7 & thirdSyllables == 5:
            console.print('[bold green]That is a haiku![/bold green]')
        else:
            console.print('[bold red]That is not a haiku![/bold red]')
            if firstSyllables - 5 <= 0:
                pass
            else:
                console.print(f'The first line had {firstSyllables} syllables, the first line needs 5 lines. This line has a difference of {firstSyllables - 5} syllables')
            if secondSyllables - 7 <= 0:
                pass
            else:
                console.print(f'The second line had {secondSyllables} syllables, the first line needs 5 lines. This line has a difference of {secondSyllables - 7} syllables')
            if thirdSyllables - 5 <= 0:
                pass
            else:
                console.print(f'The second line had {thirdSyllables} syllables, the first line needs 5 lines. This line has a difference of {thirdSyllables - 5} syllables')

        now = datetime.now()
        haikuFile = (f'{now.day} - {now.month} - {now.year} - {now.hour} - {now.minute} - {randomword(5)}')
        console.print(f'[italic yellow]Writing results to text file. File is called {haikuFile}[/italic yellow]')
        file = open(f'{haikuFile}', 'w')
        file.write(f"{firstLine}\n{secondLine}\n{thirdLine}\n\nThe first line had {firstSyllables} syllables\nThe second line had {secondSyllables} syllables\nThe third line had {thirdSyllables} syllables")
        file.close()
    except Exception as e:
        raise e
```

There’s a bit to unpack here, so we’ll start with loading in each line of a haiku.

The package that’s used to calculate the syllables states that it estimates the number of syllables in a single word. So if a user enters multiple words, then it won’t work. How do we get around that?

This was my solution to the problem:

```python
def iteratelist(linelist, linenum):
    """
    Goes through each item in a list and finds the number of syllables. Returns the total number of syllables
    """

    console = Console()
    table = Table(title=f"Haiku Line {linenum}")
    table.add_column("Word", justify="center", style="cyan")
    table.add_column("Syllables", justify="center", style="cyan")
    totalsyllables: int = 0

    for word in linelist:
        totalsyllables += syllables.estimate(word)
        table.add_row(word, str(syllables.estimate(word)))

    console.print(table)

    return totalsyllables
```

This function uses a bit more of rich to create a table, to display the results of the line entered. And there is a for loop to iterate over each word to calculate the syllables. Then, the table is printed to the terminal, while the total number of syllables is returned.

Once we have the total number of syllables for each line, we can begin the logic of checking if each line has the correct number of syllables. If it does, then great! The user will be told that their haiku is correct. If not, the user will be told that their haiku is not a haiku. And, the user will be told which line has the incorrect number of syllables.

Finally, we print the haiku and the number of syllables for each line.

But, the name of the file is made up of the day, month, year, hour, minute, and 5 random letters. This is done by the following function:

```python
def randomword(length):
    """
    Generates a random word, based on the length provided
    """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))
```

This ensures that each file has a unique name.

And that wraps up the program!

It’s been fun to write some Python again, going to have to think of some more problems that I can solve with Python (or another language).

Thanks for reading!