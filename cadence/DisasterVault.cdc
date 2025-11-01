access(all) contract DisasterVault {
    access(all) event VaultCreated(owner: Address, threshold: UFix64)
    access(all) event DonationExecuted(amount: UFix64, magnitude: UFix64, recipient: Address)

    access(all) struct VaultDetails {
        access(all) let id: UInt64
        access(all) let owner: Address
        access(all) let balance: UFix64
        access(all) let magnitudeThreshold: UFix64
        access(all) let maxDonation: UFix64
        access(all) let recipient: Address
        access(all) let isActive: Bool

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

    access(all) struct DonationSnapshot {
        access(all) let amount: UFix64
        access(all) let magnitude: UFix64
        access(all) let recipient: Address
        access(all) let timestamp: UFix64

        init(amount: UFix64, magnitude: UFix64, recipient: Address, timestamp: UFix64) {
            self.amount = amount
            self.magnitude = magnitude
            self.recipient = recipient
            self.timestamp = timestamp
        }
    }

    access(all) resource Vault {
        access(all) let id: UInt64
        access(all) var balance: UFix64
        access(all) var magnitudeThreshold: UFix64
        access(all) var maxDonation: UFix64
        access(all) var recipient: Address
        access(all) var isActive: Bool

        init(id: UInt64, threshold: UFix64, maxDonation: UFix64, recipient: Address) {
            self.id = id
            self.magnitudeThreshold = threshold
            self.maxDonation = maxDonation
            self.recipient = recipient
            self.balance = 0.0
            self.isActive = true
        }

        access(all) fun deposit(amount: UFix64) {
            pre {
                amount > 0.0: "Deposit amount must be positive"
            };
            self.balance = self.balance + amount
        }

        access(all) fun autoDonate(earthquakeMag: UFix64): Bool {
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

        access(all) fun deactivate() {
            self.isActive = false
        }
    }

    access(self) var nextVaultId: UInt64
    access(self) var vaults: @{UInt64: Vault}
    access(self) var vaultOwners: {UInt64: Address}
    access(self) var donationHistory: {UInt64: [DonationSnapshot]}

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

    access(all) fun createVault(owner: Address, threshold: UFix64, maxDonation: UFix64, recipient: Address): UInt64 {
        let id = self.nextVaultId
        self.nextVaultId = self.nextVaultId + 1

        let newVault <- create Vault(id: id, threshold: threshold, maxDonation: maxDonation, recipient: recipient)
        self.vaults[id] <-! newVault
        self.vaultOwners[id] = owner
        emit VaultCreated(owner: owner, threshold: threshold)
        return id
    }

    access(all) fun deposit(vaultId: UInt64, amount: UFix64) {
        let vaultRef = (&self.vaults[vaultId] as &Vault?)!
        vaultRef.deposit(amount: amount)
    }

    access(all) fun triggerDonation(vaultId: UInt64, magnitude: UFix64): Bool {
        let vaultRef = (&self.vaults[vaultId] as &Vault?)!
        return vaultRef.autoDonate(earthquakeMag: magnitude)
    }

    access(all) fun getVaultDetails(vaultId: UInt64): VaultDetails {
        let vaultRef = (&self.vaults[vaultId] as &Vault?)!
        let owner = self.vaultOwners[vaultId] ?? panic("Vault owner not found")
        return VaultDetails(
            id: vaultRef.id,
            owner: owner,
            balance: vaultRef.balance,
            magnitudeThreshold: vaultRef.magnitudeThreshold,
            maxDonation: vaultRef.maxDonation,
            recipient: vaultRef.recipient,
            isActive: vaultRef.isActive
        )
    }

    access(all) fun getDonationHistory(vaultId: UInt64): [DonationSnapshot] {
        return self.donationHistory[vaultId] ?? []
    }

    access(all) fun getEligibleVaults(magnitude: UFix64): [UInt64] {
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
        self.vaultOwners = {}
        self.donationHistory = {}
    }
}
