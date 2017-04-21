var connection = new WebSocket('ws://localhost:8787', 'json');

$("form").submit(function(e) {
    e.preventDefault();
});

function connect(id) {
	$('#process-id').val('');
	$('#connect-error').hide();
	sendMessage("CONNECT " + id);
}

function initiate() {
	sendMessage("INITIATE");
}

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

pickMainPage();

connection.onopen = function () {
	console.log('Connected');
	// pickIntroPage('start');
	sendMessage('CHECK');
	// sendMessage("INITIATE");
	// setTimeout(function () {
	//
	// }, 1000);
};
connection.onerror = function (error) {
	console.log('WebSocket: ' + error);
};
connection.onmessage = function (e) {
	console.log('Received Message: ' + e.data);
	processLine(e.data);
};

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

const completedMessage = "The process was completed successfully!";
const terminatedMessage = "The process was terminated";

function processLine(req) {
	if(req.startsWith('ERR ')) {
		handleError(req.substring(4));
	} else if(req == 'NEW') {
		pickIntroPage('start');
	} else if(req.startsWith('STARTED ')) {
		pickMainPage();
		setProcessId(req.substring(8));
		sendMessage('PULL');
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
