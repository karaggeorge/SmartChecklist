public class Item {

  private String name;
  private int status;
  private String parent;
  private String isLeaf;
  private String [] exceptions;

  public Item(String itemCode) {
    decode(itemCode);
  }

  public String getName() {
    return this.name;
  }

  private void decode(String itemCode) {
    System.out.println("GOT " + itemCode);
    String [] parts = itemCode.split("#@#");
    this.name = parts[0];
    this.status = 1;
    this.isLeaf = parts[1];
    this.parent = parts[2];
    if(parts.length > 3) this.exceptions = parts[3].split("\\|\\|ss");
    System.out.println("My exceptions are " + getExceptions());
  }

  public String getExceptions() {
    if(this.exceptions != null) return String.join("||", this.exceptions);
    else return "";
  }

  public String encode() {
    return this.name + "#@#" + this.status + "#@#" + this.isLeaf + "#@#" + this.parent + "#@#" + getExceptions();
  }

  public void complete() {
    this.status = 3;
  }

  public void terminate() {
    this.status = 4;
  }

  public boolean done() {
    return this.status == 3 || this.status == 4;
  }

}
