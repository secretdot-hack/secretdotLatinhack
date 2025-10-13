// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SecretDot {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    struct Msg {
        string ipfs;
        address from;
        uint256 t;
    }

    mapping(address => Msg[]) private m;
    mapping(address => string) private k;

    event MsgSent(address indexed f, address indexed t, string h);
    event KeySet(address indexed u, string k);

    error NoKey(address u);

    // ===== Mensajes =====
    function send(address to, string calldata h) external {
        if (bytes(k[to]).length == 0) revert NoKey(to);
        if (bytes(h).length == 0) revert();

        m[to].push(Msg({ipfs: h, from: msg.sender, t: block.timestamp}));
        emit MsgSent(msg.sender, to, h);
    }

    function inbox() external view returns (Msg[] memory) {
        return m[msg.sender];
    }

    // ===== Claves =====
    function setKey(string calldata v) external {
        if (bytes(v).length == 0) revert();
        k[msg.sender] = v;
        emit KeySet(msg.sender, v);
    }

    function keyOf(address u) external view returns (string memory) {
        string memory v = k[u];
        if (bytes(v).length == 0) revert NoKey(u);
        return v;
    }

    function hasKey(address u) external view returns (bool) {
        return bytes(k[u]).length > 0;
    }

    function myKey() external view returns (string memory) {
        string memory v = k[msg.sender];
        if (bytes(v).length == 0) revert NoKey(msg.sender);
        return v;
    }

    function delKey() external {
        if (bytes(k[msg.sender]).length == 0) revert NoKey(msg.sender);
        delete k[msg.sender];
    }

}
