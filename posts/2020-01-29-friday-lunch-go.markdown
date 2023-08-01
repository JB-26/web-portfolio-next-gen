---
title:  "Solving the Friday lunch dilemma with Go 🍔"
date:   '2020-01-29'
---

A lot of people in my office like to go to lunch somewhere on Friday, typically a pub. In fact, I'm sure some of you might have gone to lunch with your colleagues on a Friday! But there is one problem that everyone will know when it comes to organising these sorts of things...

<i>Where do we go for lunch?</i> 🤔

It's one of the toughest questions in life, and there's so much choice!

You could spend a lot of time deciding on a place to go to lunch!

So, I decided to think of a way to get around this problem. A program that would pick a random place to go to for lunch on a Friday. It would be a good way to put into practice my knowledge of Go that I've learnt.

Let's get started!

By the way, if you want to look at the code or even modify it for your own use - you can find the repo [here](https://gitlab.com/JoshBl_/go/tree/master/PubPicker)

There's not too much code, so I'll post it here as well:

```
package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"time"
)

// Pub contains the ID, name and address
// fields capitalised so they can be exported
type Pub struct {
	Name            string
	Address         string
	TelephoneNumber string
}

// an array of the Pub struct
var pubs = []Pub{
	{
		Name:            "Ye Olde Swan",
		Address:         "Newport Rd, Woughton on the Green, Milton Keynes MK6 3BS",
		TelephoneNumber: "01908 679489",
	},
	{
		Name:            "The Wavendon Arms",
		Address:         "2 Newport Rd, Wavendon, Milton Keynes MK17 8LJ",
		TelephoneNumber: "01908 584277",
	},
	{
		Name:            "Cross Keys",
		Address:         "34 Newport Rd, Woolstone, Milton Keynes MK15 0AA",
		TelephoneNumber: "01908 528145",
	},
	{
		Name:            "Brewhouse & Kitchen",
		Address:         "7 Savoy Crescent, 12th Street MK9 3PU",
		TelephoneNumber: "01908 049032",
	},
	{
		Name:            "The Swan Inn",
		Address:         "Broughton Rd, Milton Keynes MK10 9AH",
		TelephoneNumber: "01908 665240",
	},
	{
		Name:            "The Barge",
		Address:         "15 Newport Rd, Woolstone, Milton Keynes MK15 0AE",
		TelephoneNumber: "01908 233841",
	},
	{
		Name:            "The Black Horse",
		Address:         "Wolverton Rd, Great Linford, Milton Keynes MK14 5AJ",
		TelephoneNumber: "01908 398461",
	},
}

func main() {
	fmt.Println("Fetching pubs - please wait...")
	check := true
	for check == true {
		fmt.Println("Welcome to PubPicker (v1.0)! If you're here then it must be Friday!\nAre you ready to pick a random pub?\n(Type Y for 'Yes' and N for 'No')")
		reader := bufio.NewReader(os.Stdin)
		text, err := reader.ReadString('\n')
		text = strings.TrimSpace(text)
		text = strings.ToUpper(text)

		if err != nil {
			fmt.Println(err)
		}

		switch text {
		case "Y":
			fmt.Println("Let's go to the pub!")
			fmt.Println("Now picking a random pub....")
			// pointer variable
			var randNum *int
			// assign value of function to variable
			randNum = numberGenerator()
			if err != nil {
				fmt.Print(err)
			}
			// printing the value at randNum variable
			fmt.Println("You're going to....")
			var pubNum int
			pubNum = *randNum
			fmt.Println(pubs[pubNum].Name)
			fmt.Println(pubs[pubNum].Address)
			fmt.Println(pubs[pubNum].TelephoneNumber)

			fmt.Println("Press enter to go back to the menu")
			enter, _ := reader.ReadString('\n')
			fmt.Println(enter)
		case "N":
			fmt.Println("Bye!")
			check = false
		default:
			fmt.Println("Error! Try again!")
		}
	}
}

// function returns an integer (pointer)
func numberGenerator() *int {
	lessThan10 := false
	var number int
	for lessThan10 == false {
		value := time.Now().Unix()
		rand.Seed(value)
		number = rand.Intn(100)
		if number <= 6 {
			lessThan10 = true
		}
	}
	// return the address of number variable
	return &number
}

```

So, let's start at the top and work our way down.

```
// Pub contains the ID, name and address
// fields capitalised so they can be exported
type Pub struct {
	Name            string
	Address         string
	TelephoneNumber string
}

// an array of the Pub struct
var pubs = []Pub{
	{
		Name:            "Ye Olde Swan",
		Address:         "Newport Rd, Woughton on the Green, Milton Keynes MK6 3BS",
		TelephoneNumber: "01908 679489",
	},
	{
		Name:            "The Wavendon Arms",
		Address:         "2 Newport Rd, Wavendon, Milton Keynes MK17 8LJ",
		TelephoneNumber: "01908 584277",
	},
	{
		Name:            "Cross Keys",
		Address:         "34 Newport Rd, Woolstone, Milton Keynes MK15 0AA",
		TelephoneNumber: "01908 528145",
	},
	{
		Name:            "Brewhouse & Kitchen",
		Address:         "7 Savoy Crescent, 12th Street MK9 3PU",
		TelephoneNumber: "01908 049032",
	},
	{
		Name:            "The Swan Inn",
		Address:         "Broughton Rd, Milton Keynes MK10 9AH",
		TelephoneNumber: "01908 665240",
	},
	{
		Name:            "The Barge",
		Address:         "15 Newport Rd, Woolstone, Milton Keynes MK15 0AE",
		TelephoneNumber: "01908 233841",
	},
	{
		Name:            "The Black Horse",
		Address:         "Wolverton Rd, Great Linford, Milton Keynes MK14 5AJ",
		TelephoneNumber: "01908 398461",
	},
}
```

First of all - we need some data of places where we go. For this, I've created a structure called Pub which has everything we need - the name, the address and the telephone number. I'm keeping these as strings as I'm only going to display them, I'm not doing anything interesting with these values.

But we need to store multiple pubs or places to eat, so I decided to create an array of the structure. This will be useful in later steps when we pick the index at random.

I've populated the array with a list of places that we commonly go to.

Great! Now we have a data structure created with an array of data! Let's get to the fun part of where we pick a random number! 🔢

```
// function returns an integer (pointer)
func numberGenerator() *int {
	lessThan10 := false
	var number int
	for lessThan10 == false {
		value := time.Now().Unix()
		rand.Seed(value)
		number = rand.Intn(100)
		if number <= 6 {
			lessThan10 = true
		}
	}
	// return the address of number variable
	return &number
}
```

So we have a for loop with an if statement which will check if the number is less than 6 (as there are 6 options in this case), if it is less than 6 - it will set the boolean (which I should rename) to true and end the loop.

Getting a random number involves creating a variable which uses the time package to get the current date and time as an integer. We then pass this value to rand.Seed to give it a value that it will use to generate other random values.

In practice, the process of waiting to get a random number that is less than 6 can take some time. This function will pick a random number and we have no control of what range the random number could be.

As you may have noticed, this function returns a pointer, as we need to return the value itself.

So now we have our random number, this needs to be used to help us pick a pub!

```
fmt.Println("Let's go to the pub!")
fmt.Println("Now picking a random pub....")
// pointer variable
var randNum *int
// assign value of function to variable
randNum = numberGenerator()
if err != nil {
	fmt.Print(err)
}
// printing the value at randNum variable
fmt.Println("You're going to....")
var pubNum int
pubNum = *randNum
fmt.Println(pubs[pubNum].Name)
fmt.Println(pubs[pubNum].Address)
fmt.Println(pubs[pubNum].TelephoneNumber)

fmt.Println("Press enter to go back to the menu")
enter, _ := reader.ReadString('\n')
fmt.Println(enter)
```

We assign the value of the random number (which is a pointer by the way) to a new variable, called pubNum. This is because a pointer won't work when trying to access an index of an array here, so we assign the value to a variable instead.

With that variable, we can now display information about the pub to the user!

Hooray! Friday lunch has been sorted! 🙌

If I need to add any more pubs or places to eat - I can just update the array and change the less than value for the random number generator. So it's very easy to manage.

And better yet, I can distribute the executable to my colleagues so they can use it!

Be sure to check back next week for another post!

Thanks for reading!