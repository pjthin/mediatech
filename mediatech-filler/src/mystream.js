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
    console.log('read call');
    this.push(this.buff.shift());
  }
}
class W extends Writable {
  constructor({parallele=5, doIt}) {
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