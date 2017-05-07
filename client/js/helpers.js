//Returns a string with the date and time
function getDateTime(){
	var today = new Date();
	var date = (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear();
	var time = today.getHours() + ":" + ("0" + today.getMinutes()).slice(-2);
	return date + " " + time;
}
//Retrieve a cookie from the users browser
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
//Set a new cookie to save information in the user's browser
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+ d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
//Generate a post documentation PDF based on the current process progress
function generatePostDoc(){
	//Get the post doc table elements
	var table = $("#post-documentation-table");
	var tableBody = $("#post-documentation-table tbody");

	//Show the table while generating post doc (needed for export to PDF to work)
	table.show();

	//Remove all html from the table
	tableBody.html("");

	//Loop through all tasks in the tree
	for(var i = 0; i < tree.length; i++){
		var task = tree[i];
		if(!task.isLeaf) continue;
		var comments = "";

		//Create a comment string with all comments from the current task
		for(var j = 0; j < task.comments.length; j++){
			comments = comments + task.comments[j].note + "<br/>";
		}

		//Add a date to the task if it is null
		if(task.date === null) task.date = getDateTime();

		//Add a new row to the table
		var html = "<tr>";

		html = html + "<td>" + task.name + "</td>";
		html = html + "<td>" + task.date + "</td>";
		html = html + "<td>98</td>";
		html = html + "<td>27.5</td>";
		html = html + "<td>98%</td>";
		html = html + "<td>120/90</td>";
		html = html + "<td>160</td>";
		html = html + "<td>None</td>";
		html = html + "<td>" + task.completed + "</td>";
		html = html + "<td>Lamoureux, Erin</td>";
		html = html + "<td>" + comments + "</td>";

		html = html + "</tr>";

		tableBody.append(html);
	}

	//Create a new HTML to PDF object
	//param (l) -- landscape
	//param (mm) -- millimeters
	var doc = new jsPDF('l', 'mm');

	//Create a canvas object from the HTML post doc table
	html2canvas($("#post-documentation-table"), {background: "white"}).then(function(canvas) {
		//Convert the HTML canvas to an image
		var imgData = canvas.toDataURL("image/jpeg", 1);
		
		//Add the image of the post doc table to the PDF
		doc.addImage(imgData, 'PNG', 0, 0);
		
		//Download the post doc PDF 
		doc.save("post-doc.pdf");

		//Hide the post doc HTML table
		table.hide();
	});
}
//Reset the colors to the defaults
function revertToDefaultColors(){

	var defaultColorSettings = [
		{value: "#CEC7C7", change: "background-color", query: "#patient-info"},
		{value: "#61B56E", change: "background-color", query: "#process-info"},
		{value: "#78F586", change: "background-color", query: ".parent-task"},
		{value: "#78F586", change: "background-color", query: ".child-task"},
		{value: "#EEEEEE", change: "background-color", query: ".child-task.completed"},
		{value: "#EEEEEE", change: "background-color", query: ".child-task.terminated"},
		{value: "16", change: "font-size", query: "*"}
	];

	//Implement each setting
	$.each(defaultColorSettings, function(i, setting){
		$(setting.query).css(setting.change, "");
		$("input[data-query='" + setting.query + "']").val(setting.value);

		if(setting.change == "background-color"){
			$("input[data-query='" + setting.query + "']").parent().colorpicker('setValue', setting.value)
		}
	});

	$('.colorpicker-component').colorpicker('update');
}
//Show a new modal window
function showModal(id, header, body, footer){
	if($("#" + id).length > 0) $("#" + id).remove();

	var outer = $('<div id="' + id + '" class="modal fade" role="dialog"></div>');
	var dialog = $('<div class="modal-dialog"></div>');
	var content = $('<div class="modal-content"></div>');

	var header = $('<div class="modal-header">' + header + '</div>');
	var body = $('<div class="modal-body">' + body + '</div>');
	var footer = $('<div class="modal-footer">' + footer + '</div>');

	content.append(header);
	content.append(body);
	content.append(footer);

	dialog.append(content);
	outer.append(dialog);

	$("body").append(outer);
	$("#" + id).modal("show");
}