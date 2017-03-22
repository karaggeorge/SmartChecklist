public class Item {

  private String name;
  private int status;
  private String parent;
  private String isLeaf;
  private String exceptions;
  private String description;
  private String artifacts;
  private String date;
  private String comments;

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
    this.exceptions = parts[3];//.split("\\|\\|");
    this.description = parts[4];
    this.artifacts = parts[5];//.split("\\|\\|");
    this.date = " ";
    System.out.println("My exceptions are " + getExceptions());
  }

  public String getExceptions() {
    //if(this.exceptions != null) return String.join("||", this.exceptions);
    //else return "";
    return this.exceptions;
  }

  public String encode() {
    return this.name + "#@#" + this.status + "#@#" + this.isLeaf + "#@#" + this.parent + "#@#" + this.date + "#@#" + getExceptions() + "#@#" + this.description + "#@#" + this.artifacts + "#@#" + getComments();
  }

  private String getComments() {
    if(this.comments == null) return " ";
    else return this.comments;
  }

  public void complete(String date) {
    this.date = date;
    this.status = 3;
  }

  public void terminate(String date) {
    this.date = date;
    this.status = 4;
  }

  public void comment(String note, String date) {
    if(this.comments == null) this.comments = note + "#%#" + date;
    else this.comments += "||" + note + "#%#" + date;
  }

  public boolean done() {
    return this.status == 3 || this.status == 4;
  }

}
