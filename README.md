# Smart Checklist

This is a web-based implementation of the smart checklists for guiding process performers.

## Full Overview and Demo Presentation

This is our [Capstone Demo Presentation]( http://capture.quinnipiac.edu/recordings/GKaragkiaouris/SER_Final_Demo/SER_Final_Demo_-_20170503_134924_15.html)

## Installation Guide:
1. Make sure you are logged in as an administrator on your computer; otherwise the script executed from the Java code might not have permission to run.
2. Clone (or download and extract) this repository
3. Download the jWebSocket Server from [here](http://cdn.jwebsocket.org/jwebsocket-1.0/jWebSocketServer-1.0.zip)
4. Modify your ~/.bash_profile file as follows to add some new amd modify existing environment variables:
  - Add a JWEBSOCKET_HOME variable and set it to the root directory of the jWebSocket Server that was dowloaded in the previous step. For example: <br>
  ``` export JWEBSOCKET_HOME=/Users/test/Documents/jWebSocket-1.0/ ```
  - Add to the CLASSPATH variable the following directories:
    - The current directory '.'
    - $JWEBSOCKET_HOME/
    - $JWEBSOCKET_HOME/libs/jWebSocketServer-1.0.jar
    - $JWEBSOCKET_HOME/libs/jWebSocketServerAPI-1.0.jar
    - $JWEBSOCKET_HOME/libs/jWebSocketCommon-1.0.jar
    - the juliette-client.jar that exists in the repository under juls-and-scripts/    
    &nbsp;&nbsp;&nbsp;&nbsp; You can use the following command: <br>
   ```
export CLASSPATH=$CLASSPATH:.:$JWEBSOCKET_HOME:$JWEBSOCKET_HOME/libs/jWebSocketServer-1.0.jar:$JWEBSOCKET_HOME/libs/jWebSocketServerAPI-1.0.jar:$JWEBSOCKET_HOME/libs/jWebSocketCommon-1.0.jar:{path_to_repo}/juls-and-scripts/juliette-client.jar
```
&nbsp;&nbsp;&nbsp;&nbsp; where {path_to_repo} is the path to the directory on your machine where this repository was cloned (or downloaded)
  - Add to the PATH variable the juliette_server_release/bin/ directory located in the repository. You can use the following command:<br>
  ``` export PATH=$PATH:{path_to_repo}/juliette_server_release/bin ```
  - Remember to source the ~/.bash_profile file or restart your terminal after setting the environment varriables
  
  &nbsp;&nbsp;&nbsp;&nbsp; A sumamry of step 4: Add the following lines to the end of your ~/.bash_profile file and then source the ~/.bash_profile file or restart your terminal
  ```
  export JWEBSOCKET_HOME={path_to_jWebSockerServer_root_directory}
  export CLASSPATH=$CLASSPATH:.:$JWEBSOCKET_HOME:$JWEBSOCKET_HOME/libs/jWebSocketServer-1.0.jar:$JWEBSOCKET_HOME/libs/jWebSocketServerAPI-1.0.jar:$JWEBSOCKET_HOME/libs/jWebSocketCommon-1.0.jar:{path_to_repo}/juls-and-scripts/juliette-client.jar
  export PATH=$PATH:{path_to_repo}/juliette_server_release/bin
  ```
  
## Running the application:
1. Navigate to the directory where this repository was cloned (downloaded to) and run the startServer.sh script from the terminal.
2. Wait until the Mercutio server has started (a "Mercution Server Running" message should appear on the terminal)
3. In a different terminal tab, run the startClient.sh script or open the client/index.html file with your preferred browser (Chrome and Firefox tend to work better than other browsers)

- If you have problems starting the application (for example, only a "Loading" message appears in the browser after running the startClient.sh script or you get in the terminal window a log mesage "Finished Script" before the agents are initiated), follow these steps:
  - Terminate the server (Ctrl-C)
  - Kill all java commands (pkill "java")
  - Navigate to the juls-and-scripts directory
  - Run the runProccess-juld.sh script and let it finish (it takes a couple of seconds)
  - When you see no change in the output, kill that script (Ctrl-C)
  - Go back to step 1 above and run the application from scratch


## Running the application on different machines:
1. Install the application on a client machine (this is a different machine from the "server machine" that is running the Mercutio server. The server machine is the one where the startServer.sh script is executed). Follow the installation instructions in this README file.
2. In the client machine, go to the client/js/websocket.js file and change the value of the variable "host" from "localhost" to the IP address of the server machine.
3. Open the client/index.html file on the client machine or run the startClient.sh script (this step assumes that the Mercutio server is already running on the server machine)


## Using the web-based smart checklists system
1. After the server has started and the client is connected, you are presented with a screen where you can either start a new process or connect to an existing one
2. If you have a process id of an existing process, you can enter that in the field and connect to that process. You will be presented with a list of the remaining agents or presented with a message that there are no agents available if all agents have already been taken
3. If you start a new process, you will be presented with a list of available processes to pick from.
4. After you select a process, the system will initiate the process and after a short delay you will be presented with a list of agents to pick from.
5. After selecting an agent, a list of the current tasks to complete for that agent will be presented along with the process id of the current process on the top left of the screen.
6. To complete a step, you click on the green checkmark
7. To terminate a step, you click on the red x, then pick one or more exceptions that happened and then click terminate.
8. When the process is completed or terminated, you will be notified with a pop-up dialogue.


## Notes for developers

- Turning on and off log messages printed on the terminal
   1. Go to the jWebScocket installation folder and go under conf/log4j.xml
   2. Search for "developmentLog" and change the value to "off"
- As of right now, you can only run one Process at a time
- NOTE: If you already have the juliette server release installed on your machine, you will need to either remove that from your PATH and add the one in this repository instead, or go to the jul script and change line 44 from `CLIENT_CLASSPATH="-cp ${LIBDIR}/juliette-client.jar"` to `CLIENT_CLASSPATH="-cp ${LIBDIR}/juliette-client.jar:$CLASSPATH"`

### Main structure of the web-based smart checklists application
1. The server is located in the jwebsocket folder
  - The ChecklistServer class is the main class that is being ran
  - The Listener class is where the connections are being accepted
  - The ProcessHub class is where the Connections and Processes are being managed
  - Each Connection is connected to one agent
  - Each Process contains Connections mapped to agents and represents one process
  - Each Process uses one instance of JulietteInitiator to initiate Juliette
  - The Item class contains the information for a step
  - The ServerControler is the bridge between a Connection and the MercutioClient
2. The agent code is located in the agents folder
  - The Nurse class initiates an Agent with the Handler
  - The Handler class detecs when a new item is being posted and communicates that to the ClientControler
  - The ClientControler is the main bridge between juliette and the MercutioClient
  - The MercutioClient class is the socket class that communicates with MercutioServer
3. The client code is located in the client folder
  - The html files are located in the directory
  - The stylesheets are located under css/
  - The images are located under img/
  - The javascript files are located under js/
    - Under vendor/ are the js files for the external tools that are used
    - The rest of the js files contain the code that handles parts of the frontent:
      - The websocket.js file contains the connection with the jwebsocket server
      - The listeners.js contain the jQuery event listeners
      - The helpers.js contain helper js classes that are used elsewhere in the site
      - The addTasks.js manages the addition of new parent and leaf tasks to the front-end
4. To add a new Little-JIL process in the software, just place the jul file of the process you want to add in the juls-and-scripts/juls directory. You don't need to restart the server for this to take effect. Simply refreshing the client should show the updated list.




