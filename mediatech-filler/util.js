function log(txt, ...obj) {
	console.log(`[${new Date().toLocaleString()}] ${txt}`);
	if (obj) {
		obj.forEach(d => console.log(d));
	}
}

module.exports = { log };