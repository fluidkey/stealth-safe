import { Umbra, KeyPair, RandomNumber } from 'umbra/umbra-js/src/';
import { lookupRecipient } from 'umbra/umbra-js/src/utils/utils';
import { BigNumberish, Signer, ethers, ContractTransaction } from "ethers"
import { hexlify, toUtf8Bytes, isHexString, sha256, accessListify } from 'ethers/lib/utils';

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

            try {                
                // Get toll amount from contract.
                const toll = await this.umbraContract.toll();
                console.log(toll)
                // Send transaction.
                const txSigner = this.getConnectedSigner(signer as any); // signer input validated
                console.log(txSigner)
                let tx: ContractTransaction;
                tx = await this.umbraContract
                    .connect(txSigner)
                    .sendEth(stealthSafe, toll, pubKeyXCoordinate, encryptedCiphertext, { value: amount.toString() });
                console.log(tx)
                // We do not wait for the transaction to be mined before returning it
                return tx;
            } catch (error) {
                console.error(error);
                throw error;
            }
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

   /* const provider = signer.provider as ethers.providers.JsonRpcProvider;
    const umbraSafe = new UmbraSafe(provider, 100);
    const receipt = await umbraSafe.sendEth(stealthSafe, signer, pubKeyXCoordinate, encryptedCiphertext, amount) */

    const abi = [{"inputs":[{"internalType":"uint256","name":"_toll","type":"uint256"},{"internalType":"address","name":"_tollCollector","type":"address"},{"internalType":"address payable","name":"_tollReceiver","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"bytes32","name":"pkx","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"ciphertext","type":"bytes32"}],"name":"Announcement","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":true,"internalType":"address","name":"acceptor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"TokenWithdrawal","type":"event"},{"inputs":[],"name":"collectTolls","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_receiver","type":"address"},{"internalType":"uint256","name":"_tollCommitment","type":"uint256"},{"internalType":"bytes32","name":"_pkx","type":"bytes32"},{"internalType":"bytes32","name":"_ciphertext","type":"bytes32"}],"name":"sendEth","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_receiver","type":"address"},{"internalType":"address","name":"_tokenAddr","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"bytes32","name":"_pkx","type":"bytes32"},{"internalType":"bytes32","name":"_ciphertext","type":"bytes32"}],"name":"sendToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newToll","type":"uint256"}],"name":"setToll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newTollCollector","type":"address"}],"name":"setTollCollector","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_newTollReceiver","type":"address"}],"name":"setTollReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"tokenPayments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"toll","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tollCollector","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tollReceiver","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_acceptor","type":"address"},{"internalType":"address","name":"_tokenAddr","type":"address"}],"name":"withdrawToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_acceptor","type":"address"},{"internalType":"address","name":"_tokenAddr","type":"address"},{"internalType":"contract IUmbraHookReceiver","name":"_hook","type":"address"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"withdrawTokenAndCall","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_stealthAddr","type":"address"},{"internalType":"address","name":"_acceptor","type":"address"},{"internalType":"address","name":"_tokenAddr","type":"address"},{"internalType":"address","name":"_sponsor","type":"address"},{"internalType":"uint256","name":"_sponsorFee","type":"uint256"},{"internalType":"contract IUmbraHookReceiver","name":"_hook","type":"address"},{"internalType":"bytes","name":"_data","type":"bytes"},{"internalType":"uint8","name":"_v","type":"uint8"},{"internalType":"bytes32","name":"_r","type":"bytes32"},{"internalType":"bytes32","name":"_s","type":"bytes32"}],"name":"withdrawTokenAndCallOnBehalf","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_stealthAddr","type":"address"},{"internalType":"address","name":"_acceptor","type":"address"},{"internalType":"address","name":"_tokenAddr","type":"address"},{"internalType":"address","name":"_sponsor","type":"address"},{"internalType":"uint256","name":"_sponsorFee","type":"uint256"},{"internalType":"uint8","name":"_v","type":"uint8"},{"internalType":"bytes32","name":"_r","type":"bytes32"},{"internalType":"bytes32","name":"_s","type":"bytes32"}],"name":"withdrawTokenOnBehalf","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    const contractAddress = "0xFb2dc580Eed955B528407b4d36FfaFe3da685401"
    const contract = new ethers.Contract(contractAddress, abi, signer)
    const toll = await contract.toll()
    console.log(stealthSafe, toll, pubKeyXCoordinate, encryptedCiphertext, amount.toString())
    const accessList = accessListify([{address: stealthSafe, storageKeys: ["0x0000000000000000000000000000000000000000000000000000000000000000"]}, {address: "0x3E5c63644E683549055b9Be8653de26E0B4CD36E", storageKeys: []}])
    const sendEth = await contract.sendEth(stealthSafe, toll, pubKeyXCoordinate, encryptedCiphertext, {value: amount.toString(), accessList: accessList})
    console.log(sendEth)
    const receipt = await sendEth.wait()
    return receipt
}