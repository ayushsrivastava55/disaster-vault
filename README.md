# DisasterVault 🚨

Prototype implementation of the Forte Hacks 2025 concept: an automated Flow vault that reacts to USGS earthquake data, verifies events with GPT-4, and routes donations to the Red Cross via scheduled transactions.

This repository contains three deliverables:

- **Cadence contracts** implementing the vault, oracle, and Flow Actions glue code.
- **Next.js dashboard** for creating a vault and visualising recent events.
- **Node.js oracle worker** that polls the USGS feed, performs a lightweight AI severity check, and prepares on-chain updates.

> ⚠️ Everything here targets Flow **testnet** and focuses on demonstrating architecture during a 48-hour sprint. The UI and oracle consume live USGS earthquake data and persist only the vaults you create locally. Wire up the Flow contracts before deploying to a shared environment.

---

## Project layout

```
.
├── cadence/                     # Cadence smart contracts
│   ├── DisasterVault.cdc        # Vault resource that stores deposits and executes donations
│   ├── EarthquakeOracle.cdc     # Mutable oracle storage updated by the off-chain worker
│   └── DisasterActions.cdc      # Flow Actions wrappers for create / monitor / donate flows
├── shared/                      # Node/Next shared utilities
│   └── vault-store.ts           # File-backed store tracking locally created vaults
├── data/                        # Generated at runtime (JSON store for the prototype)
│   └── .gitkeep
├── oracle/                      # Node.js oracle + AI worker
│   ├── package.json
│   ├── tsconfig.json
│   └── src/index.ts             # Polls USGS, calls GPT-4, (todo) pushes updates on-chain
├── web/                         # Next.js 14 application (App Router + Tailwind)
│   ├── app/
│   │   ├── page.tsx             # Landing page with vault creation CTA
│   │   ├── create/page.tsx      # Dedicated create flow
│   │   └── dashboard/page.tsx   # Vault dashboard fetching live vault + USGS data
│   ├── components/              # Shared UI components
│   ├── lib/flow.ts              # Placeholder Flow helpers + USGS fetcher
│   └── styles/globals.css       # Tailwind base styles
└── README.md
```

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm, npm, or yarn (examples below use `pnpm`)
- Flow CLI for real blockchain testing (optional for the local demo)

### 1. Install dependencies

```bash
cd web
pnpm install

cd ../oracle
pnpm install
```

### 2. Run the Next.js dashboard

```bash
cd web
pnpm dev
```

The app listens on `http://localhost:3000` and renders live USGS earthquake data.
Creating a vault writes to `../data/vaults.json`, which powers the donation log shown on the dashboard with your own interactions.

### 3. Start the oracle worker

Create an `.env` file in `oracle/` with your OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

Then run:

```bash
cd oracle
pnpm start
```

The worker polls the USGS API every six hours (kick-started once on boot) and logs the payload that would be submitted to the on-chain oracle update transaction. Once Flow integration is wired up it should submit `EarthquakeOracle.updateData` and trigger the scheduled donation workflow end to end.

> 💡 Reset the local state at any time by deleting `data/vaults.json`.

---

## Flow integration roadmap

The contracts are intentionally lightweight to highlight the workflow described in the PRD.

1. **`DisasterVault.cdc`** exposes helper functions for creating vaults, depositing FLOW, and triggering donations when the oracle signals a qualifying earthquake.
2. **`EarthquakeOracle.cdc`** stores the latest verified earthquake magnitude/location and emits events for downstream actions.
3. **`DisasterActions.cdc`** sketches three Flow Actions (`CreateVaultAction`, `MonitorDisastersAction`, and `AutoDonateAction`) so the workflow can be automated via scheduled transactions.

To hook the UI and oracle into Flow:

- Replace the placeholder `createVault` / `getVaultStatus` functions in `web/lib/flow.ts` with FCL transactions and scripts.
- Expand `oracle/src/index.ts` to sign and submit `EarthquakeOracle.updateData` transactions (e.g., using the Flow CLI service account or a custodial key).
- Configure a scheduled transaction on Flow testnet that runs `MonitorDisastersAction` every six hours, calling into the vault contract to execute `autoDonate` when thresholds are met.

---

## Testing

Automated tests are not yet wired up. The cadence contracts were written to be compatible with the Flow emulator, and the UI can be exercised locally with `pnpm dev`.

Recommended next steps:

- Add Cadence unit tests with `flow test`.
- Integrate Playwright or Cypress smoke tests for the dashboard once FCL interactions are connected.

---

## License

MIT © 2024 DisasterVault team
