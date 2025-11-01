import EarthquakeOracle from 0xEarthquakeOracle

transaction(magnitude: UFix64, location: String, dataHash: String) {
    prepare(signer: AuthAccount) {
        EarthquakeOracle.updateData(
            magnitude: magnitude,
            location: location,
            dataHash: dataHash,
            signer: signer.address
        )
        log("Oracle updated")
    }
}
