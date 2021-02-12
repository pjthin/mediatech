const chokidar = require('chokidar');
const EventEmitter = require('events').EventEmitter;
const path = require('path');
const { logerror, log, debug } = require('./util')

class FileObserver extends EventEmitter {
  constructor() {
    super();
    let close = async code => {
      await chokidar.close();
    };
    process.on('SIGINT', close);
    process.on('exit', close);
  }

  watchFolder(folder) {
    try {
      log(`Watching for folder changes on: ${folder}`);

      let watcher = chokidar.watch(folder, { persistent: false, ignored: '*.*' });

      watcher.on('add', filepath => {
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
      logerror(error.stack || error);
    }
  }
}

module.exports = FileObserver;