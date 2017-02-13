

import org.jwebsocket.config.JWebSocketConfig;
import org.jwebsocket.factory.JWebSocketFactory;
import org.jwebsocket.instance.JWebSocketInstance;
import org.jwebsocket.server.TokenServer;

public class ChecklistServer {

	public static void main(String[] args) {
		JWebSocketFactory.printCopyrightToConsole();
		JWebSocketConfig.initForConsoleApp(new String [] {});
		JWebSocketFactory.start();
		TokenServer server = (TokenServer) JWebSocketFactory.getServer("ts0");
		if(server != null) {
			server.addListener(new Listener());
		}
		while(JWebSocketInstance.getStatus() != JWebSocketInstance.SHUTTING_DOWN){
			try {
				Thread.sleep(250);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}

}
