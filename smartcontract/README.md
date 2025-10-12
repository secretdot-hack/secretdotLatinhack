# SecretDot Smart Contract Deployment

This directory contains scripts to help you set up, configure, and deploy the SecretDot smart contract to the Moonbase Alpha testnet (Moonbeam's testnet environment).

## Introduction

The deployment process consists of three main steps:

1. Setting up the development environment by installing necessary dependencies
2. Obtaining testnet tokens for deployment
3. Deploying the smart contract to the Moonbase Alpha testnet

These steps are automated through the provided shell scripts described below.

## Prerequisites

Before you begin, make sure you have:

- Node.js (v14 or later) and npm installed
- A Metamask wallet set up and configured for Moonbase Alpha testnet
- Basic knowledge of Ethereum smart contracts
- Git and a terminal application

## Step-by-Step Guide

### 1. Install Dependencies (`01-install_deps.sh`)

This script installs all the necessary development dependencies:

```bash
./01-install_deps.sh
```

The script performs the following actions:
- Installs the Remix remixd service globally
- Installs Hardhat and related dependencies for local development and testing
- Sets up Ethereum development tools (Waffle, Chai, Ethers)

### 2. Get Testnet Tokens (`02-get_testnet_tokens.sh`)

This script provides instructions for obtaining testnet tokens:

```bash
./02-get_testnet_tokens.sh
```

When executed, it will prompt you to:
1. Visit the Moonbase Alpha faucet website
2. Connect your Metamask wallet
3. Request testnet tokens to be used for deployment and testing

### 3. Deploy the Contract (`03-deploy.sh`)

This script deploys your smart contract to the Moonbase Alpha testnet:

```bash
./03-deploy.sh
```

The script:
1. Loads environment variables from the `.env` file
2. Uses Hardhat to compile and deploy the contract
3. Deploys to the Moonbase Alpha testnet


## Smart Contract Interaction Scripts

After deploying the contract, you can interact with it using the following scripts:

### 4. Add Public Key (`04-sm-add_pubkey.sh`)

This script adds a user's public key to the smart contract:

```bash
./04-sm-add_pubkey.sh
```

The script:
1. Takes a public key and associates it with your account address
2. Submits a transaction to the blockchain to store this association
3. Confirms the successful addition of your public key

### 5. Get Public Key (`05-sm-get_pubkey.sh`)

This script retrieves a public key associated with an address:

```bash
./05-sm-get_pubkey.sh
```

The script:
1. Queries the smart contract for a specific address
2. Returns the associated public key if one exists
3. Displays an appropriate message if no key is found

### 6. Delete Public Key (`06-sm-del_pubkey.sh`)

This script removes your public key from the smart contract:

```bash
./06-sm-del_pubkey.sh
```

The script:
1. Submits a transaction to remove your public key association
2. Verifies the deletion was successful
3. Only allows deletion of your own keys (caller's address)

### 7. Get My Messages (`07-sm-get_my_messages.sh`)

This script retrieves all messages associated with your account:

```bash
./07-sm-get_my_messages.sh
```

The script:
1. Queries the smart contract for messages sent to your address
2. Displays all messages with relevant metadata
3. Formats the output for easy reading

## Environment Configuration

Before deployment, you must create a `.env` file in this directory with the following variables:

```
export PRIVATE_KEY=your_metamask_private_key
export MOONBASE_URL=https://rpc.api.moonbase.moonbeam.network
```

Important notes:
- Never commit your `.env` file to version control
- Keep your private key secure
- You can export your private key from Metamask (Settings > Security & Privacy > Reveal Private Key)

## Additional Resources

- [Moonbeam Documentation](https://docs.moonbeam.network/)
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Moonbase Alpha Faucet](https://apps.moonbeam.network/moonbase-alpha/faucet/)

