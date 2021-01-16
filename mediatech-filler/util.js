const env = require('./environnement');

function log(txt, ...obj) {
	console.log(`[${new Date().toLocaleString()}] ${txt}`);
	if (obj) {
		obj.forEach(d => console.log(d));
	}
}

function debug(txt, ...obj) {
	if (env.app.debug) {
		log(txt, obj);
	}
}

module.exports = { log, debug };