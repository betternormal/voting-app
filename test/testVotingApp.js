const VotingApp = artifacts.require("./VotingApp.sol");

contract('VotingApp', function(accounts) {	
  contract('VotingApp.endProposalRegistration - onlyAdministrator modifier ', function(accounts) {
	it("The voting administrator should be able to end the proposal registration session only after it has started", async function() {
	  
	  //arrange 
	  let VotingAppInstance = await VotingApp.deployed();
	  let votingAdministrator = await VotingAppInstance.administrator();
			
	  let nonVotingAdministrator = web3.eth.accounts[1];			
						
	  try {
		await VotingAppInstance.endProposalsRegistration({from: nonVotingAdministrator});
		assert.fail('Non-admin can"t end proposal');
	  }
	  catch(e) {
		//assert
		assert.isTrue(votingAdministrator != nonVotingAdministrator);
		assert.isTrue(e.message.includes("the caller of this function must be the administrator") , "Error: the caller of this function must be the administrator");
	  }
	});					
  });	
	
  contract('VotingApp.endProposalRegistration - onlyDuringProposalsRegistration modifier', function(accounts) {
	it("An account that is not the voting administrator must not be able to end the proposal registration session", async function() {
		
		//arrange 
	  let VotingAppInstance = await VotingApp.deployed();
	  let votingAdministrator = await VotingAppInstance.administrator();				
						
	  try {
	    //act
		await VotingAppInstance.endProposalsRegistration({from: votingAdministrator});
		// assert.isTrue(false);
		assert.fail("Error: VM Exception while processing transaction: revert this function can be called only during proposals registration");
	  }
	  catch(e) {
		//assert
		assert.isTrue(e.message.includes("this function can be called only during proposals registration"), "Error: VM Exception while processing transaction: revert this function can be called only during proposals registration");
	  }
	});					
  });
	
  contract('VotingApp.endProposalRegistration - successful', function(accounts) {
	it("An account that is not the voting administrator must not be able to end the proposal registration session", async function() {
		
		//arrange 
	  let VotingAppInstance = await VotingApp.deployed();
	  let votingAdministrator = await VotingAppInstance.administrator();

	  await VotingAppInstance.startProposalsRegistration({from: votingAdministrator});
	  let workflowStatus = await VotingAppInstance.getWorkflowStatus();
	  let expectedWorkflowStatus = 1;
			
	  assert.equal(workflowStatus.valueOf(), expectedWorkflowStatus, "The current workflow status does not correspond to proposal registration session started"); 			
						
	  //act
	  await VotingAppInstance.endProposalsRegistration({from: votingAdministrator});
	  let newWorkflowStatus = await VotingAppInstance.getWorkflowStatus();
	  let newExpectedWorkflowStatus = 2;
			
	  //assert
	  assert.equal(newWorkflowStatus.valueOf(), newExpectedWorkflowStatus, "The current workflow status does not correspond to proposal registration session ended"); 

	  });					
	});	
});