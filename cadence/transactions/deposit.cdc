import DisasterVault from 0xDisasterVault

transaction(vaultId: UInt64, amount: UFix64) {
    prepare(signer: AuthAccount) {
        DisasterVault.deposit(vaultId: vaultId, amount: amount)
        log("Deposited into vault")
        log(vaultId)
        log(amount)
    }
}
