// scripts/deploy.js
const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * Deploy the contract with retry mechanism and nonce management
 * @param {number} retries - Number of retry attempts remaining
 * @param {number} gasMultiplier - Gas price multiplier for each retry (increases by 10% each time)
 * @returns {Promise<Contract>} The deployed contract
 */
async function deployWithRetry(retries = 3, gasMultiplier = 1.1) {
  console.log(`Deployment attempt with ${retries} retries remaining...`);
  
  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);
    
    // Get the current nonce for the deployer
    const currentNonce = await deployer.getTransactionCount();
    console.log(`Current nonce: ${currentNonce}`);
    
    // Get current gas price and adjust it
    const gasPrice = await ethers.provider.getGasPrice();
    const adjustedGasPrice = gasPrice.mul(Math.floor(gasMultiplier * 100)).div(100);
    console.log(`Gas price: ${ethers.utils.formatUnits(adjustedGasPrice, "gwei")} gwei (${Math.floor((gasMultiplier - 1) * 100)}% increase)`);
    
    // Get the contract factory
    const SecretDot = await ethers.getContractFactory("SecretDot");
    
    // Deploy with explicit nonce and gas price
    console.log("Deploying contract...");
    const deploymentOptions = {
      gasPrice: adjustedGasPrice,
      nonce: currentNonce
    };
    
    const secretDot = await SecretDot.deploy(deploymentOptions);
    console.log(`Contract deployment transaction sent! Hash: ${secretDot.deployTransaction.hash}`);
    
    // Wait for deployment to complete
    console.log("Waiting for deployment transaction to be mined...");
    await secretDot.deployed();
    
    return secretDot;
  } catch (error) {
    // Handle "already known" error by retrying with higher gas price
    if ((error.message.includes("already known") || 
         error.message.includes("replacement transaction underpriced") ||
         error.message.includes("nonce too low")) && retries > 0) {
      console.log(`\nTransaction error: ${error.message}`);
      console.log(`Retrying deployment with higher gas price...`);
      
      // Wait for a short time to allow for chain state updates
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Retry with increased gas price
      return deployWithRetry(retries - 1, gasMultiplier * 1.2);
    }
    
    // If we're out of retries or it's not a nonce/gas issue, throw the error
    console.error("\nDeployment failed with critical error:");
    throw error;
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("Deploying SecretDot contract...");
  console.log("=".repeat(50));
  
  try {
    // Attempt deployment with retry mechanism
    const secretDot = await deployWithRetry();
    
    // Deployment was successful
    console.log("\n" + "=".repeat(50));
    console.log("DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(50));
    console.log("Contract address:", secretDot.address);
    console.log("Transaction hash:", secretDot.deployTransaction.hash);
    console.log("Network:", hre.network.name);
    console.log("=".repeat(50));
    
    // Output for easy copying to .env.public
    console.log("\nAdd this to your .env.public file:");
    console.log(`CONTRACT_ADDRESS=${secretDot.address}`);
    
    return secretDot.address;
  } catch (error) {
    console.error("\n" + "=".repeat(50));
    console.error("DEPLOYMENT FAILED");
    console.error("=".repeat(50));
    console.error(error);
    process.exit(1);
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Unhandled error:", error);
      process.exit(1);
    });
}

module.exports = { main, deployWithRetry };
