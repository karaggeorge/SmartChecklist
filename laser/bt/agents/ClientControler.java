package laser.bt.agents;

import laser.juliette.ams.AgendaItem;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.LinkedHashSet;
import java.io.Serializable;
import laser.juliette.ams.AMSException;
import laser.lj.InterfaceDeclaration;
import laser.lj.InterfaceDeclaration.DeclarationKind;
import laser.lj.InterfaceDeclarationSet;
import java.util.Collections;
import java.lang.reflect.Method;

public class ClientControler {

  private ArrayList<AgendaItem> items;
  private MercutioClient mercutio;
  private static List<String> installedExceptionDecls;
  private Object descriptions;

  public ClientControler(MercutioClient mercutio) {
    this.mercutio = mercutio;
    this.items = new ArrayList<AgendaItem> ();
  }

  public void postItem(AgendaItem item) {
    findParentItem(item);
    items.add(item);

    try {
      AgendaItem p = item;
      mercutio.postItem(encode(item));
      while(p.getStep().hasParent()) {
        mercutio.postItem(encode(p.getParent()));
        p = p.getParent();
      }
      item.start();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private void findParentItem(AgendaItem item) {
    if(this.descriptions != null) return;

    try {
      AgendaItem p = item;
      while(p.getStep().hasParent()) {
        p = p.getParent();
      }

      InterfaceDeclarationSet declSet = p.getStep().getDeclarations(DeclarationKind.LOCAL_PARAMETER);
			if ((declSet != null) && (! declSet.isEmpty())) {
				for (InterfaceDeclaration decl : declSet) {
					String name = decl.getName();
          System.out.println("GOT DECLARATION " + name);
          if(name.equals("taskDescriptions")) {
            Class c = Class.forName(decl.getTemplate().getObjectType());
            this.descriptions = c.newInstance();
          }
        }
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public boolean completeItem(String itemName) {
    AgendaItem item = findItemByName(itemName);
    if(item == null) return false;

    try {
      item.complete();
      System.out.println("Completed");
    } catch (Exception e) {
      e.printStackTrace();
    }
    return true;
  }

  public boolean terminateItem(String terminateCode) {
    String [] parts = terminateCode.split("#@#");
    String itemName = parts[0];
    String [] exceptionsThrownNames = parts[1].split("\\|\\|");

    AgendaItem item = findItemByName(itemName);
    if(item == null) return false;

    Set<Serializable> exceptionsThrown = new LinkedHashSet<Serializable>();
    qualifiedNameInstall(item);
    for (int i = 0; i < exceptionsThrownNames.length; i++) {
			try {
				// The exceptionThrownNames are in human readable format. Get the fully-qualified class name
				// to create an instance of the exception class.
				String fullyQualifiedExceptionName = getFullyQualifiedName(exceptionsThrownNames[i]);
				Class currentExceptionsThrownClass = Class.forName(fullyQualifiedExceptionName);
				Serializable currentExceptionThrownInst = (Serializable)currentExceptionsThrownClass.newInstance();
				exceptionsThrown.add(currentExceptionThrownInst);
				System.out.println("\tIs throwing exception " + currentExceptionThrownInst.getClass().getName());
			} catch (ClassNotFoundException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			} catch (InstantiationException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			} catch (IllegalAccessException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		}

    try {
      item.terminate(Collections.unmodifiableSet(exceptionsThrown));
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

  private String encode(AgendaItem item) throws AMSException {
    Set<String> exceptions = getExceptionDeclarations(item);
    Set<String> artifacts = getArtifacts(item);
    String description = getTaskDescription(item);
    //String description = this.descriptions.newInstance().getTaskDescription(item.getStep().getName());
    String parent = "none";
    int isLeaf = 0;
    if(item.getStep().hasParent()) parent = item.getParent().getStep().getName();
    if(item.getStep().isLeaf()) isLeaf = 1;
    else if(item.getStep().isSequential()) isLeaf = 2;
    else if(item.getStep().isParallel()) isLeaf = 3;
    else if(item.getStep().isChoice()) isLeaf = 4;

    return item.getStep().getName() + "#@#" + isLeaf + "#@#" + parent + "#@#" + String.join("||", exceptions) + "#@#" + description + "#@#" + String.join("||", artifacts);
  }

  private String getTaskDescription(AgendaItem item) {
    String result = " ";
    try {
      Method method = this.descriptions.getClass().getMethod("getTaskDescription", String.class);
      result = (String) method.invoke(this.descriptions, item.getStep().getName());
    } catch (Exception e) {
      e.printStackTrace();
    }
    if(result == null) result = " ";
    return result;
  }

  public Set<String> getArtifacts(AgendaItem item) {
      Set<String> parameterDecls = new LinkedHashSet<String> ();

      try {
        InterfaceDeclarationSet parameterDeclSet = item.getStep().getParameters();
        if ((parameterDeclSet != null) && (! parameterDeclSet.isEmpty())) {
          for (InterfaceDeclaration parameterDecl : parameterDeclSet) {
            String mode = toParameterMode(parameterDecl);
            if (mode == null) {
              continue;
            }
            // Class c = Class.forName(parameterDecl.getTemplate().getObjectType());
            // System.out.println("I got " + c.newInstance().toString() + "!!!!! <-------");
            parameterDecls.add(parameterDecl.getName() + "#%#" + mode + "#%#" + parameterDecl.getTemplate().getObjectType());
          }
        }
      } catch (AMSException e1) {
  			// TODO Auto-generated catch block
  			e1.printStackTrace();
  		} catch (Exception e) {
        e.printStackTrace();
      }
      if(parameterDecls.size() == 0) parameterDecls.add(" ");
      return parameterDecls;
  }

  protected String toParameterMode(InterfaceDeclaration outputParameterDecl) {
		DeclarationKind ljKind = outputParameterDecl.getDeclarationKind();
		String mode = null;

		if (ljKind == DeclarationKind.IN_PARAMETER) {
			mode = "IN";
		}
		// else if (ljKind == DeclarationKind.IN_OUT_PARAMETER) {
		// 	mode = ParameterMode.INOUT;
		// }
		else if (ljKind == DeclarationKind.OUT_PARAMETER) {
			mode = "OUT";
		}

		return mode;
	}

  public Set<String> getExceptionDeclarations(AgendaItem item) {
		Set<String> exceptionDecls = new LinkedHashSet<String>();

		try {
			InterfaceDeclarationSet exceptionDeclSet = item.getStep().getDeclarations(DeclarationKind.EXCEPTION);
			if ((exceptionDeclSet != null) && (! exceptionDeclSet.isEmpty())) {
				for (InterfaceDeclaration exceptionDecl : exceptionDeclSet) {
					String exceptionDeclName = exceptionDecl.getTemplate().getObjectType();
					exceptionDecls.add(exceptionDeclName);
					//System.out.println("\tMay throw exception: " + exceptionThrownName);
				} // end for
			}
		} catch (AMSException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		return getHumanReadable(exceptionDecls);
	}

  private static Set<String> getHumanReadable(Set<String> fullyQualifiedExceptionNames) {

    List<String> fullyQualifiedNames_ = new ArrayList<String>();
		fullyQualifiedNames_.addAll(fullyQualifiedExceptionNames);
    List<String> humanReadableNames_ = new ArrayList<String>();

		// Create a human-readable name from each fully qualified name and add the human-readable
		// names to a list in the order of the corresponding fully qualified names
		for (int i = 0; i < fullyQualifiedNames_.size(); i++)
			humanReadableNames_.add(createHumanReadableName(fullyQualifiedNames_.get(i)));

		// Check if there are duplicate human-readable names. If so, use the fully qualified name
		// for the duplicates

		// The positions in the list of human readable names where there are duplicates
		Set<Integer> duplicatePositions = new HashSet<Integer>();

		for (int i = 0; i < humanReadableNames_.size(); i++)
		{
			for (int j = i; j < humanReadableNames_.size(); j++)
			{
				if (j == i)
					continue;
				if (humanReadableNames_.get(i).equals(humanReadableNames_.get(j)))
				{
					duplicatePositions.add(i);
					duplicatePositions.add(j);
				}
			}//end inner for loop
		}//end outer for loop

		// For the positions that have duplicates, replace the human readable name in
		// humanReadableNames_ with the original fully qualified name
		for (Integer duplicatePosition : duplicatePositions) {
      humanReadableNames_.set(duplicatePosition, fullyQualifiedNames_.get(duplicatePosition));
    }

    return new HashSet<String>(humanReadableNames_);
  }

  //createHumanReadableName(thrownException.getClass().getName());
  private static String createHumanReadableName(String fullyQualifiedName)
  {
    String[] tokens = fullyQualifiedName.split("\\.");

    // The last part of the fully qualified name is the one we will use for the human-readable
    // version of the exception name.
    String lastToken = tokens[tokens.length-1];
    // Assuming the exception class name is in Camel case, insert space before each
    // word starting with an upper case letter.
    StringBuffer spaceSeparatedString = new StringBuffer();
    for (int i = 0; i < lastToken.length(); i++)
    {
      if (i == 0)
      {
        spaceSeparatedString.append(lastToken.charAt(i));
        continue;
      }

      // If the character at position i is upper case and the one at position i-1 is lower
      // case, insert a blank space before the character at position i
      if (Character.isUpperCase(lastToken.charAt(i)) &&
          //i > 0 &&
          Character.isLowerCase(lastToken.charAt(i-1)))
      {
        spaceSeparatedString.append(" " + lastToken.charAt(i));
        continue;
      }

      // If the character at position i is upper case, the one after it is lower case,
      // and the characters at position i-1 and i-2 are upper case, insert a blank space
      // before the character at position i. This allows splitting properly strings like
      // "PracticeRNIsBusy"
      if (Character.isUpperCase(lastToken.charAt(i)) &&
          i < (lastToken.length() - 1) &&
          i > 1 &&
          Character.isLowerCase(lastToken.charAt(i+1)) &&
          Character.isUpperCase(lastToken.charAt(i-1)) &&
          Character.isUpperCase(lastToken.charAt(i-2)))
      {
        spaceSeparatedString.append(" " + lastToken.charAt(i));
        continue;
      }
      else
        spaceSeparatedString.append(lastToken.charAt(i));
    }

    // Go through the space separated String and convert to lower case all tokens, except
    // ones whose letters are all upper case.
    String[] tokens2 = spaceSeparatedString.toString().split("\\s+");
    StringBuffer toReturn = new StringBuffer();
    for (int i = 0; i < tokens2.length; i++)
    {
      if ( !tokens2[i].toUpperCase().equals(tokens2[i]))
        toReturn.append(tokens2[i].toLowerCase());
      else
        toReturn.append(tokens2[i]);

      if (i != tokens2.length-1)
        toReturn.append(" ");
    }

    return toReturn.toString();
  }

  private static void qualifiedNameInstall(AgendaItem item) {
    Set<String> decls = new LinkedHashSet<String>();

		try {
			InterfaceDeclarationSet exceptionDeclSet = item.getStep().getDeclarations(DeclarationKind.EXCEPTION);
			if ((exceptionDeclSet != null) && (! exceptionDeclSet.isEmpty())) {
				for (InterfaceDeclaration exceptionDecl : exceptionDeclSet) {
					String exceptionDeclName = exceptionDecl.getTemplate().getObjectType();
					decls.add(exceptionDeclName);
					//System.out.println("\tMay throw exception: " + exceptionThrownName);
				} // end for
			}
		} catch (AMSException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

    installedExceptionDecls = new ArrayList<String>();
		installedExceptionDecls.addAll(decls);
  }

  private static String getFullyQualifiedName(String humanReadableName) {
    for (int i = 0; i < installedExceptionDecls.size(); i++) {
      if(createHumanReadableName(installedExceptionDecls.get(i)).equals(humanReadableName)) {
        System.out.println("FOUND " + installedExceptionDecls.get(i));
        return installedExceptionDecls.get(i);
      }
    }
    return "";
	}

}
