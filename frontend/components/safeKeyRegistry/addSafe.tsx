import { ethers, Signer } from "ethers";
import safeService from "../safe/safeEthersAdapter";
import Safe from "@safe-global/protocol-kit";
import { ProposeTransactionProps } from "@safe-global/api-kit"
import { EthersAdapter } from '@safe-global/protocol-kit'
import { EthAdapter } from '@safe-global/safe-core-sdk-types'
import {SAFE_VIEW_KEY_REGISTRY_ABI, SAFE_VIEW_KEY_REGISTRY_ADDRESS} from "@/components/Const";

export async function addSafe(safeAddress: string, senderAddress: string, viewingPubKeyPrefix: number, viewingPubKey: string, safeViewPrivateKeyList: string[][], signer: Signer) {

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer
      }) as unknown as EthAdapter

    const contractAddress = SAFE_VIEW_KEY_REGISTRY_ADDRESS;
    const abi = SAFE_VIEW_KEY_REGISTRY_ABI;
    const iface = new ethers.utils.Interface(abi)
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

