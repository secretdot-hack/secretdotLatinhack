import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { encryptAndSendMessage, createIpfsClient } from '../utils/encryption';

// Load environment variables
dotenv.config();

// Define the required environment variables
const REQUIRED_ENV_VARS = [
  'ETHEREUM_RPC_URL',      // URL of the Ethereum node (e.g., Infura endpoint)
  'PRIVATE_KEY',           // Private key of the sender (without 0x prefix)
  'CONTRACT_ADDRESS',      // Address of the deployed SecretDot contract
  'IPFS_API_URL',          // IPFS API URL (default: https://ipfs.infura.io:5001)
  'RECIPIENT_ADDRESS'      // Ethereum address of the message recipient
];

// Check if all required environment variables are set
const missingVars = REQUIRED_ENV_VARS.filter(
  varName => !process.env[varName]
);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  console.error('\nPlease create a .env file with the following variables:');
  REQUIRED_ENV_VARS.forEach(varName => console.error(`${varName}=your_value_here`));
  process.exit(1);
}

// Function to get the contract ABI
const getContractABI = () => {
  try {
    // Try to load the ABI from a JSON file
    const fs = require('fs');
    const path = require('path');
    
    // Adjust this path to point to your ABI file
    const abiPath = path.resolve(__dirname, '../artifacts/contracts/SecretDot.sol/SecretDot.json');
    const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    return contractJson.abi;
  } catch (error) {
    console.error('Error loading contract ABI:', error);
    
    // Return a minimal ABI with just the functions we need
    return [
      "function GetUserPubKey(address userAddress) external view returns (string memory)",
      "function SendMessage(address recipient, string memory ipfsHash) external"
    ];
  }
};

// Main function to send an encrypted message
const sendEncryptedMessage = async (message: string, recipientAddress: string) => {
  try {
    console.log(`Preparing to send encrypted message to ${recipientAddress}...`);
    
    // Initialize Ethereum provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    console.log(`Connected to network: ${(await provider.getNetwork()).name}`);
    console.log(`Sender address: ${signer.address}`);
    
    // Create contract instance
    const contractABI = getContractABI();
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS!,
      contractABI,
      signer
    );
    
    // Create IPFS client
    const ipfsClient = createIpfsClient(process.env.IPFS_API_URL);
    console.log('IPFS client initialized');
    
    // Encrypt and send the message
    console.log('Encrypting and sending message...');
    const ipfsHash = await encryptAndSendMessage({
      message,
      recipientAddress,
      contract,
      ipfsClient
    });
    
    console.log('\n✅ Message sent successfully!');
    console.log(`IPFS Hash: ${ipfsHash}`);
    console.log(`View on IPFS Gateway: https://ipfs.io/ipfs/${ipfsHash}`);
    
    return ipfsHash;
  } catch (error) {
    console.error('\n❌ Error sending encrypted message:');
    
    if (error instanceof Error) {
      console.error(`- Type: ${error.name}`);
      console.error(`- Message: ${error.message}`);
      
      // More detailed error handling based on type
      if (error.message.includes('public key')) {
        console.error('\nTIP: Make sure the recipient has registered their public key in the contract.');
      } else if (error.message.includes('insufficient funds')) {
        console.error('\nTIP: Your wallet does not have enough funds to send this transaction.');
      }
    } else {
      console.error(error);
    }
    
    throw error;
  }
};

// Run the example if this file is executed directly
if (require.main === module) {
  // Sample message
  const message = process.argv[2] || 'This is a secret message from SecretDot!';
  const recipientAddress = process.env.RECIPIENT_ADDRESS!;
  
  console.log('====== SecretDot: Send Encrypted Message Example ======\n');
  
  sendEncryptedMessage(message, recipientAddress)
    .then(() => {
      console.log('\nExample completed successfully.');
      process.exit(0);
    })
    .catch(() => {
      console.error('\nExample failed.');
      process.exit(1);
    });
}

// Export for use in other files
export { sendEncryptedMessage };

