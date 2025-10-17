## Project Overview

This is a Cardano NFT Marketplace built with Next.js 15, React 19, and Mesh SDK. It enables users to mint NFTs, list them for sale, buy, update listings, and withdraw NFTs from the marketplace using Plutus V3 smart contracts on the Cardano blockchain.

## Development Commands

```bash
# Start development server on http://localhost:3000
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code with Prettier
npm run format
```

## Environment Setup

Copy `env.example` to `.env` and configure:

- `BLOCKFROST_PROJECT_ID`: Your Blockfrost API project ID (first 7 chars determine network: `preview`, `preprod`, or `mainnet`)
- `NEXT_PUBLIC_APP_NETWORK`: Network name for explorer links (`preview`, `preprod`, or `mainnet`)

## Architecture

### Smart Contract Integration

The marketplace is built around a Plutus V3 smart contract (defined in `src/contract/plutus.json`). The contract logic is abstracted through two layers:

1. **MeshAdapter** (`src/contract/mesh.ts`): Base class providing core blockchain interaction utilities

   - Initializes MeshTxBuilder with Blockfrost provider
   - Compiles and parameterizes the marketplace Plutus script
   - Derives the marketplace script address
   - Provides helper methods: `getWalletForTx()`, `readPlutusData()`, `getAddressUTXOAsset()`

2. **MarketplaceContract** (`src/contract/index.ts`): Extends MeshAdapter with marketplace-specific operations
   - `sell()`: Creates transaction to list NFT with inline datum containing seller address, price, and asset info
   - `buy()`: Spends marketplace UTXO, sends ADA to seller, sends NFT to buyer
   - `withdraw()`: Returns NFT to seller (cancel listing)
   - `update()`: Updates listing price by consuming old UTXO and creating new one with updated datum

All contract methods:

- Build unsigned transactions using MeshTxBuilder
- Use inline datums (V3 feature) for marketplace state
- Require collateral UTXOs for script execution
- Return unsigned transaction CBOR strings for client-side signing

### Wallet Management

State management uses Zustand store in `src/hooks/use-wallet.ts`:

- Connects to browser wallet extensions (Nami, Eternl, Lace, etc.) via Mesh SDK
- Stores: `browserWallet` (BrowserWallet instance), `walletName`, `address`
- Methods: `connect()`, `disconnect()`, `signTx()`, `submitTx()`
- Custom hook replaces previous `@meshsdk/react` dependency

### Transaction Flow Pattern

All marketplace transactions follow this pattern:

1. **API Route Handler** (`src/app/api/tx/{action}/route.ts`):

   - Validates request (wallet address, asset, price, etc.)
   - Creates MeshWallet with address-only key (for UTXO queries, not signing)
   - Instantiates MarketplaceContract with wallet and blockfrost provider
   - Calls contract method to build unsigned transaction
   - Returns unsigned transaction CBOR to client

2. **Client Component** (e.g., `src/components/app/buy-button.tsx`):
   - Fetches unsigned transaction from API route
   - Uses `useWallet` hook to get connected browser wallet
   - Signs transaction with `wallet.signTx(unsignedTx)`
   - Submits signed transaction with `wallet.submitTx(signedTx)`
   - Handles success/error states and UI feedback

This pattern separates transaction building (server-side) from signing (client-side with user's wallet).

### Data Fetching

- **Blockfrost Integration**: Singleton BlockfrostProvider in `src/lib/blockfrost.ts`

  - Used for querying blockchain data (UTXOs, assets, metadata)
  - Network determined from `BLOCKFROST_PROJECT_ID` prefix
  - Singleton pattern prevents multiple instances in development

- **API Routes**: Next.js API routes in `src/app/api/`

  - `/api/listed-nfts`: Fetches all NFTs listed in marketplace contract address
  - `/api/specific-asset`: Gets details for a single asset by hex identifier
  - `/api/profile`: Gets user's owned NFTs
  - `/api/tx/*`: Transaction building endpoints (sell, buy, withdraw, update)

- **Client-Side**: Uses SWR for data fetching with automatic revalidation

### NFT Minting

The minting flow (`src/app/mint/page.tsx`) is self-contained:

- Generates random metadata from predefined IPFS CIDs (`src/app/mint/ipfs.ts`)
- Creates native script with `ForgeScript.withOneSignature()`
- Builds transaction with CIP-25 metadata (label 721) using MeshTxBuilder
- Signs and submits directly via connected wallet (no API route needed)
- Transaction includes minting policy, token output, and metadata

### Component Structure

```
src/components/
├── app/              # Feature-specific components (buy/sell/update/withdraw buttons, NFT card)
├── common/           # Shared features (cardano-wallet integration UI)
├── layout/           # Layout components (header)
└── ui/               # shadcn/ui components (button, card, dialog, etc.)
```

### Type Definitions

Core types in `src/types/index.d.ts`:

- `NFT`: Base type with unit, seller, price
- `NFTExtended`: NFT with additional metadata fields

## Key Technical Notes

- **Network Configuration**: The Blockfrost project ID prefix determines the network. Ensure `NEXT_PUBLIC_APP_NETWORK` matches the Blockfrost network.

- **Webpack Configuration**: `next.config.ts` enables `asyncWebAssembly` and externalizes Mesh SDK packages for proper WebAssembly support.

- **Path Aliases**: Use `@/*` to import from `src/` directory (configured in `tsconfig.json`).

- **Plutus Data Handling**: The `readPlutusData()` method in MeshAdapter deserializes inline datums to extract seller, price, and unit. The datum structure matches the Plutus script's expected format.

- **Collateral Requirements**: All Plutus V3 transactions require collateral UTXOs. The `getWalletForTx()` method ensures collateral is available before building transactions.

- **Asset Identification**: NFTs are tracked by unit (concatenated policyId + assetName in hex). This is used across all API routes and contract methods.

## Common Patterns

When working with transactions:

1. Always validate wallet connection before transaction operations
2. Handle errors from both transaction building (API) and signing/submission (client)
3. Provide user feedback during async operations (loading states, success/error messages)
4. Use `useWallet` hook methods (`signTx`, `submitTx`) instead of directly accessing browserWallet

When adding new marketplace operations:

1. Add contract method to MarketplaceContract class
2. Create API route handler following existing patterns
3. Create UI component with client-side signing flow
4. Handle transaction status and provide tx hash for explorer links
