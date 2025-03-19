// Replace with your deployed contract address
const contractAddress = "0x069f9f276cea5B3d52f008669B23c23b51D09D7A";

// Contract ABI - Update this with your actual ABI after compilation
const contractABI = [
    { "type": "event", "name": "CharacterPulled", "inputs": [{ "name": "user", "type": "address", "components": null, "internalType": null, "indexed": true }, { "name": "characterId", "type": "uint256", "components": null, "internalType": null, "indexed": false }, { "name": "rarity", "type": "uint8", "components": null, "internalType": null, "indexed": false }], "anonymous": false }, { "type": "event", "name": "BattleWon", "inputs": [{ "name": "user", "type": "address", "components": null, "internalType": null, "indexed": true }, { "name": "characterId", "type": "uint256", "components": null, "internalType": null, "indexed": false }], "anonymous": false }, { "type": "constructor", "stateMutability": "nonpayable", "inputs": [] }, { "type": "function", "name": "pullCharacter", "stateMutability": "payable", "inputs": [], "outputs": [] }, { "type": "function", "name": "claimBattleReward", "stateMutability": "nonpayable", "inputs": [{ "name": "characterId", "type": "uint256", "components": null, "internalType": null }], "outputs": [] }, { "type": "function", "name": "getCharacters", "stateMutability": "view", "inputs": [], "outputs": [{ "name": "", "type": "uint256[]", "components": null, "internalType": null }] }, { "type": "function", "name": "getCharacter", "stateMutability": "view", "inputs": [{ "name": "characterId", "type": "uint256", "components": null, "internalType": null }], "outputs": [{ "name": "", "type": "uint256", "components": null, "internalType": null }, { "name": "", "type": "uint8", "components": null, "internalType": null }, { "name": "", "type": "uint256", "components": null, "internalType": null }, { "name": "", "type": "uint256", "components": null, "internalType": null }, { "name": "", "type": "uint256", "components": null, "internalType": null }] }, { "type": "function", "name": "getContractBalance", "stateMutability": "view", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "components": null, "internalType": null }] }, { "type": "function", "name": "fundContract", "stateMutability": "payable", "inputs": [], "outputs": [] }, { "type": "function", "name": "withdrawFunds", "stateMutability": "nonpayable", "inputs": [], "outputs": [] }
];