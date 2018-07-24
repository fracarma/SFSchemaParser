var fs = require('fs');
var xml2js = require('xml2js');
var json2csv = require('json2csv');
var fieldSchema = ['fullName','label','description','type','length','required','unique',
              'trackHistory','trackTrending','trackFeedHistory','formula','pickListValues', 'defaultPicklistValue', 'pickListControllingField'];


var objectDirectory = __dirname + '/objects/';
files = fs.readdirSync(__dirname + '/objects/');

for (var i = 0; i < files.length; i++) {
  analyzeObjectFile(files[i]);
}



function analyzeObjectFile(objectName) {
  var parser = new xml2js.Parser();
  fs.readFile(objectDirectory + objectName, function(err, data) {
      parser.parseString(data, function (err, result) {
          var objData = result.CustomObject.fields;
          for (var i in objData) {
            if (objData.hasOwnProperty(i)) {
              var element = objData[i];
              arrayToString(element);
            }
          }
          json2csv({ data: objData, fields: fieldSchema}, function(err, csv) {
            fs.writeFile('results/'+objectName.replace('.object','') + '.csv', csv, function(err) {
              if (err){
                throw err;
              }
              console.log(objectName + ': file saved');
            });
          });

      });
  });
}

function arrayToString(element) {
  for (var variable in element) {
    if (element.hasOwnProperty(variable)) {
      if(element[variable][0] === 'Picklist'){
        formatPickListValues(element);
      }

      if(typeof element[variable][0] == 'string'){
        element[variable] = element[variable][0];
      } else {
        arrayToString(element[variable]);
      }
    }
  }
}

function formatPickListValues(element) {
  var controllingField = '';
  if (!element.valueSet){
    return;
  }
  if (!element.valueSet[0].valueSetDefinition){
    return;
  }
  if(element.valueSet[0].hasOwnProperty('controllingField')){
    controllingField = element.valueSet[0].controllingField[0];
  }
  var pickListValues = element.valueSet[0].valueSetDefinition[0].value;
  var pickListValuesToString = '';
  var defaultPicklistValue = '';
  for (var i in pickListValues) {
    if (pickListValues.hasOwnProperty(i)) {
      pickListValuesToString += pickListValues[i].fullName[0] + ' - ';
      if(pickListValues[i].default[0]){
        defaultPicklistValue = pickListValues[i].fullName[0];
      }
    }
  }
  pickListValuesToString = pickListValuesToString.slice(0, -3);
  element.pickListValues = pickListValuesToString;
  element.defaultPicklistValue = defaultPicklistValue;
  element.pickListControllingField = controllingField;
}
