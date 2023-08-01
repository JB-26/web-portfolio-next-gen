---
title: "Advent of Code 2022 - days 1, 2 and 3"
date: "2023-01-03"
description: "Day 3 was slightly tricky"
image: https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=4800
---

![](https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=4800)

It may be 2023, but that doesn’t mean that I’m too late for [Advent of Code 2022](https://adventofcode.com/)! If you don’t know what Advent of Code is, it’s a digital advent calendar that gives programming puzzles instead of chocolate.

If you want to see my repo for this, it’s on my [GitHub](https://github.com/JB-26/advent-of-code-2022).

I’ve always been fond of Advent of Code. It’s a good way to test your knowledge and learn new things about your programming language of choice.

As Advent of Code has completed for the year, I thought I’d share how I solved some of the challenges. Starting with the first three days.

# Day 1 - Calories

So, the first problem is that, using our puzzle input, we need to figure our which Elf is carrying the most calories. Should be simple enough!

So here is an example of the input

```markdown
1000
2000
3000

4000

5000
6000
```

The empty line represents a way of separating each Elf’s inventory. So, the first elf is carrying 6000 calories of food. Second elf is carrying 4000 calories. Third elf is carrying 11000 calories and so on.

To figure this out, we need to import the puzzle input into Python!

```python
with open('day1Input.txt') as csvFile:
	csv_reader = csv.reader(csvFile)
	elf = []
	for row in csv_reader:
		if row == []:
			elves.append(elf)
			elf = []
		else:
			elf.append(f'{", ".join(row)}')
```

This will iterate through each of the values in the puzzle input. Then, if it finds an empty value, that means we’ve found the separator. We then append this list to create a set of nested lists. Each list in the nested list represents each Elf’s inventory.

Now that we have that out of the way, we can crunch some numbers!

```python
count = 0
for i in elves:
    count += 1

print(f'Complete! There are {count} elves')

for elf in elves:
    caloriesTotal = 0
    for i in elf:
        caloriesTotal = caloriesTotal + int(i)
    calories.append(caloriesTotal)
print('Before')
print(calories)
calories.sort()
print("Calories list has been sorted!")
print(calories)
```

Quite a simple nested for loop. We iterate over the calories in each elf and add them together to create the total number of calories. This total is added to a new list called caloriesTotal. With the completed list, we can sort it. This brings us the value of the Elf with the highest amount of calories.

Part two involves finding the top three Elves and what the total is. This is simple as the list has been sorted so we can find the top three Elves and calculate the total.

# Day 2 - Rock Paper Scissors

The next puzzle involves Rock Paper Scissors and multiple columns.

This an example input

```markdown
A Y
B X
C Z
```

The first column is what the opponent will pick. In the above example, A is Rock. The second column is what we should pick in response. In this case, Y is paper. But our response also determines our score. The response we pick has a score and the outcome of the match has a score. So we need to determine what the total score is.

Let’s start by importing our puzzle input in with Python

```python
with open('day2Input.txt') as csvFile:
	csv_reader = csv.reader(csvFile, delimiter=' ')
	line_count = 0
	opponentColumn = []
	playerColumn = []
	for row in csv_reader:
		opponentColumn.append(f'{row[0]}')
		playerColumn.append(f'{row[1]}')
```

This is incredibly similar to day 1 with a small change, we’re using a delimiter. We know that the columns are separated by a space on each row, so by using the delimiter we can append each value to separate lists.

Moving on, let’s create the logic for calculating the score.

```python
for i in opponentColumn:
	numOfRounds += 1

while round < numOfRounds:
	print("Playing Rock, Paper, Scissors!")
	print(f"Round - {round}")
	print(f"Opponent picked - {opponentColumn[round]}")
	print(f"You picked - {playerColumn[round]}")

	if opponentColumn[round] == 'A' and playerColumn[round] == 'X':
		print('TIE')
		# shape
		playerScore += 1
		# match result
		playerScore += 3

	if opponentColumn[round] == 'A' and playerColumn[round] == 'Y':
		print('WIN')
		# shape
		playerScore += 2
		# match result
		playerScore += 6

	if opponentColumn[round] == 'A' and playerColumn[round] == 'Z':
		print('LOSE')
		# shape
		playerScore += 3
		# match result
		playerScore += 0

	if opponentColumn[round] == 'B' and playerColumn[round] == 'X':
		print('LOSE')
		# shape
		playerScore += 1
		# match result
		playerScore += 0

	if opponentColumn[round] == 'B' and playerColumn[round] == 'Y':
		print('TIE')
		# shape
		playerScore += 2
		# match result
		playerScore += 3

	if opponentColumn[round] == 'B' and playerColumn[round] == 'Z':
		print('WIN')
		# shape
		playerScore += 3
		# match result
		playerScore += 6

	if opponentColumn[round] == 'C' and playerColumn[round] == 'X':
		print('WIN')
		# shape
		playerScore += 1
		# match result
		playerScore += 6

	if opponentColumn[round] == 'C' and playerColumn[round] == 'Y':
		print('LOSE')
		# shape
		playerScore += 2
		# match result
		playerScore += 0

	if opponentColumn[round] == 'C' and playerColumn[round] == 'Z':
		print('TIE')
		# shape
		playerScore += 3
		# match result
		playerScore += 3

	round += 1

print('Finish!')

print(f'Total score is {playerScore}')
```

It’s not the most _graceful_ solution to the problem, but it solves the puzzle! It’s a series of if statements that goes through each possible scenario and assigns points to the total.

Part two of the puzzle reveals that the second column is how the match needs to end; win, tie or lose. So we need to make a few adjustments to what we had wrote

```python
while round < numOfRounds:
	print("Playing Rock, Paper, Scissors!")
	print(f"Round - {round}")
	print(f"Opponent picked - {opponentColumn[round]}")
	print(f"You picked - {playerColumn[round]}")

	if opponentColumn[round] == 'A' and playerColumn[round] == 'X':
		print('LOSE')
		# shape
		playerScore += 3
		# match result
		playerScore += 0

	if opponentColumn[round] == 'A' and playerColumn[round] == 'Y':
		print('TIE')
		# shape
		playerScore += 1
		# match result
		playerScore += 3

	if opponentColumn[round] == 'A' and playerColumn[round] == 'Z':
		print('WIN')
		# shape
		playerScore += 2
		# match result
		playerScore += 6

	if opponentColumn[round] == 'B' and playerColumn[round] == 'X':
		print('LOSE')
		# shape
		playerScore += 1
		# match result
		playerScore += 0

	if opponentColumn[round] == 'B' and playerColumn[round] == 'Y':
		print('TIE')
		# shape
		playerScore += 2
		# match result
		playerScore += 3

	if opponentColumn[round] == 'B' and playerColumn[round] == 'Z':
		print('WIN')
		# shape
		playerScore += 3
		# match result
		playerScore += 6

	if opponentColumn[round] == 'C' and playerColumn[round] == 'X':
		print('LOSE')
		# shape
		playerScore += 2
		# match result
		playerScore += 0

	if opponentColumn[round] == 'C' and playerColumn[round] == 'Y':
		print('TIE')
		# shape
		playerScore += 3
		# match result
		playerScore += 3

	if opponentColumn[round] == 'C' and playerColumn[round] == 'Z':
		print('WIN')
		# shape
		playerScore += 1
		# match result
		playerScore += 6

	round += 1

print('Finish!')

print(f'Total score is {playerScore} PART TWO')
```

Just a small adjustment to the if statements and the puzzle is solved.

**I know that this isn’t exactly entertaining, yet…**

# Day 3 - Rucksacks

This was a little tricky. Day 3 did increase the difficulty of the puzzles.

So, the Elves have rucksacks, that have two compartments. And we need to find the item type that appears in both compartments of each rucksack. A rucksack always has the same number of items in each of its two compartments.

So for this example:

```markdown
vJrwpWtwJgWrhcsFMMfFFhFp
```

We can split this in half to find the two items and that the common character between the two is a lowercase p (the item type)

But each item type has a priority value. Lowercase a to z (1 to 26). Uppercase A to Z (27 to 52).

So we need to find the sum of all the item types across all the rucksacks.

Let’s get started by importing the data:

```python
with open('day3Input.txt') as csvFile:
    csv_reader = csv.reader(csvFile)
    line_count = 0
    for row in csv_reader:
        rucksacks.append(f"".join(row))
```

And creating our dictionary of the values per item type

```python
lettersScore = {
    'a': 1,
    'b': 2,
    'c': 3,
    'd': 4,
    'e': 5,
    'f': 6,
    'g': 7,
    'h': 8,
    'i': 9,
    'j': 10,
    'k': 11,
    'l': 12,
    'm': 13,
    'n': 14,
    'o': 15,
    'p': 16,
    'q': 17,
    'r': 18,
    's': 19,
    't': 20,
    'u': 21,
    'v': 22,
    'w': 23,
    'x': 24,
    'y': 25,
    'z': 26,
    'A': 27,
    'B': 28,
    'C': 29,
    'D': 30,
    'E': 31,
    'F': 32,
    'G': 33,
    'H': 34,
    'I': 35,
    'J': 36,
    'K': 37,
    'L': 38,
    'M': 39,
    'N': 40,
    'O': 41,
    'P': 42,
    'Q': 43,
    'R': 44,
    'S': 45,
    'T': 46,
    'U': 47,
    'V': 48,
    'W': 49,
    'X': 50,
    'Y': 51,
    'Z': 52
}
```

_I know, it’s not elegant._

And now, for the logic for calculating the sum of the item types in each rucksack

```python
# part one
for i in rucksacks:
    firstPartMatch = []
    tempListFull = [*i]
    # slicing strings
    tempListFirst = [*i[:int(len(i) / 2)]]
    tempListSecond = [*i[int(len(i) / 2):]]
    is_looping = True
    for i in tempListSecond:
        for x in tempListFirst:
            if i == x:
                totalSum += lettersScore[x]
                is_looping = False
                break
        if not is_looping:
            break

print(totalSum)
totalSum = 0
```

There’s a lot going on in the first few lines so let’s break it down.

In this for loop:

- tempListFull is created by unpacking an item. This creates a list of the individual characters.
- Next we begin splitting the string into two separate lists (tempListFirst and tempListSecond). We use unpacking and slicing. The calculation is the same but the colon is in different places depending on if it’s the first half or the second half of the string we need.
- In the next for loop:
  - We iterate each character in both lists. We compare an item from the first half to each character in the second half. If there’s a match, it’ll find the value of that character and add it to the total score.
  - At this stage, we set a boolean to false. This is important as we need it to break out of the nested for loop.
  - If the boolean is false, we break out of the nested loop.

After the loop is complete, we print out the total sum. Puzzle completed!

_Except there is a part two_

Now we need to find the matching character against three items.

```python
elf_rucksack = []
for i in rucksacks:
    unpacked_item = [*i]
    elf_rucksack.append(unpacked_item)
    if len(elf_rucksack) == 3:
        first_item = elf_rucksack[0]
        second_item = elf_rucksack[1]
        third_item = elf_rucksack[2]
        is_looping = True
        for x in first_item:
            for y in second_item:
                if x == y:
                    match_char = x
                    for z in third_item:
                        if z == x:
                            totalSum += lettersScore[x]
                            is_looping = False
                            break
                    break
            if not is_looping:
                elf_rucksack.clear()
                first_item.clear()
                second_item.clear()
                third_item.clear()
                break
print(totalSum)
```

Ohhhh boy this looks fun. Let’s break it down.

- So, we unpack the item from the list and then append it to a new list, elf_rucksack. We keep doing this until there are three items
- Once there are three items, we take each item and assign it to either first item, second item or third item.
- In the next nested For loops:
  - We check characters from the first two items and try to find a matching character.
  - If there is a matching character, we move into the next for loop.
    - We compare the matching character to characters in the third item. If there is a match, we use the dictionary to find the score and add it to the total.
  - Now we break out of the loop (twice)
- And use the boolean variable again to break out of the nested loop entirely.
- And **finally** print the total

And that is day 3 completed!

# Conclusion

The first two days were not as challenging as day three. It was good to use slicing and unpacking as part of solving day three as I haven’t used that in a while. I’m not sure if I’ll complete all 25 challenges (as the puzzles do get complex) but I’ll see how many I can solve!
