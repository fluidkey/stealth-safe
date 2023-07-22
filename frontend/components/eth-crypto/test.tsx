import EthCrypto from 'eth-crypto';
import { getPrivateKeys } from '@/components/umbra/umbraExtended'
import { Signer } from 'ethers'

export async function encryptPrivateViewKey(ownerPublicViewingKey: string, safePrivateViewingKey: string) {
    console.log(ownerPublicViewingKey)
    const encryptedPrivateViewKey = await EthCrypto.encryptWithPublicKey(
        ownerPublicViewingKey,
        safePrivateViewingKey
    )
    const compressedEncryptedPrivateViewKey = EthCrypto.cipher.stringify(encryptedPrivateViewKey)
    return compressedEncryptedPrivateViewKey
}

export async function decryptPrivateViewKey(ownerPrivateViewingKey: string, safeEncryptedPrivateViewingKey: string) {
    const formatted = safeEncryptedPrivateViewingKey.slice(2)
    const decompressedEncryptedPrivateViewKey = EthCrypto.cipher.parse(formatted)

    const decryptedPrivateViewKey = await EthCrypto.decryptWithPrivateKey(
        ownerPrivateViewingKey,
        decompressedEncryptedPrivateViewKey
    )
    console.log(decryptedPrivateViewKey)
    return decryptPrivateViewKey
}


export async function encryptDecrypt(ownerPublicViewingKey: string, safePrivateViewingKey: string, signer: Signer) {
    console.log(ownerPublicViewingKey, safePrivateViewingKey)
    const encrypt = await encryptPrivateViewKey(ownerPublicViewingKey, safePrivateViewingKey)
    console.log(encrypt)
    const privateKeys = await getPrivateKeys(signer as Signer)
    console.log(privateKeys)
    const safeEncryptedPrivateViewingKey = "0x" + encrypt
    const decrypt = await decryptPrivateViewKey(privateKeys.viewingKeyPair.privateKeyHex as string, safeEncryptedPrivateViewingKey)
    console.log(decrypt)
}