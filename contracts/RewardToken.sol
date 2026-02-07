pragma solidity ^0.8.20;
//I have some problems with contracts/token/ERC20, probably some dependency or graphical error, but it compiles perfectly HELP
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable {
    address public minter;

    constructor() ERC20("RewardToken", "RWD") Ownable(msg.sender) {}

    function setMinter(address m) external onlyOwner {
        minter = m;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter || msg.sender == owner(), "Not minter");
        _mint(to, amount);
    }
}