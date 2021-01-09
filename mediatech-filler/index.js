const FileObserver = require('./file-observer');
const ImageProcessor = require('./image-processor');
const { save, countAll } = require('./dao');
const { log } = require('./util');

let fo = new FileObserver();
let imgProcessor = new ImageProcessor();
fo.on('file-added', async newFile => {
  imgProcessor.process(newFile);
  let pkFile = {};
  pkFile.filename = newFile.filename;
  let file = await save('pictures', newFile, pkFile);
  log(`${newFile.filename} saved ${file}.`);
});
countAll('pictures').then(countPictures => {
  log(`${countPictures} pictures saved.`)
  fo.watchFolder('/home/Pierre-Jean.Thin/perso/test/in/');
});