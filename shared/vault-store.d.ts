export type DonationRecord = {
  sourceId: string
  magnitude: number
  amount: number
  location: string
  timestamp: string
}

export type StoredVault = {
  id: number
  balance: number
  threshold: number
  maxDonation: number
  recipient: string
  createdAt: string
  scheduled: boolean
  donations: DonationRecord[]
}

export type CreateVaultParams = {
  threshold: number
  maxDonation: number
  depositAmount: number
  recipient: string
  scheduled?: boolean
}

export type AppendDonationParams = {
  sourceId: string
  magnitude: number
  amount: number
  location: string
  timestamp?: string
}

export type AppendDonationResult = {
  donation: DonationRecord | null
  vault: StoredVault
}

export function configureVaultStore(options?: { dataDir?: string | null }): void
export function createVaultRecord(params: CreateVaultParams): Promise<StoredVault>
export function listVaults(): Promise<StoredVault[]>
export function getLatestVault(): Promise<StoredVault | null>
export function appendDonation(vaultId: number, donation: AppendDonationParams): Promise<AppendDonationResult>
export function clearVaultStore(): Promise<void>
