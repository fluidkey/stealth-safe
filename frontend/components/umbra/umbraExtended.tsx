import { Umbra, KeyPair, RandomNumber } from 'umbra/umbra-js/src/';
import { lookupRecipient } from 'umbra/umbra-js/src/utils/utils';
import { BigNumberish, Signer, ethers, ContractTransaction } from "ethers"
import { hexlify, toUtf8Bytes, isHexString, sha256 } from 'ethers/lib/utils';

class UmbraSafe extends Umbra {
// modification of Umbra's generatePrivateKeys function
        async generateSafePrivateKeys(signer: Signer){
            // Base message that will be signed
            const baseMessage = 'Sign this message to generate a key for your Safe on Umbra.\n\nOnly sign this message for a trusted client!'; // prettier-ignore

            // Append chain ID if not mainnet to mitigate replay attacks
            const { chainId } = await this.provider.getNetwork();
            const message = chainId === 1 ? baseMessage : `${baseMessage}\n\nChain ID: ${chainId}`;

            // Get 65 byte signature from user using personal_sign
            const userAddress = await signer.getAddress();
            const formattedMessage = hexlify(toUtf8Bytes(message));
            const signature = String(await this.provider.send('personal_sign', [formattedMessage, userAddress.toLowerCase()]));

            // If a user can no longer access funds because their wallet was using eth_sign before this update, stand up a
            // special "fund recovery login page" which uses the commented out code below to sign with eth_sign
            //     const signature = await signer.signMessage(message);

            // Verify signature
            const isValidSignature = (sig: string) => isHexString(sig) && sig.length === 132;
            if (!isValidSignature(signature)) {
            throw new Error(`Invalid signature: ${signature}`);
            }

            // Split hex string signature into two 32 byte chunks
            const startIndex = 2; // first two characters are 0x, so skip these
            const length = 64; // each 32 byte chunk is in hex, so 64 characters
            const portion1 = signature.slice(startIndex, startIndex + length);
            const portion2 = signature.slice(startIndex + length, startIndex + length + length);
            const lastByte = signature.slice(signature.length - 2);

            if (`0x${portion1}${portion2}${lastByte}` !== signature) {
            throw new Error('Signature incorrectly generated or parsed');
            }

            // Hash the signature pieces to get the two private keys
            const spendingPrivateKey = sha256(`0x${portion1}`);
            const viewingPrivateKey = sha256(`0x${portion2}`);

            // Create KeyPair instances from the private keys and return them
            const spendingKeyPair = new KeyPair(spendingPrivateKey);
            const viewingKeyPair = new KeyPair(viewingPrivateKey);
            return { spendingKeyPair, viewingKeyPair };
    }

    async prepareSendSafe(recipientIds: string[], viewingPubKey: string, viewingPubKeyPrefix: string, lookupOverrides: any) {
        console.log(recipientIds)
        let recipients: {recipientId: string, stealthKeyPair: any, pubKeyXCoordinate: any, encryptedRandomNumber: any, stealthAddress: string}[] = []
        const viewingPubKeyUncompressed = KeyPair.getUncompressedFromX(viewingPubKey, Number(viewingPubKeyPrefix))

        const randomNumber = new RandomNumber();

        const viewingKeyPair = new KeyPair(viewingPubKeyUncompressed);

        const encrypted = viewingKeyPair.encrypt(randomNumber);

        const { pubKeyXCoordinate } = KeyPair.compressPublicKey(encrypted.ephemeralPublicKey);

        // Lookup recipient's public key
        for (let i = 0; i < recipientIds.length; i++) {
            console.log(recipientIds[i])
            const { spendingPublicKey } = await lookupRecipient(recipientIds[i], this.provider, lookupOverrides);
            if (!spendingPublicKey) {
            throw new Error(`Could not retrieve public keys for recipient ID ${recipientIds[i]}`);
            }
            const spendingKeyPair = new KeyPair(spendingPublicKey);

            const stealthKeyPair = spendingKeyPair.mulPublicKey(randomNumber);

            const stealthAddress = stealthKeyPair.address;

            recipients.push({recipientId: recipientIds[i], stealthKeyPair, pubKeyXCoordinate, encryptedRandomNumber: encrypted, stealthAddress})
        }
        console.log(recipients)
        return recipients
      }

      async sendEth(stealthSafe: string, signer: Signer, pubKeyXCoordinate: string, encryptedCiphertext: string, amount: BigNumberish) {

            // Get toll amount from contract.
            const toll = await this.umbraContract.toll();

            // Send transaction.
            const txSigner = this.getConnectedSigner(signer as any); // signer input validated
            let tx: ContractTransaction;
            const txOverrides = { value: toll.add(amount) };
            tx = await this.umbraContract
                .connect(txSigner)
                .sendEth(stealthSafe, toll, pubKeyXCoordinate, encryptedCiphertext, txOverrides);

            // We do not wait for the transaction to be mined before returning it
            return tx;
      }
}

export async function generateKeys(signer: Signer) {
    const provider = signer.provider as ethers.providers.JsonRpcProvider;
    const umbraSafe = new UmbraSafe(provider, 100);
    const { viewingKeyPair } = await umbraSafe.generateSafePrivateKeys(signer);
    const { prefix: viewingPrefix, pubKeyXCoordinate: viewingPubKeyX } = KeyPair.compressPublicKey(viewingKeyPair.publicKeyHex)
    return { viewingKeyPair: viewingKeyPair, prefix: viewingPrefix, pubKeyXCoordinate: viewingPubKeyX };
}

export async function prepareSendToSafe(recipientIds: string[], viewingPubKey: string, viewingPubKeyPrefix: string) {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm")
    const umbraSafe = new UmbraSafe(provider, 100)
    const response = await umbraSafe.prepareSendSafe(recipientIds, viewingPubKey, viewingPubKeyPrefix, {})
    return response
}

export async function sendPayment(stealthSafe: string, signer: Signer, pubKeyXCoordinate: string, encryptedCiphertext: string, amount: number) {
    const provider = signer.provider as ethers.providers.JsonRpcProvider;
    const umbraSafe = new UmbraSafe(provider, 100);
    const tx = await umbraSafe.sendEth(stealthSafe, signer, pubKeyXCoordinate, encryptedCiphertext, amount)
}