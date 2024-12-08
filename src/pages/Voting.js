import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import "../App.css";
import { abi, contractAddress } from "../utils/constant";
import {
  initializeProvider,
  connectWallet,
  checkIfWalletIsConnected,
} from "../utils/wallet";

const Voting = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);

  const handleVote = (id) => {
    setSelectedCandidate(id);
  };

  // Function to approve a voter
  const getCandidates = useCallback(async () => {
    setLoading(true);
    const { signer } = await initializeProvider();
    if (!signer) return; // Exit if not connected to MetaMask

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const result = await contract.getCandidates();
      const temp = result.map((candidate) => {
        console.log(candidate[0], candidate[1]);
        return {
          id: candidate[1], // address
          name: candidate[0].toString(), // uint256 (convert to string for easier handling)
        };
      });
      setCandidates(temp);
      return temp;
    } catch (error) {
      console.error("Error approving voter:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const vote = useCallback(async (candidateId) => {
    setLoading(true);
    const { provider, signer } = await initializeProvider();
    if (!signer) return; // Exit if not connected to MetaMask

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const gasPrice = (await provider.getFeeData()).gasPrice;
      const txParams = { gasPrice };
      const tx = await contract.vote(candidateId, txParams);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      alert("Vote submitted successfully!");
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
      alert(`Failed to vote: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedCandidate !== null) {
      await vote(selectedCandidate);
    } else {
      alert("Please select a candidate before submitting.");
    }
  }, [selectedCandidate, vote]);

  // Check if the wallet is connected
  const checkWalletConnection = useCallback(async () => {
    await checkIfWalletIsConnected(setCurrentAccount, getCandidates);
  }, [getCandidates]);

  // Connect wallet function
  const connectUserWallet = useCallback(async () => {
    const account = await connectWallet();
    setCurrentAccount(account);
  }, []);

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, [checkWalletConnection]);

  return (
    <div class="voting-container">
      <div class="bio">Account: {currentAccount}</div>

      {!currentAccount && (
        <button class="generalButton" onClick={connectUserWallet}>
          Connect Wallet
        </button>
      )}
      <h1 class="title">Vote for Your Candidate</h1>
      <div class="candidates-list">
        {candidates.map((candidate) => (
          <div key={candidate.id} class="candidate-item">
            <input
              type="radio"
              id={`candidate-${candidate.id}`}
              name="candidate"
              value={candidate.id}
              checked={selectedCandidate === candidate.id}
              onChange={() => handleVote(candidate.id)}
              class="radio-input"
              disabled={loading}
            />
            <label htmlFor={`candidate-${candidate.id}`} class="radio-label">
              <span class="radio-text">{candidate.name}</span>
            </label>
          </div>
        ))}
      </div>
      <button class="buttonAnimation" onClick={handleSubmit} disabled={loading}>
        Submit Vote
      </button>
    </div>
  );
};

export default Voting;
