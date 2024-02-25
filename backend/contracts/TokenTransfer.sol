// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WorkContract is ERC20, Ownable {
  uint256 public workIdCounter;
  address public adminAccount;
  mapping(address => uint256) public nonces;

  event WorkCompleted(uint256 indexed workId, address indexed creator, address indexed worker, uint256 credits);

  constructor(string memory _name, string memory _symbol, uint256 initialSupply, address _adminAccount) ERC20(_name, _symbol) {
    _mint(msg.sender, initialSupply);
    workIdCounter = 1;
    adminAccount = _adminAccount;
  }

  function completeWork(address worker, uint256 credits) external {
    require(balanceOf(msg.sender) >= credits, "Not enough credits");

    _transfer(msg.sender, worker, credits); // Transfer credits from creator to worker

    emit WorkCompleted(workIdCounter, msg.sender, worker, credits);
    workIdCounter++;
  }

  function executeMetaTransaction(
    address user,
    uint256 credits,
    uint256 nonce,
    bytes calldata signature
  ) external onlyOwner {
    bytes32 messageHash = keccak256(abi.encodePacked(user, credits, nonce, address(this)));
    require(recoverSigner(messageHash, signature) == adminAccount, "Invalid signature");

    _mint(user, credits); // Mint credits for the user

    // Increment nonce to avoid replay attacks
    nonces[user]++;
  }

  function recoverSigner(bytes32 messageHash, bytes memory signature) internal pure returns (address) {
    bytes32 r;
    bytes32 s;
    uint8 v;

    if (signature.length != 65) {
      return address(0);
    }

    assembly {
      r := mload(add(signature, 32))
      s := mload(add(signature, 64))
      v := and(mload(add(signature, 65)), 255)
    }

    if (v < 27) {
        v += 27;
    }

    if (v != 27 && v != 28) {
      return address(0);
    }

    return ecrecover(messageHash, v, r, s);
  }

  // The following functions are necessary for Hardhat testing
  function mintForTest(address account, uint256 amount) external onlyOwner {
    _mint(account, amount);
  }

  function setAdminAccountForTest(address account) external onlyOwner {
    adminAccount = account;
  }
}