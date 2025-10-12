// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ISecretDot
 * @dev Interface for the SecretDot contract
 */
interface ISecretDot {
    /**
     * @dev Struct for messages with optimized packing and additional features
     * @notice The struct is optimized for gas efficiency through field ordering
     */
    struct Message {
        bytes32 ipfsHash;       // Hash of encrypted content in IPFS (using bytes32 for gas optimization)
        address sender;         // Message sender
        uint64 timestamp;       // When message was sent (using uint64 instead of uint256 for gas optimization)
        uint64 expiresAt;       // When message expires (0 means never)
        uint8 status;           // 0: unread, 1: read
        uint8 category;         // Message category (0: default, 1-255: custom categories)
        bool isDeleted;         // Flag to mark message as deleted
    }

    // Main functions
    function pause() external;
    function unpause() external;
    function toggleMessageReceiving(bool isEnabled) external;
    function setBlockedSender(address sender, bool isBlocked) external;

    // Message functions
    function sendMessage(address recipient, string memory ipfsHash, uint64 ttl, uint8 category) external;
    function markMessageAsRead(uint256 messageIndex) external;
    function deleteMessage(uint256 messageIndex) external;
    function getMyMessages(uint256 offset, uint256 limit, bool includeRead, bool includeExpired, uint8 categoryFilter) external view returns (Message[] memory messages, uint256 total);
    function cleanupExpiredMessages(uint256 limit) external returns (uint256 count);

    // Public key functions
    function registerUserPubKey(string memory pubkey) external;
    function getUserPubKey(address userAddress) external view returns (string memory pubkey);
    function hasRegisteredPubKey(address userAddress) external view returns (bool);
    function getMyPubKey() external view returns (string memory pubkey);
    function deleteUserPubKey() external;
    function deleteUserPubKeyAdmin(address userAddress) external;

    // Backward compatibility functions
    function SendMessage(address recipient, string memory ipfsHash) external;
    function MarkMessageAsRead(uint256 messageIndex) external;
    function DeleteMessage(uint256 messageIndex) external;
    function GetMyMessages() external view returns (Message[] memory);
    function RegisterUserPubKey(string memory pubkey) external;
    function GetUserPubKey(address userAddress) external view returns (string memory);
    function HasRegisteredPubKey(address userAddress) external view returns (bool);
    function GetMyPubKey() external view returns (string memory);
    function DeleteUserPubKey() external;
    function DeleteUserPubKeyAdmin(address userAddress) external;
}

/**
 * @title SecretDot
 * @dev Use WEB3 infra (Blockchain + ipfs with encryption) to create a dApp for password management, identifying parties via WEB3 AuthN.
 * This contract implements secure message exchange with public key encryption and IPFS storage.
 *
 * Features:
 * - Public key registration and management
 * - Secure message sending and retrieval
 * - Message status tracking and expiration
 * - Rate limiting to prevent spam
 * - Ability to delete messages
 * - Emergency pause functionality
 */
contract SecretDot is ISecretDot, Ownable, ReentrancyGuard, Pausable {
    /**
     * @dev Constructor initializes the contract and sets the deployer as the owner.
     */
    constructor() Ownable(msg.sender) {
        // No additional initialization needed
    }

    // Using Message struct defined in the interface

    // Mapping: recipient => array of messages
    mapping(address => Message[]) private userMessages;

    // Rate limiting: sender => last message timestamp
    mapping(address => uint256) private lastMessageTimestamp;

    // Rate limiting constants
    uint256 public constant MESSAGE_COOLDOWN = 1 minutes; // Minimum time between messages from same sender
    uint256 public constant MAX_MESSAGE_SIZE = 100; // Maximum length of pubkey and IPFS hash string
    uint256 public constant DEFAULT_MESSAGE_TTL = 30 days; // Default time-to-live for messages

    // User preferences
    mapping(address => bool) private messageReceivingDisabled;
    mapping(address => mapping(address => bool)) private senderBlacklist;

    // Events
    event MessageSent(address indexed sender, address indexed recipient, bytes32 ipfsHash, uint64 expiresAt);
    event MessageRead(address indexed user, uint256 indexed messageIndex);
    event MessageDeleted(address indexed user, uint256 indexed messageIndex);
    event MessageReceivingToggled(address indexed user, bool isEnabled);
    // Mapping from user address to their public key
    mapping(address => string) private userPubKeys;
    // Mapping to track if a pubkey was explicitly deleted
    mapping(address => bool) private userPubKeyDeletedState;

    // Event emitted when a user registers their public key
    event PubKeyRegistered(address indexed user, string pubKey);

    // Event emitted when a user's public key is deleted
    event PubKeyDeleted(address indexed user, address indexed deletedBy);

    // Custom errors
    error PubKeyNotFoundError(address user);
    error UnauthorizedAccessError(address caller, address target);
    error RateLimitExceededError(address sender, uint256 cooldownEnd);
    error InvalidPubKeyError(string pubkey);
    error InvalidIPFSHashError(string hash);
    error MessageTooLargeError(uint256 size, uint256 maxSize);
    error MessageNotFoundError(address user, uint256 messageIndex);
    error MessageReceivingDisabledError(address recipient);
    error SenderBlockedError(address sender, address recipient);
    error MessageExpiredError(uint256 messageIndex);
    /**
     * @dev Emergency pause function that can only be called by the owner
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract to resume operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Toggle message receiving status
     * @param isEnabled Whether to enable or disable message receiving
     */
    function toggleMessageReceiving(bool isEnabled) external {
        messageReceivingDisabled[msg.sender] = !isEnabled;
        emit MessageReceivingToggled(msg.sender, isEnabled);
    }

    /**
     * @dev Block or unblock a sender
     * @param sender The address to block/unblock
     * @param isBlocked Whether to block or unblock the sender
     */
    function setBlockedSender(address sender, bool isBlocked) external {
        senderBlacklist[msg.sender][sender] = isBlocked;
    }

    /**
     * @dev Validate IPFS hash format
     * @param ipfsHash The IPFS hash to validate
     * @return bytes32 The converted hash
     */
    function validateAndConvertIPFSHash(string memory ipfsHash) internal pure returns (bytes32) {
        // Check if empty
        if (bytes(ipfsHash).length == 0) {
            revert InvalidIPFSHashError(ipfsHash);
        }

        // Check length
        if (bytes(ipfsHash).length > MAX_MESSAGE_SIZE) {
            revert MessageTooLargeError(bytes(ipfsHash).length, MAX_MESSAGE_SIZE);
        }

        // Check format - IPFS hashes usually start with Qm
        bytes memory hashBytes = bytes(ipfsHash);
        if (hashBytes.length >= 2 && hashBytes[0] != 'Q' && hashBytes[1] != 'm') {
            revert InvalidIPFSHashError(ipfsHash);
        }

        // Convert to bytes32
        return keccak256(bytes(ipfsHash));
    }

    // ================= Internal Function Implementations =================

    /**
     * @dev Send message implementation (store IPFS hash)
     * @param recipient Address to send the message to
     * @param ipfsHash IPFS hash of the encrypted content
     * @param ttl Time-to-live for message in seconds (0 for default TTL)
     * @param category Message category (0-255)
     */
    function _sendMessageInternal(
        address recipient,
        string memory ipfsHash,
        uint64 ttl,
        uint8 category
    )
        internal
    {
        // Recipient must have registered a public key and it must not be deleted
        if (!_hasRegisteredPubKeyInternal(recipient)) {
            revert PubKeyNotFoundError(recipient);
        }

        // Check if recipient has disabled messages
        if (messageReceivingDisabled[recipient]) {
            revert MessageReceivingDisabledError(recipient);
        }

        // Check if sender is blacklisted by recipient
        if (senderBlacklist[recipient][msg.sender]) {
            revert SenderBlockedError(msg.sender, recipient);
        }

        // Rate limiting check
        if (block.timestamp < lastMessageTimestamp[msg.sender] + MESSAGE_COOLDOWN) {
            revert RateLimitExceededError(
                msg.sender,
                lastMessageTimestamp[msg.sender] + MESSAGE_COOLDOWN
            );
        }

        // Validate and convert IPFS hash
        bytes32 validatedHash = validateAndConvertIPFSHash(ipfsHash);

        // Calculate expiration (use default TTL if not specified)
        uint64 expiresAt = ttl == 0
            ? uint64(block.timestamp + DEFAULT_MESSAGE_TTL)
            : uint64(block.timestamp + ttl);

        // Store message in recipient's mapping
        userMessages[recipient].push(Message({
            ipfsHash: validatedHash,
            sender: msg.sender,
            timestamp: uint64(block.timestamp),
            expiresAt: expiresAt,
            status: 0, // unread
            category: category,
            isDeleted: false
        }));

        // Update rate limiting
        lastMessageTimestamp[msg.sender] = block.timestamp;

        // Emit event to confirm message was sent
        emit MessageSent(msg.sender, recipient, validatedHash, expiresAt);
    }

    /**
     * @dev External wrapper for sendMessage
     */
    function sendMessage(
        address recipient,
        string memory ipfsHash,
        uint64 ttl,
        uint8 category
    )
        external
        nonReentrant
        whenNotPaused
    {
        _sendMessageInternal(recipient, ipfsHash, ttl, category);
    }

    /**
     * @dev Mark message as read implementation
     * @param messageIndex Index of the message to mark as read
     */
    function _markMessageAsReadInternal(uint256 messageIndex) internal {
        if (messageIndex >= userMessages[msg.sender].length) {
            revert MessageNotFoundError(msg.sender, messageIndex);
        }

        Message storage message = userMessages[msg.sender][messageIndex];

        // Check if message is deleted
        if (message.isDeleted) {
            revert MessageNotFoundError(msg.sender, messageIndex);
        }

        // Check if message is expired
        if (message.expiresAt != 0 && block.timestamp > message.expiresAt) {
            revert MessageExpiredError(messageIndex);
        }

        // Mark as read
        message.status = 1; // read
        emit MessageRead(msg.sender, messageIndex);
    }

    /**
     * @dev External wrapper for markMessageAsRead
     */
    function markMessageAsRead(uint256 messageIndex) external {
        _markMessageAsReadInternal(messageIndex);
    }

    /**
     * @dev Delete a message implementation
     * @param messageIndex Index of the message to delete
     */
    function _deleteMessageInternal(uint256 messageIndex) internal {
        if (messageIndex >= userMessages[msg.sender].length) {
            revert MessageNotFoundError(msg.sender, messageIndex);
        }

        Message storage message = userMessages[msg.sender][messageIndex];

        // Check if already deleted
        if (message.isDeleted) {
            revert MessageNotFoundError(msg.sender, messageIndex);
        }

        // Mark as deleted
        message.isDeleted = true;
        emit MessageDeleted(msg.sender, messageIndex);
    }

    /**
     * @dev External wrapper for deleteMessage
     */
    function deleteMessage(uint256 messageIndex) external nonReentrant {
        _deleteMessageInternal(messageIndex);
    }

    /**
     * @dev Get messages for the calling user with pagination implementation
     * @param offset Starting index
     * @param limit Maximum number of messages to return
     * @param includeRead Whether to include read messages
     * @param includeExpired Whether to include expired messages
     * @param categoryFilter Filter by category (0 for any category)
     * @return messages Array of messages
     * @return total Total number of messages matching criteria
     */
    function _getMyMessagesInternal(
        uint256 offset,
        uint256 limit,
        bool includeRead,
        bool includeExpired,
        uint8 categoryFilter
    )
        internal
        view
        returns (Message[] memory messages, uint256 total)
    {
        Message[] storage userMsgs = userMessages[msg.sender];

        // Count total messages matching criteria
        uint256 matchingCount = 0;
        for (uint256 i = 0; i < userMsgs.length; i++) {
            Message storage message = userMsgs[i];

            // Skip deleted messages
            if (message.isDeleted) continue;

            // Skip read messages if not including read
            if (!includeRead && message.status == 1) continue;

            // Skip expired messages if not including expired
            if (!includeExpired && message.expiresAt != 0 && block.timestamp > message.expiresAt) continue;

            // Skip messages not matching category filter
            if (categoryFilter != 0 && message.category != categoryFilter) continue;

            matchingCount++;
        }

        // Apply pagination
        uint256 resultCount = matchingCount > offset ?
            (matchingCount - offset < limit ? matchingCount - offset : limit) : 0;

        // Create result array
        Message[] memory result = new Message[](resultCount);

        // Fill result array
        if (resultCount > 0) {
            uint256 resultIndex = 0;
            uint256 skipped = 0;

            for (uint256 i = 0; i < userMsgs.length && resultIndex < resultCount; i++) {
                Message storage message = userMsgs[i];

                // Skip deleted messages
                if (message.isDeleted) continue;

                // Skip read messages if not including read
                if (!includeRead && message.status == 1) continue;

                // Skip expired messages if not including expired
                if (!includeExpired && message.expiresAt != 0 && block.timestamp > message.expiresAt) continue;

                // Skip messages not matching category filter
                if (categoryFilter != 0 && message.category != categoryFilter) continue;

                // Skip messages before offset
                if (skipped < offset) {
                    skipped++;
                    continue;
                }

                result[resultIndex] = message;
                resultIndex++;
            }
        }

        return (result, matchingCount);
    }

    /**
     * @dev External wrapper for getMyMessages
     */
    function getMyMessages(
        uint256 offset,
        uint256 limit,
        bool includeRead,
        bool includeExpired,
        uint8 categoryFilter
    )
        external
        view
        returns (Message[] memory messages, uint256 total)
    {
        return _getMyMessagesInternal(offset, limit, includeRead, includeExpired, categoryFilter);
    }

    /**
     * @dev Register a public key for the calling user implementation
     * @param pubkey The public key string to register
     */
    function _registerUserPubKeyInternal(string memory pubkey) internal {
        if (bytes(pubkey).length == 0) {
            revert InvalidPubKeyError(pubkey);
        }

        if (bytes(pubkey).length > MAX_MESSAGE_SIZE * 2) {
            revert MessageTooLargeError(bytes(pubkey).length, MAX_MESSAGE_SIZE * 2);
        }

        // First clear the deleted state before updating the key
        // This ensures the deleted state is cleared before we store the new key
        userPubKeyDeletedState[msg.sender] = false;

        // Store the new key
        userPubKeys[msg.sender] = pubkey;

        // Re-enable message receiving when registering a new key
        messageReceivingDisabled[msg.sender] = false;

        emit PubKeyRegistered(msg.sender, pubkey);
    }

    /**
     * @dev External wrapper for registerUserPubKey
     */
    function registerUserPubKey(string memory pubkey) external whenNotPaused {
        _registerUserPubKeyInternal(pubkey);
    }

    /**
     * @dev Get the public key for a specific address implementation
     * @param userAddress The address to look up the public key for
     * @return pubkey The public key string associated with the address
     */
    function _getUserPubKeyInternal(address userAddress) internal view returns (string memory pubkey) {
        // First check if the key has been explicitly deleted
        if (userPubKeyDeletedState[userAddress]) {
            revert PubKeyNotFoundError(userAddress);
        }

        string memory storedPubKey = userPubKeys[userAddress];

        if (bytes(storedPubKey).length == 0) {
            revert PubKeyNotFoundError(userAddress);
        }

        return storedPubKey;
    }

    /**
     * @dev External wrapper for getUserPubKey
     */
    function getUserPubKey(address userAddress) external view returns (string memory pubkey) {
        return _getUserPubKeyInternal(userAddress);
    }

    /**
     * @dev Check if a user has registered a public key implementation
     * @param userAddress The address to check
     * @return bool True if the user has a registered public key, false otherwise
     */
    function _hasRegisteredPubKeyInternal(address userAddress) internal view returns (bool) {
        // First check if the key has been explicitly deleted
        if (userPubKeyDeletedState[userAddress]) {
            return false;
        }

        // Then check if the key content exists
        return bytes(userPubKeys[userAddress]).length > 0;
    }

    /**
     * @dev External wrapper for hasRegisteredPubKey
     */
    function hasRegisteredPubKey(address userAddress) external view returns (bool) {
        return _hasRegisteredPubKeyInternal(userAddress);
    }

    /**
     * @dev Get the public key for the calling user implementation
     * @return pubkey The public key string associated with msg.sender
     */
    function _getMyPubKeyInternal() internal view returns (string memory pubkey) {
        // First check if the key has been explicitly deleted
        if (userPubKeyDeletedState[msg.sender]) {
            revert PubKeyNotFoundError(msg.sender);
        }

        string memory storedPubKey = userPubKeys[msg.sender];

        if (bytes(storedPubKey).length == 0) {
            revert PubKeyNotFoundError(msg.sender);
        }

        return storedPubKey;
    }

    /**
     * @dev External wrapper for getMyPubKey
     */
    function getMyPubKey() external view returns (string memory pubkey) {
        return _getMyPubKeyInternal();
    }

    /**
     * @dev Delete the public key for the calling user
     * @notice This function allows users to delete their own public key.
     * Messages can still be received but will require re-registering a public key to decrypt them.
     */
    function _deleteUserPubKeyInternal() internal {
        // Check if the user has a registered key using the internal function
        // which verifies both the key existence and deletion state
        if (!_hasRegisteredPubKeyInternal(msg.sender)) {
            revert PubKeyNotFoundError(msg.sender);
        }

        // Clear the key content first by setting to empty string
        // This ensures the key is properly cleared from storage
        userPubKeys[msg.sender] = "";

        // Then mark as deleted
        userPubKeyDeletedState[msg.sender] = true;

        // Automatically disable message receiving when deleting key
        messageReceivingDisabled[msg.sender] = true;

        emit PubKeyDeleted(msg.sender, msg.sender);
    }

    /**
     * @dev External wrapper for deleteUserPubKey
     */
    function deleteUserPubKey() external nonReentrant whenNotPaused {
        _deleteUserPubKeyInternal();
    }

    /**
     * @dev Delete the public key for any user (admin function)
     * @notice This function allows the contract owner to delete any user's public key.
     * This can be used for moderation purposes or to assist users who have lost access.
     * @param userAddress The address of the user whose public key should be deleted
     */
    function _deleteUserPubKeyAdminInternal(address userAddress) internal {
        // Check if the user has a registered key using the internal function
        // which verifies both the key existence and deletion state
        if (!_hasRegisteredPubKeyInternal(userAddress)) {
            revert PubKeyNotFoundError(userAddress);
        }

        // Clear the key content first by setting to empty string
        // This ensures the key is properly cleared from storage
        userPubKeys[userAddress] = "";

        // Then mark as deleted
        userPubKeyDeletedState[userAddress] = true;

        // Automatically disable message receiving when deleting key
        messageReceivingDisabled[userAddress] = true;

        emit PubKeyDeleted(userAddress, msg.sender);
    }

    /**
     * @dev External wrapper for deleteUserPubKeyAdmin
     */
    function deleteUserPubKeyAdmin(address userAddress) external onlyOwner nonReentrant whenNotPaused {
        _deleteUserPubKeyAdminInternal(userAddress);
    }

    // ================= Backward Compatibility Functions =================
    // These functions provide uppercase method names for backward compatibility
    // They call the internal implementations directly for gas efficiency

    /**
     * @dev Backward compatibility for old SendMessage function
     */
    function SendMessage(address recipient, string memory ipfsHash) external nonReentrant whenNotPaused {
        _sendMessageInternal(recipient, ipfsHash, 0, 0);
    }

    /**
     * @dev Backward compatibility for old MarkMessageAsRead function
     */
    function MarkMessageAsRead(uint256 messageIndex) external {
        _markMessageAsReadInternal(messageIndex);
    }

    /**
     * @dev Backward compatibility for old DeleteMessage function
     */
    function DeleteMessage(uint256 messageIndex) external nonReentrant {
        _deleteMessageInternal(messageIndex);
    }

    /**
     * @dev Backward compatibility for old GetMyMessages function
     */
    function GetMyMessages() external view returns (Message[] memory) {
        (Message[] memory messages, ) = _getMyMessagesInternal(0, 1000, true, true, 0);
        return messages;
    }

    /**
     * @dev Backward compatibility for old RegisterUserPubKey function
     */
    function RegisterUserPubKey(string memory pubkey) external whenNotPaused {
        _registerUserPubKeyInternal(pubkey);
    }

    /**
     * @dev Backward compatibility for old GetUserPubKey function
     */
    function GetUserPubKey(address userAddress) external view returns (string memory) {
        return _getUserPubKeyInternal(userAddress);
    }

    /**
     * @dev Backward compatibility for old HasRegisteredPubKey function
     */
    function HasRegisteredPubKey(address userAddress) external view returns (bool) {
        return _hasRegisteredPubKeyInternal(userAddress);
    }

    /**
     * @dev Backward compatibility for old GetMyPubKey function
     */
    function GetMyPubKey() external view returns (string memory) {
        return _getMyPubKeyInternal();
    }

    /**
     * @dev Backward compatibility for old DeleteUserPubKey function
     */
    function DeleteUserPubKey() external nonReentrant whenNotPaused {
        _deleteUserPubKeyInternal();
    }

    /**
     * @dev Backward compatibility for old DeleteUserPubKeyAdmin function
     */
    function DeleteUserPubKeyAdmin(address userAddress) external onlyOwner nonReentrant whenNotPaused {
        _deleteUserPubKeyAdminInternal(userAddress);
    }

    /**
     * @dev Clean up expired messages to reclaim storage
     * @param limit Maximum number of messages to check
     * @return count Number of deleted messages
     */
    function cleanupExpiredMessages(uint256 limit) external nonReentrant returns (uint256 count) {
        Message[] storage userMsgs = userMessages[msg.sender];
        uint256 processed = 0;
        uint256 deleted = 0;

        for (uint256 i = 0; i < userMsgs.length && processed < limit; i++) {
            processed++;

            // Skip already deleted messages
            if (userMsgs[i].isDeleted) continue;

            // Delete if expired
            if (userMsgs[i].expiresAt != 0 && block.timestamp > userMsgs[i].expiresAt) {
                userMsgs[i].isDeleted = true;
                deleted++;
                emit MessageDeleted(msg.sender, i);
            }
        }

        return deleted;
    }
}
