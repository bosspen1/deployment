const { port, token, pushEvent, prodBranch, ddToken, projectMap } = require('./config.js');

const http = require("http");
const exec = require('child_process').exec;
const log4js = require("log4js");

const express = require('express');
const app = express();

log4js.configure({
  appenders: {
    deploymentLogs: { type: 'file', filename: './deployment.log' },
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['console', 'deploymentLogs'], level: 'trace' }
  }
});

const logger = log4js.getLogger();

function getClientIp(req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
}

function execTask(cmd) {
  exec(cmd, (err, stdout, stderr) => {
    let result;
    if (err) {
      result = `${ err }`;
    } else {
      result = `${ stdout }`;
    }
    logger.info('result = %s', result);
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
    logger.info(`statusCode: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      logger.info(`body: ${chunk}`);
    });
  });

  req.on('error', (e) => {
    logger.error(e);
  });

  req.write(JSON.stringify(data));
  req.end();
}

app.get('/*', function (req, res) {
  res.end('Request method get not supported');
});

app.post('/*', function (req, res) {
  try {
    handle(req, res);
  } catch (error) {
    logger.error(error);
    res.end(error);
  }
});

function handle(req, res) {

  const { method, url, headers } = req;
  const ip = getClientIp(req);

  logger.info('method = %s, url = %s, ip = %s', method, url, ip);

  if (method !== 'POST') {
    res.end('Request method ' + method + ' not supported');
    return;
  }

  let xToken = headers[`x-gitee-token`];
  let xEvent = headers[`x-gitee-event`];

  logger.info('token = %s, event = %s', xToken, xEvent);

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
    req.addListener("data", data => {
      jsonData += data;
    });
    req.addListener("end", () => {
      try {
        let obj = JSON.parse(jsonData);
        logger.info(`ref: ${obj.ref}`);
        if (obj.ref === 'refs/heads/' + prodBranch) {
          execTask(cmd);
        }
      } catch(error) {
        logger.error(error);
      }
    });
  } catch (error) {
    result = `${ error }`;
    logger.error(error);
  } finally {
    logger.info(result);
    res.end(result);
  }
}

app.listen(port, '0.0.0.0', function () {
  logger.info('http://127.0.0.1:%s/', port);
});
