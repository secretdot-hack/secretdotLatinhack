#!/bin/bash
source .env.public || exit 1
set -eu
WALLET_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)

echo Visit https://apps.moonbeam.network/moonbase-alpha/faucet/ and load tokens to the Metamask address: ${WALLET_ADDRESS:?}

link polkadot assets hub testnet tokens: https://faucet.polkadot.io/?parachain=1111
