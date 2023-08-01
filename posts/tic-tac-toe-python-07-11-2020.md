---
title: "Building Tic Tac Toe in Python 🐍"
date: "2020-11-07"
---

Recently I've been learning Python through a course on Udemy and one of the milestone projects involved creating Tic Tac Toe, which could be played by 2 people at the same computer.

So I thought I'd share my solution to this challenge.

Let's take a look at what the output looks like before we dive in:

![Python screenshot](https://i.imgur.com/gJhzdm3.jpg)

##Displaying the board

First question that some might ask, how would I be able to visualise the board?

For this, I used a list:
```
gameboard = ['#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
gamecontinue = True
currentplayer = 0
```
(The other variables will be used later on)

The value at index 0 is # - this is never used so it's there to remind me to focus on using index 1-9.

So we have a list, let's display this list as a board for the user:

```
def display_board(board):
    """
    Function for displaying the game board
    """
    print(f'{board[7]} | {board[8]} | {board[9]}')
    print(f'{board[4]} | {board[5]} | {board[6]}')
    print(f'{board[1]} | {board[2]} | {board[3]}')
```

We can see that only elements 1-9 from the list are being printed with a pipe character between each one, we now have our own Tic Tac Toe board displayed for the user.

##Setting Player 1 and Player 2

Tic Tac Toe needs two players where one player uses 'X' characters and the other player uses 'O' characters to play.

So how do we go about doing this in Python?

Well, here's what I came up with:

```
def player_input():
    """
    Function for taking input to assign markers for players 1 and 2
    """
    print('Welcome to Tic Tac Toe!')
    marker = ''

    while marker != 'X' and marker != 'O':
        marker = input('Player 1 - do your want your marker to be X or O? ').upper()
    
    player1 = marker

    if player1 == 'O':
        player2 = 'X'
    else:
        player2 = 'O'

    return [player1, player2]
```

So here I'm asking for input from Player 1 and I'm checking to make sure if it's either 'X' or 'O' through a while loop.

Once that's done, I set the Player 1 variable to hold the value from the user.

But what about Player 2?

The value for Player 2 is set by an if statement - where if the value for Player 1 is X, Player 2 will be O and vice versa.

Once the markers have been set, I return both players as a list.

##Choosing a place on the board

We have our board, we have our players, now lets look at getting input from a player on where they want to place their marker on the board.

Here's what I did for this:
```
def choose_place():
    """
    Function for selecting for a player to choose where they want to place a character
    """
    valuecheck = False

    while valuecheck == False:
        choice = input("Please choose a digit between 1-9: ")

        if choice.isdigit():
            choice = int(choice)
            if choice <= 9:
                print(f"You have selected {choice}")
                valuecheck = True
                return choice
            else:
                print("Whoops! Please try again!")
        else:
            print("Whoops! Please try again!")
```

For this, I chose to have a nested if statement within a while loop. At first, the function checks that if the input is a digit (through isdigit). If it isn't an integer, the user is prompted again. If it is an integer however, the value is saved to the choice variable as an integer. The value is then checked to see if it's less than or equal to 9. If it is, then the while loop ends and the value is returned. If it is greater than 9, then the user will need to enter an input again.

##Placing the marker

At this stage, we have the baord, the position and the marker. Now we can actually place the marker onto the board where the user has specified.

Here's what I did to achieve this:

```
def place_char(board, position, marker):
    """
    Function for placing a character at a position on the board
    """
    print(f'Now placing {marker} at {position}')
    board[position] = marker
```

This function takes three arguments; the board, the position and the marker

The board, at the chosen index, is updated with the marker. Great! The user can now place a marker where they want on the board!


##Checking for a winner

After a user has placed a marker, the program will need to check if there's a winner right? To do that, we have this function:

```
def win_check(board, mark):
    """
    Checks to see if there is a winner, returns a boolean
    """

    return((board[1] == mark and board[2] == mark and board[3] == mark) or # bottom row
    (board[4] == mark and board[5] == mark and board[6] == mark) or # middle row
    (board[7] == mark and board[8] == mark and board[9] == mark) or # top row
    (board[7] == mark and board[4] == mark and board[1] == mark) or # down the middle
    (board[8] == mark and board[5] == mark and board[2] == mark) or # down the middle
    (board[9] == mark and board[6] == mark and board[3] == mark) or # down the right side
    (board[7] == mark and board[5] == mark and board[3] == mark) or # diagonal
    (board[9] == mark and board[5] == mark and board[1] == mark)) # diagonal
```

This lists all the possible combinations, each separated by using or. If one of these combinations is correct, then the function will return true.

##Do you want to play again?

Once a winner has been declared, the program will ask the players if they want to play again.

Here's how I did that:

```
def play_again():
    check = False
    while check == False:
        retry = input('Do you want to play again? [Y]es or [N]o: ').upper()
        if retry == 'Y':
            check = True
            return True
        elif retry == 'N':
            print("Thanks for playing!")
            check = True
            return False
        else:
            print("I don't understand that - try again!")
```

A while loop is used to check if the user selects 'Y' or 'N' and depending on their choice, the function will return true or false.

##Putting it all together

Now we have our functions, it's time to put them into use!

```
players = player_input()
while gamecontinue == True:
    print(f"It is player {currentplayer + 1}'s turn!")
    display_board(gameboard)
    position = choose_place()
    place_char(gameboard, position, players[currentplayer])
    if win_check(gameboard, players[currentplayer]):
        print(f'Player {currentplayer + 1} wins!')
        display_board(gameboard)
        gamecontinue = play_again()
        if gamecontinue == True:
            gameboard = ['#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
    else:
        if currentplayer == 0:
            currentplayer = 1
        else:
            currentplayer = 0
```

The player number is displayed (by incrementing the value by 1 to display it correctly for the user) first, so the correct player can enter the position of where they want to put their marker.

After the marker is placed, if the win_check function returns true, then the players are asked if they want to play again. If they say yes, then the values on the board are reset.

If there is no winner, the value of current player is switched so it will be the other players turn.

And that's it! Tic Tac Toe in Python!

Thanks for reading 👏

