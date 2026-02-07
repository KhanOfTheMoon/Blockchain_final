// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRewardToken {
    function mint(address to, uint256 amount) external;
}

contract Crowdfunding is ReentrancyGuard, Ownable {
    struct Campaign {
        string title;
        address payable creator;
        uint256 goalWei;
        uint256 deadline;    
        uint256 raisedWei;
        bool finalized;
        bool successful;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    IRewardToken public rewardToken;

    // 100 tokens per 1 ETH (18 decimals)
    uint256 public rewardPerEth = 100e18;

    event CampaignCreated(uint256 indexed id, address indexed creator, string title, uint256 goalWei, uint256 deadline);
    event Contributed(uint256 indexed id, address indexed contributor, uint256 amountWei, uint256 rewardMinted);
    event Finalized(uint256 indexed id, bool successful);

    constructor(address rewardTokenAddress) Ownable(msg.sender) {
        rewardToken = IRewardToken(rewardTokenAddress);
    }

    function setRewardToken(address rewardTokenAddress) external onlyOwner {
        rewardToken = IRewardToken(rewardTokenAddress);
    }

    function setRewardPerEth(uint256 newRewardPerEth) external onlyOwner {
        require(newRewardPerEth > 0, "Rate=0");
        rewardPerEth = newRewardPerEth;
    }

    function createCampaign(string calldata title, uint256 goalWei, uint256 durationSeconds)
        external
        returns (uint256 id)
    {
        require(bytes(title).length > 0, "Empty title");
        require(goalWei > 0, "Goal=0");
        require(durationSeconds > 0, "Duration=0");

        id = ++campaignCount;

        campaigns[id] = Campaign({
            title: title,
            creator: payable(msg.sender),
            goalWei: goalWei,
            deadline: block.timestamp + durationSeconds,
            raisedWei: 0,
            finalized: false,
            successful: false
        });

        emit CampaignCreated(id, msg.sender, title, goalWei, campaigns[id].deadline);
    }

    function contribute(uint256 id) external payable nonReentrant {
        require(id > 0 && id <= campaignCount, "Bad id");
        Campaign storage c = campaigns[id];

        require(block.timestamp < c.deadline, "Ended");
        require(!c.finalized, "Finalized");
        require(msg.value > 0, "Value=0");

        contributions[id][msg.sender] += msg.value;
        c.raisedWei += msg.value;

        uint256 rewardAmount = 0;
        if (address(rewardToken) != address(0)) {
            rewardAmount = (msg.value * rewardPerEth) / 1 ether;
            rewardToken.mint(msg.sender, rewardAmount);
        }

        emit Contributed(id, msg.sender, msg.value, rewardAmount);
    }

    function finalize(uint256 id) external {
        require(id > 0 && id <= campaignCount, "Bad id");
        Campaign storage c = campaigns[id];

        require(!c.finalized, "Already finalized");
        require(block.timestamp >= c.deadline, "Too early");

        c.finalized = true;
        c.successful = (c.raisedWei >= c.goalWei);

        emit Finalized(id, c.successful);
    }

    function getCampaign(uint256 id)
        external
        view
        returns (
            string memory title,
            address creator,
            uint256 goalWei,
            uint256 deadline,
            uint256 raisedWei,
            bool finalized,
            bool successful
        )
    {
        require(id > 0 && id <= campaignCount, "Bad id");
        Campaign storage c = campaigns[id];
        return (c.title, c.creator, c.goalWei, c.deadline, c.raisedWei, c.finalized, c.successful);
    }
}