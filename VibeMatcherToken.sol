// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/**
 * @title VibeMatcherToken
 * @dev ERC20 token with minting, burning, pausing, and ownership features.
 */
contract VibeMatcherToken is ERC20 {
    // Token name and symbol
    string private constant _name = "RIZZ";
    string private constant _symbol = "RIZZ";

    // Initial supply of tokens
    uint256 private constant INITIAL_SUPPLY = 1000 * 10**18; // 1 million tokens

    // Registration bonus amount
    uint256 private constant REGISTRATION_BONUS = 5 * 10**18; // 5 tokens with 18 decimals

    // Address of the contract owner
    address private _owner;
    // Mapping to track registered users
    mapping(address => bool) private _registered;

    modifier onlyOwner() {
        require(msg.sender == _owner, "Caller is not the owner");
        _;
    }

    modifier hasEnoughTokens(uint256 value) {
        require(balanceOf(msg.sender) >= value, "Caller does not have enough tokens");
        _;
    }

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() ERC20(_name, _symbol) {
        
    }

    /**
     * @dev Allows a new user to register and receive initial tokens
     */
    function register() public {
        require(!_registered[msg.sender], "User already registered");
        _registered[msg.sender] = true;
        _mint(msg.sender, REGISTRATION_BONUS);
    }

    /**
     * @dev Checks if an address is registered
     */
    function isRegistered(address user) public view returns (bool) {
        return _registered[user];
    }

    function mint(uint256 value) public onlyOwner() {
        require(value > 0, "Mint value must be greater than 0");
        _mint(msg.sender, value);
    }

    function burn(uint256 value) public hasEnoughTokens(value) {
        require(value > 0, "Burn value must be greater than 0");
        _burn(msg.sender, value);
    }
}