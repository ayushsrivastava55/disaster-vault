access(all) contract EarthquakeOracle {
    access(all) event DataUpdated(magnitude: UFix64, location: String, timestamp: UFix64)

    access(all) struct LatestData {
        access(all) let magnitude: UFix64
        access(all) let location: String
        access(all) let timestamp: UFix64
        access(all) let dataHash: String

        init(magnitude: UFix64, location: String, timestamp: UFix64, dataHash: String) {
            self.magnitude = magnitude
            self.location = location
            self.timestamp = timestamp
            self.dataHash = dataHash
        }
    }

    access(self) var authorizedUpdater: Address?
    access(all) var latest: LatestData?

    access(all) fun registerUpdater(account: Address) {
        pre {
            self.authorizedUpdater == nil || self.authorizedUpdater == account: "Updater already registered"
        };
        self.authorizedUpdater = account
    }

    access(all) fun updateData(magnitude: UFix64, location: String, dataHash: String, signer: Address) {
        pre {
            self.authorizedUpdater != nil: "No updater registered"
            self.authorizedUpdater == signer: "Unauthorized updater"
        };

        let timestamp = getCurrentBlock().timestamp
        self.latest = LatestData(
            magnitude: magnitude,
            location: location,
            timestamp: timestamp,
            dataHash: dataHash
        )
        emit DataUpdated(magnitude: magnitude, location: location, timestamp: timestamp)
    }

    access(all) fun getLatest(): LatestData? {
        return self.latest
    }

    init() {
        self.latest = nil
        self.authorizedUpdater = nil
    }
}
