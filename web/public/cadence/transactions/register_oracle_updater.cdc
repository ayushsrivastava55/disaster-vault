import EarthquakeOracle from 0xEarthquakeOracle

transaction(updater: Address) {
    prepare(signer: AuthAccount) {
        if signer.address != EarthquakeOracle.account.address {
            panic("Only the oracle contract account can set the updater")
        }
        EarthquakeOracle.registerUpdater(account: updater)
        log("Registered oracle updater")
    }
}
