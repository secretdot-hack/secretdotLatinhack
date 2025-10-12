#!/bin/bash
source .env
: "${PRIVATE_KEY:?PRIVATE_KEY is not set in .env}"
set -euv
PUB_KEY=$(cast wallet public-key --private-key "${PRIVATE_KEY}")
node scripts/encrypt.js encrypt "${PUB_KEY}" "${*:?missing msg}"
