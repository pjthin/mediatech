const mysql = require('mysql');
const { log, debug } = require('./util');

class Database {
  constructor(configuration) {
    this.pool = mysql.createPool(configuration);
    this.pool.on('acquire', (conn) => { debug(`connection acquire ${conn.threadId}`); });
    this.pool.on('connection', (conn) => { debug(`new connection ${conn.threadId}`); });
    this.pool.on('enqueue', () => { debug(`waiting for connection`); });
    process.on('exit', async code => {
      await this.pool.end(err => {
        if (err) {
          log(err);
        } else {
          log('connection ended.');
        }
      })
    });
  }

  async save(file) {
    let image = Object.assign({}, file.image);
    file.type = file.image ? 'P' : 'F';
    let fileId = await this.insertFile(file);
    if (file.type === 'P') {
      await this.insertImage(fileId, image);
    }
    return fileId;
  }

  async insertFile(file) {
    delete file.extension;
    delete file.image;
    return await this.insert('INSERT INTO myfile SET ?', file);
  }

  async insertImage(fileId, image) {
    image.fk_id_file = fileId;
    return await this.insert('INSERT INTO mypicture SET ?', image);
  }

  insert(sql, data) {
    return new Promise((resolve, reject) => {
      let query = this.pool.query(sql, data, (error, results, fields) => {
        if (error) {
          log(`Error SQL for ${sql} with ${data} : ${error}`);
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