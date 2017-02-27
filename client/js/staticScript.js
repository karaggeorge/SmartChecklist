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
		description: parts[5],
		comments: [],
		date: null
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
			$(this).parent().parent().parent().parent().find(".time").html(getDateTime());

			tree[task.pos].date = getDateTime();

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

function getDateTime(){
	var today = new Date();
	var date = (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear();
	var time = today.getHours() + ":" + today.getMinutes();
	return date + " " + time;
}

// Bind the note and info buttons to open the model when clicked
function bindNoteInfoButtons(){
	// $("#process-info-button").click(function(){
	// 	$("#process-info-modal").modal("show");
	// });

	$(".info-button").click(function(){
		var taskID = $(this).parent().parent().parent().parent().attr("id");

		// Find the task in the tree
		$.each(tree, function(i, task){
			if(taskID == task.id){
				$("#description-modal .modal-title").text(task.name);
				if(task.description){
					$("#description-text").text(task.description);
				}
				else{
					$("#description-text").text("No description found");
				}
			}
		});

		$("#description-modal").modal("show");
	});

	$(".note-button").click(function(){
		var taskID = $(this).parent().parent().parent().parent().attr("id");

		$("#note-modal").attr("data-task", taskID);

		// Find the task in the tree
		$.each(tree, function(i, task){
			if(taskID == task.id){
				if(task.comments){
					var list = $("<ul></ul>");

					$.each(task.comments, function(j, comment){
						list.append("<li>" + comment + "</li>");
					});

					$("#old-comments").html(list);
					$("#note-input").val("");
				}
			}
		});

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

function generatePostDoc(){
	// var doc = new jsPDF('p', 'mm');
	// html2canvas($("body"), {background: "white"}).then(function(canvas) {
	// 	// only jpeg is supported by jsPDF
	// 	var imgData = canvas.toDataURL("image/jpeg", 0.6);
	// 	doc.addImage(imgData, 'PNG', 0, 0);
	// 	doc.save("download.pdf");
	// });

	var table = $("<table class='table'></table>");
	var row = $("<tr></tr>");
	var cell = $("<td></td>");

	$.each(tree, function(i, task){
		
		var newRow = row;



	});


	var myWindow = window.open("", "Post Documentation", "width=600,height=600");
	myWindow.document.write("<p>This is 'MsgWindow'. I am 200px wide and 100px tall!</p>");
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
});

$("#save-note").on("click", function(){
	// Get the id of the task adding note to
	var taskID = $("#note-modal").attr('data-task');
	var note = $("#note-input").val();

	// Find the task in the tree
	$.each(tree, function(i, task){
		if(taskID == task.id){
			task.comments.push(note + "		<b>(" + getDateTime() + ")</b>");
		}
	});

	$("#note-input").val("");
});

const staticSteps = "confirm existence of blood type and screen#@#1#@#1#@#obtain patient's blood type#@#patient blood type unavailable#@#Ensure the blood type is known|%|obtain patient's blood type#@#1#@#0#@#perform blood transfusion process#@#|%|perform blood transfusion process#@#1#@#2#@#none#@#failed product check||wrong patient|%|pick up blood from blood bank#@#3#@#1#@#perform blood transfusion process#@#|%|identify patient#@#3#@#1#@#perform bedside checks#@#wrong patient|%|perform bedside checks#@#1#@#2#@#perform blood transfusion process#@#failed product check||wrong patient|%|check product info match patient info#@#3#@#1#@#check blood product#@#failed product check|%|check expiration date#@#3#@#1#@#check blood product#@#failed product check|%|check blood product#@#1#@#3#@#perform bedside checks#@#failed product check|%|infuse blood#@#3#@#1#@#perform blood transfusion process#@#|%|";
manageNewTasks(staticSteps.split('|%|'));
