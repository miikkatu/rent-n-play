pragma solidity ^0.4.23;

import './Ownable.sol';


/** @title Rent N' Play service contract. */
contract RentalService is Ownable {
  event Rent(address _rentedBy, uint _gearId);
  event Return(address _rentedBy, uint _gearId);

  struct Gear {
    uint gearId;
    uint rentPrice;
    bytes32 gearName;
    bool isRented;
  }

  struct Rental {
    uint gearId;
    uint rentDate;
    bool isReturned;
    address rentedBy;
  }

  // Maps gearId to Gear struct
  mapping(uint => Gear) public gearData;
  // Maps user to the user's rentals
  mapping(address => Rental[]) public rentalData;

  // When an item is returned within the returning period, refund a portion
  // of the rental fee: fee / refund. This is set in the constructor.
  uint refund;

  /// @dev The RentalService constructor sets the original `owner` of the contract
  /// to the sender account, and initializes `gearData` list.
  constructor(uint[] _gearIds, bytes32[] _gearNames, uint[] _rentPrices, uint _refund) public {
    owner = msg.sender;
    refund = _refund;

    for (uint i = 0; i < _gearIds.length; i++) {
      gearData[_gearIds[i]] = Gear({
        gearId: _gearIds[i],
        gearName: _gearNames[i],
        rentPrice: _rentPrices[i],
        isRented: false
      });
    }
  }

  /// @notice Lets the owner see the balance on the contract
  /// @return The contract balance
  function getContractBalance() external view onlyOwner returns (uint) {
    return address(this).balance;
  }

  /// @notice Lets the owner set the refund amount
  /// @param _refund The refund value to be set
  function setRefund(uint _refund) external onlyOwner {
    refund = _refund;
  }

  /// @notice Lets the owner withdraw funds from the contract
  function withdraw() external onlyOwner {
    owner.transfer(address(this).balance);
  }

  /// @notice Lets the owner destroy the contract
  function kill() public onlyOwner {
    selfdestruct(owner);
  }

  /// @notice Gets an item by ud
  /// @param _gearId The id of the wanted item
  /// @return List containing id, name, rental price and whether item is rented
  function getGearById(uint _gearId) public view returns (uint, bytes32, uint, bool) {
    return (_gearId, gearData[_gearId].gearName, gearData[_gearId].rentPrice, gearData[_gearId].isRented);
  }

  /// @notice Gets ids of the items rented by the user
  /// @return List of ids
  function getRentalIdsByUser() public view returns (uint[]) {
    // Get amount of rented gear to initialize result array
    // to correct length
    uint rentals = 0;
    for (uint i = 0; i < rentalData[msg.sender].length; i++) {
      if (rentalData[msg.sender][i].isReturned == false) rentals++;
    }

    // Use a memory array to save gas. array.push can not be used,
    // so use a counter variable instead in the loop here
    uint[] memory result = new uint[](rentals);
    uint counter = 0;
    for (uint j = 0; j < rentalData[msg.sender].length; j++) {
      if (rentalData[msg.sender][j].isReturned == false) {
        // Add each rented but not returned gear id to the list
        result[counter] = rentalData[msg.sender][j].gearId;
        counter++;
      }
    }

    return result;
  }

  /// @notice Rents an item
  /// @param _gearId Id of the item to be rented
  /// @return True if renting was successful, false otherwise
  function rentGear(uint _gearId) public payable returns (bool success) {
    // Require gear to be available
    require(gearData[_gearId].isRented == false);

    // Require proper remt price. Contract gets the funds
    require(msg.value == gearData[_gearId].rentPrice);

    rentalData[msg.sender].push(Rental({
      gearId: _gearId,
      rentDate: now,
      isReturned: false,
      rentedBy: msg.sender
    }));

    Gear storage gear = gearData[_gearId];
    gear.isRented = true;

    emit Rent(msg.sender, _gearId);
    return true;
  }

  /// @notice Returns an item. Also refunds a portion of the rental price
  /// @param _gearId Id of the item to be returned
  /// @return True if returning was successful, false otherwise
  function returnGear(uint _gearId) public returns (bool success) {
    // Gear must be rented before returning
    require(gearData[_gearId].isRented == true);

    // Gear must be returned by the same user who rented it.
    // Loop every rental for this user
    for (uint i = 0; i < rentalData[msg.sender].length; i++) {
      if (rentalData[msg.sender][i].gearId == _gearId) {
        // Mark gear as returned
        gearData[_gearId].isRented = false;
        // Mark gear as returned also in rental data
        for (uint j = 0; j < rentalData[msg.sender].length; j++) {
          if (rentalData[msg.sender][j].gearId == _gearId) {
            rentalData[msg.sender][j].isReturned = true;

            // If item was returned in time, do a refund
            if (now <= rentalData[msg.sender][j].rentDate + 7 days) {
              msg.sender.transfer(gearData[_gearId].rentPrice / refund);
            }
          }
        }

        emit Return(msg.sender, _gearId);
        return true;
        break;
      }
    }
    return false;
  }
}