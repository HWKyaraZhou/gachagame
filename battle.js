// Battle state
let currentBattle = {
    playerCharacter: null,
    enemy: null,
    playerCurrentHP: 0,
    enemyCurrentHP: 0,
    inProgress: false
};

// DOM Elements for battle
const startBattleBtn = document.getElementById('start-battle');
const attackButton = document.getElementById('attack-button');
const endBattleBtn = document.getElementById('end-battle');
const battleLog = document.getElementById('battle-log');
const playerCharacterDetails = document.getElementById('player-character-details');
const enemyDetails = document.getElementById('enemy-details');
const playerCurrentHP = document.getElementById('player-current-hp');
const playerMaxHP = document.getElementById('player-max-hp');
const enemyCurrentHP = document.getElementById('enemy-current-hp');
const enemyMaxHP = document.getElementById('enemy-max-hp');
const playerHPBar = document.getElementById('player-hp-bar');
const enemyHPBar = document.getElementById('enemy-hp-bar');

// Start battle function
async function startBattle() {
    const characterId = characterSelect.value;
    if (!characterId) {
        showNotification("Please select a character to battle", "error");
        return;
    }

    // Find the selected character
    const playerCharacter = userCharacters.find(char => char.id == characterId);
    if (!playerCharacter) {
        showNotification("Character not found", "error");
        return;
    }

    // Create enemy with rarity equal to or higher than player's (up to 5)
    const enemyRarity = Math.min(5, playerCharacter.rarity + Math.floor(Math.random() * 2));
    const enemy = {
        rarity: enemyRarity,
        attack: Math.floor(11 * enemyRarity * (0.8 + Math.random() * 0.4)),
        defense: Math.floor(5 * enemyRarity * (0.8 + Math.random() * 0.4)),
        hp: Math.floor(55 * enemyRarity * (0.8 + Math.random() * 0.4))
    };

    // Set up battle state
    currentBattle = {
        playerCharacter: playerCharacter,
        enemy: enemy,
        playerCurrentHP: playerCharacter.hp,
        enemyCurrentHP: enemy.hp,
        inProgress: true
    };

    // Update battle UI
    updateBattleUI();

    // Show battle controls
    startBattleBtn.style.display = 'none';
    attackButton.style.display = 'inline-block';
    endBattleBtn.style.display = 'none';
    battleLog.innerHTML = '<p>Battle started! Click Attack to begin.</p>';

    showNotification("Battle started!", "info");
}

// Update battle UI
function updateBattleUI() {
    if (!currentBattle.inProgress) {
        const characterId = characterSelect.value;
        if (!characterId) {
            playerCharacterDetails.innerHTML = '<p>Select a character to battle</p>';
            enemyDetails.innerHTML = '';
            return;
        }

        // Show selected character
        const selectedCharacter = userCharacters.find(char => char.id == characterId);
        if (!selectedCharacter) return;

        playerCharacterDetails.innerHTML = `
            <div class="character-avatar rarity-${selectedCharacter.rarity}">
                ${selectedCharacter.rarity}★
            </div>
            <div class="character-stats">
                <p>ATK: ${selectedCharacter.attack}</p>
                <p>DEF: ${selectedCharacter.defense}</p>
                <p>HP: ${selectedCharacter.hp}</p>
            </div>
        `;
        enemyDetails.innerHTML = '<p>Start battle to generate enemy</p>';

        // Reset HP displays
        playerCurrentHP.textContent = '0';
        playerMaxHP.textContent = '0';
        enemyCurrentHP.textContent = '0';
        enemyMaxHP.textContent = '0';
        playerHPBar.style.width = '0%';
        enemyHPBar.style.width = '0%';

        // Add warning about permanent character loss
        battleLog.innerHTML = '<p><strong>⚠️ WARNING:</strong> If your character is defeated in battle, they will be lost forever!</p>' +
            '<p>Select a character and start a new battle.</p>';

        return;
    }

    // Update player character details
    const player = currentBattle.playerCharacter;
    playerCharacterDetails.innerHTML = `
        <div class="character-avatar rarity-${player.rarity}">
            ${player.rarity}★
        </div>
        <div class="character-stats">
            <p>ATK: ${player.attack}</p>
            <p>DEF: ${player.defense}</p>
        </div>
    `;

    // Update enemy details
    const enemy = currentBattle.enemy;
    enemyDetails.innerHTML = `
        <div class="character-avatar enemy rarity-${enemy.rarity}">
            ${enemy.rarity}★
        </div>
        <div class="character-stats">
            <p>ATK: ${enemy.attack}</p>
            <p>DEF: ${enemy.defense}</p>
        </div>
    `;

    // Update HP displays
    playerCurrentHP.textContent = currentBattle.playerCurrentHP;
    playerMaxHP.textContent = player.hp;
    enemyCurrentHP.textContent = currentBattle.enemyCurrentHP;
    enemyMaxHP.textContent = enemy.hp;

    // Update HP bars
    const playerHPPercent = Math.max(0, (currentBattle.playerCurrentHP / player.hp) * 100);
    const enemyHPPercent = Math.max(0, (currentBattle.enemyCurrentHP / enemy.hp) * 100);
    playerHPBar.style.width = `${playerHPPercent}%`;
    enemyHPBar.style.width = `${enemyHPPercent}%`;
}

// Player attack function
async function playerAttack() {
    if (!currentBattle.inProgress) return;

    // Calculate damage with randomness
    const baseDamage = currentBattle.playerCharacter.attack;
    const damageVariation = 0.3; // ±30% damage variation
    const randomFactor = 0.7 + Math.random() * 0.6; // Between 0.7 and 1.3

    // Calculate final damage
    let damage = Math.floor(baseDamage * randomFactor);

    // Apply enemy defense (reduces damage)
    damage = Math.max(1, damage - Math.floor(currentBattle.enemy.defense / 2));

    // Apply damage to enemy
    currentBattle.enemyCurrentHP = Math.max(0, currentBattle.enemyCurrentHP - damage);

    // Update battle log
    battleLog.innerHTML += `<p>Your character attacks for ${damage} damage!</p>`;

    // Update UI
    updateBattleUI();

    // Check if enemy is defeated
    if (currentBattle.enemyCurrentHP <= 0) {
        await endBattleWithVictory();
        return;
    }

    // Enemy's turn
    await enemyAttack();
}

// Enemy attack function
async function enemyAttack() {
    if (!currentBattle.inProgress) return;

    // Add slight delay for better battle flow
    await new Promise(resolve => setTimeout(resolve, 800));

    // Calculate damage with randomness
    const baseDamage = currentBattle.enemy.attack;
    const damageVariation = 0.3; // ±30% damage variation
    const randomFactor = 0.7 + Math.random() * 0.6; // Between 0.7 and 1.3

    // Calculate final damage
    let damage = Math.floor(baseDamage * randomFactor);

    // Apply player defense (reduces damage)
    damage = Math.max(1, damage - Math.floor(currentBattle.playerCharacter.defense / 2));

    // Apply damage to player
    currentBattle.playerCurrentHP = Math.max(0, currentBattle.playerCurrentHP - damage);

    // Update battle log
    battleLog.innerHTML += `<p>Enemy attacks for ${damage} damage!</p>`;
    battleLog.scrollTop = battleLog.scrollHeight; // Auto-scroll to bottom

    // Update UI
    updateBattleUI();

    // Check if player is defeated
    if (currentBattle.playerCurrentHP <= 0) {
        endBattleWithDefeat();
    }
}

// End battle with victory
async function endBattleWithVictory() {
    // Update battle state
    currentBattle.inProgress = false;

    // Update UI
    battleLog.innerHTML += `<p class="victory-message">Victory! You defeated the enemy!</p>`;
    attackButton.style.display = 'none';
    endBattleBtn.style.display = 'inline-block';
    battleLog.scrollTop = battleLog.scrollHeight;

    try {
        // Claim battle reward from contract
        const tx = await contract.claimBattleReward(currentBattle.playerCharacter.id);

        // Wait for transaction confirmation
        showNotification("Claiming battle reward...", "info");
        await tx.wait();

        // Update balance
        await updateBalance();

        showNotification("Battle reward claimed: 0.0001 ETH", "success");
    } catch (error) {
        console.error("Failed to claim battle reward:", error);
        showNotification("Failed to claim battle reward: " + (error.data?.message || error.message), "error");
    }
}

// End battle with defeat
async function endBattleWithDefeat() {
    // Update battle state
    currentBattle.inProgress = false;

    // Update UI
    battleLog.innerHTML += `<p class="defeat-message">Defeat! Your character was defeated and lost forever!</p>`;
    attackButton.style.display = 'none';
    endBattleBtn.style.display = 'inline-block';
    battleLog.scrollTop = battleLog.scrollHeight;

    try {
        // Remove character from contract
        const tx = await contract.removeDefeatedCharacter(currentBattle.playerCharacter.id);

        // Wait for transaction confirmation
        showNotification("Character being removed...", "info");
        await tx.wait();

        // Refresh character inventory
        await loadCharacters();

        showNotification("Your character was defeated and lost forever!", "error");
    } catch (error) {
        console.error("Failed to remove character:", error);
        showNotification("Failed to remove character: " + (error.data?.message || error.message), "error");
    }
}

// End battle and reset
function endBattle() {
    resetBattle();
    showNotification("Battle ended", "info");
}

// Reset battle state
function resetBattle() {
    currentBattle = {
        playerCharacter: null,
        enemy: null,
        playerCurrentHP: 0,
        enemyCurrentHP: 0,
        inProgress: false
    };

    // Reset UI
    battleLog.innerHTML = '<p>Select a character and start a new battle.</p>';
    attackButton.style.display = 'none';
    endBattleBtn.style.display = 'none';
    startBattleBtn.style.display = 'inline-block';

    // Update the battle UI
    updateBattleUI();
}

// Initialize battle event listeners
function initBattle() {
    startBattleBtn.addEventListener('click', startBattle);
    attackButton.addEventListener('click', playerAttack);
    endBattleBtn.addEventListener('click', endBattle);
    characterSelect.addEventListener('change', updateBattleUI);

    // Hide battle buttons initially
    attackButton.style.display = 'none';
    endBattleBtn.style.display = 'none';
}