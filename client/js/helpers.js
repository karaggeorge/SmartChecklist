function getDateTime(){
	var today = new Date();
	var date = (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear();
	var time = today.getHours() + ":" + ("0" + today.getMinutes()).slice(-2);
	return date + " " + time;
}
function getDateTimeObject(){
	var dateObj = {};
	var today = new Date();
	dateObj["date"] = (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear();
	dateObj["time"] = today.getHours() + ":" + today.getMinutes();
	return dateObj;
}
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
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+ d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function generatePostDoc(){
	var table = $("#post-documentation-table");
	var tableBody = $("#post-documentation-table tbody");

	table.show();
	tableBody.html("");

	for(var i = 0; i < tree.length; i++){
		var task = tree[i];
		if(!task.isLeaf) continue;
		var comments = "";

		for(var j = 0; j < task.comments.length; j++){
			comments = comments + task.comments[j].note + "<br/>";
		}

		if(task.date === null) task.date = getDateTime();

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


	var doc = new jsPDF('l', 'mm');

	html2canvas($("#post-documentation-table"), {background: "white"}).then(function(canvas) {
		var imgData = canvas.toDataURL("image/jpeg", 1);
		doc.addImage(imgData, 'PNG', 0, 0);
		doc.save("post-doc.pdf");

		table.hide();
	});
}
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
		$(setting.query).css(setting.change, setting.value);
		$("input[data-query='" + setting.query + "']").val(setting.value);

		if(setting.change == "background-color"){
			$("input[data-query='" + setting.query + "']").parent().colorpicker('setValue', setting.value)
		}
	});

	$('.colorpicker-component').colorpicker('update');
}
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