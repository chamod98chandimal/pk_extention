// Content script for MetaMask detection and interaction
console.log('Paaskeeper content script loaded');

// MetaMask detection and interaction functions
class MetaMaskHandler {
  constructor() {
    this.isMetaMaskAvailable = false;
    this.accounts = [];
    this.chainId = null;
    this.init();
  }

  async init() {
    // Wait for page to load and check for MetaMask
    await this.waitForMetaMask();
    this.setupEventListeners();
  }

  async waitForMetaMask(maxAttempts = 10) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      if (window.ethereum && window.ethereum.isMetaMask) {
        this.isMetaMaskAvailable = true;
        console.log('MetaMask detected');
        
        try {
          // Get current accounts and chain info
          this.accounts = await window.ethereum.request({ method: 'eth_accounts' });
          this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
          console.log('MetaMask status:', { 
            accounts: this.accounts, 
            chainId: this.chainId 
          });
        } catch (error) {
          console.log('MetaMask detected but not connected yet');
        }
        
        return true;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('MetaMask not found after', maxAttempts, 'attempts');
    return false;
  }

  setupEventListeners() {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        this.accounts = accounts;
        console.log('Accounts changed:', accounts);
        this.notifyExtension('accounts_changed', { accounts });
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        this.chainId = chainId;
        console.log('Chain changed:', chainId);
        this.notifyExtension('chain_changed', { chainId });
      });

      // Listen for connection
      window.ethereum.on('connect', (connectInfo) => {
        console.log('MetaMask connected:', connectInfo);
        this.notifyExtension('metamask_connected', connectInfo);
      });

      // Listen for disconnection
      window.ethereum.on('disconnect', (error) => {
        console.log('MetaMask disconnected:', error);
        this.notifyExtension('metamask_disconnected', { error });
      });
    }
  }

  async connectMetaMask() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      this.accounts = accounts;
      this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      console.log('MetaMask connected successfully:', { 
        accounts: this.accounts, 
        chainId: this.chainId 
      });
      
      return {
        success: true,
        accounts: this.accounts,
        chainId: this.chainId
      };
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      throw error;
    }
  }

  async switchToSepoliaNetwork() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const sepoliaChainId = '0xaa36a7'; // Sepolia testnet chain ID

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      });
      
      console.log('Switched to Sepolia network');
      return { success: true };
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: sepoliaChainId,
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/']
              }
            ]
          });
          
          console.log('Sepolia network added and switched');
          return { success: true };
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          throw addError;
        }
      } else {
        console.error('Failed to switch to Sepolia network:', switchError);
        throw switchError;
      }
    }
  }

  getStatus() {
    return {
      isAvailable: this.isMetaMaskAvailable,
      isConnected: this.accounts.length > 0,
      accounts: this.accounts,
      chainId: this.chainId,
      currentAccount: this.accounts[0] || null
    };
  }

  notifyExtension(event, data) {
    // Send message to background script about MetaMask events
    chrome.runtime.sendMessage({
      type: 'METAMASK_EVENT',
      event: event,
      data: data
    });
  }
}

// Initialize MetaMask handler
const metaMaskHandler = new MetaMaskHandler();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);

  switch (request.type) {
    case 'CHECK_METAMASK':
      sendResponse(metaMaskHandler.getStatus());
      break;
      
    case 'CONNECT_METAMASK':
      metaMaskHandler.connectMetaMask()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for async response
      
    case 'SWITCH_TO_SEPOLIA':
      metaMaskHandler.switchToSepoliaNetwork()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'GET_METAMASK_STATUS':
      sendResponse(metaMaskHandler.getStatus());
      break;
      
    default:
      console.log('Unknown message type:', request.type);
  }
});

// Inject script to access window.ethereum in the page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script); 