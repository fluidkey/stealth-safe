import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'

const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm")
const safeOwner = provider.getSigner(0)

const ethAdapter = new EthersAdapter({
  ethers,
  signerOrProvider: safeOwner
})