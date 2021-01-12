const port = 8100;
const token = 'gitlab_token';

const pushEvent = 'Push Hook';
const prodBranch = 'master';
const ddToken = 'webhook url';

const projectMap = new Map();
projectMap.set('stock', '/usr/local/sbin/jenkins-stock-service.sh');

module.exports = {
  port, token, pushEvent, prodBranch, ddToken, projectMap
};
