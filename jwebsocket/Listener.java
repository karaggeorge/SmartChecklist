

import java.io.IOException;
import java.io.*;
import org.jwebsocket.api.WebSocketPacket;
import org.jwebsocket.api.WebSocketServerListener;
import org.jwebsocket.kit.WebSocketServerEvent;
import java.util.ArrayList;

public class Listener implements WebSocketServerListener {

	private WebSocketServerEvent event_;
	private MercutioServer mercutio;
	private ArrayList<String> ItemList;

	public Listener() {
		System.out.println("\n\n --------- STARTED ------------- \n\n");
		ItemList = new ArrayList<String> ();

		mercutio = new MercutioServer(9090, this);

		Thread t = new Thread(new Runnable() {
				public void run() {
					mercutio.run();
				}
		});
		t.start();

		Thread th = new Thread(new Runnable() {
				public void run() {
					try {
						String path = System.getProperty("user.dir");
						String relativePath = "/../juls-and-scripts";
						path += relativePath;
						path += "/runProcess-juld.sh";
						Process p = Runtime.getRuntime().exec(path);
						System.out.println("Initiating Juliette");

						BufferedReader in = new BufferedReader(new InputStreamReader(p.getInputStream()));
				    String line;
				    while ((line = in.readLine()) != null) {
				        System.out.println(line);
				    }
				    p.waitFor();
				    System.out.println("Finished");

				    in.close();

					} catch (IOException e) {
						e.printStackTrace();
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
		});
		th.start();

	}

	@Override
	public void processClosed(WebSocketServerEvent arg0) {

	}

	@Override
	public void processOpened(WebSocketServerEvent event) {

		System.out.println(" ----- Connectioned ----- ");
	}

	@Override
	public void processPacket(WebSocketServerEvent event, WebSocketPacket packet) {
		// TODO Auto-generated method stub
		System.out.println("----- WebClient sent " + packet.getString());
		packet.setString(processLine(packet.getString()));
		event.sendPacket(packet);
	}

	private String processLine(String line) {
		if(line.equals("start")) {
			return "STEPS " + String.join("|", ItemList);
		} else {
			return "Command Unrecognized";
		}
	}

	public void addItem(String item) {
		ItemList.add(item);
		System.out.println("Added item " + item);
	}

}
