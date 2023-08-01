---
title: "Vehicle Fleet Manager in Python - Part 1 🐍"
date: "2020-12-22"
---

So I've been doing a lot of work in Python recently, and I decided to do a freeform challenge/project to put what I've learnt to the test.

And I have to say, I'm pretty proud of myself of what I've achieved!

In this (small) series of posts, I'll be taking you through a CLI Vehicle Fleet Manager I wrote in Python! I'll be breaking this down into separate blog posts as there is so much to cover here. The overall project is over 400 lines of code!

So in the first part, we'll be looking at registering a vehicle and displaying the vehicles in a garage.

Before we begin, here's the link to the repo on GitLab - click [here](https://gitlab.com/JoshBl_/python-vehicle-manager).

I strongly suggest you take a look while you're reading this!

With that in mind - let's get started!

## Register a vehicle

If you're going to keep track of a vehicle in a garage, you need to register it first. But how would we do this? I decided to use several classes:
1. A vehicle class
2. A Car class (which inherits from vehicle)
3. A Motorbike class (which inherits from vehicle)

Let's take a look at the base Vehicle class:
```
class Vehicle():
    def __init__(self, registration, brand, model, vehicleType):
        '''
        Initialise object
        '''
        self.brand = brand
        self.model = model
        self.registration = registration
        self.vehicleType = vehicleType
        self.dateCreated = datetime.datetime.now()
        self.inGarage = True
```

Okay, so whenever we want to make a new instance of the vehicle class we need to provide a registration, a brand, a model and a vehicle type!

Let's take a quick look at the classes that inherit the Vehicle class.

```
class Car(Vehicle):
    def __init__(self, brand, model, wheels, doors, engineType, year, registration):
        '''
        Initialise object
        '''
        try:
            Vehicle.__init__(self, registration, brand, model, 'Car')
            self.wheels = int(wheels)
            self.doors = int(doors)
            self.engineType = engineType
            self.year = year
        except(ValueError):
            print("Whoops! Something went wrong! Error details: ValueError")
```

```
class Motorbike(Vehicle):
    def __init__(self, registration, brand, model, wheels, engineType, year):
        '''
        Initialise object
        '''
        try:
            Vehicle.__init__(self, registration, brand, model, 'Motorbike')
            self.wheels = wheels
            self.engineType = engineType
            self.year = year
        except(ValueError):
            print("Whoops! Something went wrong! Error details: ValueError")
```

So we initialise the vehicle class and then provide information for the wheels, doors, the engine type and the year the vehicle was made.

But all of these vehicles need to be stored somewhere right? That's why we have the Garage class.

```
class Garage():
    def __init__(self):
        '''
        Initialise object
        '''
        self.garage = []
```

So the Garage class is a list, which is how we will be storing all the vehicle objects.

Okay, so let's take a look at the function for handling the registration process.

```
def registerCar():
    '''
    Process of adding a new car (object) to the garage (object/list)
    '''
    print('Enter the brand of the car:')
    carBrand = input('Brand name - ')
    print('Enter the car model:')
    carModel = input('Car model - ')
    print('Enter the number of wheels:')
    carWheels = vehicleNum()
    print('Enter the number of doors:')
    carDoors = vehicleNum()
    print('Enter the engine type:')
    carEngine = defineEngineType()
    print('Enter the year the car was manufactured in:')
    carYear = vehicleNum()
    print('Enter the car registration:')
    carRegistration = checkReg()

    print('Creating car!')
    newcar = Car(carBrand, carModel, carWheels, carDoors, carEngine, carYear, carRegistration)
    print('Car created!')
    print(f'Adding {carRegistration} to garage....')
    garage.addVehicleToGarage(newcar)
    print('Added!')
```

Nothing too exciting going on here. The purpose of this is to capture the input from the user. However, there are a few extra functions used here. Let's take a look at the VehicleNum function first.

```
def vehicleNum():
    '''
    When variable is going to be an int - function ensures that input is an int
    '''
    while True:
        try:
            numOfWheels = int(input('Value - '))
            return numOfWheels
        except(ValueError):
            print("Please enter a valid number!")
```

This function ensures that the user enters a number.

Next, the defineEngineType function.

```
def defineEngineType():
    '''
    Function for the user to choose what the engine type of the vehicle is
    '''
    while True:
        print('Enter the corresponding number for the engine type for the vehicle.\n1) Petrol\n2) Diesel\n3) Electric\n4) Hydrogen')
        try:
            engineChoice = int(input('Value - '))
            if engineChoice == 1:
                print('You have chosen Petrol')
                return 'Petrol'
            elif engineChoice == 2:
                print('You have chosen Diesel')
                return 'Diesel'
            elif engineChoice == 3:
                print('You have chosen Electric')
                return 'Electric'
            elif engineChoice == 4:
                print('You have chosen Hydrogen')
                return 'Hydrogen'
            else:
                print(f"{engineChoice} is not a valid option. Please try again!")
        except(ValueError):
            print("Please enter a valid number!")
```

This ensures that the user enters a valid choice for the engine type. Anything invalid is handled and the user has to try again.

And finally, the checkReg function. Which is the more exciting function here.

```
def checkReg():
    '''
    Function to check if the entered registration for vehicle exists
    '''
    while True:
        vehicleReg = input('Registration - ')
        regCheck = 0
        if len(garage) == 0:
            return vehicleReg
        else:
            for vehicle in garage:
                if vehicleReg == vehicle.registration:
                    regCheck += 1
                else:
                    pass
            if regCheck == 1:
                print(f'{vehicleReg} already exists - please try again!')
            else:
                return vehicleReg
```

When you're registering a vehicle, you don't want to enter a vehicle with a duplicate registration. That's just confusing! When you search for a vehicle, you might get two vehicles back! So how do we get around this?

After the user enters a vehicle registration, the program checks the length of the garage list. If it's zero, then it's safe to add the vehicle in.

If the length is not zero, the program goes through a for loop, checking each vehicle's registration against the entered value. If it's a match - then the regCheck integer is increased by one, if there is no match then nothing happens.
Finally, we reach the final if statement. It checks to see if the regCheck value is one. If it is - then the user needs to try again. If it isn't the registration value is returned.

Once all is said and done, we can finally create the new car/vehicle object and add it to the garage! Great!

## Displaying a vehicle

So we can add something to the garage, that's great and all, but what if we wanted to display the details of the vehicle we just registered? How do we do that?

This is very simple.

```
elif choice == 'V':
        print(garage)
        garage.numberOfvehicles()
```

I slightly lied, there's a lot going on here! For the print statement, we need to use a special method in the garage class.

```
def __str__(self):
        '''
        Print details for all the vehicles in the garage
        '''
        for vehicle in self.garage:
            print(vehicle)
            print('\n')
        return'\n'
```

But wait, if it prints the vehicle object, that needs it's own special method in the appropriate vehicle class!

```
def __str__(self):
        '''
        Display details of a car
        '''
        try:
            return f'Vehicle details:\nVehicle Type: {self.vehicleType}\nBrand: {self.brand}\nModel: {self.model}\nNumber of wheels: {self.wheels}\nNumber of doors: {self.doors}\nEngine Type: {self.engineType}\nYear: {self.year}\nRegistration: {self.registration}\nIn garage: {self.inGarage}\nDate added: {self.dateCreated}'
        except:
            print("Your car doesn't look right! Please edit the details and try again!")
```

So this will print out the details for each vehicle in the garage!

That's looking great, but this will show all the vehicles in the garage. What if we wanted to find the information for a particular vehicle?

Well, let's take a look!

```
elif choice == 'F':
        reg = input('Please enter the registration of the vehicle you want to find: ').upper()
        garage.findAVehicle(reg)
```

And let's take a look at that method...

```
def findAVehicle(self, reg):
        '''
        Takes a string (registration) and attempts to find an item in the list that matches it
        '''
        vehicleFound = False
        for vehicle in self.garage:
            if reg == vehicle.registration:
                print(vehicle)
                vehicleFound = True
                break
            else:
                pass
        if vehicleFound == False:
            print(f'No vehicle could be found with registration {reg}')
```

So this is very similar to the process for checking for duplicate registration details. We go through each vehicle and see if the registration matches any of them. If it matches, we print the details for that vehicle and set the vehicleFound boolean to True. If the boolean is false after the check, then we print a message saying that no vehicle was found with that registration.

So things are looking good so far. Next time, I'll walk through printing vehicle information to a text file!
Thanks for reading! 👋