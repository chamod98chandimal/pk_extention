// Injected script for deep MetaMask integration
(function() {
  'use strict';
  
  console.log('Paaskeeper injected script loaded');
  
  // Enhanced MetaMask detection and utilities
  window.PaaskeeperMetaMask = {
    // Check if MetaMask is available and active
    isAvailable: function() {
      return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    },
    
    // Get detailed MetaMask information
    getInfo: async function() {
      if (!this.isAvailable()) {
        return { available: false, error: 'MetaMask not installed' };
      }
      
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkVersion = await window.ethereum.request({ method: 'net_version' });
        
        return {
          available: true,
          connected: accounts.length > 0,
          accounts: accounts,
          chainId: chainId,
          networkVersion: networkVersion,
          isSepoliaNetwork: chainId === '0xaa36a7',
          provider: window.ethereum
        };
      } catch (error) {
        return { 
          available: true, 
          connected: false, 
          error: error.message 
        };
      }
    },
    
    // Enhanced connection with network verification
    connect: async function() {
      if (!this.isAvailable()) {
        throw new Error('MetaMask not installed. Please install MetaMask to use Paaskeeper.');
      }
      
      try {
        // Request accounts
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length === 0) {
          throw new Error('No accounts available. Please unlock MetaMask.');
        }
        
        // Check network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const isSepoliaNetwork = chainId === '0xaa36a7';
        
        return {
          success: true,
          accounts: accounts,
          chainId: chainId,
          isSepoliaNetwork: isSepoliaNetwork,
          message: isSepoliaNetwork ? 
            'Connected to MetaMask on Sepolia network' : 
            'Connected to MetaMask (consider switching to Sepolia for full functionality)'
        };
      } catch (error) {
        throw new Error(`Failed to connect to MetaMask: ${error.message}`);
      }
    },
    
    // Sign message for authentication
    signMessage: async function(message, account) {
      if (!this.isAvailable()) {
        throw new Error('MetaMask not available');
      }
      
      try {
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, account]
        });
        
        return {
          success: true,
          signature: signature,
          message: message,
          account: account
        };
      } catch (error) {
        throw new Error(`Failed to sign message: ${error.message}`);
      }
    },
    
    // Switch to Sepolia network
    switchToSepolia: async function() {
      if (!this.isAvailable()) {
        throw new Error('MetaMask not available');
      }
      
      const sepoliaChainId = '0xaa36a7';
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: sepoliaChainId }]
        });
        
        return { success: true, message: 'Switched to Sepolia network' };
      } catch (switchError) {
        if (switchError.code === 4902) {
          // Network not added, try to add it
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: sepoliaChainId,
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: [
                  'https://sepolia.infura.io/v3/',
                  'https://rpc.sepolia.org',
                  'https://ethereum-sepolia.blockpi.network/v1/rpc/public'
                ],
                blockExplorerUrls: ['https://sepolia.etherscan.io/']
              }]
            });
            
            return { success: true, message: 'Sepolia network added and activated' };
          } catch (addError) {
            throw new Error(`Failed to add Sepolia network: ${addError.message}`);
          }
        } else {
          throw new Error(`Failed to switch to Sepolia: ${switchError.message}`);
        }
      }
    },
    
    // Watch for account and network changes
    onAccountChange: function(callback) {
      if (this.isAvailable()) {
        window.ethereum.on('accountsChanged', callback);
      }
    },
    
    onChainChange: function(callback) {
      if (this.isAvailable()) {
        window.ethereum.on('chainChanged', callback);
      }
    },
    
    // Send transaction (for smart contract interactions)
    sendTransaction: async function(transactionObject) {
      if (!this.isAvailable()) {
        throw new Error('MetaMask not available');
      }
      
      try {
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionObject]
        });
        
        return {
          success: true,
          transactionHash: txHash
        };
      } catch (error) {
        throw new Error(`Transaction failed: ${error.message}`);
      }
    }
  };
  
  // Auto-detect MetaMask when script loads
  if (window.PaaskeeperMetaMask.isAvailable()) {
    console.log('MetaMask detected and Paaskeeper integration ready');
    
    // Notify content script about MetaMask availability
    window.postMessage({
      type: 'PAASKEEPER_METAMASK_READY',
      data: { available: true }
    }, '*');
  } else {
    console.log('MetaMask not detected');
    window.postMessage({
      type: 'PAASKEEPER_METAMASK_READY',
      data: { available: false }
    }, '*');
  }
  
  // Listen for MetaMask installation
  let checkCount = 0;
  const maxChecks = 20;
  const checkInterval = setInterval(() => {
    checkCount++;
    
    if (window.PaaskeeperMetaMask.isAvailable()) {
      console.log('MetaMask became available');
      window.postMessage({
        type: 'PAASKEEPER_METAMASK_READY',
        data: { available: true }
      }, '*');
      clearInterval(checkInterval);
    } else if (checkCount >= maxChecks) {
      console.log('MetaMask check timeout');
      clearInterval(checkInterval);
    }
  }, 1000);

})(); 