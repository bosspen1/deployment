const { port, token, pushEvent, prodBranch, ddToken, projectMap } = require('./config.js');

const http = require("http");
const exec = require('child_process').exec;

function execTask(cmd) {
  exec(cmd, (err, stdout, stderr) => {
    let result;
    if (err) {
      result = `${ err }`;
    } else {
      result = `${ stdout }`;
    }
    console.log(result);
    sendMessage(result);
    // res.end(stdout);
  });
}

function sendMessage(content) {
  const data = {
    msgtype: 'text',
    text: { content: content }
  };

  let options = {
    hostname: 'oapi.dingtalk.com',
    port: 443,
    path: '/robot/send?access_token=' + ddToken,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  };

  const https = require('https');
  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`body: ${chunk}`);
    });
  });

  req.on('error', (e) => {
    console.error(`error: ${e.message}`);
  });

  req.write(JSON.stringify(data));
  req.end();
}

http.createServer((message, res) => {
  const { method, url, headers } = message;

  console.log(new Date());
  console.log('method = %s, url = %s', method, url);

  if (method !== 'POST') {
    res.end('Request method ' + method + ' not supported');
    return;
  }

  let xToken = headers[`x-gitee-token`];
  let xEvent = headers[`x-gitee-event`];

  console.log('token = %s, event = %s', xToken, xEvent);

  if (xToken !== token) {
    res.end('401 Unauthorized, invalid token: ' + xToken);
    return;
  }

  if (xEvent !== pushEvent) {
    res.end('event ' + xEvent + ' not supported');
    return;
  }

  let key = url.substr(1, url.length);
  const cmd = projectMap.get(key);

  if (!cmd) {
    res.end('project ' + key + ' not exsits');
    return;
  }

  let result = 'ok';
  try {
    let jsonData = '';
    message.addListener("data", data => {
      jsonData += data;
    });
    message.addListener("end", () => {
      let obj = JSON.parse(jsonData);
      console.log(obj.ref);
      if (obj.ref === 'refs/heads/' + prodBranch) {
        execTask(cmd);
      }
    });
  } catch (error) {
    result = `${ error }`;
  } finally {
    console.log(result);
    res.end(result);
  }

}).listen(port);

console.log('Server running at http://127.0.0.1:%s/', port);
