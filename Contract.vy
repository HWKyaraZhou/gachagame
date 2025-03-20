#pragma version ^0.3.7
"""
@title Simplified Gacha Game Contract
@author Claude
@notice A simple Web3 gacha game with character management and battle rewards
"""

# Struct for character properties
struct Character:
    id: uint256
    rarity: uint8  # 2, 3, 4, or 5 stars
    attack: uint256
    defense: uint256
    hp: uint256
    exists: bool

# Game economic constants
PULL_COST: constant(uint256) = 100000000000000  # 0.0001 ether
BATTLE_REWARD: constant(uint256) = 1000000000000000  # 0.001 ether

# State variables
characterIdCounter: uint256
userCharacters: HashMap[address, HashMap[uint256, Character]]
userCharacterIds: HashMap[address, DynArray[uint256, 100]]  # Assuming max 100 characters per user
owner: address

# Events
event CharacterPulled:
    user: indexed(address)
    characterId: uint256
    rarity: uint8

event BattleWon:
    user: indexed(address)
    characterId: uint256

@external
def __init__():
    """
    @notice Contract initializer
    """
    self.characterIdCounter = 1
    self.owner = msg.sender

@external
@payable
def pullCharacter():
    """
    @notice Pulls a new character with gacha mechanics
    @dev Costs PULL_COST ether
    """
    assert msg.value >= PULL_COST, "Insufficient ETH sent"
    
    # Generate a random number for the pull (0-999)
    randomNum: uint256 = convert(
        keccak256(
            concat(
                convert(block.timestamp, bytes32),
                convert(msg.sender, bytes32),
                convert(self.characterIdCounter, bytes32)
            )
        ),
        uint256
    ) % 1000
    
    # Determine rarity based on probability
    rarity: uint8 = 0
    if randomNum < 6:  # 0.6% for 5-star
        rarity = 5
    elif randomNum < 26:  # 2% for 4-star
        rarity = 4
    elif randomNum < 400:  # 37.4% for 3-star
        rarity = 3
    else:  # 50% for 2-star
        rarity = 2
    
    # Create character with base stats according to rarity
    characterId: uint256 = self.characterIdCounter
    self.userCharacters[msg.sender][characterId] = Character({
        id: characterId,
        rarity: rarity,
        attack: 10 * convert(rarity, uint256),
        defense: 5 * convert(rarity, uint256),
        hp: 50 * convert(rarity, uint256),
        exists: True
    })
    
    # Add character to user's collection
    self.userCharacterIds[msg.sender].append(characterId)
    
    log CharacterPulled(msg.sender, characterId, rarity)
    
    self.characterIdCounter += 1

@external
def claimBattleReward(characterId: uint256):
    """
    @notice Claims a reward for winning a battle
    @dev Battle logic is implemented on the frontend
    @param characterId The ID of the character that won the battle
    """
    assert self.userCharacters[msg.sender][characterId].exists, "Character not found"
    
    # Transfer battle reward to the user
    send(msg.sender, BATTLE_REWARD)
    
    log BattleWon(msg.sender, characterId)

@external
@view
def getCharacters() -> DynArray[uint256, 100]:
    """
    @notice Gets all character IDs owned by the caller
    @return Array of character IDs
    """
    return self.userCharacterIds[msg.sender]

@external
@view
def getCharacter(characterId: uint256) -> (uint256, uint8, uint256, uint256, uint256):
    """
    @notice Gets details for a specific character
    @param characterId The ID of the character
    @return Character details: id, rarity, attack, defense, hp
    """
    assert self.userCharacters[msg.sender][characterId].exists, "Character not found"
    
    character: Character = self.userCharacters[msg.sender][characterId]
    return (
        character.id,
        character.rarity,
        character.attack,
        character.defense,
        character.hp
    )

@external
@view
def getContractBalance() -> uint256:
    """
    @notice Gets the current balance of the contract
    @return Contract balance in wei
    """
    return self.balance

@external
@payable
def fundContract():
    """
    @notice Allows anyone to fund the contract
    """
    pass

@external
def withdrawFunds():
    """
    @notice Allows the owner to withdraw funds from the contract
    """
    assert msg.sender == self.owner, "Only owner can withdraw"
    send(self.owner, self.balance)

@external
def removeDefeatedCharacter(characterId: uint256):
    """
    @notice Removes a character permanently after they are defeated in battle
    @param characterId The ID of the character to remove
    """
    assert self.userCharacters[msg.sender][characterId].exists, "Character not found"
    
    # Remove character from storage
    self.userCharacters[msg.sender][characterId].exists = False
    
    # Remove character from user's ID list
    old_ids: DynArray[uint256, 100] = self.userCharacterIds[msg.sender]
    new_ids: DynArray[uint256, 100] = []
    
    # Manually transfer IDs without using a loop
    # Since we can't use loops directly, we need to copy elements one by one
    # up to a reasonable maximum (for example, 50)
    max_size: uint256 = 50
    
    for i in range(50):  # Using a literal value for range
        if i >= len(old_ids):
            break
        if old_ids[i] != characterId:
            new_ids.append(old_ids[i])
    
    self.userCharacterIds[msg.sender] = new_ids