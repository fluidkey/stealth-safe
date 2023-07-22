import EthCrypto from 'eth-crypto';

export async function encryptPrivateViewKey(ownerPublicViewingKey: string, safePrivateViewingKey: string) {
    console.log(ownerPublicViewingKey)
    const encryptedPrivateViewKey = await EthCrypto.encryptWithPublicKey(
        ownerPublicViewingKey,
        safePrivateViewingKey
    )
    const compressedEncryptedPrivateViewKey = EthCrypto.cipher.stringify(encryptedPrivateViewKey)
    return compressedEncryptedPrivateViewKey
}