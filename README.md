# Starknet Lightning Privacy Mixer

<p align="center">
  <img src="https://img.shields.io/badge/Starknet-Testnet-blue" alt="Starknet Testnet">
  <img src="https://img.shields.io/badge/Next.js-15.5.4-black" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18.3.1-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

A revolutionary privacy-enhancing service for Starknet users that combines Lightning Network speed with Cashu e-cash anonymity to provide maximum transaction privacy.

## 🌟 Features

- **🔒 Maximum Privacy**: Uses Lightning Network and Cashu e-cash to break on-chain links
- **⚡ Lightning Fast**: Complete mixing in 5-10 minutes
- **🛡️ Trustless Design**: Built on smart contracts, no custodial risks
- **🔄 Multi-Token Support**: ETH, USDC, USDT, and major Starknet tokens
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🧪 Testnet Ready**: Safe testing environment with no real funds required

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Starknet wallet (Argent, Braavos, or similar)
- Testnet tokens for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lawrencezcl/starknet-lightning-mixer.git
   cd starknet-lightning-mixer
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Local: http://localhost:3003
   - Network: http://0.0.0.0:3003

### Using the Mixer

1. **Connect Wallet**: Connect your Starknet wallet to the application
2. **Choose Amount**: Select the amount you want to mix (0.01 - 10 ETH equivalent)
3. **Configure Privacy**: Set your privacy preferences (optional)
4. **Deposit**: Deposit tokens into the smart contract
5. **Wait for Mixing**: Lightning Network processes the privacy transformation
6. **Withdraw**: Receive mixed tokens to your desired address

## 🏗️ Architecture

### Core Components

- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Backend**: Express.js + Node.js
- **Blockchain**: Starknet smart contracts
- **Privacy Layer**: Lightning Network + Cashu e-cash
- **UI**: Tailwind CSS + Radix UI components

### Key Modules

- `src/app/`: Next.js app router pages
- `src/components/`: Reusable React components
- `src/hooks/`: Custom React hooks for state management
- `src/store/`: Zustand state management
- `src/lib/`: Utility functions and configurations
- `server/`: Backend API and services

## 📁 Project Structure

```
starknet-lightning-mixer/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── mix/               # Privacy mixing interface
│   │   ├── about/             # About page
│   │   ├── history/           # Transaction history
│   │   ├── wallet/            # Wallet settings
│   │   ├── faq/               # FAQ page
│   │   ├── fees/              # Fee information
│   │   ├── privacy/           # Privacy policy
│   │   ├── terms/             # Terms of service
│   │   └── support/           # Support center
│   ├── components/            # React components
│   │   ├── common/            # Shared components
│   │   ├── layout/            # Layout components
│   │   ├── mixer/             # Mixer-specific components
│   │   └── ui/                # UI components
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # State management
│   ├── lib/                   # Utilities and configs
│   └── types/                 # TypeScript definitions
├── server/                    # Backend application
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── models/                # Database models
│   └── utils/                 # Server utilities
├── docs/                      # Documentation
└── tests/                     # Test files
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Starknet Configuration
NEXT_PUBLIC_STARKNET_NETWORK=testnet
NEXT_PUBLIC_STARKNET_RPC_URL=https://testnet.starknet.io

# Lightning Network Configuration
LIGHTNING_API_URL=https://api.lightning.network
LIGHTNING_API_KEY=your_lightning_api_key

# Cashu Configuration
CASHU_MINT_URL=https://mint.cashu.space

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

### Docker

1. **Build Docker image**
   ```bash
   docker build -t starknet-lightning-mixer .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 starknet-lightning-mixer
   ```

### Manual Deployment

1. **Build application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔐 Security

### Smart Contract Security

- ✅ Multi-signature security controls
- ✅ Time-locked withdrawals
- ✅ Emergency pause mechanisms
- ✅ Regular security audits
- ✅ Transparent on-chain operations

### Privacy Protection

- ✅ No personal data collection
- ✅ Cryptographic unlinkability
- ✅ Configurable privacy levels
- ✅ User-controlled settings
- ✅ Zero-knowledge proofs

### Best Practices

- Never share your private keys
- Use testnet for initial testing
- Start with small amounts
- Verify transaction details carefully
- Keep your wallet software updated

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Architecture Overview](./docs/architecture.md)
- [Security Guidelines](./docs/security.md)
- [User Guides](./docs/guides/)
- [Troubleshooting](./docs/troubleshooting.md)

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run UI tests
npm run test:ui
```

### Test Structure

- `src/lib/__tests__/`: Unit tests for utilities
- `src/store/__tests__/`: State management tests
- `tests/`: Integration and e2e tests

## 📊 Status

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-85%25-green)
![Version](https://img.shields.io/badge/Version-0.1.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌍 Live Demo

- **Production**: https://starknet-lightning-mixer.vercel.app
- **Testnet**: Currently running on Starknet testnet
- **GitHub**: https://github.com/lawrencezcl/starknet-lightning-mixer

## ⚠️ Disclaimer

This is a testnet version for demonstration purposes only. Do not use real funds. The mixer is currently in beta testing phase. Please use at your own risk.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- 📧 Email: support@starknetlightning.mixer
- 💬 Discord: [Join our community](https://discord.gg/starknetlightning)
- 🐦 Twitter: [@StarknetLightning](https://twitter.com/starknetlightning)
- 📖 Documentation: [docs.starknetlightning.mixer](https://docs.starknetlightning.mixer)

## 🙏 Acknowledgments

- [Starknet](https://starknet.io/) - For the blockchain infrastructure
- [Lightning Network](https://lightning.network/) - For fast off-chain transactions
- [Cashu](https://github.com/cashubtc/cashu-ts) - For e-cash technology
- [Next.js](https://nextjs.org/) - For the frontend framework
- [Vercel](https://vercel.com/) - For hosting services

---

**Made with ❤️ by the Starknet Lightning Mixer Team**