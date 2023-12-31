import { Umbra, KeyPair, RandomNumber } from 'umbra/umbra-js/src/';
import { lookupRecipient } from 'umbra/umbra-js/src/utils/utils';
import {BigNumberish, Signer, ethers, ContractTransaction, BigNumber} from "ethers"
import { hexlify, toUtf8Bytes, isHexString, sha256, accessListify } from 'ethers/lib/utils';
import {UMBRA_SAFE_ABI, UMBRA_SAFE_ADDRESS} from "@/components/Const";
import { getSafeInfo } from '../safe/safeApiKit';
import { getAddress } from '@ethersproject/address';
import { getEvents } from '@/components/utils/getEvents';

export class UmbraSafe extends Umbra {
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

        console.log("randomNumber", randomNumber);
        console.log("randomNumber.asHex", randomNumber.asHex);

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
        return recipients
      }

    async scanSafe(spendingPublicKey: string, viewingPrivateKey: string, overrides: ScanOverrides = {}){
        console.log("ping")
        const announcements = await getEvents("Announcement");
        console.log(announcements)
        const userAnnouncements = announcements.reduce((userAnns, ann) => {
        const { amount, from, receiver, timestamp, token: tokenAddr, txHash } = ann.args;
        const { isForUser, randomNumber } = this.isAnnouncementForSafeUser(spendingPublicKey, viewingPrivateKey, ann);
        const token = getAddress(tokenAddr); // ensure checksummed address
        const isWithdrawn = false; // we always assume not withdrawn and leave it to the caller to check
        if (isForUser) userAnns.push({ randomNumber, receiver, amount, token, from, txHash, timestamp, isWithdrawn });
        return userAnns;
        }, [] as UserAnnouncement[]);

        return { userAnnouncements };
    }

    async isAnnouncementForSafeUser(spendingPublicKey: string, viewingPrivateKey: string, announcement: Announcement) {

        console.log("isAnnouncementForSafeUser", spendingPublicKey, viewingPrivateKey, announcement)
        try {
          // Get y-coordinate of public key from the x-coordinate by solving secp256k1 equation
          const { receiver, pkx, ciphertext } = announcement;
          const pkxBigNumber = BigNumber.from(pkx);
          console.log("pkxBigNumber", pkxBigNumber)
          const uncompressedPubKey = KeyPair.getUncompressedFromX(pkxBigNumber);
    
          // Decrypt to get random number
          const payload = { ephemeralPublicKey: uncompressedPubKey, ciphertext };
          const viewingKeyPair = new KeyPair(viewingPrivateKey);
          const randomNumber = viewingKeyPair.decrypt(payload);
    
          // Get what our receiving address would be with this random number
          const spendingKeyPair = new KeyPair(spendingPublicKey);
          const computedReceivingAddress = spendingKeyPair.mulPublicKey(randomNumber).address;

          // Get Safe owners
          console.log(receiver)
          const info = await getSafeInfo(receiver)
          const owners = info.owners
          console.log(owners)

          for (let i = 0; i < owners.length; i++) {
            if (computedReceivingAddress === owners[i]) {
                return { isForUser: true, randomNumber };
            }
          }
    
        } catch (err) {
            console.error(err);
          // We may reach here if people use the sendToken method improperly, e.g. by passing an invalid pkx, so we'd
          // fail when uncompressing. For now we just silently ignore these and return false
          return { isForUser: false, randomNumber: '' };
        }
      }
    
}

export async function generateKeys(signer: Signer) {
    const provider = signer.provider as ethers.providers.JsonRpcProvider;
    const umbraSafe = new UmbraSafe(provider, 100);
    const { viewingKeyPair } = await umbraSafe.generateSafePrivateKeys(signer);
    console.log("generateKeys_viewingKeyPair", viewingKeyPair);
    const { prefix: viewingPrefix, pubKeyXCoordinate: viewingPubKeyX } = KeyPair.compressPublicKey(viewingKeyPair.publicKeyHex)
    return { viewingKeyPair: viewingKeyPair, prefix: viewingPrefix, pubKeyXCoordinate: viewingPubKeyX };
}

export async function prepareSendToSafe(recipientIds: string[], viewingPubKey: string, viewingPubKeyPrefix: string) {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm")
    const umbraSafe = new UmbraSafe(provider, 100)
    const response = await umbraSafe.prepareSendSafe(recipientIds, viewingPubKey, viewingPubKeyPrefix, {})
    return response
}

export async function sendPayment(stealthSafe: string, signer: Signer, pubKeyXCoordinate: string, encryptedCiphertext: string, amount: BigNumber) {

    const abi = UMBRA_SAFE_ABI;
    const contractAddress = UMBRA_SAFE_ADDRESS;
    const contract = new ethers.Contract(contractAddress, abi, signer)
    const call = await contract.sendEth(stealthSafe, "0", pubKeyXCoordinate, encryptedCiphertext, {value: amount.toString()})
    const receipt = await call.wait()
    return receipt
}


export async function getPrivateKeys(signer: Signer) {
    const provider = signer.provider as ethers.providers.JsonRpcProvider;
    const umbraSafe = new UmbraSafe(provider, 100);
    const { spendingKeyPair, viewingKeyPair } = await umbraSafe.generateSafePrivateKeys(signer);
    return { spendingKeyPair: spendingKeyPair, viewingKeyPair: viewingKeyPair};
}

export async function genPersonalPrivateKeys(signer: Signer) {
    const provider = signer.provider as ethers.providers.JsonRpcProvider;
    const umbraSafe = new UmbraSafe(provider, 100);
    const { spendingKeyPair, viewingKeyPair } = await umbraSafe.generatePrivateKeys(signer);
    return { spendingKeyPair: spendingKeyPair, viewingKeyPair: viewingKeyPair};
}

export async function scanPayments(spendingPublicKey: string, viewingSafePrivateKey: string) {
    console.log(spendingPublicKey, viewingSafePrivateKey)
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm")
    const umbraSafe = new UmbraSafe(provider, 100)
    const response = await umbraSafe.scanSafe(spendingPublicKey, viewingSafePrivateKey)
    return response
}

