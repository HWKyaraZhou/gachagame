// Replace with your deployed contract address
const contractAddress = "0xYourContractAddressHere";

// Contract ABI - Update this with your actual ABI after compilation
const contractABI = [
    {
        "name": "CharacterPulled",
        "type": "event",
        "inputs": [
            {"name": "user", "type": "address", "indexed": true},
            {"name": "characterId", "type": "uint256", "indexed": false},
            {"name": "rarity", "type": "uint8", "indexed": false}
        ],
        "anonymous": false
    },
    {
        "name": "BattleWon",
        "type": "event",
        "inputs": [
            {"name": "user", "type": "address", "indexed": true},
            {"name": "characterId", "type": "uint256", "indexed": false}
        ],
        "anonymous": false
    },
    {
        "name": "__init__",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "name": "pullCharacter",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "name": "claimBattleReward",
        "type": "function",
        "inputs": [{"name": "characterId", "type": "uint256"}],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "name": "getCharacters",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256[]"}],
        "stateMutability": "view"
    },
    {
        "name": "getCharacter",
        "type": "function",
        "inputs": [{"name": "characterId", "type": "uint256"}],
        "outputs": [
            {"name": "", "type": "uint256"},
            {"name": "", "type": "uint8"},
            {"name": "", "type": "uint256"},
            {"name": "", "type": "uint256"},
            {"name": "", "type": "uint256"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "getContractBalance",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view"
    },
    {
        "name": "fundContract",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "name": "withdrawFunds",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    }
];