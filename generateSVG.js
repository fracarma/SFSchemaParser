var plantuml = require('node-plantuml');
var fs = require('fs');

var resultsDirectory = __dirname + '/results/';
var resultsSingleObjectDirectory = resultsDirectory + 'singleObjects/';
var svgUMLDirectory = resultsDirectory + 'svgUML/';
var svgUMLSingleObjectsDirectory = svgUMLDirectory + 'singleObjectsSVG/';

// var gen = plantuml.generate(resultsDirectory+'/completeResultUML.txt',{format: 'svg'});
// gen.out.pipe(fs.createWriteStream(svgUMLDirectory+"completeResultUML.svg"));

files = fs.readdirSync(resultsSingleObjectDirectory);

for (var i = 0; i < files.length; i++) {
  generateUML(files[i]);
}

function generateUML(objectName){
  var fileLocation = 'results/singleObjects/'+objectName;
  var gen = plantuml.generate(fileLocation,{format: 'svg'});
  gen.out.pipe(fs.createWriteStream(svgUMLSingleObjectsDirectory+objectName.replace('uml','')+"svg"));
  console.log(fileLocation);
}
