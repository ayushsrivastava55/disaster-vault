import DisasterVault from 0xcb6448da23dc7fa5
import EarthquakeOracle from 0xcb6448da23dc7fa5

access(all) contract DisasterActions {
    access(all) struct CreateVaultAction {
        access(all) let threshold: UFix64
        access(all) let maxDonation: UFix64
        access(all) let recipient: Address

        init(threshold: UFix64, maxDonation: UFix64, recipient: Address) {
            self.threshold = threshold
            self.maxDonation = maxDonation
            self.recipient = recipient
        }

        access(all) fun run(owner: Address): UInt64 {
            return DisasterVault.createVault(owner: owner, threshold: self.threshold, maxDonation: self.maxDonation, recipient: self.recipient)
        }
    }

    access(all) struct MonitorDisastersAction {
        access(all) fun run(): {UInt64: Bool} {
            let results: {UInt64: Bool} = {}
            let oracleData = EarthquakeOracle.getLatest()
            if oracleData == nil {
                return results
            }

            let data = oracleData!
            let eligibleVaults = DisasterVault.getEligibleVaults(magnitude: data.magnitude)
            for vaultId in eligibleVaults {
                let didDonate = DisasterVault.triggerDonation(vaultId: vaultId, magnitude: data.magnitude)
                results[vaultId] = didDonate
            }
            return results
        }
    }

    access(all) struct AutoDonateAction {
        access(all) let vaultId: UInt64
        access(all) let magnitude: UFix64

        init(vaultId: UInt64, magnitude: UFix64) {
            self.vaultId = vaultId
            self.magnitude = magnitude
        }

        access(all) fun run(): Bool {
            return DisasterVault.triggerDonation(vaultId: self.vaultId, magnitude: self.magnitude)
        }
    }
}
