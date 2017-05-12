

import java.io.IOException;
import java.io.*;
import org.jwebsocket.api.WebSocketPacket;
import org.jwebsocket.api.WebSocketServerListener;
import org.jwebsocket.kit.WebSocketServerEvent;
import java.util.ArrayList;

public class Listener implements WebSocketServerListener {

	private WebSocketServerEvent event_;
	private MercutioServer mercutio;
	private ServerControler controler;
	private ProcessHub hub;

	public Listener() {
		System.out.println("\n\n --------- STARTED ------------- \n\n");

		this.mercutio = new MercutioServer(9090);
		mercutio.run();
		this.hub = new ProcessHub(mercutio);
	}

	@Override
	public void processClosed(WebSocketServerEvent arg0) {

	}

	@Override
	public void processOpened(WebSocketServerEvent event) {
		System.out.println(" ----- Connectioned -----  with " + event.getSessionId());
		hub.addConnection(event.getSessionId());
	}

	@Override
	public void processPacket(WebSocketServerEvent event, WebSocketPacket packet) {
		Thread t = new Thread(new Runnable() {
				public void run() {
					String request = packet.getString();
					String sessionId = event.getSessionId();
					String response = hub.processRequest(sessionId, request);

					packet.setString(response);
					event.sendPacket(packet);
				}
		});

		t.start();
	}

}
