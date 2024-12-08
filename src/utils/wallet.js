import { ethers } from "ethers";
import { abi, contractAddress } from "./constant";

export const initializeProvider = async () => {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    await provider.send("eth_requestAccounts", []);
    return { provider, signer };
  } else {
    console.log("MetaMask not installed; using read-only defaults.");
    return { provider: ethers.getDefaultProvider(), signer: null };
  }
};

export const connectWallet = async () => {
  const { ethereum } = window;
  if (!ethereum) {
    alert("Use MetaMask!");
    return;
  }

  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  console.log("Account connected:", accounts[0]);
  return accounts[0];
};

export const checkIfWalletIsConnected = async (
  setCurrentAccount,
  funcToLoad
) => {
  const { ethereum } = window;
  if (!ethereum) {
    console.log("Use MetaMask!");
    return;
  }

  const accounts = await ethereum.request({ method: "eth_accounts" });
  if (accounts.length > 0) {
    const account = accounts[0];
    console.log("Found an authorized account:", account);
    setCurrentAccount(account);
    funcToLoad();
  } else {
    console.log("No authorized account found");
  }
};

export const getUserRole = async (address) => {
  const { signer } = await initializeProvider();
  if (!signer) return null;

  const contract = new ethers.Contract(contractAddress, abi, signer);
  try {
    const role = await contract.checkAddress(address);
    return role;
  } catch (error) {
    console.error("Error checking address:", error);
    return null;
  }
};
