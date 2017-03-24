var connection = new WebSocket('ws://localhost:8787', 'json');

$('.colorpicker-component').colorpicker();

connection.onopen = function () {
	console.log('Connected');
	sendMessage("START");
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

const completedMessage = "The process was completed successfully!";
const terminatedMessage = "The process was terminated";

function processLine(req) {
	if(req.startsWith('ITEMS ')) {
		const steps = req.substring(6);
		manageNewTasks(steps.split('|%|'));
	} else if(req.startsWith('END ')) {

		var completed = req.substring(4) === "true";

		if(completed){
			alert(completedMessage);
			$("#process-status").text("Completed");
		}
		else{
			alert(terminatedMessage);
			$("#process-status").text("Terminated");
		}
	} else if(req.equals(" ")) {
		console.log("Request Acknowledged");
	} else {
		console.error('Unknown Request: ' + req);
	}
}
