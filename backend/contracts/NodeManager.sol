// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./TraceCredit.sol";
import "hardhat/console.sol";

contract NodeManager {
  struct Node {
    address sender;
    address receiver;
    uint256 amount;
    uint256 postId;
  }

  mapping(uint256 => Node) public nodes;
  uint256 public nodesCount;

  function createNode(address sender, address receiver, uint256 amount, uint256 postId) external {

    // Add to the chain
    Node storage newNode = nodes[nodesCount];
    newNode.sender = sender; // supporting meta transactions
    newNode.receiver = receiver;
    newNode.amount = amount;
    newNode.postId = postId;

    nodesCount++;
  }

  function getNodeDetails(uint256 nodeId) external view returns (address, address, uint256, uint256) {
    require(nodeId < nodesCount, "Invalid node ID");
    Node storage node = nodes[nodeId];
    return (node.sender, node.receiver, node.amount, node.postId);
  }
}