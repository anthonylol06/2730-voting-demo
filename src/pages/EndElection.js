import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { abi, contractAddress } from "../utils/constant";
import {
  initializeProvider,
  connectWallet,
  checkIfWalletIsConnected,
} from "../utils/wallet";

const EndElection = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);

  const endElection = useCallback(async () => {
    setLoading(true);
    const { provider, signer } = await initializeProvider();
    if (!signer) return; // Exit if not connected to MetaMask

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const gasPrice = (await provider.getFeeData()).gasPrice;
      const txParams = { gasPrice };
      const tx = await contract.endElection(txParams);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      alert("Election ended successfully!");
      setLoading(false);
    } catch (error) {
      console.error("Error ending election:", error);
      alert("Failed to end election. Please check the console for details.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected(setCurrentAccount, () => {});
  }, []);

  const handleEndElection = () => {
    endElection();
  };

  return (
    <div>
      <div class="bio">Account: {currentAccount}</div>
      {!currentAccount && (
        <button class="buttonAnimation" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
      <button
        class="buttonAnimation"
        onClick={handleEndElection}
        disabled={loading}
      >
        End Election
      </button>
    </div>
  );
};

export default EndElection;
