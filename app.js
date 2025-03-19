// Initialize the application
async function initApp() {
    // Initialize wallet
    await initWallet();
    
    // Initialize characters
    initCharacters();
    
    // Initialize battle
    initBattle();
    
    console.log("Gacha Game initialized");
}

// Start the app when the document is loaded
document.addEventListener('DOMContentLoaded', initApp);
