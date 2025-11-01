pub contract DisasterVault {
    pub event VaultCreated(owner: Address, threshold: UFix64)
    pub event DonationExecuted(amount: UFix64, magnitude: UFix64, recipient: Address)

    pub struct VaultDetails {
        pub let id: UInt64
        pub let owner: Address
        pub let balance: UFix64
        pub let magnitudeThreshold: UFix64
        pub let maxDonation: UFix64
        pub let recipient: Address
        pub let isActive: Bool

        init(
            id: UInt64,
            owner: Address,
            balance: UFix64,
            magnitudeThreshold: UFix64,
            maxDonation: UFix64,
            recipient: Address,
            isActive: Bool
        ) {
            self.id = id
            self.owner = owner
            self.balance = balance
            self.magnitudeThreshold = magnitudeThreshold
            self.maxDonation = maxDonation
            self.recipient = recipient
            self.isActive = isActive
        }
    }

    pub struct DonationSnapshot {
        pub let amount: UFix64
        pub let magnitude: UFix64
        pub let recipient: Address
        pub let timestamp: UFix64

        init(amount: UFix64, magnitude: UFix64, recipient: Address, timestamp: UFix64) {
            self.amount = amount
            self.magnitude = magnitude
            self.recipient = recipient
            self.timestamp = timestamp
        }
    }

    pub resource Vault {
        pub let id: UInt64
        pub var balance: UFix64
        pub let owner: Address
        pub var magnitudeThreshold: UFix64
        pub var maxDonation: UFix64
        pub var recipient: Address
        pub var isActive: Bool

        init(id: UInt64, owner: Address, threshold: UFix64, maxDonation: UFix64, recipient: Address) {
            self.id = id
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
                let timestamp = getCurrentBlock().timestamp
                DisasterVault.recordDonation(
                    vaultId: self.id,
                    amount: self.maxDonation,
                    magnitude: earthquakeMag,
                    recipient: self.recipient,
                    timestamp: timestamp
                )
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
    access(self) var donationHistory: {UInt64: [DonationSnapshot]}

    pub fun borrowVault(vaultId: UInt64): &Vault {
        let ref = &self.vaults[vaultId] as &Vault?
        pre {
            ref != nil: "Vault not found"
        }
        return ref!
    }

    access(contract) fun recordDonation(
        vaultId: UInt64,
        amount: UFix64,
        magnitude: UFix64,
        recipient: Address,
        timestamp: UFix64
    ) {
        let snapshot = DonationSnapshot(
            amount: amount,
            magnitude: magnitude,
            recipient: recipient,
            timestamp: timestamp
        )

        var history = self.donationHistory[vaultId] ?? []
        history.append(snapshot)
        self.donationHistory[vaultId] = history
    }

    pub fun createVault(owner: Address, threshold: UFix64, maxDonation: UFix64, recipient: Address): UInt64 {
        let id = self.nextVaultId
        self.nextVaultId = self.nextVaultId + 1

        let newVault <- create Vault(id: id, owner: owner, threshold: threshold, maxDonation: maxDonation, recipient: recipient)
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

    pub fun getVaultDetails(vaultId: UInt64): VaultDetails {
        let vaultRef = self.borrowVault(vaultId: vaultId)
        return VaultDetails(
            id: vaultRef.id,
            owner: vaultRef.owner,
            balance: vaultRef.balance,
            magnitudeThreshold: vaultRef.magnitudeThreshold,
            maxDonation: vaultRef.maxDonation,
            recipient: vaultRef.recipient,
            isActive: vaultRef.isActive
        )
    }

    pub fun getDonationHistory(vaultId: UInt64): [DonationSnapshot] {
        return self.donationHistory[vaultId] ?? []
    }

    pub fun getEligibleVaults(magnitude: UFix64): [UInt64] {
        let ids = self.vaults.keys
        var eligible: [UInt64] = []
        for id in ids {
            let vaultRef = &self.vaults[id] as &Vault?
            if vaultRef == nil {
                continue
            }
            let vault = vaultRef!
            if !vault.isActive {
                continue
            }
            if magnitude >= vault.magnitudeThreshold && vault.balance >= vault.maxDonation {
                eligible.append(id)
            }
        }
        return eligible
    }

    init() {
        self.nextVaultId = 1
        self.vaults <- {}
        self.donationHistory = {}
    }

    destroy() {
        destroy self.vaults
    }
}
