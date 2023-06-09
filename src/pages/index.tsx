import type { NextPage } from "next";
import React, { useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import styles from "../styles/Home.module.css"

const Home: NextPage = () => {
  const [account, setAccount] = useState("");
  const [connection, setConnection] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  async function getWeb3Modal() {
    let Torus = (await import("@toruslabs/torus-embed")).default;
    const web3modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: false,
      providerOptions: {
        torus: {
          package: Torus,
        },
      },
    });
    return web3modal;
  }

  async function connect() {
    const web3modal = await getWeb3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.BrowserProvider(connection as any);
    const accounts = await provider.listAccounts() as any;
    setConnection(connection);
    setAccount(accounts[0]);
  }

  async function Login() {
    const authData = await fetch(`/api/authenticate?address=${account}`);
    const user = await authData.json();
    const provider = new ethers.BrowserProvider(connection as any);
    const signer = provider.getSigner() as any;
    const signature = await signer.signMessage(user.nonce.toString());
    const response = await fetch(
      `/api/verify?address=${account}&signature=${signature}`
    );
    const data = await response.json();
    setLoggedIn(data.authenticated);
  }  

  return (
    <div className={styles.container}>
      {!connection && (
        <button  onClick={connect} className={styles.button}>
          Connect Wallet
        </button>
      )}
      {connection && !loggedIn && (
        <>
          <button className={styles.button} onClick={Login}>
            Login
          </button>
        </>
      )}
      {loggedIn && <h2>Lets get started, {account}</h2>}
    </div>
  );
};

export default Home;