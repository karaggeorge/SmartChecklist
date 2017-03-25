

public class JulietteInitiator {

  private ArrayList<String> processList;
  private MercutioServer mercutio;
  private boolean gotControler;
  private ServerControler controler;

  public JulietteInitiator(MercutioServer mercutio) {
    this.mercutio = mercutio;
    loadList();
  }

  public String processList() {
    return "processList";
  }

  public ServerControler startProcess(String processName) {
    this.gotControler = false;
    mercutio.listenForJuliette(this);
    startJuliette();
    while(!this.gotControler) {
      try{
        Thread.sleep(100);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    return this.controler;
  }

  public setControler(ServerControler controler) {
    this.controler = controler;
    this.gotControler = true;
  }

  private loadList() {

  }

  private startJuliette() {
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
}
