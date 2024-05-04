# Voting App

A Decentralized voting application using blockchain

## How to run
To run the app, you need to have Truffle(v5.11.5) installed on your machine. [Truffle Setup](https://www.npmjs.com/package/truffle)

```bash
git clone https://github.com/betternormal/voting-app.git
cd voting-app

# Compile Solidity smart contracts using truffle, compile into bytecode that can be run on EVM
truffle compile           

# Create a mock network
ganache                   

# Deploy smart contracts
truffle migrate --reset   

# Test smart contracts
truffle test              
```


## Requirements
**1.  The Admin registers the voter's Ethereum address on the allowlist**
<details>
<summary>code</summary>
    
```solidity
function registerVoter(
        address _voterAddress
    ) public onlyAdministrator onlyDuringVotersRegistration {
        require(
            !voters[_voterAddress].isRegistered,
            "the voter is already registered"
        );

        voters[_voterAddress].isRegistered = true;
        voters[_voterAddress].hasVoted = false;
        voters[_voterAddress].votedProposalId = 0;

        emit VoterRegisteredEvent(_voterAddress);
    }
```
</details>


**2.  The Admin starts the proposal registration session**
<details>
    <summary>code</summary>

```solidity
function startProposalsRegistration()
        public
        onlyAdministrator
        onlyDuringVotersRegistration
    {
        workflowStatus = Status.ProposalsRegistrationStarted;

        emit ProposalsRegistrationStartedEvent();
        emit WorkflowStatusChangeEvent(
            Status.RegisteringVoters,
            workflowStatus
        );
    }
```
</details>

**3. Voters can submit their proposals while the registration session is ongoing**

<details>
    <summary>code</summary>

```solidity
function registerProposal(
        string memory proposalDescription
    ) public onlyRegisteredVoter onlyDuringProposalsRegistration {
        proposals.push(
            Proposal({description: proposalDescription, voteCount: 0})
        );

        emit ProposalRegisteredEvent(proposals.length - 1);
    }
```
</details>

**4. The Admin ends the proposal registration session**
<details>
    <summary>code</summary>

```solidity
function endProposalsRegistration()
        public
        onlyAdministrator
        onlyDuringProposalsRegistration
    {
        workflowStatus = Status.ProposalsRegistrationEnded;

        emit ProposalsRegistrationEndedEvent();
        emit WorkflowStatusChangeEvent(
            Status.ProposalsRegistrationStarted,
            workflowStatus
        );
    }
```
</details>

**5. The Admin starts the voting session**
<details>
    <summary>code</summary>

```solidity
function startVotingSession()
        public
        onlyAdministrator
        onlyAfterProposalsRegistration
    {
        workflowStatus = Status.VotingStarted;

        emit VotingStartedEvent();
        emit WorkflowStatusChangeEvent(
            Status.ProposalsRegistrationEnded,
            workflowStatus
        );
    }
```
</details>

**6. Voters vote for the proposal they like**
<details>
    <summary>code</summary>

```solidity
function vote(
        uint proposalId
    ) public onlyRegisteredVoter onlyDuringVotingSession {
        require(!voters[msg.sender].hasVoted, "the caller has already voted");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposalId;

        proposals[proposalId].voteCount += 1;

        emit VotedEvent(msg.sender, proposalId);
    }
```
</details>

**7. The Admin ends the voting session**
<details>
    <summary>code</summary>

```solidity
function endVotingSession()
        public
        onlyAdministrator
        onlyDuringVotingSession
    {
        workflowStatus = Status.VotingEnded;

        emit VotingEndedEvent();
        emit WorkflowStatusChangeEvent(Status.VotingStarted, workflowStatus);
    }
```
</details>

**8. The Admin counts the votes**
<details>
    <summary>code</summary>

```solidity
    function countVotes() public onlyAdministrator onlyAfterVotingSession {
        uint winningVoteCount = 0;
        uint winningProposalIndex = 0;

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalIndex = i;
            }
        }

        selectedProposalId = winningProposalIndex;
        workflowStatus = Status.VotesCounted;

        emit VotesCountedEvent();
        emit WorkflowStatusChangeEvent(Status.VotingEnded, workflowStatus);
    }
```
</details>

**9. Anyone can check the details of the elected proposal**
<details>
    <summary>code</summary>

```solidity
function getWinningProposalId()
        public
        view
        onlyAfterVotesCounted
        returns (uint)
    {
        return selectedProposalId;
    }

    function getWinningProposalDescription()
        public
        view
        onlyAfterVotesCounted
        returns (string memory)
    {
        return proposals[selectedProposalId].description;
    }

    function getWinningProposaVoteCounts()
        public
        view
        onlyAfterVotesCounted
        returns (uint)
    {
        return proposals[selectedProposalId].voteCount;
    }
```
</details>


## Screenshots
> truffle migrate
<p float="left">
    <img src="./screenshots/truffle_migrate.png" alt="Recipe Search">
</p>

> truffle test
<p float="left">
    <img src="./screenshots/truffle_test.png" alt="Recipe List">
</p>

## Built With
- [Truffle](https://archive.trufflesuite.com/)
- [Ganache](https://archive.trufflesuite.com/ganache/)
  