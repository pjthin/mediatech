const chokidar = require('chokidar');
const EventEmitter = require('events').EventEmitter;
const path = require('path');
const { log } = require('./util')

class FileObserver extends EventEmitter {
  constructor() {
    super();
  }

  watchFolder(folder) {
    try {
      log(`Watching for folder changes on: ${folder}`);

      var watcher = chokidar.watch(folder, { persistent: true });

      watcher.on('add', async filepath => {
        log(`${filepath} has been added.`);

        let {base,ext} = path.parse(filepath);
        
        // emit an event when new file has been added
        this.emit('file-added', {
          filename: base,
          filepath: filepath,
          extension: ext,
          insertDate: new Date()
        });

      });
    } catch (error) {
      log(error);
    }
  }
}

module.exports = FileObserver;