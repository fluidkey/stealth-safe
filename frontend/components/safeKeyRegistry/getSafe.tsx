import { ethers } from "ethers";
import { EthersAdapter } from '@safe-global/protocol-kit'
import { EthAdapter } from '@safe-global/safe-core-sdk-types'
<<<<<<< HEAD
import {ABI, VIEW_KEY_SAFE_REGISTRY_ADDRESS} from "@/components/Const";
=======
import {SAFE_VIEW_KEY_REGISTRY_ABI, SAFE_VIEW_KEY_REGISTRY_ADDRESS} from "@/components/Const";
>>>>>>> 9a51b26f75f00ae4c641aefa1a5c0312f783b0b4

export async function getSafe(safeAddress: string) {

    const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm")
    const safeOwner = provider.getSigner(0)

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: safeOwner
      }) as unknown as EthAdapter
<<<<<<< HEAD
    
    const contractAddress = VIEW_KEY_SAFE_REGISTRY_ADDRESS
    const abi = ABI
   
=======

    const contractAddress = SAFE_VIEW_KEY_REGISTRY_ADDRESS
    const abi = SAFE_VIEW_KEY_REGISTRY_ABI

>>>>>>> 9a51b26f75f00ae4c641aefa1a5c0312f783b0b4
    const contract = new ethers.Contract(contractAddress, abi, provider)
    const safeInfo = await contract.stealthKeys(safeAddress)
    console.log(safeInfo)
    return safeInfo

}
