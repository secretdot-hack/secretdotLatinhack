# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SecretDot is a decentralized, end-to-end encrypted messaging platform built on Polkadot's Paseo Asset Hub testnet. Users encrypt messages in their browser using MetaMask, store encrypted content in localStorage, and record message metadata on-chain via smart contracts. Only recipients with the correct private keys can decrypt messages.

## Development Commands

### Frontend (secretdotfrontend/)

```bash
# Development
cd secretdotfrontend
npm install
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm start                # Production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix lint issues
npm run typecheck        # TypeScript type checking
npm run format:check     # Check code formatting
npm run format:write     # Auto-format code
```

### Smart Contracts (smartcontract/)

```bash
cd smartcontract
npm install

# Using Makefile
make deploy              # Deploy contracts to testnet
make encrypt TEXT="..."  # Test encryption utilities
make decrypt ENCRYPTED="..." # Test decryption

# Direct Hardhat commands
npx hardhat compile      # Compile contracts
npx hardhat test         # Run tests
npx hardhat node         # Start local node
```

## Architecture

### Message Flow Architecture

**Sending Messages:**
1. User enters message in SecureMessageModal
2. Frontend validates recipient has public key registered (`keyOf()` contract call)
3. Message encrypted using MetaMask's `eth_encrypt` (x25519-xsalsa20-poly1305)
4. Hash generated: `keccak256(encrypted + timestamp + recipient)` formatted as IPFS-like hash (`Qm...`)
5. Encrypted message stored in localStorage: `secretdot_msg_{hash}`
6. Transaction sent to contract: `send(recipientAddress, hash)`
7. Blockchain records metadata: sender, recipient, hash, timestamp

**Receiving Messages:**
1. Dashboard fetches message metadata via `inbox()` contract call
2. For each message, retrieve encrypted content from localStorage using hash
3. Decrypt using MetaMask's `eth_decrypt` (requires recipient's private key)
4. Display decrypted content in Inbox tab

### Storage Model

- **Blockchain (Smart Contract)**: Stores only metadata (sender, recipient, hash, timestamp)
- **localStorage**: Stores actual encrypted message content keyed by hash
- **No backend server**: Fully decentralized, browser-based architecture

### Contract Architecture

**SecretDot.sol** (Main Contract - `0x775969a56f3EE47cd3F56Da602D6F5Bf2625296A`)
- `mapping(address => Msg[]) private m` - Messages per user
- `mapping(address => string) private k` - Public keys per address
- `send(address to, string h)` - Send message with IPFS hash
- `inbox()` - Get messages for caller
- `setKey(string v)` - Register public key for encryption
- `keyOf(address u)` - Retrieve user's public key
- `hasKey(address u)` - Check if user has registered key

**SecretDotCore.sol** (Extended version with advanced features)
- Adds TTL (time-to-live) for messages
- Rate limiting (1 minute cooldown between sends)
- Blacklist functionality (partial implementation)

## Network Configuration

**Primary Network: Polkadot Paseo Asset Hub**
- Chain ID: `420420422` (0x190f1b46)
- RPC: `https://testnet-passet-hub-eth-rpc.polkadot.io`
- Explorer: `https://blockscout-passet-hub.parity-testnet.parity.io`
- Symbol: PAS
- Deployed Contract: `0x775969a56f3EE47cd3F56Da602D6F5Bf2625296A`

Network switching handled in [utils/ether.ts](secretdotfrontend/src/utils/ether.ts) via `switchToDesiredNetwork()`

## Key Components

### Frontend Component Hierarchy

- **LoginScreen** ([components/LoginScreen.tsx](secretdotfrontend/src/components/LoginScreen.tsx))
  - Handles MetaMask connection
  - Network validation/switching to Paseo Asset Hub
  - Stores account in localStorage

- **Dashboard** ([components/Dashboard.tsx](secretdotfrontend/src/components/Dashboard.tsx))
  - Main application interface with Inbox/Sent tabs
  - Manages public key registration flow
  - Fetches and decrypts messages
  - Shows OnboardingModal for first-time users

- **SecureMessageModal** ([components/Secure-Message-Modal.tsx](secretdotfrontend/src/components/Secure-Message-Modal.tsx))
  - Message composition interface
  - Encryption and localStorage persistence
  - Smart contract interaction for sending

- **OnboardingModal** ([components/OnboardingModal.tsx](secretdotfrontend/src/components/OnboardingModal.tsx))
  - 3-step educational flow explaining public keys and encryption
  - Guides users through activating encryption via `setKey()`

### Utility Files

- [utils/ether.ts](secretdotfrontend/src/utils/ether.ts) - MetaMask interaction, network switching, account management
- [utils/contract.ts](secretdotfrontend/src/utils/contract.ts) - Contract instance creation using ethers.js
- [abis/SecretDot.json](secretdotfrontend/src/abis/SecretDot.json) - Contract ABI for frontend interaction

## Cryptography Implementation

**Encryption:**
- Algorithm: x25519-xsalsa20-poly1305 (via MetaMask)
- Method: `window.ethereum.request({ method: 'eth_encrypt', params: [publicKey, message] })`
- Each message encrypted with recipient's public key
- Encryption happens entirely in browser before any transmission

**Public Key Management:**
- Users register public keys on-chain via `setKey(publicKey)`
- Public keys retrieved for encryption via `keyOf(address)`
- Uses secp256k1 for wallet signatures

**Hash Generation:**
- Uses keccak256 to create IPFS-like references
- Format: `Qm` + first 46 hex characters
- Links localStorage content to blockchain metadata

## Tech Stack

- **Frontend**: Next.js 15.2.3, React 19, TypeScript 5.8
- **Styling**: Tailwind CSS 4.1.8, shadcn/ui (Radix UI base)
- **Web3**: ethers.js 6.13.5, MetaMask eth-sig-util 8.2.0
- **Cryptography**: secp256k1 5.0.1, eciesjs 0.4.15
- **Smart Contracts**: Solidity 0.8.20, Hardhat 2.24.1, OpenZeppelin 5.3.0
- **Icons**: Lucide React 0.511.0
- **Notifications**: React Hot Toast 2.5.2

## Important Development Notes

### Authentication Flow
Users must complete this sequence:
1. Connect MetaMask wallet
2. Switch to Paseo Asset Hub network (auto-prompted)
3. Register public key on first use (via OnboardingModal)
4. Only then can send/receive encrypted messages

### Testing Smart Contracts
- Use `test-inbox.js` at repository root for contract interaction testing
- Makefile provides encryption/decryption utilities for development
- Reference `.env.public` for RPC endpoints

### Path Aliases
TypeScript configured with `~/*` alias pointing to `src/*` directory

### Language
Application copy is primarily in Spanish, targeting Latin American users with Web3-focused UX writing

### Recent Changes
- Micro-animations added for UI polish
- 3-step onboarding modal explaining encryption concepts
- UX writing improved with Web3 user-centric copy
- Updated SecretDot branding/logo
