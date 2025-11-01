import DisasterVault from 0xcb6448da23dc7fa5

access(all) fun main(vaultId: UInt64): DisasterVault.VaultDetails {
    return DisasterVault.getVaultDetails(vaultId: vaultId)
}
