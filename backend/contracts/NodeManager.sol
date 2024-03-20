// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./TraceCredit.sol";
import "hardhat/console.sol";

contract NodeManager {
  struct Node {
    address sender;
    address receiver;
    uint256 creditAmount;
    uint256 hoursWorked; 
    uint256 amountOfPeople;
  }

  mapping(uint256 => Node) public nodes;
  uint256 public nodesCount;

  function createNode(uint256 postId, address sender, address receiver, uint256 creditAmount, uint256 hoursWorked, uint256 amountOfPeople) external {
    // Require that the node with the given postId does not already exist
    require(nodes[postId].sender == address(0), "Node with postId already exists");

    // Add to the chain
    Node storage newNode = nodes[postId];
    newNode.sender = sender; // supporting meta transactions
    newNode.receiver = receiver;
    newNode.creditAmount = creditAmount;
    newNode.hoursWorked = hoursWorked;
    newNode.amountOfPeople = amountOfPeople;

    nodesCount++;
  }

  function getNodeDetails(uint256 nodePostId) external view returns (address, address, uint256, uint256, uint256) {
    require(nodes[nodePostId].sender != address(0), "Node with nodePostId does not exist");
    Node storage node = nodes[nodePostId];
    return (node.sender, node.receiver, node.creditAmount, node.hoursWorked, node.amountOfPeople);
  }
}