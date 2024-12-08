// SPDX-License-Identifier: MIT

pragma solidity >=0.8.2 <0.9.0;

contract Election {
    struct Candidate {
        address addr;
        uint votes;
    }

    struct CandidateInfo {
        address addr;
        uint id;
    }

    struct Voter {
        address addr;
        bool eligible;
        bool voted;
        uint candidateId;

        address[] approvedBy;
        uint approveCount;
    }

    uint numCandidates = 0;
    uint numVoters = 0;

    mapping(address => uint) candidateId;
    mapping(address => uint) voterId;
    
    uint winnerId;

    bool finished;

    Candidate[] candidates;
    Voter[] voters;

    mapping(address => bool) callEndElection;
    uint endElectionCount = 0;

    address public deployer;
    mapping(address => bool) public isCandidate;
    mapping(address => bool) public isVoter;

    constructor(address[] memory _candidates) {
        deployer = msg.sender;
        isCandidate[msg.sender] = true;

        // Add other candidates
        for(uint i = 0; i < _candidates.length; i ++) {
            address candidate = _candidates[i];
            candidates.push(Candidate(candidate, 0));
            numCandidates += 1;
            candidateId[candidate] = numCandidates;
            isCandidate[candidate] = true;
        }
    }
    
    function checkAddress(address _address) public view returns (string memory) {
        if (_address == deployer) {
            return "Deployer";
        } else if (isCandidate[_address]) {
            return "Candidate";
        } else if (voterId[_address] > 0) {
            return "Voter";
        } else {
            return "Unknown";
        }
    }

    function approveVoter(address[] calldata _voters) external {
        require(!finished, "Election has already finished");
        require(candidateId[msg.sender] > 0, "Only candidate can approve voters");

        for (uint i = 0; i < _voters.length; i++) {
            address _voter = _voters[i];

            if (voterId[_voter] == 0) {
                // Add voter into the voters list
                voters.push(Voter(_voter, false, false, 0, new address[](numCandidates), 0));
                numVoters += 1;
                voterId[_voter] = numVoters;
            }

            Voter storage voter = voters[voterId[_voter] - 1];
            require(!voter.eligible, "Voter is already eligible to vote");

            // Check if the candidate has already approved this voter
            for (uint j = 0; j < voter.approveCount; j++) {
                require(msg.sender != voter.approvedBy[j], "Voter has already been approved by you");
            }

            // Approve the voter
            voter.approvedBy[voter.approveCount] = msg.sender;
            voter.approveCount += 1;

            // Set the voter as eligible if all candidates have approved
            if (voter.approveCount == numCandidates) {
                voter.eligible = true;
            }
        }
    }

    function vote(uint _candidateId) external {
        require(!finished, "Election has already finished");
        require(_candidateId > 0 && _candidateId <= numCandidates, "Candidate does not exist");
        require(voterId[msg.sender] > 0, "Voter is not added in the election");
        
        Voter storage voter = voters[voterId[msg.sender] - 1];
        require(voter.eligible, "Voter is not yet eligible to cast vote");
        require(!voter.voted, "Voter has already cast its vote");
        
        voter.candidateId = _candidateId;
        voter.voted = true;

        Candidate storage candidate = candidates[_candidateId - 1];
        candidate.votes += 1;
    }

    function addCandidates(address[] memory _addresses) external returns (bool) {
        require(!finished, "Election has already finished");
        
        for (uint i = 0; i < _addresses.length; i++) {
            address candidate = _addresses[i];
            
            // Ensure the candidate is not already added
            require(candidateId[candidate] == 0, "Candidate already exists");

            // Add the new candidate
            candidates.push(Candidate(candidate, 0));
            numCandidates += 1;
            candidateId[candidate] = numCandidates;
            isCandidate[candidate] = true;
        }
        
        return true;
    }

    function getCandidates() public view returns (CandidateInfo[] memory) {
        CandidateInfo[] memory candidateInfos = new CandidateInfo[](numCandidates);
        
        for (uint i = 0; i < numCandidates; i++) {
            candidateInfos[i] = CandidateInfo(candidates[i].addr, i + 1);
        }
        
        return candidateInfos;
    }

    function endElection() external {
        require(!finished, "Election has already finished");
        require(candidateId[msg.sender] > 0, "Only candidate can call this function");
        require(callEndElection[msg.sender] == false, "You have already called this function. Wait for other candidates to call end to election");
        
        callEndElection[msg.sender] = true;
        endElectionCount += 1;
        
        if (endElectionCount == numCandidates) {
            // Set the winner and mark election as finished
            uint maxVotes = 0;
            for(uint i = 0; i < numCandidates; i++) {
                if (candidates[i].votes > maxVotes) {
                    maxVotes = candidates[i].votes;
                    winnerId = i + 1;
                }
            }
            finished = true;
        }
    }

    function isElectionFinished() public view returns (bool) {
        return finished;
    }

    function getWinningCandidate() public view returns (address) {
        require(finished, "The election is still running");
        return candidates[winnerId - 1].addr;
    }
}