---
title: "Vehicle Fleet Manager in Python - Part 2 🐍"
date: "2020-12-28"
---

Welcome back!

It's time for part 2 of this Python series of my Vehicle Fleet Manager program.

In case you haven't read part one, please do! You can find part 1 [here](https://joshblewitt.dev/blog/2020-12-22-python-vehicle-1/)

And if you haven't cloned the repo for this project, you can do so [here](https://gitlab.com/JoshBl_/python-vehicle-manager)

Alright, with that out of the way, let's continue!

## Printing vehicle information to a text file

So we have some vehicles entered, we can display them, we can handle errors - things are looking good so far!

But what if the user wants to print the information of all the vehicles or just one vehicle to a text file?

Let's take a look and find out!

```
def printChoice():
    '''
    Function to decide if the user wants to print information of all vehicles to a text file or a single vehicle to a text file
    '''
    printStatus = True
    while printStatus == True:
        try:
            print('Please choose the corresponding number if you want to print ALL vehicles in the garage or just ONE vehicle.\n1) All vehicles\n2) One vehicle')
            choice = int(input('Enter value - '))
            if choice == 1:
                garage.writeToFile()
                print(f'File written to {os.getcwd()} - called vehicle_log.txt')
                printStatus = False
            elif choice == 2:
                fileName = garage.writeOneVehicleToFile()
                print(f'File written to {os.getcwd()} - called {fileName}')
                printStatus = False
            else:
                print(f"{choice} is not a valid option. Please try again!")
        except(ValueError):
            print('Please enter a valid number!')
```

So the user has a choice of writing all the vehicle information to a text file or a specific vehicle to a text file.

Let's take a look at writing all the vehicles in the garage to a text file.

```
def writeToFile(self):
        '''
        Method to print all vehicles information to a text file
        '''
        file = open('vehicle_log.txt', 'w')
        file.write(f'File created on {datetime.datetime.now()}\n')
        for vehicle in self.garage:
            text = vehicle.info()
            file.write(text+'\n\n')
        file.close()
```

We create a file and write vehicle information to it via a for loop. Once the loop is complete, the file is then closed. After that, the user is notified that the file has been written to their current working directory. Fairly straight forward stuff.

But looking at writing information for a specific vehicle is a little trickier!

```
def writeOneVehicleToFile(self):
        '''
        Method to print one vehicle information to a text file
        '''
        while True:
            vehicleFound = False
            print('Enter the registration of the vehicle you want to write to a file')
            vehicleReg = input('Registration - ')
            for vehicle in self.garage:
                if vehicleReg == vehicle.registration:
                    fileName = f'{vehicle.registration}_info.txt'
                    print(f'File will be called {fileName}')
                    file = open(f'{fileName}', 'w')
                    file.write(f'File created on {datetime.datetime.now()}\n')
                    text = vehicle.info()
                    file.write(text+'\n')
                    file.close()
                    vehicleFound = True
                    return fileName
                else:
                    pass
            if vehicleFound == False:
                print('No vehicle could be found, please try again!')
```

The user enters the registration for a vehicle that they want to print to a text file. Then, the registration entered is check in a for loop against every vehicle in the garage. If there's a match, then the information is printed out and the file name is the registration with '_info' added to the end. The boolean value for 'vehicleFound' is changed to True and the file name is then returned to be printed to the user with the current working directory.

If there isn't a match, then the user is told to try again.

## In the Garage or not?

I added a boolean attibute to each vehicle object to track whether or not the vehicle was in the garage or not. So the user has a choice to toggle the value between True and False for a vehicle with the following method (under the Garage class):

```
def isInGarage(self):
        '''
        Changes the bool value for inGarage attribute for a vehicle
        '''
        vehicleFound = False
        print('Enter the registration of the vehicle to retrieve status of the vehicle')
        reg = input('Enter registration - ')
        for vehicle in self.garage:
            if reg == vehicle.registration:
                vehicleFound = True
                print(f"The current status of the vehicle is {vehicle.inGarage}")
                status = vehicle.inGarage
                if status == True:
                    while True:
                        print('Do you want to change the status to False? (Vehicle is NOT in the garage)\nEnter (Y)es or (N)o')
                        boolean = input('Input - ').upper()
                        if boolean == 'Y':
                            vehicle.inGarage = False
                            print(f'{reg} updated to False')
                            break
                        elif boolean == 'N':
                            print(f'{reg} not updated')
                            break
                        else:
                            print("I don't understand that - please try again!")
                else:
                    while True:
                        print('Do you want to change the status to True? (Vehicle is IN the garage)\nEnter (Y)es or (N)o')
                        boolean = input('Input - ').upper()
                        if boolean == 'Y':
                            vehicle.inGarage = True
                            print(f'{reg} updated to True')
                            break
                        elif boolean == 'N':
                            print(f'{reg} not updated')
                            break
                        else:
                            print("I don't understand that - please try agin!")
            else:
                pass
        if vehicleFound == False:
            print(f'Vehicle {reg} could not be found!')
```

The user is prompted to enter the registration for a vehicle. If the vehicle doesn't exist, then the user is warned of this and is returned to the menu. If the vehicle does exist, the status of the vehicle is then checked - which falls into the if statement.

Either way, the logic is very similar if the status to start with is either True or False. The user is asked if they want to change the status. If they do, then the status is updated and the user is returned to the menu. If not, then nothing happens and the user is returned to the main menu.

## Deleting Vehicles

Finally, we come to deleting vehicles from the garage. The last part of the program.

```
def deleteVehicles():
    '''
    Function to decide if the user wants to delete all vehicles in the list or a single vehicle
    '''
    while True:
        print('Do you want to delete all the vehicles in the garage or a specific vehicle?')
        print(f'There are currently {len(garage)} vehicles in the garage')
        print("Press 'A' for ALL vehicles or 'S' for specific vehicle")
        selection = input('Input - ').upper()
        if selection == 'A':
            garage.deleteAllVehicles()
            break
        elif selection == 'S':
            garage.deleteSingleVehicle()
            break
        else:
            print(f"I don't understand {selection} - please try again!")
```

Depending on what the user chooses, one of the methods (to delete all vehicles or a single vehicle) will be run.

Let's take a look at deleting all the vehicles first.

```
def deleteAllVehicles(self):
        '''
        Deletes all the items in the list
        '''
        print('Now removing all vehicles from the garage....')
        del self.garage[:]
        print('Complete!')
```

This is fairly straight forward. The items in the list are deleted with using 'del' then referring to the instance of the garage. It's important to note that this removes all the items in the list, it *doesn't* delete the list itself.

Now for the method for deleting a specific vehicle.

```
def deleteSingleVehicle(self):
        '''
        Deletes a single item from the list that the user specifies
        '''
        print('Please enter the registration of the vehicle you want to delete from the garage.')
        reg = input('Registration - ')
        count = 0
        vehicleDeleted = False
        for vehicle in self.garage:
            if reg == vehicle.registration:
                del self.garage[count]
                print(f'{reg} - has been deleted')
                vehicleDeleted = True
                break
            else:
                count += 1
        if vehicleDeleted == False:
            print(f'No vehicle with registration {reg} could be found!')
        else:
            pass
```

The user enters the registration for a vehicle and through a for loop, the program checks if there is a match. If there is, the vehicle is deleted at the index where it was found. If registration of the vehicle doesn't match what the user entered then the 'count' variable is increased by one. This helps keep track of which index we're up to in case the registration matches. If was no match after checking through each vehicle, the boolean for 'vehicleDeleted' isn't changed and the user is informed that there wasn't a vehicle with the specified registration.

And that's about it!

That's the Vehicle Fleet Manager I wrote in Python.

Be sure to check back as I'll have more posts about Python in the future.

Thanks for reading! 👋