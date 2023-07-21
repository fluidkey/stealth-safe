import safeService from './safeEthersAdapter'

export async function getSafesForOwner(userAddress: string) {
    const safes = await safeService.getSafesByOwner(userAddress)
    return safes
}

export async function getSafeInfo(safeAddress: string) {
    const safeInfo = await safeService.getSafeInfo(safeAddress)
    return safeInfo
}

