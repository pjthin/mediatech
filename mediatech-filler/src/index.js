const { logerror, log, debug } = require('./util');
const FileObserver = require('./file-observer');
const ImageProcessor = require('./image-processor');
const Database = require('./dao');
const env = require('./environnement');
const { BR, W } = require('./mystream');

log('start with environnement: ', env);

let fo = new FileObserver();
let imgProcessor = new ImageProcessor();
let database = new Database(env.database);
let br = new BR();
let w = new W({
  doIt: async newFile => {
    try {
      if (await database.isFileAlreadyInserted(newFile)) {
        // stop avant de faire des calculs
        return;
      }
      await imgProcessor.processAsync(newFile);
      let fileId = await database.saveFileAsync(newFile);
      debug(`${newFile.name} saved ${fileId}.`);  
    } catch (error) {
      logerror(`an error occured when saving ${newFile.name}.`, error.stack || error);
    }
    
  }
});
br.pipe(w);

fo.on('file-added', newFile => br.pushBuffer(newFile));

database.countFileAsync()
  .then((data) => { log('Number of file in database: ', data); })
  .then(() => { fo.watchFolder(env.app.folderToWatch); })
  .catch((error) => { logerror(error.stack || error); });