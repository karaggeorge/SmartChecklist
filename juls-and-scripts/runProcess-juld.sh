#!/bin/bash
jul stop

cd ..
javac agents/*.java
echo Compiled

jar cf SmartChecklistAgents.jar -C . agents/
mv -f SmartChecklistAgents.jar juls-and-scripts/SmartChecklistAgents.jar
echo Built

cd juls-and-scripts
cp SimplifiedBloodTransfusionProcess-juld.jul processJulInJar.jar
export CLASSPATH=$CLASSPATH:$(pwd)/processJulInJar.jar

sleep 1
jul stop
jul install SimplifiedBloodTransfusionProcess-juld.jul    # This line reinstalls the jul file in case it has been changed. It is not necessary if one ensures that the jul file is manually reinstalled every time it is changed.
jul start
sleep 1
echo Process Installed

echo Executing
jul agent localhost laser.juliette.agent.DummyAgent auto&
jul agent localhost SmartChecklistAgents.jar agents.Nurse n1&
jul run SimplifiedBloodTransfusionProcess-juld

echo Finished Script
