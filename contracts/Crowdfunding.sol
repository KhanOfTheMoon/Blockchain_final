// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RewardToken.sol";

contract Crowdfunding {
    struct Campaign {
        string title;
        address payable creator;
        uint256 goalWei;
        uint256 deadline;
        uint256 raisedWei;
        bool finalized;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;

    // campaignId => user => contributedWei
    mapping(uint256 => mapping(address => uint256)) public contributions;

    event CampaignCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        uint256 goalWei,
        uint256 deadline
    );
    event Contributed(
        uint256 indexed id,
        address indexed contributor,
        uint256 amountWei
    );
    event Finalized(uint256 indexed id);

    RewardToken public rewardToken;

    constructor(address rewardTokenAddress) {
        rewardToken = RewardToken(rewardTokenAddress);
    }

    function createCampaign(
        string calldata title,
        uint256 goalWei,
        uint256 durationSeconds
    ) external returns (uint256 id) {
        require(bytes(title).length > 0, "Empty title");
        require(goalWei > 0, "Goal = 0");
        require(durationSeconds > 0, "Duration = 0");

        id = ++campaignCount;

        campaigns[id] = Campaign({
            title: title,
            creator: payable(msg.sender),
            goalWei: goalWei,
            deadline: block.timestamp + durationSeconds,
            raisedWei: 0,
            finalized: false
        });

        emit CampaignCreated(
            id,
            msg.sender,
            title,
            goalWei,
            campaigns[id].deadline
        );
    }

    function getCampaign(
        uint256 id
    )
        external
        view
        returns (
            string memory title,
            address creator,
            uint256 goalWei,
            uint256 deadline,
            uint256 raisedWei,
            bool finalized
        )
    {
        require(id > 0 && id <= campaignCount, "Bad id");
        Campaign storage c = campaigns[id];
        return (
            c.title,
            c.creator,
            c.goalWei,
            c.deadline,
            c.raisedWei,
            c.finalized
        );
    }

    //Added function to contribute to a campaign
function contribute(uint256 id) external payable {
    require(id > 0 && id <= campaignCount, "Bad id");
    require(msg.value > 0, "Zero contribution");

    Campaign storage c = campaigns[id];

    require(block.timestamp < c.deadline, "Campaign ended");
    require(!c.finalized, "Already finalized");

    contributions[id][msg.sender] += msg.value;
    c.raisedWei += msg.value;

    rewardToken.mint(msg.sender, msg.value);

    emit Contributed(id, msg.sender, msg.value);
}


    //Added function to finalize a campaign
    function finalize(uint256 id) external {
        require(id > 0 && id <= campaignCount, "Bad id");

        Campaign storage c = campaigns[id];

        require(block.timestamp >= c.deadline, "Not ended yet");
        require(!c.finalized, "Already finalized");

        c.finalized = true;

        emit Finalized(id);
    }

}
