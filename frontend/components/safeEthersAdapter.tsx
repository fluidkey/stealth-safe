import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'
import { EthAdapter } from '@safe-global/safe-core-sdk-types'

const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm")
const safeOwner = provider.getSigner(0)

const ethAdapter = new EthersAdapter({
  ethers,
  signerOrProvider: safeOwner
}) as unknown as EthAdapter

export default ethAdapter