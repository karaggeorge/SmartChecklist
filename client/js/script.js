bindNoteInfoButtons();

//Add a parent task to the process
function addParentTask(title, subtitle){
	var newTask = $($("#template-task").html());
	newTask.find(".parent-task-title").text(title);
	//newTask.find(".parent-task-sub").text(subtitle);
	newTask.attr('id', title);

	$("#main-task-container").append( newTask );
}

function decode(encodedTask) {
	const parts = encodedTask.split('#@#');
	return {
		name: parts[0],
		completed: parts[1] == 3,
	}
}

function addTask(encodedTask) {
	if(!encodedTask) return;
	const task = decode(encodedTask);
	addChildTask('Steps', task.name, task.completed, true, true, task);
}

//Add a child task to the specified parent task
function addChildTask(parentTask, name, completed, exceptionButton, infoButton, infoText){
	var newTask = $($(".child-task-template").html());
	newTask.find("h4").text(name);
	newTask.attr('id', name);
	if(completed) newTask.addClass('completed');
	else {
		newTask.find(".check-button").click(function () {
			const task = $(this).parents('.child-task');
			task.addClass('completed');
			sendMessage("COMPLETE " + name);
		});
		if(!exceptionButton) newTask.find(".x-button").hide();
	}

	if(!infoButton) newTask.find(".info-button").hide();

	$("#" + parentTask).find('.child-tasks').append(newTask);

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
	addParentTask('Steps', 'Here are the steps');
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
		steps.split('|%|').forEach((step) => {
			addTask(step);
		});
	} else {
		console.log('Unknown request ' + req);
	}
}
