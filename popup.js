// Popup script for Paaskeeper extension
class PaaskeeperPopup {
  constructor() {
    this.isMetaMaskConnected = false;
    this.currentAccount = null;
    this.currentChainId = null;
    this.isSepoliaNetwork = false;
    
    this.init();
  }
  
  async init() {
    console.log('Initializing Paaskeeper popup');
    
    // Show loading initially
    this.showLoading(true);
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Check MetaMask status
    await this.checkMetaMaskStatus();
    
    // Hide loading and show main content
    this.showLoading(false);
    this.updateUI();
  }
  
  setupEventListeners() {
    // Connect MetaMask button
    document.getElementById('connectBtn').addEventListener('click', () => {
      this.connectMetaMask();
    });
    
    // Switch network button
    document.getElementById('switchNetworkBtn').addEventListener('click', () => {
      this.switchToSepolia();
    });
    
    // Quick action buttons
    document.getElementById('openVaultBtn').addEventListener('click', () => {
      this.openVault();
    });
    
    document.getElementById('addPasswordBtn').addEventListener('click', () => {
      this.addPassword();
    });
    
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettings();
    });
    
    document.getElementById('helpBtn').addEventListener('click', () => {
      this.openHelp();
    });
  }
  
  showLoading(show) {
    const loadingSection = document.getElementById('loadingSection');
    const mainContent = document.getElementById('mainContent');
    
    if (show) {
      loadingSection.style.display = 'block';
      mainContent.classList.add('hidden');
    } else {
      loadingSection.style.display = 'none';
      mainContent.classList.remove('hidden');
    }
  }
  
  showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Hide error after 5 seconds
    setTimeout(() => {
      errorMessage.classList.add('hidden');
    }, 5000);
  }
  
  async checkMetaMaskStatus() {
    try {
      // Send message to content script to check MetaMask
      const response = await this.sendMessageToTab({ type: 'CHECK_METAMASK' });
      
      if (response) {
        this.isMetaMaskConnected = response.isConnected;
        this.currentAccount = response.currentAccount;
        this.currentChainId = response.chainId;
        this.isSepoliaNetwork = response.chainId === '0xaa36a7';
        
        console.log('MetaMask status:', response);
      } else {
        console.log('No response from content script');
      }
    } catch (error) {
      console.error('Error checking MetaMask status:', error);
      this.showError('Failed to check MetaMask status. Please refresh the page.');
    }
  }
  
  async connectMetaMask() {
    try {
      document.getElementById('connectBtn').disabled = true;
      document.getElementById('connectBtn').textContent = 'Connecting...';
      
      const response = await this.sendMessageToTab({ type: 'CONNECT_METAMASK' });
      
      if (response && response.success) {
        this.isMetaMaskConnected = true;
        this.currentAccount = response.accounts[0];
        this.currentChainId = response.chainId;
        this.isSepoliaNetwork = response.chainId === '0xaa36a7';
        
        console.log('MetaMask connected:', response);
        this.updateUI();
      } else {
        throw new Error(response?.error || 'Failed to connect MetaMask');
      }
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
      this.showError(error.message || 'Failed to connect to MetaMask');
    } finally {
      document.getElementById('connectBtn').disabled = false;
      document.getElementById('connectBtn').textContent = '🦊 Connect MetaMask';
    }
  }
  
  async switchToSepolia() {
    try {
      document.getElementById('switchNetworkBtn').disabled = true;
      document.getElementById('switchNetworkBtn').textContent = 'Switching...';
      
      const response = await this.sendMessageToTab({ type: 'SWITCH_TO_SEPOLIA' });
      
      if (response && response.success) {
        this.currentChainId = '0xaa36a7';
        this.isSepoliaNetwork = true;
        
        console.log('Switched to Sepolia:', response);
        this.updateUI();
      } else {
        throw new Error(response?.error || 'Failed to switch network');
      }
    } catch (error) {
      console.error('Error switching to Sepolia:', error);
      this.showError(error.message || 'Failed to switch to Sepolia network');
    } finally {
      document.getElementById('switchNetworkBtn').disabled = false;
      document.getElementById('switchNetworkBtn').textContent = '🔄 Switch to Sepolia';
    }
  }
  
  updateUI() {
    // Update MetaMask status
    const metamaskStatus = document.getElementById('metamaskStatus');
    if (this.isMetaMaskConnected) {
      metamaskStatus.textContent = 'Connected';
      metamaskStatus.className = 'status-value status-connected';
    } else {
      metamaskStatus.textContent = 'Not Connected';
      metamaskStatus.className = 'status-value status-disconnected';
    }
    
    // Update network status
    const networkDot = document.getElementById('networkDot');
    const networkName = document.getElementById('networkName');
    
    if (this.isSepoliaNetwork) {
      networkDot.className = 'network-dot';
      networkName.textContent = 'Sepolia';
    } else if (this.currentChainId) {
      networkDot.className = 'network-dot wrong';
      networkName.textContent = this.getNetworkName(this.currentChainId);
    } else {
      networkDot.className = 'network-dot wrong';
      networkName.textContent = 'Unknown';
    }
    
    // Update account status
    const accountStatus = document.getElementById('accountStatus');
    if (this.currentAccount) {
      accountStatus.textContent = `${this.currentAccount.slice(0, 6)}...${this.currentAccount.slice(-4)}`;
      accountStatus.className = 'status-value account-display';
    } else {
      accountStatus.textContent = 'Not Connected';
      accountStatus.className = 'status-value status-disconnected account-display';
    }
    
    // Update button visibility
    const connectBtn = document.getElementById('connectBtn');
    const switchNetworkBtn = document.getElementById('switchNetworkBtn');
    const quickActions = document.getElementById('quickActions');
    
    if (this.isMetaMaskConnected) {
      connectBtn.style.display = 'none';
      
      if (!this.isSepoliaNetwork) {
        switchNetworkBtn.classList.remove('hidden');
        quickActions.classList.add('hidden');
      } else {
        switchNetworkBtn.classList.add('hidden');
        quickActions.classList.remove('hidden');
      }
    } else {
      connectBtn.style.display = 'block';
      switchNetworkBtn.classList.add('hidden');
      quickActions.classList.add('hidden');
    }
  }
  
  getNetworkName(chainId) {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten',
      '0x4': 'Rinkeby',
      '0x5': 'Goerli',
      '0xaa36a7': 'Sepolia',
      '0x89': 'Polygon',
      '0xa4b1': 'Arbitrum',
      '0xa': 'Optimism'
    };
    
    return networks[chainId] || 'Unknown Network';
  }
  
  async sendMessageToTab(message) {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            resolve(response);
          });
        } else {
          resolve(null);
        }
      });
    });
  }
  
  openVault() {
    this.openPaaskeeperPage('/vault/view');
  }
  
  addPassword() {
    this.openPaaskeeperPage('/vault/edit');
  }
  
  openSettings() {
    this.openPaaskeeperPage('/settings');
  }
  
  openHelp() {
    this.openPaaskeeperPage('/faq');
  }
  
  openPaaskeeperPage(path = '') {
    // For development, open localhost
    // For production, you might want to open a hosted version
    const baseUrl = 'http://localhost:3000'; // Change this to your production URL
    const fullUrl = baseUrl + path;
    
    chrome.tabs.create({ url: fullUrl }, (tab) => {
      // Close the popup after opening the page
      window.close();
    });
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PaaskeeperPopup();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Popup received message:', request);
  
  if (request.type === 'METAMASK_EVENT') {
    // Handle MetaMask events
    console.log('MetaMask event:', request.event, request.data);
    
    // You could update the UI here based on MetaMask events
    // For example, if accounts changed, update the account display
  }
}); 