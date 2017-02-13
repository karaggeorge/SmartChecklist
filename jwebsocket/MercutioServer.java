
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;


public class MercutioServer {

	private PrintWriter out;
	private BufferedReader in;
	private Listener controler;
	private int port;

	public MercutioServer(int port, Listener controler) {
		this.controler = controler;
		this.port = port;
		System.out.println("Mercutio Server Initiated");
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

					out.println("Mercutio Client Connectioned");
					boolean done = false;
					while(!done) {
						String line = in.readLine();
						if(line.equals("exit")) done = true;
						else controler.addItem(line);
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

	// public static void main(String[] args) {
	// 	// TODO Auto-generated method stub
	// 	new MercutioServer(9090);
	// }

}
