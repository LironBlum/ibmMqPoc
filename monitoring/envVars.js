const env = process.env;
const _ = require('lodash');

function getFilterEnvs() {
  const filtered = _.pickBy(env, (value, key) => !key.includes('npm'));
  return filtered;
}
  
module.exports = {
  getFilterEnvs
};
  