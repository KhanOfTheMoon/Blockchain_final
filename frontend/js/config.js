const CONFIG = {
    TOKEN_ADDRESS: "0x85a8437944F20e91f2882c4967ca832BF0acfaea",
    CROWDFUNDING_ADDRESS: "0xf7d8Ec1D49D6f4c43A0199B6497BF50413B2c8A2",
    CHAIN_ID: 11155111n, // Sepolia
    LOCAL_CHAIN_ID: 31337n
};

const ABIS = {
    CROWDFUNDING: [
        "function campaignCount() view returns (uint256)",
        "function getCampaign(uint256 id) view returns (string,address,uint256,uint256,uint256,bool,bool)",
        "function finalize(uint256 id)",
        "function createCampaign(string title, uint256 goalWei, uint256 durationSeconds) returns (uint256)",
        "function contribute(uint256 id) payable"
    ],
    TOKEN: [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
    ]
};