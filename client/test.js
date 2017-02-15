var connection = new WebSocket('ws://localhost:8787', 'json');

connection.onopen = function () {
  console.log('Connectionned');

};
connection.onerror = function (error) {
  console.log('WebSocketor ' + error);
};
connection.onmessage = function (e) {
  console.log("Received " + e.data);
};
function sendMessage(msg){
  console.log('sending message ' + msg);
  connection.send(msg);
}
