#!/bin/bash
export JAVA_HOME=/System/Library/Frameworks/JavaVM.framework/Versions/1.6.0/Home;
jul stop
cd ..
javac laser/bt/agents/*.java
echo Compiled
jar cf SimplifiedBloodTransfusionProcess-juld.jar -C . laser/
mv -f SimplifiedBloodTransfusionProcess-juld.jar juls-and-scripts/SimplifiedBloodTransfusionProcess-juld.jar
echo Built
cd juls-and-scripts
sleep 1
jul stop
jul install SimplifiedBloodTransfusionProcess-juld.jul    # This line reinstalls the jul file in case it has been changed. It is not necessary if one ensures that the jul file is manually reinstalled every time it is changed.
jul start
sleep 1
echo Executing
jul agent localhost laser.juliette.agent.DummyAgent auto&
jul agent localhost SimplifiedBloodTransfusionProcess-juld.jar laser.bt.agents.Nurse n1&
jul run SimplifiedBloodTransfusionProcess-juld
echo Finished Script
