const taskExceptions = {};
const taskIds = {};
const map = {};
var taskNum = 0;
const tree = [];

//Object containing the description for different task types
const TYPES = {
	2: "Perform all of these in their specific order",
	3: "Perform all of these in any order",
	4: "Perform one of these",
};

//Given a task ID, reutrn the name associated with the task
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
	if(TYPES[task.type]) {
		newTask.find(".parent-task-sub").text(TYPES[task.type]);
	}
	newTask.attr('id', task.id);
	$("#" + parentTaskId).find('.child-tasks').first().append( newTask );
	tree[task.pos].displayed = true;
}

//Add new tasks to the current list of tasks
function manageNewTasks(tasks) {
	const decodedTasks = [];
	tasks.forEach(function(task) {
		if(task) decodedTasks.push(decode(task));
	});
	console.log("New tasks we received:");

	decodedTasks.forEach(function(task) {
		console.log(task);
	});

	addToTree(decodedTasks);
	displayTasks();
}

//Make sure all tasks are displayed in the tree
function displayTasks() {
	for(i = 0;i < tree.length;i++){
		if(!tree[i].displayed) {
			displayTask(i);
		}
	}
}

//Display a specific task on the UI
function displayTask(i) {
	const task = tree[i];
	if(task.parentId == -1 || task.displayed) return;
	if(task.parentId == 0 && !task.displayed){

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

//Add a new tasks to the tree variable
function addToTree(decodedTasks) {
	for(mi = 0;mi < decodedTasks.length;mi++) {
		console.log("Sending:");
		console.log(decodedTasks[mi])
		addTaskToTree(decodedTasks, mi);
	}
}

//Add an individual task to the tree variable
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

//Decode all of the artifacts received from the server
//and add each to the artifacts array
function decodeArtifacts(encodedArtifacts) {
	const parts = encodedArtifacts.split("||");
	const artifacts = [];
	parts.forEach(function(part) {
		const newParts = part.split("#%#");
		newArtifact = {
			name: newParts[0],
			type: newParts[1],
			class: newParts[2],
		};
		artifacts.push(newArtifact);
	});

	return artifacts;
}

//Decode a task received from the server and return an object with it's information
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
		date: parts[4] != " " ? parts[4] : null,
		parent: parts[3],
		exceptions: parts[5] ? parts[5].split('||') : null,
		displayed: false,
		description: parts[6] != " " ? parts[6] : null,
		artifacts: parts[7] != " " ? decodeArtifacts(parts[7]) : [],
		comments: parts[8] != " " ? parts[8].split('||').map(function(comment) {
			const parts = comment.split('#%#');
			return {"note": parts[0], "datetime": parts[1]};
		}) : [],
	}
}

//Add a child task to the specified parent task
function addLeafTask(parentTaskId, task){
	const newTask = $($(".child-task-template").html());

	newTask.find("h4").text(task.name);
	newTask.attr('id', task.id);
	newTask.find(".time").html(task.date ? task.date : " ");
	if(task.comments.length) newTask.find(".note-badge").text(task.comments.length).show();

	newTask.find('[data-toggle="popover"]').popover();
	var artifactString = "";
	task.artifacts.forEach(function(artifact) {
		artifactString += artifact.name + ", ";
	});
	newTask.find('[data-toggle="popover"]').attr("data-content",artifactString);

	if(task.completed) {
		newTask.addClass('completed');
	}
	else if(task.terminated) {
		newTask.addClass('terminated');
	} else {

		newTask.find(".check-button").click(function () {
			$(this).parents('.child-task').addClass('completed');
			const date = getDateTime();
			$(this).parents('.child-task').find(".time").html(date);

			sendMessage("COMPLETE " + task.name + "#@#" + date);
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
}