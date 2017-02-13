echo Setting Variables
$JWEBSOCKET_HOME = jWebSocket-1.0/
echo Compiling
javac jwebsocket/*.java
echo Executing
cd jwebsocket
java ChecklistServer
