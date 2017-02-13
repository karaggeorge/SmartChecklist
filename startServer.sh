echo Setting Variables
path=$(pwd)
relativePath="/jWebSocket-1.0/"
export JWEBSOCKET_HOME=$path$relativePath
cd jwebsocket
echo Compiling
javac *.java
echo Executing
java ChecklistServer
