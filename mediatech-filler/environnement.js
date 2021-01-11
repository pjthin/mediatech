process.argv.forEach(env => {
  let arg = env.split("=");
  if (arg.length > 0 && arg[0] === 'env') {
      let env = require('./env/' + arg[1] + '.json');
      module.exports = env;
  }
});