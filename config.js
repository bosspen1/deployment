const port = 8100;
const token = 'gitlab token';

const pushEvent = 'Push Hook';
const prodBranch = 'master';
const ddToken = 'dingding token';

const projectMap = new Map();
projectMap.set('stock', '/usr/local/sbin/jekins-stock-service.sh');

module.exports = {
  port, token, pushEvent, prodBranch, ddToken, projectMap
};
