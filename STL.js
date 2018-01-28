var fs = require('fs');

var args = process.argv.slice(2);
console.log(args);

// codec
const direct_mapping = {
    0x8a: "\u000a", // line break

    0xa8: "\u00a4", // ¤
    0xa9: "\u2018", // ‘
    0xaa: "\u201C", // “
    0xab: "\u00AB", // «
    0xac: "\u2190", // ←
    0xad: "\u2191", // ↑
    0xae: "\u2192", // →
    0xaf: "\u2193", // ↓

    0xb4: "\u00D7", // ×
    0xb8: "\u00F7", // ÷
    0xb9: "\u2019", // ’
    0xba: "\u201D", // ”
    0xbc: "\u00BC", // ¼
    0xbd: "\u00BD", // ½
    0xbe: "\u00BE", // ¾
    0xbf: "\u00BF", // ¿

    0xd0: "\u2015", // ―
    0xd1: "\u00B9", // ¹
    0xd2: "\u00AE", // ®
    0xd3: "\u00A9", // ©
    0xd4: "\u2122", // ™
    0xd5: "\u266A", // ♪
    0xd6: "\u00AC", // ¬
    0xd7: "\u00A6", // ¦
    0xdc: "\u215B", // ⅛
    0xdd: "\u215C", // ⅜
    0xde: "\u215D", // ⅝
    0xdf: "\u215E", // ⅞

    0xe0: "\u2126", // Ohm Ω
    0xe1: "\u00C6", // Æ
    0xe2: "\u0110", // Đ
    0xe3: "\u00AA", // ª
    0xe4: "\u0126", // Ħ
    0xe6: "\u0132", // Ĳ
    0xe7: "\u013F", // Ŀ
    0xe8: "\u0141", // Ł
    0xe9: "\u00D8", // Ø
    0xea: "\u0152", // Œ
    0xeb: "\u00BA", // º
    0xec: "\u00DE", // Þ
    0xed: "\u0166", // Ŧ
    0xee: "\u014A", // Ŋ
    0xef: "\u0149", // ŉ

    0xf0: "\u0138", // ĸ
    0xf1: "\u00E6", // æ
    0xf2: "\u0111", // đ
    0xf3: "\u00F0", // ð
    0xf4: "\u0127", // ħ
    0xf5: "\u0131", // ı
    0xf6: "\u0133", // ĳ
    0xf7: "\u0140", // ŀ
    0xf8: "\u0142", // ł
    0xf9: "\u00F8", // ø
    0xfa: "\u0153", // œ
    0xfb: "\u00DF", // ß
    0xfc: "\u00FE", // þ
    0xfd: "\u0167", // ŧ
    0xfe: "\u014B", // ŋ
    0xff: "\u00AD", // Soft hyphen
}

let identical = Array.from(new Array(95), (x,i) => i+32)
identical = identical.concat([0x00, 0xa0, 0xa1, 0xa2, 0xa3, 0xa5, 0xa7, 0xab, 0xb0, 0xb1, 0xb2, 0xb3, 0xb5, 0xb6, 0xb7, 0xbb, 0xbc, 0xbd, 0xbe, 0xbf])
function pad(n) {
    return ('0' + n).slice(-2);
}
function pad3(n) {
    return ('0' + n).slice(-3);
}
function time_2_tcr(t){
    const hrs = pad(t.slice(0,1).readUIntBE(0, 1));
    const mins = pad(t.slice(1,2).readUIntBE(0, 1));
    const sec = pad(t.slice(2,3).readUIntBE(0, 1));
    const ff = pad3(t.slice(3,4).readUIntBE(0, 1)*40);
    return hrs+":"+mins+":"+sec+","+ff;
}

function decode(input){
    let output = ""
    for (let charInd in input){
        let char = input[charInd];
        if(identical.includes(char)){
            output +=String.fromCharCode(char);
        } else if(char in direct_mapping){
            output += direct_mapping[char];
        }
    }
    return output;
}

let file = args[0];
console.log("file : "+file);
let data =null;

try {  
    data = fs.readFileSync(file);
    // console.log("data length : "+data.length);  
} catch(e) {
    console.log('Error:', e.stack);
}


const gsi_len = 1024
const tti_len = 128

// READ GSI block
let gsi_block = data.slice(0,1024);

// format string for GSI block
// 3s8sc2s2s32s32s32s32s32s32s16s6s6s2s5s5s3s2s2s1s8s8s1s1s3s32s32s32s75x576s
// segmented GSI block data
let gsi = {
    codePageNumber : gsi_block.slice(0,3).toString(), // 3s
    framerate : gsi_block.slice(3,11).toString(), // 8s
    displayStandardCode : gsi_block.slice(11,12).toString(), // c
    characterCodeTableNumber :  gsi_block.slice(12,14).toString(), // 2s
    languageCode : gsi_block.slice(14,16).toString(), // 2s
    originalProgramTitle : gsi_block.slice(16,48).toString(), // 32s
    originalEpisodeTitle : gsi_block.slice(48,80).toString(), // 32s
    translatedEpisodeTitle : gsi_block.slice(80,112).toString(), // 32s
    translatedProgramTitle : gsi_block.slice(112,144).toString(), // 32s
    translatorName : gsi_block.slice(144,176).toString(), // 32s
    translatorContactDetails : gsi_block.slice(176,208).toString(), // 32s
    subtitleListReferenceCode : gsi_block.slice(208,224).toString(), // 16s
    creationDate : gsi_block.slice(224,230).toString(), // 6s
    revisionDate : gsi_block.slice(230,236).toString(), // 6s
    revisionNumber : gsi_block.slice(236, 238).toString(), // 2s
    totalNumberBlocks : gsi_block.slice(238, 243).toString(), // 5s
    totalNumberSubtitles : gsi_block.slice(243, 248).toString(), // 5s
    totalNumberSubtitleGroups : gsi_block.slice(248,251).toString(), // 3s
    maximumNumberDisplayableCharacters : gsi_block.slice(251,253).toString(), // 2s
    maximumNumberDisplayableRows : gsi_block.slice(253,255).toString(), //2s
    timecodeStatus : gsi_block.slice(255,256).toString(), // s
    timecodeStartOfProgramme : gsi_block.slice(256,264).toString(), // 8s
    timecodeFirstCue : gsi_block.slice(264,272).toString(), // 8s
    totalNumberDisks : gsi_block.slice(272,273).toString(), // 1s
    diskSequenceNumber : gsi_block.slice(273,274).toString(), // 1s
    countryOfOrigin : gsi_block.slice(274,277).toString(), // 3s
    publisher : gsi_block.slice(277,309).toString(), // 32s
    editorName : gsi_block.slice(309,341).toString(), // 32s
    editorContactDetails : gsi_block.slice(341,373).toString(), // 32s
    unknownArea : gsi_block.slice(373,448).toString(),// 75x
    userDefinedArea : gsi_block.slice(448).toString() // 576s
}
// console.log(gsi);

// READ TTI blocks
let k = (data.length-1024)/128;
let stl_output = []
for(let n = 0; n<k; n++){
    let tti_block = data.slice((n)*128+1024,(n+1)*128+1024);
    let tti = {
        subtitleGroupNumber:  tti_block.slice(0,1).readUIntBE(0,1),
        subtitleNumber:       tti_block.slice(1,3).readUIntBE(0, 2),
        extensionBlockNumber: tti_block.slice(3,4).readUIntBE(0, 1),
        cumulativeStatus:     tti_block.slice(4,5).readUIntBE(0, 1),
        timecodeIn:           time_2_tcr(tti_block.slice(5,9)),
        timecodeOut:          time_2_tcr(tti_block.slice(9,13)),
        verticalPosition:     tti_block.slice(13,14).readUIntBE(0, 1),
        justificationCode:    tti_block.slice(14,15).readUIntBE(0, 1),
        commentFlag:          tti_block.slice(15,16).readUIntBE(0, 1),
        text:                 decode(tti_block.slice(16,128)),
    }
    stl_output.push(tti);
    console.log(decode(tti_block.slice(16,128)));
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    // break;
}

// console.log(stl_output);


