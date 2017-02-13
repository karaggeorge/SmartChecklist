bindNoteInfoButtons();

//Add a parent task to the process
function addParentTask(title, subtitle){
	var newTask = $($("#template-task").html());
	newTask.find(".parent-task-title").text(title);
	newTask.find(".parent-task-sub").text(subtitle);

	$("#main-task-container").append( newTask );
}

//Add a child task to the specified parent task
function addChildTask(parentTaskNumber, name, completeButton, exceptionButton, infoButton, infoText){
	var newTask = $($(".child-task-template").html());
	newTask.find("h4").text(name);

	if(!completeButton) newTask.find(".check-button").hide();
	if(!exceptionButton) newTask.find(".x-button").hide();
	if(!infoButton) newTask.find(".info-button").hide();

	$(".child-tasks:eq(" + parentTaskNumber + ")").append(newTask);

	bindNoteInfoButtons();
}

// Bind the note and info buttons to open the model when clicked
function bindNoteInfoButtons(){
	$("#process-info-button").click(function(){
		$("#process-info-modal").modal("show");
	});

	$(".note-button").click(function(){
		$("#note-modal").modal("show");
	});
}

//Animate the vital information
function simulateVitals(){
	var increment = 1;

	setInterval(function(){
		var heartRateElement = $("#heart-rate");
		var current = parseInt(heartRateElement.text()) || 0;

		if(current >= 110){
			increment = -1;
		}
		else if(current < 70){
			increment = 1;
		}

		heartRateElement.text(current + increment);

	}, 1000);
}

var connection = new WebSocket('ws://localhost:8787', 'json');

connection.onopen = function () {
  console.log('Connectionned');
	sendMessage("start");
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
	if(req.startsWith('STEPS ')) {
		const steps = req.substring(6);
		addParentTask('Steps', 'Here are the steps');
		steps.split('|').forEach((step) => {
			addChildTask(0, step, true, true, true, "");
		});
	} else {
		console.log('Unknown request ' + req);
	}
}
