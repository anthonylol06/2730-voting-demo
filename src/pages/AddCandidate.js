import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import "../App.css";
import { abi, contractAddress } from "../utils/constant";
import {
  initializeProvider,
  connectWallet,
  checkIfWalletIsConnected,
} from "../utils/wallet";

const AddCandidate = () => {
  const [candidates, setCandidates] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);

  const addCandidates = useCallback(async (array) => {
    setLoading(true);
    const { provider, signer } = await initializeProvider();
    if (!signer) return; // Exit if not connected to MetaMask

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const gasPrice = (await provider.getFeeData()).gasPrice;
      const txParams = { gasPrice };
      const tx = await contract.addCandidates(array, txParams);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      alert("Candidates added successfully!");
    } catch (error) {
      console.error("Error adding candidates:", error);
      alert("Failed to add candidates. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const candidatesArray = candidates
        .split(/[^a-zA-Z0-9]+/)
        .filter((candidate) => candidate.trim() !== "");
      const uniqueCandidatesArray = [...new Set(candidatesArray)];
      console.log(uniqueCandidatesArray);
      try {
        await addCandidates(uniqueCandidatesArray);
        setCandidates("");
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
        alert(`Failed to add candidates: ${errorMessage}`);
      }
    },
    [candidates, addCandidates]
  );

  // Check wallet connection on mount
  useEffect(() => {
    checkIfWalletIsConnected(setCurrentAccount, () => {});
  }, []);

  return (
    <div>
      <div class="bio">Account: {currentAccount}</div>

      {!currentAccount && (
        <button
          class="generalButton"
          onClick={async () => setCurrentAccount(await connectWallet())}
        >
          Connect Wallet
        </button>
      )}
      <h2>Add Candidates</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={candidates}
          onChange={(e) => setCandidates(e.target.value)}
          placeholder="Add candidates separated by commas"
          rows="10"
          cols="50"
          class="text-area"
          disabled={loading}
        />
        <br />
        <button class="buttonAnimation" type="submit" disabled={loading}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddCandidate;
