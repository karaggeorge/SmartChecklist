
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;


public class MercutioServer {

	private String ERROR = "ERROR";
	private String COMPLETE = "COMPLETE";

	private PrintWriter out;
	private BufferedReader in;
	private int port;
	private ServerControler controler;
	private boolean done = false;
	private boolean connected = false;

	public MercutioServer(int port) {
		this.port = port;
		System.out.println("Mercutio Server Initiated");
	}

	public void setControler(ServerControler controler) {
		this.controler = controler;
	}

	public void run() {
		System.out.println("Mercutio Server Running");
		try {
			ServerSocket listener = new ServerSocket(port);
			while (true){
				Socket socket = listener.accept();
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
					listener.close();
				}
			}
		} catch (Exception e) {
			System.err.println("Aborting " + e.getMessage());
			System.exit(1);
		}
	}

	private void processLine(String line) {
		log("Received", line);
		if(line.equals("START ")) {
			startProcess();
		} else if(line.startsWith("POST ")) {
			controler.postItem(line.substring(5));
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
		System.out.println("---- " + title + " : \"" + message + "\"");
	}

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		MercutioServer mercutio = new MercutioServer(9090);
		ServerControler controler = new ServerControler(mercutio);
		mercutio.setControler(controler);

		Thread t = new Thread(new Runnable() {
				public void run() {
					mercutio.run();
				}
		});
		t.start();
	}

}
