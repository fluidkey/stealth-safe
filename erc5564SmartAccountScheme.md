# Smart Account Implementation of SECP256k1 with View Tags

This implementation is derived from EIP-5564 Scheme 0, [SECP256k1 with View Tags](https://eips.ethereum.org/EIPS/eip-5564), and extends it to smart accounts that are controlled by multiple EOAs (e.g. [Safe](https://github.com/safe-global/safe-contracts)).

The following reference is divided into four sections:

1. Stealth address generation
2. Stealth smart account deployment
3. Parsing announcements
4. Stealth private key derivation

Definitions:

- *G* represents the generator point of the curve.
- *Recipient* represents the owner(s) of all $n$ EOAs controlling the smart account

### Generation - Generate stealth address from stealth meta-address:

- Recipient has access to the smart account viewing private key $p_{viewSa}$ from which public key $P_{viewSa}$ is derived.
- Recipient has access to the $n$ private keys  $p_{spend}$ , $p_{view}$ from which public keys $P_{spend}$ , $P_{view}$ are derived.
- Recipient has published a smart account stealth meta-address that consists of the smart account address $a_{publicSa}$ and of the public key $P_{viewSa}$.
- The smart account at $a_{publicSa}$ consists of $n$ controllers and parameters $t$.
- A smart contract at $a_{deployer}$ allows anyone to deploy a smart account of the same type as the one found at $a_{publicSa}$.
- Recipient has published $n$ stealth meta-addresses that consist of the public keys $P_{spend}$ and $P_{view}$.
- Sender passes the smart account stealth meta-address to the `generateStealthAddress` function.
- The `generateStealthAddress` function performs the following computations:
    - Generate a random 32-byte entropy ephemeral private key $p_{epheremal}$.
    - Derive the ephemeral public key $P_{ephemeral}$ from $p_{epheremal}$.
    - Parse the smart account address and viewing public key, $a_{publicSa}$ and $P_{viewSa}$, from the smart account stealth meta-address.
    - Parse the $n$ spending keys $P_{spend}$ from the stealth meta-addresses of the $N$ EOAs controlling $a_{publicSa}$.
    - A shared secret $s$ is computed as $s = p_{ephemeral} \cdot P_{viewSa}$ .
    - The secret is hashed $s_{h} = \mathrm{h}(s)$.
    - The view tag $v$ is extracted by taking the most significant byte $s_{h}[0]$.
    - Multiply the hashed shared secret with the generator point $S_{h} = s_{h} \cdot G$.
    - For each of the $n$ $P_{spend}$ , a stealth public key is computed as $P_{stealth} = P_{spend} + S_{h}$.
    - For each of the $n$ $P_{stealth}$, a stealth address $a_{stealth}$ is computed as $\mathrm{pubkeyToAddress(}P_{stealth}\mathrm{)}$.
    - The smart account stealth address is computed using [CREATE2](https://eips.ethereum.org/EIPS/eip-1014) as $a_{stealthSa} = \mathrm{predictAddress(}a_{deploy},a_{stealth}{\scriptstyle[1 \ldots n]}, t\mathrm{)}$.
    - The function returns the smart account stealth address $a_{stealthSa}$, the ephemeral public key $P_{ephemeral}$ and the view tag $v$.

### Stealth smart account deployment:

- Sender has access to all owner stealth addresses $a_{stealth}$ and to smart account parameters $t$ found at $a_{publicSa}$.
- The `deployStealthSmartAccount` function triggers the deployment of a stealth smart account:
    - Using CREATE2, the deployer contract at $a_{deploy}$ is called with $\mathrm{deploySmartAccount(}a_{stealth}{\scriptstyle[1 \ldots n]}, t\mathrm{)}$ via a relayer to preserve privacy
    - This will deploy the stealth smart account contract at the address predicted by the sender, $a_{stealthSa}$
- The deployed stealth smart account can be controlled with the $n$ stealth private keys $p_{stealth}$

### Parsing - Locate one’s own stealth smart accounts:

- User has access to the smart account viewing private key $p_{viewSa}$ and one of the $n$ EOA spending public keys $P_{spend}$.
- User has access to a set of `Announcement` events and applies the `checkStealthAddress` function to each of them.
- The `checkStealthAddress` function performs the following computations:
    - Shared secret $s$ is computed by multiplying the viewing private key with the ephemeral public key of the announcement $s = p_{viewSa} * P_{ephemeral}$.
    - The secret is hashed $s_{h} = \mathrm{h}(s)$.
    - The view tag $v$ is extracted by taking the most significant byte $s_{h}[0]$ and can be compared to the given view tag. If the view tags do not match, this `Announcement` is not for the user and the remaining steps can be skipped. If the view tags match, continue on.
    - Multiply the hashed shared secret with the generator point $S_{h} = s_{h} \cdot G$.
    - The stealth public key is computed as $P_{stealth} = P_{spend} + S_{h}$.
    - The derived stealth address $a_{stealth}$ is computed as $\mathrm{pubkeyToAddress(}P_{stealth}\mathrm{)}$.
    - Return `true` if an owner of the smart account stealth address of the announcement matches the derived stealth address, else return `false`.

### Stealth private key derivation:

- Recipient has access to the smart account viewing private key $p_{viewSa}$ and the $n$ EOA spending private keys $p_{spend}$.
- Recipient has access to a set of `Announcement` events for which the `checkStealthAddress` function returns `true`.
- The `computeStealthKey` function performs the following computations:
    - Shared secret $s$ is computed by multiplying the viewing private key with the ephemeral public key of the announcement $s = p_{viewSa} * P_{ephemeral}$.
    - The secret is hashed $s_{h} = \mathrm{h}(s)$.
    - The $n$ stealth private keys are computed as $p_{stealth} = p_{spend} + s_{h}$.
