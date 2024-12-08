import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { abi, contractAddress } from "../utils/constant";
import { initializeProvider, checkIfWalletIsConnected } from "../utils/wallet";

const Result = () => {
  const [loading, setLoading] = useState(false);
  const [, setCurrentAccount] = useState("");
  const [winner, setWinner] = useState("");

  // Function to approve a voter
  const checkWinner = useCallback(async () => {
    setLoading(true);
    const { signer } = await initializeProvider();
    if (!signer) return; // Exit if not connected to MetaMask

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const result = await contract.getWinningCandidate();
      setWinner(result);
    } catch (error) {
      let errorMessage = "An unknown error occurred.";
      if (typeof error.message === "string") {
        const match = error.message.match(/execution reverted: "(.*?)"/);
        if (match && match[1]) {
          errorMessage = match[1];
        }
      } else {
        errorMessage = error;
      }
      console.error("Error approving voter:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if the wallet is connected
  const checkWalletConnection = useCallback(async () => {
    await checkIfWalletIsConnected(setCurrentAccount, checkWinner);
  }, [checkWinner]);

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, [checkWalletConnection]);

  return (
    <div>
      <h2>Result</h2>
      {winner ? (
        <p>The Winning Candidate is : {winner}</p>
      ) : (
        <p>Winner not declared yet</p>
      )}
    </div>
  );
};

export default Result;
