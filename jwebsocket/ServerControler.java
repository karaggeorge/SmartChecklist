
import java.util.ArrayList;

public class ServerControler {

  private String ERROR = "ERROR";

  private ArrayList<Item> items;
  private ArrayList<Item> newItems;
  private MercutioServer mercutio;
  private boolean newItemsAvailable = false;

  public ServerControler(MercutioServer mercutio) {
    this.mercutio = mercutio;
    this.items = new ArrayList<Item> ();
    this.newItems = new ArrayList<Item> ();
  }

  public void postItem(String itemCode) {
    Item newItem = new Item(itemCode);

    items.add(newItem);
    newItems.add(newItem);
    System.out.println("Added items");
    this.newItemsAvailable = true;
  }

  public String processLine(String line) {
		if(line.equals("START")) {
			return startProcess();
		} else if(line.startsWith("COMPLETE ")) {
      return completeItem(line.substring(9));
    } else if(line.startsWith("TERMINATE ")) {
      return terminateItem(line.substring(10));
    }else {
			return sendError("Command not recognized");
		}
	}

	private String startProcess() {
    newItems.clear();
    this.newItemsAvailable = false;
    return sendAllItems();
	}

  private String completeItem(String itemName) {
    System.out.println("Sending command to complete " + itemName);
    for(Item item : items) {
      if(item.getName().equals(itemName)) {
        if(!item.done()) {
          item.complete();
          mercutio.completeItem(itemName);
        }
      }
    }
    return waitForNewItems();
  }

  private String terminateItem(String terminateCode) {
    String itemName = terminateCode.split("#@#")[0];
    System.out.println("Sending command to terminate " + itemName);
    for(Item item : items) {
      if(item.getName().equals(itemName)) {
        if(!item.done()) {
          item.terminate();
          mercutio.terminateItem(terminateCode);
        }
      }
    }
    return waitForNewItems();
  }

  private String sendAllItems() {
    String message = "ITEMS ";

    for(Item item : items) {
        message += item.encode() + "|%|";
    }

    return message;
  }

  private String sendNewItems() {
    String message = "ITEMS ";

    for(Item item : newItems) {
        message += item.encode() + "|%|";
    }
    newItems.clear();
    this.newItemsAvailable = false;
    return message;
  }

  private String waitForNewItems() {
    int count = 0;
    while(!this.newItemsAvailable && count < 7) {
      try {
        Thread.sleep(100);
        count++;
      } catch (Exception e) {
        e.printStackTrace();
      }
    }

    return sendNewItems();
  }

	private String sendError(String error) {
		return this.ERROR + error;
	}
}
