import EthCrypto from 'eth-crypto';
import { getPrivateKeys } from '@/components/umbra/umbraExtended'
import { Signer } from 'ethers'
import { getStealthKeys } from '@/components/umbra/getStealthKeys'

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
    const stealthKeys = await getStealthKeys("0xD2661728b35916D0A15834c558D4e6E3b7567f76")
    console.log("stealthKeys", stealthKeys)
    console.log("ownerPublicViewingKey_useToEncrypt", "0447f7acd0960740f142217321448318d319102b3fcc17956a554bb3855487823405868bdc7f1b04f4c50400edb3afeafac13a48517e7713eea4a015fef17d4ec5")
    console.log("safePrivateViewingKey", safePrivateViewingKey)
    const safePrivateViewingKey_Encrypted = await encryptPrivateViewKey("0447f7acd0960740f142217321448318d319102b3fcc17956a554bb3855487823405868bdc7f1b04f4c50400edb3afeafac13a48517e7713eea4a015fef17d4ec5", safePrivateViewingKey)
    console.log("safePrivateViewingKey_Encrypted", safePrivateViewingKey_Encrypted)
    const privateKeys = await getPrivateKeys(signer as Signer)
    // console.log("privateKeys", privateKeys)
    // console.log("JSON.stringify(privateKeys)", JSON.stringify(privateKeys));
    console.log("privateKeys[\"viewingKeyPair\"]", privateKeys["viewingKeyPair"]);
    const safeEncryptedPrivateViewingKey = "0x" + safePrivateViewingKey_Encrypted
    const decrypt = await decryptPrivateViewKey(privateKeys.viewingKeyPair.privateKeyHex as string, safeEncryptedPrivateViewingKey)
    console.log(decrypt)
}

export async function encryptDecryptSample() {
    let ownerPublicViewingKey = "0450e5953846ce708e5487f99dd01703ba7225e76564859ca5809d6cfa4caa3aade038001e9e04043ef796f3fc8a8d87794c37230e869357ea051a5aaafbe635ae";
    let safePrivateViewingKey = "0x9519a854ef285c7ac24c61ea58ccfb83409c65d838a9269304dc988da4c734bc";
    console.log(ownerPublicViewingKey, safePrivateViewingKey)
    const encrypt = await encryptPrivateViewKey(ownerPublicViewingKey, safePrivateViewingKey)
    console.log("encrypt", encrypt);
    const privateKeys = JSON.parse("{\"spendingKeyPair\":{\"privateKeyHex\":\"0xdaaa378ad71c0dc756f2e61a9a0527bb545deecbc2329841738dee4dab48384d\",\"publicKeyHex\":\"0x04e334a0aa05155452c5e0f16ee620aba727665ceb55cf9e6d89e47a441c06d5b99f8ebca913cbe5755fd35a1b312af2511e81d1a4ad55312e5e1f239d57795021\"},\"viewingKeyPair\":{\"privateKeyHex\":\"0x9519a854ef285c7ac24c61ea58ccfb83409c65d838a9269304dc988da4c734bc\",\"publicKeyHex\":\"0x04f0fa2ac75951d1952c67eb775821dabc508632fe177133469bef00fd5fb247ecfe5277cab36b173d712033ffb4d4b33d221e8279448e8c4c3f0651c05cc5675e\"}}");
    console.log("privateKeys", privateKeys)
    const safeEncryptedPrivateViewingKey = "0x" + encrypt
    const decrypt = await decryptPrivateViewKey(privateKeys.viewingKeyPair.privateKeyHex as string, safeEncryptedPrivateViewingKey)
    console.log(decrypt)
}
