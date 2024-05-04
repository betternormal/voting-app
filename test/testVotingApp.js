const VotingApp = artifacts.require("./VotingApp.sol");

contract('VotingApp', function(accounts) {	
  contract('VotingApp.endProposalRegistration - onlyAdministrator modifier ', function(accounts) {
	it("The voting administrator should be able to end the proposal registration session only after it has started", async function() {
	  // 이 테스트는 관리자가 아닌 계정이 제안 등록 세션을 종료하려고 할 때 오류가 발생하는지 확인합니다.
	  // 계약의 관리자 계정과 테스트에서 사용된 비관리자 계정이 다름을 확인하고, 관리자가 아닌 경우에는 특정 오류 메시지가 나타나야 합니다.
	  // 이 테스트는 onlyAdministrator 수정자가 올바르게 작동하는지 검증합니다.
	  
	  //arrange 
	  let VotingAppInstance = await VotingApp.deployed();
	  let votingAdministrator = await VotingAppInstance.administrator();
			
	  let nonVotingAdministrator = web3.eth.accounts[1];			
						
	  try {
		//act
		await VotingAppInstance.endProposalsRegistration({from: nonVotingAdministrator});
		assert.fail('no error occured');
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
		// 이 테스트는 관리자 계정이 제안 등록 세션이 활성화되지 않은 상태에서 세션 종료를 시도할 때 오류를 검증합니다.
		// 이 테스트는 onlyDuringProposalsRegistration 수정자가 제대로 작동하는지 확인하기 위해 수행됩니다.
		
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
		// 이 테스트는 관리자 계정이 제안 등록을 시작한 후 성공적으로 종료할 수 있는지 검증합니다.
		// 제안 등록이 시작된 후 올바르게 종료될 때 워크플로우 상태가 변경되는 것을 확인합니다.
		// 이는 제안 등록 프로세스의 전체적인 흐름을 검증하는 중요한 테스트입니다.
		
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