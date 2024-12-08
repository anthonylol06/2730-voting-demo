import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { abi, contractAddress } from "../utils/constant";
import {
  initializeProvider,
  connectWallet,
  checkIfWalletIsConnected,
} from "../utils/wallet";

const Approve = () => {
  const [voters, setVoters] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle textarea input change
  const handleInputChange = (event) => {
    setVoters(event.target.value);
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const votersArray = voters
      .split(/[^a-zA-Z0-9]+/)
      .filter((candidate) => candidate.trim() !== "");
    const uniqueVotersArray = [...new Set(votersArray)];
    // console.log(uniqueVotersArray);
    approveVoter(uniqueVotersArray);
  };

  const approveVoter = useCallback(async (array) => {
    setLoading(true);

    const { provider, signer } = await initializeProvider();
    if (!signer) return; // Exit if not connected to MetaMask

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const gasPrice = (await provider.getFeeData()).gasPrice;
      const txParams = { gasPrice };
      const tx = await contract.approveVoter(array, txParams);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      alert("Candidates added successfully!");
      setVoters("");
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
      alert(`Failed to approve voters: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check wallet connection on mount
  useEffect(() => {
    checkIfWalletIsConnected(setCurrentAccount, () => {});
  }, []);

  return (
    <div>
      <div>Account: {currentAccount}</div>

      {!currentAccount && (
        <button class="buttonAnimation" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}

      <h1>Approve Voters</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={voters}
          onChange={handleInputChange}
          placeholder="Enter voters separated by commas"
          rows="10"
          cols="50"
          class="textarea"
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

export default Approve;
