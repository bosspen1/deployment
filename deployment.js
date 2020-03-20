const { port, token, pushEvent, prodBranch, ddToken, projectMap } = require('./config.js');

const http = require("http");
const exec = require('child_process').exec;

const express = require('express');
const app = express();

function execTask(cmd) {
  exec(cmd, (err, stdout, stderr) => {
    let result;
    if (err) {
      result = `${ err }`;
    } else {
      result = `${ stdout }`;
    }
    console.log('result = %s', result);
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

app.post('/*', function (request, response) {
  try {
    handle(request, response);
  } catch (error) {
    console.log(error);
    response.end(result);
  }
});

app.get('/*', function (request, response) {
  try {
    handle(request, response);
  } catch (error) {
    console.log(error);
    response.end(result);
  }
});

function handle(request, response) {

  const { method, url, headers } = request;

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
    response.end('401 Unauthorized, invalid token: ' + xToken);
    return;
  }

  if (xEvent !== pushEvent) {
    response.end('event ' + xEvent + ' not supported');
    return;
  }

  let key = url.substr(1, url.length);
  const cmd = projectMap.get(key);

  if (!cmd) {
    response.end('project ' + key + ' not exsits');
    return;
  }

  let result = 'ok';
  try {
    let jsonData = '';
    request.addListener("data", data => {
      jsonData += data;
    });
    request.addListener("end", () => {
      try {
        let obj = JSON.parse(jsonData);
        console.log(`ref: ${obj.ref}`);
        if (obj.ref === 'refs/heads/' + prodBranch) {
          execTask(cmd);
        }
      } catch(error) {}
    });
  } catch (error) {
    result = `${ error }`;
  } finally {
    console.log(result);
    response.end(result);
  }
}

app.listen(port, '0.0.0.0', function () {
 console.log('Server running at http://127.0.0.1:%s/', port);
});

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
}