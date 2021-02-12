const { Readable, Writable } = require('stream');
const { sleep } = require('./util');

class BR extends Readable {
  constructor() {
    super({objectMode: true});
    this.buff = [];
    this.run = true;
    let close = code => {
      this.buff = [];
      this.run = false;
      // fin du stream
      this.push(null);
    };
    process.on('SIGINT', close);
    process.on('exit', close);
  }

  pushBuffer(data) {
    if (this.run) {
      this.buff.push(data); 
    }
  }

  _read() {
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
      do {
        sleep(1000);
        data = this.buff.shift();
        if (data) {
          this.push(data);
        }
      } while (!data || !this.run)
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