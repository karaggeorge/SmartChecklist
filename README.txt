This project contains an example of running a simple Little-JIL process with Java-based agents.
It uses the juld command to run the Little-JIL interpreter (as opposed to using the jrun command).

GENERAL NOTES:
There are two process definitions in the two .ljx files. The one used in the example is
"SimpleBloodTransfusionProcess.ljx"

The Java classes for the artifacts, the exceptions, and the agents used in the process definition
are in the laser.bt package. These classes are referenced from the process definition in the .ljx
file. To view that process definition, make sure you are in the Little-JIL perspectve in Eclipse
(You need the Visual-JIL for Eclipse plugin to be able to use that perspctive. That plugin can be
obtained from http://laser.cs.umass.edu/release/) 

The .vsrm file specifies the resource model for a Little-JIL process. For more info, see
http://laser.cs.umass.edu/documentation/juliette/vsrm.html .

This example assumes that you have installed the Juliette interpreter on your computer and
added it to your PATH (http://laser.cs.umass.edu/documentation/juliette/).

RUNNING THE EXAMPLE:
- To run the process specified in the "SimpleBloodTransfusionProcess.ljx" file, the script
runProcess-juld.sh (located in the juls folder) needs to be run from the terminal.
- Before running that script, make sure that the "jul" command is on your PATH and that
you have installed the jul file corresponding to the SimpleBloodTransfusionProcess
Little-JIL process. The jul command will be in the directory where you have installed the
Juliette interpreter.
(installing is done by running "jul install SimpleBloodTransfusionProcess.jul")
- To stop a running process, run the script stopProcess.sh

RERUNNING THE EXAMPLE AFTER CHANGES ARE MADE:
- If any changes are made to the process (e.g., to the process definition, to the agent code),
then the .jul file needs to be re-exported and the .jar file that the run script refers to
also needs to be recreated.
- Note: sometimes the jul export does not work (e.g., the export wizard doesn't allow you to
choose the JavaBeans artifact model). If that happens, create a blank Little-JIL
project in Eclipse, which can be used to export a jul file from it.
   * Copy the .ljx file, the .vsrm file, the laser package (the package that
   contains the agents, artifacts, and exceptions Java classes), the juliette-client.jar file, and
   the ljtylestubs.jar file into that new project (at the top level).
   * Add the two jar files to the build path, so that the Java code in the
   laser package can compile.
   * Export a new jul file form that project and save in a location you choose. During the export,
   make sure you select the "Use JavaBeans artifact model" option and the "Use VSRM process
   model" option selecting the VSRM file shown in the list of VSRM files.
   * Make a copy of the new jul file and change its extension from .jul to .jar (that is the
   jar file that the run script is using to find the agent code).
   * Use these new jul and jar files to replace the old ones that the run script is referring to.
   * Before you re-run the example, make sure you install the new jul file by
   running "jul install <jul file name>" from the terminal