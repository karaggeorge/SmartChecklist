
import java.util.ArrayList;

public class ServerControler {

  private String ERROR = "ERROR";

  private ArrayList<Item> items;
  private ArrayList<Item> newItems;
  private MercutioInstance mercutio;
  private boolean newItemsAvailable = false;
  private boolean ended = false;
  private String endCommand = "";

  public ServerControler(MercutioInstance mercutio) {
    this.mercutio = mercutio;
    this.items = new ArrayList<Item> ();
    this.newItems = new ArrayList<Item> ();
  }

  public void postItem(String itemCode) {
    Item newItem = new Item(itemCode);

    if(itemExists(newItem)) return;

    items.add(newItem);
    newItems.add(newItem);
    System.out.println("Added items");
    this.newItemsAvailable = true;
  }

  private boolean itemExists(Item newItem) {
    for(Item item : items) {
      if(newItem.getName().equals(item.getName())) return true;
    }
    return false;
  }

  public String processLine(String line) {
		if(line.equals("START")) {
			return startProcess();
		} else if(line.startsWith("COMPLETE ")) {
      return completeItem(line.substring(9));
    } else if(line.startsWith("TERMINATE ")) {
      return terminateItem(line.substring(10));
    } else if(line.startsWith("COMMENT ")) {
      return commentItem(line.substring(8));
    } else {
			return sendError("Command not recognized");
		}
	}

	private String startProcess() {
    newItems.clear();
    this.newItemsAvailable = false;
    return sendAllItems();
	}

  private String completeItem(String itemCode) {
    String [] parts = itemCode.split("#@#");
    String itemName = parts[0];
    String date = parts[1];
    System.out.println("Sending command to complete " + itemName);
    for(Item item : items) {
      if(item.getName().equals(itemName)) {
        if(!item.done()) {
          item.complete(date);
          mercutio.completeItem(itemName);
        }
      }
    }
    return waitForNewItems();
  }

  private String commentItem(String itemCode) {
    String [] parts = itemCode.split("#@#");
    String itemName = parts[0];
    for(Item item : items) {
      if(item.getName().equals(itemName)) {
        item.comment(parts[1], parts[2]);
      }
    }
    return " ";
  }

  private String terminateItem(String terminateCode) {
    String [] parts = terminateCode.split("#@#");
    String itemName = parts[0];
    System.out.println("Sending command to terminate " + itemName);
    for(Item item : items) {
      if(item.getName().equals(itemName)) {
        if(!item.done()) {
          item.terminate(parts[2]);
          mercutio.terminateItem(terminateCode);
        }
      }
    }
    return waitForNewItems();
  }

  public void end(String command) {
    this.ended = true;
    this.endCommand = command;
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
    try {
      Thread.sleep(500);
    } catch (Exception e) {
      e.printStackTrace();
    }

    int count = 0;
    while(!this.newItemsAvailable && !this.ended && count < 4) {
      try {
        Thread.sleep(100);
        count++;
      } catch (Exception e) {
        e.printStackTrace();
      }
    }

    if(this.ended) return this.endCommand;
    else return sendNewItems();
  }

	private String sendError(String error) {
		return this.ERROR + error;
	}
}
