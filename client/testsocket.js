var connection = new WebSocket('ws://localhost:8787', 'json');

connection.onopen = function () {
  console.log('Connectionned');

};
connection.onerror = function (error) {
  console.log('WebSocketor ' + error);
};
connection.onmessage = function (e) {
  var textarea = document.getElementById("display");
  textarea.value = e.data;
  console.log('received message ' + e.data);
};
function sendMessage(msg){
  console.log('sending message ' + msg);
  connection.send(msg);
}
