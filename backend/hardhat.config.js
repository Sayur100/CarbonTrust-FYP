require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun", // Explicitly targeting the modern EVM to unlock the mcopy opcode
      optimizer: {
        enabled: true,
        runs: 200 // Further reduces deployment gas costs, an excellent metric for your FYP report
      }
    }
  },
  networks: {
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};