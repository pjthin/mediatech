const mysql = require('mysql');
const { logerror, log, debug } = require('./util');

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
          logerror(error.stack || error);
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
      let results = await this.selectAsync('SELECT path FROM myfile', []);
      results.forEach( row => this.filesAreadyLoaded.add(row.path) );
      debug(`cache loaded ${this.filesAreadyLoaded.size} values`);
    }
  }

  async isFileAlreadyInserted(file) {
    await this.loadCache();
    return this.filesAreadyLoaded.has(file.path);
  }

  async saveFileAsync(file) {
    try {
      if (await this.isFileAlreadyInserted(file)) {
        return;
      }
      let image = Object.assign({}, file.image);
      file.type = file.image ? 'P' : 'F';
      delete file.extension;
      delete file.image;
      debug(`insertFile(${file.path})`);
      let fileId = await this.insertAsync('INSERT INTO myfile SET ?', file);
      debug(`insertFile(${file.path}) = ${fileId} DONE`);
      if (file.type === 'P') {
        debug(`insertImage(${file.path}, ${fileId})`);
        image.fk_id_file = fileId;
        await this.insertAsync('INSERT INTO mypicture SET ?', image);
        debug(`insertImage(${file.path}, ${fileId}) DONE`);
      }
      return fileId;
    } catch (error) {
      logerror(error.stack || error);
    }
  }

  countFileAsync() {
    return this.selectAsync('SELECT COUNT(*) FROM myfile',[]);
  }

  selectAsync(sql, data) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, data, (error, results, fields) => {
        if (error) {
          logerror(`Error SQL for ${sql} : ${error.stack}`);
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
          logerror(`Error SQL for ${sql} with ${data} : ${error.stack}`);
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