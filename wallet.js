// Global wallet variables
let provider;
let signer;
let contract;
let userAddress;

// DOM Elements for wallet
const connectWalletBtn = document.getElementById('connect-wallet');
const walletStatus = document.getElementById('wallet-status');
const balanceDisplay = document.getElementById('balance');

// Connect wallet function
async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
            showNotification("Please install MetaMask to play this game", "error");
            return false;
        }
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get the provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Initialize the contract
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Update UI
        walletStatus.textContent = userAddress.substring(0, 6) + '...' + userAddress.substring(38);
        connectWalletBtn.textContent = 'Connected';
        
        // Load account data
        await updateBalance();
        
        // Setup network change and account change listeners
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        
        // Trigger character load
        await loadCharacters();
        
        return true;
    } catch (error) {
        console.error("Failed to connect wallet:", error);
        showNotification("Failed to connect wallet", "error");
        return false;
    }
}

// Handle chain change
function handleChainChanged() {
    window.location.reload();
}

// Handle account change
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected
        disconnectWallet();
    } else if (accounts[0] !== userAddress) {
        // User switched accounts
        userAddress = accounts[0];
        await updateBalance();
        await loadCharacters();
    }
}

// Disconnect wallet
function disconnectWallet() {
    userAddress = null;
    walletStatus.textContent = 'Not connected';
    connectWalletBtn.textContent = 'Connect Wallet';
    balanceDisplay.textContent = '0';
    characterCards.innerHTML = '<p>Connect your wallet to view characters.</p>';
    characterSelect.innerHTML = '<option value="">-- Select a character to battle --</option>';
    
    // Reset battle area
    resetBattle();
}

// Update account balance
async function updateBalance() {
    try {
        if (!provider || !userAddress) return;
        
        // Get account balance
        const balance = await provider.getBalance(userAddress);
        balanceDisplay.textContent = ethers.utils.formatEther(balance);
    } catch (error) {
        console.error("Failed to update balance:", error);
    }
}

// Check if user has enough balance for transaction
async function checkBalance(amount) {
    try {
        if (!provider || !userAddress) return false;
        
        const balance = await provider.getBalance(userAddress);
        return balance.gte(ethers.utils.parseEther(amount));
    } catch (error) {
        console.error("Failed to check balance:", error);
        return false;
    }
}

// Initialize wallet connection
async function initWallet() {
    connectWalletBtn.addEventListener('click', connectWallet);
    
    
    // Check if MetaMask is installed
    if (window.ethereum) {
        // If user was previously connected, reconnect
        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error("Failed to reconnect wallet:", error);
        }
    } else {
        console.log("Please install MetaMask to play this game");
    }
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}