bindNoteInfoButtons();

const taskExceptions = {};
const taskIds = {};
const map = {};
var taskNum = 0;
const tree = [];

const TYPES = {
	2: "Perform all of these in their specific order",
	3: "Perform all of these in any order",
	4: "Perform one of these",
};

function getTaskNameById(id) {
	var taskName;
	Object.keys(taskIds).forEach((key) => {
		if(taskIds[key] == id) taskName = key;
	});
	return taskName;
}

//Add a parent task to the process
function addParentTask(parentTaskId, task){
	const newTask = $($("#template-task").html());
	newTask.find(".parent-task-title").text(task.name);
	//newTask.find(".parent-task-sub").text(subtitle);
	if(TYPES[task.type]) {
		newTask.find(".parent-task-sub").text(TYPES[task.type]);
	}
	newTask.attr('id', task.id);
	$("#" + parentTaskId).find('.child-tasks').first().append( newTask );
	tree[task.pos].displayed = true;
}

function manageNewTasks(tasks) {
	const decodedTasks = [];
	tasks.forEach(function(task) {
		if(task) decodedTasks.push(decode(task));
	});
	console.log("New tasks we got ");
	decodedTasks.forEach(function(task) {
		console.log(task);
	});
	addToTree(decodedTasks);
	displayTasks();
}

function displayTasks() {
	for(i = 0;i < tree.length;i++){
		if(!tree[i].displayed) {
			displayTask(i);
		}
	}
}

function displayTask(i) {
	const task = tree[i];
	if(task.parentId == -1 || task.displayed) return;
	if(task.parentId == 0 && !task.displayed){
		// const newTask = $($("#template-task").html());
		// newTask.find(".parent-task-title").text(task.name);
		// newTask.attr('id', task.id);
		// $("#main-task-container").append( newTask );
		// tree[i].displayed = true;
		if(task.isLeaf) {
			addLeafTask('main-task-container', task);
		} else {
			addParentTask('main-task-container', task);
		}
	} else {
		console.log(task);
		const parent = tree[task.parentId];

		if(!parent.displayed) displayTask(parent.pos);
		if(task.isLeaf) {
			addLeafTask(parent.id, task);
		} else {
			addParentTask(parent.id, task);
		}
	}
}

function addToTree(decodedTasks) {
	// if(tree.length == 0) createTree(decodedTasks);
	// buildTree(decodedTasks, 0);
	for(mi = 0;mi < decodedTasks.length;mi++) {
		console.log("Sending:");
		console.log(decodedTasks[mi])
		addTaskToTree(decodedTasks, mi);
	}
}

function addTaskToTree(tasks, index) {
	if(map[tasks[index].name] == null) {
		console.log('Trying to add ' + tasks[index].name);
		if(tasks[index].parent === "none") {
			console.log("Adding " + tasks[index].name);
			tasks[index].parentId = -1;
			tasks[index].pos = 0;
			map[tasks[index].name] = 0;
			tree[0] = tasks[index];
			return;
		}

		console.log("Checking for parent " + tasks[index].parent);
		if(map[tasks[index].parent] == null) {
			for(i = 0;i < tasks.length;i++){
				if(tasks[i].name === tasks[index].parent) {
					addTaskToTree(tasks, i);
					break;
				}
			}
		}

		console.log("Tree size " + tree.length);
		console.log("Adding " + tasks[index].name);
		tasks[index].parentId = map[tasks[index].parent];
		tasks[index].pos = tree.length;
		map[tasks[index].name] = tree.length;
		tree.push(tasks[index]);
	}
}

function createTree(decodedTasks) {
	for(i = 0;i < decodedTasks.length;i++) {
		if(decodedTasks[i].parent === 'none') {
			tree[0] = decodedTasks[i];
			tree[0].parentId = -1;
			tree[0].pos = 0;
			// map[decodedTasks[i].name] = 0;
			taskNum = 1;
			break;
		}
	}
}

function buildTree(tasks, index) {
	const parentTask = tree[index];
	const temp = [];

	for(i = 0;i < tasks.length;i++) {
		if(tasks[i].parent === parentTask.name) {
			tasks[i].parentId = index;
			tasks[i].pos = tree.length;
			tree.push(tasks[i]);
			// map[tasks[i].name] = tree.length-1;
			buildTree(tasks, tree.length-1);
		}
	}
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
		isLeaf: parts[2] == 1,
		type: parts[2],
		parent: parts[3],
		exceptions: parts[4] ? parts[4].split('||') : null,
		displayed: false,
	}
}

function addTask(encodedTask) {
	if(!encodedTask) return;
	const task = decode(encodedTask);
	addChildTask('Steps', task, true, task);
}

//Add a child task to the specified parent task
function addLeafTask(parentTaskId, task){
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

	$("#" + parentTaskId).find('.child-tasks').first().append(newTask);
	tree[task.pos].displayed = true;
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
