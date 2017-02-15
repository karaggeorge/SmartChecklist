package laser.bt.agents;

import laser.juliette.ams.AgendaItem;
import java.util.ArrayList;


public class ClientControler {

  private ArrayList<AgendaItem> items;
  private MercutioClient mercutio;

  public ClientControler(MercutioClient mercutio) {
    this.mercutio = mercutio;
    this.items = new ArrayList<AgendaItem> ();
  }

  public void postItem(AgendaItem item) {
    items.add(item);
    try {
      mercutio.postItem(item.getStep().getName());
      item.start();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public boolean completeItem(String itemName) {
    AgendaItem item = findItemByName(itemName);
    if(item == null) return false;

    try {
      item.complete();
    } catch (Exception e) {
      e.printStackTrace();
    }
    return true;
  }

  private AgendaItem findItemByName(String itemName) {
    for(AgendaItem item : items) {
      String name = "";
      try {
        name = item.getStep().getName();
      } catch (Exception e) {
        e.printStackTrace();
      }

      if(name.equals(itemName)) {
        return item;
      }
    }
    return null;
  }

}
