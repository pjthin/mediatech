const { error, log, debug } = require('./util');
const FileObserver = require('./file-observer');
const ImageProcessor = require('./image-processor');
const Database = require('./dao');
const env = require('./environnement');

log('start with environnement: ', env);

let fo = new FileObserver();
let imgProcessor = new ImageProcessor();
let database = new Database(env.database);

fo.on('file-added', async newFile => {
  try {
  	await imgProcessor.processAsync(newFile);
    let fileId = await database.saveFileAsync(newFile);
    debug(`${newFile.name} saved ${fileId}.`);	
  } catch (error) {
  	error(`an error occured when saving ${newFile.name}.`, error.stack || error);
  }
  
});

database.countFileAsync()
  .then((data) => { log('Number of file in database: ', data); })
  .then(() => { fo.watchFolder(env.app.folderToWatch); })
  .catch((error) => { error(error.stack || error); });