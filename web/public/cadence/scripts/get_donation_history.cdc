import DisasterVault from 0xDisasterVault

pub fun main(vaultId: UInt64): [DisasterVault.DonationSnapshot] {
    return DisasterVault.getDonationHistory(vaultId: vaultId)
}
