#!/bin/bash

App='deployment'
ProjectHome='/home/wild/deployment'
RunHome='/opt/deployment'
Time=`date '+%Y%m%d%H%M%S'`

cd $ProjectHome
git pull

kill -9 $(ps -ef|grep node|awk '/'$App.js'/{print $2}')

cp -f $RunHome/$App.js $RunHome/$App-$Time.js
cp -f $ProjectHome/$App.js $RunHome/$App.js
cp -f $ProjectHome/*.json $RunHome/

cd $RunHome
npm install
nohup node $App.js > /dev/null 2>&1 &
