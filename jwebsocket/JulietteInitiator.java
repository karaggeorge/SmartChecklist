
import java.util.ArrayList;
import java.io.IOException;
import java.io.*;
import java.lang.Process;
import java.util.Scanner;


public class JulietteInitiator {

  private ArrayList<String> processList;
  private MercutioServer mercutio;
  private boolean gotControler;
  private ServerControler controler;
  private boolean ready;
  private boolean listReady;
  private String processName;
  private ArrayList<Agent> agents;
  private String processId;

  public JulietteInitiator(MercutioServer mercutio, String processId) {
    this.mercutio = mercutio;
    this.processId = processId;
    loadList();
  }

  public String processList() {
    while(!this.listReady) {
      try {
        Thread.sleep(50);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    return "LIST " + String.join("||", this.processList);
  }

  public ArrayList<ServerControler> startProcess(String processName) {

    installJulFile(processName);
    getAgents();

    this.ready = false;
    startJuliette();
    while(!this.ready) {
      try {
        Thread.sleep(100);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }

    return startAgents();
  }

  public void setControler(ServerControler controler) {
    this.controler = controler;
    this.gotControler = true;
  }

  private void loadList() {
    this.listReady = false;
    this.processList = new ArrayList<String> ();
    try {
      ProcessBuilder builder = new ProcessBuilder("/bin/bash");
      Process p = null;
      try {
        p = builder.start();
      } catch (Exception e) {
        e.printStackTrace();
      }

      BufferedWriter out = new BufferedWriter(new OutputStreamWriter(p.getOutputStream()));
      try {
        out.write("cd ../juls-and-scripts/juls");
        out.newLine();
        out.flush();
        out.write("ls");
        out.newLine();
        out.flush();

        out.write("exit");
        out.newLine();
        out.flush();

      } catch (Exception e) {
        e.printStackTrace();
      }

      Scanner s = new Scanner(p.getInputStream());
      while(s.hasNext()) {
        processList.add(s.next().split("\\.")[0]);
      }
      this.listReady = true;
      s.close();

    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private void getAgents() {
    agents = new ArrayList<Agent> ();
    try {
      ProcessBuilder builder = new ProcessBuilder("/bin/bash");
      Process p = null;
      try {
        p = builder.start();
      } catch (Exception e) {
        e.printStackTrace();
      }

      BufferedWriter out = new BufferedWriter(new OutputStreamWriter(p.getOutputStream()));
      try {
        out.write("cd ../juls-and-scripts/bin");
        out.newLine();
        out.flush();
        out.write("rm *.vsrm");
        out.newLine();
        out.flush();
        out.write("unzip currentJul.jul *.vsrm");
        out.newLine();
        out.flush();
        out.write("cat *.vsrm");
        out.newLine();
        out.flush();

        out.write("exit");
        out.newLine();
        out.flush();

      } catch (Exception e) {
        e.printStackTrace();
      }

      Scanner s = new Scanner(p.getInputStream());
      while(s.hasNext()) {
        String line = s.next();
        if(line.equals("Auto:")) break;
      }
      s.next();
      while(s.hasNext()) {
        String agentName = s.next();
        String agentId = s.next();
        this.agents.add(new Agent(agentName, agentId));
      }
      s.close();

    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private void installJulFile(String processName) {
    this.processName = processName;
    executeCommands(new String[] {
      "cd ../juls-and-scripts",
      "cp juls/" + processName + ".jul bin/currentJul.jul",
    });
  }

  private void startJuliette() {
    executeScript("startJuliette.sh");
  }

  private ArrayList<ServerControler> startAgents() {
    ArrayList<ServerControler> result = new ArrayList<ServerControler> ();

    for(Agent a : this.agents) {
      System.out.println("Starting agent " + a.getName());
      this.gotControler = false;
      mercutio.listenForJuliette(this);

      executeCommands(new String[] {
        "cd ../juls-and-scripts/bin",
        "jul agent localhost SmartChecklistAgents.jar agents.Nurse " + a.getId()
      });

      while(!this.gotControler) {
        try {
          Thread.sleep(50);
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
      this.controler.setAgentName(a.getName());
      this.controler.setProcessId(this.processId);
      result.add(this.controler);
    }

    executeCommands(new String [] {
      "sleep 2",
      "jul run currentJul"
    });

    return result;
  }

  private void executeCommands(String [] commands) {
    Thread t = new Thread(new Runnable () {
      public void run() {
        try {
          ProcessBuilder builder = new ProcessBuilder("/bin/bash");
          Process p = null;
          try {
            p = builder.start();
          } catch (Exception e) {
            e.printStackTrace();
          }

          BufferedWriter out = new BufferedWriter(new OutputStreamWriter(p.getOutputStream()));
          try {
            for(String c : commands) {
              out.write(c);
              out.newLine();
              out.flush();
            }

            out.write("exit");
            out.newLine();
            out.flush();

          } catch (Exception e) {
            e.printStackTrace();
          }

          Scanner s = new Scanner(p.getInputStream());
          while(s.hasNext()) {
            System.out.println(s.nextLine());
          }

          s.close();

        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    });

    t.start();
  }

  public void julietteReady() {
    this.ready = true;
  }

  private void executeScript(String script) {
    Thread th = new Thread(new Runnable() {
      public void run() {
        try {
          String path = System.getProperty("user.dir");
          String relativePath = "/../juls-and-scripts/";
          path += relativePath;
          path += script;

          Process p = Runtime.getRuntime().exec(path);

          BufferedReader in = new BufferedReader(new InputStreamReader(p.getInputStream()));
          String line;
          while ((line = in.readLine()) != null) {
              System.out.println(line);
              if(line.equals("Process Installed")) julietteReady();
          }
          p.waitFor();
          in.close();
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    });

    th.start();
  }

  private class Agent {
    private String name;
    private String id;

    public Agent(String name, String id) {
      this.name = name.substring(0, name.length()-1);
      this.id = id;
    }

    public String getName() {
      return this.name;
    }

    public String getId() {
      return this.id;
    }
  }
}
