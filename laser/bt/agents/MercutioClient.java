package laser.bt.agents;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class MercutioClient {

	private String POST = "POST";
	private String START = "START";
	private String ERROR = "ERROR";

	private PrintWriter out;
	private BufferedReader in;
	private boolean connected = false;
	private boolean done = false;
	private ClientControler controler;

	public MercutioClient() {
		System.out.println("Mercutio Client Initiated");
	}

	public void setControler(ClientControler controler) {
		this.controler = controler;
	}

	public void run() {
		try {
			Socket socket = new Socket("localhost", 9090);
			out = new PrintWriter(socket.getOutputStream(), true);
			in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

			String line = in.readLine();

			if(line.equals("CONNECTED")) {

				System.out.println("Connectioned to server");
				connected = true;
				boolean done = false;

				sendMessage(this.START, "");

				while(!done) {
					line = in.readLine();
					processLine(line);
				}
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}

	private void processLine(String line) {
		log("Received", line);
		if(line.startsWith("COMPLETE ")) {
				controler.completeItem(line.substring(9));
		} else if(line.startsWith("TERMINATE ")) {
				controler.terminateItem(line.substring(10));
		} else if(line.equals("EXIT")) {
				shutDown();
		} else if(line.startsWith("ERROR ")) {
				System.err.println(line.substring(6));
		}	else {
				sendError("Command not recognized");
		}
	}

	public void postItem(String itemName) {
		sendMessage(this.POST, itemName);
	}

	private void sendMessage(String command, String message) {
		log("Sending", command + " " + message);
		if(connected) out.println(command + " " + message);
	}

	private void sendError(String error) {
		sendMessage(this.ERROR, error);
	}

	private void shutDown() {
		this.done = true;
	}

	private void log(String title, String message) {
		System.out.println("---- Client ---- " + title + " : \"" + message + "\"");
	}

//	public static void main(String[] args) {
//		// TODO Auto-generated method stub
//		new JulietteClient();
//	}

}
