const { log, debug } = require('./util');
const FileObserver = require('./file-observer');
const ImageProcessor = require('./image-processor');
const Database = require('./dao');
const env = require('./environnement');

let fo = new FileObserver();
let imgProcessor = new ImageProcessor();
let database = new Database(env.database);

fo.on('file-added', async newFile => {
  try {
  	await imgProcessor.process(newFile);
    //let fileId = await database.save(newFile);
    //debug(`${newFile.name} saved ${fileId}.`);	
  } catch (error) {
  	log(`an error occured when saving ${newFile.name}.`, error.stack || error);
  }
  
});

fo.watchFolder(env.app.folderToWatch);
/*
database.countFile()
  .then((data) => { log('Number of file in database: ', data); })
  .then(() => { fo.watchFolder(env.app.folderToWatch); })
  .catch((error) => { log(error.stack || error); });
*/