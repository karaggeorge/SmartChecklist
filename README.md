# Smart Checklist

This is a web-based implementation of the Smart Checklist.

## Installation

### Complete Instructions
1. Clone or download and extract the repository
2. Download the jWebSocket Server from [here](http://cdn.jwebsocket.org/jwebsocket-1.0/jWebSocketServer-1.0.zip)
3. Add the following environment variables to your ~/.bash_profile file
  - Set JWEBSOCKET_HOME to the root directory of the jWebSocket Server (make sure you don't include a final / in this path)
  - Add to CLASSPATH the following:
    - $JWEBSOCKET_HOME/
    - $JWEBSOCKET_HOME/libs/jWebSocketServer-1.0.jar
    - $JWEBSOCKET_HOME/libs/jWebSocketServerAPI-1.0.jar
    - $JWEBSOCKET_HOME/libs/jWebSocketCommon-1.0.jar
    - the juliette-client.jar that exists in the repository under juls-and-scripts/
    - The current directory, .
  - Add to your PATH the following:
    - the juliette_server_release/bin/ directory located in the repository
4. Navigate to the repository and run the startServer.sh script
5. In a different terminal tab, run the startClient.sh script

### Simplified instructions for step 3
Add the following lines to the end of your ~/.bash_profile file

```
export JWEBSOCKET_HOME=/Users/test/Documents/jWebSocket-1.0/
export PATH=$PATH:{path_to_repo}/juliette_server_release/bin
export CLASSPATH=$CLASSPATH:.:$JWEBSOCKET_HOME:$JWEBSOCKET_HOME/libs/jWebSocketServer-1.0.jar:$JWEBSOCKET_HOME/libs/jWebSocketServerAPI-1.0.jar:$JWEBSOCKET_HOME/libs/jWebSocketCommon-1.0.jar:{path_to_repo}/juls-and-scripts/juliette-client.jar
```

Where {path_to_repo} is the path to the downloaded or cloned repository directory

Remember to source the ~/.bash_profile file or restart your terminal after setting the environment varriables
