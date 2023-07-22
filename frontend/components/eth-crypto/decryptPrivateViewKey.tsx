import EthCrypto from 'eth-crypto';

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
