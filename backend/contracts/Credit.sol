//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Credit {
  // Giving the token a name
  string public name = "Trace Credit";
  string public symbol = "TC";

  // The fixed amount of credits
  uint256 public totalSupply = 1000000;

  // storing the ethereum accounts
  address public owner;

  // Storing each account's balances
  mapping(address => uint256) balances;

  // emit a transfer for off-chain reading
  event Transfer(address indexed _from, address indexed _to, uint _value);

  constructor() {
    // Admin account will have all the supply to transfer to other accounts
    balances[msg.sender] = totalSupply;
    owner = msg.sender;
  }

  /**
   * Function to transfer tokens from one account to another.
   */  
  function transfer(address receiver, uint256 amount) external {
    // Check if sender has enough tokens first before sending
    require(balances[msg.sender] >= amount, "Not enough credit");

    console.log("Transferring from %s to %s %s credits", msg.sender, receiver, amount);

    // Transfer the amount
    balances[msg.sender] -= amount;
    balances[receiver] += amount;

    // Publish the transfer
    emit Transfer(msg.sender, receiver, amount);
  }

  /**
   * Read only function to retrieve credit balance of an account.
   */
  function balanceOf(address account) external view returns (uint256) {
    return balances[account];
  }

}