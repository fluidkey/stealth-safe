import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'
import { EthAdapter } from '@safe-global/safe-core-sdk-types'
import SafeApiKit from '@safe-global/api-kit'

const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm")
const safeOwner = provider.getSigner(0)

const ethAdapter = new EthersAdapter({
  ethers,
  signerOrProvider: safeOwner
}) as unknown as EthAdapter

const safeService = new SafeApiKit({
  txServiceUrl: "https://safe-transaction-gnosis-chain.safe.global/",
  ethAdapter 
})

export default safeService