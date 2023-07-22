import { ethers } from "ethers";
import { EthersAdapter } from '@safe-global/protocol-kit'
import { EthAdapter } from '@safe-global/safe-core-sdk-types'
import {ABI, VIEW_KEY_SAFE_REGISTRY_ADDRESS} from "@/components/Const";

export async function getSafe(safeAddress: string) {

    const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm")
    const safeOwner = provider.getSigner(0)

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: safeOwner
      }) as unknown as EthAdapter
    
    const contractAddress = VIEW_KEY_SAFE_REGISTRY_ADDRESS
    const abi = ABI
   
    const contract = new ethers.Contract(contractAddress, abi, provider)
    const safeInfo = await contract.stealthKeys(safeAddress)
    console.log(safeInfo)
    return safeInfo

}
