

public class Process {

  private ArrayList<Connection> connections;
  private JulietteInitiator juliette;
  private ServerControler controler;
  private MercutioServer mercutio;

  public Process(Connection connection, MercutioServer mercutio) {
    this.connections = new ArrayList<Connection> ();
    this.connections.add(connection);
    this.juliette = new JulietteInitiator(mercutio);
  }

  public processRequest(String request) {
    if(request.equals("LIST")) {
      return juliette.processList();
    } else if(request.startsWith("PICK ")) {
      return startProcess(request.substring(5));
    }
  }

  public processRequest(int id, String request) {
    return controler.processLine(request);
  }

  private startProcess(String processName) {
    this.controler = juliette.startProcess(processName);
    connections.get(0).setId(0);
    return "STARTED";
  }

}
