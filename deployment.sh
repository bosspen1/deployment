```
#!/bin/bash

App='deployment'
ProjectHome='/home/wild/deployment
RunHome='/opt/deployment'
Time=`date '+%Y%m%d%H%M%S'`

cd $ProjectHome
git pull

kill -9 $(ps -ef|grep java|awk '/'$App.jar'/{print $2}')

cp -f $RunHome/$App.js $RunHome/$App-$Time.js
cp -f $ProjectHome/$App.js $RunHome/$App.js

cd $RunHome
nohup node $App.js > $App.log 2>&1 &
```
