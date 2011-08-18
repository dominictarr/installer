var mkdirP = require('mkdirp').mkdirP
  , path = require('path')
exports.init = init
function init (workdir, opts, callback){

  //opts has username, project, 
  //create directories 

  mkdirP(path.join(workdir, opts.username, opts.project, 'node_modules'), 0755 ,callback)
}