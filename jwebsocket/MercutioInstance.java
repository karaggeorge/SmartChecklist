
public class MercutioInstance extends Thread {

  private PrintWriter out;
  private BufferedReader in;
  private ServerControler controler;
  private boolean done = false;
  private boolean connected = false;

  public MercutioInstance(Socket socket, JulietteInitiator juliette) {
    this.socket = socket;
    this.controler = new ServerControler(this);
    juliette.setControler(this.controler);
  }

  public void run() {
    try {
      out = new PrintWriter(socket.getOutputStream(), true);
      in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

      out.println("CONNECTED");
      while(!done) {
        String line = in.readLine();
        processLine(line);
      }
    } catch(IOException e) {
      System.out.println(e.getMessage());
    } finally {
      socket.close();
    }
  }

  private void processLine(String line) {
    log("Received", line);
    if(line.equals("START ")) {
      startProcess();
    } else if(line.startsWith("POST ")) {
      controler.postItem(line.substring(5));
    } else if(line.startsWith("END ")) {
      controler.end(line);
    } else if(line.equals("EXIT")) {
      shutDown();
    } else if(line.startsWith("ERROR ")) {
        System.err.println(line.substring(6));
    }	else {
      sendError("Command not recognized");
    }
  }

  public void completeItem(String itemName) {
    sendMessage(this.COMPLETE, itemName);
  }

  public void terminateItem(String terminateCode) {
    sendMessage(this.TERMINATE, terminateCode);
  }

  private void sendMessage(String command, String message) {
    //System.out.println("Sending message " + step);
    log("Sending", command + " " + message);
    if(connected) out.println(command + " " + message);
  }

  private void sendError(String error) {
    sendMessage(this.ERROR, error);
  }

  private void shutDown() {
    this.done = true;
  }

  private void startProcess() {
    this.connected = true;
  }

  private void log(String title, String message) {
    System.out.println("---- Server ---- " + title + " : \"" + message + "\"");
  }

}
