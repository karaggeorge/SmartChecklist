const host = "localhost";
const port = 8787;

//Create a new websocket connection
var connection = new WebSocket('ws://' + host + ':' + 8787, 'json');

//Prevent redirection when a form is submitted
$("form").submit(function(e) {
    e.preventDefault();
});

//Send a message to the server to start a connection
function connect(id) {
	$('#process-id').val('');
	$('#connect-error').hide();
	sendMessage("CONNECT " + id);
}

//Initiate the server processes
function initiate() {
	sendMessage("INITIATE");
}

//List all processes
function listProcess(p) {
	console.log('called');
	pickIntroPage('process');
	const list = $('#process-list');

	//Loop through all possible processes
	p.forEach(function(process) {
		const newItem = $($("#intro-list-item").html());
		newItem.text(process);

		//Add a click event listener to each process element
		newItem.click(function() {
			if(confirm('Are you sure you want to start ' + process)) {
				pickIntroPage('loading');
				sendMessage('PROCESS ' + process);
			}
		});

		list.append(newItem);
	});
}

//List all possible agents for the selected process
function listAgents(a) {
	pickIntroPage('agents');
	const list = $('#agent-list');

	//Loop through each agent
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

//Show the introduction page allowing the user to choose a process, agent
function pickIntroPage(page) {
	$('.main-page').hide();
	$('.intro').show();
	$('.intro-container').hide();
	$(`.intro-${page}`).show();
}

//Show the main process page
function pickMainPage() {
	$('.main-page').show();
	$('.intro').hide();
}

pickMainPage();

//Listener for when the connection is opened
connection.onopen = function () {
	console.log('Connected');
	sendMessage('CHECK');
};

//Listener for when the connection receives an error
connection.onerror = function (error) {
	console.log('WebSocket: ' + error);
};

//Listener for when the connection receives a new message
connection.onmessage = function (e) {
	console.log('Received Message: ' + e.data);
	processLine(e.data);
};

//Send a new message to the server
function sendMessage(msg){
	console.log('Sending Message: ' + msg);
	connection.send(msg);
}

//Set the current process ID element text 
function setProcessId(id) {
	$('#cur-process-id').html(id);
}

//Set the current agent element text
function setAgent(agent) {
	$('#cur-agent').html(agent);
}

const completedMessage = "The process was completed successfully!";
const terminatedMessage = "The process was terminated";

//Process a string received from the server
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

//Handle an error related to process ID/agent selected
function handleError(error){
	if(error == 'Process not found') {
		$('#connect-error').html('There is no process associated with that ID#').show();
	} else if(error == 'No agents available for that process') {
		$('#connect-error').html('No agents available for that process').show();
	}
}