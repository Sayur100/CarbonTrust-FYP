const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CarbonTrustModule", (m) => {
  // m.contract() orchestrates the instantiation. 
  // The string "CarbonTrust" must perfectly match the exact name of your contract in Solidity.
  const carbonTrust = m.contract("CarbonTrust");

  // We return the deployed instance so the Ignition engine can track its cryptographic state.
  return { carbonTrust };
});