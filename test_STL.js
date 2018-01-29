var STL = require('./STL');

var args = process.argv.slice(2);
console.log(args);

let file = args[0];
console.log("file : "+file);

let stl_obj = new STL(file);
let output = stl_obj.decode();
stl_obj.encode(output);
