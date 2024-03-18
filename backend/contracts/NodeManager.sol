// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./TraceCredit.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

contract NodeManager is ERC2771Context {
  struct Node {
    address sender;
    address receiver;
    uint256 amount;
    uint256 postId;
  }

  TraceCredit public traceCredit;

  mapping(uint256 => Node) public nodes;
  uint256 public nodesCount;

  constructor(address creditTokenAddress, ERC2771Forwarder forwarder) ERC2771Context(address(forwarder)) {
    traceCredit = TraceCredit(creditTokenAddress);
  }

  function createNode(address receiver, uint256 amount, uint256 postId) external {
    // Approve transfer of tokens from traceCredit to this contract
    traceCredit.transfer(receiver, amount);

    // Add to the chain
    Node storage newNode = nodes[nodesCount];
    newNode.sender = _msgSender(); // supporting meta transactions
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