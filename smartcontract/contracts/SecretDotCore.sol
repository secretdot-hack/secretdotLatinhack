// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SecretDotCore {
    struct Message {
        bytes32 ipfsHash;
        address sender;
        uint64 timestamp;
        uint64 expiresAt;
        bool isDeleted;
    }

    mapping(address => Message[]) private userMessages;
    mapping(address => uint256) private lastMessageTimestamp;
    mapping(address => bool) private messageReceivingDisabled;
    mapping(address => mapping(address => bool)) private senderBlacklist;
    mapping(address => string) private userPubKeys;

    uint256 public constant MESSAGE_COOLDOWN = 1 minutes;
    uint256 public constant MAX_HASH_SIZE = 100;
    uint256 public constant DEFAULT_TTL = 30 days;

    event MessageSent(address indexed sender, address indexed recipient, bytes32 hash, uint64 expiresAt);
    event PubKeyRegistered(address indexed user, string pubKey);
    event PubKeyDeleted(address indexed user);

    error MessageNotFound(uint256 index);
    error PubKeyNotFound(address user);
    error RateLimit(uint256 nextAllowed);
    error MessageTooLarge(uint256 size);

    // ========= MENSAJES =========
    function sendMessage(address recipient, string calldata ipfsHash, uint64 ttl) external {
        if (block.timestamp < lastMessageTimestamp[msg.sender] + MESSAGE_COOLDOWN)
            revert RateLimit(lastMessageTimestamp[msg.sender] + MESSAGE_COOLDOWN);
        if (bytes(ipfsHash).length > MAX_HASH_SIZE)
            revert MessageTooLarge(bytes(ipfsHash).length);

        bytes32 hash = keccak256(bytes(ipfsHash));
        uint64 expiresAt = ttl == 0
            ? uint64(block.timestamp + DEFAULT_TTL)
            : uint64(block.timestamp + ttl);

        userMessages[recipient].push(Message({
            ipfsHash: hash,
            sender: msg.sender,
            timestamp: uint64(block.timestamp),
            expiresAt: expiresAt,
            isDeleted: false
        }));

        lastMessageTimestamp[msg.sender] = block.timestamp;
        emit MessageSent(msg.sender, recipient, hash, expiresAt);
    }

    function getMyMessages(uint256 limit) external view returns (Message[] memory) {
        Message[] storage all = userMessages[msg.sender];
        uint256 count = all.length < limit ? all.length : limit;
        Message[] memory result = new Message[](count);
        uint256 j;
        for (uint256 i; i < all.length && j < count; i++) {
            if (!all[i].isDeleted) result[j++] = all[i];
        }
        return result;
    }

    // ========= CLAVES =========
    function registerUserPubKey(string calldata pubkey) external {
        userPubKeys[msg.sender] = pubkey;
        messageReceivingDisabled[msg.sender] = false;
        emit PubKeyRegistered(msg.sender, pubkey);
    }

    function getUserPubKey(address user) external view returns (string memory) {
        string memory key = userPubKeys[user];
        if (bytes(key).length == 0) revert PubKeyNotFound(user);
        return key;
    }

}
