export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string;
      chainId?: string;
    };
  }

  // Chrome extension API types
  interface Chrome {
    runtime: {
      id: string;
      sendMessage: (message: any, responseCallback?: (response: any) => void) => void;
    };
  }

  const chrome: Chrome | undefined;
}
