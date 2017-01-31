var fs = require('fs');
var xml2js = require('xml2js');
var json2csv = require('json2csv');
var fieldSchema = ['fullName','label','description','type','referenceTo','length','required','unique',
              'trackHistory','trackTrending','trackFeedHistory','formula','pickListValues', 'defaultPicklistValue', 'pickListControllingField'];


var objectDirectory = __dirname + '/objects/';
files = fs.readdirSync(__dirname + '/objects/');
var writeStream = fs.createWriteStream('completeResultUML.txt');
var partialWriteStream = fs.createWriteStream('partialResultUML.txt');
var writeStreamObjects = fs.createWriteStream('completeObjectDeclaration.txt');
var partialwriteStreamObjects = fs.createWriteStream('partialObjectDeclaration.txt');
var partialwriteStreamObjectsDetailed = fs.createWriteStream('partialObjectDeclarationWithDetails.txt');

for (var i = 0; i < files.length; i++) {
  analyzeObjectFile(files[i]);
}


function analyzeObjectFile(objectName) {
  var parser = new xml2js.Parser();

  fs.readFile(objectDirectory + objectName, function(err, data) {
      parser.parseString(data, function (err, result) {
          var objData = result.CustomObject.fields;
          var objName = objectName.replace('.object','');
          var label = (result.CustomObject.label) ? result.CustomObject.label : objName;
          var objDeclaration = 'object ' +'\"' +label+'\"' +' as '+objName;
          writeStreamObjects.write(objDeclaration+'\n');

          var referenceSet = [];
          var mappingFieldSet = [];
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
              var baseRow = objName + ' --|> ' + reference;
              var simplerRow = baseRow+'\n';
              var rowToWrite = baseRow+' : '+element.fullName+'\n';
              mappingFieldSet.push({fieldName : element.fullName,referenceTo : reference, objName});
              writeStream.write(rowToWrite);
              if(referenceSet.indexOf(reference[0]) > -1){
                continue;
              }
              referenceSet.push(reference[0]);
              partialWriteStream.write(simplerRow);

            }

          }
          writeStream.write('\n');


          if(!hasLookUp){
            return;
          }
          partialwriteStreamObjectsDetailed.write(objDeclaration+'\n\n');
          partialwriteStreamObjects.write(objDeclaration+'\n\n');
          for (var referenceKey in mappingFieldSet) {
            var element = mappingFieldSet[referenceKey];
            partialwriteStreamObjectsDetailed.write(objName + ' : ' +element.fieldName+' = '+element.referenceTo+'\n');
          }
          partialwriteStreamObjectsDetailed.write('\n');
      });
  });
}
