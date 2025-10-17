# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cardano NFT Marketplace built with Next.js 15, React 19, and Mesh SDK. Enables users to mint NFTs, list them for sale, buy, update listings, and withdraw using Plutus V3 smart contracts on Cardano blockchain.

## Development Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Lint code with ESLint
npm run format       # Format with Prettier
```

## Environment Configuration

Copy `env.example` to `.env` and configure:
- `BLOCKFROST_PROJECT_ID`: Blockfrost API project ID (first 7 chars determine network: `preview`, `preprod`, or `mainnet`)
- `NEXT_PUBLIC_APP_NETWORK`: Network name for explorer links (must match Blockfrost network)

## Architecture

### Smart Contract Integration

Two-layer abstraction over Plutus V3 contract (`src/contract/plutus.json`):

1. **MeshAdapter** (`src/contract/mesh.ts`): Base blockchain interaction layer
   - Initializes MeshTxBuilder with Blockfrost provider
   - Compiles and parameterizes marketplace Plutus script
   - Derives marketplace script address
   - Helper methods: `getWalletForTx()`, `readPlutusData()`, `getAddressUTXOAsset()`

2. **MarketplaceContract** (`src/contract/index.ts`): Marketplace operations
   - `sell()`: List NFT with inline datum (seller address, price, asset info)
   - `buy()`: Spend marketplace UTXO, send ADA to seller, NFT to buyer
   - `withdraw()`: Return NFT to seller (cancel listing)
   - `update()`: Update listing price by consuming old UTXO, creating new one

All contract methods:
- Build unsigned transactions using MeshTxBuilder
- Use inline datums (V3 feature) for marketplace state
- Require collateral UTXOs for script execution
- Return unsigned transaction CBOR strings for client-side signing

### Transaction Flow Pattern

All marketplace transactions follow this pattern:

1. **API Route** (`src/app/api/tx/{action}/route.ts`):
   - Validates request (wallet address, asset, price)
   - Creates MeshWallet with address-only key (for UTXO queries, not signing)
   - Instantiates MarketplaceContract
   - Builds unsigned transaction
   - Returns unsigned transaction CBOR

2. **Client Component** (e.g., `src/components/app/buy-button.tsx`):
   - Fetches unsigned transaction from API route
   - Uses `useWallet` hook to get connected browser wallet
   - Signs transaction with `wallet.signTx(unsignedTx)`
   - Submits with `wallet.submitTx(signedTx)`
   - Handles success/error states and UI feedback

This separates transaction building (server-side) from signing (client-side with user's wallet).

### Wallet Management

Zustand store in `src/hooks/use-wallet.ts`:
- Connects to browser wallet extensions (Nami, Eternl, Lace, etc.) via Mesh SDK
- State: `browserWallet`, `walletName`, `address`
- Methods: `connect()`, `disconnect()`, `signTx()`, `submitTx()`
- Custom hook replaces previous `@meshsdk/react` dependency

### Data Fetching

- **BlockfrostProvider** (`src/lib/blockfrost.ts`): Singleton for blockchain queries (UTXOs, assets, metadata)
- **API Routes** (`src/app/api/`):
  - `/api/listed-nfts`: Fetch all NFTs listed in marketplace
  - `/api/specific-asset`: Get single asset details by hex identifier
  - `/api/profile`: Get user's owned NFTs
  - `/api/tx/*`: Transaction building endpoints
- **Client-Side**: SWR for data fetching with automatic revalidation

### NFT Minting

Self-contained flow in `src/app/mint/page.tsx`:
- Generates random metadata from predefined IPFS CIDs (`src/app/mint/ipfs.ts`)
- Creates native script with `ForgeScript.withOneSignature()`
- Builds transaction with CIP-25 metadata (label 721) using MeshTxBuilder
- Signs and submits directly via connected wallet (no API route needed)

### Component Structure

```
src/components/
├── app/              # Feature components (buy/sell/update/withdraw buttons, NFT card)
├── common/           # Shared features (cardano-wallet integration UI)
├── layout/           # Layout components (header)
└── ui/               # shadcn/ui components (button, card, dialog, etc.)
```

### Type Definitions

Core types in `src/types/index.d.ts`:
- `NFT`: Base type with assetHex, seller, price
- `NFTExtended`: NFT with additional metadata fields

## Key Technical Notes

- **Network Configuration**: Blockfrost project ID prefix determines network. Ensure `NEXT_PUBLIC_APP_NETWORK` matches.
- **Webpack**: `next.config.ts` enables `asyncWebAssembly` and externalizes Mesh SDK packages for WebAssembly support.
- **Path Aliases**: Use `@/*` to import from `src/` directory.
- **Plutus Data**: `readPlutusData()` deserializes inline datums to extract seller, price, assetHex.
- **Collateral**: All Plutus V3 transactions require collateral UTXOs. `getWalletForTx()` ensures collateral availability.
- **Asset Identification**: NFTs tracked by assetHex (concatenated policyId + assetName in hex).

## Common Patterns

**Working with transactions:**
- Always validate wallet connection before transaction operations
- Handle errors from both transaction building (API) and signing/submission (client)
- Provide user feedback during async operations (loading states, success/error messages)
- Use `useWallet` hook methods (`signTx`, `submitTx`) instead of directly accessing browserWallet

**Adding new marketplace operations:**
1. Add contract method to MarketplaceContract class
2. Create API route handler following existing patterns
3. Create UI component with client-side signing flow
4. Handle transaction status and provide tx hash for explorer links
