import DisasterVault from 0xDisasterVault

pub fun main(magnitude: UFix64): [UInt64] {
    return DisasterVault.getEligibleVaults(magnitude: magnitude)
}
