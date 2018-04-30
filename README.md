# Rent N' Play

A demo application that uses a JavaScript frontend to access an Ethereum smart contract. The application has features for renting musical gear. Rentals can be paid with Ether.

This application has been written as a learning exercise.

## Features

* Get available items from the contract, as initialized during contract deployment
* List available items
* List items rented by you, the user
* Rent an item with a fee
* Return an item with a partial refund when returned within return period
* Contract owner can get the balance of the contract account
* Contract owner can withdraw funds from the contract account

### Additional features that should be implemented

* Updating data from the contract automatically
* Displaying return dates for rented items in the UI
* Registering a user
* Adding new items
* Notifying the user for events, such as when receiving a refund
* Separate UI view for contract owner

## Stack

* [Create React App](https://github.com/facebookincubator/create-react-app)
* redux
* react-router
* sass
* truffle
* web3.js

## Setting up

Use [Node.js](https://nodejs.org/en/) 9.x.

You also need [Truffle](http://truffleframework.com) and [Ganache CLI](https://github.com/trufflesuite/ganache-cli). To install, run:

* `npm install -g truffle`
* `npm install -g ganache-cli`

Truffle is used for easy development of smart contracts.

## Commands

### Contracts

* Start local network with ganache-cli: `ganache-cli`

Run these in the /src directory to deploy the contracts to the local test network.

* Compile: `truffle compile`
* Migrate: `truffle migrate` or `truffle migrate --reset`

### Frontend

* Run dev server: `npm start`
