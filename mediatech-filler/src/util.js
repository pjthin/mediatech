const env = require('./environnement');

function log(txt, ...obj) {
  console.log(`[${new Date().toLocaleString()}] ${txt}`);
  if (obj) {
    obj.forEach(d => console.log(JSON.stringify(d)));
  }
}

function debug(txt, ...obj) {
  if (env.app.debug) {
    log(txt, obj);
  }
}

function logerror(txt, ...obj) {
  console.error(`[${new Date().toLocaleString()}] ${txt}`);
  if (obj) {
    obj.forEach(d => console.error(JSON.stringify(d)));
  }
}

module.exports = { logerror, log, debug };