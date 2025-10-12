#!/bin/bash
set -euo pipefail

# Check requirements first
echo "Checking requirements..."
make check-req

# Source environment files if they exist
[ -f .env ] && source .env
[ -f .env.public ] && source .env.public

# Ensure required environment variables are set
: ${PRIVATE_KEY:?required PRIVATE_KEY environment variable is not set}
: ${RPC_URL:?required RPC_URL environment variable is not set}
: ${CONTRACT_ADDRESS:?required CONTRACT_ADDRESS environment variable is not set}

echo "Testing against network: ${RPC_URL}"
echo "Using contract: ${CONTRACT_ADDRESS}"
echo "Using wallet: $(cast wallet address --private-key ${PRIVATE_KEY})"

# Common make arguments
MAKE_ARGS="NETWORK=moonbase RPC_URL=${RPC_URL} PRIVATE_KEY=${PRIVATE_KEY} CONTRACT_ADDRESS=${CONTRACT_ADDRESS}"

# Test functions
source test-common.sh
test_suite
