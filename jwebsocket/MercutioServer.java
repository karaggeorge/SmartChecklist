
import java.net.ServerSocket;
import java.net.Socket;
import java.util.List;
import java.util.Arrays;

public class MercutioServer {

	private int port;
	private ServerSocket serverSocket;

	public MercutioServer(int port) {
		this.port = port;
		System.out.println("Mercutio Server Initiated");
	}

	public void listenForJuliette(JulietteInitiator juliette) {
		Thread t = new Thread(new Runnable() {
			public void run() {
				try {
					Socket socket = serverSocket.accept();
					System.out.println("Mercutio client connected");
					MercutioInstance c = new MercutioInstance(socket, juliette);
					c.start();
				} catch (Exception e) {
					e.printStackTrace();
				}
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
		try {
			this.serverSocket.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
