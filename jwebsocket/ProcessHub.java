
import java.util.ArrayList;
import java.util.Random;

public class ProcessHub {

  private ArrayList<Connection> connections;
  private ArrayList<ChecklistProcess> processes;
  private MercutioServer mercutio;
  private ArrayList<String> processIds;
  private Random rand = new Random();


  public ProcessHub(MercutioServer mercutio) {
    this.connections = new ArrayList<Connection> ();
    this.processes = new ArrayList<ChecklistProcess> ();
    this.processIds = new ArrayList<String> ();
    this.mercutio = mercutio;
  }

  public void addConnection(String sessionId) {
    if(!connectionExists(sessionId)) {
      this.connections.add(new Connection(this, sessionId));
    }
  }

  public void removeConnection(String sessionId) {
    for(Connection c : this.connections) {
      if(c.checkSessionId(sessionId)) {
        c.getProcess().removeConnection(c);
        connections.remove(c);
        break;
      }
    }
  }

  public String mergeConnections(String sessionId, String processId) {
    for(ChecklistProcess cp : this.processes) {
      if(cp.checkId(processId)) {
        for(Connection c : this.connections) {
          if(c.checkSessionId(sessionId)) {
            return cp.addConnection(c);
          }
        }
        return "ERR Connection not found";
      }
    }
    return "ERR Process not found";
  }

  public String processRequest(String sessionId, String request){
    String response = "";

    for(Connection c : this.connections) {
      if(c.checkSessionId(sessionId)) {
        response = c.processRequest(request);
        break;
      }
    }

    return response;
  }

  public ChecklistProcess startProcess(Connection connection) {
    ChecklistProcess process = new ChecklistProcess(connection, this.mercutio, this);
    this.processes.add(process);
    return process;
  }

  public void removeProcess(ChecklistProcess process) {
    this.processes.remove(process);
  }

  private boolean connectionExists(String sessionId) {
    for(Connection c : this.connections) {
      if(c.checkSessionId(sessionId)) return true;
    }

    return false;
  }

  public String getNewProcessId() {
    String newId = Integer.toString((int)(10000 + Math.random() * 89999 + 1));
    for(String id : this.processIds) {
      if(id.equals(newId)) {
        return getNewProcessId();
      }
    }
    this.processIds.add(newId);
    return newId;
  }

}
