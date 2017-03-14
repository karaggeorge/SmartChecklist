﻿#!/bin/sh
clear
PWD=$(cd .. 'dirname $0' && pwd)
echo "Starting the jWebSocket Swing UI..."
echo "(C) Copyright 2010-2015 Innotrade GmbH (jWebSocket.org), Germany (NRW), Herzogenrath"

if [ -z "$JWEBSOCKET_HOME" ]; then
   echo "JWEBSOCKET_HOME is not set, setting to the path of a dir above current"
   export JWEBSOCKET_HOME="$PWD"
   echo $JWEBSOCKET_HOME
fi

java -jar ../libs/jWebSocketSwingGUI-1.0.jar $1 $2 $3 $4 $5 $6 $7 $8 $9
