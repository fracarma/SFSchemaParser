var fs = require('fs');
var xml2js = require('xml2js');
var json2csv = require('json2csv');
var fieldSchema = ['fullName','label','description','type','referenceTo','length','required','unique',
              'trackHistory','trackTrending','trackFeedHistory','formula','pickListValues', 'defaultPicklistValue', 'pickListControllingField'];


var objectDirectory = __dirname + '/objects/';
files = fs.readdirSync(__dirname + '/objects/');
var writeStream = fs.createWriteStream('resultUML.txt');
var partialWriteStream = fs.createWriteStream('resumeResultUML.txt');
var writeStreamObjects = fs.createWriteStream('objectDeclaration.txt');
var partialwriteStreamObjects = fs.createWriteStream('partialObjectDeclaration.txt');

for (var i = 0; i < files.length; i++) {
  analyzeObjectFile(files[i]);
}


function analyzeObjectFile(objectName) {
  var parser = new xml2js.Parser();

  fs.readFile(objectDirectory + objectName, function(err, data) {
      parser.parseString(data, function (err, result) {
          var objData = result.CustomObject.fields;
          var label = (result.CustomObject.label) ? result.CustomObject.label : objectName.replace('.object','');
          var objDeclaration = 'object ' +'\"' +label+'\"' +' as '+objectName.replace('.object','');
          writeStreamObjects.write(objDeclaration+'\n');

          var referenceSet = [];
          var hasLookUp = false;
          for (var i in objData) {
            if (objData.hasOwnProperty(i)) {
              var element = objData[i];
              if(element.type[0] !== 'Lookup'){
                continue;
              }
              hasLookUp = true;
              var reference = (element.referenceTo) ? element.referenceTo : (''+element.fullName).replace('Id','');
              reference = (reference === 'Parent') ? label : reference;
              var baseRow = objectName.replace('.object','') + ' --|> ' + reference;
              var simplerRow = baseRow+'\n';
              var rowToWrite = baseRow+' : '+element.fullName+'\n';
              writeStream.write(rowToWrite);
              if(referenceSet.indexOf(reference[0]) > -1){
                continue;
              }
              referenceSet.push(reference[0]);
              partialWriteStream.write(simplerRow);

            }
          }

          if(hasLookUp){
            partialwriteStreamObjects.write(objDeclaration+'\n');
          }
      });
  });
}
