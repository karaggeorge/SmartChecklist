var connection = new WebSocket('ws://localhost:8787', 'json');

connection.onopen = function () {
  console.log('Connectionned');
	sendMessage("START");
};
connection.onerror = function (error) {
  console.log('WebSocketor ' + error);
};
connection.onmessage = function (e) {
  //var textarea = document.getElementById("display");
  //textarea.value = e.data;
  console.log('received message ' + e.data);
	processLine(e.data);
};

function sendMessage(msg){
  console.log('sending message ' + msg);
  connection.send(msg);
}
function processLine(req) {
	if(req.startsWith('ITEMS ')) {
		const steps = req.substring(6);
		manageNewTasks(steps.split('|%|'));
	} else {
		console.log('Unknown request ' + req);
	}
}