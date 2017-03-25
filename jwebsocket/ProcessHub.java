
public class ProcessHub {

  private ArrayList<Connection> connections;
  private ArrayList<Process> processes;
  private MercutioServer mercutio;

  public ProcessHub(MercutioServer mercutio) {
    this.connections = new ArrayList<Connection> ();
    this.mercutio = mercutio;
  }

  public void addConnection(String sessionId) {
    if(!connectionExists(sessionId)) {
      this.connections.add(new Connection(this, sessionId));
    }
  }

  public void processRequest(String sessionId, String request){
    String response = "";

    for(Connection c : this.connections) {
      if(c.checkSessionId(sessionId)) {
        response = c.processRequest(request);
        break;
      }
    }

    return response;
  }

  public Process startProcess(Connection connection) {
    Process process = new Process(connection, mercutio);
    processes.add(process);
    return process;
  }

  private boolean connectionExists(String sessionId) {
    for(Connection c : this.connections) {
      if(c.checkSessionId(sessionId)) return true;
    }

    return false;
  }

}
