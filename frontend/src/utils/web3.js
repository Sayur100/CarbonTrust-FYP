// src/utils/web3.js
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants";

/**
 * Initializes the cryptographic handshake between the browser DOM, MetaMask, and the Polygon network.
 */
export const getWeb3State = async () => {
  // Epistemological validation: Ensure the browser possesses a cryptographic wallet extension
  if (!window.ethereum) {
    throw new Error("MetaMask dependency is absent. Please install the extension.");
  }

  try {
    // Request localized authorization to read the user's public address
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Instantiate the Ethers.js v6 BrowserProvider to standardize our RPC calls
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Extract the cryptographic signer required to authorize state-changing transactions (Minting/Retiring)
    const signer = await provider.getSigner();

    // Synthesize the localized contract instance utilizing the ABI and Address
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    return { provider, signer, contract };
  } catch (error) {
    console.error("Cryptographic connection failed:", error);
    throw error;
  }
};