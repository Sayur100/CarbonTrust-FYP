// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Importing battle-tested OpenZeppelin primitives to ensure academic rigor and prevent reentrancy vectors.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonTrust is ERC721, Ownable {
    uint256 private _nextTokenId;

    // THE CORE ACADEMIC METRIC: 
    // This mapping explicitly tracks the lifecycle of a credit. Once true, it is permanently neutralized.
    mapping(uint256 => bool) public isRetired;

    // Cryptographic events emitted to the Polygon blockchain. 
    // Your React/Vite frontend will listen for these to update the Analytics Dashboard in real-time.
    event CreditMinted(address indexed to, uint256 indexed tokenId, string projectData);
    event CreditRetired(address indexed by, uint256 indexed tokenId);

    // Initialize the NFT collection with a designated Name and Ticker Symbol.
    // The msg.sender (your MetaMask wallet) is permanently designated as the master "Oracle" owner.
    constructor() ERC721("CarbonTrust", "CTCO2") Ownable(msg.sender) {}

    /**
     * @dev Simulates the Oracle data ingestion. 
     * In production, the Node.js backend triggers this when physical IoT sensors hit 1 tonne of CO2e.
     * Restricted strictly to the contract Owner (The Oracle) via the 'onlyOwner' modifier.
     */
    function mintCredit(address to, string memory projectData) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        
        // _safeMint prevents tokens from being permanently locked in contracts that cannot parse ERC-721s.
        _safeMint(to, tokenId);
        
        emit CreditMinted(to, tokenId, projectData);
    }

    /**
     * @dev The Retirement Mechanism. This is your solution to the VCM double-counting vulnerability.
     * A corporate buyer executes this to claim the ESG offset.
     */
    function retireCredit(uint256 tokenId) public {
        // Validation 1: Epistemological verification that the caller actually owns the asset.
        require(ownerOf(tokenId) == msg.sender, "Authorization Denied: Caller does not own this asset.");
        
        // Validation 2: Prevents an already burned credit from being re-processed.
        require(!isRetired[tokenId], "Market Integrity Violation: Credit has already been retired.");

        // State Mutation: Irreversibly mark the asset as consumed on the public ledger.
        isRetired[tokenId] = true;

        // Execute the OpenZeppelin burn protocol to eradicate the token from the circulating supply.
        _burn(tokenId);

        emit CreditRetired(msg.sender, tokenId);
    }
}