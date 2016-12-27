pragma solidity ^0.4.4;

contract Documents {
    mapping (bytes32 => uint) public documents;

    event DidAddDocument(bytes32 hash, uint timestamp);

    function addDocument(bytes32 hash) {
        documents[hash] = block.timestamp;
        DidAddDocument(hash, block.timestamp);
    }
}