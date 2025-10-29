pub contract EarthquakeOracle {
    pub event DataUpdated(magnitude: UFix64, location: String, timestamp: UFix64)

    pub struct LatestData {
        pub let magnitude: UFix64
        pub let location: String
        pub let timestamp: UFix64
        pub let dataHash: String

        init(magnitude: UFix64, location: String, timestamp: UFix64, dataHash: String) {
            self.magnitude = magnitude
            self.location = location
            self.timestamp = timestamp
            self.dataHash = dataHash
        }
    }

    pub resource interface Updater {
        pub fun updateData(magnitude: UFix64, location: String, dataHash: String)
    }

    pub resource OracleUpdater: Updater {
        pub fun updateData(magnitude: UFix64, location: String, dataHash: String) {
            EarthquakeOracle.latest = LatestData(
                magnitude: magnitude,
                location: location,
                timestamp: getCurrentBlock().timestamp,
                dataHash: dataHash
            )
            emit DataUpdated(magnitude: magnitude, location: location, timestamp: getCurrentBlock().timestamp)
        }
    }

    access(self) var authorizedUpdater: Address?
    pub var latest: LatestData?

    pub fun setAuthorizedUpdater(account: Address) {
        pre {
            self.authorizedUpdater == nil || self.authorizedUpdater == account: "Updater already set"
        }
        self.authorizedUpdater = account
    }

    pub fun createUpdater(): @OracleUpdater {
        pre {
            self.authorizedUpdater == nil || self.authorizedUpdater == self.account.address: "Only contract account can create updater"
        }
        return <- create OracleUpdater()
    }

    pub fun getLatest(): LatestData? {
        return self.latest
    }

    pub fun getEligibleVaults(magnitude: UFix64): [UInt64] {
        // Placeholder helper so actions can iterate over vault ids.
        // In a production deployment, this would reference state stored elsewhere.
        return []
    }

    init() {
        self.latest = nil
        self.authorizedUpdater = nil
    }
}
