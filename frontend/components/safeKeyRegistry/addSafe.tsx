import { ethers } from "ethers";
import safeService, { ethAdapter } from "../safe/safeEthersAdapter";
import Safe from "@safe-global/protocol-kit";

export async function addSafe(safeAddress: string, viewingPubKeyPrefix: string, viewingPubKey: string, safeViewPrivateKeyList: string[]) {
    
    const contractAddress = "0xE886b6440973DC5e4A403935Bb556BAa48878B7a"
    const abi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"registrant","type":"address"},{"indexed":false,"internalType":"uint256","name":"viewingPubKeyPrefix","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"viewingPubKey","type":"uint256"},{"indexed":false,"internalType":"address[]","name":"owners","type":"address[]"}],"name":"StealthSafeKeyChanged","type":"event"},{"inputs":[{"internalType":"uint256","name":"_viewingPubKeyPrefix","type":"uint256"},{"internalType":"uint256","name":"_viewingPubKey","type":"uint256"},{"components":[{"internalType":"bytes","name":"encKey","type":"bytes"},{"internalType":"address","name":"owner","type":"address"}],"internalType":"struct StealthKeyRegistry.EncryptedSafeViewPrivateKey[]","name":"_safeViewPrivateKeyList","type":"tuple[]"}],"name":"setStealthKeys","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_registrant","type":"address"}],"name":"stealthKeys","outputs":[{"internalType":"uint256","name":"viewingPubKeyPrefix","type":"uint256"},{"internalType":"uint256","name":"viewingPubKey","type":"uint256"},{"components":[{"internalType":"bytes","name":"encKey","type":"bytes"},{"internalType":"address","name":"owner","type":"address"}],"internalType":"struct StealthKeyRegistry.EncryptedSafeViewPrivateKey[]","name":"safeViewPrivateKeyList","type":"tuple[]"}],"stateMutability":"view","type":"function"}]
    const iface = new ethers.utils.Interface(abi)
    const calldata = iface.encodeFunctionData("setStealthKeys", [viewingPubKeyPrefix, viewingPubKey, safeViewPrivateKeyList]);

    //needs to now generate a safe tx and let the initiating owner sign
    const safeSdk = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safeAddress })
}

