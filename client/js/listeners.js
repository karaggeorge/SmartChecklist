//Initialize the color picker used in the settings menu
$('.colorpicker-component').colorpicker();

//Initialize all Bootstrap tooltips (used for the exception hover)
$("[data-toggle=tooltip]").tooltip();

//Retrieve all display settings from the cookie and reimplement them
$(document).ready(function(){
	//Make sure the cookie exists
	if(getCookie("sc-settings")){

		//Get the object array
		var settings = JSON.parse(getCookie("sc-settings"));

		//Implement each setting
		$.each(settings, function(i, setting){
			$(setting.query).css(setting.change, setting.value);
			$("[data-query='" + setting.query + "']").setColor(setting.value);

			if(setting.change == "background-color"){
				$("input[data-query='" + setting.query + "']").parent().colorpicker('setValue', setting.value)
			}
		});
	}
});

//Revert the settings to the defaults
$("#colors-to-default").on("click", function(){
	revertToDefaultColors();
	$('#color-picker-modal').modal("hide");
});

//Retrieve the settings from the settings modal and change the element colors appropriately
$("#set-colors").click(function(){
	var modal = $('#color-picker-modal');
	var inputs = modal.find("input");
	var saveData = [];

	$.each(inputs, function(i, input){
		input = $(input);

		var query = input.attr("data-query");
		var change = input.attr("data-change");
		var value = input.val();

		saveData.push({
			"query": query,
			"change": change,
			"value": value
		});

		if(change == "font-size") value += "px";
		if(query && change) $(query).css(change, value);
	});

	setCookie("sc-settings", JSON.stringify(saveData), 1);
});

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
			sendMessage("COMMENT " + task.name + "#@#" + note + "#@#" + dateTime);
			$("#" + taskID).find(".note-badge").text(task.comments.length).show();
		}
	});

	$("#note-input").val("");
});

//Show the task description when the info button is clicked
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

//Open the note modal when the note icon is clicked
$(document).on("click", ".note-button", function(){
	var taskID = $(this).parent().parent().parent().parent().attr("id");

	$("#note-modal").attr("data-task", taskID);

	// Find the task in the tree
	$.each(tree, function(i, task){
		if(taskID == task.id){
			if(task.comments){
				var list = $("<ul></ul>");

				$.each(task.comments, function(j, comment){
					list.append("<li>" + comment.note + " (" + comment.datetime + ")</li>");
				});

				$("#old-comments").html(list);
				$("#note-input").val("");
			}
		}
	});

	$("#note-modal").modal("show");
});

//Open the settings menu when the settings icon is clicked
$(document).on("click", "#settings-btn", function(){
	$("#color-picker-modal").modal("show");
});

//Collapse the current child tasks when the chevron icon is clicked on a parent task
$(document).on("click", ".parent-chevron", function(){
	var childTasks = $(this).parent().next();

	if(childTasks.is(":visible")){
		childTasks.slideUp(500);
		$(this).removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
	}
	else{
		childTasks.slideDown(500);
		$(this).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
	}
});

//When the exception modal is shown
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
//When the exception modal is hidden
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
		const date = getDateTime();
		sendMessage("TERMINATE " + taskName + "#@#" + exceptionsThrown.join('||') + "#@#" + date);
		const taskElement = $('#'+taskIds[taskName]);

		taskElement.find(".failed").attr("data-toggle", "tooltip");
		taskElement.find(".failed").attr("title", exceptionsThrown.join(","));
		$('[data-toggle="tooltip"]').tooltip(); 
		taskElement.addClass('terminated');
		taskElement.find(".time").html(date);
		modal.modal('hide');
	}
});