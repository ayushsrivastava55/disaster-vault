import DisasterVault from 0xDisasterVault
import EarthquakeOracle from 0xEarthquakeOracle

pub contract DisasterActions {
    pub struct CreateVaultAction {
        pub let threshold: UFix64
        pub let maxDonation: UFix64
        pub let recipient: Address

        init(threshold: UFix64, maxDonation: UFix64, recipient: Address) {
            self.threshold = threshold
            self.maxDonation = maxDonation
            self.recipient = recipient
        }

        pub fun execute(owner: Address): UInt64 {
            return DisasterVault.createVault(owner: owner, threshold: self.threshold, maxDonation: self.maxDonation, recipient: self.recipient)
        }
    }

    pub struct MonitorDisastersAction {
        pub fun execute(): {UInt64: Bool} {
            let results: {UInt64: Bool} = {}
            let oracleData = EarthquakeOracle.getLatest()
            if oracleData == nil {
                return results
            }

            let data = oracleData!
            for vaultId in EarthquakeOracle.getEligibleVaults(magnitude: data.magnitude) {
                let didDonate = DisasterVault.triggerDonation(vaultId: vaultId, magnitude: data.magnitude)
                results[vaultId] = didDonate
            }
            return results
        }
    }

    pub struct AutoDonateAction {
        pub let vaultId: UInt64
        pub let magnitude: UFix64

        init(vaultId: UInt64, magnitude: UFix64) {
            self.vaultId = vaultId
            self.magnitude = magnitude
        }

        pub fun execute(): Bool {
            return DisasterVault.triggerDonation(vaultId: self.vaultId, magnitude: self.magnitude)
        }
    }
}
