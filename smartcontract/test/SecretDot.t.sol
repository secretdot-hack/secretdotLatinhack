// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "contracts/SecretDot.sol";

contract SecretDotTest is Test {
    // Contract under test
    SecretDot public secretDot;

    // Test accounts
    address public deployer = address(1);
    address public alice = address(2);
    address public bob = address(3);

    // Test keys
    string public constant ALICE_PUBKEY =
        "0x04d69b962de2293a41aabc85f89a94157cf5c3b6651688e6f7d23ab871bf2a0abd9b00f498975fa4d958e05a9d11af12a4363de7c1550c943ef8e2d40ca161a718";
    string public constant BOB_PUBKEY =
        "0x04e7ea172cc92ef0a86e51870d2b3c28424fc93167a3fbc6d7c15beac1152d3ea6e884cf85bc3ddd570347fda18b4de5ec22a82f44210c8f6e131a48cc0ec03a1e";

    // Sample message data
    string public constant ENCRYPTED_MESSAGE = "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz";
    uint64 public constant TTL = 3600; // 1 hour
    uint8 public constant MESSAGE_TYPE = 0; // text
    uint8 public constant ENCRYPTION_METHOD = 1; // GPG

    function setUp() public {
        // Deploy contract as deployer
        vm.startPrank(deployer);
        secretDot = new SecretDot();
        vm.stopPrank();
    }

    function test_RegisterAndGetPubKey() public {
        // Alice registers her public key
        vm.startPrank(alice);
        secretDot.registerUserPubKey(ALICE_PUBKEY);

        // Verify Alice can retrieve her own key
        string memory retrievedKey = secretDot.getUserPubKey(alice);
        assertEq(retrievedKey, ALICE_PUBKEY, "Retrieved key should match registered key");

        // Verify Alice's key existence
        bool hasKey = secretDot.hasRegisteredPubKey(alice);
        assertTrue(hasKey, "Alice should have a registered key");
        vm.stopPrank();

        // Bob should be able to retrieve Alice's public key
        vm.prank(bob);
        retrievedKey = secretDot.getUserPubKey(alice);
        assertEq(retrievedKey, ALICE_PUBKEY, "Bob should be able to retrieve Alice's key");
    }

    function test_DeletePubKey() public {
        // Alice registers and then deletes her public key
        vm.startPrank(alice);
        secretDot.registerUserPubKey(ALICE_PUBKEY);
        secretDot.deleteUserPubKey();

        // Verify key no longer exists
        bool hasKey = secretDot.hasRegisteredPubKey(alice);
        assertFalse(hasKey, "Alice should not have a registered key after deletion");

        // Trying to get the deleted key should revert
        vm.expectRevert(abi.encodeWithSignature("PubKeyNotFoundError(address)", alice));
        secretDot.getUserPubKey(alice);
        vm.stopPrank();
    }

    function test_ReAddPubKeyAfterDeletion() public {
        // Alice registers, deletes, and re-registers her public key
        vm.startPrank(alice);
        secretDot.registerUserPubKey(ALICE_PUBKEY);
        secretDot.deleteUserPubKey();
        secretDot.registerUserPubKey(ALICE_PUBKEY);

        // Verify key exists again
        bool hasKey = secretDot.hasRegisteredPubKey(alice);
        assertTrue(hasKey, "Alice should have a registered key after re-adding");

        // Verify the key can be retrieved
        string memory retrievedKey = secretDot.getUserPubKey(alice);
        assertEq(retrievedKey, ALICE_PUBKEY, "Retrieved key should match re-registered key");
        vm.stopPrank();
    }

    function test_SendAndGetMessages() public {
        // Setup: Register keys for Alice and Bob
        vm.prank(alice);
        secretDot.registerUserPubKey(ALICE_PUBKEY);

        vm.prank(bob);
        secretDot.registerUserPubKey(BOB_PUBKEY);

        // Skip past the rate limit window
        skip(60);

        // Bob sends a message to Alice
        vm.prank(bob);
        secretDot.SendMessage(alice, ENCRYPTED_MESSAGE);

        // Alice checks her messages
        vm.startPrank(alice);
        (ISecretDot.Message[] memory messages,) = secretDot.getMyMessages(0, 1000, true, true, 0);

        // Verify Alice received 1 message
        assertEq(messages.length, 1, "Alice should have 1 message");

        // Verify message details
        ISecretDot.Message memory msg = messages[0];
        assertEq(msg.sender, bob, "Message should be from Bob");
        assertEq(msg.category, 0, "Message category should match");
        assertEq(msg.status, 0, "Message should be unread");

        // Message content is stored in ipfsHash
        // We can't directly compare the ENCRYPTED_MESSAGE since it's hashed using keccak256
        assertTrue(msg.ipfsHash != bytes32(0), "Message hash should not be empty");
        vm.stopPrank();
    }

    function test_MarkMessageAsRead() public {
        // Setup: Register keys and send a message
        vm.prank(alice);
        secretDot.registerUserPubKey(ALICE_PUBKEY);

        vm.prank(bob);
        secretDot.registerUserPubKey(BOB_PUBKEY);

        // Skip past the rate limit window
        skip(60);

        vm.prank(bob);
        secretDot.sendMessage(alice, ENCRYPTED_MESSAGE, TTL, 0);

        // Alice reads her message
        vm.startPrank(alice);
        (ISecretDot.Message[] memory messages,) = secretDot.getMyMessages(0, 1000, true, true, 0);
        // Mark message at index 0 as read

        // Mark as read
        secretDot.markMessageAsRead(0);

        // Verify message is now marked as read
        (messages,) = secretDot.getMyMessages(0, 1000, true, true, 0);
        assertEq(messages[0].status, 1, "Message should be marked as read");
        vm.stopPrank();
    }

    function test_DeleteMessage() public {
        // Setup: Register keys and send a message
        vm.prank(alice);
        secretDot.registerUserPubKey(ALICE_PUBKEY);

        vm.prank(bob);
        secretDot.registerUserPubKey(BOB_PUBKEY);

        // Skip past the rate limit window
        skip(60);

        vm.prank(bob);
        secretDot.sendMessage(alice, ENCRYPTED_MESSAGE, TTL, 0);

        // Alice deletes her message
        vm.startPrank(alice);
        (ISecretDot.Message[] memory messagesBefore,) = secretDot.getMyMessages(0, 1000, true, true, 0);

        // Delete message at index 0
        secretDot.deleteMessage(0);

        // Verify message is deleted
        (ISecretDot.Message[] memory messagesAfter,) = secretDot.getMyMessages(0, 1000, true, true, 0);
        assertEq(messagesAfter.length, 0, "Alice should have no messages after deletion");

        // The message has been marked as deleted
        // We can't directly verify this without a way to check isDeleted flag
        // We've already verified that it doesn't show up in GetMyMessages
        vm.stopPrank();
    }

    function test_EmptyKeyReverts() public {
        // Attempting to register an empty key should revert
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("InvalidPubKeyError(string)", ""));
        secretDot.registerUserPubKey("");
    }

    function test_GetNonExistentKeyReverts() public {
        // Attempting to get a non-existent key should revert
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("PubKeyNotFoundError(address)", bob));
        secretDot.getUserPubKey(bob);
    }

    function test_SendMessageToNoKeyUserReverts() public {
        // Bob tries to send a message to Alice who has no key
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSignature("PubKeyNotFoundError(address)", alice));
        secretDot.sendMessage(alice, ENCRYPTED_MESSAGE, TTL, 0);
    }

    function test_MessageExpiration() public {
        // Setup: Register keys and send a message with short TTL
        vm.prank(alice);
        secretDot.registerUserPubKey(ALICE_PUBKEY);

        vm.prank(bob);
        secretDot.registerUserPubKey(BOB_PUBKEY);

        uint64 shortTtl = 60; // 1 minute

        // Skip past the rate limit window
        skip(60);

        vm.prank(bob);
        secretDot.sendMessage(alice, ENCRYPTED_MESSAGE, shortTtl, 0);

        // Alice should see the message initially
        vm.startPrank(alice);
        (ISecretDot.Message[] memory messagesBefore,) = secretDot.getMyMessages(0, 1000, true, true, 0);
        assertEq(messagesBefore.length, 1, "Alice should have 1 message before expiration");

        // Advance time beyond TTL
        skip(shortTtl + 1);

        // After TTL, the message should no longer be visible
        (ISecretDot.Message[] memory messagesAfter,) = secretDot.getMyMessages(0, 1000, true, false, 0);
        assertEq(messagesAfter.length, 0, "Alice should have 0 messages after expiration");
        vm.stopPrank();
    }

    function test_FullFlow() public {
        // This test performs the same sequence as the original bash script:
        // 1. Register key
        // 2. Get key
        // 3. Delete key
        // 4. Verify key deletion
        // 5. Verify getting deleted key fails
        // 6. Re-add key
        // 7. Verify key is accessible
        // 8. Check messages

        // 1. Alice registers her key
        vm.startPrank(alice);
        secretDot.registerUserPubKey(ALICE_PUBKEY);

        // 2. Verify key retrieval works
        string memory retrievedKey = secretDot.getUserPubKey(alice);
        assertEq(retrievedKey, ALICE_PUBKEY, "Retrieved key should match registered key");

        // 3. Delete the key
        secretDot.deleteUserPubKey();

        // 4. Verify key is deleted
        bool hasKey = secretDot.hasRegisteredPubKey(alice);
        assertFalse(hasKey, "Alice should not have a registered key after deletion");

        // 5. Verify getting deleted key fails
        vm.expectRevert(abi.encodeWithSignature("PubKeyNotFoundError(address)", alice));
        secretDot.getUserPubKey(alice);

        // 6. Re-add the key
        secretDot.registerUserPubKey(ALICE_PUBKEY);

        // 7. Verify key is accessible
        retrievedKey = secretDot.getUserPubKey(alice);
        assertEq(retrievedKey, ALICE_PUBKEY, "Retrieved key should match re-registered key");

        // Register Bob's key so he can send messages
        vm.stopPrank();
        vm.prank(bob);
        secretDot.registerUserPubKey(BOB_PUBKEY);

        // Skip past the rate limit window
        skip(60);

        // Bob sends a message to Alice
        vm.prank(bob);
        secretDot.sendMessage(alice, ENCRYPTED_MESSAGE, TTL, 0);

        // 8. Alice checks her messages
        vm.prank(alice);
        (ISecretDot.Message[] memory messages,) = secretDot.getMyMessages(0, 1000, true, true, 0);
        assertEq(messages.length, 1, "Alice should have 1 message");

        // Test complete - all steps passed
    }
}
