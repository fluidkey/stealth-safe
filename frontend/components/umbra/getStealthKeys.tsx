import { StealthKeyRegistry } from "@umbracash/umbra-js"
import { ethers } from "ethers"

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