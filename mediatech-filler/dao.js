const mysql = require('mysql');
const { log, debug } = require('./util');

class Database {
  constructor(configuration) {
    this.pool = mysql.createPool(configuration);
    this.pool.on('acquire', (conn) => { debug(`connection acquired ${conn.threadId}`); });
    this.pool.on('connection', (conn) => { debug(`new connection ${conn.threadId}`); });
    this.pool.on('enqueue', () => { debug(`waiting for connection`); });
    this.pool.on('release', (conn) => { debug(`connection released ${conn.threadId}`); });
    this.filesAreadyLoaded = new Set();
    let close = async code => {
      await this.pool.end(error => {
        if (error) {
          log(error.stack || error);
        } else {
          log('connection ended.');
        }
      });
    };
    process.on('SIGINT', close);
    process.on('exit', close);
  }

  async loadCache() {
    if (this.filesAreadyLoaded.size === 0) {
      debug('loading cache');
      let results = await selectAsync('SELECT path FROM myfile', []);
      results.forEach( row => this.filesAreadyLoaded.add(row.path) );
      debug(`cache loaded ${this.filesAreadyLoaded.size} values`);
    }
  }

  async saveFileAsync(file) {
    try {
      await this.loadCache();
      if (this.filesAreadyLoaded.has(file.path)) {
        return;
      }
      let image = Object.assign({}, file.image);
      file.type = file.image ? 'P' : 'F';
      delete file.extension;
      delete file.image;
      debug('insertFile()');
      let fileId = await this.insertAsync('INSERT INTO myfile SET ?', file);
      if (file.type === 'P') {
        debug(`insertImage(${fileId})`);
        image.fk_id_file = fileId;
        await this.insertAsync('INSERT INTO mypicture SET ?', image);
      }
      return fileId;
    } catch (error) {
      log(error.stack || error);
    }
  }

  countFileAsync() {
    return selectAsync('SELECT COUNT(*) FROM myfile',[]);
  }

  selectAsync(sql, data) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, data, (error, results, fields) => {
        if (error) {
          log(`Error SQL for ${sql} : ${error.stack}`);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  insertAsync(sql, data) {
    return new Promise((resolve, reject) => {
      let query = this.pool.query(sql, data, (error, results, fields) => {
        if (error) {
          log(`Error SQL for ${sql} with ${data} : ${error.stack}`);
          reject(error);
        } else {
          if (results.insertId) {
            resolve(results.insertId);
          } else {
            resolve(results.changedRows);
          }
        }
      });
    });
  }
}

module.exports = Database;