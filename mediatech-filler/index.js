const { log } = require('./util');
const FileObserver = require('./file-observer');
const ImageProcessor = require('./image-processor');
const Database = require('./dao');
const env = require('./environnement');

let fo = new FileObserver();
let imgProcessor = new ImageProcessor();
let database = new Database(env.database);

fo.on('file-added', async newFile => {
  await imgProcessor.process(newFile);
  try {
    let fileId = await database.save(newFile);
    log(`${newFile.name} saved ${fileId}.`);	
  } catch (error) {
  	log(`an error occured when saving ${newFile.name}.`);
  }
  
});

fo.watchFolder(env.app.folderToWatch);