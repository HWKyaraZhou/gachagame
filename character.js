// Global character variables
let userCharacters = [];

// DOM Elements for characters
const characterCards = document.getElementById('character-cards');
const refreshInventoryBtn = document.getElementById('refresh-inventory');
const pullButton = document.getElementById('pull-button');
const pullAnimation = document.getElementById('pull-animation');
const gachaResult = document.getElementById('gacha-result');
const pulledRarity = document.getElementById('pulled-rarity');
const pulledId = document.getElementById('pulled-id');
const pulledCharacterDetails = document.getElementById('pulled-character-details');
const characterSelect = document.getElementById('character-select');

// Load characters from the contract
async function loadCharacters() {
    try {
        if (!contract || !userAddress) {
            characterCards.innerHTML = '<p>Connect your wallet to view characters.</p>';
            return;
        }
        
        // Get character IDs from contract
        const characterIds = await contract.getCharacters();
        
        // Clear previous data
        userCharacters = [];
        characterCards.innerHTML = '';
        characterSelect.innerHTML = '<option value="">-- Select a character to battle --</option>';
        
        // If no characters, show message
        if (characterIds.length === 0) {
            characterCards.innerHTML = '<p>No characters found. Pull some to start playing!</p>';
            return;
        }
        
        // Fetch each character's details
        for (let i = 0; i < characterIds.length; i++) {
            const id = characterIds[i].toNumber();
            const characterDetails = await contract.getCharacter(id);
            
            const character = {
                id: characterDetails[0].toNumber(),
                rarity: characterDetails[1],
                attack: characterDetails[2].toNumber(),
                defense: characterDetails[3].toNumber(),
                hp: characterDetails[4].toNumber()
            };
            
            userCharacters.push(character);
            
            // Create character card
            const card = createCharacterCard(character);
            characterCards.appendChild(card);
            
            // Add character to battle select
            const option = document.createElement('option');
            option.value = character.id;
            option.textContent = `${character.rarity}★ Character #${character.id} (ATK: ${character.attack}, HP: ${character.hp})`;
            characterSelect.appendChild(option);
        }
    } catch (error) {
        console.error("Failed to load characters:", error);
        showNotification("Failed to load characters", "error");
    }
}

// Create a character card element
function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.id = character.id;
    
    // Add rarity stars at the top
    const stars = '★'.repeat(character.rarity);
    
    card.innerHTML = `
        <div class="card-header">
            <span class="character-rarity">${stars}</span>
            <span class="character-id">#${character.id}</span>
        </div>
        <div class="card-body">
            <div class="character-avatar rarity-${character.rarity}">
                ${character.rarity}★
            </div>
            <div class="character-stats">
                <p>ATK: ${character.attack}</p>
                <p>DEF: ${character.defense}</p>
                <p>HP: ${character.hp}</p>
            </div>
        </div>
    `;
    
    return card;
}

// Gacha pull function
async function pullCharacter() {
    if (!contract || !userAddress) {
        showNotification("Please connect your wallet first", "error");
        return;
    }
    
    try {
        // Check if user has enough balance
        if (!await checkBalance("0.0001")) {
            showNotification("Insufficient balance for pull", "error");
            return;
        }
        
        // Show pull animation
        pullAnimation.style.display = 'block';
        gachaResult.style.display = 'none';
        
        // Call contract method
        const tx = await contract.pullCharacter({
            value: ethers.utils.parseEther("0.0001")
        });
        
        // Wait for transaction confirmation
        showNotification("Transaction submitted, waiting for confirmation...", "info");
        await tx.wait();
        
        // Get the latest character (should be the one we just pulled)
        await loadCharacters();
        const newCharacter = userCharacters[userCharacters.length - 1];
        
        // Hide animation and show result
        pullAnimation.style.display = 'none';
        gachaResult.style.display = 'block';
        
        // Update result display
        pulledRarity.textContent = newCharacter.rarity;
        pulledId.textContent = newCharacter.id;
        pulledCharacterDetails.innerHTML = `
            <div class="character-avatar rarity-${newCharacter.rarity}">
                ${newCharacter.rarity}★
            </div>
            <div class="character-stats">
                <p>ATK: ${newCharacter.attack}</p>
                <p>DEF: ${newCharacter.defense}</p>
                <p>HP: ${newCharacter.hp}</p>
            </div>
        `;
        
        // Update account balance
        await updateBalance();
        
        showNotification("Character pull successful!", "success");
    } catch (error) {
        pullAnimation.style.display = 'none';
        console.error("Failed to pull character:", error);
        showNotification("Failed to pull character: " + (error.data?.message || error.message), "error");
    }
}

// Initialize character events
function initCharacters() {
    refreshInventoryBtn.addEventListener('click', loadCharacters);
    pullButton.addEventListener('click', pullCharacter);
    
    // Hide gacha result initially
    gachaResult.style.display = 'none';
    pullAnimation.style.display = 'none';
}