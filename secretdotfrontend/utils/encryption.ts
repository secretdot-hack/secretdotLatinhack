import { Contract } from 'ethers';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import * as eciesjs from 'eciesjs';
import { Buffer } from 'buffer';

/**
 * Interface for the encryption parameters
 */
interface EncryptionParams {
  message: string;
  recipientAddress: string;
  contract: Contract;
  ipfsClient: IPFSHTTPClient;
}

/**
 * Interface for the encrypted message that will be stored in IPFS
 */
interface EncryptedMessage {
  encryptedContent: string; // Base64 encoded encrypted content
  timestamp: number; // Unix timestamp
  metadata?: any; // Optional metadata
}

/**
 * Converts a hex string (with or without 0x prefix) to a Buffer
 */
const hexToBuffer = (hexString: string): Buffer => {
  // Remove 0x prefix if present
  const hex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  return Buffer.from(hex, 'hex');
};

/**
 * Encrypts a message using the recipient's public key and stores it in IPFS,
 * then sends the IPFS hash to the recipient through the contract.
 * 
 * @param params - The encryption parameters
 * @returns The IPFS hash (CID) of the stored encrypted message
 */
export async function encryptAndSendMessage({
  message,
  recipientAddress,
  contract,
  ipfsClient
}: EncryptionParams): Promise<string> {
  try {
    // Step 1: Get recipient's public key from the contract
    const recipientPubKey = await contract.GetUserPubKey(recipientAddress);
    if (!recipientPubKey) {
      throw new Error(`Public key not found for address: ${recipientAddress}`);
    }

    // Step 2: Convert the public key to the format required by eciesjs
    // eciesjs expects a Buffer of the uncompressed public key
    const pubKeyBuffer = hexToBuffer(recipientPubKey);

    // Step 3: Encrypt the message using the recipient's public key
    const messageBuffer = Buffer.from(message, 'utf8');
    const encryptedBuffer = eciesjs.encrypt(pubKeyBuffer, messageBuffer);
    
    // Step 4: Prepare the data to be stored in IPFS
    const encryptedMessage: EncryptedMessage = {
      encryptedContent: encryptedBuffer.toString('base64'),
      timestamp: Math.floor(Date.now() / 1000)
    };
    
    // Step 5: Store the encrypted message in IPFS
    const ipfsResult = await ipfsClient.add(JSON.stringify(encryptedMessage));
    const ipfsHash = ipfsResult.path;
    
    // Step 6: Call the contract to send the message with the IPFS hash
    const tx = await contract.SendMessage(recipientAddress, ipfsHash);
    await tx.wait(); // Wait for the transaction to be mined
    
    console.log(`Message encrypted and sent with IPFS hash: ${ipfsHash}`);
    return ipfsHash;
  } catch (error) {
    console.error('Error in encryptAndSendMessage:', error);
    throw error;
  }
}

/**
 * Helper function to create an IPFS client
 * 
 * @param ipfsApiUrl - The URL of the IPFS API
 * @returns An IPFS HTTP client instance
 */
export function createIpfsClient(ipfsApiUrl = 'https://ipfs.infura.io:5001'): IPFSHTTPClient {
  return create({ url: ipfsApiUrl });
}

/**
 * Decrypts a message using the user's private key
 * 
 * @param encryptedContent - Base64 encoded encrypted content
 * @param privateKey - User's private key (without 0x prefix)
 * @returns The decrypted message
 */
export function decryptMessage(encryptedContent: string, privateKey: string): string {
  try {
    // Convert base64 encrypted content to Buffer
    const encryptedBuffer = Buffer.from(encryptedContent, 'base64');
    
    // Convert private key to Buffer (remove 0x prefix if present)
    const privateKeyBuffer = hexToBuffer(privateKey);
    
    // Decrypt the message
    const decryptedBuffer = eciesjs.decrypt(privateKeyBuffer, encryptedBuffer);
    
    // Convert the decrypted Buffer to string
    return decryptedBuffer.toString('utf8');
  } catch (error) {
    console.error('Error decrypting message:', error);
    throw error;
  }
}

