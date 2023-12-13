// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BitProtoCoin is ERC20 {
    address private _owner;
    uint256 private _mintAmount = 0;
    uint64 private _mintDelay = 60 * 60 * 24;
    mapping (address => uint256) nextMint;    

    constructor() ERC20("BitProtoCoin", unicode"₿PC") {
        _owner = msg.sender;
        _mint(msg.sender, 10000000 * 10 ** 18);
    }

    function mint(address to) public restricted{
        require(_mintAmount > 0, "Minting isn't enabled.");
        require(block.timestamp > nextMint[to], "You cannot mint twice in a row.");
        _mint(to, _mintAmount);
        nextMint[to] = block.timestamp + _mintDelay;
    }

    function setMintAmount(uint256 newAmount) public restricted {
        _mintAmount = newAmount;
    }

    function setMintDelay(uint64 newDelayInSeconds) public restricted {
        _mintDelay = newDelayInSeconds;
    }

    modifier restricted() {
        require(_owner == msg.sender, "You don't have permission.");
        _;
    }
}
