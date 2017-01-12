var fs = require('fs');

function replaceCheck(code) {
    // Should match the broken checks from Emscripten 1.26.0
    // but not the seemingly good ones from Emscripten 1.37.1
    const regex = /(var ENVIRONMENT_IS_NODE =) (typeof process.*)/g;
    const proper = "(typeof window !== 'object' && typeof process === 'object' && typeof require === 'function');"
    
    return code.replace(regex, function(prefix, check) {
        return prefix + proper;
    });
}

function main() {
    var inputfile = process.argv[2];

    var input = fs.readFileSync(inputfile, 'utf-8');
    var output = replaceCheck(input);
    fs.writeFileSync(inputfile, output, 'utf-8');
}

main();
