// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

    event CampaignCreated(uint256 indexed id, address indexed creator, string title, uint256 goalWei, uint256 deadline);
    event Contributed(uint256 indexed id, address indexed contributor, uint256 amountWei);
    event Finalized(uint256 indexed id);

    function createCampaign(string calldata title, uint256 goalWei, uint256 durationSeconds) external returns (uint256) {
        // TODO: реализовать на День 2
        title; goalWei; durationSeconds;
        revert("TODO");
    }

    function contribute(uint256 id) external payable {
        // TODO: реализовать на День 3
        id;
        revert("TODO");
    }

    function finalize(uint256 id) external {
        // TODO: реализовать на День 4
        id;
        revert("TODO");
    }
}