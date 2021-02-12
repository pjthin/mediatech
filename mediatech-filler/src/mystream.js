const { Readable, Writable } = require('stream');
const { sleep, debug } = require('./util');

class BR extends Readable {
  constructor() {
    super({objectMode: true});
    this.buff = [];
    this.run = true;
    this.refreshId = setInterval(() => {
      debug(`BufferSize = ${this.buff.length}`);
    }, 5000);
    let close = code => {
      this.buff = [];
      this.run = false;
      // fin du stream
      this.push(null);
      clearInterval(this.refreshId);
    };
    process.on('SIGINT', close);
    process.on('exit', close);
  }

  pushBuffer(data) {
    if (this.run) {
      this.buff.push(data); 
    }
  }

  async _read() {
    if (!this.run) {
      // fin du stream
      this.push(null);
      return;
    }
    let data = this.buff.shift();
    if (data) {
      this.push(data);
    } else {
      // attend de pouvoir lire quelque chose
      while ((data = this.buff.shift()) == undefined && this.run) {
        await sleep(500);
        debug('sleep');
      }
      this.push(data);
    }
  }
}
class W extends Writable {
  constructor({parallele=15, doIt}) {
    super({objectMode: true});
    this.parallele = parallele;
    this.doIt = doIt;
  }

  async _write(data, _, done) {
    if (this.parallele > 0) {
      this.parallele --;
      this.doIt(data).then(() => {
        this.parallele ++;
      });
      done();
    } else {
      await this.doIt(data);
      done();
    }
  }
}
module.exports = { BR, W };