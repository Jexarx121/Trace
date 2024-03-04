// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TraceCredit is ERC20 {

  constructor(uint256 initialSupply) ERC20("Trace Credit", "TC") {
    _mint(msg.sender, initialSupply);
  }
}