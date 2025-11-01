import { NextRequest, NextResponse } from "next/server"
import { createVaultRecord, getLatestVault } from "../../../../shared/vault-store.js"
import { RED_CROSS_ADDRESS } from "../../../lib/constants"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    const record = await createVaultRecord({
      threshold: payload.threshold,
      maxDonation: payload.maxDonation,
      depositAmount: payload.depositAmount,
      recipient: RED_CROSS_ADDRESS,
      scheduled: payload.transactionId ? true : false
    })

    return NextResponse.json({
      vaultId: record.id,
      scheduled: record.scheduled,
      transactionId: payload.transactionId || undefined
    })
  } catch (error) {
    console.error("Error creating vault:", error)
    return NextResponse.json(
      { error: "Failed to create vault" },
      { status: 500 }
    )
  }
}

