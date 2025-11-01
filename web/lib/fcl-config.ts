import * as fcl from "@onflow/fcl"

// Configure FCL for Flow Testnet
// Can be overridden via environment variables
const ACCESS_NODE = process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "https://access-testnet.onflow.org"
const DISCOVERY_WALLET = process.env.NEXT_PUBLIC_FLOW_DISCOVERY_WALLET || "https://fcl-discovery.onflow.org/testnet/authn"
const NETWORK = process.env.NEXT_PUBLIC_FLOW_NETWORK || "testnet"

// Contract addresses - will be replaced during deployment
const DISASTER_VAULT_CONTRACT = process.env.NEXT_PUBLIC_DISASTER_VAULT_ADDRESS || "0xf8d6e0586b0a20c7"
const EARTHQUAKE_ORACLE_CONTRACT = process.env.NEXT_PUBLIC_EARTHQUAKE_ORACLE_ADDRESS || "0xf8d6e0586b0a20c7"
const DISASTER_ACTIONS_CONTRACT = process.env.NEXT_PUBLIC_DISASTER_ACTIONS_ADDRESS || "0xf8d6e0586b0a20c7"

export function initializeFCL() {
  fcl.config({
    "accessNode.api": ACCESS_NODE,
    "discovery.wallet": DISCOVERY_WALLET,
    "discovery.wallet.method": "POP/RPC",
    "app.detail.title": "DisasterVault",
    "app.detail.icon": "https://disastervault.app/icon.png",
    "0xDisasterVault": DISASTER_VAULT_CONTRACT,
    "0xEarthquakeOracle": EARTHQUAKE_ORACLE_CONTRACT,
    "0xDisasterActions": DISASTER_ACTIONS_CONTRACT,
  })
}

export { fcl, DISASTER_VAULT_CONTRACT, EARTHQUAKE_ORACLE_CONTRACT, DISASTER_ACTIONS_CONTRACT, NETWORK }

