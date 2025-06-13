// Background service worker for Paaskeeper extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Paaskeeper extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_METAMASK_STATUS') {
    // Forward request to content script to check MetaMask
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'CHECK_METAMASK'}, (response) => {
          sendResponse(response);
        });
      }
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.type === 'CONNECT_METAMASK') {
    // Forward MetaMask connection request
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'CONNECT_METAMASK'}, (response) => {
          sendResponse(response);
        });
      }
    });
    return true;
  }
  
  if (request.type === 'OPEN_PAASKEEPER') {
    // Open the main Paaskeeper interface
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup or perform default action
  console.log('Extension icon clicked');
}); 