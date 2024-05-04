// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract VotingApp {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum Status {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingStarted,
        VotingEnded,
        VotesCounted
    }

    Status public workflowStatus;
    address public administrator;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    uint private selectedProposalId;

    modifier onlyAdministrator() {
        require(
            msg.sender == administrator,
            "the caller of this function must be the administrator"
        );
        _;
    }

    modifier onlyRegisteredVoter() {
        require(
            voters[msg.sender].isRegistered,
            "the caller of this function must be a registered voter"
        );
        _;
    }

    modifier onlyDuringVotersRegistration() {
        require(
            workflowStatus == Status.RegisteringVoters,
            "this function can be called only before proposals registration has started"
        );
        _;
    }

    modifier onlyDuringProposalsRegistration() {
        require(
            workflowStatus == Status.ProposalsRegistrationStarted,
            "this function can be called only during proposals registration"
        );
        _;
    }

    modifier onlyAfterProposalsRegistration() {
        require(
            workflowStatus == Status.ProposalsRegistrationEnded,
            "this function can be called only after proposals registration has ended"
        );
        _;
    }

    modifier onlyDuringVotingSession() {
        require(
            workflowStatus == Status.VotingStarted,
            "this function can be called only during the voting session"
        );
        _;
    }

    modifier onlyAfterVotingSession() {
        require(
            workflowStatus == Status.VotingEnded,
            "this function can be called only after the voting session has ended"
        );
        _;
    }

    modifier onlyAfterVotesCounted() {
        require(
            workflowStatus == Status.VotesCounted,
            "this function can be called only after votes have been tallied"
        );
        _;
    }

    event VoterRegisteredEvent(address voterAddress);

    event ProposalsRegistrationStartedEvent();

    event ProposalsRegistrationEndedEvent();

    event ProposalRegisteredEvent(uint proposalId);

    event VotingStartedEvent();

    event VotingEndedEvent();

    event VotedEvent(address voter, uint proposalId);

    event VotesCountedEvent();

    event WorkflowStatusChangeEvent(Status previousStatus, Status newStatus);

    constructor() public {
        administrator = msg.sender;
        workflowStatus = Status.RegisteringVoters;
    }

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

    function registerProposal(
        string memory proposalDescription
    ) public onlyRegisteredVoter onlyDuringProposalsRegistration {
        proposals.push(
            Proposal({description: proposalDescription, voteCount: 0})
        );

        emit ProposalRegisteredEvent(proposals.length - 1);
    }

    function getProposalsNumber() public view returns (uint) {
        return proposals.length;
    }

    function getProposalDescription(
        uint index
    ) public view returns (string memory) {
        return proposals[index].description;
    }

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

    function endVotingSession()
        public
        onlyAdministrator
        onlyDuringVotingSession
    {
        workflowStatus = Status.VotingEnded;

        emit VotingEndedEvent();
        emit WorkflowStatusChangeEvent(Status.VotingStarted, workflowStatus);
    }

    function vote(
        uint proposalId
    ) public onlyRegisteredVoter onlyDuringVotingSession {
        require(!voters[msg.sender].hasVoted, "the caller has already voted");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposalId;

        proposals[proposalId].voteCount += 1;

        emit VotedEvent(msg.sender, proposalId);
    }

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

    function isRegisteredVoter(
        address _voterAddress
    ) public view returns (bool) {
        return voters[_voterAddress].isRegistered;
    }

    function isAdministrator(address _address) public view returns (bool) {
        return _address == administrator;
    }

    function getWorkflowStatus() public view returns (Status) {
        return workflowStatus;
    }
}
