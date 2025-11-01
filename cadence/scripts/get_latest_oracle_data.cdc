import EarthquakeOracle from 0xEarthquakeOracle

pub fun main(): EarthquakeOracle.LatestData? {
    return EarthquakeOracle.getLatest()
}
