
import java.util.ArrayList;

public class ChecklistProcess {

  private ArrayList<Connection> connections;
  private JulietteInitiator juliette;
  private ArrayList<ServerControler> controlers;
  private MercutioServer mercutio;
  private String id;
  private String processName;
  private ProcessHub hub;

  public ChecklistProcess(Connection connection, MercutioServer mercutio, ProcessHub hub) {
    this.hub = hub;
    this.connections = new ArrayList<Connection> ();
    this.connections.add(connection);
    this.id = hub.getNewProcessId();
    this.juliette = new JulietteInitiator(mercutio, this.id);
    this.processName = "";
  }

  public String processRequest(String request) {
    if(request.equals("LIST")) {
      return juliette.processList();
    } else if(request.startsWith("PROCESS ")) {
      return startProcess(request.substring(8));
    } else {
      return "ERR Unknown command";
    }
  }

  public String getId() {
    return this.id;
  }

  public boolean checkId(String id) {
    return this.id.equals(id);
  }

  public String addConnection(Connection c) {
    if(this.connections.size() == this.controlers.size()) {
      return "ERR No agents available for that process";
    } else {
      c.setProcess(this);
      this.connections.add(c);
      return getAgentsList();
    }
  }

  public void removeConnection(Connection c) {
    this.connections.remove(c);
    if(this.connections.isEmpty()) hub.removeProcess(this);
  }

  public String processRequest(String agentName, String request) {
    for(ServerControler c : this.controlers) {
        if(c.checkAgentName(agentName)) {
          return c.processLine(request);
        }
    }
    return "ERR Agent not recognized";
  }

  private String startProcess(String processName) {
    this.processName = processName;
    this.controlers = juliette.startProcess(processName);
    return getAgentsList();
  }

  public String getProcesName() {
    return this.processName;
  }

  public boolean hasStarted() {
    return !this.processName.equals("");
  }

  public String getAgentsList() {
    ArrayList<String> agentNames = new ArrayList<String> ();
    for(ServerControler sc : this.controlers) {
      String name = sc.getAgentName();
      System.out.print("GOT " + name);
      boolean exists = false;
      for(Connection c : this.connections) {
        if(c.getAgentName().equals(name)) {
          System.out.println("BUT NO");
          exists = true;
          break;
        }
      }
      if(!exists) agentNames.add(sc.getAgentName());
    }
    return "AGENTS " + String.join("||", agentNames);
  }

}
