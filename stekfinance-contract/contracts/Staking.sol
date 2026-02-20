// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Staking is Ownable, ReentrancyGuard, Pausable {
    struct UserInfo {
        uint256 amount;      // 원금(principal)만 저장
        uint256 rewardDebt;
    }

    mapping(address => UserInfo) public userInfo;
    uint256 public totalStaked;
    uint256 public accRewardPerShare;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 pendingReward);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardDistributed(uint256 amount);

    constructor() Ownable() {}

    receive() external payable {
        // Accept ETH transfers (rewards 등)
    }

    function stake() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");

        UserInfo storage user = userInfo[msg.sender];

        // 기존 포지션이 있으면 pending 정산 (amount에 합치지 않고 rewardDebt만 갱신)
        if (user.amount > 0) {
            uint256 pending = (user.amount * accRewardPerShare) / 1e12 - user.rewardDebt;
            user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
            // pending은 claim() 또는 unstake() 시 지급. 여기선 amount에 더하지 않음.
        }

        user.amount += msg.value;
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    function unstake(uint256 _amount) external nonReentrant whenNotPaused {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "Insufficient balance");

        // pending 보상 계산 후 rewardDebt 갱신
        uint256 pending = (user.amount * accRewardPerShare) / 1e12 - user.rewardDebt;

        user.amount -= _amount;
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;
        totalStaked -= _amount;

        uint256 toSend = _amount + pending;

        (bool success, ) = msg.sender.call{value: toSend}("");
        require(success, "Transfer failed");

        emit Unstaked(msg.sender, _amount, pending);
    }

    function claim() external nonReentrant whenNotPaused {
        UserInfo storage user = userInfo[msg.sender];
        uint256 pending = (user.amount * accRewardPerShare) / 1e12 - user.rewardDebt;
        if (pending == 0) return;

        user.rewardDebt = (user.amount * accRewardPerShare) / 1e12;

        (bool success, ) = msg.sender.call{value: pending}("");
        require(success, "Transfer failed");

        emit RewardsClaimed(msg.sender, pending);
    }

    /// @notice 오너가 ETH를 전송하면서 호출. msg.value만큼만 acc에 반영 (중복 분배 방지)
    function distributeRewards() external payable onlyOwner {
        uint256 amount = msg.value;
        require(amount > 0, "No rewards to distribute");
        require(totalStaked > 0, "No stakers");

        accRewardPerShare += (amount * 1e12) / totalStaked;

        emit RewardDistributed(amount);
    }

    function getUserInfo(address _user) external view returns (uint256 amount, uint256 pendingRewards) {
        UserInfo memory user = userInfo[_user];
        pendingRewards = (user.amount * accRewardPerShare) / 1e12 - user.rewardDebt;
        return (user.amount, pendingRewards);
    }

    /// @notice 보상 포기하고 원금만 출금 (긴급 상황용)
    function emergencyWithdraw() external nonReentrant whenPaused {
        UserInfo storage user = userInfo[msg.sender];
        uint256 amount = user.amount;
        require(amount > 0, "Nothing to withdraw");

        user.amount = 0;
        user.rewardDebt = 0;
        totalStaked -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice totalStaked vs balance 불변식 체크 (디버그/감사용 view)
    function getContractState() external view returns (
        uint256 _totalStaked,
        uint256 _balance,
        uint256 _difference
    ) {
        _totalStaked = totalStaked;
        _balance = address(this).balance;
        _difference = _balance > _totalStaked ? _balance - _totalStaked : 0;
    }
}
