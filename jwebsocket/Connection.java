
public class Connection {

  private String sessionId;
  private boolean initiated;
  private ProcessHub hub;
  private Process process;
  private boolean hasId;
  private int id;

  public Connection(ProcessHub hub, String sessionId) {
    this.hub = hub;
    this.sessionId = sessionId;
    this.initiated = false;
    this.hasId = false;
  }

  public boolean checkSessionId(String sessionId) {
    return (sessionId == this.sessionId);
  }

  public String processRequest(String request) {
    if(request.equals("INITIATE")) {
      return initiate();
    } else if(this.initiated) {
      if(this.hasId) return process.processRequest(this.id, request);
      else return process.processRequest(request);
    }
  }

  public void setId(int id) {
    this.hasId = true;
    this.id = id;
  }

  private initiate() {
    if(this.initiated) {
      return "Process already started";
    } else {
      this.process = hub.startProcess(this);
      return "INITIATED";
    }
  }

}
