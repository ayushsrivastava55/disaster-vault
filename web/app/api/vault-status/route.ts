import { NextResponse } from "next/server"
import { getLatestVault } from "../../../../shared/vault-store.js"

export async function GET() {
  try {
    const record = await getLatestVault()
    if (!record) {
      return NextResponse.json(null)
    }
    
    return NextResponse.json({
      vaultId: record.id,
      balance: record.balance,
      threshold: record.threshold,
      maxDonation: record.maxDonation,
      recipient: record.recipient,
      donations: record.donations
    })
  } catch (error) {
    console.error("Error fetching vault status:", error)
    return NextResponse.json(
      { error: "Failed to fetch vault status" },
      { status: 500 }
    )
  }
}

