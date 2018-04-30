var Ownable = artifacts.require('./Ownable.sol');
var RentalService = artifacts.require('./RentalService.sol');

// Declare fixed test data here
var gearIds = [1, 2, 3];
var gearNames = [
  'Gibson Les Paul Custom',
  'Marshall JCM 800 2203',
  'Marshall 1960A 4x12'
];
// Prices are in wei
var rentPrices = [300000000000000000, 200000000000000000, 100000000000000000];
// Refund is rental price divided by this (20 -> 5%)
var refund = 20;

module.exports = function(deployer) {
  deployer.deploy(Ownable);
  deployer.link(Ownable, RentalService);
  deployer.deploy(RentalService, gearIds, gearNames, rentPrices, refund);
};
