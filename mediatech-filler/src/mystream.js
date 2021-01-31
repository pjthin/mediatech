const { Readable, Writable } = require('stream');

class BR extends Readable {
  constructor() {
    super({objectMode: true});
    this.buff = [];
  }

  pushBuffer(data) {
    this.buff.push(data);
  }

  _read() {
    let data = this.buff.shift();
    if (data) {
      this.push(data);
    } else {
      // rien à faire
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