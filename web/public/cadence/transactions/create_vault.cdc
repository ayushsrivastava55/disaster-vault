import DisasterVault from 0xDisasterVault

transaction(threshold: UFix64, maxDonation: UFix64, recipient: Address) {
    prepare(signer: AuthAccount) {
        let vaultId = DisasterVault.createVault(
            owner: signer.address,
            threshold: threshold,
            maxDonation: maxDonation,
            recipient: recipient
        )
        log("Created vault")
        log(vaultId)
    }
}
