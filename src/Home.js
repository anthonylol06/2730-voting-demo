import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectWallet, checkIfWalletIsConnected, getUserRole } from "./utils/wallet";
import "./App.css";

const Home = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [path, setPath] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    checkIfWalletIsConnected(setCurrentAccount, async () => {
      const result = await getUserRole(currentAccount);
      setRole(result);
    });
  }, [currentAccount]);

  const handleButtonClick = (path) => {
    setPath(path);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const goToPath = () => {
    setShowPopup(false);
    navigate(path);
  };

  return (
    <div>
      <div class="bio">Account: {currentAccount}</div>
      {!currentAccount && (
        <button class="buttonAnimation" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
      {role === "Voter" && (
        <button
          class="buttonAnimation"
          onClick={() => handleButtonClick("/voting")}
        >
          Voting
        </button>
      )}
      {role === "Candidate" && (
        <button
          class="buttonAnimation"
          onClick={() => handleButtonClick("/approve")}
        >
          Approve Voters
        </button>
      )}
      {role === "Deployer" && (
        <button
          class="buttonAnimation"
          onClick={() => handleButtonClick("/add")}
        >
          Add Candidates
        </button>
      )}
      {role === "Candidate" && (
        <button
          class="buttonAnimation"
          onClick={() => handleButtonClick("/end")}
        >
          End election
        </button>
      )}
      <button
        class="buttonAnimation"
        onClick={() => handleButtonClick("/result")}
      >
        Show Voting Result
      </button>

      {showPopup && (
        <div class="popup">
          <div class="popup-inner">
            <button class="close-btn" onClick={closePopup}>
              &times;
            </button>
            <p>Are you sure?</p>
            <button class="buttonAnimation" onClick={goToPath}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
