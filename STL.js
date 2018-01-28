var fs = require('fs');
var iconv = require('iconv-lite');

var args = process.argv.slice(2);
console.log(args);

let file = args[0];
console.log("file : "+file);
fs.readFile(file, 'utf-8' ,function(err, data){
    if(err) throw err;
    console.log(data.length);
})

let str = iconv.decode(new Buffer([0x68, 0x65, 0x6c, 0x6c, 0x6f]), 'win1251');
console.log(str);

let win1251decoder = new TextDecoder('windows-1251');
let bytes = new Uint8Array([207, 240, 232, 226, 229, 242, 44, 32, 236, 232, 240, 33]);
console.log(win1251decoder.decode(bytes))