const chokidar = require('chokidar');
const EventEmitter = require('events').EventEmitter;
const path = require('path');
const { log, debug } = require('./util')

class FileObserver extends EventEmitter {
  constructor() {
    super();
  }

  watchFolder(folder) {
    try {
      log(`Watching for folder changes on: ${folder}`);

      let watcher = chokidar.watch(folder, { persistent: true });

      watcher.on('add', async filepath => {
        debug(`${filepath} has been added.`);

        let {base,ext} = path.parse(filepath);
        
        // emit an event when new file has been added
        this.emit('file-added', {
          name: base,
          path: filepath,
          extension: ext,
          insert_date: new Date()
        });

      });
    } catch (error) {
      log(error);
    }
  }
}

module.exports = FileObserver;