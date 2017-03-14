package laser.bt.artifacts;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;


public class TaskDescriptions implements Serializable
{
	private Map<String, String> descriptions;

	public TaskDescriptions() {
		super();
		descriptions = new HashMap<String, String> ();
		descriptions.put("confirm existence of blood type and screen","desc1");
		descriptions.put("test patient's blood type", "desc2");
	}

	public String getTaskDescription(String taskName) {
		return (String) descriptions.get(taskName);
	}

	public String toString() {
		return "Descriptions";
	}
}
