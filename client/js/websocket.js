var connection = new WebSocket('ws://localhost:8787', 'json');

connection.onopen = function () {
  console.log('Connectionned');
	sendMessage("START");
};
connection.onerror = function (error) {
  console.log('WebSocketor ' + error);
};
connection.onmessage = function (e) {
  console.log('received message ' + e.data);
	processLine(e.data);
};

function sendMessage(msg){
  console.log('sending message ' + msg);
  connection.send(msg);
}

const completedMessage = "The process was completed successfully!";
const terminatedMessage = "The process was terminated";

function processLine(req) {
	if(req.startsWith('ITEMS ')) {
		const steps = req.substring(6);
		manageNewTasks(steps.split('|%|'));
	} else if(req.startsWith('END ')) {
    const result = req.substring(4) === "true" ? completedMessage : terminatedMessage;
    alert(result);
  } else {
		console.log('Unknown request ' + req);
	}
}
