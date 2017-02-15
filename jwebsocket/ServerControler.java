
import java.util.ArrayList;

public class ServerControler {

  private String ERROR = "ERROR";

  private ArrayList<Item> items;
  private MercutioServer mercutio;
  private boolean newItemsAvailable = false;

  public ServerControler(MercutioServer mercutio) {
    this.mercutio = mercutio;
    this.items = new ArrayList<Item> ();
  }

  public void postItem(String itemCode) {
    this.newItemsAvailable = true;
    items.add(new Item(itemCode));
    System.out.println("Posted " + itemCode);
  }

  public String processLine(String line) {
		if(line.equals("START")) {
			return startProcess();
		} else if(line.startsWith("COMPLETE ")) {
      return completeItem(line.substring(9));
    } else {
			return sendError("Command not recognized");
		}
	}

	private String startProcess() {
    return sendItems();
	}

  private String completeItem(String itemName) {
    System.out.println("Sending command to complete " + itemName);
    mercutio.completeItem(itemName);
    return waitForNewItems();
  }

  private String sendItems() {
    String message = "ITEMS ";

    for(Item item : items) {
        message += item.encode() + "|%|";
    }
    items.clear();
    this.newItemsAvailable = false;
    return message;
  }

  private String waitForNewItems() {
    while(!this.newItemsAvailable) {
      try {
        Thread.sleep(100);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }

    return sendItems();
  }

	private String sendError(String error) {
		return this.ERROR + error;
	}

  /* Item Class Declaration */
  private class Item {

    private String name;

    public Item(String itemCode) {
      this.name = itemCode;
    }

    public String getName() {
      return this.name;
    }

    public String encode() {
      return this.name;
    }
  }

}
