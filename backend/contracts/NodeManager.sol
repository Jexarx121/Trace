// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Credit.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract NodeManager is ERC2771Context {
  struct Node {
    address sender;
    address receiver;
    uint256 amount;
    uint256 postId;
  }

  Credit public creditToken;

  mapping(uint256 => Node) public nodes;
  uint256 public nodesCount;

  constructor(address creditTokenAddress, address trustedForwarder) ERC2771Context(trustedForwarder) {
    creditToken = Credit(creditTokenAddress);
  }

  function createNode(address receiver, uint256 amount, uint256 postId) external {
    // Use the _msgSender() from ERC2771Context to get the actual sender of the meta transaction
    creditToken.transferFrom(_msgSender(), receiver, amount);

    // Add to the chain
    Node storage newNode = nodes[nodesCount];
    newNode.sender = _msgSender();
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
