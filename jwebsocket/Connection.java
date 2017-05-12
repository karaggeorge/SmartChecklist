
public class Connection {

  private String sessionId;
  private boolean initiated;
  private ProcessHub hub;
  private ChecklistProcess process;
  private boolean hasName;
  private String agentName;

  public Connection(ProcessHub hub, String sessionId) {
    System.out.println("Creating new connection");
    this.hub = hub;
    this.sessionId = sessionId;
    this.initiated = false;
    this.hasName = false;
  }

  public boolean checkSessionId(String sessionId) {
    return this.sessionId.equals(sessionId);
  }

  public String getProcessId() {
    if(this.process != null) return this.process.getId();
    return "";
  }

  public ChecklistProcess getProcess() {
    return this.process;
  }

  public String processRequest(String request) {
    if(request.equals("CHECK")) {
      if(!this.initiated) return "NEW";
      else return this.initiate();
    } else if(request.equals("PULL")) {
      return process.processRequest(this.agentName, "START");
    } else if(request.startsWith("CONNECT ")) {
      return hub.mergeConnections(this.sessionId, request.substring(8));
    } else if(request.equals("INITIATE")) {
      return initiate();
    } else if(request.equals("QUIT")) {
      hub.removeConnection(this.sessionId);
      return "QUIT";
    } else if(request.startsWith("AGENT ")) {
      return setAgentName(request.substring(6));
    } else if(this.initiated) {
      if(this.hasName) return process.processRequest(this.agentName, request);
      else return process.processRequest(request);
    } else {
      return "Process Not Initiated";
    }
  }

  public void setProcess(ChecklistProcess cp) {
    this.process = cp;
    this.initiated = true;
  }

  public String setAgentName(String name) {
    this.hasName = true;
    this.agentName = name;
    return "STARTED " + this.process.getId();
  }

  public String getAgentName() {
    if(this.hasName) return this.agentName;
    else return "";
  }

  private String initiate() {
    if(this.initiated) {
      if(!this.process.hasStarted()) {
        return process.processRequest("LIST");
      } else if(!this.hasName) {
        return process.getAgentsList();
      } else {
        return "STARTED " + this.process.getId();
      }
    } else {
      this.process = hub.startProcess(this);
      this.initiated = true;
      return "INITIATED";
    }
  }

}
