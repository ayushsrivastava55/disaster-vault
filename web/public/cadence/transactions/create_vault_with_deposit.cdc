import DisasterVault from 0xDisasterVault

transaction(threshold: UFix64, maxDonation: UFix64, recipient: Address, depositAmount: UFix64) {
    prepare(signer: AuthAccount) {
        // Create the vault
        let vaultId = DisasterVault.createVault(
            owner: signer.address,
            threshold: threshold,
            maxDonation: maxDonation,
            recipient: recipient
        )
        
        // Deposit initial funds if amount > 0
        if depositAmount > 0.0 {
            DisasterVault.deposit(vaultId: vaultId, amount: depositAmount)
        }
        
        log("Created vault with deposit")
        log(vaultId)
        log(depositAmount)
    }
}

