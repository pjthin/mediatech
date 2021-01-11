const { log } = require('./util');
const FileObserver = require('./file-observer');
const ImageProcessor = require('./image-processor');
const Database = require('./dao');
const env = require('./environnement');

let fo = new FileObserver();
let imgProcessor = new ImageProcessor();
let database = new Database(env.database);

fo.on('file-added', async newFile => {
  imgProcessor.process(newFile);
  let pkFile = {};
  pkFile.filename = newFile.filename;
  let file = await save('pictures', newFile, pkFile);
  log(`${newFile.filename} saved ${file}.`);
});

fo.watchFolder(env.app.folderToWatch);