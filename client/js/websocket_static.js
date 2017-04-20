$("form").submit(function(e) {
    e.preventDefault();
});

const completedMessage = "The process was completed successfully!";
const terminatedMessage = "The process was terminated";

processLine("STARTED 75617");
processLine(`ITEMS 75617 confirm existence of blood type and screen#@#3#@#1#@#obtain patient's blood type#@#4/17/2017 10:40#@#patient blood type unavailable#@#desc1#@#typeAndScreen#%#OUT#%#laser.bt.artifacts.BloodTypeAndScreen#@# |%|obtain patient's blood type#@#1#@#0#@#perform blood transfusion process#@# #@##@# #@#typeAndScreen#%#OUT#%#laser.bt.artifacts.BloodTypeAndScreen#@# |%|perform blood transfusion process#@#1#@#2#@#none#@# #@#failed product check||wrong patient#@# #@# #@# |%|pick up blood from blood bank#@#3#@#1#@#perform blood transfusion process#@#4/17/2017 10:40#@##@# #@#typeAndScreen#%#IN#%#laser.bt.artifacts.BloodTypeAndScreen||bloodProduct#%#OUT#%#laser.bt.artifacts.BloodProduct#@# |%|identify patient#@#3#@#1#@#perform bedside checks#@#4/17/2017 10:40#@#wrong patient#@# #@# #@# |%|perform bedside checks#@#1#@#2#@#perform blood transfusion process#@# #@#failed product check||wrong patient#@# #@#bloodProduct#%#IN#%#laser.bt.artifacts.BloodProduct#@# |%|check product info match patient info#@#3#@#1#@#check blood product#@#4/17/2017 10:40#@#failed product check#@# #@#bloodProduct#%#IN#%#laser.bt.artifacts.BloodProduct#@# |%|check expiration date#@#1#@#1#@#check blood product#@# #@#failed product check#@# #@#bloodProduct#%#IN#%#laser.bt.artifacts.BloodProduct#@# |%|check blood product#@#1#@#3#@#perform bedside checks#@# #@#failed product check#@# #@#bloodProduct#%#IN#%#laser.bt.artifacts.BloodProduct#@# |%|`);

pickMainPage();

function listProcess(p) {
	console.log('called');
	pickIntroPage('process');
	const list = $('#process-list');

	p.forEach(function(process) {
		const newItem = $($("#intro-list-item").html());
		newItem.text(process);
		newItem.click(function() {
			if(confirm('Are you sure you want to start ' + process)) {
				pickIntroPage('loading');
				sendMessage('PROCESS ' + process);
			}
		});
		list.append(newItem);
	});
}
function listAgents(a) {
	pickIntroPage('agents');
	const list = $('#agent-list');
	a.forEach(function(agent) {
		const newItem = $($("#intro-list-item").html());
		newItem.text(agent);
		newItem.click(function() {
			if(confirm('Are you sure you want to select ' + agent)) {
				pickMainPage();
				setAgent(agent);
				sendMessage('AGENT ' + agent);
			}
		});
		list.append(newItem);
	});
}
function pickIntroPage(page) {
	$('.main-page').hide();
	$('.intro').show();
	$('.intro-container').hide();
	$(`.intro-${page}`).show();
}
function pickMainPage() {
	$('.main-page').show();
	$('.intro').hide();
}
function sendMessage(msg){
	console.log('Sending Message: ' + msg);
	connection.send(msg);
}
function setProcessId(id) {
	$('#cur-process-id').html(id);
}
function setAgent(agent) {
	$('#cur-agent').html(agent);
}
function processLine(req) {
	if(req.startsWith('ERR ')) {
		handleError(req.substring(4));
	} else if(req == 'NEW') {
		pickIntroPage('start');
	} else if(req.startsWith('STARTED ')) {
		pickMainPage();
	} else if(req == 'INITIATED') {
		sendMessage('LIST');
	} else if (req.startsWith('LIST ')) {
		listProcess(req.substring(5).split('||'));
	} else if (req.startsWith('AGENTS ')) {
		listAgents(req.substring(7).split('||'));
	} else if(req == 'QUIT') {
		location.reload();
	} else if(req.startsWith('ITEMS ')) {
		pickMainPage();
		setProcessId(req.substring(6,11));
		const steps = req.substring(12);
		manageNewTasks(steps.split('|%|'));
	} else if(req.startsWith('END ')) {

		var completed = req.substring(4) === "true";

		if(completed){
			showModal("completed-modal", "<h4>Process Finished</h4>", completedMessage, "<button class='btn btn-default' data-dismiss='modal'>Close</button>");
			$("#process-status").text("Completed");
		}
		else{
			showModal("completed-modal", "<h4>Process Finished</h4>", terminatedMessage, "<button class='btn btn-default' data-dismiss='modal'>Close</button>");
			$("#process-status").text("Terminated");
		}
	} else if(req == " ") {
		console.log("Request Acknowledged");
	} else {
		console.error('Unknown Request: ' + req);
	}
}
function handleError(error) {
	if(error == 'Process not found') {
		$('#connect-error').html('There is no process associated with that ID#').show();
	} else if(error == 'No agents available for that process') {
		$('#connect-error').html('No agents available for that process').show();
	}
}