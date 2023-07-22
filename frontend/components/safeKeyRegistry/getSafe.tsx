import { ethers } from "ethers";
import { EthersAdapter } from '@safe-global/protocol-kit'
import { EthAdapter } from '@safe-global/safe-core-sdk-types'

export async function getSafe(safeAddress: string) {

    const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm")
    const safeOwner = provider.getSigner(0)

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: safeOwner
      }) as unknown as EthAdapter
    
    const contractAddress = "0xB83e67627F5710446D3D88D2387c483400312670"
    const abi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"registrant","type":"address"},{"indexed":false,"internalType":"uint256","name":"viewingPubKeyPrefix","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"viewingPubKey","type":"uint256"},{"indexed":false,"internalType":"address[]","name":"owners","type":"address[]"}],"name":"StealthSafeKeyChanged","type":"event"},{"inputs":[{"internalType":"uint256","name":"_viewingPubKeyPrefix","type":"uint256"},{"internalType":"uint256","name":"_viewingPubKey","type":"uint256"},{"components":[{"internalType":"bytes","name":"encKey","type":"bytes"},{"internalType":"address","name":"owner","type":"address"}],"internalType":"struct StealthKeyRegistry.EncryptedSafeViewPrivateKey[]","name":"_safeViewPrivateKeyList","type":"tuple[]"}],"name":"setStealthKeys","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_registrant","type":"address"}],"name":"stealthKeys","outputs":[{"internalType":"uint256","name":"viewingPubKeyPrefix","type":"uint256"},{"internalType":"uint256","name":"viewingPubKey","type":"uint256"},{"components":[{"internalType":"bytes","name":"encKey","type":"bytes"},{"internalType":"address","name":"owner","type":"address"}],"internalType":"struct StealthKeyRegistry.EncryptedSafeViewPrivateKey[]","name":"safeViewPrivateKeyList","type":"tuple[]"}],"stateMutability":"view","type":"function"}]
   
    const contract = new ethers.Contract(contractAddress, abi, provider)
    const safeInfo = await contract.stealthKeys(safeAddress)
    console.log(safeInfo)
    return safeInfo

}
