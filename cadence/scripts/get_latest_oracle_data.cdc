import EarthquakeOracle from 0xcb6448da23dc7fa5

access(all) fun main(): EarthquakeOracle.LatestData? {
    return EarthquakeOracle.getLatest()
}
