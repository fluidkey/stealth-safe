import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'
import { useEthersSigner } from '@/components/utils/clientToSigner'
import { genPersonalPrivateKeys } from '@/components/umbra/umbraExtended'
import { Signer } from 'ethers'
import { getSafe } from '@/components/safeKeyRegistry/getSafe'
import { getSafesForOwner } from '@/components/safe/safeApiKit'
import { useState, ChangeEvent } from 'react'
import { decryptPrivateViewKey } from '@/components/eth-crypto/decryptPrivateViewKey'

const inter = Inter({ subsets: ['latin'] })

export default function sendFunctions() {

  const { address } = useAccount()
  const signer = useEthersSigner()
  const [safes, setSafes] = useState<string[]>([])
  const [selectedSafe, setSelectedSafe] = useState("")
  const [personalPrivateKeys, setPersonalPrivateViewKey] = useState<any>()
  const [safeViewKeys, setSafeViewKeys] = useState<any>()

  const handleSafeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSafe(e.target.value)
  }
  
  async function getSafes () {
    if (!address) return
    const safes = await getSafesForOwner(address as string)
    setSafes(safes.safes)
    setSelectedSafe(safes.safes[0])
  }
  
  async function getPersonalPrivateKeys() {
    const privateKeys = await genPersonalPrivateKeys(signer as Signer)
    console.log(privateKeys)
    setPersonalPrivateViewKey(privateKeys)
  }

  async function getSafeViewKeys() {
    const { safeViewPrivateKeyList } = await getSafe(selectedSafe)
    console.log(safeViewPrivateKeyList)
    const ownerData = safeViewPrivateKeyList.filter((owner: any) => owner.owner === address)
    console.log(ownerData)
    setSafeViewKeys(ownerData)
  }

  async function decryptViewKey() {
    console.log(safeViewKeys[0][0])
    const decryptedViewKey = await decryptPrivateViewKey(personalPrivateKeys.viewingKeyPair.privateKeyHex, safeViewKeys[0][0])
    console.log(decryptedViewKey)
  }

  return (
    <>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <Web3Button />
        <button onClick={getSafes}>Get Safes</button>
        {safes.length > 0 && 
          <select value={selectedSafe} onChange={handleSafeChange}>
            {safes.map((safe, index) => 
              <option key={index} value={safe}>{safe}</option>
            )}
          </select>
        }
        <button onClick={getPersonalPrivateKeys}>Get Private Keys</button>
        <button onClick={getSafeViewKeys}>Get Safe View Keys</button>
        <button onClick={decryptViewKey}>Decrypt View Key</button>
      </main>
    </>
  )
}
