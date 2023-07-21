import SafeApiKit from '@safe-global/api-kit'
import ethAdapter from './safeEthersAdapter'

async function getSafeAddress(userAddress: string) {

    const safeService = new SafeApiKit({
        txServiceUrl: "https://safe-transaction-gnosis-chain.safe.global/",
        ethAdapter 
    })

    const safes = await safeService.getSafesByOwner(userAddress)

    return safes
}

export default getSafeAddress
