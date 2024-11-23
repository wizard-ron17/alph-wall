import React from 'react'
import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { TokenDapp } from '@/components/TokenDapp'
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { tokenFaucetConfig } from '@/services/utils'
import gridStyles from "../styles/App.module.css";


export default function Home() {
  const { connectionStatus } = useWallet()

  return (
    <>
      <Head>
        <title>$EXY PIXELS</title>
        <meta name="description" content="Burn to play" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={gridStyles.App}>
        <header>
          <h1>$EXY PIXELS</h1>
          <nav>
            <span className="nav-text" onClick={() => window.location.href = '/docs'}>Docs</span>
            <span className="nav-text" onClick={() => window.location.href = '/activity'}>Activity</span>
            <AlephiumConnectButton />
          </nav>
        </header>
        
          <TokenDapp config={tokenFaucetConfig} />
        
   </div>
    </>
  )
}
