// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "hardhat/console.sol";

contract Credit {
  struct User {
    uint256 credit;
    mapping(uint256 => bool) workHistory;
  }

  mapping(address => User) public users;

  event WorkDone(address indexed user, uint256 creditsEarned, uint256 postId);

  function signUp() external {
    require(users[msg.sender].credit <= 0, "User already signed up");
    // Initial credit for new users
    users[msg.sender].credit = 100; 
  }

  function finishWork(address _worker, uint256 _postId, uint256 creditEarned) external {
    require(users[_worker].credit > 0, "User does not exist");

    users[_worker].workHistory[_postId] = true;
    users[_worker].credit += 10; // Reward for finishing work
    emit WorkDone(_worker, creditEarned, _postId);
  }

  function getCredit(address _user) external view returns (uint256) {
    return users[_user].credit;
  }
 
  function gainCredit(uint256 _amount) external {
    // require user to exist first
    require(users[msg.sender].credit > 0, "User doesn't exist");

    users[msg.sender].credit += _amount;
  }
}