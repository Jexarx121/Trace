// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Transactions {
  uint256 transactionCount;

  event Transfer(address from, address receiver, uint creditAmount, uint256 timestamp, uint256 duration);

  struct TransferStruct {
    address sender;
    address receiver;
    uint creditAmount;
    uint256 timestamp;
    uint256 duration;
  }

  TransferStruct[] transactions;

  function addToBlockchain(address payable receiver, uint creditAmount, uint256 duration) public {
    transactionCount += 1;
    transactions.push(TransferStruct(msg.sender, receiver, creditAmount, block.timestamp, duration));

    emit Transfer(msg.sender, receiver, block.timestamp, duration);
  }

  function getAllTransactions() public view returns (TransferStruct[] memory) {
    return transactions;
  }

  function getTransactionCount() public view returns (uint256) {
    return transactionCount;
  }
}