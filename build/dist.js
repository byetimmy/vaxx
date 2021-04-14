let fs = require('fs-extra');
let AdmZip = require('adm-zip');

let pjson = require('../package.json');

//clean up any old build or temp files, make sure we have fresh folders
let tempDir = './tmp/';
try {
  fs.removeSync(tempDir);
} catch (e) {
  console.info('temp dir not found.');
}
fs.ensureDir(tempDir);

let distDir = './dist/';
try {
  fs.removeSync(distDir);
} catch (e) {
  console.info('dist dir not found.');
}
fs.ensureDir(distDir);


//these are the files/folders we need to work
let sourceFiles = [
  'src',
  '.gitignore',
  '.dockerignore',
  'Dockerfile',
  'Dockerrun.aws.json',
  'package.json',
  'README.md'
];

//first, copy all of the sources into the tmp folder
sourceFiles.forEach(function(path) {
  let tempPath = tempDir + path;
  fs.copySync(path, tempPath);
});

//lastly, we'll zip it up so it can be deployed in and breanstalk app
//Zip file will be located in the /dist folder
let zip = new AdmZip();
let buildFileName = distDir + pjson.name + '-' + pjson.version + '.zip';

sourceFiles.forEach(function(path) {
  let tempPath = tempDir + path;
  let p = fs.statSync(tempPath);
  if (p.isFile()) {
    zip.addLocalFile(tempPath);
  } else if (p.isDirectory()) {
    zip.addLocalFolder(tempPath, path);
  }
});
zip.writeZip(buildFileName);

//finally clean up the tmp dir
try {
  fs.removeSync(tempDir);
} catch (e) {}

console.log('\nDone building: ' + buildFileName + '\n\n');