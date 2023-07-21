import { KeyPair } from 'umbra/umbra-js/src/';

export async function generateAddress(publicKey: string) {
    const keyPair = new KeyPair(publicKey);
    return keyPair.address;
}