var plantuml = require('node-plantuml');
var fs = require('fs');

var gen = plantuml.generate("completeResultUML.txt",{format: 'svg'});
gen.out.pipe(fs.createWriteStream("output-file.svg"));
