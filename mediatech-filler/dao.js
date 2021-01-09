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