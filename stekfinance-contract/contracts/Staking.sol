// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Staking is Ownable, ReentrancyGuard {
    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lastRewardBlock;
    }

    mapping(address => UserInfo) public userInfo;
    uint256 public totalStaked;
    uint256 public lastRewardBlock;
    uint256 public accRewardPerShare;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardDistributed(uint256 amount);

    constructor() Ownable() {}

    receive() external payable {
        // Accept ETH transfers
    }

    function stake() external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        
        UserInfo storage user = userInfo[msg.sender];
        if (user.amount > 0) {
            uint256 pending = (user.amount * accRewardPerShare) / 1e12 - user.rewardDebt;
            if (pending > 0) {
                user.amount += pending;
            }
        }

        user.amount += msg.value;
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
        user.lastRewardBlock = block.number;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    function unstake(uint256 _amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "Insufficient balance");

        uint256 pending = (user.amount * accRewardPerShare) / 1e12 - user.rewardDebt;
        if (pending > 0) {
            user.amount += pending;
        }

        user.amount -= _amount;
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
        totalStaked -= _amount;

        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");

        emit Unstaked(msg.sender, _amount);
    }

    function distributeRewards() external onlyOwner {
        uint256 balance = address(this).balance - totalStaked;
        require(balance > 0, "No rewards to distribute");

        if (totalStaked > 0) {
            accRewardPerShare += (balance * 1e12) / totalStaked;
        }

        emit RewardDistributed(balance);
    }

    function getUserInfo(address _user) external view returns (uint256 amount, uint256 pendingRewards) {
        UserInfo memory user = userInfo[_user];
        uint256 currentAccRewardPerShare = accRewardPerShare;
        if (block.number > lastRewardBlock && totalStaked != 0) {
            uint256 multiplier = block.number - lastRewardBlock;
            uint256 reward = (multiplier * address(this).balance) / totalStaked;
            currentAccRewardPerShare += (reward * 1e12) / totalStaked;
        }
        pendingRewards = (user.amount * currentAccRewardPerShare) / 1e12 - user.rewardDebt;
        return (user.amount, pendingRewards);
    }
} 