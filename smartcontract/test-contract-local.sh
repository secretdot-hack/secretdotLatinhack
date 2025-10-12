#!/bin/bash
set -euo pipefail

# Check requirements first
echo "Checking requirements..."
make check-req

# Start anvil in the background with deterministic accounts
echo "Starting Anvil..."
anvil --block-time 1 > anvil.log 2>&1 &
ANVIL_PID=$!

# Ensure we kill anvil on script exit
trap "kill $ANVIL_PID" EXIT

# Wait a bit for anvil to start
sleep 2

# Define RPC URL early for availability checks
RPC_URL=http://localhost:8545

# Check if Anvil is available with retry
echo "Checking Anvil network availability..."
MAX_ATTEMPTS=10
ATTEMPT=1
NETWORK_AVAILABLE=false

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  echo "Attempt $ATTEMPT of $MAX_ATTEMPTS: Checking if Anvil endpoint is ready..."
  
  # Try to get the network version using JSON-RPC
  if curl -s -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' \
     $RPC_URL | grep -q "result"; then
    echo "✅ Anvil network is available!"
    NETWORK_AVAILABLE=true
    break
  fi
  
  echo "❌ Anvil network not ready yet. Waiting 2 seconds before next attempt..."
  sleep 2
  ATTEMPT=$((ATTEMPT + 1))
done

# Exit with error if network is not available after all attempts
if [ "$NETWORK_AVAILABLE" != "true" ]; then
  echo "ERROR: Could not connect to Anvil network after $MAX_ATTEMPTS attempts."
  echo "Anvil log output:"
  cat anvil.log
  echo "Terminating Anvil process..."
  kill $ANVIL_PID || true
  exit 1
fi

# Setup environment for local testing
export NETWORK=anvil
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
export RPC_URL=$RPC_URL

# Test contract deployment
echo -e "
Deploying contract to local Anvil..."
make deploy NETWORK=$NETWORK RPC_URL=$RPC_URL PRIVATE_KEY=$PRIVATE_KEY

# Get deployed contract address and export it
export CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
echo "Contract deployed at: $CONTRACT_ADDRESS"

# Common make arguments
MAKE_ARGS="NETWORK=$NETWORK RPC_URL=$RPC_URL PRIVATE_KEY=$PRIVATE_KEY CONTRACT_ADDRESS=$CONTRACT_ADDRESS"

# Test functions
source test-common.sh
test_suite
