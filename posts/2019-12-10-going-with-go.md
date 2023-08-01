---
title:  "Get going with Go! 🏃‍♂️"
date:   '2019-12-11'
---
<h1>Introduction</h1>

If you look at the most recent Stack Overflow Developer [Survey](https://insights.stackoverflow.com/survey/2019#most-loved-dreaded-and-wanted), you'll find that the third most wanted language is Go and the ninth most loved language. So for this weeks post - I'll be taking a look into [Go](https://golang.org/).

Go is designed for developers to be more productive which makes it easy to build software, and is an open source langauge by Google. Go is often described as being similar to C, but with memory safety and garbage collection.

The repo for my Go code can be found [here](https://gitlab.com/JoshBl_/go).

Let's dive in with a hello world example!

```
package main

import "fmt"

func main() {
	fmt.Println("Hello World")
}
```

Programs written in Go are read from top to down and left to right. We start with declaring a package - this is used so that an executable file will be created if we use the 'go build' in a terminal.

Next, we have an import statement, this allows us to use code from other packages! This also helps with speed as you only import the packages you need.

Then we have a function - a reusable block of code. However, for this example we are using main. By default, Go programs will run from the main function!

Finally, we have our print statement. Notice this is using the 'fmt' package! We access the package and then use the 'Println' function to print the hello world message for us!

<h1>Examples</h1>

So that's a brief look at the overall structure of code in Go, let's look at some other examples:

```
package main
import "fmt"

func main() {
  var publisher, writer, artist, title string
  var year, pageNumber int
  var grade float32
  var value int
  
  title = "Mr. GoToSleep"
  writer = "Tracey Hatchet"
  artist = "Jewel Tampson"
  publisher = "DizzyBooks Publishing Inc."
  year = 1997
  pageNumber = 14
  grade = 6.5
  value = year / pageNumber
  
  fmt.Println(title, "written by", writer, "\nDrawn by", artist, "\nPublished by", publisher, "\nReleased in", year, "Book has", pageNumber, "pages", "\nGrade is", grade)
  
  fmt.Println("If we were to divide the year by pageNumber we'd get...", value)

  title = "Epic Vol. 1"
  writer = "Ryan N. Shawn"
  artist = "Phoebe Paperclips"
  year = 2013
  pageNumber = 160
  grade = 9.0
  value = year / pageNumber
  
  fmt.Println("-----------------")
  
  fmt.Println(title, "written by", writer, "\nDrawn by", artist, "\nPublished by", publisher, "\nReleased in", year, "Book has", pageNumber, "pages", "\nGrade is", grade)
  fmt.Println("If we were to divide the year by pageNumber we'd get...", value)
}
```

In this example, we have variables defined and printing. Plus, we have the use of some calculations as well. But this is isn't totally exciting - let's move onto a better example:

```
package main

import "fmt"

func fuelGuage(fuel int) {
	fmt.Printf("\nPilot - you have %d fuel left!", fuel)
}

func calculateFuel(planet string) int {
	var fuel int
	switch planet {
	case "Venus":
		fuel = 300000
	case "Mercury":
		fuel = 500000
	case "Mars":
		fuel = 700000
	default:
		fuel = 0
	}
	return fuel
}

func greetPlanet(planet string) {
	fmt.Printf("\nAttention everyone, we are now approaching %v", planet)
}

func cantFly() {
	fmt.Println("\nWe do not have the available fuel to fly there")
}

func flyToPlanet(planet string, fuel int) int {
	var fuelRemaining int
	var fuelCost int

	fuelRemaining = fuel
	fuelCost = calculateFuel(planet)
	if fuelRemaining >= fuelCost {
		greetPlanet(planet)
		fuelRemaining -= fuelCost
	} else {
		cantFly()
	}
	fuelGuage(fuelRemaining)
	return fuelRemaining
}

func main() {
	var fuel int = 1000000
	var planetChoice = "Venus"
	flyToPlanet(planetChoice, fuel)

	planetChoice = "Mars"

	flyToPlanet(planetChoice, fuel)
}
```

So this example introduces some new functionality. Lets look at verbs!

```
func fuelGuage(fuel int) {
	fmt.Printf("\nPilot - you have %d fuel left!", fuel)
}
```

The %d is a verb, which allows us to print a variable! In this case, we are printing the value assigned to fuel (which is an integer). This functionality is part of the 'fmt' package - look at the ['fmt'](https://golang.org/pkg/fmt/) documentation for more information.

Everything else here isn't particularly new if you're familiar with other languages - let's look at something that I've been writing recently in Go.

Although it's a work in progress - it's the famous Josh Bank! 🎉

```
// JoshBank Go Program
package main

// import packages
import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"reflect"
	"time"
)

// new function to iterate through the currency interface
func printRates(currency map[string]interface{}) {
	fmt.Println("These are currency rates for", time.Now())
	for key, value := range currency {
		fmt.Println(key, value)
	}
}

// main function
func main() {
	fmt.Println("Welcome to Josh Bank! Enter the three character code for your preferred currency!")
	// new variable
	var value string
	// empty interface for Unmarshal
	var result map[string]interface{}
	// read input from user and assign to value string
	fmt.Scan(&value)
	fmt.Println("The type of the variable, value, is", reflect.TypeOf(value))
	// using verb to print what the user selected
	fmt.Printf("You have selected - %v\n", value)
	// two variables (response and error) which stores the response from the GET request
	response, err := http.Get("https://api.exchangeratesapi.io/latest?base=" + value)
	// read the body of the GET request
	rates, err := ioutil.ReadAll(response.Body)
	fmt.Println("The type of the variable response is", reflect.TypeOf(response))
	fmt.Println("The type of the variable err is", reflect.TypeOf(err))
	fmt.Println("The type of the variable rates is", reflect.TypeOf(rates))
	// Unmarshal or Decode the JSON, result stored in interface
	json.Unmarshal([]byte(rates), &result)
	fmt.Println("The type of the variable result is", reflect.TypeOf(result))
	// creating a new interface which is looking at an embedded object
	currency := result["rates"].(map[string]interface{})
	fmt.Println("The type of the variable currency is", reflect.TypeOf(currency))
	// close the response body once finished with it
	response.Body.Close()
	// if the GET request returns an error, print it
	if err != nil || currency == nil {
		fmt.Println("Error! Please try again!")
		fmt.Println(err)
	} else {
		fmt.Println("Success!")
	}

	fmt.Println("\nWelcome! What would you like to do?")
	printRates(currency)
}

```

So this Go program does feature some more packages as I am parsing a JSON response etc.

Let's dive in! First let's take a look at what happens when I run it:

```
Welcome to Josh Bank! Enter the three character code for your preferred currency!
GBP
The type of the variable, value, is string
You have selected - GBP
The type of the variable response is *http.Response
The type of the variable err is <nil>
The type of the variable rates is []uint8
The type of the variable result is map[string]interface {}
The type of the variable currency is map[string]interface {}
Success!

Welcome! What would you like to do?
These are currency rates for 2019-12-12 21:36:43.8552079 +0000 GMT m=+3.040908601
ZAR 19.3055818354
ILS 4.5824266793
KRW 1565.0307473983
SEK 12.3574976348
CNY 9.268448439
ISK 161.660359508
GBP 1
MYR 5.4782403027
TRY 7.6147114475
CAD 1.7355723746
PHP 66.7880794702
CHF 1.2936376537
AUD 1.9116603595
HUF 389.545884579
CZK 30.1785714286
RUB 82.8861163671
NZD 1.9992904447
MXN 25.1692289499
HKD 10.2794465468
DKK 8.8377483444
BRL 5.4148533586
THB 39.7421948912
BGN 2.3129139073
PLN 5.0657521287
INR 93.3485099338
HRK 8.7973036897
EUR 1.1825922422
RON 5.6517265847
IDR 18484.8391674551
JPY 143.0345316935
NOK 11.9855723746
USD 1.3170529801
SGD 1.7877246925
```

Let's look at getting a response from a user:

```
// read input from user and assign to value string
fmt.Scan(&value)
```

Scan is part of the ['fmt'](https://golang.org/pkg/fmt/) package and allows to read user input and assign the response to a variable.

So after we have input from the user, we need to perform a HTTP request.

```
// two variables (response and error) which stores the response from the GET request
response, err := http.Get("https://api.exchangeratesapi.io/latest?base=" + value)
// read the body of the GET request
rates, err := ioutil.ReadAll(response.Body)
```

When looking at the ['http'](https://golang.org/pkg/net/http/) package for a GET request, you do need to have two variables; a variable that holds the response and a variable that holds any errors. Then we read the body of the get request and that is stored in the rates variable.

But now we need to parse the information from the response as this does return a nested JSON.

We get round this problem by using 'unmarshall' from ['encoding/json'](https://golang.org/pkg/encoding/json/#example_RawMessage_unmarshal).

```
// Unmarshal or Decode the JSON, result stored in interface
json.Unmarshal([]byte(rates), &result)
```

We store the decoded JSON of this in an interface called result.

But we're not done yet, we still need to look at the currency rates in the embedded object.

```
// creating a new interface which is looking at an embedded object
currency := result["rates"].(map[string]interface{})
```

So now we focus on the rates object and assign it to a new interface called currency!

I should also mention about finding the type of a variable through the ['reflect'](https://golang.org/pkg/reflect/) package.

```
fmt.Println("The type of the variable response is", reflect.TypeOf(response))
```

This then will return the following when the Go program is run:

```
The type of the variable response is *http.Response
```

Finally, I want to take a look at Addresses and Pointers!

```
star := "Polaris"

starAddress := &star
fmt.Printf("The address of star is %v", starAddress)
```

When we run the code above, the address for the star variable is 0xc0000461f0!

An address is where a value is stored, to do that we use the '&' operator! A pointer is a variable that can store an address.

You can also use deferencing if you want to change the value held in a pointer:

```
star := "Polaris"

starAddress := &star

*starAddress = "Sirius"
fmt.Println("The actual value of star is", star)
```

You use the * operator to deference a pointer and assign a new value!

I'm enjoying Go, I'll have to spend more time working on Josh Bank to get it in a better place!

Make sure you check out next week's post!

Thanks for reading! 👏