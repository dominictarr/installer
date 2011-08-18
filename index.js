
var ctrl = require('ctrlflow')
  , mkdirP = require('mkdirp').mkdirP 
  , path = require('path')
  , exec = require('child_process').exec
  , fs = require('fs')
  , d = require('d-utils')
  
var install = exports.install = function (pkg, wd, cb) {
  
  var repo
    , deps = pkg.dependencies
    , paths = {
        base: path.join(wd, 'node_modules'),
        install: path.join(wd, 'node_modules', pkg.name),
        packageJson: path.join(wd, 'node_modules', pkg.name, 'package.json')    
      }

  try {
    repo = pkg.repo.url 
    if(pkg.repo.type !== 'git')
      throw new Error ('only repo.type == "git" is currently supported')  
  } catch (err) {
    callback(err)
  }

  //install deps ... recursive. 

  //install X, y -> y' in testspace

  //mkdir testspace/[random]
  //mkdir testspace/[random]/node_modules
  //cd testspace/[random]/node_modules
  //git clone X pkg.name --recurisve //pull if there is ready a module there!

  //if deps, install deps before running npm install
  //cd X && npm install
 
  //on an error, stop

  var out = {}
  pkg.output = out
  function cmd(name, ary, dir, cb) {
    out[name] = ''
    var child = exec(ary.join(' '), {cwd: dir}, function (err,sout,serr) {
      cb(err, sout, serr)
    })
    child.stdout.on('data', function (d) {
      out[name] += d
    })
    child.stderr.on('data', function (d) {
      out[name] += d
    })  
  }
  ctrl.seq(
    [ [mkdirP,paths.base,0755]
    , [cmd,'git', ['git clone', repo, pkg.name, '--recursive'], paths.base]
    , [fs.readFile,paths.packageJson, 'utf-8']
    , function (json) { //parse package.json
        pkg.package = JSON.parse(json)
        this.next()
      }
    , function () { // install recursively
        //inlining a group caller is wrong.
        //give ctrlflow group syntax
/*
        var deps = 0
          , errors = []
          , next = this.next
        pkg.installed = {} 
        if (!pkg.dependencies)
          return next()
        var g = d.map(pkg.dependencies, function (value, key) {
            return [[install,{repo: value, name: key}, paths.install]]
          })
        console.log(g)
        ctrl.group(g, next)*/

/*        (function () {
          d.map(pkg.dependencies, function (value, key) {
            return [[install,{repo: value, name: key}, paths.install]]
          })
        })()*/
        
        var deps = 0
          , errors = []
          , next = this.next
        pkg.installed = {} 
        if (!pkg.dependencies)
          return next()
        d.map(pkg.dependencies, function (value, key) {
          deps ++
          console.log({repo: value, name: key})
          install({repo: value, name: key}, paths.install, function (err, pack) {
            if(err)
              errors.push(err)

            pkg.installed[key] = pack
          
            if(!--deps)
              next(errors.length ? errors : null)
          })
        })
        //*/
    },
      [cmd,'npm', ['npm install'], paths.installed]
    ])(function (err) {
      cb(err,pkg)
    })
  
  //submodules init
  //install deps
  //exec npm install
  //
}