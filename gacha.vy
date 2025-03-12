# SPDX-License-Identifier: MIT
# Vyper version: 0.3.3

owner: public(address)
GACHA_COST: constant(uint256) = 100000000000000
LEVEL_UP_COST: constant(uint256) = 100000000000000
BATTLE_REWARD: constant(uint256) = 100000000000000

struct Character:
    rarity: uint8  # 2-star (2), 3-star (3), 4-star (4), 5-star (5)
    level: uint256
    hp: uint256

player_characters: public(HashMap[address, DynArray[Character, 100]])

@event
struct CharacterPulled:
    player: address
    rarity: uint8

@event
struct CharacterLeveledUp:
    player: address
    character_index: uint256

@event
struct BattleWon:
    player: address

@deploy
def __init__():
    owner = msg.sender

def pull_gacha():
    assert msg.value == GACHA_COST, "Incorrect ETH amount"
    rarity: uint8 = get_random_rarity()
    hp: uint256 = get_initial_hp(rarity)
    self.player_characters[msg.sender].append(Character(rarity, 1, hp))
    log CharacterPulled(msg.sender, rarity)

def level_up_character(index: uint256):
    assert msg.value == LEVEL_UP_COST, "Incorrect ETH amount"
    assert index < len(player_characters[msg.sender]), "Invalid character index"
    
    char: Character = self.player_characters[msg.sender][index]
    char.level += 1
    char.hp = (char.hp * 3) / 2  # 1.5x multiplier
    
    log CharacterLeveledUp(msg.sender, index)

def battle(index: uint256):
    assert index < len(player_characters[msg.sender]), "Invalid character index"
    
    char: Character = player_characters[msg.sender][index]
    enemy_hp: uint256 = get_random_enemy_hp()
    
    for i: uint256 in range(10):  # Limit to 10 turns
        if char.hp > 0 and enemy_hp > 0:
            enemy_hp -= get_random_damage()
            if enemy_hp > 0:
                char.hp -= get_random_damage()
        else:
            break

    
    if char.hp == 0:
        remove_character(msg.sender, index)
    else:
        send(msg.sender, BATTLE_REWARD)
        log BattleWon(msg.sender)

def get_random_rarity() -> uint8:
    rand: uint256 = convert(block.timestamp + convert(msg.sender, uint256), uint256) % 1000
    if rand < 6:
        return 5
    elif rand < 26:
        return 4
    elif rand < 400:
        return 3
    else:
        return 2

def get_initial_hp(rarity: uint8) -> uint256:
    if rarity == 5:
        return 100  # Adjust values as needed
    elif rarity == 4:
        return 80
    elif rarity == 3:
        return 60
    else:
        return 40

def get_random_enemy_hp() -> uint256:
    return (convert(block.timestamp + convert(msg.sender, uint256), uint256) % 100) + 30

def get_random_damage() -> uint256:
    return (convert(block.timestamp + convert(msg.sender, uint256), uint256) % 20) + 5

def remove_character(player: address, index: uint256):
    assert index < len(self.player_characters[player]), "Invalid index"
    last_index: uint256 = len(self.player_characters[player]) - 1
    self.player_characters[player][index] = self.player_characters[player][last_index]
    self.player_characters[player].pop()
