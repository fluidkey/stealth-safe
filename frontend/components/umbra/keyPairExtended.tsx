/*import { KeyPair } from 'umbra/umbra-js/src/';
import {
    getSharedSecret as nobleGetSharedSecret,
    utils as nobleUtils,
    ProjectivePoint,
  } from '@noble/secp256k1';


class KeyPairSafe extends KeyPair {

    encryptPrivKey(privKey: string) {
        // Get shared secret to use as encryption key
        const ephemeralPrivateKey = nobleUtils.randomPrivateKey();
        const ephemeralPublicKey = ProjectivePoint.fromPrivateKey(ephemeralPrivateKey);
        const ephemeralPrivateKeyHex = `0x${nobleUtils.bytesToHex(ephemeralPrivateKey)}`;
        const ephemeralPublicKeyHex = `0x${ephemeralPublicKey.toHex()}`;
        const sharedSecret = getSharedSecret(ephemeralPrivateKeyHex, this.publicKeyHex);

        // XOR random number with shared secret to get encrypted value
        const ciphertextBN = number.value.xor(sharedSecret);
        const ciphertext = hexZeroPad(ciphertextBN.toHexString(), 32); // 32 byte hex string with 0x prefix
        return { ephemeralPublicKey: ephemeralPublicKeyHex, ciphertext };
    }

} */