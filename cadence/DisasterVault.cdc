pub contract DisasterVault {
    pub event VaultCreated(owner: Address, threshold: UFix64)
    pub event DonationExecuted(amount: UFix64, magnitude: UFix64, recipient: Address)

    pub resource Vault {
        pub var balance: UFix64
        pub let owner: Address
        pub var magnitudeThreshold: UFix64
        pub var maxDonation: UFix64
        pub var recipient: Address
        pub var isActive: Bool

        init(owner: Address, threshold: UFix64, maxDonation: UFix64, recipient: Address) {
            self.owner = owner
            self.magnitudeThreshold = threshold
            self.maxDonation = maxDonation
            self.recipient = recipient
            self.balance = 0.0
            self.isActive = true
        }

        pub fun deposit(amount: UFix64) {
            pre {
                amount > 0.0: "Deposit amount must be positive"
            }
            self.balance = self.balance + amount
        }

        pub fun autoDonate(earthquakeMag: UFix64): Bool {
            if !self.isActive {
                return false
            }

            if earthquakeMag >= self.magnitudeThreshold && self.balance >= self.maxDonation {
                self.balance = self.balance - self.maxDonation
                emit DonationExecuted(amount: self.maxDonation, magnitude: earthquakeMag, recipient: self.recipient)
                return true
            }

            return false
        }

        pub fun deactivate() {
            self.isActive = false
        }
    }

    access(self) var nextVaultId: UInt64
    access(self) var vaults: @{UInt64: Vault}

    pub fun borrowVault(vaultId: UInt64): &Vault {
        let ref = &self.vaults[vaultId] as &Vault?
        pre {
            ref != nil: "Vault not found"
        }
        return ref!
    }

    pub fun createVault(owner: Address, threshold: UFix64, maxDonation: UFix64, recipient: Address): UInt64 {
        let id = self.nextVaultId
        self.nextVaultId = self.nextVaultId + 1

        let newVault <- create Vault(owner: owner, threshold: threshold, maxDonation: maxDonation, recipient: recipient)
        self.vaults[id] <-! newVault
        emit VaultCreated(owner: owner, threshold: threshold)
        return id
    }

    pub fun deposit(vaultId: UInt64, amount: UFix64) {
        let vaultRef = self.borrowVault(vaultId: vaultId)
        vaultRef.deposit(amount: amount)
    }

    pub fun triggerDonation(vaultId: UInt64, magnitude: UFix64): Bool {
        let vaultRef = self.borrowVault(vaultId: vaultId)
        return vaultRef.autoDonate(earthquakeMag: magnitude)
    }

    init() {
        self.nextVaultId = 1
        self.vaults <- {}
    }

    destroy() {
        destroy self.vaults
    }
}
