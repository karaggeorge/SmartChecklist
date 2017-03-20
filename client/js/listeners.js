//Save a note to a task
$("#save-note").on("click", function(){
	// Get the id of the task adding note to
	var taskID = $("#note-modal").attr('data-task');
	var note = $("#note-input").val();

	// Find the task in the tree
	$.each(tree, function(i, task){
		if(taskID == task.id){
			var dateTime = getDateTime();
			task.comments.push({"note": note, "datetime": dateTime});
			$("#" + taskID).find(".note-badge").text(task.comments.length).show();
		}
	});

	$("#note-input").val("");
});

$(document).on("click", ".info-button", function(){
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

$(document).on("click", ".note-button", function(){
	var taskID = $(this).parent().parent().parent().parent().attr("id");

	$("#note-modal").attr("data-task", taskID);

	// Find the task in the tree
	$.each(tree, function(i, task){
		if(taskID == task.id){
			if(task.comments){
				var list = $("<ul></ul>");

				$.each(task.comments, function(j, comment){
					list.append("<li>" + comment.note + " (" + comment.datetime.date + " " + comment.datetime.time + ")</li>");
				});

				$("#old-comments").html(list);
				$("#note-input").val("");
			}
		}
	});

	$("#note-modal").modal("show");
});

$(document).on("click", ".edit-color", function(){
	var parentID = $(this).attr("data-parent");

	$("#color-picker-modal").attr("data-element", parentID);
	$("#color-picker-modal").modal("show");
});

//When the modal is closed - Change to only when the set button is clicked
$('#color-picker-modal').on('hide.bs.modal', function(event) {
	const modal = $(this);
	var element = $("#color-picker-modal").attr("data-element");
	var color = $("#color-picker").val();

	console.log(element, color);

	$("#" + element).css("background-color", color);
});

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