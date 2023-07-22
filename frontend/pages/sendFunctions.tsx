import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'
import { useEthersSigner } from '@/components/utils/clientToSigner'
import { getSafeInfo } from '@/components/safe/safeApiKit'
import { useState } from 'react'
import { getSafe } from '@/components/safeKeyRegistry/getSafe'
import { prepareSendToSafe } from '@/components/umbra/umbraExtended'

const inter = Inter({ subsets: ['latin'] })

export default function sendFunctions() {

  const { address } = useAccount()
  const signer = useEthersSigner()
  const [selectedSafe, setSelectedSafe] = useState("")
  const [safeInfo, setSafeInfo] = useState<any>()
  const [stealthData, setStealthData] = useState<any>()

  async function fetchSafeInfo () {
    const safeInfo = await getSafeInfo(selectedSafe)
    setSafeInfo(safeInfo)
    const getStealthData = await prepareSendToSafe(safeInfo.owners)
    setStealthData(getStealthData)
  }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedSafe(e.target.value)
    }

async function createStealthSafe () {
    

  return (
    <>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <Web3Button />
        <input type="text" placeholder="Enter Safe Address" onChange={handleInputChange}/>
        <button onClick={fetchSafeInfo}>Submit</button>
      </main>
    </>
  )
}
