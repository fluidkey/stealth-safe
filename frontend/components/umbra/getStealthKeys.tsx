import { ethers } from "ethers"
import {StealthKeyRegistry} from "umbra/umbra-js/src";

const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm")
const registry = new StealthKeyRegistry(provider)

export async function getStealthKeys(address: string) {
    let ownerKeys
    try {
        ownerKeys = await registry.getStealthKeys(address)
    } catch (error) {
        return { error: true }
    }
    return ownerKeys
}
