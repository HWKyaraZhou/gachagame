// Global wallet variables
let provider;
let signer;
let contract;
let userAddress;

// DOM Elements for wallet
const connectWalletBtn = document.getElementById('connect-wallet');
const walletStatus = document.getElementById('wallet-status');
const balanceDisplay = document.getElementById('balance');

// At the beginning of your wallet.js file
function checkEthersLoaded() {
    if (typeof ethers === 'undefined') {
        console.error("Ethers.js library not loaded!");
        showNotification("Failed to load Web3 library. Please refresh the page.", "error");
        return false;
    }
    return true;
}

// Connect wallet function
async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (!checkEthersLoaded()) return false;
        if (!window.ethereum) {
            showNotification("Please install MetaMask to play this game", "error");
            return false;
        }

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Get the provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);

        // Check if we're on Sepolia network (chainId 11155111)
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) {
            showNotification("Please connect to Sepolia testnet", "error");
            // Optionally, you can prompt the user to switch to Sepolia
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }], // Sepolia's chainId in hex
                });
                // If successful, reload the page or reconnect
                return await connectWallet();
            } catch (switchError) {
                // User rejected the request or the chain couldn't be switched
                return false;
            }
        }

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
    console.log("Initializing wallet...");
    const connectWalletBtn = document.getElementById('connect-wallet');
    if (!connectWalletBtn) {
        console.error("Connect wallet button not found in the DOM");
        return;
    }
    
    console.log("Adding event listener to connect button");
    connectWalletBtn.addEventListener('click', connectWallet);
    
    // Check if ethers is loaded
    if (typeof ethers === 'undefined') {
        console.error("Ethers library not loaded during initialization");
        showNotification("Web3 library not available. Please refresh the page", "error");
        return;
    }
    
    // Check if MetaMask is installed
    if (window.ethereum) {
        console.log("MetaMask is installed, checking for previous connection");
        // If user was previously connected, reconnect
        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            console.log("Previously connected accounts:", accounts);
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error("Failed to reconnect wallet:", error);
            showNotification("Failed to reconnect wallet", "error");
        }
    } else {
        console.log("MetaMask is not installed");
        showNotification("Please install MetaMask to play this game", "error");
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