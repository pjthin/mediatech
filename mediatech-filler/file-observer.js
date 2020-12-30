const chokidar = require('chokidar');
const EventEmitter = require('events').EventEmitter;
const path = require('path');

class FileObserver extends EventEmitter {
  constructor() {
    super();
  }

  watchFolder(folder) {
    try {
      console.log(
        `[${new Date().toLocaleString()}] Watching for folder changes on: ${folder}`
      );

      var watcher = chokidar.watch(folder, { persistent: true });

      watcher.on('add', async filepath => {
        console.log(
          `[${new Date().toLocaleString()}] ${filepath} has been added.`
        );

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
      console.log(error);
    }
  }
}

module.exports = FileObserver;