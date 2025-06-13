# Paaskeeper Browser Extension

Paaskeeper is now available as a browser extension! This extension provides seamless MetaMask integration and quick access to your decentralized password manager.

## 🚀 Features

- **MetaMask Detection & Connection**: Automatically detects and connects to MetaMask
- **Network Management**: Automatic Sepolia testnet switching
- **Quick Actions**: Fast access to vault, add passwords, and settings
- **Real-time Status**: Live MetaMask connection and network status
- **Secure Integration**: Direct integration with your existing Paaskeeper web application

## 📋 Prerequisites

Before installing the extension, make sure you have:

1. **MetaMask Browser Extension** installed
2. **Paaskeeper Web App** running (development or production)
3. **Chrome/Edge Browser** (Manifest V3 compatible)

## 🛠️ Installation Instructions

### For Development

1. **Build the Extension Files**
   ```bash
   # Make sure you're in the project root directory
   npm run build  # This builds your Next.js app
   ```

2. **Prepare Extension Directory**
   The following files should be in your project root:
   - `manifest.json`
   - `background.js`
   - `content.js`
   - `injected.js`
   - `popup.html`
   - `popup.js`
   - `icons/` directory (add icon files here)

3. **Create Extension Icons**
   Create icon files in the `icons/` directory:
   - `icon16.png` (16x16 px)
   - `icon32.png` (32x32 px)
   - `icon48.png` (48x48 px)
   - `icon128.png` (128x128 px)

4. **Load Extension in Browser**
   - Open Chrome/Edge
   - Go to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select your project root directory

### For Production

1. **Update URLs in popup.js**
   ```javascript
   // Change this line in popup.js:
   const baseUrl = 'https://your-production-domain.com'; // Your production URL
   ```

2. **Create Extension Package**
   ```bash
   # Zip the extension files
   zip -r paaskeeper-extension.zip manifest.json background.js content.js injected.js popup.html popup.js icons/
   ```

3. **Submit to Chrome Web Store** (Optional)
   - Follow Chrome Web Store developer guidelines
   - Upload the extension package

## 🎯 Usage Guide

### First-Time Setup

1. **Install the Extension**
   - Follow installation instructions above

2. **Open Extension Popup**
   - Click the Paaskeeper icon in browser toolbar
   - Extension will automatically check for MetaMask

3. **Connect MetaMask**
   - Click "🦊 Connect MetaMask" button
   - Approve connection in MetaMask popup
   - Extension will detect current network

4. **Switch to Sepolia Network** (if needed)
   - Click "🔄 Switch to Sepolia" button
   - Approve network switch in MetaMask
   - Extension will confirm Sepolia connection

### Daily Usage

Once connected, the extension provides quick actions:

- **🏦 Open Vault**: Access your password vault
- **➕ Add Password**: Quick add new password entry
- **⚙️ Settings**: Open application settings
- **❓ Help**: Access FAQ and help documentation

## 🔧 Configuration

### Development Configuration

The extension is configured to work with your local development server:

```javascript
// In popup.js
const baseUrl = 'http://localhost:3000';
```

### Production Configuration

Update the base URL for production:

```javascript
// In popup.js
const baseUrl = 'https://your-domain.com';
```

### Manifest Permissions

The extension requests these permissions:

- `activeTab`: Access current tab for MetaMask detection
- `storage`: Store extension preferences
- `scripting`: Inject MetaMask integration scripts
- `unlimitedStorage`: Store large amounts of encrypted data

## 🔒 Security Features

### MetaMask Integration Security

- **No Private Key Access**: Extension never accesses private keys
- **User-Controlled**: All actions require user approval in MetaMask
- **Network Verification**: Ensures connection to Sepolia testnet
- **Signature Validation**: All authentication uses MetaMask signatures

### Extension Security

- **Content Security Policy**: Strict CSP prevents XSS attacks
- **Isolated Execution**: Scripts run in isolated contexts
- **Minimal Permissions**: Only requests necessary permissions
- **Secure Communication**: All messages between scripts are validated

## 🐛 Troubleshooting

### Common Issues

**Extension doesn't detect MetaMask**
- Ensure MetaMask is installed and unlocked
- Refresh the page and try again
- Check browser console for errors

**Can't connect to MetaMask**
- Make sure MetaMask is unlocked
- Try disconnecting and reconnecting in MetaMask settings
- Clear browser cache and try again

**Wrong network displayed**
- Manually switch to Sepolia in MetaMask
- Use the "Switch to Sepolia" button in extension
- Check MetaMask network settings

**Quick actions don't work**
- Ensure your Paaskeeper web app is running
- Check the base URL in `popup.js`
- Verify network connectivity

### Debug Mode

Enable debug logging:

1. Open browser developer tools
2. Go to Extensions tab
3. Click "Inspect views: popup" under Paaskeeper
4. Check console for detailed logs

### Reset Extension

To reset the extension completely:

1. Go to `chrome://extensions/`
2. Find Paaskeeper extension
3. Click "Remove"
4. Clear browser data for extension
5. Reinstall extension

## 🔄 Updates

### Updating the Extension

For development:
1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click "Reload" button under Paaskeeper

For production:
1. Update extension files
2. Increment version in `manifest.json`
3. Create new extension package
4. Submit update to Chrome Web Store

### Compatibility

- **Browsers**: Chrome 88+, Edge 88+
- **MetaMask**: Version 10.0+
- **Networks**: Ethereum Mainnet, Sepolia Testnet
- **Next.js**: Version 14+ (for web app)

## 📞 Support

If you encounter issues with the extension:

1. Check this troubleshooting guide
2. Review browser console errors
3. Verify MetaMask configuration
4. Test with web application directly
5. Report issues with detailed logs

## 🔮 Future Features

Planned enhancements:

- **Auto-fill Integration**: Automatic form detection and filling
- **Biometric Authentication**: Enhanced security options
- **Multi-network Support**: Additional blockchain networks
- **Offline Mode**: Local storage fallback
- **Password Health**: Security analysis and recommendations

---

**Note**: This extension is currently in beta. Please report any issues and use with caution on mainnet. 