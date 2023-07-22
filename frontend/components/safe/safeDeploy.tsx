import { SafeFactory, EthersAdapter } from "@safe-global/protocol-kit";
import { Signer, ethers } from "ethers";
import { EthAdapter } from "@safe-global/safe-core-sdk-types";

export async function createSafe(owners: string[], threshold: number, signer: Signer) {

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer
      }) as unknown as EthAdapter
    
    const safeFactory = await SafeFactory.create({ ethAdapter })
    const safeAccountConfig = {
        owners: owners,
        threshold: threshold
    }
    const safeSdk = await safeFactory.deploySafe({safeAccountConfig})
    const safeAddress = await safeSdk.getAddress()

    return safeAddress
}