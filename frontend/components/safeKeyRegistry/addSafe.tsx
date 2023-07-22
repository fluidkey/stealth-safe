import { ethers, Signer } from "ethers";
import safeService from "../safe/safeEthersAdapter";
import Safe from "@safe-global/protocol-kit";
import { ProposeTransactionProps } from "@safe-global/api-kit"
import { EthersAdapter } from '@safe-global/protocol-kit'
import { EthAdapter } from '@safe-global/safe-core-sdk-types'

export async function addSafe(safeAddress: string, senderAddress: string, viewingPubKeyPrefix: string, viewingPubKey: string, safeViewPrivateKeyList: string[], signer: Signer) {

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer
      }) as unknown as EthAdapter
    
    const contractAddress = "0xB83e67627F5710446D3D88D2387c483400312670"
    const abi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"registrant","type":"address"},{"indexed":false,"internalType":"uint256","name":"viewingPubKeyPrefix","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"viewingPubKey","type":"uint256"},{"indexed":false,"internalType":"address[]","name":"owners","type":"address[]"}],"name":"StealthSafeKeyChanged","type":"event"},{"inputs":[{"internalType":"uint256","name":"_viewingPubKeyPrefix","type":"uint256"},{"internalType":"uint256","name":"_viewingPubKey","type":"uint256"},{"components":[{"internalType":"bytes","name":"encKey","type":"bytes"},{"internalType":"address","name":"owner","type":"address"}],"internalType":"struct StealthKeyRegistry.EncryptedSafeViewPrivateKey[]","name":"_safeViewPrivateKeyList","type":"tuple[]"}],"name":"setStealthKeys","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_registrant","type":"address"}],"name":"stealthKeys","outputs":[{"internalType":"uint256","name":"viewingPubKeyPrefix","type":"uint256"},{"internalType":"uint256","name":"viewingPubKey","type":"uint256"},{"components":[{"internalType":"bytes","name":"encKey","type":"bytes"},{"internalType":"address","name":"owner","type":"address"}],"internalType":"struct StealthKeyRegistry.EncryptedSafeViewPrivateKey[]","name":"safeViewPrivateKeyList","type":"tuple[]"}],"stateMutability":"view","type":"function"}]
    const iface = new ethers.utils.Interface(abi)
    console.log(safeViewPrivateKeyList)
    const calldata = iface.encodeFunctionData("setStealthKeys", [viewingPubKeyPrefix, viewingPubKey, safeViewPrivateKeyList]);

    //needs to now generate a safe tx and let the initiating owner sign
    const safeSdk = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safeAddress })

    const txData = {
        to: contractAddress,
        value: "0",
        data: calldata,
    } as Safe.TransactionData

    const safeTx = await safeSdk.createTransaction({ safeTransactionData: txData })
    const safeTxHash = await safeSdk.getTransactionHash(safeTx)
    const signature = await safeSdk.signTypedData(safeTx)

    const transactionConfig = {
        safeAddress: safeAddress,
        safeTransactionData: safeTx.data,
        safeTxHash: safeTxHash,
        senderAddress: senderAddress,
        senderSignature: signature.data,
        origin: "Stealth Safe",
    } as unknown as ProposeTransactionProps

    const propose = await safeService.proposeTransaction(transactionConfig)

    return propose

}

export async function executeTx(safeTransaction: any, signer: Signer, safeAddress: string) {

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer
      }) as unknown as EthAdapter
    console.log(safeTransaction)
    const safeSdk = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safeAddress })
    const execute = await safeSdk.executeTransaction(safeTransaction)
    const receipt = await execute.transactionResponse?.wait()
    return receipt
}

