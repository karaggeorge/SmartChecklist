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

public class ClientControler {

  private ArrayList<AgendaItem> items;
  private MercutioClient mercutio;
  private static List<String> installedExceptionDecls;

  public ClientControler(MercutioClient mercutio) {
    this.mercutio = mercutio;
    this.items = new ArrayList<AgendaItem> ();
  }

  public void postItem(AgendaItem item) {
    items.add(item);
    try {
      mercutio.postItem(encode(item));
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

    return item.getStep().getName() + "#@#" + String.join("||", exceptions);
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
