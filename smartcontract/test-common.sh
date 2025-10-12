test_suite() {
    : ${MAKE_ARGS:?"required MAKE_ARGS environment variable is not set"}
    set -euo pipefail
    # Test functions
    echo -e "
    Testing key registration..."
    make add-pubkey $MAKE_ARGS

    echo -e "
    Testing key retrieval..."
    make get-pubkey $MAKE_ARGS

    echo -e "
    Testing key deletion..."
    make del-pubkey $MAKE_ARGS

    echo -e "
    Verifying key deletion state..."
    make has-pubkey $MAKE_ARGS

    echo -e "
    Verifying key is deleted..."
    if make get-pubkey $MAKE_ARGS; then
        echo "Error: Key still accessible after deletion"
        exit 1
    fi

    echo -e "
    Re-adding key..."
    make add-pubkey $MAKE_ARGS

    echo -e "
    Verifying key is accessible..."
    make get-pubkey $MAKE_ARGS

    echo -e "
    Verifying messages ..."
    make get-my-messages $MAKE_ARGS

    echo -e "
    All tests completed successfully!"
}
