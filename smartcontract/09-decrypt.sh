#!/bin/bash
source .env
: "${PRIVATE_KEY:?PRIVATE_KEY is not set in .env}"
set -euv
node scripts/encrypt.js decrypt "${PRIVATE_KEY}" "${1:?missing encrypted string}"
