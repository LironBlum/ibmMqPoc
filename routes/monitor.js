const env = process.env;
const envVars = require('../monitoring/envVars');

function version(req, res) {
  res.status(200).json({ version: env.VERSION });
}

function ping(req,res) {
  res.status(200).json({ ping: '✔' });
}

function getenv(req,res) {
  const filtered = envVars.getFilterEnvs();
  res.status(200).json({ env: filtered });
}

module.exports = {
  version,
  ping,
  getenv
};

