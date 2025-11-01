import DisasterVault from 0xcb6448da23dc7fa5

access(all) fun main(magnitude: UFix64): [UInt64] {
    return DisasterVault.getEligibleVaults(magnitude: magnitude)
}
