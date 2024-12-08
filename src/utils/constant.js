export const contractAddress = "0x1234567890"; // change the contractAddress here

export const abi = [
  "constructor(address[] _candidates)",
  "function checkAddress(address _address) view returns (string)",
  "function addCandidates(address[] _addresses) returns (bool)",
  "function approveVoter(address[] _voters)",
  "function endElection()",
  "function getCandidates() view returns (tuple(address,uint256)[])",
  "function getWinningCandidate() view returns (address)",
  "function isElectionFinished() view returns (bool)",
  "function vote(uint256 _candidateId)",
];
