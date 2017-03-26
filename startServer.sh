echo Compiling Agents
javac agents/*.java

jar cf SmartChecklistAgents.jar -C . agents/
mv -f SmartChecklistAgents.jar juls-and-scripts/bin/SmartChecklistAgents.jar
echo Built

echo Compiling JWebSocket
cd jwebsocket
javac *.java

echo Executing
java ChecklistServer
cd ..
