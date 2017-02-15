
import java.util.ArrayList;

public class ServerControler {

  private String ERROR = "ERROR";

  private ArrayList<Item> items;
  private MercutioServer mercutio;

  public ServerControler(MercutioServer mercutio) {
    this.mercutio = mercutio;
    this.items = new ArrayList<Item> ();
  }

  public void postItem(String itemCode) {
    items.add(new Item(itemCode));
  }

  public String processLine(String line) {
		if(line.equals("START")) {
			return startProcess();
		} else if(line.startsWith("COMPLETE ")) {
      completeItem(line.substring(9));
    } else {
			return sendError("Command not recognized");
		}
    return "";
	}

	private String startProcess() {
    String message = "ITEMS ";

    for(Item item : items) {
        message += item.encode() + "|%|";
    }

    return message;
	}

  private void completeItem(String itemName) {
    mercutio.completeItem(itemName);
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
