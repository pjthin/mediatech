const mysql = require('mysql');
const { log, debug } = require('./util');

class Database {
  constructor(configuration) {
    this.pool = mysql.createPool(configuration);
    this.pool.on('acquire', (conn) => { debug(`connection acquired ${conn.threadId}`); });
    this.pool.on('connection', (conn) => { debug(`new connection ${conn.threadId}`); });
    this.pool.on('enqueue', () => { debug(`waiting for connection`); });
    this.pool.on('release', (conn) => { debug(`connection released ${conn.threadId}`); });
    process.on('exit', async code => {
      await this.pool.end(error => {
        if (error) {
          log(error.stack || error);
        } else {
          log('connection ended.');
        }
      })
    });
  }

  async save(file) {
    try {
      let image = Object.assign({}, file.image);
      file.type = file.image ? 'P' : 'F';
      let fileId = await this.insertFile(file);
      if (file.type === 'P') {
        await this.insertImage(fileId, image);
      }
      return fileId;
    } catch (error) {
      log(error.stack || error);
    }
  }

  async insertFile(file) {
    delete file.extension;
    delete file.image;
    debug('insertFile()');
    return await this.insert('INSERT INTO myfile SET ?', file);
  }

  async insertImage(fileId, image) {
    debug(`insertImage(${fileId})`);
    image.fk_id_file = fileId;
    return await this.insert('INSERT INTO mypicture SET ?', image);
  }

  countFile() {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT COUNT(*) FROM myfile';
      this.pool.query(sql, (error, results, fields) => {
        if (error) {
          log(`Error SQL for ${sql} : ${error.stack}`);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  insert(sql, data) {
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