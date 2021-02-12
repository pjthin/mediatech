const env = require('./environnement');

function log(txt, ...obj) {
  console.log(`[${new Date().toLocaleString()}] ${txt}`);
  if (obj) {
    obj.forEach(d => console.log(JSON.stringify(d)));
  }
}

function debug(txt, ...obj) {
  if (env.app.debug) {
    console.log(`[${new Date().toLocaleString()}] ${txt}`);
    if (obj) {
      obj.forEach(d => console.log(JSON.stringify(d)));
    }
  }
}

function logerror(txt, ...obj) {
  console.error(`[${new Date().toLocaleString()}] ${txt}`);
  if (obj) {
    obj.forEach(d => console.error(JSON.stringify(d)));
  }
}

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve(); }, time);
  });
}

module.exports = { logerror, log, debug, sleep };