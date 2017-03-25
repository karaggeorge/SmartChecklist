
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.List;
import java.util.Arrays;

public class MercutioServer {

	private String ERROR = "ERROR";
	private String COMPLETE = "COMPLETE";
	private String TERMINATE = "TERMINATE";

	private int port;
	private ServerSocket serverSocket;

	public MercutioServer(int port) {
		this.port = port;
		System.out.println("Mercutio Server Initiated");
	}

	public void listenForJuliette(JulietteInitiator juliette) {
		Thread t = new Thread(new Runnable() {
			public void run() {
				Socket socket = serverSocket.accept();
				MercutioInstance c = new Instance(socket, juliette);
				c.start();
			}
		});

		t.start();
	}

	public void run() {
		System.out.println("Mercutio Server Running");
		try {
			this.serverSocket = new ServerSocket(port);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void close() {
		this.serverSocket.close();
	}

}
