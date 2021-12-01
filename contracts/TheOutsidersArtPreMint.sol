// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";

/**
 * @title TheOutsidersArt
 * TheOutsidersArt - a contract for my non-fungible creatures.
 */
contract TheOutsidersArtPreMint is ERC721Tradable {
    constructor(address _proxyRegistryAddress)
        ERC721Tradable("The Outsiders Art pre-mint v3", "TOA", _proxyRegistryAddress)
    {
        for (uint i = 0; i < TOKENS_SUPPLY; i++) {
            mintTo(msg.sender, i);
        }
    }

    uint256 TOKENS_SUPPLY = 222;

    function baseTokenURI() override public pure returns (string memory) {
        return "ipfs://QmW8fmRyeNvdAP2KXP9oNB3BjMVVpTzHJkPk8MPhCWHjE5/";
    }

    function exists(uint256 tokenId) public view virtual returns (bool) {
        return _exists(tokenId);
    }
}
