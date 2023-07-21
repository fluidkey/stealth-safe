import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Web3Button } from '@web3modal/react'
import {useAccount} from 'wagmi'
import { getSafesForOwner, getSafeInfo } from '@/components/safe/safeApiKit'
import { useState, ChangeEvent, useEffect } from 'react'
import { getStealthKeys } from '@/components/umbra/getStealthKeys'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const { address } = useAccount()
  const [safes, setSafes] = useState<string[]>([])
  const [selectedSafe, setSelectedSafe] = useState("")
  const [stealthKeyError, setStealthKeyError] = useState<string>("")

  async function getSafes () {
    if (!address) return
    const safes = await getSafesForOwner(address as string)
    setSafes(safes.safes)
    setSelectedSafe(safes.safes[0])
  }

  async function fetchSafeInfo (safeAddress: string) {
    const safeInfo = await getSafeInfo(safeAddress)
    console.log(safeInfo)
    const owners = safeInfo.owners
    let safeStealthKeysArray: any = []
    for (let i = 0; i < owners.length; i++) {
      const safeStealthKeys = await getStealthKeys(owners[i]) as any
      console.log(safeStealthKeys)
      if (safeStealthKeys.error) {
        setStealthKeyError("Make sure all owners have registered their stealth keys.")
        return
      } else {
        safeStealthKeysArray.push(safeStealthKeys)
      }
    }
    console.log("stealth keys",safeStealthKeysArray)
    return safeInfo
  }

  const handleSafeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    console.log("ping")
    setSelectedSafe(e.target.value)
  }

  useEffect(() => {
    if (safes.length > 0) {
      console.log(selectedSafe)
      fetchSafeInfo(selectedSafe)
    }
  }, [selectedSafe])

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
      </main>
    </>
  )
}
