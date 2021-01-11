const mysql = require('mysql');
const { log } = require('./util');

class Database {
  constructor(configuration) {
    this.pool = mysql.createPool(configuration);
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
    let fileId = await this.insertFile(file);
    if (file.image) {
      await this.insertImage(fileId, file.image);
    }
  }

  async insertFile(file) {
    return await this.insert('INSERT INTO myfile(path, insert_date, type, name) VALUES (?, ?, ?, ?)', [file.filepath, file.insertDate, file.image ? 'P' : 'F', file.filename]);
  }

  async insertImage(fileId, image) {
    return await this.insert('INSERT INTO mypicture(fk_id_file, picture_date, picture_make, picture_model, icon, gps_latitude, gps_longitude, gps_altitude, gps_altitude_ref, gps_speed_ref, gps_speed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [fileId, image.pictureDate, image.pictureMake, image.pictureModele, image.icon, image.gpsLatitude, image.gpsLongitude, image.gpsAltitude, image.gpsAltitudeRef, image.gpsSpeed, image.gpsSpeedRef]);
  }

  insert(sql, data) {
    return new Promise((resolve, reject) => {
      pool.query(sql, data, (error, results, fields) => {
        if (error) {
          log(`Error SQL for ${sql} with ${data} : error`);
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

/*

const { MongoClient } = require("mongodb");
const { log } = require('./util');
// Replace the uri string with your MongoDB deployment's connection string.
const uri = "mongodb://localhost/mediatech";
const mongoClient = new MongoClient(uri,{ useUnifiedTopology: true });

let database;
const collections = {};

async function getCollection(collectionName) {
  try {
    await mongoClient.connect();
    if (!database) {
      database = mongoClient.db('mediatech');
      process.on('exit', (code) => {
        if (mongoClient && mongoClient.isConnected()) {
          mongoClient.close();
        }
      });
    }
    if (!collections[collectionName]) {
      collections[collectionName] = database.collection(collectionName);
    }
    return collections[collectionName];
  } catch (error) {
    log(error);
    throw error;
  }
}

async function save(collectionName, item, uniq = {_id:-1}) {
  try {
    let collection = await getCollection(collectionName);
    let alreadyExists = await collection.findOne(uniq,{_id:true});
    if (alreadyExists) {
      log(`document already exists with id ${alreadyExists._id}.`);
      return alreadyExists._id;
    }
    let result = await collection.insertOne(item);
    return result.insertedId;
  } catch (error) {
    console.log(error);
  }
}

async function countAll(collectionName) {
  try {
    let collection = await getCollection(collectionName);
    return await collection.countDocuments({});
  } catch (error) {
    log(error);
  }
}

module.exports = { save, countAll };
*/