import DisasterVault from 0xDisasterVault

pub fun main(vaultId: UInt64): DisasterVault.VaultDetails {
    return DisasterVault.getVaultDetails(vaultId: vaultId)
}
