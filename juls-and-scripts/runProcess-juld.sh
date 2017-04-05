#!/bin/bash
jul stop

cd ..

cd juls-and-scripts
cp juls/SimplifiedBloodTransfusionProcess-juld.jul processJulInJar.jar
export CLASSPATH=$CLASSPATH:$(pwd)/processJulInJar.jar

sleep 1
jul stop
jul install juls/SimplifiedBloodTransfusionProcess-juld.jul    # This line reinstalls the jul file in case it has been changed. It is not necessary if one ensures that the jul file is manually reinstalled every time it is changed.
jul start
sleep 1
echo Process Installed

echo Executing
jul agent localhost laser.juliette.agent.DummyAgent auto&
jul agent localhost bin/SmartChecklistAgents.jar agents.Nurse n1&
sleep 1
jul run SimplifiedBloodTransfusionProcess-juld

echo Finished Script
