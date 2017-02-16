bindNoteInfoButtons();

const taskExceptions = {};
const taskIds = {};
var taskNum = 0;

function getTaskNameById(id) {
	var taskName;
	Object.keys(taskIds).forEach((key) => {
		if(taskIds[key] == id) taskName = key;
	});
	return taskName;
}

//Add a parent task to the process
function addParentTask(title, subtitle){
	const newTask = $($("#template-task").html());
	newTask.find(".parent-task-title").text(title);
	//newTask.find(".parent-task-sub").text(subtitle);
	newTask.attr('id', title);

	$("#main-task-container").append( newTask );
}

function decode(encodedTask) {
	const parts = encodedTask.split('#@#');
	taskIds[parts[0]] = "task-id-" + taskNum;
	taskNum++;
	return {
		id: taskIds[parts[0]],
		name: parts[0],
		completed: parts[1] == 3,
		terminated: parts[1] == 4,
		exceptions: parts[2] ? parts[2].split('||') : null,
	}
}

function addTask(encodedTask) {
	if(!encodedTask) return;
	const task = decode(encodedTask);
	addChildTask('Steps', task, true, task);
}

//Add a child task to the specified parent task
function addChildTask(parentTask, task, infoButton, infoText){
	console.log(task);
	const newTask = $($(".child-task-template").html());

	newTask.find("h4").text(task.name);
	newTask.attr('id', task.id);

	if(task.completed) {
		newTask.addClass('completed');
	}
	else if(task.terminated) {
		newTask.addClass('terminated');
	} else {

		newTask.find(".check-button").click(function () {
			$(this).parents('.child-task').addClass('completed');
			sendMessage("COMPLETE " + task.name);
		});

		if(!task.exceptions) {
			newTask.find(".x-button").hide();
		} else {
			taskExceptions[task.name] = task.exceptions;
			newTask.find(".x-button").attr('id', task.id);
		}

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


//Modals

//Exceptions Modal
$('#exception-modal').on('show.bs.modal', function(event) {
	const button = $(event.relatedTarget);
	const taskId = button.attr('id');
	const taskName = getTaskNameById(taskId);
	const modal = $(this);
	const exceptionList = modal.find('.modal-exception-list');
	const newException = $($("#template-exception").html());

	modal.find('#modal-task').text(taskName);
	exceptionList.attr('id', taskName);

	newException.click(function() {
		$(this).toggleClass('active');
	});

	exceptionList.empty();
	console.log(taskName);
	taskExceptions[taskName].forEach(function(exception) {
		newException.attr('id', exception);
		newException.text(exception);
		exceptionList.append(newException);
	});
});

$('#exception-modal').on('hide.bs.modal', function(event) {
	const modal = $(this);
	modal.find('.modal-exception-list').empty().removeAttr('id');
	modal.find('#modal-task').empty();
});

$('#exception-modal #terminate').on('click', function() {
	const exceptionsThrown = [];
	const modal = $('#exception-modal');
	const exceptionList = modal.find('.modal-exception-list');
	const taskName = exceptionList.attr('id');

	exceptionList.find('.exception-item').each(function(index) {
		if($(this).hasClass('active')) {
			exceptionsThrown.push(this.id);
		}
	});

	if(exceptionsThrown.length == 0) {
		alert("You need to select at least one");
	} else {
		sendMessage("TERMINATE " + taskName + "#@#" + exceptionsThrown.join('||'));
		const taskElement = $('#'+taskIds[taskName]);
		taskElement.addClass('terminated');
		modal.modal('hide');
	}
})


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
