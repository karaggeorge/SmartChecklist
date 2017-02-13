package laser.bt.agents;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.ArrayList;

public class MercutioClient {

	private PrintWriter out;
	private BufferedReader in;
	private boolean connected = false;

	public MercutioClient() {
		System.out.println("Mercutio Client Initiated");
	}

	public void run() {
		try {
			Socket socket = new Socket("localhost", 9090);
			out = new PrintWriter(socket.getOutputStream(), true);
			in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
			System.out.println("Connectioned to server");
			connected = true;
			String line1 = in.readLine();
			if(line1.equals("Connectioned")) {
				boolean done = false;
				sendStep("Started");
				while(!done) {
					String line = in.readLine();
					processLine(line);
					if(line1.equals("EXIT")) done = true;
				}
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}

	private void processLine(String line) {
		if(line.startsWith("COMPLETED ")) {
			//controler.complete(line.substring(10));
		}
	}

	public void sendStep(String step) {
		System.out.println("Sending step " + step);
		if(connected) out.println(step);
	}

//	public static void main(String[] args) {
//		// TODO Auto-generated method stub
//		new JulietteClient();
//	}

}
