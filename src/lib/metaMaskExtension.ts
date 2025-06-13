// Enhanced MetaMask integration for browser extension context
import { ethers } from 'ethers';

export interface MetaMaskInfo {
  isAvailable: boolean;
  isConnected: boolean;
  accounts: string[];
  chainId: string | null;
  networkVersion: string | null;
  isSepoliaNetwork: boolean;
  currentAccount: string | null;
}

export interface ConnectionResult {
  success: boolean;
  accounts?: string[];
  chainId?: string;
  error?: string;
  isSepoliaNetwork?: boolean;
}

export class MetaMaskExtensionManager {
  private static instance: MetaMaskExtensionManager;
  private currentAccounts: string[] = [];
  private currentChainId: string | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  static getInstance(): MetaMaskExtensionManager {
    if (!MetaMaskExtensionManager.instance) {
      MetaMaskExtensionManager.instance = new MetaMaskExtensionManager();
    }
    return MetaMaskExtensionManager.instance;
  }

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    if (this.isMetaMaskAvailable()) {
      // Listen for account changes
      window.ethereum!.on('accountsChanged', (accounts: string[]) => {
        console.log('MetaMask accounts changed:', accounts);
        this.currentAccounts = accounts;
        this.emit('accountsChanged', accounts);
        
        // If no accounts, user disconnected
        if (accounts.length === 0) {
          this.emit('disconnected', { reason: 'User disconnected' });
        }
      });

      // Listen for chain changes
      window.ethereum!.on('chainChanged', (chainId: string) => {
        console.log('MetaMask chain changed:', chainId);
        this.currentChainId = chainId;
        this.emit('chainChanged', chainId);
        
        // Check if switched to Sepolia
        const isSepoliaNetwork = chainId === '0xaa36a7';
        this.emit('networkChanged', { 
          chainId, 
          isSepoliaNetwork,
          networkName: this.getNetworkName(chainId)
        });
      });

      // Listen for connection
      window.ethereum!.on('connect', (connectInfo: any) => {
        console.log('MetaMask connected:', connectInfo);
        this.emit('connected', connectInfo);
      });

      // Listen for disconnection
      window.ethereum!.on('disconnect', (error: any) => {
        console.log('MetaMask disconnected:', error);
        this.currentAccounts = [];
        this.currentChainId = null;
        this.emit('disconnected', error);
      });
    }
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Check if MetaMask is available
  isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask === true;
  }

  // Get comprehensive MetaMask information
  async getMetaMaskInfo(): Promise<MetaMaskInfo> {
    if (!this.isMetaMaskAvailable()) {
      return {
        isAvailable: false,
        isConnected: false,
        accounts: [],
        chainId: null,
        networkVersion: null,
        isSepoliaNetwork: false,
        currentAccount: null
      };
    }

    try {
      const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum!.request({ method: 'eth_chainId' });
      const networkVersion = await window.ethereum!.request({ method: 'net_version' });

      this.currentAccounts = accounts;
      this.currentChainId = chainId;

      return {
        isAvailable: true,
        isConnected: accounts.length > 0,
        accounts: accounts,
        chainId: chainId,
        networkVersion: networkVersion,
        isSepoliaNetwork: chainId === '0xaa36a7',
        currentAccount: accounts.length > 0 ? accounts[0] : null
      };
    } catch (error) {
      console.error('Error getting MetaMask info:', error);
      return {
        isAvailable: true,
        isConnected: false,
        accounts: [],
        chainId: null,
        networkVersion: null,
        isSepoliaNetwork: false,
        currentAccount: null
      };
    }
  }

  // Connect to MetaMask
  async connectMetaMask(): Promise<ConnectionResult> {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use Paaskeeper.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum!.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts available. Please unlock MetaMask and try again.');
      }

      // Get chain info
      const chainId = await window.ethereum!.request({ method: 'eth_chainId' });
      
      this.currentAccounts = accounts;
      this.currentChainId = chainId;

      const isSepoliaNetwork = chainId === '0xaa36a7';

      return {
        success: true,
        accounts: accounts,
        chainId: chainId,
        isSepoliaNetwork: isSepoliaNetwork
      };
    } catch (error: any) {
      console.error('Failed to connect MetaMask:', error);
      
      // Handle specific MetaMask errors
      if (error.code === 4001) {
        throw new Error('User rejected the connection request.');
      } else if (error.code === -32002) {
        throw new Error('MetaMask is already processing a connection request. Please check MetaMask.');
      } else {
        throw new Error(`Failed to connect to MetaMask: ${error.message}`);
      }
    }
  }

  // Switch to Sepolia network
  async switchToSepoliaNetwork(): Promise<{ success: boolean; message: string }> {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask is not available');
    }

    const sepoliaChainId = '0xaa36a7';
    const sepoliaChainParams = {
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
    };

    try {
      // First try to switch to the network
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }]
      });

      this.currentChainId = sepoliaChainId;
      return { 
        success: true, 
        message: 'Successfully switched to Sepolia network' 
      };
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [sepoliaChainParams]
          });

          this.currentChainId = sepoliaChainId;
          return { 
            success: true, 
            message: 'Sepolia network added and activated successfully' 
          };
        } catch (addError: any) {
          throw new Error(`Failed to add Sepolia network: ${addError.message}`);
        }
      } else if (switchError.code === 4001) {
        throw new Error('User rejected the network switch request.');
      } else {
        throw new Error(`Failed to switch to Sepolia network: ${switchError.message}`);
      }
    }
  }

  // Sign message for authentication
  async signMessage(message: string, account?: string): Promise<string> {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask is not available');
    }

    const accountToUse = account || this.currentAccounts[0];
    if (!accountToUse) {
      throw new Error('No account available. Please connect MetaMask first.');
    }

    try {
      const signature = await window.ethereum!.request({
        method: 'personal_sign',
        params: [message, accountToUse]
      });

      return signature;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the signature request.');
      } else {
        throw new Error(`Failed to sign message: ${error.message}`);
      }
    }
  }

  // Get network name from chain ID
  getNetworkName(chainId: string): string {
    const networks: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai',
      '0xa4b1': 'Arbitrum One',
      '0xa': 'Optimism',
      '0x38': 'BSC Mainnet',
      '0x61': 'BSC Testnet'
    };

    return networks[chainId] || `Unknown Network (${chainId})`;
  }

  // Check if current network is Sepolia
  isCurrentNetworkSepolia(): boolean {
    return this.currentChainId === '0xaa36a7';
  }

  // Get current account
  getCurrentAccount(): string | null {
    return this.currentAccounts.length > 0 ? this.currentAccounts[0] : null;
  }

  // Get current chain ID
  getCurrentChainId(): string | null {
    return this.currentChainId;
  }

  // Create ethers provider
  createEthersProvider(): ethers.BrowserProvider | null {
    if (!this.isMetaMaskAvailable()) {
      return null;
    }
    return new ethers.BrowserProvider(window.ethereum!);
  }

  // Get ethers signer
  async getEthersSigner(): Promise<ethers.JsonRpcSigner | null> {
    const provider = this.createEthersProvider();
    if (!provider) {
      return null;
    }
    
    try {
      return await provider.getSigner();
    } catch (error) {
      console.error('Failed to get signer:', error);
      return null;
    }
  }

  // Extension-specific: Check if running in extension context
  isExtensionContext(): boolean {
    return typeof chrome !== 'undefined' && 
           chrome.runtime && 
           chrome.runtime.id;
  }

  // Extension-specific: Send message to background script
  sendExtensionMessage(message: any): Promise<any> {
    if (!this.isExtensionContext()) {
      console.warn('Not running in extension context');
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
      });
    });
  }

  // Clear cached data
  clearCache() {
    this.currentAccounts = [];
    this.currentChainId = null;
  }
}

// Export singleton instance
export const metaMaskManager = MetaMaskExtensionManager.getInstance();

// Export convenience functions
export const isMetaMaskAvailable = () => metaMaskManager.isMetaMaskAvailable();
export const getMetaMaskInfo = () => metaMaskManager.getMetaMaskInfo();
export const connectMetaMask = () => metaMaskManager.connectMetaMask();
export const switchToSepolia = () => metaMaskManager.switchToSepoliaNetwork();
export const signMessage = (message: string, account?: string) => metaMaskManager.signMessage(message, account); 