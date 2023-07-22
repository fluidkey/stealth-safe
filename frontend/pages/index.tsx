import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'
import { getSafesForOwner, getSafeInfo } from '@/components/safe/safeApiKit'
import { useState, ChangeEvent, useEffect } from 'react'
import { getStealthKeys } from '@/components/umbra/getStealthKeys'
import { generateKeys } from '@/components/umbra/umbraExtended'
import { useEthersSigner } from '@/components/utils/clientToSigner'
import { Signer } from 'ethers'
import { encryptPrivateViewKey } from '@/components/eth-crypto/encryptPrivateViewKey'
import { generateAddress } from '@/components/umbra/generateAddressFromKey'
import { addSafe, executeTx } from '@/components/safeKeyRegistry/addSafe'
import safeService from '@/components/safe/safeEthersAdapter'
import { encryptDecrypt } from '@/components/eth-crypto/test'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const { address } = useAccount()
  const signer = useEthersSigner()
  const [safes, setSafes] = useState<string[]>([])
  const [selectedSafe, setSelectedSafe] = useState("")
  const [stealthKeyError, setStealthKeyError] = useState<string>("")
  const [stealthKeys, setStealthKeys] = useState<string[][]>([[]])
  const [sharedSafeViewKey, setSharedSafeViewKey] = useState({})
  const [safeTransactions, setSafeTransactions] = useState<any>()

  async function getSafes () {
    if (!address) return
    const safes = await getSafesForOwner(address as string)
    setSafes(safes.safes)
    setSelectedSafe(safes.safes[0])
  }

  async function fetchSafeInfo (safeAddress: string) {
    const safeInfo = await getSafeInfo(safeAddress)
    const owners = safeInfo.owners
    let safeStealthKeysArray: any = []
    for (let i = 0; i < owners.length; i++) {
      const safeStealthKeys = await getStealthKeys(owners[i]) as any
      if (safeStealthKeys.error) {
        setStealthKeyError("Make sure all owners have registered their stealth keys.")
        return
      } else {
        safeStealthKeys["owner"] = owners[i]
        safeStealthKeys["address"] = await generateAddress(safeStealthKeys.viewingPublicKey)
        safeStealthKeysArray.push(safeStealthKeys)
      }
    }
    setStealthKeys(safeStealthKeysArray)
  }

  const handleSafeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSafe(e.target.value)
  }

  useEffect(() => {
    if (safes.length > 0) {
      console.log(selectedSafe)
      fetchSafeInfo(selectedSafe)
    }
  }, [selectedSafe])

  async function generateSafeKeys () {
    const keys = await generateKeys(signer as Signer)
    for (let i = 0; i < stealthKeys.length; i++) {
      const pubKeySliced = stealthKeys[i].viewingPublicKey.slice(2)
      const encryptedKey = await encryptPrivateViewKey(pubKeySliced as string, keys.viewingKeyPair.privateKeyHex as string)
      stealthKeys[i]["encryptedKey"] = "0x"+encryptedKey
    }
    setSharedSafeViewKey(keys)
    setStealthKeys(stealthKeys)
    console.log(stealthKeys)
  }

  async function submitKeys () {
    const addToContract = await addSafe(selectedSafe, address as string, sharedSafeViewKey.prefix, sharedSafeViewKey.pubKeyXCoordinate, stealthKeys.map((key) => [key.encryptedKey, key.owner]), signer)
  }

  async function getTransactions () {
    const transactions = await safeService.getPendingTransactions(selectedSafe)
    console.log(transactions)
    setSafeTransactions(transactions)
  }

  async function executeTransaction () {
    console.log(safeTransactions.results[0])
    const execute = await executeTx(safeTransactions.results[0], signer as Signer, selectedSafe)
    console.log(execute)
  }

  async function test() {
    const keys = await generateKeys(signer as Signer)
    for (let i = 0; i < stealthKeys.length; i++) {
      if (stealthKeys[i].owner === address) {
        console.log(stealthKeys)
        const pubKeySliced = stealthKeys[i].viewingPublicKey.slice(2)
        console.log(stealthKeys[i])
        const testData = await encryptDecrypt(pubKeySliced as string, keys.viewingKeyPair.privateKeyHex as string, signer as Signer)
        console.log(testData)
      }
    }
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
        {stealthKeyError != "" && <p>{stealthKeyError}</p>}
        <button onClick={generateSafeKeys}>Generate Safe Keys</button>
        <button onClick={submitKeys}>Submit Keys</button>
        <button onClick={getTransactions}>Get Transactions</button>
        {safeTransactions && <button onClick={executeTransaction}>Execute Transaction</button>}
        <button onClick={test}>Test</button>
      </main>
    </>
  )
}
