// encrypt.js
const EthCrypto = require('eth-crypto');

async function encryptMessage(publicKeyHex, message) {
    try {
        // Remove 0x prefix if present and ensure proper format
        let cleanPubKey = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;
        
        // eth-crypto expects uncompressed public key without 04 prefix
        if (cleanPubKey.startsWith('04')) {
            cleanPubKey = cleanPubKey.slice(2);
        }
        
        if (cleanPubKey.length !== 128) {
            throw new Error('Invalid public key format. Expected 128 hex characters (uncompressed, no prefix).');
        }
        
        // Encrypt the message
        const encrypted = await EthCrypto.encryptWithPublicKey(cleanPubKey, message);
        
        // Convert to string for easy transport
        const encryptedString = EthCrypto.cipher.stringify(encrypted);
        
        return {
            encrypted: encrypted,
            encryptedString: encryptedString
        };
        
    } catch (error) {
        console.error('Encryption failed:', error.message);
        throw error;
    }
}

async function decryptMessage(privateKeyHex, encryptedString) {
    try {
        // Remove 0x prefix if present
        const cleanPrivKey = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
        
        // Parse encrypted data
        const encrypted = EthCrypto.cipher.parse(encryptedString);
        
        // Decrypt the message
        const decrypted = await EthCrypto.decryptWithPrivateKey(cleanPrivKey, encrypted);
        
        return decrypted;
        
    } catch (error) {
        console.error('Decryption failed:', error.message);
        process.exit(1);
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage:');
        console.log('  Encrypt: node encrypt.js encrypt <public-key> <message>');
        console.log('  Decrypt: node encrypt.js decrypt <private-key> <encrypted-string>');
        console.log('');
        console.log('Examples:');
        console.log('  node encrypt.js encrypt 0x04abc123... "Hello World"');
        console.log('  node encrypt.js decrypt 0xdef456... "encrypted-string-here"');
        console.log('');
        console.log('Get public key from address:');
        console.log('  cast wallet public-key 0xYourAddress');
        process.exit(1);
    }
    
    const command = args[0];
    
    if (command === 'encrypt') {
        if (args.length < 3) {
            console.error('Error: Missing public key or message');
            process.exit(1);
        }
        
        const publicKey = args[1];
        const message = args[2];
        
        console.log('Encrypting message...');
        console.log('Public Key:', publicKey);
        console.log('Message:', message);
        console.log('');
        
        const result = await encryptMessage(publicKey, message);
        
        console.log('=== Encryption Result ===');
        console.log('Encrypted String:');
        console.log(result.encryptedString);
        console.log('');
        console.log('To decrypt, use:');
        console.log(`node encrypt.js decrypt <private-key> "${result.encryptedString}"`);
        
    } else if (command === 'decrypt') {
        if (args.length < 3) {
            console.error('Error: Missing private key or encrypted data');
            process.exit(1);
        }
        
        const privateKey = args[1];
        const encryptedData = args[2];
        
        console.log('Decrypting message...');
        console.log('');
        
        const result = await decryptMessage(privateKey, encryptedData);
        
        console.log('=== Decrypted Message ===');
        console.log(result);
        
    } else {
        console.error('Error: Unknown command. Use "encrypt" or "decrypt"');
        process.exit(1);
    }
}

main().catch(console.error);
