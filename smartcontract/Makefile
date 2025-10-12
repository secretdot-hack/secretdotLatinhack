SHELL=/bin/bash
# Default network is moonbase
NETWORK ?= moonbase

# Load environment variables from .env file if it exists
-include .env

# Override with .env.public if it exists
-include .env.public

# Default RPC URL if not set
RPC_URL ?= https://rpc.api.moonbase.moonbeam.network

# Allow overriding environment variables
#PRIVATE_KEY ?= $(shell grep PRIVATE_KEY .env 2>/dev/null | cut -d= -f2)
#CONTRACT_ADDRESS ?= $(shell grep CONTRACT_ADDRESS .env.public 2>/dev/null | cut -d= -f2)

# Gas settings for local testing
ifeq ($(NETWORK),anvil)
  GAS_LIMIT ?= 300000
  GAS_PRICE ?= 1000000000
	UPDATE_ENV ?= false
else
  GAS_LIMIT ?= 300000
  GAS_PRICE ?= 1200000000
	UPDATE_ENV ?= true
endif

# Help target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  compile         - Compile the smart contract"
	@echo "  deploy          - Deploy the smart contract"
	@echo "  add-pubkey      - Add public key to contract storage"
	@echo "  get-pubkey      - Get public key from contract storage"
	@echo "  del-pubkey      - Delete public key from contract storage"
	@echo "  has-pubkey      - Check if public key exists in contract storage"
	@echo "  get-my-messages - Get my messages from the contract storage"
	@echo "  test-local      - Run local tests using Anvil"
	@echo "  show-env        - Show current environment variables"

# Check required tools
.PHONY: check-req
check-req:
	@echo "Checking required tools..."
	@which cast >/dev/null 2>&1 || { echo "cast is required but not installed. Install with: brew install foundry or: curl -L https://foundry.paradigm.xyz | bash"; exit 1; }
	@which anvil >/dev/null 2>&1 || { echo "anvil is required but not installed. Install with: brew install foundry or: curl -L https://foundry.paradigm.xyz | bash"; exit 1; }
	@which sponge >/dev/null 2>&1 || { echo "sponge is required but not installed. Install with: brew install moreutils or: sudo apt-get install moreutils"; exit 1; }
	@echo "All required tools are installed"

# Make check-req a prerequisite for all relevant targets
deploy: check-req
add-pubkey: check-req
get-pubkey: check-req
del-pubkey: check-req
has-pubkey: check-req
get-my-messages: check-req
# Compile contract
.PHONY: compile
compile:
	@echo "Compiling contract..."
	npx hardhat compile

# Deploy contract
.PHONY: deploy
deploy: compile
	@echo "Deploying contract to $(NETWORK)..."
	RESULT=$$(npx hardhat run scripts/deploy.js --network $(NETWORK)) && echo "$$RESULT" && { $(UPDATE_ENV) || exit 0 ;} && \
				 echo "$$(egrep -v export.CONTRACT_ADDRESS .env.public; echo "$$RESULT" | sed -nE '/^CONTRACT_ADDRESS/s/.*/export &/p')" | sponge .env.public

# Add public key
.PHONY: add-pubkey
add-pubkey:
	@echo "Adding public key..."
	$(eval PUB_KEY := $(shell cast wallet public-key --private-key "$(PRIVATE_KEY)"))
	cast send --gas-limit $(GAS_LIMIT) $(CONTRACT_ADDRESS) "RegisterUserPubKey(string)" "$(PUB_KEY)" \
		--rpc-url "$(RPC_URL)" --private-key $(PRIVATE_KEY)

# Get public key
.PHONY: show-env get-pubkey
get-pubkey:
	@echo "Getting public key..."
	$(eval WALLET_ADDR := $(shell cast wallet address --private-key $(PRIVATE_KEY)))
	cast call $(CONTRACT_ADDRESS) "GetUserPubKey(address)" "$(WALLET_ADDR)" \
		--rpc-url "$(RPC_URL)"

# Delete public key
.PHONY: show-env del-pubkey
del-pubkey:
	@echo "Deleting public key..."
	cast send --gas-limit $(GAS_LIMIT) $(CONTRACT_ADDRESS) "DeleteUserPubKey()" \
		--rpc-url "$(RPC_URL)" --private-key $(PRIVATE_KEY)

# Check if key exists
.PHONY: show-env has-pubkey
has-pubkey:
	@echo "Checking if public key exists..."
	$(eval WALLET_ADDR := $(shell cast wallet address --private-key $(PRIVATE_KEY)))
	cast call $(CONTRACT_ADDRESS) "hasRegisteredPubKey(address)" "$(WALLET_ADDR)" \
		--rpc-url "$(RPC_URL)"

# Get my messages
get-my-messages: show-env
	@echo "Getting messages..."
	$(eval RESULT := $(shell cast call $(CONTRACT_ADDRESS) "GetMyMessages()" --rpc-url "$(RPC_URL)"))
	@echo "Raw result: $(RESULT)"
	@echo "Decoded result:"
	cast abi-decode "getMyMessages()((bytes32,address,uint64,uint64,uint8,uint8,bool)[])" "$(RESULT)"

.PHONY: show-env
show-env:
	@echo "ENV: NETWORK=$(NETWORK) RPC_URL=$(RPC_URL) CONTRACT_ADDRESS=$(CONTRACT_ADDRESS)"

.PHONE: test
tests:
	@echo "Running tests..."
	forge test

# Local test environment setup
.PHONY: test-local
test-local:
	@echo "Running local tests..."
	./test-contract-local.sh
