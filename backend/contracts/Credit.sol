// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Credit is ERC20 {
  address public owner;

  constructor() ERC20("Trace Credit", "TC") {
    _mint(msg.sender, 1000000 * 10**decimals());
    owner = msg.sender;
  }

  function mint(address account, uint256 amount) external {
    require(msg.sender == owner, "Only owner can mint");
    _mint(account, amount);
  }

  function burn(uint256 amount) external {
    _burn(msg.sender, amount);
  }
}
