// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    var data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  throw 'NO_DYNAMIC_EXECUTION was set, cannot eval';
}
if (!Module['load'] && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
if (!Module['thisProgram']) {
  Module['thisProgram'] = './this.program';
}

// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in: 
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at: 
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Compiletime.isNumberType(field) || Compiletime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Compiletime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    assert(ret % 2 === 0);
    table.push(func);
    for (var i = 0; i < 2-1; i++) table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    abort('NO_DYNAMIC_EXECUTION was set, cannot eval, so EM_ASM is not functional');
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func]) {
      sigCache[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return sigCache[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          (((codePoint - 0x10000) / 0x400)|0) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((low>>>0)+((high>>>0)*4294967296)) : ((low>>>0)+((high|0)*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    abort('NO_DYNAMIC_EXECUTION was set, cannot eval - ccall/cwrap are not functional');
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var stack = 0;
  var JSfuncs = {
    'stackSave' : function() {
      stack = Runtime.stackSave();
    },
    'stackRestore' : function() {
      Runtime.stackRestore(stack);
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        ret = Runtime.stackAlloc((str.length << 2) + 1);
        writeStringToMemory(str, ret);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface. 
  ccall = function ccallFunc(ident, returnType, argTypes, args) {
    var func = getCFunc(ident);
    var cArgs = [];
    assert(returnType !== 'array', 'Return type should not be "array".');
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) JSfuncs['stackRestore']();
    return ret;
  }

  var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }
  var JSsource = {};
  for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
      // Elements of toCsource are arrays of three items:
      // the code, and the return value
      JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
  }

  
  cwrap = function cwrap(ident, returnType, argTypes) {
    argTypes = argTypes || [];
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      funcstr += JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=' + convertCode.returnValue + ';';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    if (!numericArgs) {
      // If we had a stack, restore it
      funcstr += JSsource['stackRestore'].body + ';';
    }
    funcstr += 'return ret})';
    abort('NO_DYNAMIC_EXECUTION was set, cannot eval - ccall is not functional');
  };
})();
Module["cwrap"] = cwrap;
Module["ccall"] = ccall;


function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;


function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  if (length === 0) return '';
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;


function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;


function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;


function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var hasLibcxxabi = !!Module['___cxa_demangle'];
  if (hasLibcxxabi) {
    try {
      var buf = _malloc(func.length);
      writeStringToMemory(func.substr(1), buf);
      var status = _malloc(4);
      var ret = Module['___cxa_demangle'](buf, 0, 0, status);
      if (getValue(status, 'i32') === 0 && ret) {
        return Pointer_stringify(ret);
      }
      // otherwise, libcxxabi failed, we can try ours which may return a partial result
    } catch(e) {
      // failure when using libcxxabi, we can try ours which may return a partial result
    } finally {
      if (buf) _free(buf);
      if (status) _free(status);
      if (ret) _free(ret);
    }
  }
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  var final = func;
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    final = parse();
  } catch(e) {
    final += '?';
  }
  if (final.indexOf('?') >= 0 && !hasLibcxxabi) {
    Runtime.warnOnce('warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  }
  return final;
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  return demangleAll(jsStackTrace());
}
Module['stackTrace'] = stackTrace;

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}


var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;


// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['buffer'] = buffer;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module.printErr('Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module["noExitRuntime"] = true or build with -s NO_EXIT_RUNTIME=1');
  }
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools


function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))>>0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))>>0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 4664;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });

var _stderr;
var _stderr=_stderr=allocate(1, "i32*", ALLOC_STATIC);


























































































































































































































































































































var __ZN17HostCommunicationC1Ev;
var __ZN7NetworkC1EP2IO;
var __ZN8SubGraphC1Ev;
var __ZNSt9bad_allocC1Ev;
var __ZNSt9bad_allocD1Ev;
/* memory initializer */ allocate([116,101,114,109,105,110,97,116,105,110,103,0,0,0,0,0,99,97,110,110,111,116,32,122,101,114,111,32,111,117,116,32,116,104,114,101,97,100,32,118,97,108,117,101,32,102,111,114,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,40,41,0,0,0,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,102,111,114,101,105,103,110,32,101,120,99,101,112,116,105,111,110,0,0,0,99,97,110,110,111,116,32,99,114,101,97,116,101,32,112,116,104,114,101,97,100,32,107,101,121,32,102,111,114,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,40,41,0,0,0,0,0,0,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,101,120,99,101,112,116,105,111,110,32,111,102,32,116,121,112,101,32,37,115,0,0,0,0,0,0,0,0,116,101,114,109,105,110,97,116,101,95,104,97,110,100,108,101,114,32,117,110,101,120,112,101,99,116,101,100,108,121,32,116,104,114,101,119,32,97,110,32,101,120,99,101,112,116,105,111,110,0,0,0,0,0,0,0,112,116,104,114,101,97,100,95,111,110,99,101,32,102,97,105,108,117,114,101,32,105,110,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,95,102,97,115,116,40,41,0,0,0,0,0,0,0,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,101,120,99,101,112,116,105,111,110,32,111,102,32,116,121,112,101,32,37,115,58,32,37,115,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,116,101,114,109,105,110,97,116,101,95,104,97,110,100,108,101,114,32,117,110,101,120,112,101,99,116,101,100,108,121,32,114,101,116,117,114,110,101,100,0,117,110,99,97,117,103,104,116,0,0,0,0,0,0,0,0,62,0,0,0,0,0,0,0,19,0,0,0,0,0,0,0,19,0,0,0,0,0,0,0,111,0,0,0,0,0,0,0,0,0,0,0,240,11,0,0,110,0,0,0,112,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,1,0,0,32,1,0,0,14,1,0,0,80,0,0,0,44,0,0,0,158,0,0,0,100,0,0,0,154,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,12,0,0,0,1,0,0,238,0,0,0,14,1,0,0,80,0,0,0,44,0,0,0,12,0,0,0,4,1,0,0,28,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,12,0,0,128,0,0,0,90,0,0,0,156,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,12,0,0,206,0,0,0,64,0,0,0,214,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,12,0,0,34,1,0,0,140,0,0,0,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,12,0,0,226,0,0,0,98,0,0,0,222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,12,0,0,246,0,0,0,26,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,12,0,0,116,0,0,0,10,1,0,0,142,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,12,0,0,38,1,0,0,120,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,12,0,0,6,0,0,0,162,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,12,0,0,56,0,0,0,212,0,0,0,232,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,12,0,0,24,0,0,0,36,1,0,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,12,0,0,20,0,0,0,168,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,12,0,0,134,0,0,0,166,0,0,0,20,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,13,0,0,2,1,0,0,126,0,0,0,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,13,0,0,118,0,0,0,40,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,13,0,0,10,0,0,0,180,0,0,0,22,1,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,96,0,0,0,222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,13,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,13,0,0,174,0,0,0,82,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,13,0,0,160,0,0,0,4,0,0,0,230,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,13,0,0,42,1,0,0,144,0,0,0,130,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,13,0,0,240,0,0,0,104,0,0,0,122,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,13,0,0,204,0,0,0,124,0,0,0,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,13,0,0,148,0,0,0,46,0,0,0,18,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,13,0,0,210,0,0,0,54,0,0,0,222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,13,0,0,146,0,0,0,40,1,0,0,250,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,13,0,0,2,0,0,0,188,0,0,0,190,0,0,0,152,0,0,0,172,0,0,0,178,0,0,0,60,0,0,0,132,0,0,0,198,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,13,0,0,86,0,0,0,216,0,0,0,136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,13,0,0,170,0,0,0,32,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,13,0,0,192,0,0,0,236,0,0,0,250,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,6,1,0,0,114,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,14,0,0,42,0,0,0,176,0,0,0,196,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,14,0,0,222,0,0,0,222,0,0,0,222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,14,0,0,194,0,0,0,84,0,0,0,138,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,14,0,0,30,0,0,0,200,0,0,0,254,0,0,0,106,0,0,0,234,0,0,0,18,0,0,0,92,0,0,0,24,1,0,0,78,0,0,0,184,0,0,0,16,1,0,0,36,0,0,0,252,0,0,0,202,0,0,0,96,0,0,0,164,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,14,0,0,244,0,0,0,242,0,0,0,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,14,0,0,222,0,0,0,222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,14,0,0,208,0,0,0,74,0,0,0,182,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,14,0,0,186,0,0,0,34,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,14,0,0,224,0,0,0,102,0,0,0,220,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,14,0,0,76,0,0,0,94,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,57,83,101,114,105,97,108,79,117,116,0,0,0,0,0,0,57,77,97,112,76,105,110,101,97,114,0,0,0,0,0,0,57,67,111,110,115,116,114,97,105,110,0,0,0,0,0,0,57,67,111,109,112,111,110,101,110,116,0,0,0,0,0,0,57,66,111,111,108,84,111,73,110,116,0,0,0,0,0,0,56,83,117,98,71,114,97,112,104,0,0,0,0,0,0,0,56,83,101,114,105,97,108,73,110,0,0,0,0,0,0,0,56,80,119,109,87,114,105,116,101,0,0,0,0,0,0,0,55,70,111,114,119,97,114,100,0,0,0,0,0,0,0,0,53,84,105,109,101,114,0,0,53,83,112,108,105,116,0,0,53,82,111,117,116,101,0,0,53,67,111,117,110,116,0,0,52,71,97,116,101,0,0,0,50,73,79,0,0,0,0,0,50,54,78,101,116,119,111,114,107,78,111,116,105,102,105,99,97,116,105,111,110,72,97,110,100,108,101,114,0,0,0,0,50,51,69,109,115,99,114,105,112,116,101,110,72,111,115,116,84,114,97,110,115,112,111,114,116,0,0,0,0,0,0,0,50,50,80,117,114,101,70,117,110,99,116,105,111,110,67,111,109,112,111,110,101,110,116,50,73,57,66,111,111,108,101,97,110,79,114,98,98,69,0,0,50,50,80,117,114,101,70,117,110,99,116,105,111,110,67,111,109,112,111,110,101,110,116,50,73,51,77,105,110,108,108,69,0,0,0,0,0,0,0,0,50,50,80,117,114,101,70,117,110,99,116,105,111,110,67,111,109,112,111,110,101,110,116,50,73,51,77,97,120,108,108,69,0,0,0,0,0,0,0,0,50,50,80,117,114,101,70,117,110,99,116,105,111,110,67,111,109,112,111,110,101,110,116,50,73,49,50,78,117,109,98,101,114,69,113,117,97,108,115,108,108,69,0,0,0,0,0,0,50,50,80,117,114,101,70,117,110,99,116,105,111,110,67,111,109,112,111,110,101,110,116,50,73,49,48,66,111,111,108,101,97,110,65,110,100,98,98,69,0,0,0,0,0,0,0,0,50,49,83,105,110,103,108,101,79,117,116,112,117,116,67,111,109,112,111,110,101,110,116,0,49,55,82,101,97,100,67,97,112,97,99,105,116,105,118,101,80,105,110,0,0,0,0,0,49,55,72,111,115,116,67,111,109,109,117,110,105,99,97,116,105,111,110,0,0,0,0,0,49,53,72,121,115,116,101,114,101,115,105,115,76,97,116,99,104,0,0,0,0,0,0,0,49,53,66,114,101,97,107,66,101,102,111,114,101,77,97,107,101,0,0,0,0,0,0,0,49,52,68,117,109,109,121,67,111,109,112,111,110,101,110,116,0,0,0,0,0,0,0,0,49,51,84,111,103,103,108,101,66,111,111,108,101,97,110,0,49,51,73,110,118,101,114,116,66,111,111,108,101,97,110,0,49,51,72,111,115,116,84,114,97,110,115,112,111,114,116,0,49,50,76,101,100,77,97,116,114,105,120,77,97,120,0,0,49,50,69,109,115,99,114,105,112,116,101,110,73,79,0,0,49,50,68,105,103,105,116,97,108,87,114,105,116,101,0,0,49,50,68,101,98,117,103,72,97,110,100,108,101,114,0,0,49,49,68,105,103,105,116,97,108,82,101,97,100,0,0,0,49,48,77,111,110,105,116,111,114,80,105,110,0,0,0,0,49,48,65,114,100,117,105,110,111,85,110,111,0,0,0,0,49,48,65,110,97,108,111,103,82,101,97,100,0,0,0,0,64,2,0,0,208,7,0,0,64,2,0,0,224,7,0,0,16,2,0,0,240,7,0,0,232,11,0,0,0,0,0,0,16,2,0,0,0,8,0,0,48,12,0,0,0,0,0,0,16,2,0,0,40,8,0,0,32,12,0,0,0,0,0,0,16,2,0,0,80,8,0,0,64,12,0,0,0,0,0,0,16,2,0,0,120,8,0,0,64,12,0,0,0,0,0,0,16,2,0,0,160,8,0,0,224,11,0,0,0,0,0,0,16,2,0,0,200,8,0,0,160,13,0,0,0,0,0,0,16,2,0,0,216,8,0,0,160,13,0,0,0,0,0,0,16,2,0,0,232,8,0,0,160,13,0,0,0,0,0,0,64,2,0,0,248,8,0,0,16,2,0,0,8,9,0,0,160,13,0,0,0,0,0,0,16,2,0,0,24,9,0,0,128,12,0,0,0,0,0,0,16,2,0,0,40,9,0,0,160,13,0,0,0,0,0,0,16,2,0,0,56,9,0,0,160,13,0,0,0,0,0,0,16,2,0,0,72,9,0,0,160,13,0,0,0,0,0,0,16,2,0,0,88,9,0,0,160,13,0,0,0,0,0,0,16,2,0,0,96,9,0,0,128,12,0,0,0,0,0,0,16,2,0,0,104,9,0,0,160,13,0,0,0,0,0,0,16,2,0,0,112,9,0,0,160,13,0,0,0,0,0,0,16,2,0,0,120,9,0,0,160,13,0,0,0,0,0,0,64,2,0,0,128,9,0,0,16,2,0,0,136,9,0,0,88,14,0,0,0,0,0,0,16,2,0,0,168,9,0,0,32,14,0,0,0,0,0,0,16,2,0,0,200,9,0,0,128,12,0,0,0,0,0,0,16,2,0,0,240,9,0,0,128,12,0,0,0,0,0,0,16,2,0,0,24,10,0,0,128,12,0,0,0,0,0,0,16,2,0,0,64,10,0,0,128,12,0,0,0,0,0,0,16,2,0,0,112,10,0,0,128,12,0,0,0,0,0,0,16,2,0,0,160,10,0,0,128,12,0,0,0,0,0,0,16,2,0,0,184,10,0,0,240,13,0,0,0,0,0,0,16,2,0,0,208,10,0,0,48,13,0,0,0,0,0,0,16,2,0,0,232,10,0,0,160,13,0,0,0,0,0,0,16,2,0,0,0,11,0,0,128,12,0,0,0,0,0,0,16,2,0,0,24,11,0,0,128,12,0,0,0,0,0,0,16,2,0,0,48,11,0,0,160,13,0,0,0,0,0,0,16,2,0,0,64,11,0,0,160,13,0,0,0,0,0,0,64,2,0,0,80,11,0,0,16,2,0,0,96,11,0,0,160,13,0,0,0,0,0,0,16,2,0,0,112,11,0,0,40,13,0,0,0,0,0,0,16,2,0,0,128,11,0,0,160,13,0,0,0,0,0,0,64,2,0,0,144,11,0,0,16,2,0,0,160,11,0,0,160,13,0,0,0,0,0,0,16,2,0,0,176,11,0,0,160,13,0,0,0,0,0,0,16,2,0,0,192,11,0,0,128,12,0,0,0,0,0,0,16,2,0,0,208,11,0,0,160,13,0,0,0,0,0,0,117,67,47,70,108,111,48,49,10,0,0,0,0,0,0,0,15,1,0,0,0,0,0,0,11,27,0,0,0,0,0,0,11,28,0,0,0,0,0,0,11,9,0,0,0,0,0,0,12,1,2,0,0,0,0,0,12,2,3,0,0,0,0,0,13,1,0,7,44,1,0,0,13,3,1,7,13,0,0,0,20,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,184,1,0,0,0,0,0,0,117,67,47,70,108,111,48,49,60,66,66,66,66,66,66,60,16,24,20,16,16,16,16,16,126,2,2,126,64,64,64,126,62,2,2,62,2,2,62,0,8,24,40,72,254,8,8,8,60,32,32,60,4,4,60,0,60,32,32,60,36,36,60,0,62,34,4,8,8,8,8,8,0,62,34,34,62,34,34,62,62,34,34,62,2,2,2,62,8,20,34,62,34,34,34,34,60,34,34,62,34,34,60,0,60,64,64,64,64,64,60,0,124,66,66,66,66,66,124,0,124,64,64,124,64,64,64,124,124,64,64,124,64,64,64,64,60,64,64,64,64,68,68,60,68,68,68,124,68,68,68,68,124,16,16,16,16,16,16,124,60,8,8,8,8,8,72,48,0,36,40,48,32,48,40,36,64,64,64,64,64,64,64,124,129,195,165,153,129,129,129,129,0,66,98,82,74,70,66,0,60,66,66,66,66,66,66,60,60,34,34,34,60,32,32,32,28,34,34,34,34,38,34,29,60,34,34,34,60,36,34,33,0,30,32,32,62,2,2,60,0,62,8,8,8,8,8,8,66,66,66,66,66,66,34,28,66,66,66,66,66,66,36,24,0,73,73,73,73,42,28,0,0,65,34,20,8,20,34,65,65,34,20,8,8,8,8,8,0,127,2,4,8,16,32,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
function runPostSets() {


}

var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    }function _memcpy(dest, src, num) {
  
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[((dest)>>0)]=HEAP8[((src)>>0)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[((dest)>>0)]=HEAP8[((src)>>0)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  var EXCEPTIONS={last:0,caught:[],infos:{},deAdjust:function (adjusted) {
        if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
        for (var ptr in EXCEPTIONS.infos) {
          var info = EXCEPTIONS.infos[ptr];
          if (info.adjusted === adjusted) {
            return ptr;
          }
        }
        return adjusted;
      },addRef:function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        info.refcount++;
      },decRef:function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        assert(info.refcount > 0);
        info.refcount--;
        if (info.refcount === 0) {
          if (info.destructor) {
            Runtime.dynCall('vi', info.destructor, [ptr]);
          }
          delete EXCEPTIONS.infos[ptr];
          ___cxa_free_exception(ptr);
        }
      },clearRef:function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        info.refcount = 0;
      }};
  function ___resumeException(ptr) {
      if (!EXCEPTIONS.last) { EXCEPTIONS.last = ptr; }
      EXCEPTIONS.clearRef(EXCEPTIONS.deAdjust(ptr)); // exception refcount should be cleared, but don't free it
      throw ptr;
    }function ___cxa_find_matching_catch() {
      var thrown = EXCEPTIONS.last;
      if (!thrown) {
        // just pass through the null ptr
        return tempRet0 = 0,0;
      }
      var info = EXCEPTIONS.infos[thrown];
      var throwntype = info.type;
      if (!throwntype) {
        // just pass through the thrown ptr
        return tempRet0 = 0,thrown;
      }
      var typeArray = Array.prototype.slice.call(arguments);
  
      var pointer = Module['___cxa_is_pointer_type'](throwntype);
      // can_catch receives a **, add indirection
      if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);
      HEAP32[((___cxa_find_matching_catch.buffer)>>2)]=thrown;
      thrown = ___cxa_find_matching_catch.buffer;
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (typeArray[i] && Module['___cxa_can_catch'](typeArray[i], throwntype, thrown)) {
          thrown = HEAP32[((thrown)>>2)]; // undo indirection
          info.adjusted = thrown;
          return tempRet0 = typeArray[i],thrown;
        }
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      thrown = HEAP32[((thrown)>>2)]; // undo indirection
      return tempRet0 = throwntype,thrown;
    }function ___gxx_personality_v0() {
    }

  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }

  function ___cxa_throw(ptr, type, destructor) {
      EXCEPTIONS.infos[ptr] = {
        ptr: ptr,
        adjusted: ptr,
        type: type,
        destructor: destructor,
        refcount: 0
      };
      EXCEPTIONS.last = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr;
    }

  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }

  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }

  function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      EXCEPTIONS.caught.push(ptr);
      EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
      return ptr;
    }

  var _llvm_va_start=undefined;

  
  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.buffer.byteLength which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },getFileDataAsRegularArray:function (node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr; // Returns a copy of the original data.
        }
        return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
      },getFileDataAsTypedArray:function (node) {
        if (!node.contents) return new Uint8Array;
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function (node, newCapacity) {
  
        // If we are asked to expand the size of a file that already exists, revert to using a standard JS array to store the file
        // instead of a typed array. This makes resizing the array more flexible because we can just .push() elements at the back to
        // increase the size.
        if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
          node.contents = MEMFS.getFileDataAsRegularArray(node);
          node.usedBytes = node.contents.length; // We might be writing to a lazy-loaded file which had overridden this property, so force-reset it.
        }
  
        if (!node.contents || node.contents.subarray) { // Keep using a typed array if creating a new storage, or if old one was a typed array as well.
          var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
          if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
          // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
          // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
          // avoid overshooting the allocation cap by a very large margin.
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity); // Allocate new storage.
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
          return;
        }
        // Not using a typed array to back the file storage. Use a standard JS array instead.
        if (!node.contents && newCapacity > 0) node.contents = [];
        while (node.contents.length < newCapacity) node.contents.push(0);
      },resizeFileStorage:function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
          return;
        }
  
        if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
          return;
        }
        // Backing with a JS array.
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) { // Can we just reuse the buffer we are given?
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
          else
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          node.usedBytes = Math.max(node.usedBytes, position+length);
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        if (typeof indexedDB !== 'undefined') return indexedDB;
        var ret = null;
        if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        assert(ret, 'IDBFS used, but indexedDB not supported');
        return ret;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
          // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.chmod(path, entry.mode);
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        var err = FS.nodePermissions(dir, 'x');
        if (err) return err;
        if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
        return 0;
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        if (!PATH.resolve(oldpath)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var err = FS.mayOpen(node, flags);
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device;
        if (typeof crypto !== 'undefined') {
          // for modern web browsers
          var randomBuffer = new Uint8Array(1);
          random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
        } else if (ENVIRONMENT_IS_NODE) {
          // for nodejs
          random_device = function() { return require('crypto').randomBytes(1)[0]; };
        } else {
          // default for ES5 platforms
          random_device = function() { return (Math.random()*256)|0; };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = this;
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperty(node, "usedBytes", {
            get: function() { return this.contents.length; }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        // If Module['websocket'] has already been defined (e.g. for configuring
        // the subprotocol/url) use that, if not initialise it to a new object.
        Module['websocket'] = (Module['websocket'] && 
                               ('object' === typeof Module['websocket'])) ? Module['websocket'] : {};
  
        // Add the Event registration mechanism to the exported websocket configuration
        // object so we can register network callbacks from native JavaScript too.
        // For more documentation see system/include/emscripten/emscripten.h
        Module['websocket']._callbacks = {};
        Module['websocket']['on'] = function(event, callback) {
  	    if ('function' === typeof callback) {
  		  this._callbacks[event] = callback;
          }
  	    return this;
        };
  
        Module['websocket'].emit = function(event, param) {
  	    if ('function' === typeof this._callbacks[event]) {
  		  this._callbacks[event].call(this, param);
          }
        };
  
        // If debug is enabled register simple default logging callbacks for each Event.
  
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          error: null, // Used in getsockopt for SOL_SOCKET/SO_ERROR test
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces '//' comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the '#' for '//' again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                var parts = addr.split('/');
                url = url + parts[0] + ":" + port + "/" + parts.slice(1).join('/');
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
  
            Module['websocket'].emit('open', sock.stream.fd);
  
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
            Module['websocket'].emit('message', sock.stream.fd);
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('close', function() {
              Module['websocket'].emit('close', sock.stream.fd);
            });
            peer.socket.on('error', function(error) {
              // Although the ws library may pass errors that may be more descriptive than
              // ECONNREFUSED they are not necessarily the expected error code e.g. 
              // ENOTFOUND on getaddrinfo seems to be node.js specific, so using ECONNREFUSED
              // is still probably the most useful thing to do.
              sock.error = ERRNO_CODES.ECONNREFUSED; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
              Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onclose = function() {
              Module['websocket'].emit('close', sock.stream.fd);
            };
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
            peer.socket.onerror = function(error) {
              // The WebSocket spec only allows a 'simple event' to be thrown on error,
              // so we only really know as much as ECONNREFUSED.
              sock.error = ERRNO_CODES.ECONNREFUSED; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
              Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          Module['websocket'].emit('listen', sock.stream.fd); // Send Event with listen fd.
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
              Module['websocket'].emit('connection', newsock.stream.fd);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
              Module['websocket'].emit('connection', sock.stream.fd);
            }
          });
          sock.server.on('closed', function() {
            Module['websocket'].emit('close', sock.stream.fd);
            sock.server = null;
          });
          sock.server.on('error', function(error) {
            // Although the ws library may pass errors that may be more descriptive than
            // ECONNREFUSED they are not necessarily the expected error code e.g. 
            // ENOTFOUND on getaddrinfo seems to be node.js specific, so using EHOSTUNREACH
            // is still probably the most useful thing to do. This error shouldn't
            // occur in a well written app as errors should get trapped in the compiled
            // app's own getaddrinfo call.
            sock.error = ERRNO_CODES.EHOSTUNREACH; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
            Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'EHOSTUNREACH: Host is unreachable']);
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return (bytesWritten / size)|0;
      }
    }
  
  
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[((curr)>>0)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[((textIndex)>>0)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)>>0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)>>0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)>>0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)>>0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)>>0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)>>0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[((i)>>0)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }

  function _llvm_va_end() {}

  function _abort() {
      Module['abort']();
    }

  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)>>0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }

  function _llvm_lifetime_start() {}

  function _llvm_lifetime_end() {}

  
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[((ptr)>>0)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[((ptr)>>0)]=value;
        ptr = (ptr+1)|0;
      }
      return (ptr-num)|0;
    }var _llvm_memset_p0i8_i64=_memset;

  
  var PTHREAD_SPECIFIC={};function _pthread_setspecific(key, value) {
      if (!(key in PTHREAD_SPECIFIC)) {
        return ERRNO_CODES.EINVAL;
      }
      PTHREAD_SPECIFIC[key] = value;
      return 0;
    }

  function _pthread_once(ptr, func) {
      if (!_pthread_once.seen) _pthread_once.seen = {};
      if (ptr in _pthread_once.seen) return;
      Runtime.dynCall('v', func);
      _pthread_once.seen[ptr] = 1;
    }

  function _pthread_getspecific(key) {
      return PTHREAD_SPECIFIC[key] || 0;
    }

  
  var PTHREAD_SPECIFIC_NEXT_KEY=1;function _pthread_key_create(key, destructor) {
      if (key == 0) {
        return ERRNO_CODES.EINVAL;
      }
      HEAP32[((key)>>2)]=PTHREAD_SPECIFIC_NEXT_KEY;
      // values start at 0
      PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0;
      PTHREAD_SPECIFIC_NEXT_KEY++;
      return 0;
    }

  
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
        Module.printErr('exception during cxa_free_exception: ' + e);
      }
    }function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      __THREW__ = 0;
      // Call destructor if one is registered then clear it.
      var ptr = EXCEPTIONS.caught.pop();
      if (ptr) {
        EXCEPTIONS.decRef(EXCEPTIONS.deAdjust(ptr));
        EXCEPTIONS.last = 0; // XXX in decRef?
      }
    }

  function ___errno_location() {
      return ___errno_state;
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: {
          if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }






  
  
  function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode;
      Browser.mainLoop.timingValue = value;
  
      if (!Browser.mainLoop.func) {
        console.error('emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.');
        return 1; // Return non-zero on failure, can't set timing mode when there is no main loop.
      }
  
      if (mode == 0 /*EM_TIMING_SETTIMEOUT*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler() {
          setTimeout(Browser.mainLoop.runner, value); // doing this each time means that on exception, we stop
        };
        Browser.mainLoop.method = 'timeout';
      } else if (mode == 1 /*EM_TIMING_RAF*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'rAF';
      }
      return 0;
    }function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg) {
      Module['noExitRuntime'] = true;
  
      assert(!Browser.mainLoop.func, 'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.');
  
      Browser.mainLoop.func = func;
      Browser.mainLoop.arg = arg;
  
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
  
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              // not counted, but move the progress along a tiny bit
              next = next + 0.5; // do not steal all the next one's progress
              Browser.mainLoop.remainingBlockers = (8*remaining + next)/9;
            }
          }
          console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + ' ms'); //, left: ' + Browser.mainLoop.remainingBlockers);
          Browser.mainLoop.updateStatus();
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
  
        // catch pauses from non-main loop sources
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
        // Implement very basic swap interval control
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1/*EM_TIMING_RAF*/ && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
          // Not the scheduled time to render this frame - skip.
          Browser.mainLoop.scheduler();
          return;
        }
  
        // Signal GL rendering layer that processing of a new frame is about to start. This helps it optimize
        // VBO double-buffering and reduce GPU stalls.
  
        if (Browser.mainLoop.method === 'timeout' && Module.ctx) {
          Module.printErr('Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!');
          Browser.mainLoop.method = ''; // just warn once per call to set main loop
        }
  
        Browser.mainLoop.runIter(function() {
          if (typeof arg !== 'undefined') {
            Runtime.dynCall('vi', func, [arg]);
          } else {
            Runtime.dynCall('v', func);
          }
        });
  
        // catch pauses from the main loop itself
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
        // Queue new audio data. This is important to be right after the main loop invocation, so that we will immediately be able
        // to queue the newest produced audio samples.
        // TODO: Consider adding pre- and post- rAF callbacks so that GL.newRenderingFrameStarted() and SDL.audio.queueNewAudioData()
        //       do not need to be hardcoded into this function, but can be more generic.
        if (typeof SDL === 'object' && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  
        Browser.mainLoop.scheduler();
      }
  
      if (fps && fps > 0) _emscripten_set_main_loop_timing(0/*EM_TIMING_SETTIMEOUT*/, 1000.0 / fps);
      else _emscripten_set_main_loop_timing(1/*EM_TIMING_RAF*/, 1); // Do rAF by rendering each frame (no decimating)
  
      Browser.mainLoop.scheduler();
  
      if (simulateInfiniteLoop) {
        throw 'SimulateInfiniteLoop';
      }
    }var Browser={mainLoop:{scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:function () {
          Browser.mainLoop.scheduler = null;
          Browser.mainLoop.currentlyRunningMainloop++; // Incrementing this signals the previous main loop that it's now become old, and it must return.
        },resume:function () {
          Browser.mainLoop.currentlyRunningMainloop++;
          var timingMode = Browser.mainLoop.timingMode;
          var timingValue = Browser.mainLoop.timingValue;
          var func = Browser.mainLoop.func;
          Browser.mainLoop.func = null;
          _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg);
          _emscripten_set_main_loop_timing(timingMode, timingValue);
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          contextHandle = GL.createContext(canvas, contextAttributes);
          if (contextHandle) {
            ctx = GL.getContext(contextHandle).GLctx;
          }
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll': 
            delta = event.detail;
            break;
          case 'mousewheel': 
            delta = event.wheelDelta;
            break;
          case 'wheel': 
            delta = event['deltaY'];
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle;
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + TOTAL_STACK;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");



var FUNCTION_TABLE = [0,0,__ZN17HostCommunication9emitDebugE10DebugLevel7DebugId,0,__ZN22PureFunctionComponent2I9BooleanOrbbED0Ev,0,__ZN8PwmWriteD2Ev,0,__ZN10MonitorPin9interruptEPv,0,__ZN2IOD2Ev,0,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZN4Gate7processE6Packeta,0,__ZN10__cxxabiv112_GLOBAL__N_110construct_Ev,0,__ZN12EmscriptenIO10SerialReadEh,0,__ZN5SplitD2Ev,0,__ZN8SerialIn7processE6Packeta,0,__ZN5TimerD2Ev,0,__ZN9BoolToIntD0Ev,0,__ZNKSt9bad_alloc4whatEv,0,__ZN12EmscriptenIOD2Ev,0,__ZN15BreakBeforeMakeD0Ev,0,__ZN10MonitorPinD0Ev,0,__ZN12EmscriptenIO10AnalogReadEa,0,__ZN5Split7processE6Packeta,0,__ZN4GateD0Ev,0,__ZN13InvertBooleanD2Ev,0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZN22PureFunctionComponent2I10BooleanAndbbED0Ev,0,__ZN13ToggleBoolean7processE6Packeta,0,__ZN8PwmWrite7processE6Packeta,0,__ZN10AnalogRead7processE6Packeta,0,__ZN21SingleOutputComponentD0Ev,0,__ZN7ForwardD2Ev,0,__ZN23EmscriptenHostTransport11sendCommandEPKhh,0,__ZN17HostCommunication19networkStateChangedEN7Network5StateE,0,__ZL25default_terminate_handlerv,0,__ZN9MapLinearD0Ev,0,__ZN9BoolToInt7processE6Packeta,0,__ZNSt9bad_allocC2Ev,0,__ZN15BreakBeforeMake7processE6Packeta,0,__ZN8SubGraphC2Ev,0,__ZN11DigitalReadD0Ev,0,__ZN10AnalogReadD2Ev,0,__ZN12EmscriptenIO12PinSetPullupEaN2IO10PullupModeE,0,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,0,__ZN23EmscriptenHostTransport7runTickEv,0,__ZN12LedMatrixMaxD0Ev,0,__ZN15HysteresisLatchD2Ev,0,__ZN10MonitorPin7processE6Packeta,0,__ZN9SerialOutD0Ev,0,__ZN12EmscriptenIO11SerialWriteEhh,0,__ZN10AnalogReadD0Ev,0,__ZN2IO18TimerCurrentMicrosEv,0,__ZN9ComponentD0Ev,0,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZN10ArduinoUnoD0Ev,0,__ZN22PureFunctionComponent2I3MaxllED0Ev,0,__ZN12EmscriptenIO11SerialBeginEhi,0,__ZN9Constrain7processE6Packeta,0,__ZNSt9bad_allocD2Ev,0,__ZNSt9bad_allocD0Ev,0,__ZN13ToggleBooleanD0Ev,0,__ZN8SubGraphD2Ev,0,__ZN4GateD2Ev,0,__ZN8SerialInD0Ev,0,__ZN22PureFunctionComponent2I3MaxllE7processE6Packeta,0,__ZN22PureFunctionComponent2I12NumberEqualsllED0Ev,0,__ZN5CountD0Ev,0,__ZN9SerialOutD2Ev,0,__ZN22PureFunctionComponent2I3MinllE7processE6Packeta,0,__ZN17HostCommunication17subgraphConnectedEbhaha,0,__ZN5RouteD2Ev,0,__ZN15HysteresisLatch7processE6Packeta,0,__ZN12LedMatrixMax7processE6Packeta,0,__ZN9ConstrainD0Ev,0,__ZN8SubGraph7processE6Packeta,0,__ZN22PureFunctionComponent2I3MinllED0Ev,0,__ZN17ReadCapacitivePinD2Ev,0,__ZN22PureFunctionComponent2I10BooleanAndbbED2Ev,0,__ZN5Timer7processE6Packeta,0,__ZN17HostCommunication15packetDeliveredEi7Message,0,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZN9SerialOut7processE6Packeta,0,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZN22PureFunctionComponent2I9BooleanOrbbED2Ev,0,__ZN8PwmWriteD0Ev,0,__ZN12EmscriptenIO23AttachExternalInterruptEhN2IO9Interrupt4ModeEPFvPvES3_,0,__ZN5RouteD0Ev,0,__ZN5SplitD0Ev,0,__ZN15BreakBeforeMakeD2Ev,0,__ZN17HostCommunication9nodeAddedEP9Componenth,0,__ZN23EmscriptenHostTransport5setupEP2IOP17HostCommunication,0,__ZN13InvertBooleanD0Ev,0,__ZN17HostCommunication14nodesConnectedEP9ComponentaS1_a,0,__ZN2IOD0Ev,0,__ZN11DigitalRead7processE6Packeta,0,__ZN12EmscriptenIO12DigitalWriteEab,0,__ZN10MonitorPinD2Ev,0,__ZN17HostCommunication12debugChangedE10DebugLevel,0,__ZN17HostCommunication10packetSentEi7MessageP9Componenta,0,__ZN14DummyComponentD2Ev,0,__ZN12LedMatrixMaxD2Ev,0,__ZN13InvertBoolean7processE6Packeta,0,__ZN17HostCommunication23portSubscriptionChangedEhab,0,__ZN12EmscriptenIOD0Ev,0,__ZN12EmscriptenIO14TimerCurrentMsEv,0,__ZN22PureFunctionComponent2I12NumberEqualsllED2Ev,0,__ZN9MapLinearD2Ev,0,__ZN11DigitalReadD2Ev,0,__ZN21SingleOutputComponentD2Ev,0,__ZN7ForwardD0Ev,0,__ZN9MapLinear7processE6Packeta,0,__ZN15HysteresisLatchD0Ev,0,__ZN5Count7processE6Packeta,0,__ZN10ArduinoUno7processE6Packeta,0,___cxa_pure_virtual,0,__ZN10ArduinoUnoD2Ev,0,__ZN9ComponentD2Ev,0,__ZN7NetworkC2EP2IO,0,__ZN22PureFunctionComponent2I9BooleanOrbbE7processE6Packeta,0,__ZN7Forward7processE6Packeta,0,__ZN12EmscriptenIO19SerialDataAvailableEh,0,__ZN14DummyComponentD0Ev,0,__ZN10__cxxabiv117__class_type_infoD0Ev,0,__ZN22PureFunctionComponent2I3MaxllED2Ev,0,__ZN12DigitalWriteD0Ev,0,__ZN12DigitalWriteD2Ev,0,__ZN9BoolToIntD2Ev,0,__ZN22PureFunctionComponent2I12NumberEqualsllE7processE6Packeta,0,__ZN14DummyComponent7processE6Packeta,0,__ZN12EmscriptenIO8PwmWriteEal,0,__ZN12EmscriptenIO10setIoValueEPKhh,0,__ZN10__cxxabiv116__shim_type_infoD2Ev,0,__ZN5CountD2Ev,0,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZN13ToggleBooleanD2Ev,0,__ZN10__cxxabiv112_GLOBAL__N_19destruct_EPv,0,__ZN8SubGraphD0Ev,0,__ZN12DigitalWrite7processE6Packeta,0,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,0,__ZN12EmscriptenIO11DigitalReadEa,0,__ZN22PureFunctionComponent2I10BooleanAndbbE7processE6Packeta,0,__ZN5Route7processE6Packeta,0,__ZN2IO10setIoValueEPKhh,0,__ZN12EmscriptenIO10PinSetModeEaN2IO7PinModeE,0,__ZNSt9bad_allocD2Ev,0,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZN17HostCommunicationC2Ev,0,__ZN10__cxxabiv120__si_class_type_infoD0Ev,0,__ZN9ConstrainD2Ev,0,__ZN5TimerD0Ev,0,__ZN8SerialInD2Ev,0,__ZN17ReadCapacitivePinD0Ev,0,__ZN22PureFunctionComponent2I3MinllED2Ev,0];

// EMSCRIPTEN_START_FUNCS

function __ZNK6Packet6asBoolEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $2=$this;
 var $3=$2;
 var $4=(($3+4)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)==3;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 $1=1;
 label=4;break;
 case 3: 
 var $9=(($3)|0);
 var $10=$9;
 var $11=HEAP8[(($10)>>0)];
 var $12=(($11)&1);
 $1=$12;
 label=4;break;
 case 4: 
 var $14=$1;
 STACKTOP=sp;return $14;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet9asIntegerEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $2=$this;
 var $3=$2;
 var $4=(($3+4)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)==3;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 $1=0;
 label=4;break;
 case 3: 
 var $9=(($3)|0);
 var $10=$9;
 var $11=HEAP32[(($10)>>2)];
 $1=$11;
 label=4;break;
 case 4: 
 var $13=$1;
 STACKTOP=sp;return $13;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet7asFloatEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $2=$this;
 var $3=$2;
 var $4=(($3+4)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)==3;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 $1=0;
 label=4;break;
 case 3: 
 var $9=(($3)|0);
 var $10=$9;
 var $11=HEAPF32[(($10)>>2)];
 $1=$11;
 label=4;break;
 case 4: 
 var $13=$1;
 STACKTOP=sp;return $13;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet6asByteEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $2=$this;
 var $3=$2;
 var $4=(($3+4)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)==3;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 $1=0;
 label=4;break;
 case 3: 
 var $9=(($3)|0);
 var $10=$9;
 var $11=HEAP8[(($10)>>0)];
 $1=$11;
 label=4;break;
 case 4: 
 var $13=$1;
 STACKTOP=sp;return $13;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN17HostCommunicationC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN26NetworkNotificationHandlerC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1464;
 var $5=(($2+4)|0);
 HEAP32[(($5)>>2)]=0;
 var $6=(($2+8)|0);
 HEAP32[(($6)>>2)]=0;
 var $7=(($2+12)|0);
 HEAP8[(($7)>>0)]=0;
 var $8=(($2+24)|0);
 HEAP32[(($8)>>2)]=2;
 var $9=(($2+28)|0);
 HEAP32[(($9)>>2)]=1;
 STACKTOP=sp;return;
}


function __ZN26NetworkNotificationHandlerC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN12DebugHandlerC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1152;
 STACKTOP=sp;return;
}


function __ZN17HostCommunication5setupEP7NetworkP13HostTransport($this,$net,$t){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$net;
 $3=$t;
 var $4=$1;
 var $5=$2;
 var $6=(($4+4)|0);
 HEAP32[(($6)>>2)]=$5;
 var $7=$3;
 var $8=(($4+8)|0);
 HEAP32[(($8)>>2)]=$7;
 label=2;break;
 case 2: 
 var $10=$4;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($10,2,1);
 label=3;break;
 case 3: 
 var $12=(($4+4)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=$4;
 __ZN7Network22setNotificationHandlerEP26NetworkNotificationHandler($13,$14);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($handler,$level,$code){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$handler;
 $2=$level;
 $3=$code;
 var $4=$1;
 var $5=($4|0)!=0;
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 var $7=$1;
 var $8=$7;
 var $9=HEAP32[(($8)>>2)];
 var $10=(($9)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=$2;
 var $13=$3;
 FUNCTION_TABLE[$11]($7,$12,$13);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network22setNotificationHandlerEP26NetworkNotificationHandler($this,$handler){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$handler;
 var $3=$1;
 var $4=$2;
 var $5=(($3+1008)|0);
 HEAP32[(($5)>>2)]=$4;
 var $6=$2;
 var $7=$6;
 var $8=(($3+1012)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=(($9+4)|0);
 HEAP32[(($10)>>2)]=$7;
 STACKTOP=sp;return;
}


function __ZN17HostCommunication9parseByteEc($this,$b){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$this;
 $2=$b;
 var $3=$1;
 var $4=$2;
 var $5=(($3+12)|0);
 var $6=HEAP8[(($5)>>0)];
 var $7=((($6)+(1))&255);
 HEAP8[(($5)>>0)]=$7;
 var $8=($6&255);
 var $9=(($3+13)|0);
 var $10=(($9+$8)|0);
 HEAP8[(($10)>>0)]=$4;
 var $11=(($3+24)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=($12|0)==0;
 if($13){label=2;break;}else{label=14;break;}
 case 2: 
 label=3;break;
 case 3: 
 var $16=$3;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($16,4,6);
 label=4;break;
 case 4: 
 var $18=(($3+12)|0);
 var $19=HEAP8[(($18)>>0)];
 var $20=($19&255);
 var $21=($20|0)==8;
 if($21){label=5;break;}else{label=13;break;}
 case 5: 
 var $23=(($3+13)|0);
 var $24=(($23)|0);
 var $25=_memcmp($24,3848,8);
 var $26=($25|0)==0;
 if($26){label=6;break;}else{label=9;break;}
 case 6: 
 label=7;break;
 case 7: 
 var $29=$3;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($29,3,31);
 label=8;break;
 case 8: 
 var $31=(($3+8)|0);
 var $32=HEAP32[(($31)>>2)];
 var $33=$32;
 var $34=HEAP32[(($33)>>2)];
 var $35=(($34+8)|0);
 var $36=HEAP32[(($35)>>2)];
 FUNCTION_TABLE[$36]($32,472,1);
 var $37=(($3+24)|0);
 HEAP32[(($37)>>2)]=1;
 label=12;break;
 case 9: 
 label=10;break;
 case 10: 
 var $40=$3;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($40,1,18);
 label=11;break;
 case 11: 
 var $42=(($3+24)|0);
 HEAP32[(($42)>>2)]=-1;
 label=12;break;
 case 12: 
 var $44=(($3+12)|0);
 HEAP8[(($44)>>0)]=0;
 label=13;break;
 case 13: 
 label=42;break;
 case 14: 
 var $47=(($3+24)|0);
 var $48=HEAP32[(($47)>>2)];
 var $49=($48|0)==1;
 if($49){label=15;break;}else{label=25;break;}
 case 15: 
 label=16;break;
 case 16: 
 var $52=$3;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($52,4,7);
 label=17;break;
 case 17: 
 var $54=(($3+12)|0);
 var $55=HEAP8[(($54)>>0)];
 var $56=($55&255);
 var $57=($56|0)==8;
 if($57){label=18;break;}else{label=24;break;}
 case 18: 
 var $59=(($3+13)|0);
 var $60=(($59)|0);
 var $61=_memcmp($60,3848,8);
 var $62=($61|0)==0;
 if($62){label=19;break;}else{label=22;break;}
 case 19: 
 label=20;break;
 case 20: 
 var $65=$3;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($65,3,31);
 label=21;break;
 case 21: 
 var $67=(($3+8)|0);
 var $68=HEAP32[(($67)>>2)];
 var $69=$68;
 var $70=HEAP32[(($69)>>2)];
 var $71=(($70+8)|0);
 var $72=HEAP32[(($71)>>2)];
 FUNCTION_TABLE[$72]($68,464,1);
 label=23;break;
 case 22: 
 __ZN17HostCommunication8parseCmdEv($3);
 label=23;break;
 case 23: 
 var $75=(($3+12)|0);
 HEAP8[(($75)>>0)]=0;
 label=24;break;
 case 24: 
 label=41;break;
 case 25: 
 var $78=(($3+24)|0);
 var $79=HEAP32[(($78)>>2)];
 var $80=($79|0)==2;
 if($80){label=26;break;}else{label=32;break;}
 case 26: 
 label=27;break;
 case 27: 
 var $83=$3;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($83,4,17);
 label=28;break;
 case 28: 
 var $85=$2;
 var $86=(($85<<24)>>24);
 var $87=HEAP8[((3848)>>0)];
 var $88=(($87<<24)>>24);
 var $89=($86|0)==($88|0);
 if($89){label=29;break;}else{label=30;break;}
 case 29: 
 var $91=(($3+24)|0);
 HEAP32[(($91)>>2)]=0;
 var $92=$2;
 var $93=(($3+13)|0);
 var $94=(($93)|0);
 HEAP8[(($94)>>0)]=$92;
 var $95=(($3+12)|0);
 HEAP8[(($95)>>0)]=1;
 label=31;break;
 case 30: 
 var $97=(($3+12)|0);
 HEAP8[(($97)>>0)]=0;
 label=31;break;
 case 31: 
 label=40;break;
 case 32: 
 var $100=(($3+24)|0);
 var $101=HEAP32[(($100)>>2)];
 var $102=($101|0)==-1;
 if($102){label=33;break;}else{label=36;break;}
 case 33: 
 label=34;break;
 case 34: 
 var $105=$3;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($105,1,4);
 label=35;break;
 case 35: 
 var $107=(($3+12)|0);
 HEAP8[(($107)>>0)]=0;
 var $108=(($3+24)|0);
 HEAP32[(($108)>>2)]=2;
 label=39;break;
 case 36: 
 label=37;break;
 case 37: 
 var $111=$3;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($111,1,5);
 label=38;break;
 case 38: 
 var $113=(($3+12)|0);
 HEAP8[(($113)>>0)]=0;
 var $114=(($3+24)|0);
 HEAP32[(($114)>>2)]=2;
 label=39;break;
 case 39: 
 label=40;break;
 case 40: 
 label=41;break;
 case 41: 
 label=42;break;
 case 42: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN17HostCommunication8parseCmdEv($this){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+56)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $cmd;
 var $c;
 var $packetType;
 var $p=sp;
 var $2=(sp)+(8);
 var $val;
 var $3=(sp)+(16);
 var $4=(sp)+(24);
 var $5=(sp)+(32);
 var $cmd1=(sp)+(40);
 var $isOutput;
 var $subgraphNode;
 var $subgraphPort;
 var $childNode;
 var $childPort;
 var $cmd2=(sp)+(48);
 $1=$this;
 var $6=$1;
 var $7=(($6+13)|0);
 var $8=(($7)|0);
 var $9=HEAP8[(($8)>>0)];
 var $10=($9&255);
 $cmd=$10;
 var $11=$cmd;
 var $12=($11|0)==14;
 if($12){label=2;break;}else{label=5;break;}
 case 2: 
 label=3;break;
 case 3: 
 var $15=$6;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($15,3,32);
 label=4;break;
 case 4: 
 var $17=(($6+8)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=$18;
 var $20=HEAP32[(($19)>>2)];
 var $21=(($20+8)|0);
 var $22=HEAP32[(($21)>>2)];
 FUNCTION_TABLE[$22]($18,480,1);
 var $23=(($6+24)|0);
 HEAP32[(($23)>>2)]=2;
 label=69;break;
 case 5: 
 var $25=$cmd;
 var $26=($25|0)==10;
 if($26){label=6;break;}else{label=7;break;}
 case 6: 
 var $28=(($6+4)|0);
 var $29=HEAP32[(($28)>>2)];
 __ZN7Network5resetEv($29);
 label=68;break;
 case 7: 
 var $31=$cmd;
 var $32=($31|0)==20;
 if($32){label=8;break;}else{label=9;break;}
 case 8: 
 var $34=(($6+4)|0);
 var $35=HEAP32[(($34)>>2)];
 __ZN7Network5startEv($35);
 label=67;break;
 case 9: 
 var $37=$cmd;
 var $38=($37|0)==11;
 if($38){label=10;break;}else{label=15;break;}
 case 10: 
 label=11;break;
 case 11: 
 var $41=$6;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($41,3,2);
 label=12;break;
 case 12: 
 var $43=(($6+13)|0);
 var $44=(($43+1)|0);
 var $45=HEAP8[(($44)>>0)];
 var $46=__Z15createComponenth($45);
 $c=$46;
 label=13;break;
 case 13: 
 var $48=$6;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($48,3,3);
 label=14;break;
 case 14: 
 var $50=(($6+4)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=$c;
 var $53=(($6+13)|0);
 var $54=(($53+2)|0);
 var $55=HEAP8[(($54)>>0)];
 var $56=__ZN7Network7addNodeEP9Componenth($51,$52,$55);
 label=66;break;
 case 15: 
 var $58=$cmd;
 var $59=($58|0)==12;
 if($59){label=16;break;}else{label=19;break;}
 case 16: 
 label=17;break;
 case 17: 
 var $62=$6;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($62,3,13);
 label=18;break;
 case 18: 
 var $64=(($6+4)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=(($6+13)|0);
 var $67=(($66+1)|0);
 var $68=HEAP8[(($67)>>0)];
 var $69=(($6+13)|0);
 var $70=(($69+3)|0);
 var $71=HEAP8[(($70)>>0)];
 var $72=(($6+13)|0);
 var $73=(($72+2)|0);
 var $74=HEAP8[(($73)>>0)];
 var $75=(($6+13)|0);
 var $76=(($75+4)|0);
 var $77=HEAP8[(($76)>>0)];
 __ZN7Network7connectEhaha($65,$68,$71,$74,$77);
 label=65;break;
 case 19: 
 var $79=$cmd;
 var $80=($79|0)==13;
 if($80){label=20;break;}else{label=39;break;}
 case 20: 
 var $82=(($6+13)|0);
 var $83=(($82+3)|0);
 var $84=HEAP8[(($83)>>0)];
 var $85=($84&255);
 $packetType=$85;
 __ZN6PacketC2Ev($p);
 var $86=$packetType;
 var $87=($86|0)==9;
 if($87){label=23;break;}else{label=21;break;}
 case 21: 
 var $89=$packetType;
 var $90=($89|0)==10;
 if($90){label=23;break;}else{label=22;break;}
 case 22: 
 var $92=$packetType;
 var $93=($92|0)==3;
 if($93){label=23;break;}else{label=24;break;}
 case 23: 
 var $95=$packetType;
 __ZN6PacketC2E3Msg($2,$95);
 var $96=$p;
 var $97=$2;
 assert(8 % 1 === 0);HEAP32[(($96)>>2)]=HEAP32[(($97)>>2)];HEAP32[((($96)+(4))>>2)]=HEAP32[((($97)+(4))>>2)];
 label=33;break;
 case 24: 
 var $99=$packetType;
 var $100=($99|0)==7;
 if($100){label=25;break;}else{label=26;break;}
 case 25: 
 var $102=(($6+13)|0);
 var $103=(($102+4)|0);
 var $104=HEAP8[(($103)>>0)];
 var $105=($104&255);
 var $106=(($6+13)|0);
 var $107=(($106+5)|0);
 var $108=HEAP8[(($107)>>0)];
 var $109=($108&255);
 var $110=$109<<8;
 var $111=((($105)+($110))|0);
 var $112=(($6+13)|0);
 var $113=(($112+6)|0);
 var $114=HEAP8[(($113)>>0)];
 var $115=($114&255);
 var $116=$115<<16;
 var $117=((($111)+($116))|0);
 var $118=(($6+13)|0);
 var $119=(($118+7)|0);
 var $120=HEAP8[(($119)>>0)];
 var $121=($120&255);
 var $122=$121<<24;
 var $123=((($117)+($122))|0);
 $val=$123;
 var $124=$val;
 __ZN6PacketC2El($3,$124);
 var $125=$p;
 var $126=$3;
 assert(8 % 1 === 0);HEAP32[(($125)>>2)]=HEAP32[(($126)>>2)];HEAP32[((($125)+(4))>>2)]=HEAP32[((($126)+(4))>>2)];
 label=32;break;
 case 26: 
 var $128=$packetType;
 var $129=($128|0)==4;
 if($129){label=27;break;}else{label=28;break;}
 case 27: 
 var $131=(($6+13)|0);
 var $132=(($131+4)|0);
 var $133=HEAP8[(($132)>>0)];
 __ZN6PacketC2Eh($4,$133);
 var $134=$p;
 var $135=$4;
 assert(8 % 1 === 0);HEAP32[(($134)>>2)]=HEAP32[(($135)>>2)];HEAP32[((($134)+(4))>>2)]=HEAP32[((($135)+(4))>>2)];
 label=31;break;
 case 28: 
 var $137=$packetType;
 var $138=($137|0)==6;
 if($138){label=29;break;}else{label=30;break;}
 case 29: 
 var $140=(($6+13)|0);
 var $141=(($140+4)|0);
 var $142=HEAP8[(($141)>>0)];
 var $143=($142&255);
 var $144=($143|0)==0;
 var $145=$144^1;
 __ZN6PacketC2Eb($5,$145);
 var $146=$p;
 var $147=$5;
 assert(8 % 1 === 0);HEAP32[(($146)>>2)]=HEAP32[(($147)>>2)];HEAP32[((($146)+(4))>>2)]=HEAP32[((($147)+(4))>>2)];
 label=30;break;
 case 30: 
 label=31;break;
 case 31: 
 label=32;break;
 case 32: 
 label=33;break;
 case 33: 
 var $152=__ZNK6Packet7isValidEv($p);
 if($152){label=34;break;}else{label=35;break;}
 case 34: 
 var $154=(($6+4)|0);
 var $155=HEAP32[(($154)>>2)];
 var $156=(($6+13)|0);
 var $157=(($156+1)|0);
 var $158=HEAP8[(($157)>>0)];
 var $159=(($6+13)|0);
 var $160=(($159+2)|0);
 var $161=HEAP8[(($160)>>0)];
 __ZN7Network13sendMessageIdEhaRK6Packet($155,$158,$161,$p);
 var $162=(($cmd1)|0);
 HEAP8[(($162)>>0)]=114;
 var $163=(($162+1)|0);
 var $164=(($6+13)|0);
 var $165=(($164+1)|0);
 var $166=HEAP8[(($165)>>0)];
 HEAP8[(($163)>>0)]=$166;
 var $167=(($163+1)|0);
 var $168=(($6+13)|0);
 var $169=(($168+2)|0);
 var $170=HEAP8[(($169)>>0)];
 HEAP8[(($167)>>0)]=$170;
 var $171=(($167+1)|0);
 var $172=$packetType;
 var $173=(($172)&255);
 HEAP8[(($171)>>0)]=$173;
 var $174=(($6+8)|0);
 var $175=HEAP32[(($174)>>2)];
 var $176=$175;
 var $177=HEAP32[(($176)>>2)];
 var $178=(($177+8)|0);
 var $179=HEAP32[(($178)>>2)];
 var $180=(($cmd1)|0);
 FUNCTION_TABLE[$179]($175,$180,4);
 label=38;break;
 case 35: 
 label=36;break;
 case 36: 
 var $183=$6;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($183,1,11);
 label=37;break;
 case 37: 
 label=38;break;
 case 38: 
 label=64;break;
 case 39: 
 var $187=$cmd;
 var $188=($187|0)==15;
 if($188){label=40;break;}else{label=41;break;}
 case 40: 
 var $190=(($6+4)|0);
 var $191=HEAP32[(($190)>>2)];
 var $192=(($6+13)|0);
 var $193=(($192+1)|0);
 var $194=HEAP8[(($193)>>0)];
 var $195=($194&255);
 __ZN7Network13setDebugLevelE10DebugLevel($191,$195);
 label=63;break;
 case 41: 
 var $197=$cmd;
 var $198=($197|0)==16;
 if($198){label=42;break;}else{label=43;break;}
 case 42: 
 var $200=(($6+4)|0);
 var $201=HEAP32[(($200)>>2)];
 var $202=(($6+13)|0);
 var $203=(($202+1)|0);
 var $204=HEAP8[(($203)>>0)];
 var $205=(($6+13)|0);
 var $206=(($205+2)|0);
 var $207=HEAP8[(($206)>>0)];
 var $208=(($6+13)|0);
 var $209=(($208+3)|0);
 var $210=HEAP8[(($209)>>0)];
 var $211=(($210<<24)>>24)!=0;
 __ZN7Network15subscribeToPortEhab($201,$204,$207,$211);
 label=62;break;
 case 43: 
 var $213=$cmd;
 var $214=($213|0)==17;
 if($214){label=44;break;}else{label=45;break;}
 case 44: 
 var $216=(($6+13)|0);
 var $217=(($216+1)|0);
 var $218=HEAP8[(($217)>>0)];
 var $219=($218&255);
 var $220=($219|0)!=0;
 var $221=($220&1);
 $isOutput=$221;
 var $222=(($6+13)|0);
 var $223=(($222+2)|0);
 var $224=HEAP8[(($223)>>0)];
 var $225=($224&255);
 $subgraphNode=$225;
 var $226=(($6+13)|0);
 var $227=(($226+3)|0);
 var $228=HEAP8[(($227)>>0)];
 var $229=($228&255);
 $subgraphPort=$229;
 var $230=(($6+13)|0);
 var $231=(($230+4)|0);
 var $232=HEAP8[(($231)>>0)];
 var $233=($232&255);
 $childNode=$233;
 var $234=(($6+13)|0);
 var $235=(($234+5)|0);
 var $236=HEAP8[(($235)>>0)];
 var $237=($236&255);
 $childPort=$237;
 var $238=(($6+4)|0);
 var $239=HEAP32[(($238)>>2)];
 var $240=$isOutput;
 var $241=(($240)&1);
 var $242=$subgraphNode;
 var $243=(($242)&255);
 var $244=$subgraphPort;
 var $245=(($244)&255);
 var $246=$childNode;
 var $247=(($246)&255);
 var $248=$childPort;
 var $249=(($248)&255);
 __ZN7Network15connectSubgraphEbhaha($239,$241,$243,$245,$247,$249);
 label=61;break;
 case 45: 
 var $251=$cmd;
 var $252=($251|0)==18;
 if($252){label=46;break;}else{label=47;break;}
 case 46: 
 var $254=(($cmd2)|0);
 HEAP8[(($254)>>0)]=109;
 var $255=(($254+1)|0);
 var $256=(($cmd2+1)|0);
 var $257=HEAP8[(($256)>>0)];
 HEAP8[(($255)>>0)]=$257;
 var $258=(($255+1)|0);
 var $259=(($cmd2+2)|0);
 var $260=HEAP8[(($259)>>0)];
 HEAP8[(($258)>>0)]=$260;
 var $261=(($258+1)|0);
 var $262=(($cmd2+3)|0);
 var $263=HEAP8[(($262)>>0)];
 HEAP8[(($261)>>0)]=$263;
 var $264=(($261+1)|0);
 var $265=(($cmd2+4)|0);
 var $266=HEAP8[(($265)>>0)];
 HEAP8[(($264)>>0)]=$266;
 var $267=(($264+1)|0);
 var $268=(($cmd2+5)|0);
 var $269=HEAP8[(($268)>>0)];
 HEAP8[(($267)>>0)]=$269;
 var $270=(($267+1)|0);
 var $271=(($cmd2+6)|0);
 var $272=HEAP8[(($271)>>0)];
 HEAP8[(($270)>>0)]=$272;
 var $273=(($270+1)|0);
 var $274=(($cmd2+7)|0);
 var $275=HEAP8[(($274)>>0)];
 HEAP8[(($273)>>0)]=$275;
 var $276=(($6+8)|0);
 var $277=HEAP32[(($276)>>2)];
 var $278=$277;
 var $279=HEAP32[(($278)>>2)];
 var $280=(($279+8)|0);
 var $281=HEAP32[(($280)>>2)];
 var $282=(($cmd2)|0);
 FUNCTION_TABLE[$281]($277,$282,8);
 label=60;break;
 case 47: 
 var $284=$cmd;
 var $285=($284|0)==21;
 if($285){label=48;break;}else{label=49;break;}
 case 48: 
 var $287=(($6+4)|0);
 var $288=HEAP32[(($287)>>2)];
 var $289=(($6+13)|0);
 var $290=(($289)|0);
 __ZN7Network10setIoValueEPKhh($288,$290,8);
 label=59;break;
 case 49: 
 var $292=$cmd;
 var $293=($292|0)>=115;
 if($293){label=50;break;}else{label=55;break;}
 case 50: 
 label=51;break;
 case 51: 
 var $296=(($6+13)|0);
 var $297=(($296)|0);
 var $298=_memcmp($297,3848,8);
 var $299=($298|0)==0;
 if($299){label=53;break;}else{label=52;break;}
 case 52: 
 var $301=$6;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($301,1,10);
 label=53;break;
 case 53: 
 label=54;break;
 case 54: 
 label=58;break;
 case 55: 
 label=56;break;
 case 56: 
 var $306=$6;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($306,1,9);
 label=57;break;
 case 57: 
 label=58;break;
 case 58: 
 label=59;break;
 case 59: 
 label=60;break;
 case 60: 
 label=61;break;
 case 61: 
 label=62;break;
 case 62: 
 label=63;break;
 case 63: 
 label=64;break;
 case 64: 
 label=65;break;
 case 65: 
 label=66;break;
 case 66: 
 label=67;break;
 case 67: 
 label=68;break;
 case 68: 
 label=69;break;
 case 69: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network5resetEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $i;
 $1=$this;
 var $2=$1;
 var $3=(($2+1016)|0);
 HEAP32[(($3)>>2)]=0;
 var $4=(($2+1008)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 var $8=(($2+1008)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=$9;
 var $11=HEAP32[(($10)>>2)];
 var $12=(($11+24)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=(($2+1016)|0);
 var $15=HEAP32[(($14)>>2)];
 FUNCTION_TABLE[$13]($9,$15);
 label=3;break;
 case 3: 
 $i=0;
 label=4;break;
 case 4: 
 var $18=$i;
 var $19=($18|0)<50;
 if($19){label=5;break;}else{label=11;break;}
 case 5: 
 var $21=$i;
 var $22=(($2)|0);
 var $23=(($22+($21<<2))|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=($24|0)!=0;
 if($25){label=6;break;}else{label=9;break;}
 case 6: 
 var $27=$i;
 var $28=(($2)|0);
 var $29=(($28+($27<<2))|0);
 var $30=HEAP32[(($29)>>2)];
 var $31=($30|0)==0;
 if($31){label=8;break;}else{label=7;break;}
 case 7: 
 var $33=$30;
 var $34=HEAP32[(($33)>>2)];
 var $35=(($34+4)|0);
 var $36=HEAP32[(($35)>>2)];
 FUNCTION_TABLE[$36]($30);
 label=8;break;
 case 8: 
 var $38=$i;
 var $39=(($2)|0);
 var $40=(($39+($38<<2))|0);
 HEAP32[(($40)>>2)]=0;
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 var $43=$i;
 var $44=((($43)+(1))|0);
 $i=$44;
 label=4;break;
 case 11: 
 var $46=(($2+200)|0);
 HEAP8[(($46)>>0)]=1;
 var $47=(($2+1004)|0);
 HEAP8[(($47)>>0)]=0;
 var $48=(($2+1005)|0);
 HEAP8[(($48)>>0)]=0;
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network5startEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+1016)|0);
 HEAP32[(($3)>>2)]=1;
 var $4=(($2+1008)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 var $8=(($2+1008)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=$9;
 var $11=HEAP32[(($10)>>2)];
 var $12=(($11+24)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=(($2+1016)|0);
 var $15=HEAP32[(($14)>>2)];
 FUNCTION_TABLE[$13]($9,$15);
 label=3;break;
 case 3: 
 __ZN7Network8runSetupEv($2);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __Z15createComponenth($id){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $c;
 var $3;
 var $4;
 $2=$id;
 var $5=$2;
 var $6=($5&255);
 switch(($6|0)){case 4:{ label=11;break;}case 5:{ label=14;break;}case 6:{ label=17;break;}case 1:{ label=2;break;}case 7:{ label=20;break;}case 8:{ label=23;break;}case 9:{ label=26;break;}case 10:{ label=29;break;}case 11:{ label=32;break;}case 12:{ label=35;break;}case 13:{ label=38;break;}case 14:{ label=41;break;}case 15:{ label=44;break;}case 16:{ label=47;break;}case 2:{ label=5;break;}case 17:{ label=50;break;}case 18:{ label=53;break;}case 19:{ label=56;break;}case 20:{ label=59;break;}case 21:{ label=62;break;}case 22:{ label=65;break;}case 23:{ label=68;break;}case 24:{ label=71;break;}case 25:{ label=74;break;}case 26:{ label=77;break;}case 3:{ label=8;break;}case 27:{ label=80;break;}case 28:{ label=83;break;}case 29:{ label=86;break;}default:{label=89;break;}}break;
 case 2: 
 var $8=__Znwj(36);
 var $9=$8;
 (function() { try { __THREW__ = 0; return __ZN10AnalogReadC2Ev($9) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=4;break; }
 case 3: 
 var $11=$9;
 $c=$11;
 var $12=$c;
 var $13=$2;
 __ZN9Component14setComponentIdEh($12,$13);
 var $14=$c;
 $1=$14;
 label=90;break;
 case 4: 
 var $16$0 = ___cxa_find_matching_catch(); var $16$1 = tempRet0;
 var $17=$16$0;
 $3=$17;
 var $18=$16$1;
 $4=$18;
 __ZdlPv($8);
 label=91;break;
 case 5: 
 var $20=__Znwj(184);
 var $21=$20;
 (function() { try { __THREW__ = 0; return __ZN10ArduinoUnoC2Ev($21) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=6;break; } else { label=7;break; }
 case 6: 
 var $23=$21;
 $c=$23;
 var $24=$c;
 var $25=$2;
 __ZN9Component14setComponentIdEh($24,$25);
 var $26=$c;
 $1=$26;
 label=90;break;
 case 7: 
 var $28$0 = ___cxa_find_matching_catch(); var $28$1 = tempRet0;
 var $29=$28$0;
 $3=$29;
 var $30=$28$1;
 $4=$30;
 __ZdlPv($20);
 label=91;break;
 case 8: 
 var $32=__Znwj(36);
 var $33=$32;
 (function() { try { __THREW__ = 0; return __ZN22PureFunctionComponent2I10BooleanAndbbEC2Ev($33) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=9;break; } else { label=10;break; }
 case 9: 
 var $35=$33;
 $c=$35;
 var $36=$c;
 var $37=$2;
 __ZN9Component14setComponentIdEh($36,$37);
 var $38=$c;
 $1=$38;
 label=90;break;
 case 10: 
 var $40$0 = ___cxa_find_matching_catch(); var $40$1 = tempRet0;
 var $41=$40$0;
 $3=$41;
 var $42=$40$1;
 $4=$42;
 __ZdlPv($32);
 label=91;break;
 case 11: 
 var $44=__Znwj(36);
 var $45=$44;
 (function() { try { __THREW__ = 0; return __ZN22PureFunctionComponent2I9BooleanOrbbEC2Ev($45) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=12;break; } else { label=13;break; }
 case 12: 
 var $47=$45;
 $c=$47;
 var $48=$c;
 var $49=$2;
 __ZN9Component14setComponentIdEh($48,$49);
 var $50=$c;
 $1=$50;
 label=90;break;
 case 13: 
 var $52$0 = ___cxa_find_matching_catch(); var $52$1 = tempRet0;
 var $53=$52$0;
 $3=$53;
 var $54=$52$1;
 $4=$54;
 __ZdlPv($44);
 label=91;break;
 case 14: 
 var $56=__Znwj(44);
 var $57=$56;
 (function() { try { __THREW__ = 0; return __ZN15BreakBeforeMakeC2Ev($57) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=15;break; } else { label=16;break; }
 case 15: 
 var $59=$57;
 $c=$59;
 var $60=$c;
 var $61=$2;
 __ZN9Component14setComponentIdEh($60,$61);
 var $62=$c;
 $1=$62;
 label=90;break;
 case 16: 
 var $64$0 = ___cxa_find_matching_catch(); var $64$1 = tempRet0;
 var $65=$64$0;
 $3=$65;
 var $66=$64$1;
 $4=$66;
 __ZdlPv($56);
 label=91;break;
 case 17: 
 var $68=__Znwj(44);
 var $69=$68;
 (function() { try { __THREW__ = 0; return __ZN9ConstrainC2Ev($69) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=18;break; } else { label=19;break; }
 case 18: 
 var $71=$69;
 $c=$71;
 var $72=$c;
 var $73=$2;
 __ZN9Component14setComponentIdEh($72,$73);
 var $74=$c;
 $1=$74;
 label=90;break;
 case 19: 
 var $76$0 = ___cxa_find_matching_catch(); var $76$1 = tempRet0;
 var $77=$76$0;
 $3=$77;
 var $78=$76$1;
 $4=$78;
 __ZdlPv($68);
 label=91;break;
 case 20: 
 var $80=__Znwj(40);
 var $81=$80;
 (function() { try { __THREW__ = 0; return __ZN5CountC2Ev($81) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=21;break; } else { label=22;break; }
 case 21: 
 var $83=$81;
 $c=$83;
 var $84=$c;
 var $85=$2;
 __ZN9Component14setComponentIdEh($84,$85);
 var $86=$c;
 $1=$86;
 label=90;break;
 case 22: 
 var $88$0 = ___cxa_find_matching_catch(); var $88$1 = tempRet0;
 var $89=$88$0;
 $3=$89;
 var $90=$88$1;
 $4=$90;
 __ZdlPv($80);
 label=91;break;
 case 23: 
 var $92=__Znwj(36);
 var $93=$92;
 (function() { try { __THREW__ = 0; return __ZN11DigitalReadC2Ev($93) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=24;break; } else { label=25;break; }
 case 24: 
 var $95=$93;
 $c=$95;
 var $96=$c;
 var $97=$2;
 __ZN9Component14setComponentIdEh($96,$97);
 var $98=$c;
 $1=$98;
 label=90;break;
 case 25: 
 var $100$0 = ___cxa_find_matching_catch(); var $100$1 = tempRet0;
 var $101=$100$0;
 $3=$101;
 var $102=$100$1;
 $4=$102;
 __ZdlPv($92);
 label=91;break;
 case 26: 
 var $104=__Znwj(36);
 var $105=$104;
 (function() { try { __THREW__ = 0; return __ZN12DigitalWriteC2Ev($105) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=27;break; } else { label=28;break; }
 case 27: 
 var $107=$105;
 $c=$107;
 var $108=$c;
 var $109=$2;
 __ZN9Component14setComponentIdEh($108,$109);
 var $110=$c;
 $1=$110;
 label=90;break;
 case 28: 
 var $112$0 = ___cxa_find_matching_catch(); var $112$1 = tempRet0;
 var $113=$112$0;
 $3=$113;
 var $114=$112$1;
 $4=$114;
 __ZdlPv($104);
 label=91;break;
 case 29: 
 var $116=__Znwj(32);
 var $117=$116;
 (function() { try { __THREW__ = 0; return __ZN7ForwardC2Ev($117) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=30;break; } else { label=31;break; }
 case 30: 
 var $119=$117;
 $c=$119;
 var $120=$c;
 var $121=$2;
 __ZN9Component14setComponentIdEh($120,$121);
 var $122=$c;
 $1=$122;
 label=90;break;
 case 31: 
 var $124$0 = ___cxa_find_matching_catch(); var $124$1 = tempRet0;
 var $125=$124$0;
 $3=$125;
 var $126=$124$1;
 $4=$126;
 __ZdlPv($116);
 label=91;break;
 case 32: 
 var $128=__Znwj(44);
 var $129=$128;
 (function() { try { __THREW__ = 0; return __ZN4GateC2Ev($129) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=33;break; } else { label=34;break; }
 case 33: 
 var $131=$129;
 $c=$131;
 var $132=$c;
 var $133=$2;
 __ZN9Component14setComponentIdEh($132,$133);
 var $134=$c;
 $1=$134;
 label=90;break;
 case 34: 
 var $136$0 = ___cxa_find_matching_catch(); var $136$1 = tempRet0;
 var $137=$136$0;
 $3=$137;
 var $138=$136$1;
 $4=$138;
 __ZdlPv($128);
 label=91;break;
 case 35: 
 var $140=__Znwj(44);
 var $141=$140;
 (function() { try { __THREW__ = 0; return __ZN15HysteresisLatchC2Ev($141) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=36;break; } else { label=37;break; }
 case 36: 
 var $143=$141;
 $c=$143;
 var $144=$c;
 var $145=$2;
 __ZN9Component14setComponentIdEh($144,$145);
 var $146=$c;
 $1=$146;
 label=90;break;
 case 37: 
 var $148$0 = ___cxa_find_matching_catch(); var $148$1 = tempRet0;
 var $149=$148$0;
 $3=$149;
 var $150=$148$1;
 $4=$150;
 __ZdlPv($140);
 label=91;break;
 case 38: 
 var $152=__Znwj(32);
 var $153=$152;
 (function() { try { __THREW__ = 0; return __ZN13InvertBooleanC2Ev($153) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=39;break; } else { label=40;break; }
 case 39: 
 var $155=$153;
 $c=$155;
 var $156=$c;
 var $157=$2;
 __ZN9Component14setComponentIdEh($156,$157);
 var $158=$c;
 $1=$158;
 label=90;break;
 case 40: 
 var $160$0 = ___cxa_find_matching_catch(); var $160$1 = tempRet0;
 var $161=$160$0;
 $3=$161;
 var $162=$160$1;
 $4=$162;
 __ZdlPv($152);
 label=91;break;
 case 41: 
 var $164=__Znwj(48);
 var $165=$164;
 (function() { try { __THREW__ = 0; return __ZN12LedMatrixMaxC2Ev($165) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=42;break; } else { label=43;break; }
 case 42: 
 var $167=$165;
 $c=$167;
 var $168=$c;
 var $169=$2;
 __ZN9Component14setComponentIdEh($168,$169);
 var $170=$c;
 $1=$170;
 label=90;break;
 case 43: 
 var $172$0 = ___cxa_find_matching_catch(); var $172$1 = tempRet0;
 var $173=$172$0;
 $3=$173;
 var $174=$172$1;
 $4=$174;
 __ZdlPv($164);
 label=91;break;
 case 44: 
 var $176=__Znwj(48);
 var $177=$176;
 (function() { try { __THREW__ = 0; return __ZN9MapLinearC2Ev($177) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=45;break; } else { label=46;break; }
 case 45: 
 var $179=$177;
 $c=$179;
 var $180=$c;
 var $181=$2;
 __ZN9Component14setComponentIdEh($180,$181);
 var $182=$c;
 $1=$182;
 label=90;break;
 case 46: 
 var $184$0 = ___cxa_find_matching_catch(); var $184$1 = tempRet0;
 var $185=$184$0;
 $3=$185;
 var $186=$184$1;
 $4=$186;
 __ZdlPv($176);
 label=91;break;
 case 47: 
 var $188=__Znwj(44);
 var $189=$188;
 (function() { try { __THREW__ = 0; return __ZN22PureFunctionComponent2I3MaxllEC2Ev($189) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=48;break; } else { label=49;break; }
 case 48: 
 var $191=$189;
 $c=$191;
 var $192=$c;
 var $193=$2;
 __ZN9Component14setComponentIdEh($192,$193);
 var $194=$c;
 $1=$194;
 label=90;break;
 case 49: 
 var $196$0 = ___cxa_find_matching_catch(); var $196$1 = tempRet0;
 var $197=$196$0;
 $3=$197;
 var $198=$196$1;
 $4=$198;
 __ZdlPv($188);
 label=91;break;
 case 50: 
 var $200=__Znwj(44);
 var $201=$200;
 (function() { try { __THREW__ = 0; return __ZN22PureFunctionComponent2I3MinllEC2Ev($201) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=51;break; } else { label=52;break; }
 case 51: 
 var $203=$201;
 $c=$203;
 var $204=$c;
 var $205=$2;
 __ZN9Component14setComponentIdEh($204,$205);
 var $206=$c;
 $1=$206;
 label=90;break;
 case 52: 
 var $208$0 = ___cxa_find_matching_catch(); var $208$1 = tempRet0;
 var $209=$208$0;
 $3=$209;
 var $210=$208$1;
 $4=$210;
 __ZdlPv($200);
 label=91;break;
 case 53: 
 var $212=__Znwj(36);
 var $213=$212;
 (function() { try { __THREW__ = 0; return __ZN10MonitorPinC2Ev($213) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=54;break; } else { label=55;break; }
 case 54: 
 var $215=$213;
 $c=$215;
 var $216=$c;
 var $217=$2;
 __ZN9Component14setComponentIdEh($216,$217);
 var $218=$c;
 $1=$218;
 label=90;break;
 case 55: 
 var $220$0 = ___cxa_find_matching_catch(); var $220$1 = tempRet0;
 var $221=$220$0;
 $3=$221;
 var $222=$220$1;
 $4=$222;
 __ZdlPv($212);
 label=91;break;
 case 56: 
 var $224=__Znwj(44);
 var $225=$224;
 (function() { try { __THREW__ = 0; return __ZN22PureFunctionComponent2I12NumberEqualsllEC2Ev($225) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=57;break; } else { label=58;break; }
 case 57: 
 var $227=$225;
 $c=$227;
 var $228=$c;
 var $229=$2;
 __ZN9Component14setComponentIdEh($228,$229);
 var $230=$c;
 $1=$230;
 label=90;break;
 case 58: 
 var $232$0 = ___cxa_find_matching_catch(); var $232$1 = tempRet0;
 var $233=$232$0;
 $3=$233;
 var $234=$232$1;
 $4=$234;
 __ZdlPv($224);
 label=91;break;
 case 59: 
 var $236=__Znwj(36);
 var $237=$236;
 (function() { try { __THREW__ = 0; return __ZN8PwmWriteC2Ev($237) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=60;break; } else { label=61;break; }
 case 60: 
 var $239=$237;
 $c=$239;
 var $240=$c;
 var $241=$2;
 __ZN9Component14setComponentIdEh($240,$241);
 var $242=$c;
 $1=$242;
 label=90;break;
 case 61: 
 var $244$0 = ___cxa_find_matching_catch(); var $244$1 = tempRet0;
 var $245=$244$0;
 $3=$245;
 var $246=$244$1;
 $4=$246;
 __ZdlPv($236);
 label=91;break;
 case 62: 
 var $248=__Znwj(24);
 var $249=$248;
 (function() { try { __THREW__ = 0; return __ZN17ReadCapacitivePinC2Ev($249) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=63;break; } else { label=64;break; }
 case 63: 
 var $251=$249;
 $c=$251;
 var $252=$c;
 var $253=$2;
 __ZN9Component14setComponentIdEh($252,$253);
 var $254=$c;
 $1=$254;
 label=90;break;
 case 64: 
 var $256$0 = ___cxa_find_matching_catch(); var $256$1 = tempRet0;
 var $257=$256$0;
 $3=$257;
 var $258=$256$1;
 $4=$258;
 __ZdlPv($248);
 label=91;break;
 case 65: 
 var $260=__Znwj(108);
 var $261=$260;
 (function() { try { __THREW__ = 0; return __ZN5RouteC2Ev($261) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=66;break; } else { label=67;break; }
 case 66: 
 var $263=$261;
 $c=$263;
 var $264=$c;
 var $265=$2;
 __ZN9Component14setComponentIdEh($264,$265);
 var $266=$c;
 $1=$266;
 label=90;break;
 case 67: 
 var $268$0 = ___cxa_find_matching_catch(); var $268$1 = tempRet0;
 var $269=$268$0;
 $3=$269;
 var $270=$268$1;
 $4=$270;
 __ZdlPv($260);
 label=91;break;
 case 68: 
 var $272=__Znwj(32);
 var $273=$272;
 (function() { try { __THREW__ = 0; return __ZN8SerialInC2Ev($273) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=69;break; } else { label=70;break; }
 case 69: 
 var $275=$273;
 $c=$275;
 var $276=$c;
 var $277=$2;
 __ZN9Component14setComponentIdEh($276,$277);
 var $278=$c;
 $1=$278;
 label=90;break;
 case 70: 
 var $280$0 = ___cxa_find_matching_catch(); var $280$1 = tempRet0;
 var $281=$280$0;
 $3=$281;
 var $282=$280$1;
 $4=$282;
 __ZdlPv($272);
 label=91;break;
 case 71: 
 var $284=__Znwj(32);
 var $285=$284;
 (function() { try { __THREW__ = 0; return __ZN9SerialOutC2Ev($285) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=72;break; } else { label=73;break; }
 case 72: 
 var $287=$285;
 $c=$287;
 var $288=$c;
 var $289=$2;
 __ZN9Component14setComponentIdEh($288,$289);
 var $290=$c;
 $1=$290;
 label=90;break;
 case 73: 
 var $292$0 = ___cxa_find_matching_catch(); var $292$1 = tempRet0;
 var $293=$292$0;
 $3=$293;
 var $294=$292$1;
 $4=$294;
 __ZdlPv($284);
 label=91;break;
 case 74: 
 var $296=__Znwj(96);
 var $297=$296;
 (function() { try { __THREW__ = 0; return __ZN5SplitC2Ev($297) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=75;break; } else { label=76;break; }
 case 75: 
 var $299=$297;
 $c=$299;
 var $300=$c;
 var $301=$2;
 __ZN9Component14setComponentIdEh($300,$301);
 var $302=$c;
 $1=$302;
 label=90;break;
 case 76: 
 var $304$0 = ___cxa_find_matching_catch(); var $304$1 = tempRet0;
 var $305=$304$0;
 $3=$305;
 var $306=$304$1;
 $4=$306;
 __ZdlPv($296);
 label=91;break;
 case 77: 
 var $308=__Znwj(184);
 var $309=$308;
 (function() { try { __THREW__ = 0; return __ZN8SubGraphC2Ev($309) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=78;break; } else { label=79;break; }
 case 78: 
 var $311=$309;
 $c=$311;
 var $312=$c;
 var $313=$2;
 __ZN9Component14setComponentIdEh($312,$313);
 var $314=$c;
 $1=$314;
 label=90;break;
 case 79: 
 var $316$0 = ___cxa_find_matching_catch(); var $316$1 = tempRet0;
 var $317=$316$0;
 $3=$317;
 var $318=$316$1;
 $4=$318;
 __ZdlPv($308);
 label=91;break;
 case 80: 
 var $320=__Znwj(40);
 var $321=$320;
 (function() { try { __THREW__ = 0; return __ZN5TimerC2Ev($321) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=81;break; } else { label=82;break; }
 case 81: 
 var $323=$321;
 $c=$323;
 var $324=$c;
 var $325=$2;
 __ZN9Component14setComponentIdEh($324,$325);
 var $326=$c;
 $1=$326;
 label=90;break;
 case 82: 
 var $328$0 = ___cxa_find_matching_catch(); var $328$1 = tempRet0;
 var $329=$328$0;
 $3=$329;
 var $330=$328$1;
 $4=$330;
 __ZdlPv($320);
 label=91;break;
 case 83: 
 var $332=__Znwj(36);
 var $333=$332;
 (function() { try { __THREW__ = 0; return __ZN13ToggleBooleanC2Ev($333) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=84;break; } else { label=85;break; }
 case 84: 
 var $335=$333;
 $c=$335;
 var $336=$c;
 var $337=$2;
 __ZN9Component14setComponentIdEh($336,$337);
 var $338=$c;
 $1=$338;
 label=90;break;
 case 85: 
 var $340$0 = ___cxa_find_matching_catch(); var $340$1 = tempRet0;
 var $341=$340$0;
 $3=$341;
 var $342=$340$1;
 $4=$342;
 __ZdlPv($332);
 label=91;break;
 case 86: 
 var $344=__Znwj(32);
 var $345=$344;
 (function() { try { __THREW__ = 0; return __ZN9BoolToIntC2Ev($345) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=87;break; } else { label=88;break; }
 case 87: 
 var $347=$345;
 $c=$347;
 var $348=$c;
 var $349=$2;
 __ZN9Component14setComponentIdEh($348,$349);
 var $350=$c;
 $1=$350;
 label=90;break;
 case 88: 
 var $352$0 = ___cxa_find_matching_catch(); var $352$1 = tempRet0;
 var $353=$352$0;
 $3=$353;
 var $354=$352$1;
 $4=$354;
 __ZdlPv($344);
 label=91;break;
 case 89: 
 $1=0;
 label=90;break;
 case 90: 
 var $357=$1;
 STACKTOP=sp;return $357;
 case 91: 
 var $359=$3;
 var $360=$4;
 var $361$0=$359;
 var $361$1=0;
 var $362$0=$361$0;
 var $362$1=$360;
 ___resumeException($362$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network7addNodeEP9Componenth($this,$node,$parentId){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $nodeId;
 $2=$this;
 $3=$node;
 $4=$parentId;
 var $5=$2;
 label=2;break;
 case 2: 
 var $7=$3;
 var $8=($7|0)!=0;
 if($8){label=4;break;}else{label=3;break;}
 case 3: 
 var $10=(($5+1008)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=$11;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($12,1,15);
 $1=0;
 label=14;break;
 case 4: 
 label=5;break;
 case 5: 
 label=6;break;
 case 6: 
 var $16=$4;
 var $17=($16&255);
 var $18=(($5+200)|0);
 var $19=HEAP8[(($18)>>0)];
 var $20=($19&255);
 var $21=($17|0)<=($20|0);
 if($21){label=8;break;}else{label=7;break;}
 case 7: 
 var $23=(($5+1008)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=$24;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($25,1,24);
 $1=0;
 label=14;break;
 case 8: 
 label=9;break;
 case 9: 
 var $28=(($5+200)|0);
 var $29=HEAP8[(($28)>>0)];
 var $30=($29&255);
 $nodeId=$30;
 var $31=$3;
 var $32=$nodeId;
 var $33=(($5)|0);
 var $34=(($33+($32<<2))|0);
 HEAP32[(($34)>>2)]=$31;
 var $35=$3;
 var $36=$nodeId;
 var $37=(($5+1012)|0);
 var $38=HEAP32[(($37)>>2)];
 __ZN9Component10setNetworkEP7NetworkiP2IO($35,$5,$36,$38);
 var $39=$4;
 var $40=($39&255);
 var $41=($40|0)>0;
 if($41){label=10;break;}else{label=11;break;}
 case 10: 
 var $43=$3;
 var $44=$4;
 var $45=($44&255);
 __ZN9Component9setParentEi($43,$45);
 label=11;break;
 case 11: 
 var $47=(($5+1008)|0);
 var $48=HEAP32[(($47)>>2)];
 var $49=($48|0)!=0;
 if($49){label=12;break;}else{label=13;break;}
 case 12: 
 var $51=(($5+1008)|0);
 var $52=HEAP32[(($51)>>2)];
 var $53=$52;
 var $54=HEAP32[(($53)>>2)];
 var $55=(($54+16)|0);
 var $56=HEAP32[(($55)>>2)];
 var $57=$3;
 var $58=$4;
 FUNCTION_TABLE[$56]($52,$57,$58);
 label=13;break;
 case 13: 
 var $60=(($5+200)|0);
 var $61=HEAP8[(($60)>>0)];
 var $62=((($61)+(1))&255);
 HEAP8[(($60)>>0)]=$62;
 var $63=$nodeId;
 var $64=(($63)&255);
 $1=$64;
 label=14;break;
 case 14: 
 var $66=$1;
 STACKTOP=sp;return $66;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network7connectEhaha($this,$srcId,$srcPort,$targetId,$targetPort){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 $1=$this;
 $2=$srcId;
 $3=$srcPort;
 $4=$targetId;
 $5=$targetPort;
 var $6=$1;
 label=2;break;
 case 2: 
 var $8=$2;
 var $9=($8&255);
 var $10=($9|0)>=1;
 if($10){label=3;break;}else{label=6;break;}
 case 3: 
 var $12=$2;
 var $13=($12&255);
 var $14=(($6+200)|0);
 var $15=HEAP8[(($14)>>0)];
 var $16=($15&255);
 var $17=($13|0)<=($16|0);
 if($17){label=4;break;}else{label=6;break;}
 case 4: 
 var $19=$4;
 var $20=($19&255);
 var $21=($20|0)>=1;
 if($21){label=5;break;}else{label=6;break;}
 case 5: 
 var $23=$4;
 var $24=($23&255);
 var $25=(($6+200)|0);
 var $26=HEAP8[(($25)>>0)];
 var $27=($26&255);
 var $28=($24|0)<=($27|0);
 if($28){label=7;break;}else{label=6;break;}
 case 6: 
 var $30=(($6+1008)|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=$31;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($32,1,12);
 label=9;break;
 case 7: 
 label=8;break;
 case 8: 
 var $35=$2;
 var $36=($35&255);
 var $37=(($6)|0);
 var $38=(($37+($36<<2))|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=$3;
 var $41=$4;
 var $42=($41&255);
 var $43=(($6)|0);
 var $44=(($43+($42<<2))|0);
 var $45=HEAP32[(($44)>>2)];
 var $46=$5;
 __ZN7Network7connectEP9ComponentaS1_a($6,$39,$40,$45,$46);
 label=9;break;
 case 9: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6PacketC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2)|0);
 var $4=(($2+4)|0);
 HEAP32[(($4)>>2)]=3;
 STACKTOP=sp;return;
}


function __ZN6PacketC2E3Msg($this,$m){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$m;
 var $3=$1;
 var $4=(($3)|0);
 var $5=(($3+4)|0);
 var $6=$2;
 HEAP32[(($5)>>2)]=$6;
 STACKTOP=sp;return;
}


function __ZN6PacketC2El($this,$l){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$l;
 var $3=$1;
 var $4=(($3)|0);
 var $5=(($3+4)|0);
 HEAP32[(($5)>>2)]=7;
 var $6=$2;
 var $7=(($3)|0);
 var $8=$7;
 HEAP32[(($8)>>2)]=$6;
 STACKTOP=sp;return;
}


function __ZN6PacketC2Eh($this,$by){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$by;
 var $3=$1;
 var $4=(($3)|0);
 var $5=(($3+4)|0);
 HEAP32[(($5)>>2)]=4;
 var $6=$2;
 var $7=(($3)|0);
 var $8=$7;
 HEAP8[(($8)>>0)]=$6;
 STACKTOP=sp;return;
}


function __ZN6PacketC2Eb($this,$b){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 var $3=($b&1);
 $2=$3;
 var $4=$1;
 var $5=(($4)|0);
 var $6=(($4+4)|0);
 HEAP32[(($6)>>2)]=6;
 var $7=$2;
 var $8=(($7)&1);
 var $9=(($4)|0);
 var $10=$9;
 var $11=($8&1);
 HEAP8[(($10)>>0)]=$11;
 STACKTOP=sp;return;
}


function __ZNK6Packet7isValidEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+4)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)>0;
 if($5){label=2;break;}else{var $11=0;label=3;break;}
 case 2: 
 var $7=(($2+4)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)<11;
 var $11=$9;label=3;break;
 case 3: 
 var $11;
 STACKTOP=sp;return $11;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network13sendMessageIdEhaRK6Packet($this,$targetId,$targetPort,$pkg){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 $1=$this;
 $2=$targetId;
 $3=$targetPort;
 $4=$pkg;
 var $5=$1;
 label=2;break;
 case 2: 
 var $7=$2;
 var $8=($7&255);
 var $9=($8|0)>=1;
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 var $11=$2;
 var $12=($11&255);
 var $13=(($5+200)|0);
 var $14=HEAP8[(($13)>>0)];
 var $15=($14&255);
 var $16=($12|0)<=($15|0);
 if($16){label=5;break;}else{label=4;break;}
 case 4: 
 var $18=(($5+1008)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=$19;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($20,1,23);
 label=7;break;
 case 5: 
 label=6;break;
 case 6: 
 var $23=$2;
 var $24=($23&255);
 var $25=(($5)|0);
 var $26=(($25+($24<<2))|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=$3;
 var $29=$4;
 __ZN7Network11sendMessageEP9ComponentaRK6PacketS1_a($5,$27,$28,$29,0,-1);
 label=7;break;
 case 7: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network13setDebugLevelE10DebugLevel($this,$level){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$this;
 $2=$level;
 var $3=$1;
 var $4=(($3+1008)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 var $8=(($3+1008)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=$9;
 var $11=$10;
 var $12=HEAP32[(($11)>>2)];
 var $13=(($12+4)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=$2;
 FUNCTION_TABLE[$14]($10,$15);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network15subscribeToPortEhab($this,$nodeId,$portId,$enable){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $c;
 $1=$this;
 $2=$nodeId;
 $3=$portId;
 var $5=($enable&1);
 $4=$5;
 var $6=$1;
 label=2;break;
 case 2: 
 var $8=$2;
 var $9=($8&255);
 var $10=($9|0)>=1;
 if($10){label=3;break;}else{label=4;break;}
 case 3: 
 var $12=$2;
 var $13=($12&255);
 var $14=(($6+200)|0);
 var $15=HEAP8[(($14)>>0)];
 var $16=($15&255);
 var $17=($13|0)<=($16|0);
 if($17){label=5;break;}else{label=4;break;}
 case 4: 
 var $19=(($6+1008)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=$20;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($21,1,25);
 label=10;break;
 case 5: 
 label=6;break;
 case 6: 
 var $24=$2;
 var $25=($24&255);
 var $26=(($6)|0);
 var $27=(($26+($25<<2))|0);
 var $28=HEAP32[(($27)>>2)];
 $c=$28;
 var $29=$3;
 var $30=(($29<<24)>>24);
 var $31=$c;
 var $32=(($31+12)|0);
 var $33=HEAP8[(($32)>>0)];
 var $34=(($33<<24)>>24);
 var $35=($30|0)>=($34|0);
 if($35){label=7;break;}else{label=8;break;}
 case 7: 
 label=10;break;
 case 8: 
 var $38=$4;
 var $39=(($38)&1);
 var $40=$3;
 var $41=(($40<<24)>>24);
 var $42=$c;
 var $43=(($42+8)|0);
 var $44=HEAP32[(($43)>>2)];
 var $45=(($44+($41<<3))|0);
 var $46=(($45+5)|0);
 var $47=($39&1);
 HEAP8[(($46)>>0)]=$47;
 var $48=(($6+1008)|0);
 var $49=HEAP32[(($48)>>2)];
 var $50=($49|0)!=0;
 if($50){label=9;break;}else{label=10;break;}
 case 9: 
 var $52=(($6+1008)|0);
 var $53=HEAP32[(($52)>>2)];
 var $54=$53;
 var $55=HEAP32[(($54)>>2)];
 var $56=(($55+32)|0);
 var $57=HEAP32[(($56)>>2)];
 var $58=$2;
 var $59=$3;
 var $60=$4;
 var $61=(($60)&1);
 FUNCTION_TABLE[$57]($53,$58,$59,$61);
 label=10;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network15connectSubgraphEbhaha($this,$isOutput,$subgraphNode,$subgraphPort,$childNode,$childPort){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 var $6;
 var $comp;
 var $child;
 var $subgraph;
 $1=$this;
 var $7=($isOutput&1);
 $2=$7;
 $3=$subgraphNode;
 $4=$subgraphPort;
 $5=$childNode;
 $6=$childPort;
 var $8=$1;
 label=2;break;
 case 2: 
 var $10=$3;
 var $11=($10&255);
 var $12=($11|0)>=1;
 if($12){label=3;break;}else{label=6;break;}
 case 3: 
 var $14=$3;
 var $15=($14&255);
 var $16=(($8+200)|0);
 var $17=HEAP8[(($16)>>0)];
 var $18=($17&255);
 var $19=($15|0)<=($18|0);
 if($19){label=4;break;}else{label=6;break;}
 case 4: 
 var $21=$5;
 var $22=($21&255);
 var $23=($22|0)>=1;
 if($23){label=5;break;}else{label=6;break;}
 case 5: 
 var $25=$5;
 var $26=($25&255);
 var $27=(($8+200)|0);
 var $28=HEAP8[(($27)>>0)];
 var $29=($28&255);
 var $30=($26|0)<=($29|0);
 if($30){label=7;break;}else{label=6;break;}
 case 6: 
 var $32=(($8+1008)|0);
 var $33=HEAP32[(($32)>>2)];
 var $34=$33;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($34,1,21);
 label=18;break;
 case 7: 
 label=8;break;
 case 8: 
 var $37=$3;
 var $38=($37&255);
 var $39=(($8)|0);
 var $40=(($39+($38<<2))|0);
 var $41=HEAP32[(($40)>>2)];
 $comp=$41;
 var $42=$5;
 var $43=($42&255);
 var $44=(($8)|0);
 var $45=(($44+($43<<2))|0);
 var $46=HEAP32[(($45)>>2)];
 $child=$46;
 label=9;break;
 case 9: 
 var $48=$comp;
 var $49=__ZNK9Component9componentEv($48);
 var $50=($49&255);
 var $51=($50|0)==100;
 if($51){label=10;break;}else{label=11;break;}
 case 10: 
 var $53=$child;
 var $54=(($53+22)|0);
 var $55=HEAP8[(($54)>>0)];
 var $56=($55&255);
 var $57=($56|0)>=1;
 if($57){label=12;break;}else{label=11;break;}
 case 11: 
 var $59=(($8+1008)|0);
 var $60=HEAP32[(($59)>>2)];
 var $61=$60;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($61,1,20);
 label=12;break;
 case 12: 
 label=13;break;
 case 13: 
 var $64=$comp;
 var $65=$64;
 $subgraph=$65;
 var $66=$2;
 var $67=(($66)&1);
 if($67){label=14;break;}else{label=15;break;}
 case 14: 
 var $69=$subgraph;
 var $70=$4;
 var $71=$child;
 var $72=$6;
 __ZN8SubGraph14connectOutportEaP9Componenta($69,$70,$71,$72);
 label=16;break;
 case 15: 
 var $74=$subgraph;
 var $75=$4;
 var $76=$child;
 var $77=$6;
 __ZN8SubGraph13connectInportEaP9Componenta($74,$75,$76,$77);
 label=16;break;
 case 16: 
 var $79=(($8+1008)|0);
 var $80=HEAP32[(($79)>>2)];
 var $81=($80|0)!=0;
 if($81){label=17;break;}else{label=18;break;}
 case 17: 
 var $83=(($8+1008)|0);
 var $84=HEAP32[(($83)>>2)];
 var $85=$84;
 var $86=HEAP32[(($85)>>2)];
 var $87=(($86+28)|0);
 var $88=HEAP32[(($87)>>2)];
 var $89=$2;
 var $90=(($89)&1);
 var $91=$3;
 var $92=$4;
 var $93=$5;
 var $94=$6;
 FUNCTION_TABLE[$88]($84,$90,$91,$92,$93,$94);
 label=18;break;
 case 18: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network10setIoValueEPKhh($this,$buf,$len){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$buf;
 $3=$len;
 var $4=$1;
 var $5=(($4+1012)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=$6;
 var $8=HEAP32[(($7)>>2)];
 var $9=(($8+8)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=$2;
 var $12=$3;
 FUNCTION_TABLE[$10]($6,$11,$12);
 STACKTOP=sp;return;
}


function __ZN9Component14setComponentIdEh($this,$id){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$id;
 var $3=$1;
 var $4=$2;
 var $5=(($3+21)|0);
 HEAP8[(($5)>>0)]=$4;
 STACKTOP=sp;return;
}


function __ZN9Component4sendE6Packeta($this,$out,$port){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $out; $out=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($out)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($out)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$this;
 $2=$port;
 var $3=$1;
 label=2;break;
 case 2: 
 var $5=$2;
 var $6=(($5<<24)>>24);
 var $7=(($3+12)|0);
 var $8=HEAP8[(($7)>>0)];
 var $9=(($8<<24)>>24);
 var $10=($6|0)<($9|0);
 if($10){label=4;break;}else{label=3;break;}
 case 3: 
 var $12=(($3+16)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=(($13+1008)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=$15;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($16,1,16);
 label=8;break;
 case 4: 
 label=5;break;
 case 5: 
 var $19=$2;
 var $20=(($19<<24)>>24);
 var $21=(($3+8)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=(($22+($20<<3))|0);
 var $24=(($23)|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=($25|0)!=0;
 if($26){label=6;break;}else{label=8;break;}
 case 6: 
 var $28=$2;
 var $29=(($28<<24)>>24);
 var $30=(($3+8)|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=(($31+($29<<3))|0);
 var $33=(($32+4)|0);
 var $34=HEAP8[(($33)>>0)];
 var $35=(($34<<24)>>24);
 var $36=($35|0)>=0;
 if($36){label=7;break;}else{label=8;break;}
 case 7: 
 var $38=(($3+16)|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=$2;
 var $41=(($40<<24)>>24);
 var $42=(($3+8)|0);
 var $43=HEAP32[(($42)>>2)];
 var $44=(($43+($41<<3))|0);
 var $45=(($44)|0);
 var $46=HEAP32[(($45)>>2)];
 var $47=$2;
 var $48=(($47<<24)>>24);
 var $49=(($3+8)|0);
 var $50=HEAP32[(($49)>>2)];
 var $51=(($50+($48<<3))|0);
 var $52=(($51+4)|0);
 var $53=HEAP8[(($52)>>0)];
 var $54=$2;
 __ZN7Network11sendMessageEP9ComponentaRK6PacketS1_a($39,$46,$53,$out,$3,$54);
 label=8;break;
 case 8: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network11sendMessageEP9ComponentaRK6PacketS1_a($this,$target,$targetPort,$pkg,$sender,$senderPort){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 var $6;
 var $msgIndex;
 var $senderIsChild;
 var $parent;
 var $targetIsSubGraph;
 var $targetSubGraph;
 var $msg;
 var $sendNotification;
 var $7=sp;
 $1=$this;
 $2=$target;
 $3=$targetPort;
 $4=$pkg;
 $5=$sender;
 $6=$senderPort;
 var $8=$1;
 var $9=$2;
 var $10=($9|0)!=0;
 if($10){label=3;break;}else{label=2;break;}
 case 2: 
 label=19;break;
 case 3: 
 var $13=(($8+1004)|0);
 var $14=HEAP8[(($13)>>0)];
 var $15=($14&255);
 var $16=($15|0)>49;
 if($16){label=4;break;}else{label=5;break;}
 case 4: 
 var $18=(($8+1004)|0);
 HEAP8[(($18)>>0)]=0;
 label=5;break;
 case 5: 
 var $20=(($8+1004)|0);
 var $21=HEAP8[(($20)>>0)];
 var $22=((($21)+(1))&255);
 HEAP8[(($20)>>0)]=$22;
 $msgIndex=$21;
 var $23=$5;
 var $24=($23|0)!=0;
 if($24){label=6;break;}else{var $32=0;label=7;break;}
 case 6: 
 var $26=$5;
 var $27=(($26+22)|0);
 var $28=HEAP8[(($27)>>0)];
 var $29=($28&255);
 var $30=($29|0)>=1;
 var $32=$30;label=7;break;
 case 7: 
 var $32;
 var $33=($32&1);
 $senderIsChild=$33;
 var $34=$senderIsChild;
 var $35=(($34)&1);
 if($35){label=8;break;}else{label=11;break;}
 case 8: 
 var $37=$5;
 var $38=(($37+22)|0);
 var $39=HEAP8[(($38)>>0)];
 var $40=($39&255);
 var $41=(($8)|0);
 var $42=(($41+($40<<2))|0);
 var $43=HEAP32[(($42)>>2)];
 var $44=$43;
 $parent=$44;
 var $45=$2;
 var $46=$parent;
 var $47=$46;
 var $48=($45|0)==($47|0);
 if($48){label=9;break;}else{label=10;break;}
 case 9: 
 var $50=$3;
 var $51=(($50<<24)>>24);
 var $52=$parent;
 var $53=(($52+104)|0);
 var $54=(($53+($51<<3))|0);
 var $55=(($54)|0);
 var $56=HEAP32[(($55)>>2)];
 $2=$56;
 var $57=$3;
 var $58=(($57<<24)>>24);
 var $59=$parent;
 var $60=(($59+104)|0);
 var $61=(($60+($58<<3))|0);
 var $62=(($61+4)|0);
 var $63=HEAP8[(($62)>>0)];
 $3=$63;
 label=10;break;
 case 10: 
 label=11;break;
 case 11: 
 var $66=$2;
 var $67=(($66+21)|0);
 var $68=HEAP8[(($67)>>0)];
 var $69=($68&255);
 var $70=($69|0)==100;
 var $71=($70&1);
 $targetIsSubGraph=$71;
 var $72=$targetIsSubGraph;
 var $73=(($72)&1);
 if($73){label=12;break;}else{label=13;break;}
 case 12: 
 var $75=$2;
 var $76=$75;
 $targetSubGraph=$76;
 var $77=$3;
 var $78=(($77<<24)>>24);
 var $79=$targetSubGraph;
 var $80=(($79+24)|0);
 var $81=(($80+($78<<3))|0);
 var $82=(($81)|0);
 var $83=HEAP32[(($82)>>2)];
 $2=$83;
 var $84=$3;
 var $85=(($84<<24)>>24);
 var $86=$targetSubGraph;
 var $87=(($86+24)|0);
 var $88=(($87+($85<<3))|0);
 var $89=(($88+4)|0);
 var $90=HEAP8[(($89)>>0)];
 $3=$90;
 label=13;break;
 case 13: 
 var $92=$msgIndex;
 var $93=($92&255);
 var $94=(($8+204)|0);
 var $95=(($94+($93<<4))|0);
 $msg=$95;
 var $96=$2;
 var $97=$msg;
 var $98=(($97)|0);
 HEAP32[(($98)>>2)]=$96;
 var $99=$3;
 var $100=$msg;
 var $101=(($100+4)|0);
 HEAP8[(($101)>>0)]=$99;
 var $102=$msg;
 var $103=(($102+8)|0);
 var $104=$4;
 var $105=$103;
 var $106=$104;
 assert(8 % 1 === 0);HEAP32[(($105)>>2)]=HEAP32[(($106)>>2)];HEAP32[((($105)+(4))>>2)]=HEAP32[((($106)+(4))>>2)];
 var $107=$5;
 var $108=($107|0)!=0;
 if($108){label=14;break;}else{label=15;break;}
 case 14: 
 var $110=$6;
 var $111=(($110<<24)>>24);
 var $112=$5;
 var $113=(($112+8)|0);
 var $114=HEAP32[(($113)>>2)];
 var $115=(($114+($111<<3))|0);
 var $116=(($115+5)|0);
 var $117=HEAP8[(($116)>>0)];
 var $118=(($117)&1);
 var $121=$118;label=16;break;
 case 15: 
 var $121=0;label=16;break;
 case 16: 
 var $121;
 var $122=($121&1);
 $sendNotification=$122;
 var $123=$sendNotification;
 var $124=(($123)&1);
 if($124){label=17;break;}else{label=19;break;}
 case 17: 
 var $126=(($8+1008)|0);
 var $127=HEAP32[(($126)>>2)];
 var $128=($127|0)!=0;
 if($128){label=18;break;}else{label=19;break;}
 case 18: 
 var $130=(($8+1008)|0);
 var $131=HEAP32[(($130)>>2)];
 var $132=$131;
 var $133=HEAP32[(($132)>>2)];
 var $134=(($133+8)|0);
 var $135=HEAP32[(($134)>>2)];
 var $136=$msgIndex;
 var $137=($136&255);
 var $138=$msg;
 var $139=$7;
 var $140=$138;
 assert(16 % 1 === 0);HEAP32[(($139)>>2)]=HEAP32[(($140)>>2)];HEAP32[((($139)+(4))>>2)]=HEAP32[((($140)+(4))>>2)];HEAP32[((($139)+(8))>>2)]=HEAP32[((($140)+(8))>>2)];HEAP32[((($139)+(12))>>2)]=HEAP32[((($140)+(12))>>2)];
 var $141=$5;
 var $142=$6;
 FUNCTION_TABLE[$135]($131,$137,$7,$141,$142);
 label=19;break;
 case 19: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9Component7connectEaPS_a($this,$outPort,$target,$targetPort){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$this;
 $2=$outPort;
 $3=$target;
 $4=$targetPort;
 var $5=$1;
 var $6=$3;
 var $7=$2;
 var $8=(($7<<24)>>24);
 var $9=(($5+8)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=(($10+($8<<3))|0);
 var $12=(($11)|0);
 HEAP32[(($12)>>2)]=$6;
 var $13=$4;
 var $14=$2;
 var $15=(($14<<24)>>24);
 var $16=(($5+8)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17+($15<<3))|0);
 var $19=(($18+4)|0);
 HEAP8[(($19)>>0)]=$13;
 STACKTOP=sp;return;
}


function __ZN9Component10setNetworkEP7NetworkiP2IO($this,$net,$n,$i){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $i1;
 $1=$this;
 $2=$net;
 $3=$n;
 $4=$i;
 var $5=$1;
 var $6=(($5+22)|0);
 HEAP8[(($6)>>0)]=0;
 var $7=$2;
 var $8=(($5+16)|0);
 HEAP32[(($8)>>2)]=$7;
 var $9=$3;
 var $10=(($9)&255);
 var $11=(($5+20)|0);
 HEAP8[(($11)>>0)]=$10;
 var $12=$4;
 var $13=(($5+4)|0);
 HEAP32[(($13)>>2)]=$12;
 $i1=0;
 label=2;break;
 case 2: 
 var $15=$i1;
 var $16=(($5+12)|0);
 var $17=HEAP8[(($16)>>0)];
 var $18=(($17<<24)>>24);
 var $19=($15|0)<($18|0);
 if($19){label=3;break;}else{label=5;break;}
 case 3: 
 var $21=$i1;
 var $22=(($5+8)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=(($23+($21<<3))|0);
 var $25=(($24)|0);
 HEAP32[(($25)>>2)]=0;
 var $26=$i1;
 var $27=(($5+8)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=(($28+($26<<3))|0);
 var $30=(($29+4)|0);
 HEAP8[(($30)>>0)]=-1;
 var $31=$i1;
 var $32=(($5+8)|0);
 var $33=HEAP32[(($32)>>2)];
 var $34=(($33+($31<<3))|0);
 var $35=(($34+5)|0);
 HEAP8[(($35)>>0)]=0;
 label=4;break;
 case 4: 
 var $37=$i1;
 var $38=((($37)+(1))|0);
 $i1=$38;
 label=2;break;
 case 5: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7NetworkC2EP2IO($this,$io){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $i;
 $1=$this;
 $2=$io;
 var $3=$1;
 var $4=(($3+200)|0);
 HEAP8[(($4)>>0)]=1;
 var $5=(($3+204)|0);
 var $6=(($5)|0);
 var $7=(($6+800)|0);
 var $9=$6;label=2;break;
 case 2: 
 var $9;
 __ZN7MessageC2Ev($9);
 var $10=(($9+16)|0);
 var $11=($10|0)==($7|0);
 if($11){label=3;break;}else{var $9=$10;label=2;break;}
 case 3: 
 var $13=(($3+1004)|0);
 HEAP8[(($13)>>0)]=0;
 var $14=(($3+1005)|0);
 HEAP8[(($14)>>0)]=0;
 var $15=(($3+1008)|0);
 HEAP32[(($15)>>2)]=0;
 var $16=(($3+1012)|0);
 var $17=$2;
 HEAP32[(($16)>>2)]=$17;
 var $18=(($3+1016)|0);
 HEAP32[(($18)>>2)]=0;
 $i=0;
 label=4;break;
 case 4: 
 var $20=$i;
 var $21=($20|0)<50;
 if($21){label=5;break;}else{label=7;break;}
 case 5: 
 var $23=$i;
 var $24=(($3)|0);
 var $25=(($24+($23<<2))|0);
 HEAP32[(($25)>>2)]=0;
 label=6;break;
 case 6: 
 var $27=$i;
 var $28=((($27)+(1))|0);
 $i=$28;
 label=4;break;
 case 7: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7MessageC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+8)|0);
 __ZN6PacketC2Ev($3);
 STACKTOP=sp;return;
}


function __ZN7Network15deliverMessagesEhh($this,$firstIndex,$lastIndex){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $i;
 var $target;
 var $4=sp;
 var $5=(sp)+(8);
 $1=$this;
 $2=$firstIndex;
 $3=$lastIndex;
 var $6=$1;
 label=2;break;
 case 2: 
 var $8=$2;
 var $9=($8&255);
 var $10=($9|0)<50;
 if($10){label=3;break;}else{label=4;break;}
 case 3: 
 var $12=$3;
 var $13=($12&255);
 var $14=($13|0)<50;
 if($14){label=5;break;}else{label=4;break;}
 case 4: 
 var $16=(($6+1008)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=$17;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($18,1,29);
 label=14;break;
 case 5: 
 label=6;break;
 case 6: 
 var $21=$2;
 $i=$21;
 label=7;break;
 case 7: 
 var $23=$i;
 var $24=($23&255);
 var $25=$3;
 var $26=($25&255);
 var $27=($24|0)<=($26|0);
 if($27){label=8;break;}else{label=14;break;}
 case 8: 
 var $29=$i;
 var $30=($29&255);
 var $31=(($6+204)|0);
 var $32=(($31+($30<<4))|0);
 var $33=(($32)|0);
 var $34=HEAP32[(($33)>>2)];
 $target=$34;
 var $35=$target;
 var $36=($35|0)!=0;
 if($36){label=10;break;}else{label=9;break;}
 case 9: 
 label=13;break;
 case 10: 
 var $39=$target;
 var $40=$39;
 var $41=HEAP32[(($40)>>2)];
 var $42=(($41+8)|0);
 var $43=HEAP32[(($42)>>2)];
 var $44=$i;
 var $45=($44&255);
 var $46=(($6+204)|0);
 var $47=(($46+($45<<4))|0);
 var $48=(($47+8)|0);
 var $49=$4;
 var $50=$48;
 assert(8 % 1 === 0);HEAP32[(($49)>>2)]=HEAP32[(($50)>>2)];HEAP32[((($49)+(4))>>2)]=HEAP32[((($50)+(4))>>2)];
 var $51=$i;
 var $52=($51&255);
 var $53=(($6+204)|0);
 var $54=(($53+($52<<4))|0);
 var $55=(($54+4)|0);
 var $56=HEAP8[(($55)>>0)];
 FUNCTION_TABLE[$43]($39,$4,$56);
 var $57=(($6+1008)|0);
 var $58=HEAP32[(($57)>>2)];
 var $59=($58|0)!=0;
 if($59){label=11;break;}else{label=12;break;}
 case 11: 
 var $61=(($6+1008)|0);
 var $62=HEAP32[(($61)>>2)];
 var $63=$62;
 var $64=HEAP32[(($63)>>2)];
 var $65=(($64+12)|0);
 var $66=HEAP32[(($65)>>2)];
 var $67=$i;
 var $68=($67&255);
 var $69=$i;
 var $70=($69&255);
 var $71=(($6+204)|0);
 var $72=(($71+($70<<4))|0);
 var $73=$5;
 var $74=$72;
 assert(16 % 1 === 0);HEAP32[(($73)>>2)]=HEAP32[(($74)>>2)];HEAP32[((($73)+(4))>>2)]=HEAP32[((($74)+(4))>>2)];HEAP32[((($73)+(8))>>2)]=HEAP32[((($74)+(8))>>2)];HEAP32[((($73)+(12))>>2)]=HEAP32[((($74)+(12))>>2)];
 FUNCTION_TABLE[$66]($62,$68,$5);
 label=12;break;
 case 12: 
 label=13;break;
 case 13: 
 var $77=$i;
 var $78=((($77)+(1))&255);
 $i=$78;
 label=7;break;
 case 14: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network15processMessagesEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $readIndex;
 var $writeIndex;
 $1=$this;
 var $2=$1;
 var $3=(($2+1005)|0);
 var $4=HEAP8[(($3)>>0)];
 $readIndex=$4;
 var $5=(($2+1004)|0);
 var $6=HEAP8[(($5)>>0)];
 $writeIndex=$6;
 var $7=$readIndex;
 var $8=($7&255);
 var $9=$writeIndex;
 var $10=($9&255);
 var $11=($8|0)>($10|0);
 if($11){label=2;break;}else{label=3;break;}
 case 2: 
 var $13=$readIndex;
 __ZN7Network15deliverMessagesEhh($2,$13,49);
 var $14=$writeIndex;
 var $15=($14&255);
 var $16=((($15)-(1))|0);
 var $17=(($16)&255);
 __ZN7Network15deliverMessagesEhh($2,0,$17);
 label=7;break;
 case 3: 
 var $19=$readIndex;
 var $20=($19&255);
 var $21=$writeIndex;
 var $22=($21&255);
 var $23=($20|0)<($22|0);
 if($23){label=4;break;}else{label=5;break;}
 case 4: 
 var $25=$readIndex;
 var $26=$writeIndex;
 var $27=($26&255);
 var $28=((($27)-(1))|0);
 var $29=(($28)&255);
 __ZN7Network15deliverMessagesEhh($2,$25,$29);
 label=6;break;
 case 5: 
 label=6;break;
 case 6: 
 label=7;break;
 case 7: 
 var $33=$writeIndex;
 var $34=(($2+1005)|0);
 HEAP8[(($34)>>0)]=$33;
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network16distributePacketERK6Packeta($this,$packet,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $i;
 var $4=sp;
 $1=$this;
 $2=$packet;
 $3=$port;
 var $5=$1;
 $i=0;
 label=2;break;
 case 2: 
 var $7=$i;
 var $8=($7&255);
 var $9=($8|0)<50;
 if($9){label=3;break;}else{label=7;break;}
 case 3: 
 var $11=$i;
 var $12=($11&255);
 var $13=(($5)|0);
 var $14=(($13+($12<<2))|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=($15|0)!=0;
 if($16){label=4;break;}else{label=5;break;}
 case 4: 
 var $18=$i;
 var $19=($18&255);
 var $20=(($5)|0);
 var $21=(($20+($19<<2))|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=$22;
 var $24=HEAP32[(($23)>>2)];
 var $25=(($24+8)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=$2;
 var $28=$4;
 var $29=$27;
 assert(8 % 1 === 0);HEAP32[(($28)>>2)]=HEAP32[(($29)>>2)];HEAP32[((($28)+(4))>>2)]=HEAP32[((($29)+(4))>>2)];
 var $30=$3;
 FUNCTION_TABLE[$26]($22,$4,$30);
 label=5;break;
 case 5: 
 label=6;break;
 case 6: 
 var $33=$i;
 var $34=((($33)+(1))&255);
 $i=$34;
 label=2;break;
 case 7: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network8runSetupEv($this){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2=sp;
 $1=$this;
 var $3=$1;
 var $4=(($3+1016)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)!=1;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 label=4;break;
 case 3: 
 __ZN6PacketC2E3Msg($2,1);
 __ZN7Network16distributePacketERK6Packeta($3,$2,-1);
 label=4;break;
 case 4: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network7runTickEv($this){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2=sp;
 $1=$this;
 var $3=$1;
 var $4=(($3+1016)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)!=1;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 label=4;break;
 case 3: 
 __ZN7Network15processMessagesEv($3);
 __ZN6PacketC2E3Msg($2,2);
 __ZN7Network16distributePacketERK6Packeta($3,$2,-1);
 label=4;break;
 case 4: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Network7connectEP9ComponentaS1_a($this,$src,$srcPort,$target,$targetPort){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 $1=$this;
 $2=$src;
 $3=$srcPort;
 $4=$target;
 $5=$targetPort;
 var $6=$1;
 var $7=$2;
 var $8=$3;
 var $9=$4;
 var $10=$5;
 __ZN9Component7connectEaPS_a($7,$8,$9,$10);
 var $11=(($6+1008)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=($12|0)!=0;
 if($13){label=2;break;}else{label=3;break;}
 case 2: 
 var $15=(($6+1008)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=$16;
 var $18=HEAP32[(($17)>>2)];
 var $19=(($18+20)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=$2;
 var $22=$3;
 var $23=$4;
 var $24=$5;
 FUNCTION_TABLE[$20]($16,$21,$22,$23,$24);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9Component9setParentEi($this,$parentId){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$parentId;
 var $3=$1;
 var $4=$2;
 var $5=(($4)&255);
 var $6=(($3+22)|0);
 HEAP8[(($6)>>0)]=$5;
 STACKTOP=sp;return;
}


function __ZNK9Component9componentEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+21)|0);
 var $4=HEAP8[(($3)>>0)];
 STACKTOP=sp;return $4;
}


function __ZN8SubGraph14connectOutportEaP9Componenta($this,$outPort,$child,$childOutPort){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 $1=$this;
 $2=$outPort;
 $3=$child;
 $4=$childOutPort;
 var $5=$1;
 var $6=$2;
 var $7=(($6<<24)>>24);
 var $8=($7|0)<0;
 if($8){label=3;break;}else{label=2;break;}
 case 2: 
 var $10=$2;
 var $11=(($10<<24)>>24);
 var $12=($11|0)>=10;
 if($12){label=3;break;}else{label=4;break;}
 case 3: 
 label=5;break;
 case 4: 
 var $15=$3;
 var $16=$2;
 var $17=(($16<<24)>>24);
 var $18=(($5+104)|0);
 var $19=(($18+($17<<3))|0);
 var $20=(($19)|0);
 HEAP32[(($20)>>2)]=$15;
 var $21=$4;
 var $22=$2;
 var $23=(($22<<24)>>24);
 var $24=(($5+104)|0);
 var $25=(($24+($23<<3))|0);
 var $26=(($25+4)|0);
 HEAP8[(($26)>>0)]=$21;
 label=5;break;
 case 5: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN8SubGraph13connectInportEaP9Componenta($this,$inPort,$child,$childInPort){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 $1=$this;
 $2=$inPort;
 $3=$child;
 $4=$childInPort;
 var $5=$1;
 var $6=$2;
 var $7=(($6<<24)>>24);
 var $8=($7|0)<0;
 if($8){label=3;break;}else{label=2;break;}
 case 2: 
 var $10=$2;
 var $11=(($10<<24)>>24);
 var $12=($11|0)>=10;
 if($12){label=3;break;}else{label=4;break;}
 case 3: 
 label=5;break;
 case 4: 
 var $15=$3;
 var $16=$2;
 var $17=(($16<<24)>>24);
 var $18=(($5+24)|0);
 var $19=(($18+($17<<3))|0);
 var $20=(($19)|0);
 HEAP32[(($20)>>2)]=$15;
 var $21=$4;
 var $22=$2;
 var $23=(($22<<24)>>24);
 var $24=(($5+24)|0);
 var $25=(($24+($23<<3))|0);
 var $26=(($25+4)|0);
 HEAP8[(($26)>>0)]=$21;
 label=5;break;
 case 5: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN17HostCommunication9nodeAddedEP9Componenth($this,$c,$parentId){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $cmd=sp;
 $1=$this;
 $2=$c;
 $3=$parentId;
 var $4=$1;
 var $5=(($cmd)|0);
 HEAP8[(($5)>>0)]=101;
 var $6=(($5+1)|0);
 var $7=$2;
 var $8=__ZNK9Component9componentEv($7);
 HEAP8[(($6)>>0)]=$8;
 var $9=(($6+1)|0);
 var $10=$2;
 var $11=__ZNK9Component2idEv($10);
 HEAP8[(($9)>>0)]=$11;
 var $12=(($9+1)|0);
 var $13=$3;
 HEAP8[(($12)>>0)]=$13;
 var $14=(($4+8)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=$15;
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17+8)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=(($cmd)|0);
 FUNCTION_TABLE[$19]($15,$20,4);
 STACKTOP=sp;return;
}


function __ZNK9Component2idEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+20)|0);
 var $4=HEAP8[(($3)>>0)];
 STACKTOP=sp;return $4;
}


function __ZN17HostCommunication14nodesConnectedEP9ComponentaS1_a($this,$src,$srcPort,$target,$targetPort){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 var $cmd=sp;
 $1=$this;
 $2=$src;
 $3=$srcPort;
 $4=$target;
 $5=$targetPort;
 var $6=$1;
 var $7=(($cmd)|0);
 HEAP8[(($7)>>0)]=102;
 var $8=(($7+1)|0);
 var $9=$2;
 var $10=__ZNK9Component2idEv($9);
 HEAP8[(($8)>>0)]=$10;
 var $11=(($8+1)|0);
 var $12=$3;
 HEAP8[(($11)>>0)]=$12;
 var $13=(($11+1)|0);
 var $14=$4;
 var $15=__ZNK9Component2idEv($14);
 HEAP8[(($13)>>0)]=$15;
 var $16=(($13+1)|0);
 var $17=$5;
 HEAP8[(($16)>>0)]=$17;
 var $18=(($6+8)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=$19;
 var $21=HEAP32[(($20)>>2)];
 var $22=(($21+8)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=(($cmd)|0);
 FUNCTION_TABLE[$23]($19,$24,5);
 STACKTOP=sp;return;
}


function __ZN17HostCommunication19networkStateChangedEN7Network5StateE($this,$s){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $cmd=sp;
 $1=$this;
 $2=$s;
 var $3=$1;
 HEAP32[(($cmd)>>2)]=115;
 var $4=$2;
 var $5=($4|0)==1;
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 HEAP32[(($cmd)>>2)]=104;
 label=6;break;
 case 3: 
 var $8=$2;
 var $9=($8|0)==0;
 if($9){label=4;break;}else{label=5;break;}
 case 4: 
 HEAP32[(($cmd)>>2)]=100;
 label=5;break;
 case 5: 
 label=6;break;
 case 6: 
 var $13=(($3+8)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=$14;
 var $16=HEAP32[(($15)>>2)];
 var $17=(($16+8)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=$cmd;
 FUNCTION_TABLE[$18]($14,$19,1);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN17HostCommunication10packetSentEi7MessageP9Componenta($this,$index,$m,$src,$srcPort){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $m; $m=STACKTOP;STACKTOP = (STACKTOP + 16)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($m)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($m)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];HEAP32[((($m)+(8))>>2)]=HEAP32[(((tempParam)+(8))>>2)];HEAP32[((($m)+(12))>>2)]=HEAP32[(((tempParam)+(12))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $cmd=sp;
 var $i;
 $1=$this;
 $2=$index;
 $3=$src;
 $4=$srcPort;
 var $5=$1;
 var $6=$3;
 var $7=($6|0)!=0;
 if($7){label=3;break;}else{label=2;break;}
 case 2: 
 label=17;break;
 case 3: 
 var $10=(($cmd)|0);
 HEAP8[(($10)>>0)]=103;
 var $11=(($10+1)|0);
 var $12=$3;
 var $13=__ZNK9Component2idEv($12);
 HEAP8[(($11)>>0)]=$13;
 var $14=(($11+1)|0);
 var $15=$4;
 HEAP8[(($14)>>0)]=$15;
 var $16=(($14+1)|0);
 var $17=(($m)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=__ZNK9Component2idEv($18);
 HEAP8[(($16)>>0)]=$19;
 var $20=(($16+1)|0);
 var $21=(($m+4)|0);
 var $22=HEAP8[(($21)>>0)];
 HEAP8[(($20)>>0)]=$22;
 var $23=(($20+1)|0);
 var $24=(($m+8)|0);
 var $25=__ZNK6Packet4typeEv($24);
 var $26=(($25)&255);
 HEAP8[(($23)>>0)]=$26;
 var $27=(($23+1)|0);
 HEAP8[(($27)>>0)]=0;
 var $28=(($27+1)|0);
 HEAP8[(($28)>>0)]=0;
 var $29=(($m+8)|0);
 var $30=__ZNK6Packet6isDataEv($29);
 if($30){label=4;break;}else{label=16;break;}
 case 4: 
 var $32=(($m+8)|0);
 var $33=__ZNK6Packet6isBoolEv($32);
 if($33){label=5;break;}else{label=6;break;}
 case 5: 
 var $35=(($m+8)|0);
 var $36=__ZNK6Packet6asBoolEv($35);
 var $37=($36&1);
 var $38=(($cmd+6)|0);
 HEAP8[(($38)>>0)]=$37;
 label=15;break;
 case 6: 
 var $40=(($m+8)|0);
 var $41=__ZNK6Packet8isNumberEv($40);
 if($41){label=7;break;}else{label=8;break;}
 case 7: 
 var $43=(($m+8)|0);
 var $44=__ZNK6Packet9asIntegerEv($43);
 $i=$44;
 var $45=$i;
 var $46=$45>>0;
 var $47=(($46)&255);
 var $48=(($cmd+6)|0);
 HEAP8[(($48)>>0)]=$47;
 var $49=$i;
 var $50=$49>>8;
 var $51=(($50)&255);
 var $52=(($cmd+7)|0);
 HEAP8[(($52)>>0)]=$51;
 label=14;break;
 case 8: 
 var $54=(($m+8)|0);
 var $55=__ZNK6Packet6isVoidEv($54);
 if($55){label=9;break;}else{label=10;break;}
 case 9: 
 label=13;break;
 case 10: 
 label=11;break;
 case 11: 
 var $59=$5;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($59,1,19);
 label=12;break;
 case 12: 
 label=13;break;
 case 13: 
 label=14;break;
 case 14: 
 label=15;break;
 case 15: 
 label=16;break;
 case 16: 
 var $65=(($5+8)|0);
 var $66=HEAP32[(($65)>>2)];
 var $67=$66;
 var $68=HEAP32[(($67)>>2)];
 var $69=(($68+8)|0);
 var $70=HEAP32[(($69)>>2)];
 var $71=(($cmd)|0);
 FUNCTION_TABLE[$70]($66,$71,8);
 label=17;break;
 case 17: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet4typeEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+4)|0);
 var $4=HEAP32[(($3)>>2)];
 STACKTOP=sp;return $4;
}


function __ZNK6Packet6isDataEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 $1=$this;
 var $2=$1;
 var $3=__ZNK6Packet7isValidEv($2);
 if($3){label=2;break;}else{var $8=0;label=3;break;}
 case 2: 
 var $5=__ZNK6Packet9isSpecialEv($2);
 var $6=$5^1;
 var $8=$6;label=3;break;
 case 3: 
 var $8;
 STACKTOP=sp;return $8;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet6isBoolEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+4)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)==6;
 STACKTOP=sp;return $5;
}


function __ZNK6Packet8isNumberEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 $1=$this;
 var $2=$1;
 var $3=__ZNK6Packet9isIntegerEv($2);
 if($3){var $7=1;label=3;break;}else{label=2;break;}
 case 2: 
 var $5=__ZNK6Packet7isFloatEv($2);
 var $7=$5;label=3;break;
 case 3: 
 var $7;
 STACKTOP=sp;return $7;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet6isVoidEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+4)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)==3;
 STACKTOP=sp;return $5;
}


function __ZN17HostCommunication15packetDeliveredEi7Message($this,$index,$m){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $m; $m=STACKTOP;STACKTOP = (STACKTOP + 16)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($m)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($m)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];HEAP32[((($m)+(8))>>2)]=HEAP32[(((tempParam)+(8))>>2)];HEAP32[((($m)+(12))>>2)]=HEAP32[(((tempParam)+(12))>>2)];

 var $1;
 var $2;
 $1=$this;
 $2=$index;
 var $3=$1;
 STACKTOP=sp;return;
}


function __ZN17HostCommunication9emitDebugE10DebugLevel7DebugId($this,$level,$id){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $cmd=sp;
 $1=$this;
 $2=$level;
 $3=$id;
 var $4=$1;
 var $5=$2;
 var $6=(($4+28)|0);
 var $7=HEAP32[(($6)>>2)];
 var $8=($5|0)<=($7|0);
 if($8){label=2;break;}else{label=3;break;}
 case 2: 
 var $10=(($cmd)|0);
 HEAP8[(($10)>>0)]=106;
 var $11=(($10+1)|0);
 var $12=$2;
 var $13=(($12)&255);
 HEAP8[(($11)>>0)]=$13;
 var $14=(($11+1)|0);
 var $15=$3;
 var $16=(($15)&255);
 HEAP8[(($14)>>0)]=$16;
 var $17=(($4+8)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=$18;
 var $20=HEAP32[(($19)>>2)];
 var $21=(($20+8)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=(($cmd)|0);
 FUNCTION_TABLE[$22]($18,$23,3);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN17HostCommunication12debugChangedE10DebugLevel($this,$level){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $cmd=sp;
 $1=$this;
 $2=$level;
 var $3=$1;
 var $4=(($cmd)|0);
 HEAP8[(($4)>>0)]=105;
 var $5=(($4+1)|0);
 var $6=$2;
 var $7=(($6)&255);
 HEAP8[(($5)>>0)]=$7;
 var $8=(($3+8)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=$9;
 var $11=HEAP32[(($10)>>2)];
 var $12=(($11+8)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=(($cmd)|0);
 FUNCTION_TABLE[$13]($9,$14,2);
 STACKTOP=sp;return;
}


function __ZN17HostCommunication23portSubscriptionChangedEhab($this,$nodeId,$portId,$enable){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 var $cmd=sp;
 $1=$this;
 $2=$nodeId;
 $3=$portId;
 var $5=($enable&1);
 $4=$5;
 var $6=$1;
 var $7=(($cmd)|0);
 HEAP8[(($7)>>0)]=107;
 var $8=(($7+1)|0);
 var $9=$2;
 HEAP8[(($8)>>0)]=$9;
 var $10=(($8+1)|0);
 var $11=$3;
 HEAP8[(($10)>>0)]=$11;
 var $12=(($10+1)|0);
 var $13=$4;
 var $14=(($13)&1);
 var $15=($14&1);
 HEAP8[(($12)>>0)]=$15;
 var $16=(($6+8)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=$17;
 var $19=HEAP32[(($18)>>2)];
 var $20=(($19+8)|0);
 var $21=HEAP32[(($20)>>2)];
 var $22=(($cmd)|0);
 FUNCTION_TABLE[$21]($17,$22,4);
 STACKTOP=sp;return;
}


function __ZN17HostCommunication17subgraphConnectedEbhaha($this,$isOutput,$subgraphNode,$subgraphPort,$childNode,$childPort){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 var $6;
 var $cmd=sp;
 $1=$this;
 var $7=($isOutput&1);
 $2=$7;
 $3=$subgraphNode;
 $4=$subgraphPort;
 $5=$childNode;
 $6=$childPort;
 var $8=$1;
 var $9=(($cmd)|0);
 HEAP8[(($9)>>0)]=108;
 var $10=(($9+1)|0);
 var $11=$2;
 var $12=(($11)&1);
 var $13=($12&1);
 HEAP8[(($10)>>0)]=$13;
 var $14=(($10+1)|0);
 var $15=$3;
 HEAP8[(($14)>>0)]=$15;
 var $16=(($14+1)|0);
 var $17=$4;
 HEAP8[(($16)>>0)]=$17;
 var $18=(($16+1)|0);
 var $19=$5;
 HEAP8[(($18)>>0)]=$19;
 var $20=(($18+1)|0);
 var $21=$6;
 HEAP8[(($20)>>0)]=$21;
 var $22=(($8+8)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=$23;
 var $25=HEAP32[(($24)>>2)];
 var $26=(($25+8)|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=(($cmd)|0);
 FUNCTION_TABLE[$27]($23,$28,6);
 STACKTOP=sp;return;
}


function __ZN13HostTransportC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1680;
 STACKTOP=sp;return;
}


function __ZN8SubGraphC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=784;
 var $4=$2;
 var $5=(($2+104)|0);
 var $6=(($5)|0);
 __ZN9ComponentC2EP10Connectioni($4,$6,10);
 var $7=$2;
 HEAP32[(($7)>>2)]=784;
 var $8=(($2+24)|0);
 var $9=(($2+104)|0);
 STACKTOP=sp;return;
}


function __ZN9ComponentC2EP10Connectioni($this,$outPorts,$ports){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$outPorts;
 $3=$ports;
 var $4=$1;
 var $5=$4;
 HEAP32[(($5)>>2)]=720;
 var $6=(($4+8)|0);
 var $7=$2;
 HEAP32[(($6)>>2)]=$7;
 var $8=(($4+12)|0);
 var $9=$3;
 var $10=(($9)&255);
 HEAP8[(($8)>>0)]=$10;
 STACKTOP=sp;return;
}


function __ZN8SubGraph7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$this;
 $2=$port;
 var $3=$1;
 label=2;break;
 case 2: 
 var $5=$2;
 var $6=(($5<<24)>>24);
 var $7=($6|0)<0;
 if($7){label=4;break;}else{label=3;break;}
 case 3: 
 var $9=$3;
 var $10=(($9+16)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=(($11+1008)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=$13;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($14,1,22);
 label=4;break;
 case 4: 
 label=5;break;
 case 5: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __Z14loadFromEEPROMP17HostCommunication($controller){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $i;
 var $c;
 $1=$controller;
 $i=0;
 label=2;break;
 case 2: 
 var $3=$i;
 var $4=($3>>>0)<96;
 if($4){label=3;break;}else{label=5;break;}
 case 3: 
 var $6=$i;
 var $7=((3744+$6)|0);
 var $8=HEAP8[(($7)>>0)];
 $c=$8;
 var $9=$1;
 var $10=$c;
 __ZN17HostCommunication9parseByteEc($9,$10);
 label=4;break;
 case 4: 
 var $12=$i;
 var $13=((($12)+(1))|0);
 $i=$13;
 label=2;break;
 case 5: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __Znwj($n){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $p;
 var $2;
 var $3;
 $1=$n;
 var $4=$1;
 var $5=(function() { try { __THREW__ = 0; return _malloc($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=4;break; }
 case 2: 
 $p=$5;
 var $7=$p;
 var $8=($7|0)!=0;
 if($8){label=7;break;}else{label=3;break;}
 case 3: 
 var $10=___cxa_allocate_exception(4);
 var $11=$10;
 __ZNSt9bad_allocC2Ev($11);
 (function() { try { __THREW__ = 0; return ___cxa_throw($10,3056,(282)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=9;break; } else { label=4;break; }
 case 4: 
 var $13$0 = ___cxa_find_matching_catch(); var $13$1 = tempRet0;
 var $14=$13$0;
 $2=$14;
 var $15=$13$1;
 $3=$15;
 label=5;break;
 case 5: 
 var $17=$3;
 var $18=($17|0)<0;
 if($18){label=6;break;}else{label=8;break;}
 case 6: 
 var $20=$2;
 ___cxa_call_unexpected($20);
 throw "Reached an unreachable!";
 case 7: 
 var $22=$p;
 STACKTOP=sp;return $22;
 case 8: 
 var $24=$2;
 var $25=$3;
 var $26$0=$24;
 var $26$1=0;
 var $27$0=$26$0;
 var $27$1=$25;
 ___resumeException($27$0)
 case 9: 
 throw "Reached an unreachable!";
  default: assert(0, "bad label: " + label);
 }

}


function __ZdlPv($p){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$p;
 var $4=$1;
 (function() { try { __THREW__ = 0; return _free($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 STACKTOP=sp;return;
 case 3: 
 var $7$0 = ___cxa_find_matching_catch(); var $7$1 = tempRet0;
 var $8=$7$0;
 $2=$8;
 var $9=$7$1;
 $3=$9;
 label=4;break;
 case 4: 
 var $11=$2;
 ___cxa_call_unexpected($11);
 throw "Reached an unreachable!";
  default: assert(0, "bad label: " + label);
 }

}


function __ZN23EmscriptenHostTransport5setupEP2IOP17HostCommunication($this,$i,$c){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$i;
 $3=$c;
 var $4=$1;
 var $5=$2;
 var $6=(($4+12)|0);
 HEAP32[(($6)>>2)]=$5;
 var $7=$3;
 var $8=(($4+16)|0);
 HEAP32[(($8)>>2)]=$7;
 STACKTOP=sp;return;
}


function __ZN23EmscriptenHostTransport7runTickEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+8)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)!=0;
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 var $7=(($2+8)|0);
 var $8=HEAP32[(($7)>>2)];
 FUNCTION_TABLE[$8]();
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN23EmscriptenHostTransport13sendToRuntimeEh($this,$b){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$b;
 var $3=$1;
 var $4=(($3+16)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=$2;
 __ZN17HostCommunication9parseByteEc($5,$6);
 STACKTOP=sp;return;
}


function __ZN23EmscriptenHostTransport11sendCommandEPKhh($this,$b,$len){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $i;
 var $d;
 $1=$this;
 $2=$b;
 $3=$len;
 var $4=$1;
 $i=0;
 label=2;break;
 case 2: 
 var $6=$i;
 var $7=($6&255);
 var $8=($7>>>0)<8;
 if($8){label=3;break;}else{label=10;break;}
 case 3: 
 var $10=$i;
 var $11=($10&255);
 var $12=$3;
 var $13=($12&255);
 var $14=($11|0)<($13|0);
 if($14){label=4;break;}else{label=5;break;}
 case 4: 
 var $16=$i;
 var $17=($16&255);
 var $18=$2;
 var $19=(($18+$17)|0);
 var $20=HEAP8[(($19)>>0)];
 var $21=($20&255);
 var $24=$21;label=6;break;
 case 5: 
 var $24=0;label=6;break;
 case 6: 
 var $24;
 var $25=(($24)&255);
 $d=$25;
 var $26=(($4+4)|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=($27|0)!=0;
 if($28){label=7;break;}else{label=8;break;}
 case 7: 
 var $30=(($4+4)|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=$d;
 FUNCTION_TABLE[$31]($32);
 label=8;break;
 case 8: 
 label=9;break;
 case 9: 
 var $35=$i;
 var $36=((($35)+(1))&255);
 $i=$36;
 label=2;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _emscripten_runtime_new(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=__Znwj(1108);
 var $4=$3;
 (function() { try { __THREW__ = 0; return __ZN17EmscriptenRuntimeC2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 STACKTOP=sp;return $4;
 case 3: 
 var $7$0 = ___cxa_find_matching_catch(); var $7$1 = tempRet0;
 var $8=$7$0;
 $1=$8;
 var $9=$7$1;
 $2=$9;
 __ZdlPv($3);
 label=4;break;
 case 4: 
 var $11=$1;
 var $12=$2;
 var $13$0=$11;
 var $13$1=0;
 var $14$0=$13$0;
 var $14$1=$12;
 ___resumeException($14$0)
  default: assert(0, "bad label: " + label);
 }

}
Module["_emscripten_runtime_new"] = _emscripten_runtime_new;

function __ZN17EmscriptenRuntimeC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 var $5=(($4)|0);
 __ZN12EmscriptenIOC2Ev($5);
 var $6=(($4+36)|0);
 (function() { try { __THREW__ = 0; return __ZN23EmscriptenHostTransportC2Ev($6) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; }
 case 2: 
 var $8=(($4+56)|0);
 var $9=(($4)|0);
 var $10=$9;
 (function() { try { __THREW__ = 0; return __ZN7NetworkC2EP2IO($8,$10) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=5;break; }
 case 3: 
 var $12=(($4+1076)|0);
 (function() { try { __THREW__ = 0; return __ZN17HostCommunicationC2Ev($12) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=4;break; } else { label=5;break; }
 case 4: 
 STACKTOP=sp;return;
 case 5: 
 var $15$0 = ___cxa_find_matching_catch(); var $15$1 = tempRet0;
 var $16=$15$0;
 $2=$16;
 var $17=$15$1;
 $3=$17;
 (function() { try { __THREW__ = 0; return __ZN12EmscriptenIOD2Ev($5) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=6;break; } else { label=8;break; }
 case 6: 
 label=7;break;
 case 7: 
 var $20=$2;
 var $21=$3;
 var $22$0=$20;
 var $22$1=0;
 var $23$0=$22$0;
 var $23$1=$21;
 ___resumeException($23$0)
 case 8: 
 var $25$0 = ___cxa_find_matching_catch(0); var $25$1 = tempRet0;
 var $26=$25$0;
 ___clang_call_terminate($26);
 throw "Reached an unreachable!";
  default: assert(0, "bad label: " + label);
 }

}


function _emscripten_runtime_free($self){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$self;
 var $4=$1;
 var $5=($4|0)==0;
 if($5){label=4;break;}else{label=2;break;}
 case 2: 
 (function() { try { __THREW__ = 0; return __ZN17EmscriptenRuntimeD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=5;break; }
 case 3: 
 var $8=$4;
 __ZdlPv($8);
 label=4;break;
 case 4: 
 STACKTOP=sp;return;
 case 5: 
 var $11$0 = ___cxa_find_matching_catch(); var $11$1 = tempRet0;
 var $12=$11$0;
 $2=$12;
 var $13=$11$1;
 $3=$13;
 var $14=$4;
 __ZdlPv($14);
 label=6;break;
 case 6: 
 var $16=$2;
 var $17=$3;
 var $18$0=$16;
 var $18$1=0;
 var $19$0=$18$0;
 var $19$1=$17;
 ___resumeException($19$0)
  default: assert(0, "bad label: " + label);
 }

}
Module["_emscripten_runtime_free"] = _emscripten_runtime_free;

function __ZN17EmscriptenRuntimeD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2)|0);
 __ZN12EmscriptenIOD2Ev($3);
 STACKTOP=sp;return;
}


function _emscripten_runtime_send($self,$b){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$self;
 $2=$b;
 var $3=$1;
 var $4=(($3+36)|0);
 var $5=$2;
 __ZN23EmscriptenHostTransport13sendToRuntimeEh($4,$5);
 STACKTOP=sp;return;
}
Module["_emscripten_runtime_send"] = _emscripten_runtime_send;

function _emscripten_runtime_setup($self,$sendFuncAddress,$pullFuncAddress){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 $1=$self;
 $2=$sendFuncAddress;
 $3=$pullFuncAddress;
 var $4=$2;
 var $5=$4;
 var $6=$1;
 var $7=(($6+36)|0);
 var $8=(($7+4)|0);
 HEAP32[(($8)>>2)]=$5;
 var $9=$3;
 var $10=$9;
 var $11=$1;
 var $12=(($11+36)|0);
 var $13=(($12+8)|0);
 HEAP32[(($13)>>2)]=$10;
 var $14=$1;
 __ZN17EmscriptenRuntime5setupEv($14);
 STACKTOP=sp;return;
}
Module["_emscripten_runtime_setup"] = _emscripten_runtime_setup;

function __ZN17EmscriptenRuntime5setupEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+36)|0);
 var $4=(($2)|0);
 var $5=$4;
 var $6=(($2+1076)|0);
 __ZN23EmscriptenHostTransport5setupEP2IOP17HostCommunication($3,$5,$6);
 var $7=(($2+1076)|0);
 var $8=(($2+56)|0);
 var $9=(($2+36)|0);
 var $10=$9;
 __ZN17HostCommunication5setupEP7NetworkP13HostTransport($7,$8,$10);
 var $11=(($2)|0);
 var $12=(($2+36)|0);
 var $13=$12;
 __ZN12EmscriptenIO5setupEP13HostTransport($11,$13);
 var $14=(($2+1076)|0);
 __Z14loadFromEEPROMP17HostCommunication($14);
 STACKTOP=sp;return;
}


function _emscripten_runtime_run($self,$timeIncrementMs){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$self;
 $2=$timeIncrementMs;
 var $3=$1;
 var $4=$2;
 __ZN17EmscriptenRuntime12runIterationEi($3,$4);
 STACKTOP=sp;return;
}
Module["_emscripten_runtime_run"] = _emscripten_runtime_run;

function __ZN17EmscriptenRuntime12runIterationEi($this,$timeIncrementMs){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$timeIncrementMs;
 var $3=$1;
 var $4=(($3+36)|0);
 __ZN23EmscriptenHostTransport7runTickEv($4);
 var $5=(($3+56)|0);
 __ZN7Network7runTickEv($5);
 var $6=$2;
 var $7=(($3)|0);
 var $8=(($7+8)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=((($9)+($6))|0);
 HEAP32[(($8)>>2)]=$10;
 STACKTOP=sp;return;
}


function __ZN10AnalogReadC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1976;
 STACKTOP=sp;return;
}


function __ZN10ArduinoUnoC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1944;
 var $4=$2;
 var $5=(($2+24)|0);
 var $6=(($5)|0);
 __ZN9ComponentC2EP10Connectioni($4,$6,20);
 var $7=$2;
 HEAP32[(($7)>>2)]=1944;
 var $8=(($2+24)|0);
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I10BooleanAndbbEC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1368;
 var $4=$2;
 var $5=(($2+24)|0);
 var $6=(($5)|0);
 __ZN9ComponentC2EP10Connectioni($4,$6,1);
 var $7=$2;
 HEAP32[(($7)>>2)]=1368;
 var $8=(($2+24)|0);
 var $9=(($2+32)|0);
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I9BooleanOrbbEC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1240;
 var $4=$2;
 var $5=(($2+24)|0);
 var $6=(($5)|0);
 __ZN9ComponentC2EP10Connectioni($4,$6,1);
 var $7=$2;
 HEAP32[(($7)>>2)]=1240;
 var $8=(($2+24)|0);
 var $9=(($2+32)|0);
 STACKTOP=sp;return;
}


function __ZN15BreakBeforeMakeC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1552;
 var $4=$2;
 var $5=(($2+28)|0);
 var $6=(($5)|0);
 __ZN9ComponentC2EP10Connectioni($4,$6,2);
 var $7=$2;
 HEAP32[(($7)>>2)]=1552;
 var $8=(($2+24)|0);
 HEAP32[(($8)>>2)]=0;
 var $9=(($2+28)|0);
 STACKTOP=sp;return;
}


function __ZN9ConstrainC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=688;
 STACKTOP=sp;return;
}


function __ZN5CountC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1008;
 STACKTOP=sp;return;
}


function __ZN11DigitalReadC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1880;
 STACKTOP=sp;return;
}


function __ZN12DigitalWriteC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1824;
 STACKTOP=sp;return;
}


function __ZN7ForwardC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=880;
 STACKTOP=sp;return;
}


function __ZN4GateC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 var $5=$4;
 __ZN21SingleOutputComponentC2Ev($5);
 var $6=$4;
 HEAP32[(($6)>>2)]=1040;
 var $7=(($4+32)|0);
 HEAP8[(($7)>>0)]=0;
 var $8=(($4+36)|0);
 (function() { try { __THREW__ = 0; return __ZN6PacketC2E3Msg($8,0) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 STACKTOP=sp;return;
 case 3: 
 var $11$0 = ___cxa_find_matching_catch(); var $11$1 = tempRet0;
 var $12=$11$0;
 $2=$12;
 var $13=$11$1;
 $3=$13;
 var $14=$4;
 (function() { try { __THREW__ = 0; return __ZN21SingleOutputComponentD2Ev($14) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=4;break; } else { label=6;break; }
 case 4: 
 label=5;break;
 case 5: 
 var $17=$2;
 var $18=$3;
 var $19$0=$17;
 var $19$1=0;
 var $20$0=$19$0;
 var $20$1=$18;
 ___resumeException($20$0)
 case 6: 
 var $22$0 = ___cxa_find_matching_catch(0); var $22$1 = tempRet0;
 var $23=$22$0;
 ___clang_call_terminate($23);
 throw "Reached an unreachable!";
  default: assert(0, "bad label: " + label);
 }

}


function __ZN15HysteresisLatchC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1520;
 STACKTOP=sp;return;
}


function __ZN13InvertBooleanC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1648;
 STACKTOP=sp;return;
}


function __ZN12LedMatrixMaxC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1712;
 var $5=(($2+32)|0);
 HEAP32[(($5)>>2)]=-1;
 var $6=(($2+36)|0);
 HEAP32[(($6)>>2)]=-1;
 var $7=(($2+40)|0);
 HEAP32[(($7)>>2)]=-1;
 var $8=(($2+44)|0);
 HEAP8[(($8)>>0)]=0;
 STACKTOP=sp;return;
}


function __ZN9MapLinearC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=656;
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I3MaxllEC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1304;
 var $4=$2;
 var $5=(($2+24)|0);
 var $6=(($5)|0);
 __ZN9ComponentC2EP10Connectioni($4,$6,1);
 var $7=$2;
 HEAP32[(($7)>>2)]=1304;
 var $8=(($2+24)|0);
 var $9=(($2+32)|0);
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I3MinllEC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1272;
 var $4=$2;
 var $5=(($2+24)|0);
 var $6=(($5)|0);
 __ZN9ComponentC2EP10Connectioni($4,$6,1);
 var $7=$2;
 HEAP32[(($7)>>2)]=1272;
 var $8=(($2+24)|0);
 var $9=(($2+32)|0);
 STACKTOP=sp;return;
}


function __ZN10MonitorPinC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1912;
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I12NumberEqualsllEC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1336;
 var $4=$2;
 var $5=(($2+24)|0);
 var $6=(($5)|0);
 __ZN9ComponentC2EP10Connectioni($4,$6,1);
 var $7=$2;
 HEAP32[(($7)>>2)]=1336;
 var $8=(($2+24)|0);
 var $9=(($2+32)|0);
 STACKTOP=sp;return;
}


function __ZN8PwmWriteC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=848;
 STACKTOP=sp;return;
}


function __ZN17ReadCapacitivePinC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN14DummyComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1432;
 STACKTOP=sp;return;
}


function __ZN5RouteC2Ev($this){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $i;
 var $4=sp;
 $1=$this;
 var $5=$1;
 var $6=$5;
 __ZN21SingleOutputComponentC2Ev($6);
 var $7=$5;
 HEAP32[(($7)>>2)]=976;
 var $8=(($5+32)|0);
 var $9=(($8)|0);
 var $10=(($9+72)|0);
 var $12=$9;label=2;break;
 case 2: 
 var $12;
 (function() { try { __THREW__ = 0; return __ZN6PacketC2Ev($12) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=9;break; }
 case 3: 
 var $14=(($12+8)|0);
 var $15=($14|0)==($10|0);
 if($15){label=4;break;}else{var $12=$14;label=2;break;}
 case 4: 
 var $17=(($5+104)|0);
 HEAP8[(($17)>>0)]=0;
 $i=0;
 label=5;break;
 case 5: 
 var $19=$i;
 var $20=(($19<<24)>>24);
 var $21=($20|0)<9;
 if($21){label=6;break;}else{label=10;break;}
 case 6: 
 var $23=$i;
 var $24=(($23<<24)>>24);
 var $25=(($5+32)|0);
 var $26=(($25+($24<<3))|0);
 (function() { try { __THREW__ = 0; return __ZN6PacketC2E3Msg($4,0) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=7;break; } else { label=9;break; }
 case 7: 
 var $28=$26;
 var $29=$4;
 assert(8 % 1 === 0);HEAP32[(($28)>>2)]=HEAP32[(($29)>>2)];HEAP32[((($28)+(4))>>2)]=HEAP32[((($29)+(4))>>2)];
 label=8;break;
 case 8: 
 var $31=$i;
 var $32=((($31)+(1))&255);
 $i=$32;
 label=5;break;
 case 9: 
 var $34$0 = ___cxa_find_matching_catch(); var $34$1 = tempRet0;
 var $35=$34$0;
 $2=$35;
 var $36=$34$1;
 $3=$36;
 var $37=$5;
 (function() { try { __THREW__ = 0; return __ZN21SingleOutputComponentD2Ev($37) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=11;break; } else { label=13;break; }
 case 10: 
 STACKTOP=sp;return;
 case 11: 
 label=12;break;
 case 12: 
 var $41=$2;
 var $42=$3;
 var $43$0=$41;
 var $43$1=0;
 var $44$0=$43$0;
 var $44$1=$42;
 ___resumeException($44$0)
 case 13: 
 var $46$0 = ___cxa_find_matching_catch(0); var $46$1 = tempRet0;
 var $47=$46$0;
 ___clang_call_terminate($47);
 throw "Reached an unreachable!";
  default: assert(0, "bad label: " + label);
 }

}


function __ZN8SerialInC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=816;
 STACKTOP=sp;return;
}


function __ZN9SerialOutC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=624;
 STACKTOP=sp;return;
}


function __ZN5SplitC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=944;
 var $4=$2;
 var $5=(($2+24)|0);
 var $6=(($5)|0);
 __ZN9ComponentC2EP10Connectioni($4,$6,9);
 var $7=$2;
 HEAP32[(($7)>>2)]=944;
 var $8=(($2+24)|0);
 STACKTOP=sp;return;
}


function __ZN5TimerC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=912;
 STACKTOP=sp;return;
}


function __ZN13ToggleBooleanC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1616;
 STACKTOP=sp;return;
}


function __ZN9BoolToIntC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=752;
 STACKTOP=sp;return;
}


function __ZN8SubGraphD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN8SubGraphD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN8SubGraphD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN22PureFunctionComponent2I12NumberEqualsllED2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I12NumberEqualsllED0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN22PureFunctionComponent2I12NumberEqualsllED2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN22PureFunctionComponent2I12NumberEqualsllE7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $ret=sp;
 var $3=(sp)+(8);
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet6isDataEv($in);
 if($5){label=2;break;}else{label=10;break;}
 case 2: 
 var $7=$2;
 var $8=(($7<<24)>>24);
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 var $11=__ZN6PacketcvlEv($in);
 var $12=(($4+36)|0);
 HEAP32[(($12)>>2)]=$11;
 label=7;break;
 case 4: 
 var $14=$2;
 var $15=(($14<<24)>>24);
 var $16=($15|0)==1;
 if($16){label=5;break;}else{label=6;break;}
 case 5: 
 var $18=__ZN6PacketcvlEv($in);
 var $19=(($4+40)|0);
 HEAP32[(($19)>>2)]=$18;
 label=6;break;
 case 6: 
 label=7;break;
 case 7: 
 var $22=(($4+32)|0);
 var $23=(($4+36)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=(($4+40)|0);
 var $26=HEAP32[(($25)>>2)];
 __ZN12NumberEqualsclEll($ret,$22,$24,$26);
 var $27=__ZNK6Packet7isValidEv($ret);
 if($27){label=8;break;}else{label=9;break;}
 case 8: 
 var $29=$4;
 var $30=$3;
 var $31=$ret;
 assert(8 % 1 === 0);HEAP32[(($30)>>2)]=HEAP32[(($31)>>2)];HEAP32[((($30)+(4))>>2)]=HEAP32[((($31)+(4))>>2)];
 __ZN9Component4sendE6Packeta($29,$3,0);
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6PacketcvlEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2)|0);
 var $4=$3;
 var $5=HEAP32[(($4)>>2)];
 STACKTOP=sp;return $5;
}


function __ZN12NumberEqualsclEll($agg_result,$this,$a,$b){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$a;
 $3=$b;
 var $4=$1;
 var $5=$2;
 var $6=$3;
 var $7=($5|0)==($6|0);
 __ZN6PacketC2Eb($agg_result,$7);
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I3MinllED2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I3MinllED0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN22PureFunctionComponent2I3MinllED2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN22PureFunctionComponent2I3MinllE7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $ret=sp;
 var $3=(sp)+(8);
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet6isDataEv($in);
 if($5){label=2;break;}else{label=10;break;}
 case 2: 
 var $7=$2;
 var $8=(($7<<24)>>24);
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 var $11=__ZN6PacketcvlEv($in);
 var $12=(($4+36)|0);
 HEAP32[(($12)>>2)]=$11;
 label=7;break;
 case 4: 
 var $14=$2;
 var $15=(($14<<24)>>24);
 var $16=($15|0)==1;
 if($16){label=5;break;}else{label=6;break;}
 case 5: 
 var $18=__ZN6PacketcvlEv($in);
 var $19=(($4+40)|0);
 HEAP32[(($19)>>2)]=$18;
 label=6;break;
 case 6: 
 label=7;break;
 case 7: 
 var $22=(($4+32)|0);
 var $23=(($4+36)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=(($4+40)|0);
 var $26=HEAP32[(($25)>>2)];
 __ZN3MinclEll($ret,$22,$24,$26);
 var $27=__ZNK6Packet7isValidEv($ret);
 if($27){label=8;break;}else{label=9;break;}
 case 8: 
 var $29=$4;
 var $30=$3;
 var $31=$ret;
 assert(8 % 1 === 0);HEAP32[(($30)>>2)]=HEAP32[(($31)>>2)];HEAP32[((($30)+(4))>>2)]=HEAP32[((($31)+(4))>>2)];
 __ZN9Component4sendE6Packeta($29,$3,0);
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN3MinclEll($agg_result,$this,$input,$threshold){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$input;
 $3=$threshold;
 var $4=$1;
 var $5=$2;
 var $6=$3;
 var $7=($5|0)>=($6|0);
 if($7){label=2;break;}else{label=3;break;}
 case 2: 
 var $9=$3;
 __ZN6PacketC2El($agg_result,$9);
 label=4;break;
 case 3: 
 var $11=$2;
 __ZN6PacketC2El($agg_result,$11);
 label=4;break;
 case 4: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN22PureFunctionComponent2I3MaxllED2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I3MaxllED0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN22PureFunctionComponent2I3MaxllED2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN22PureFunctionComponent2I3MaxllE7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $ret=sp;
 var $3=(sp)+(8);
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet6isDataEv($in);
 if($5){label=2;break;}else{label=10;break;}
 case 2: 
 var $7=$2;
 var $8=(($7<<24)>>24);
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 var $11=__ZN6PacketcvlEv($in);
 var $12=(($4+36)|0);
 HEAP32[(($12)>>2)]=$11;
 label=7;break;
 case 4: 
 var $14=$2;
 var $15=(($14<<24)>>24);
 var $16=($15|0)==1;
 if($16){label=5;break;}else{label=6;break;}
 case 5: 
 var $18=__ZN6PacketcvlEv($in);
 var $19=(($4+40)|0);
 HEAP32[(($19)>>2)]=$18;
 label=6;break;
 case 6: 
 label=7;break;
 case 7: 
 var $22=(($4+32)|0);
 var $23=(($4+36)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=(($4+40)|0);
 var $26=HEAP32[(($25)>>2)];
 __ZN3MaxclEll($ret,$22,$24,$26);
 var $27=__ZNK6Packet7isValidEv($ret);
 if($27){label=8;break;}else{label=9;break;}
 case 8: 
 var $29=$4;
 var $30=$3;
 var $31=$ret;
 assert(8 % 1 === 0);HEAP32[(($30)>>2)]=HEAP32[(($31)>>2)];HEAP32[((($30)+(4))>>2)]=HEAP32[((($31)+(4))>>2)];
 __ZN9Component4sendE6Packeta($29,$3,0);
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN3MaxclEll($agg_result,$this,$input,$threshold){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$input;
 $3=$threshold;
 var $4=$1;
 var $5=$2;
 var $6=$3;
 var $7=($5|0)<=($6|0);
 if($7){label=2;break;}else{label=3;break;}
 case 2: 
 var $9=$3;
 __ZN6PacketC2El($agg_result,$9);
 label=4;break;
 case 3: 
 var $11=$2;
 __ZN6PacketC2El($agg_result,$11);
 label=4;break;
 case 4: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN22PureFunctionComponent2I9BooleanOrbbED2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I9BooleanOrbbED0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN22PureFunctionComponent2I9BooleanOrbbED2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN22PureFunctionComponent2I9BooleanOrbbE7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $ret=sp;
 var $3=(sp)+(8);
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet6isDataEv($in);
 if($5){label=2;break;}else{label=10;break;}
 case 2: 
 var $7=$2;
 var $8=(($7<<24)>>24);
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 var $11=__ZN6PacketcvbEv($in);
 var $12=(($4+33)|0);
 var $13=($11&1);
 HEAP8[(($12)>>0)]=$13;
 label=7;break;
 case 4: 
 var $15=$2;
 var $16=(($15<<24)>>24);
 var $17=($16|0)==1;
 if($17){label=5;break;}else{label=6;break;}
 case 5: 
 var $19=__ZN6PacketcvbEv($in);
 var $20=(($4+34)|0);
 var $21=($19&1);
 HEAP8[(($20)>>0)]=$21;
 label=6;break;
 case 6: 
 label=7;break;
 case 7: 
 var $24=(($4+32)|0);
 var $25=(($4+33)|0);
 var $26=HEAP8[(($25)>>0)];
 var $27=(($26)&1);
 var $28=(($4+34)|0);
 var $29=HEAP8[(($28)>>0)];
 var $30=(($29)&1);
 __ZN9BooleanOrclEbb($ret,$24,$27,$30);
 var $31=__ZNK6Packet7isValidEv($ret);
 if($31){label=8;break;}else{label=9;break;}
 case 8: 
 var $33=$4;
 var $34=$3;
 var $35=$ret;
 assert(8 % 1 === 0);HEAP32[(($34)>>2)]=HEAP32[(($35)>>2)];HEAP32[((($34)+(4))>>2)]=HEAP32[((($35)+(4))>>2)];
 __ZN9Component4sendE6Packeta($33,$3,0);
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6PacketcvbEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2)|0);
 var $4=$3;
 var $5=HEAP8[(($4)>>0)];
 var $6=(($5)&1);
 STACKTOP=sp;return $6;
}


function __ZN9BooleanOrclEbb($agg_result,$this,$a,$b){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=($a&1);
 $2=$4;
 var $5=($b&1);
 $3=$5;
 var $6=$1;
 var $7=$2;
 var $8=(($7)&1);
 if($8){var $13=1;label=3;break;}else{label=2;break;}
 case 2: 
 var $10=$3;
 var $11=(($10)&1);
 var $13=$11;label=3;break;
 case 3: 
 var $13;
 __ZN6PacketC2Eb($agg_result,$13);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN22PureFunctionComponent2I10BooleanAndbbED2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN22PureFunctionComponent2I10BooleanAndbbED0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN22PureFunctionComponent2I10BooleanAndbbED2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN22PureFunctionComponent2I10BooleanAndbbE7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $ret=sp;
 var $3=(sp)+(8);
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet6isDataEv($in);
 if($5){label=2;break;}else{label=10;break;}
 case 2: 
 var $7=$2;
 var $8=(($7<<24)>>24);
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 var $11=__ZN6PacketcvbEv($in);
 var $12=(($4+33)|0);
 var $13=($11&1);
 HEAP8[(($12)>>0)]=$13;
 label=7;break;
 case 4: 
 var $15=$2;
 var $16=(($15<<24)>>24);
 var $17=($16|0)==1;
 if($17){label=5;break;}else{label=6;break;}
 case 5: 
 var $19=__ZN6PacketcvbEv($in);
 var $20=(($4+34)|0);
 var $21=($19&1);
 HEAP8[(($20)>>0)]=$21;
 label=6;break;
 case 6: 
 label=7;break;
 case 7: 
 var $24=(($4+32)|0);
 var $25=(($4+33)|0);
 var $26=HEAP8[(($25)>>0)];
 var $27=(($26)&1);
 var $28=(($4+34)|0);
 var $29=HEAP8[(($28)>>0)];
 var $30=(($29)&1);
 __ZN10BooleanAndclEbb($ret,$24,$27,$30);
 var $31=__ZNK6Packet7isValidEv($ret);
 if($31){label=8;break;}else{label=9;break;}
 case 8: 
 var $33=$4;
 var $34=$3;
 var $35=$ret;
 assert(8 % 1 === 0);HEAP32[(($34)>>2)]=HEAP32[(($35)>>2)];HEAP32[((($34)+(4))>>2)]=HEAP32[((($35)+(4))>>2)];
 __ZN9Component4sendE6Packeta($33,$3,0);
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10BooleanAndclEbb($agg_result,$this,$a,$b){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=($a&1);
 $2=$4;
 var $5=($b&1);
 $3=$5;
 var $6=$1;
 var $7=$2;
 var $8=(($7)&1);
 if($8){label=2;break;}else{var $13=0;label=3;break;}
 case 2: 
 var $10=$3;
 var $11=(($10)&1);
 var $13=$11;label=3;break;
 case 3: 
 var $13;
 __ZN6PacketC2Eb($agg_result,$13);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN21SingleOutputComponentC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1400;
 var $4=$2;
 var $5=(($2+24)|0);
 var $6=(($5)|0);
 __ZN9ComponentC2EP10Connectioni($4,$6,1);
 var $7=$2;
 HEAP32[(($7)>>2)]=1400;
 var $8=(($2+24)|0);
 STACKTOP=sp;return;
}


function __ZN9BoolToIntD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN9BoolToIntD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN9BoolToIntD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9BoolToInt7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=sp;
 var $4=(sp)+(8);
 var $5=(sp)+(16);
 $1=$this;
 $2=$port;
 var $6=$1;
 var $7=__ZNK6Packet6isBoolEv($in);
 if($7){label=2;break;}else{label=3;break;}
 case 2: 
 var $9=$6;
 var $10=$5;
 var $11=$in;
 assert(8 % 1 === 0);HEAP32[(($10)>>2)]=HEAP32[(($11)>>2)];HEAP32[((($10)+(4))>>2)]=HEAP32[((($11)+(4))>>2)];
 __ZN10BoolToIntFclE6Packet($3,$4,$5);
 __ZN9Component4sendE6Packeta($9,$3,0);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10BoolToIntFclE6Packet($agg_result,$this,$in){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];

 var $1;
 $1=$this;
 var $2=$1;
 var $3=__ZNK6Packet6asBoolEv($in);
 var $4=($3?1:0);
 __ZN6PacketC2El($agg_result,$4);
 STACKTOP=sp;return;
}


function __ZN21SingleOutputComponentD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN21SingleOutputComponentD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN21SingleOutputComponentD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN13ToggleBooleanD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN13ToggleBooleanD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN13ToggleBooleanD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN13ToggleBoolean7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=sp;
 var $4=(sp)+(8);
 $1=$this;
 $2=$port;
 var $5=$1;
 var $6=__ZNK6Packet7isSetupEv($in);
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 var $8=(($5+32)|0);
 HEAP8[(($8)>>0)]=0;
 label=10;break;
 case 3: 
 var $10=$2;
 var $11=(($10<<24)>>24);
 var $12=($11|0)==0;
 if($12){label=4;break;}else{label=6;break;}
 case 4: 
 var $14=__ZNK6Packet6isDataEv($in);
 if($14){label=5;break;}else{label=6;break;}
 case 5: 
 var $16=(($5+32)|0);
 var $17=HEAP8[(($16)>>0)];
 var $18=(($17)&1);
 var $19=$18^1;
 var $20=(($5+32)|0);
 var $21=($19&1);
 HEAP8[(($20)>>0)]=$21;
 var $22=$5;
 var $23=(($5+32)|0);
 var $24=HEAP8[(($23)>>0)];
 var $25=(($24)&1);
 __ZN6PacketC2Eb($3,$25);
 __ZN9Component4sendE6Packeta($22,$3,0);
 label=9;break;
 case 6: 
 var $27=$2;
 var $28=(($27<<24)>>24);
 var $29=($28|0)==1;
 if($29){label=7;break;}else{label=8;break;}
 case 7: 
 var $31=(($5+32)|0);
 HEAP8[(($31)>>0)]=0;
 var $32=$5;
 var $33=(($5+32)|0);
 var $34=HEAP8[(($33)>>0)];
 var $35=(($34)&1);
 __ZN6PacketC2Eb($4,$35);
 __ZN9Component4sendE6Packeta($32,$4,0);
 label=8;break;
 case 8: 
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet7isSetupEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+4)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)==1;
 STACKTOP=sp;return $5;
}


function __ZN5TimerD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN5TimerD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN5TimerD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN5Timer7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $currentMillis;
 var $3=sp;
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet7isSetupEv($in);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 var $7=(($4+32)|0);
 HEAP32[(($7)>>2)]=0;
 var $8=(($4+36)|0);
 HEAP32[(($8)>>2)]=1000;
 label=16;break;
 case 3: 
 var $10=__ZNK6Packet6isTickEv($in);
 if($10){label=4;break;}else{label=7;break;}
 case 4: 
 var $12=$4;
 var $13=(($12+4)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=$14;
 var $16=HEAP32[(($15)>>2)];
 var $17=(($16+52)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=FUNCTION_TABLE[$18]($14);
 $currentMillis=$19;
 var $20=$currentMillis;
 var $21=(($4+32)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=((($20)-($22))|0);
 var $24=(($4+36)|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=($23>>>0)>=($25>>>0);
 if($26){label=5;break;}else{label=6;break;}
 case 5: 
 var $28=$currentMillis;
 var $29=(($4+32)|0);
 HEAP32[(($29)>>2)]=$28;
 var $30=$4;
 __ZN6PacketC2Ev($3);
 __ZN9Component4sendE6Packeta($30,$3,0);
 label=6;break;
 case 6: 
 label=15;break;
 case 7: 
 var $33=$2;
 var $34=(($33<<24)>>24);
 var $35=($34|0)==0;
 if($35){label=8;break;}else{label=10;break;}
 case 8: 
 var $37=__ZNK6Packet6isDataEv($in);
 if($37){label=9;break;}else{label=10;break;}
 case 9: 
 var $39=__ZNK6Packet9asIntegerEv($in);
 var $40=(($4+36)|0);
 HEAP32[(($40)>>2)]=$39;
 label=14;break;
 case 10: 
 var $42=$2;
 var $43=(($42<<24)>>24);
 var $44=($43|0)==1;
 if($44){label=11;break;}else{label=13;break;}
 case 11: 
 var $46=__ZNK6Packet6isDataEv($in);
 if($46){label=12;break;}else{label=13;break;}
 case 12: 
 var $48=$4;
 var $49=(($48+4)|0);
 var $50=HEAP32[(($49)>>2)];
 var $51=$50;
 var $52=HEAP32[(($51)>>2)];
 var $53=(($52+52)|0);
 var $54=HEAP32[(($53)>>2)];
 var $55=FUNCTION_TABLE[$54]($50);
 var $56=(($4+32)|0);
 HEAP32[(($56)>>2)]=$55;
 label=13;break;
 case 13: 
 label=14;break;
 case 14: 
 label=15;break;
 case 15: 
 label=16;break;
 case 16: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet6isTickEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+4)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)==2;
 STACKTOP=sp;return $5;
}


function __ZN5SplitD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN5SplitD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN5SplitD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN5Split7processE6Packeta($this,$in,$inport){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $first;
 var $last;
 var $port;
 var $3=sp;
 $1=$this;
 $2=$inport;
 var $4=$1;
 var $5=__ZNK6Packet6isDataEv($in);
 if($5){label=2;break;}else{label=7;break;}
 case 2: 
 $first=0;
 $last=8;
 $port=0;
 label=3;break;
 case 3: 
 var $8=$port;
 var $9=(($8<<24)>>24);
 var $10=($9|0)<=8;
 if($10){label=4;break;}else{label=6;break;}
 case 4: 
 var $12=$4;
 var $13=$3;
 var $14=$in;
 assert(8 % 1 === 0);HEAP32[(($13)>>2)]=HEAP32[(($14)>>2)];HEAP32[((($13)+(4))>>2)]=HEAP32[((($14)+(4))>>2)];
 var $15=$port;
 __ZN9Component4sendE6Packeta($12,$3,$15);
 label=5;break;
 case 5: 
 var $17=$port;
 var $18=((($17)+(1))&255);
 $port=$18;
 label=3;break;
 case 6: 
 label=7;break;
 case 7: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9SerialOutD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN9SerialOutD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN9SerialOutD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9SerialOut7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $serialDevice;
 $1=$this;
 $2=$port;
 var $3=$1;
 $serialDevice=-1;
 var $4=__ZNK6Packet7isSetupEv($in);
 if($4){label=2;break;}else{label=3;break;}
 case 2: 
 var $6=$3;
 var $7=(($6+4)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=$8;
 var $10=HEAP32[(($9)>>2)];
 var $11=(($10+12)|0);
 var $12=HEAP32[(($11)>>2)];
 FUNCTION_TABLE[$12]($8,-1,9600);
 label=6;break;
 case 3: 
 var $14=__ZNK6Packet6isByteEv($in);
 if($14){label=4;break;}else{label=5;break;}
 case 4: 
 var $16=$3;
 var $17=(($16+4)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=$18;
 var $20=HEAP32[(($19)>>2)];
 var $21=(($20+24)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=__ZNK6Packet6asByteEv($in);
 FUNCTION_TABLE[$22]($18,-1,$23);
 label=5;break;
 case 5: 
 label=6;break;
 case 6: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet6isByteEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+4)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)==4;
 STACKTOP=sp;return $5;
}


function __ZN8SerialInD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN8SerialInD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN8SerialInD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN8SerialIn7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $serialDevice;
 var $c;
 var $3=sp;
 $1=$this;
 $2=$port;
 var $4=$1;
 $serialDevice=-1;
 var $5=__ZNK6Packet7isSetupEv($in);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 var $7=$4;
 var $8=(($7+4)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=$9;
 var $11=HEAP32[(($10)>>2)];
 var $12=(($11+12)|0);
 var $13=HEAP32[(($12)>>2)];
 FUNCTION_TABLE[$13]($9,-1,9600);
 label=8;break;
 case 3: 
 var $15=__ZNK6Packet6isTickEv($in);
 if($15){label=4;break;}else{label=7;break;}
 case 4: 
 var $17=$4;
 var $18=(($17+4)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=$19;
 var $21=HEAP32[(($20)>>2)];
 var $22=(($21+16)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=FUNCTION_TABLE[$23]($19,-1);
 var $25=($24|0)>0;
 if($25){label=5;break;}else{label=6;break;}
 case 5: 
 var $27=$4;
 var $28=(($27+4)|0);
 var $29=HEAP32[(($28)>>2)];
 var $30=$29;
 var $31=HEAP32[(($30)>>2)];
 var $32=(($31+20)|0);
 var $33=HEAP32[(($32)>>2)];
 var $34=FUNCTION_TABLE[$33]($29,-1);
 $c=$34;
 var $35=$4;
 var $36=$c;
 __ZN6PacketC2Eh($3,$36);
 __ZN9Component4sendE6Packeta($35,$3,0);
 label=6;break;
 case 6: 
 label=7;break;
 case 7: 
 label=8;break;
 case 8: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function ___clang_call_terminate($0){
 var label=0;


 var $2=___cxa_begin_catch($0);
 __ZSt9terminatev();
 throw "Reached an unreachable!";
}


function __ZN5RouteD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN5RouteD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN5RouteD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN5Route7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $p;
 var $3=sp;
 var $4=(sp)+(8);
 $1=$this;
 $2=$port;
 var $5=$1;
 var $6=$2;
 var $7=(($6<<24)>>24);
 var $8=($7|0)==0;
 if($8){label=2;break;}else{label=8;break;}
 case 2: 
 var $10=__ZNK6Packet9asIntegerEv($in);
 var $11=(($10)&255);
 var $12=(($5+104)|0);
 HEAP8[(($12)>>0)]=$11;
 var $13=(($5+104)|0);
 var $14=HEAP8[(($13)>>0)];
 var $15=(($14<<24)>>24);
 var $16=($15|0)>0;
 if($16){label=3;break;}else{label=7;break;}
 case 3: 
 var $18=(($5+104)|0);
 var $19=HEAP8[(($18)>>0)];
 var $20=(($19<<24)>>24);
 var $21=($20|0)<9;
 if($21){label=4;break;}else{label=7;break;}
 case 4: 
 var $23=(($5+104)|0);
 var $24=HEAP8[(($23)>>0)];
 var $25=(($24<<24)>>24);
 var $26=(($5+32)|0);
 var $27=(($26+($25<<3))|0);
 $p=$27;
 var $28=$p;
 var $29=__ZNK6Packet4typeEv($28);
 var $30=($29|0)!=0;
 if($30){label=5;break;}else{label=6;break;}
 case 5: 
 var $32=$5;
 var $33=$p;
 var $34=$3;
 var $35=$33;
 assert(8 % 1 === 0);HEAP32[(($34)>>2)]=HEAP32[(($35)>>2)];HEAP32[((($34)+(4))>>2)]=HEAP32[((($35)+(4))>>2)];
 __ZN9Component4sendE6Packeta($32,$3,0);
 label=6;break;
 case 6: 
 label=7;break;
 case 7: 
 label=13;break;
 case 8: 
 var $39=__ZNK6Packet6isDataEv($in);
 if($39){label=9;break;}else{label=12;break;}
 case 9: 
 var $41=$2;
 var $42=(($41<<24)>>24);
 var $43=(($5+32)|0);
 var $44=(($43+($42<<3))|0);
 var $45=$44;
 var $46=$in;
 assert(8 % 1 === 0);HEAP32[(($45)>>2)]=HEAP32[(($46)>>2)];HEAP32[((($45)+(4))>>2)]=HEAP32[((($46)+(4))>>2)];
 var $47=$2;
 var $48=(($47<<24)>>24);
 var $49=(($5+104)|0);
 var $50=HEAP8[(($49)>>0)];
 var $51=(($50<<24)>>24);
 var $52=($48|0)==($51|0);
 if($52){label=10;break;}else{label=11;break;}
 case 10: 
 var $54=$5;
 var $55=$4;
 var $56=$in;
 assert(8 % 1 === 0);HEAP32[(($55)>>2)]=HEAP32[(($56)>>2)];HEAP32[((($55)+(4))>>2)]=HEAP32[((($56)+(4))>>2)];
 __ZN9Component4sendE6Packeta($54,$4,0);
 label=11;break;
 case 11: 
 label=12;break;
 case 12: 
 label=13;break;
 case 13: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN14DummyComponentC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentC2EP10Connectioni($3,0,0);
 var $4=$2;
 HEAP32[(($4)>>2)]=1584;
 STACKTOP=sp;return;
}


function __ZN17ReadCapacitivePinD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN14DummyComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN17ReadCapacitivePinD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN17ReadCapacitivePinD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN14DummyComponent7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$this;
 $2=$port;
 var $3=$1;
 label=2;break;
 case 2: 
 var $5=$3;
 var $6=(($5+16)|0);
 var $7=HEAP32[(($6)>>2)];
 var $8=(($7+1008)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=$9;
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($10,1,27);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN14DummyComponentD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN14DummyComponentD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN14DummyComponentD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN8PwmWriteD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN8PwmWriteD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN8PwmWriteD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN8PwmWrite7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=sp;
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet7isSetupEv($in);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 label=11;break;
 case 3: 
 var $8=$2;
 var $9=(($8<<24)>>24);
 var $10=($9|0)==0;
 if($10){label=4;break;}else{label=6;break;}
 case 4: 
 var $12=__ZNK6Packet6isDataEv($in);
 if($12){label=5;break;}else{label=6;break;}
 case 5: 
 var $14=$4;
 var $15=(($14+4)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=$16;
 var $18=HEAP32[(($17)>>2)];
 var $19=(($18+48)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=(($4+32)|0);
 var $22=HEAP8[(($21)>>0)];
 var $23=__ZNK6Packet9asIntegerEv($in);
 FUNCTION_TABLE[$20]($16,$22,$23);
 var $24=$4;
 var $25=$3;
 var $26=$in;
 assert(8 % 1 === 0);HEAP32[(($25)>>2)]=HEAP32[(($26)>>2)];HEAP32[((($25)+(4))>>2)]=HEAP32[((($26)+(4))>>2)];
 __ZN9Component4sendE6Packeta($24,$3,0);
 label=10;break;
 case 6: 
 var $28=$2;
 var $29=(($28<<24)>>24);
 var $30=($29|0)==1;
 if($30){label=7;break;}else{label=9;break;}
 case 7: 
 var $32=__ZNK6Packet8isNumberEv($in);
 if($32){label=8;break;}else{label=9;break;}
 case 8: 
 var $34=__ZNK6Packet9asIntegerEv($in);
 var $35=(($34)&255);
 var $36=(($4+32)|0);
 HEAP8[(($36)>>0)]=$35;
 var $37=$4;
 var $38=(($37+4)|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=$39;
 var $41=HEAP32[(($40)>>2)];
 var $42=(($41+28)|0);
 var $43=HEAP32[(($42)>>2)];
 var $44=(($4+32)|0);
 var $45=HEAP8[(($44)>>0)];
 FUNCTION_TABLE[$43]($39,$45,1);
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 label=11;break;
 case 11: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10MonitorPinD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN10MonitorPinD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN10MonitorPinD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10MonitorPin7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $intr;
 var $3=sp;
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=$2;
 var $6=(($5<<24)>>24);
 var $7=($6|0)==0;
 if($7){label=2;break;}else{label=8;break;}
 case 2: 
 var $9=__ZNK6Packet9asIntegerEv($in);
 var $10=(($9)&255);
 var $11=(($4+32)|0);
 HEAP8[(($11)>>0)]=$10;
 $intr=0;
 var $12=(($4+32)|0);
 var $13=HEAP8[(($12)>>0)];
 var $14=(($13<<24)>>24);
 var $15=($14|0)==2;
 if($15){label=3;break;}else{label=4;break;}
 case 3: 
 $intr=0;
 label=7;break;
 case 4: 
 var $18=(($4+32)|0);
 var $19=HEAP8[(($18)>>0)];
 var $20=(($19<<24)>>24);
 var $21=($20|0)==3;
 if($21){label=5;break;}else{label=6;break;}
 case 5: 
 $intr=1;
 label=6;break;
 case 6: 
 label=7;break;
 case 7: 
 var $25=$4;
 var $26=(($25+4)|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=$27;
 var $29=HEAP32[(($28)>>2)];
 var $30=(($29+32)|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=(($4+32)|0);
 var $33=HEAP8[(($32)>>0)];
 FUNCTION_TABLE[$31]($27,$33,1);
 var $34=$4;
 var $35=(($34+4)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=$36;
 var $38=HEAP32[(($37)>>2)];
 var $39=(($38+60)|0);
 var $40=HEAP32[(($39)>>2)];
 var $41=$intr;
 var $42=$4;
 FUNCTION_TABLE[$40]($36,$41,2,8,$42);
 var $43=$4;
 var $44=$4;
 var $45=(($44+4)|0);
 var $46=HEAP32[(($45)>>2)];
 var $47=$46;
 var $48=HEAP32[(($47)>>2)];
 var $49=(($48+40)|0);
 var $50=HEAP32[(($49)>>2)];
 var $51=(($4+32)|0);
 var $52=HEAP8[(($51)>>0)];
 var $53=FUNCTION_TABLE[$50]($46,$52);
 __ZN6PacketC2Eb($3,$53);
 __ZN9Component4sendE6Packeta($43,$3,0);
 label=8;break;
 case 8: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10MonitorPin9interruptEPv($user){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $thisptr;
 var $2=sp;
 $1=$user;
 var $3=$1;
 var $4=$3;
 $thisptr=$4;
 var $5=$thisptr;
 var $6=$5;
 var $7=$thisptr;
 var $8=$7;
 var $9=(($8+4)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=$10;
 var $12=HEAP32[(($11)>>2)];
 var $13=(($12+40)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=$thisptr;
 var $16=(($15+32)|0);
 var $17=HEAP8[(($16)>>0)];
 var $18=FUNCTION_TABLE[$14]($10,$17);
 __ZN6PacketC2Eb($2,$18);
 __ZN9Component4sendE6Packeta($6,$2,0);
 STACKTOP=sp;return;
}


function __ZN9MapLinearD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN9MapLinearD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN9MapLinearD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9MapLinear7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=sp;
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet7isSetupEv($in);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 label=23;break;
 case 3: 
 var $8=$2;
 var $9=(($8<<24)>>24);
 var $10=($9|0)==1;
 if($10){label=4;break;}else{label=6;break;}
 case 4: 
 var $12=__ZNK6Packet6isDataEv($in);
 if($12){label=5;break;}else{label=6;break;}
 case 5: 
 var $14=__ZNK6Packet9asIntegerEv($in);
 var $15=(($4+32)|0);
 HEAP32[(($15)>>2)]=$14;
 label=22;break;
 case 6: 
 var $17=$2;
 var $18=(($17<<24)>>24);
 var $19=($18|0)==2;
 if($19){label=7;break;}else{label=9;break;}
 case 7: 
 var $21=__ZNK6Packet6isDataEv($in);
 if($21){label=8;break;}else{label=9;break;}
 case 8: 
 var $23=__ZNK6Packet9asIntegerEv($in);
 var $24=(($4+36)|0);
 HEAP32[(($24)>>2)]=$23;
 label=21;break;
 case 9: 
 var $26=$2;
 var $27=(($26<<24)>>24);
 var $28=($27|0)==3;
 if($28){label=10;break;}else{label=12;break;}
 case 10: 
 var $30=__ZNK6Packet6isDataEv($in);
 if($30){label=11;break;}else{label=12;break;}
 case 11: 
 var $32=__ZNK6Packet9asIntegerEv($in);
 var $33=(($4+44)|0);
 HEAP32[(($33)>>2)]=$32;
 label=20;break;
 case 12: 
 var $35=$2;
 var $36=(($35<<24)>>24);
 var $37=($36|0)==4;
 if($37){label=13;break;}else{label=15;break;}
 case 13: 
 var $39=__ZNK6Packet6isDataEv($in);
 if($39){label=14;break;}else{label=15;break;}
 case 14: 
 var $41=__ZNK6Packet9asIntegerEv($in);
 var $42=(($4+40)|0);
 HEAP32[(($42)>>2)]=$41;
 label=19;break;
 case 15: 
 var $44=$2;
 var $45=(($44<<24)>>24);
 var $46=($45|0)==0;
 if($46){label=16;break;}else{label=18;break;}
 case 16: 
 var $48=__ZNK6Packet8isNumberEv($in);
 if($48){label=17;break;}else{label=18;break;}
 case 17: 
 var $50=$4;
 var $51=__ZNK6Packet9asIntegerEv($in);
 var $52=__ZN9MapLinear3mapEl($4,$51);
 __ZN6PacketC2El($3,$52);
 __ZN9Component4sendE6Packeta($50,$3,0);
 label=18;break;
 case 18: 
 label=19;break;
 case 19: 
 label=20;break;
 case 20: 
 label=21;break;
 case 21: 
 label=22;break;
 case 22: 
 label=23;break;
 case 23: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9MapLinear3mapEl($this,$in){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$in;
 var $3=$1;
 var $4=$2;
 var $5=(($3+32)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=((($4)-($6))|0);
 var $8=(($3+40)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=(($3+44)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=((($9)-($11))|0);
 var $13=(Math_imul($7,$12)|0);
 var $14=(($3+36)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=(($3+32)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=((($15)-($17))|0);
 var $19=(((($13|0))/(($18|0)))&-1);
 var $20=(($3+44)|0);
 var $21=HEAP32[(($20)>>2)];
 var $22=((($19)+($21))|0);
 STACKTOP=sp;return $22;
}


function __ZN12LedMatrixMaxD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN12LedMatrixMaxD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN12LedMatrixMaxD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12LedMatrixMax7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $c;
 $1=$this;
 $2=$port;
 var $3=$1;
 var $4=$2;
 var $5=(($4<<24)>>24);
 var $6=($5|0)==0;
 if($6){label=2;break;}else{label=12;break;}
 case 2: 
 var $8=__ZNK6Packet9isIntegerEv($in);
 if($8){label=3;break;}else{label=5;break;}
 case 3: 
 var $10=__ZNK6Packet9asIntegerEv($in);
 var $11=($10|0)<38;
 if($11){label=4;break;}else{label=5;break;}
 case 4: 
 var $13=__ZNK6Packet9asIntegerEv($in);
 var $14=(($13)&255);
 var $15=(($3+45)|0);
 HEAP8[(($15)>>0)]=$14;
 label=11;break;
 case 5: 
 var $17=__ZNK6Packet6isByteEv($in);
 if($17){label=6;break;}else{label=10;break;}
 case 6: 
 var $19=__ZNK6Packet6asByteEv($in);
 $c=$19;
 var $20=$c;
 var $21=($20&255);
 var $22=($21|0)>65;
 if($22){label=7;break;}else{label=9;break;}
 case 7: 
 var $24=$c;
 var $25=($24&255);
 var $26=($25|0)<=90;
 if($26){label=8;break;}else{label=9;break;}
 case 8: 
 var $28=$c;
 var $29=($28&255);
 var $30=((($29)+(10))|0);
 var $31=((($30)-(65))|0);
 var $32=(($31)&255);
 var $33=(($3+45)|0);
 HEAP8[(($33)>>0)]=$32;
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 label=11;break;
 case 11: 
 __ZN12LedMatrixMax6updateEv($3);
 label=21;break;
 case 12: 
 var $38=$2;
 var $39=(($38<<24)>>24);
 var $40=($39|0)==3;
 if($40){label=13;break;}else{label=14;break;}
 case 13: 
 var $42=__ZNK6Packet9asIntegerEv($in);
 var $43=(($3+40)|0);
 HEAP32[(($43)>>2)]=$42;
 var $44=(($3+44)|0);
 HEAP8[(($44)>>0)]=0;
 __ZN12LedMatrixMax6updateEv($3);
 label=20;break;
 case 14: 
 var $46=$2;
 var $47=(($46<<24)>>24);
 var $48=($47|0)==1;
 if($48){label=15;break;}else{label=16;break;}
 case 15: 
 var $50=__ZNK6Packet9asIntegerEv($in);
 var $51=(($3+32)|0);
 HEAP32[(($51)>>2)]=$50;
 var $52=(($3+44)|0);
 HEAP8[(($52)>>0)]=0;
 __ZN12LedMatrixMax6updateEv($3);
 label=19;break;
 case 16: 
 var $54=$2;
 var $55=(($54<<24)>>24);
 var $56=($55|0)==2;
 if($56){label=17;break;}else{label=18;break;}
 case 17: 
 var $58=__ZNK6Packet9asIntegerEv($in);
 var $59=(($3+36)|0);
 HEAP32[(($59)>>2)]=$58;
 var $60=(($3+44)|0);
 HEAP8[(($60)>>0)]=0;
 __ZN12LedMatrixMax6updateEv($3);
 label=18;break;
 case 18: 
 label=19;break;
 case 19: 
 label=20;break;
 case 20: 
 label=21;break;
 case 21: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet9isIntegerEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+4)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)==7;
 STACKTOP=sp;return $5;
}


function __ZN12LedMatrixMax6updateEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $i;
 $1=$this;
 var $2=$1;
 var $3=(($2+32)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)<0;
 if($5){label=4;break;}else{label=2;break;}
 case 2: 
 var $7=(($2+36)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)<0;
 if($9){label=4;break;}else{label=3;break;}
 case 3: 
 var $11=(($2+40)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=($12|0)<0;
 if($13){label=4;break;}else{label=5;break;}
 case 4: 
 label=11;break;
 case 5: 
 var $16=(($2+44)|0);
 var $17=HEAP8[(($16)>>0)];
 var $18=(($17)&1);
 if($18){label=7;break;}else{label=6;break;}
 case 6: 
 var $20=$2;
 var $21=(($20+4)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=$22;
 var $24=HEAP32[(($23)>>2)];
 var $25=(($24+28)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=(($2+32)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=(($28)&255);
 FUNCTION_TABLE[$26]($22,$29,1);
 var $30=$2;
 var $31=(($30+4)|0);
 var $32=HEAP32[(($31)>>2)];
 var $33=$32;
 var $34=HEAP32[(($33)>>2)];
 var $35=(($34+28)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=(($2+36)|0);
 var $38=HEAP32[(($37)>>2)];
 var $39=(($38)&255);
 FUNCTION_TABLE[$36]($32,$39,1);
 var $40=$2;
 var $41=(($40+4)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=$42;
 var $44=HEAP32[(($43)>>2)];
 var $45=(($44+28)|0);
 var $46=HEAP32[(($45)>>2)];
 var $47=(($2+40)|0);
 var $48=HEAP32[(($47)>>2)];
 var $49=(($48)&255);
 FUNCTION_TABLE[$46]($42,$49,1);
 __ZN12LedMatrixMax12max7219_initEv($2);
 var $50=(($2+44)|0);
 HEAP8[(($50)>>0)]=1;
 label=7;break;
 case 7: 
 $i=1;
 label=8;break;
 case 8: 
 var $53=$i;
 var $54=($53&255);
 var $55=($54|0)<9;
 if($55){label=9;break;}else{label=11;break;}
 case 9: 
 var $57=$i;
 var $58=$i;
 var $59=($58&255);
 var $60=((($59)-(1))|0);
 var $61=(($2+45)|0);
 var $62=HEAP8[(($61)>>0)];
 var $63=($62&255);
 var $64=((3856+($63<<3))|0);
 var $65=(($64+$60)|0);
 var $66=HEAP8[(($65)>>0)];
 __ZN12LedMatrixMax13max7219_writeEhh($2,$57,$66);
 label=10;break;
 case 10: 
 var $68=$i;
 var $69=((($68)+(1))&255);
 $i=$69;
 label=8;break;
 case 11: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12LedMatrixMax12max7219_initEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 __ZN12LedMatrixMax13max7219_writeEhh($2,9,0);
 __ZN12LedMatrixMax13max7219_writeEhh($2,10,3);
 __ZN12LedMatrixMax13max7219_writeEhh($2,11,7);
 __ZN12LedMatrixMax13max7219_writeEhh($2,12,1);
 __ZN12LedMatrixMax13max7219_writeEhh($2,15,0);
 STACKTOP=sp;return;
}


function __ZN12LedMatrixMax13max7219_writeEhh($this,$address,$dat){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$address;
 $3=$dat;
 var $4=$1;
 var $5=$4;
 var $6=(($5+4)|0);
 var $7=HEAP32[(($6)>>2)];
 var $8=$7;
 var $9=HEAP32[(($8)>>2)];
 var $10=(($9+36)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=(($4+32)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=(($13)&255);
 FUNCTION_TABLE[$11]($7,$14,0);
 var $15=$2;
 __ZN12LedMatrixMax18max7219_write_byteEh($4,$15);
 var $16=$3;
 __ZN12LedMatrixMax18max7219_write_byteEh($4,$16);
 var $17=$4;
 var $18=(($17+4)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=$19;
 var $21=HEAP32[(($20)>>2)];
 var $22=(($21+36)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=(($4+32)|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=(($25)&255);
 FUNCTION_TABLE[$23]($19,$26,1);
 STACKTOP=sp;return;
}


function __ZN12LedMatrixMax18max7219_write_byteEh($this,$DATA){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $i;
 $1=$this;
 $2=$DATA;
 var $3=$1;
 $i=8;
 label=2;break;
 case 2: 
 var $5=$i;
 var $6=($5&255);
 var $7=($6|0)>=1;
 if($7){label=3;break;}else{label=5;break;}
 case 3: 
 var $9=$3;
 var $10=(($9+4)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=$11;
 var $13=HEAP32[(($12)>>2)];
 var $14=(($13+36)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=(($3+40)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17)&255);
 FUNCTION_TABLE[$15]($11,$18,0);
 var $19=$3;
 var $20=(($19+4)|0);
 var $21=HEAP32[(($20)>>2)];
 var $22=$21;
 var $23=HEAP32[(($22)>>2)];
 var $24=(($23+36)|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=(($3+36)|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=(($27)&255);
 var $29=$2;
 var $30=($29&255);
 var $31=$30&128;
 var $32=($31|0)!=0;
 FUNCTION_TABLE[$25]($21,$28,$32);
 var $33=$3;
 var $34=(($33+4)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=$35;
 var $37=HEAP32[(($36)>>2)];
 var $38=(($37+36)|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=(($3+40)|0);
 var $41=HEAP32[(($40)>>2)];
 var $42=(($41)&255);
 FUNCTION_TABLE[$39]($35,$42,1);
 var $43=$2;
 var $44=($43&255);
 var $45=$44<<1;
 var $46=(($45)&255);
 $2=$46;
 label=4;break;
 case 4: 
 var $48=$i;
 var $49=((($48)-(1))&255);
 $i=$49;
 label=2;break;
 case 5: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN13InvertBooleanD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN13InvertBooleanD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN13InvertBooleanD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN13InvertBoolean7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $p=sp;
 var $3=(sp)+(8);
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet6isDataEv($in);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 var $7=__ZNK6Packet6asBoolEv($in);
 var $8=$7^1;
 __ZN6PacketC2Eb($p,$8);
 var $9=$4;
 var $10=$3;
 var $11=$p;
 assert(8 % 1 === 0);HEAP32[(($10)>>2)]=HEAP32[(($11)>>2)];HEAP32[((($10)+(4))>>2)]=HEAP32[((($11)+(4))>>2)];
 __ZN9Component4sendE6Packeta($9,$3,0);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN15HysteresisLatchD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN15HysteresisLatchD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN15HysteresisLatchD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN15HysteresisLatch7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$this;
 $2=$port;
 var $3=$1;
 var $4=__ZNK6Packet7isSetupEv($in);
 if($4){label=2;break;}else{label=3;break;}
 case 2: 
 var $6=(($3+32)|0);
 HEAPF32[(($6)>>2)]=30;
 var $7=(($3+36)|0);
 HEAPF32[(($7)>>2)]=24;
 var $8=(($3+40)|0);
 HEAP8[(($8)>>0)]=1;
 label=15;break;
 case 3: 
 var $10=$2;
 var $11=(($10<<24)>>24);
 var $12=($11|0)==1;
 if($12){label=4;break;}else{label=6;break;}
 case 4: 
 var $14=__ZNK6Packet8isNumberEv($in);
 if($14){label=5;break;}else{label=6;break;}
 case 5: 
 var $16=__ZNK6Packet7asFloatEv($in);
 var $17=(($3+36)|0);
 HEAPF32[(($17)>>2)]=$16;
 label=14;break;
 case 6: 
 var $19=$2;
 var $20=(($19<<24)>>24);
 var $21=($20|0)==2;
 if($21){label=7;break;}else{label=9;break;}
 case 7: 
 var $23=__ZNK6Packet8isNumberEv($in);
 if($23){label=8;break;}else{label=9;break;}
 case 8: 
 var $25=__ZNK6Packet7asFloatEv($in);
 var $26=(($3+32)|0);
 HEAPF32[(($26)>>2)]=$25;
 label=13;break;
 case 9: 
 var $28=$2;
 var $29=(($28<<24)>>24);
 var $30=($29|0)==0;
 if($30){label=10;break;}else{label=12;break;}
 case 10: 
 var $32=__ZNK6Packet8isNumberEv($in);
 if($32){label=11;break;}else{label=12;break;}
 case 11: 
 var $34=__ZNK6Packet7asFloatEv($in);
 __ZN15HysteresisLatch11updateValueEf($3,$34);
 label=12;break;
 case 12: 
 label=13;break;
 case 13: 
 label=14;break;
 case 14: 
 label=15;break;
 case 15: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN15HysteresisLatch11updateValueEf($this,$input){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=sp;
 $1=$this;
 $2=$input;
 var $4=$1;
 var $5=(($4+40)|0);
 var $6=HEAP8[(($5)>>0)];
 var $7=(($6)&1);
 if($7){label=2;break;}else{label=5;break;}
 case 2: 
 var $9=$2;
 var $10=(($4+36)|0);
 var $11=HEAPF32[(($10)>>2)];
 var $12=$9<=$11;
 if($12){label=3;break;}else{label=4;break;}
 case 3: 
 var $14=(($4+40)|0);
 HEAP8[(($14)>>0)]=0;
 label=4;break;
 case 4: 
 label=8;break;
 case 5: 
 var $17=$2;
 var $18=(($4+32)|0);
 var $19=HEAPF32[(($18)>>2)];
 var $20=$17>=$19;
 if($20){label=6;break;}else{label=7;break;}
 case 6: 
 var $22=(($4+40)|0);
 HEAP8[(($22)>>0)]=1;
 label=7;break;
 case 7: 
 label=8;break;
 case 8: 
 var $25=$4;
 var $26=(($4+40)|0);
 var $27=HEAP8[(($26)>>0)];
 var $28=(($27)&1);
 __ZN6PacketC2Eb($3,$28);
 __ZN9Component4sendE6Packeta($25,$3,0);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN4GateD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN4GateD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN4GateD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN4Gate7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$this;
 $2=$port;
 var $3=$1;
 var $4=$2;
 var $5=(($4<<24)>>24);
 var $6=($5|0)==0;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 var $8=(($3+36)|0);
 var $9=$8;
 var $10=$in;
 assert(8 % 1 === 0);HEAP32[(($9)>>2)]=HEAP32[(($10)>>2)];HEAP32[((($9)+(4))>>2)]=HEAP32[((($10)+(4))>>2)];
 __ZN4Gate13sendIfEnabledEv($3);
 label=6;break;
 case 3: 
 var $12=$2;
 var $13=(($12<<24)>>24);
 var $14=($13|0)==1;
 if($14){label=4;break;}else{label=5;break;}
 case 4: 
 var $16=__ZNK6Packet6asBoolEv($in);
 var $17=(($3+32)|0);
 var $18=($16&1);
 HEAP8[(($17)>>0)]=$18;
 __ZN4Gate13sendIfEnabledEv($3);
 label=5;break;
 case 5: 
 label=6;break;
 case 6: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN4Gate13sendIfEnabledEv($this){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2=sp;
 $1=$this;
 var $3=$1;
 var $4=(($3+32)|0);
 var $5=HEAP8[(($4)>>0)];
 var $6=(($5)&1);
 if($6){label=2;break;}else{label=4;break;}
 case 2: 
 var $8=(($3+36)|0);
 var $9=__ZNK6Packet7isValidEv($8);
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 var $11=$3;
 var $12=(($3+36)|0);
 var $13=$2;
 var $14=$12;
 assert(8 % 1 === 0);HEAP32[(($13)>>2)]=HEAP32[(($14)>>2)];HEAP32[((($13)+(4))>>2)]=HEAP32[((($14)+(4))>>2)];
 __ZN9Component4sendE6Packeta($11,$2,0);
 label=4;break;
 case 4: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7ForwardD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN7ForwardD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN7ForwardD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN7Forward7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=sp;
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet6isDataEv($in);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 var $7=$4;
 var $8=$3;
 var $9=$in;
 assert(8 % 1 === 0);HEAP32[(($8)>>2)]=HEAP32[(($9)>>2)];HEAP32[((($8)+(4))>>2)]=HEAP32[((($9)+(4))>>2)];
 var $10=$2;
 __ZN9Component4sendE6Packeta($7,$3,$10);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12DigitalWriteD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN12DigitalWriteD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN12DigitalWriteD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12DigitalWrite7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=sp;
 var $4=(sp)+(8);
 $1=$this;
 $2=$port;
 var $5=$1;
 var $6=__ZNK6Packet7isSetupEv($in);
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 var $8=(($5+32)|0);
 HEAP8[(($8)>>0)]=-1;
 var $9=(($5+33)|0);
 HEAP8[(($9)>>0)]=0;
 label=15;break;
 case 3: 
 var $11=$2;
 var $12=(($11<<24)>>24);
 var $13=($12|0)==0;
 if($13){label=4;break;}else{label=8;break;}
 case 4: 
 var $15=__ZNK6Packet6isBoolEv($in);
 if($15){label=5;break;}else{label=8;break;}
 case 5: 
 var $17=__ZNK6Packet6asBoolEv($in);
 var $18=(($5+33)|0);
 var $19=($17&1);
 HEAP8[(($18)>>0)]=$19;
 var $20=(($5+32)|0);
 var $21=HEAP8[(($20)>>0)];
 var $22=(($21<<24)>>24);
 var $23=($22|0)>=0;
 if($23){label=6;break;}else{label=7;break;}
 case 6: 
 var $25=$5;
 var $26=(($25+4)|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=$27;
 var $29=HEAP32[(($28)>>2)];
 var $30=(($29+36)|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=(($5+32)|0);
 var $33=HEAP8[(($32)>>0)];
 var $34=(($5+33)|0);
 var $35=HEAP8[(($34)>>0)];
 var $36=(($35)&1);
 FUNCTION_TABLE[$31]($27,$33,$36);
 var $37=$5;
 var $38=$3;
 var $39=$in;
 assert(8 % 1 === 0);HEAP32[(($38)>>2)]=HEAP32[(($39)>>2)];HEAP32[((($38)+(4))>>2)]=HEAP32[((($39)+(4))>>2)];
 __ZN9Component4sendE6Packeta($37,$3,0);
 label=7;break;
 case 7: 
 label=14;break;
 case 8: 
 var $42=$2;
 var $43=(($42<<24)>>24);
 var $44=($43|0)==1;
 if($44){label=9;break;}else{label=13;break;}
 case 9: 
 var $46=__ZNK6Packet8isNumberEv($in);
 if($46){label=10;break;}else{label=13;break;}
 case 10: 
 var $48=__ZNK6Packet9asIntegerEv($in);
 var $49=(($48)&255);
 var $50=(($5+32)|0);
 HEAP8[(($50)>>0)]=$49;
 var $51=$5;
 var $52=(($51+4)|0);
 var $53=HEAP32[(($52)>>2)];
 var $54=$53;
 var $55=HEAP32[(($54)>>2)];
 var $56=(($55+28)|0);
 var $57=HEAP32[(($56)>>2)];
 var $58=(($5+32)|0);
 var $59=HEAP8[(($58)>>0)];
 FUNCTION_TABLE[$57]($53,$59,1);
 var $60=(($5+32)|0);
 var $61=HEAP8[(($60)>>0)];
 var $62=(($61<<24)>>24);
 var $63=($62|0)>=0;
 if($63){label=11;break;}else{label=12;break;}
 case 11: 
 var $65=$5;
 var $66=(($65+4)|0);
 var $67=HEAP32[(($66)>>2)];
 var $68=$67;
 var $69=HEAP32[(($68)>>2)];
 var $70=(($69+36)|0);
 var $71=HEAP32[(($70)>>2)];
 var $72=(($5+32)|0);
 var $73=HEAP8[(($72)>>0)];
 var $74=(($5+33)|0);
 var $75=HEAP8[(($74)>>0)];
 var $76=(($75)&1);
 FUNCTION_TABLE[$71]($67,$73,$76);
 var $77=$5;
 var $78=$4;
 var $79=$in;
 assert(8 % 1 === 0);HEAP32[(($78)>>2)]=HEAP32[(($79)>>2)];HEAP32[((($78)+(4))>>2)]=HEAP32[((($79)+(4))>>2)];
 __ZN9Component4sendE6Packeta($77,$4,0);
 label=12;break;
 case 12: 
 label=13;break;
 case 13: 
 label=14;break;
 case 14: 
 label=15;break;
 case 15: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN11DigitalReadD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN11DigitalReadD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN11DigitalReadD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN11DigitalRead7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $triggerPort;
 var $pinConfigPort;
 var $pullupConfigPort;
 var $isHigh;
 var $3=sp;
 $1=$this;
 $2=$port;
 var $4=$1;
 $triggerPort=0;
 $pinConfigPort=1;
 $pullupConfigPort=2;
 var $5=__ZNK6Packet7isSetupEv($in);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 __ZN11DigitalRead15setPinAndPullupEib($4,12,1);
 label=15;break;
 case 3: 
 var $8=$2;
 var $9=(($8<<24)>>24);
 var $10=($9|0)==0;
 if($10){label=4;break;}else{label=6;break;}
 case 4: 
 var $12=__ZNK6Packet6isDataEv($in);
 if($12){label=5;break;}else{label=6;break;}
 case 5: 
 var $14=$4;
 var $15=(($14+4)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=$16;
 var $18=HEAP32[(($17)>>2)];
 var $19=(($18+40)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=(($4+32)|0);
 var $22=HEAP8[(($21)>>0)];
 var $23=FUNCTION_TABLE[$20]($16,$22);
 var $24=($23&1);
 $isHigh=$24;
 var $25=$4;
 var $26=$isHigh;
 var $27=(($26)&1);
 __ZN6PacketC2Eb($3,$27);
 __ZN9Component4sendE6Packeta($25,$3,0);
 label=14;break;
 case 6: 
 var $29=$2;
 var $30=(($29<<24)>>24);
 var $31=($30|0)==1;
 if($31){label=7;break;}else{label=9;break;}
 case 7: 
 var $33=__ZNK6Packet8isNumberEv($in);
 if($33){label=8;break;}else{label=9;break;}
 case 8: 
 var $35=__ZNK6Packet9asIntegerEv($in);
 var $36=(($4+33)|0);
 var $37=HEAP8[(($36)>>0)];
 var $38=(($37)&1);
 __ZN11DigitalRead15setPinAndPullupEib($4,$35,$38);
 label=13;break;
 case 9: 
 var $40=$2;
 var $41=(($40<<24)>>24);
 var $42=($41|0)==2;
 if($42){label=10;break;}else{label=12;break;}
 case 10: 
 var $44=__ZNK6Packet6isBoolEv($in);
 if($44){label=11;break;}else{label=12;break;}
 case 11: 
 var $46=(($4+32)|0);
 var $47=HEAP8[(($46)>>0)];
 var $48=(($47<<24)>>24);
 var $49=__ZNK6Packet6asBoolEv($in);
 __ZN11DigitalRead15setPinAndPullupEib($4,$48,$49);
 label=12;break;
 case 12: 
 label=13;break;
 case 13: 
 label=14;break;
 case 14: 
 label=15;break;
 case 15: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN11DigitalRead15setPinAndPullupEib($this,$newPin,$newPullup){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$newPin;
 var $4=($newPullup&1);
 $3=$4;
 var $5=$1;
 var $6=$2;
 var $7=(($6)&255);
 var $8=(($5+32)|0);
 HEAP8[(($8)>>0)]=$7;
 var $9=$3;
 var $10=(($9)&1);
 var $11=(($5+33)|0);
 var $12=($10&1);
 HEAP8[(($11)>>0)]=$12;
 var $13=$5;
 var $14=(($13+4)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=$15;
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17+28)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=(($5+32)|0);
 var $21=HEAP8[(($20)>>0)];
 FUNCTION_TABLE[$19]($15,$21,0);
 var $22=$5;
 var $23=(($22+4)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=$24;
 var $26=HEAP32[(($25)>>2)];
 var $27=(($26+32)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=(($5+32)|0);
 var $30=HEAP8[(($29)>>0)];
 var $31=(($5+33)|0);
 var $32=HEAP8[(($31)>>0)];
 var $33=(($32)&1);
 var $34=($33?1:0);
 FUNCTION_TABLE[$28]($24,$30,$34);
 STACKTOP=sp;return;
}


function __ZN5CountD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN5CountD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN5CountD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN5Count7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=sp;
 var $4=(sp)+(8);
 var $5=(sp)+(16);
 $1=$this;
 $2=$port;
 var $6=$1;
 var $7=__ZNK6Packet7isSetupEv($in);
 if($7){label=2;break;}else{label=3;break;}
 case 2: 
 var $9=(($6+32)|0);
 HEAP32[(($9)>>2)]=0;
 var $10=(($6+36)|0);
 HEAP8[(($10)>>0)]=0;
 var $11=$6;
 var $12=(($6+32)|0);
 var $13=HEAP32[(($12)>>2)];
 __ZN6PacketC2El($3,$13);
 __ZN9Component4sendE6Packeta($11,$3,0);
 label=16;break;
 case 3: 
 var $15=$2;
 var $16=(($15<<24)>>24);
 var $17=($16|0)==0;
 if($17){label=4;break;}else{label=7;break;}
 case 4: 
 var $19=(($6+36)|0);
 var $20=HEAP8[(($19)>>0)];
 var $21=(($20)&1);
 if($21){label=6;break;}else{label=5;break;}
 case 5: 
 var $23=(($6+32)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=((($24)+(1))|0);
 HEAP32[(($23)>>2)]=$25;
 var $26=$6;
 var $27=(($6+32)|0);
 var $28=HEAP32[(($27)>>2)];
 __ZN6PacketC2El($4,$28);
 __ZN9Component4sendE6Packeta($26,$4,0);
 label=6;break;
 case 6: 
 label=15;break;
 case 7: 
 var $31=$2;
 var $32=(($31<<24)>>24);
 var $33=($32|0)==1;
 if($33){label=8;break;}else{label=14;break;}
 case 8: 
 var $35=__ZNK6Packet6isBoolEv($in);
 if($35){label=9;break;}else{label=10;break;}
 case 9: 
 var $37=__ZNK6Packet6asBoolEv($in);
 var $38=(($6+36)|0);
 var $39=($37&1);
 HEAP8[(($38)>>0)]=$39;
 label=10;break;
 case 10: 
 var $41=(($6+36)|0);
 var $42=HEAP8[(($41)>>0)];
 var $43=(($42)&1);
 if($43){label=12;break;}else{label=11;break;}
 case 11: 
 var $45=__ZNK6Packet6isVoidEv($in);
 if($45){label=12;break;}else{label=13;break;}
 case 12: 
 var $47=(($6+32)|0);
 HEAP32[(($47)>>2)]=0;
 var $48=$6;
 var $49=(($6+32)|0);
 var $50=HEAP32[(($49)>>2)];
 __ZN6PacketC2El($5,$50);
 __ZN9Component4sendE6Packeta($48,$5,0);
 label=13;break;
 case 13: 
 label=14;break;
 case 14: 
 label=15;break;
 case 15: 
 label=16;break;
 case 16: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9ConstrainD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN9ConstrainD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN9ConstrainD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9Constrain7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=sp;
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet7isSetupEv($in);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 var $7=(($4+32)|0);
 HEAP32[(($7)>>2)]=0;
 var $8=(($4+36)|0);
 HEAP32[(($8)>>2)]=0;
 var $9=(($4+40)|0);
 HEAP32[(($9)>>2)]=0;
 label=15;break;
 case 3: 
 var $11=$2;
 var $12=(($11<<24)>>24);
 var $13=($12|0)==1;
 if($13){label=4;break;}else{label=6;break;}
 case 4: 
 var $15=__ZNK6Packet6isDataEv($in);
 if($15){label=5;break;}else{label=6;break;}
 case 5: 
 var $17=__ZNK6Packet9asIntegerEv($in);
 var $18=(($4+32)|0);
 HEAP32[(($18)>>2)]=$17;
 label=14;break;
 case 6: 
 var $20=$2;
 var $21=(($20<<24)>>24);
 var $22=($21|0)==2;
 if($22){label=7;break;}else{label=9;break;}
 case 7: 
 var $24=__ZNK6Packet6isDataEv($in);
 if($24){label=8;break;}else{label=9;break;}
 case 8: 
 var $26=__ZNK6Packet9asIntegerEv($in);
 var $27=(($4+36)|0);
 HEAP32[(($27)>>2)]=$26;
 label=13;break;
 case 9: 
 var $29=$2;
 var $30=(($29<<24)>>24);
 var $31=($30|0)==0;
 if($31){label=10;break;}else{label=12;break;}
 case 10: 
 var $33=__ZNK6Packet8isNumberEv($in);
 if($33){label=11;break;}else{label=12;break;}
 case 11: 
 var $35=__ZNK6Packet9asIntegerEv($in);
 var $36=(($4+40)|0);
 HEAP32[(($36)>>2)]=$35;
 var $37=$4;
 var $38=__ZN9Constrain10_constrainEv($4);
 __ZN6PacketC2El($3,$38);
 __ZN9Component4sendE6Packeta($37,$3,0);
 label=12;break;
 case 12: 
 label=13;break;
 case 13: 
 label=14;break;
 case 14: 
 label=15;break;
 case 15: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9Constrain10_constrainEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $2=$this;
 var $3=$2;
 var $4=(($3+40)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=(($3+36)|0);
 var $7=HEAP32[(($6)>>2)];
 var $8=($5|0)>($7|0);
 if($8){label=2;break;}else{label=3;break;}
 case 2: 
 var $10=(($3+36)|0);
 var $11=HEAP32[(($10)>>2)];
 $1=$11;
 label=6;break;
 case 3: 
 var $13=(($3+40)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=(($3+32)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=($14|0)<($16|0);
 if($17){label=4;break;}else{label=5;break;}
 case 4: 
 var $19=(($3+32)|0);
 var $20=HEAP32[(($19)>>2)];
 $1=$20;
 label=6;break;
 case 5: 
 var $22=(($3+40)|0);
 var $23=HEAP32[(($22)>>2)];
 $1=$23;
 label=6;break;
 case 6: 
 var $25=$1;
 STACKTOP=sp;return $25;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN15BreakBeforeMakeD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN15BreakBeforeMakeD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN15BreakBeforeMakeD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN15BreakBeforeMake7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+32)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3=sp;
 var $4=(sp)+(8);
 var $5=(sp)+(16);
 var $6=(sp)+(24);
 $1=$this;
 $2=$port;
 var $7=$1;
 var $8=(($7+24)|0);
 var $9=HEAP32[(($8)>>2)];
 switch(($9|0)){case 6:{ label=11;break;}case 2:{ label=15;break;}case 3:{ label=19;break;}case 0:{ label=2;break;}case 5:{ label=23;break;}case 4:{ label=3;break;}case 1:{ label=7;break;}default:{label=27;break;}}break;
 case 2: 
 var $11=(($7+24)|0);
 HEAP32[(($11)>>2)]=6;
 label=28;break;
 case 3: 
 var $13=$2;
 var $14=(($13<<24)>>24);
 var $15=($14|0)==2;
 if($15){label=4;break;}else{label=6;break;}
 case 4: 
 var $17=__ZNK6Packet6asBoolEv($in);
 if($17){label=6;break;}else{label=5;break;}
 case 5: 
 var $19=$7;
 __ZN6PacketC2Eb($3,1);
 __ZN9Component4sendE6Packeta($19,$3,0);
 var $20=(($7+24)|0);
 HEAP32[(($20)>>2)]=1;
 label=6;break;
 case 6: 
 label=28;break;
 case 7: 
 var $23=$2;
 var $24=(($23<<24)>>24);
 var $25=($24|0)==1;
 if($25){label=8;break;}else{label=10;break;}
 case 8: 
 var $27=__ZNK6Packet6asBoolEv($in);
 if($27){label=9;break;}else{label=10;break;}
 case 9: 
 var $29=(($7+24)|0);
 HEAP32[(($29)>>2)]=6;
 label=10;break;
 case 10: 
 label=28;break;
 case 11: 
 var $32=$2;
 var $33=(($32<<24)>>24);
 var $34=($33|0)==0;
 if($34){label=12;break;}else{label=14;break;}
 case 12: 
 var $36=__ZNK6Packet6asBoolEv($in);
 if($36){label=13;break;}else{label=14;break;}
 case 13: 
 var $38=$7;
 __ZN6PacketC2Eb($4,0);
 __ZN9Component4sendE6Packeta($38,$4,0);
 var $39=(($7+24)|0);
 HEAP32[(($39)>>2)]=2;
 label=14;break;
 case 14: 
 label=28;break;
 case 15: 
 var $42=$2;
 var $43=(($42<<24)>>24);
 var $44=($43|0)==1;
 if($44){label=16;break;}else{label=18;break;}
 case 16: 
 var $46=__ZNK6Packet6asBoolEv($in);
 if($46){label=18;break;}else{label=17;break;}
 case 17: 
 var $48=$7;
 __ZN6PacketC2Eb($5,1);
 __ZN9Component4sendE6Packeta($48,$5,1);
 var $49=(($7+24)|0);
 HEAP32[(($49)>>2)]=3;
 label=18;break;
 case 18: 
 label=28;break;
 case 19: 
 var $52=$2;
 var $53=(($52<<24)>>24);
 var $54=($53|0)==2;
 if($54){label=20;break;}else{label=22;break;}
 case 20: 
 var $56=__ZNK6Packet6asBoolEv($in);
 if($56){label=21;break;}else{label=22;break;}
 case 21: 
 var $58=(($7+24)|0);
 HEAP32[(($58)>>2)]=5;
 label=22;break;
 case 22: 
 label=28;break;
 case 23: 
 var $61=$2;
 var $62=(($61<<24)>>24);
 var $63=($62|0)==0;
 if($63){label=24;break;}else{label=26;break;}
 case 24: 
 var $65=__ZNK6Packet6asBoolEv($in);
 if($65){label=26;break;}else{label=25;break;}
 case 25: 
 var $67=$7;
 __ZN6PacketC2Eb($6,0);
 __ZN9Component4sendE6Packeta($67,$6,1);
 var $68=(($7+24)|0);
 HEAP32[(($68)>>2)]=4;
 label=26;break;
 case 26: 
 label=27;break;
 case 27: 
 label=28;break;
 case 28: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10ArduinoUnoD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN9ComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN10ArduinoUnoD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN10ArduinoUnoD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10ArduinoUno7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $digitalPins;
 var $analogPins;
 var $outPort;
 var $val;
 var $3=sp;
 $1=$this;
 $2=$port;
 var $4=$1;
 $digitalPins=14;
 $analogPins=6;
 var $5=__ZNK6Packet7isSetupEv($in);
 if($5){label=2;break;}else{label=10;break;}
 case 2: 
 $outPort=0;
 label=3;break;
 case 3: 
 var $8=$outPort;
 var $9=(($8<<24)>>24);
 var $10=($9|0)<20;
 if($10){label=4;break;}else{label=9;break;}
 case 4: 
 var $12=$outPort;
 var $13=(($12<<24)>>24);
 var $14=($13|0)<14;
 if($14){label=5;break;}else{label=6;break;}
 case 5: 
 var $16=$outPort;
 var $17=(($16<<24)>>24);
 var $23=$17;label=7;break;
 case 6: 
 var $19=$outPort;
 var $20=(($19<<24)>>24);
 var $21=((($20)-(14))|0);
 var $23=$21;label=7;break;
 case 7: 
 var $23;
 $val=$23;
 var $24=$4;
 var $25=$val;
 __ZN6PacketC2El($3,$25);
 var $26=$outPort;
 __ZN9Component4sendE6Packeta($24,$3,$26);
 label=8;break;
 case 8: 
 var $28=$outPort;
 var $29=((($28)+(1))&255);
 $outPort=$29;
 label=3;break;
 case 9: 
 label=10;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10AnalogReadD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN21SingleOutputComponentD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN10AnalogReadD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN10AnalogReadD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10AnalogRead7processE6Packeta($this,$in,$port){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $in; $in=STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($in)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($in)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $val;
 var $3=sp;
 $1=$this;
 $2=$port;
 var $4=$1;
 var $5=__ZNK6Packet7isSetupEv($in);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 label=11;break;
 case 3: 
 var $8=$2;
 var $9=(($8<<24)>>24);
 var $10=($9|0)==0;
 if($10){label=4;break;}else{label=6;break;}
 case 4: 
 var $12=__ZNK6Packet6isDataEv($in);
 if($12){label=5;break;}else{label=6;break;}
 case 5: 
 var $14=$4;
 var $15=(($14+4)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=$16;
 var $18=HEAP32[(($17)>>2)];
 var $19=(($18+44)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=(($4+32)|0);
 var $22=HEAP8[(($21)>>0)];
 var $23=FUNCTION_TABLE[$20]($16,$22);
 $val=$23;
 var $24=$4;
 var $25=$val;
 __ZN6PacketC2El($3,$25);
 __ZN9Component4sendE6Packeta($24,$3,0);
 label=10;break;
 case 6: 
 var $27=$2;
 var $28=(($27<<24)>>24);
 var $29=($28|0)==1;
 if($29){label=7;break;}else{label=9;break;}
 case 7: 
 var $31=__ZNK6Packet8isNumberEv($in);
 if($31){label=8;break;}else{label=9;break;}
 case 8: 
 var $33=__ZNK6Packet9asIntegerEv($in);
 var $34=(($33)&255);
 var $35=(($4+32)|0);
 HEAP8[(($35)>>0)]=$34;
 var $36=$4;
 var $37=(($36+4)|0);
 var $38=HEAP32[(($37)>>2)];
 var $39=$38;
 var $40=HEAP32[(($39)>>2)];
 var $41=(($40+28)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=(($4+32)|0);
 var $44=HEAP8[(($43)>>0)];
 FUNCTION_TABLE[$42]($38,$44,0);
 label=9;break;
 case 9: 
 label=10;break;
 case 10: 
 label=11;break;
 case 11: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12EmscriptenIO5setupEP13HostTransport($this,$t){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$t;
 var $3=$1;
 var $4=$2;
 var $5=(($3+32)|0);
 HEAP32[(($5)>>2)]=$4;
 STACKTOP=sp;return;
}


function __ZN12EmscriptenIOD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN2IOD2Ev($3);
 STACKTOP=sp;return;
}


function __ZN12EmscriptenIOC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $i;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN2IOC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1744;
 var $5=(($2+8)|0);
 HEAP32[(($5)>>2)]=0;
 var $6=(($2+32)|0);
 HEAP32[(($6)>>2)]=0;
 $i=0;
 label=2;break;
 case 2: 
 var $8=$i;
 var $9=($8&255);
 var $10=($9|0)<20;
 if($10){label=3;break;}else{label=5;break;}
 case 3: 
 var $12=$i;
 var $13=($12&255);
 var $14=(($2+12)|0);
 var $15=(($14+$13)|0);
 HEAP8[(($15)>>0)]=0;
 label=4;break;
 case 4: 
 var $17=$i;
 var $18=((($17)+(1))&255);
 $i=$18;
 label=2;break;
 case 5: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN23EmscriptenHostTransportC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 __ZN13HostTransportC2Ev($3);
 var $4=$2;
 HEAP32[(($4)>>2)]=1208;
 var $5=(($2+4)|0);
 HEAP32[(($5)>>2)]=0;
 var $6=(($2+8)|0);
 HEAP32[(($6)>>2)]=0;
 STACKTOP=sp;return;
}


function __ZN2IOC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1072;
 STACKTOP=sp;return;
}


function __ZN12EmscriptenIOD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN12EmscriptenIOD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12EmscriptenIO10setIoValueEPKhh($this,$buf,$len){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $type;
 var $pin;
 var $val;
 var $b=sp;
 var $b1=(sp)+(8);
 $1=$this;
 $2=$buf;
 $3=$len;
 var $4=$1;
 var $5=$2;
 var $6=(($5+1)|0);
 var $7=HEAP8[(($6)>>0)];
 var $8=($7&255);
 $type=$8;
 var $9=$type;
 var $10=($9|0)==1;
 if($10){label=2;break;}else{label=5;break;}
 case 2: 
 label=3;break;
 case 3: 
 var $13=$4;
 var $14=(($13+4)|0);
 var $15=HEAP32[(($14)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($15,1,34);
 label=4;break;
 case 4: 
 label=19;break;
 case 5: 
 var $18=$type;
 var $19=($18|0)==2;
 if($19){label=6;break;}else{label=12;break;}
 case 6: 
 var $21=$2;
 var $22=(($21+2)|0);
 var $23=HEAP8[(($22)>>0)];
 $pin=$23;
 var $24=$2;
 var $25=(($24+3)|0);
 var $26=HEAP8[(($25)>>0)];
 var $27=(($26<<24)>>24)!=0;
 var $28=($27&1);
 $val=$28;
 var $29=$pin;
 var $30=($29&255);
 var $31=($30|0)<20;
 if($31){label=7;break;}else{label=8;break;}
 case 7: 
 var $33=$val;
 var $34=(($33)&1);
 var $35=$pin;
 var $36=($35&255);
 var $37=(($4+12)|0);
 var $38=(($37+$36)|0);
 var $39=($34&1);
 HEAP8[(($38)>>0)]=$39;
 var $40=(($b)|0);
 HEAP8[(($40)>>0)]=112;
 var $41=(($40+1)|0);
 var $42=$2;
 var $43=(($42+1)|0);
 var $44=HEAP8[(($43)>>0)];
 HEAP8[(($41)>>0)]=$44;
 var $45=(($41+1)|0);
 var $46=$2;
 var $47=(($46+2)|0);
 var $48=HEAP8[(($47)>>0)];
 HEAP8[(($45)>>0)]=$48;
 var $49=(($45+1)|0);
 var $50=$2;
 var $51=(($50+3)|0);
 var $52=HEAP8[(($51)>>0)];
 HEAP8[(($49)>>0)]=$52;
 var $53=(($49+1)|0);
 var $54=$2;
 var $55=(($54+4)|0);
 var $56=HEAP8[(($55)>>0)];
 HEAP8[(($53)>>0)]=$56;
 var $57=(($4+32)|0);
 var $58=HEAP32[(($57)>>2)];
 var $59=$58;
 var $60=HEAP32[(($59)>>2)];
 var $61=(($60+8)|0);
 var $62=HEAP32[(($61)>>2)];
 var $63=(($b)|0);
 FUNCTION_TABLE[$62]($58,$63,5);
 label=11;break;
 case 8: 
 label=9;break;
 case 9: 
 var $66=$4;
 var $67=(($66+4)|0);
 var $68=HEAP32[(($67)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($68,1,33);
 label=10;break;
 case 10: 
 label=11;break;
 case 11: 
 label=18;break;
 case 12: 
 var $72=$type;
 var $73=($72|0)==3;
 if($73){label=13;break;}else{label=14;break;}
 case 13: 
 var $75=$2;
 var $76=(($75+2)|0);
 var $77=__ZL8readLongPKh($76);
 var $78=(($4+8)|0);
 HEAP32[(($78)>>2)]=$77;
 var $79=(($b1)|0);
 HEAP8[(($79)>>0)]=112;
 var $80=(($79+1)|0);
 var $81=$2;
 var $82=(($81+1)|0);
 var $83=HEAP8[(($82)>>0)];
 HEAP8[(($80)>>0)]=$83;
 var $84=(($80+1)|0);
 var $85=$2;
 var $86=(($85+2)|0);
 var $87=HEAP8[(($86)>>0)];
 HEAP8[(($84)>>0)]=$87;
 var $88=(($84+1)|0);
 var $89=$2;
 var $90=(($89+3)|0);
 var $91=HEAP8[(($90)>>0)];
 HEAP8[(($88)>>0)]=$91;
 var $92=(($88+1)|0);
 var $93=$2;
 var $94=(($93+4)|0);
 var $95=HEAP8[(($94)>>0)];
 HEAP8[(($92)>>0)]=$95;
 var $96=(($4+32)|0);
 var $97=HEAP32[(($96)>>2)];
 var $98=$97;
 var $99=HEAP32[(($98)>>2)];
 var $100=(($99+8)|0);
 var $101=HEAP32[(($100)>>2)];
 var $102=(($b1)|0);
 FUNCTION_TABLE[$101]($97,$102,5);
 label=17;break;
 case 14: 
 label=15;break;
 case 15: 
 var $105=$4;
 var $106=(($105+4)|0);
 var $107=HEAP32[(($106)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($107,1,34);
 label=16;break;
 case 16: 
 label=17;break;
 case 17: 
 label=18;break;
 case 18: 
 label=19;break;
 case 19: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12EmscriptenIO11SerialBeginEhi($this,$serialDevice,$baudrate){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$serialDevice;
 $3=$baudrate;
 var $4=$1;
 label=2;break;
 case 2: 
 var $6=$4;
 var $7=(($6+4)|0);
 var $8=HEAP32[(($7)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($8,1,26);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12EmscriptenIO19SerialDataAvailableEh($this,$serialDevice){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$this;
 $2=$serialDevice;
 var $3=$1;
 label=2;break;
 case 2: 
 var $5=$3;
 var $6=(($5+4)|0);
 var $7=HEAP32[(($6)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($7,1,26);
 label=3;break;
 case 3: 
 STACKTOP=sp;return 0;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12EmscriptenIO10SerialReadEh($this,$serialDevice){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$this;
 $2=$serialDevice;
 var $3=$1;
 label=2;break;
 case 2: 
 var $5=$3;
 var $6=(($5+4)|0);
 var $7=HEAP32[(($6)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($7,1,26);
 label=3;break;
 case 3: 
 STACKTOP=sp;return 0;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12EmscriptenIO11SerialWriteEhh($this,$serialDevice,$b){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$serialDevice;
 $3=$b;
 var $4=$1;
 label=2;break;
 case 2: 
 var $6=$4;
 var $7=(($6+4)|0);
 var $8=HEAP32[(($7)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($8,1,26);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12EmscriptenIO10PinSetModeEaN2IO7PinModeE($this,$pin,$mode){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $b=sp;
 $1=$this;
 $2=$pin;
 $3=$mode;
 var $4=$1;
 var $5=(($b)|0);
 HEAP8[(($5)>>0)]=113;
 var $6=(($5+1)|0);
 HEAP8[(($6)>>0)]=4;
 var $7=(($6+1)|0);
 var $8=$2;
 HEAP8[(($7)>>0)]=$8;
 var $9=(($7+1)|0);
 var $10=$3;
 var $11=(($10)&255);
 HEAP8[(($9)>>0)]=$11;
 var $12=(($4+32)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=$13;
 var $15=HEAP32[(($14)>>2)];
 var $16=(($15+8)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=(($b)|0);
 FUNCTION_TABLE[$17]($13,$18,4);
 STACKTOP=sp;return;
}


function __ZN12EmscriptenIO12PinSetPullupEaN2IO10PullupModeE($this,$pin,$mode){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$pin;
 $3=$mode;
 var $4=$1;
 label=2;break;
 case 2: 
 var $6=$4;
 var $7=(($6+4)|0);
 var $8=HEAP32[(($7)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($8,1,26);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12EmscriptenIO12DigitalWriteEab($this,$pin,$val){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $b=sp;
 $1=$this;
 $2=$pin;
 var $4=($val&1);
 $3=$4;
 var $5=$1;
 var $6=(($b)|0);
 HEAP8[(($6)>>0)]=113;
 var $7=(($6+1)|0);
 HEAP8[(($7)>>0)]=2;
 var $8=(($7+1)|0);
 var $9=$2;
 HEAP8[(($8)>>0)]=$9;
 var $10=(($8+1)|0);
 var $11=$3;
 var $12=(($11)&1);
 var $13=($12&1);
 HEAP8[(($10)>>0)]=$13;
 var $14=(($5+32)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=$15;
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17+8)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=(($b)|0);
 FUNCTION_TABLE[$19]($15,$20,4);
 STACKTOP=sp;return;
}


function __ZN12EmscriptenIO11DigitalReadEa($this,$pin){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$this;
 $2=$pin;
 var $3=$1;
 var $4=$2;
 var $5=(($4<<24)>>24);
 var $6=(($3+12)|0);
 var $7=(($6+$5)|0);
 var $8=HEAP8[(($7)>>0)];
 var $9=(($8)&1);
 STACKTOP=sp;return $9;
}


function __ZN12EmscriptenIO10AnalogReadEa($this,$pin){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$this;
 $2=$pin;
 var $3=$1;
 label=2;break;
 case 2: 
 var $5=$3;
 var $6=(($5+4)|0);
 var $7=HEAP32[(($6)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($7,1,26);
 label=3;break;
 case 3: 
 STACKTOP=sp;return 0;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12EmscriptenIO8PwmWriteEal($this,$pin,$dutyPercent){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 $2=$pin;
 $3=$dutyPercent;
 var $4=$1;
 label=2;break;
 case 2: 
 var $6=$4;
 var $7=(($6+4)|0);
 var $8=HEAP32[(($7)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($8,1,26);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12EmscriptenIO14TimerCurrentMsEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+8)|0);
 var $4=HEAP32[(($3)>>2)];
 STACKTOP=sp;return $4;
}


function __ZN2IO18TimerCurrentMicrosEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 var $4=HEAP32[(($3)>>2)];
 var $5=(($4+52)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=FUNCTION_TABLE[$6]($2);
 var $8=((($7)*(1000))&-1);
 STACKTOP=sp;return $8;
}


function __ZN12EmscriptenIO23AttachExternalInterruptEhN2IO9Interrupt4ModeEPFvPvES3_($this,$interrupt,$mode,$func,$user){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 $1=$this;
 $2=$interrupt;
 $3=$mode;
 $4=$func;
 $5=$user;
 var $6=$1;
 label=2;break;
 case 2: 
 var $8=$6;
 var $9=(($8+4)|0);
 var $10=HEAP32[(($9)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($10,1,26);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZL8readLongPKh($buf){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$buf;
 var $2=$1;
 var $3=(($2)|0);
 var $4=HEAP8[(($3)>>0)];
 var $5=($4&255);
 var $6=$1;
 var $7=(($6+1)|0);
 var $8=HEAP8[(($7)>>0)];
 var $9=($8&255);
 var $10=($9<<8);
 var $11=((($5)+($10))|0);
 var $12=$1;
 var $13=(($12+2)|0);
 var $14=HEAP8[(($13)>>0)];
 var $15=($14&255);
 var $16=($15<<16);
 var $17=((($11)+($16))|0);
 var $18=$1;
 var $19=(($18+3)|0);
 var $20=HEAP8[(($19)>>0)];
 var $21=($20&255);
 var $22=($21<<24);
 var $23=((($17)+($22))|0);
 STACKTOP=sp;return $23;
}


function __ZN2IOD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 STACKTOP=sp;return;
}


function __ZN2IOD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN2IOD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZN2IO10setIoValueEPKhh($this,$0,$1){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $3;
 var $4;
 var $5;
 $3=$this;
 $4=$0;
 $5=$1;
 var $6=$3;
 label=2;break;
 case 2: 
 var $8=(($6+4)|0);
 var $9=HEAP32[(($8)>>2)];
 __ZL14microflo_debugP12DebugHandler10DebugLevel7DebugId($9,1,26);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN9ComponentD2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 STACKTOP=sp;return;
}


function __ZN9ComponentD0Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 $1=$this;
 var $4=$1;
 (function() { try { __THREW__ = 0; return __ZN9ComponentD2Ev($4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=3;break; }
 case 2: 
 var $6=$4;
 __ZdlPv($6);
 STACKTOP=sp;return;
 case 3: 
 var $8$0 = ___cxa_find_matching_catch(); var $8$1 = tempRet0;
 var $9=$8$0;
 $2=$9;
 var $10=$8$1;
 $3=$10;
 var $11=$4;
 __ZdlPv($11);
 label=4;break;
 case 4: 
 var $13=$2;
 var $14=$3;
 var $15$0=$13;
 var $15$1=0;
 var $16$0=$15$0;
 var $16$1=$14;
 ___resumeException($16$0)
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK6Packet7isFloatEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=(($2+4)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)==8;
 STACKTOP=sp;return $5;
}


function __ZNK6Packet9isSpecialEv($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 $1=$this;
 var $2=$1;
 var $3=__ZNK6Packet7isSetupEv($2);
 if($3){var $7=1;label=3;break;}else{label=2;break;}
 case 2: 
 var $5=__ZNK6Packet6isTickEv($2);
 var $7=$5;label=3;break;
 case 3: 
 var $7;
 STACKTOP=sp;return $7;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN12DebugHandlerC2Ev($this){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$this;
 var $2=$1;
 var $3=$2;
 HEAP32[(($3)>>2)]=1856;
 STACKTOP=sp;return;
}


function _abort_message($format,varrp){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $list=sp;
 var $1=(($list)|0);
 var $2=$list;
 HEAP32[(($2)>>2)]=varrp;HEAP32[((($2)+(4))>>2)]=0;
 var $3=HEAP32[((_stderr)>>2)];
 var $4=_vfprintf($3,$format,$1);

 var $fputc=_fputc(10,$3);
 _abort();
 throw "Reached an unreachable!";
}


function ___cxa_get_globals_fast(){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=_pthread_once(4656,16);
 var $2=($1|0)==0;
 if($2){label=3;break;}else{label=2;break;}
 case 2: 
 _abort_message(280,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 throw "Reached an unreachable!";
 case 3: 
 var $5=HEAP32[((4664)>>2)];
 var $6=_pthread_getspecific($5);
 var $7=$6;
 STACKTOP=sp;return $7;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNSt9bad_allocC2Ev($this){
 var label=0;


 var $1=(($this)|0);
 HEAP32[(($1)>>2)]=496;
 return;
}


function __ZNSt9bad_allocD0Ev($this){
 var label=0;


 var $1=(($this)|0);
 __ZNSt9exceptionD2Ev($1);
 var $2=$this;
 __ZdlPv($2);
 return;
}


function __ZNSt9bad_allocD2Ev($this){
 var label=0;


 var $1=(($this)|0);
 __ZNSt9exceptionD2Ev($1);
 return;
}


function __ZNKSt9bad_alloc4whatEv($this){
 var label=0;


 return 384;
}


function __ZSt11__terminatePFvvE($func){
 var label=0;
 var tempVarArgs=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$func]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=4;break; }
 case 2: 
 (function() { try { __THREW__ = 0; return _abort_message(400,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })(); STACKTOP=tempVarArgs;if (!__THREW__) { label=3;break; } else { label=4;break; }
 case 3: 
 throw "Reached an unreachable!";
 case 4: 
 var $4$0 = ___cxa_find_matching_catch(0); var $4$1 = tempRet0;
 var $5=$4$0;
 var $6=___cxa_begin_catch($5);
 (function() { try { __THREW__ = 0; return _abort_message(224,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })(); STACKTOP=tempVarArgs;if (!__THREW__) { label=5;break; } else { label=6;break; }
 case 5: 
 throw "Reached an unreachable!";
 case 6: 
 var $9$0 = ___cxa_find_matching_catch(0); var $9$1 = tempRet0;
 (function() { try { __THREW__ = 0; return ___cxa_end_catch() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=8;break; } else { label=7;break; }
 case 7: 
 var $11$0 = ___cxa_find_matching_catch(0); var $11$1 = tempRet0;
 var $12=$11$0;
 ___clang_call_terminate($12);
 throw "Reached an unreachable!";
 case 8: 
 var $14=$9$0;
 ___clang_call_terminate($14);
 throw "Reached an unreachable!";
  default: assert(0, "bad label: " + label);
 }

}


function __ZSt9terminatev(){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(function() { try { __THREW__ = 0; return ___cxa_get_globals_fast() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=7;break; }
 case 2: 
 var $3=($1|0)==0;
 if($3){label=6;break;}else{label=3;break;}
 case 3: 
 var $5=(($1)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=($6|0)==0;
 if($7){label=6;break;}else{label=4;break;}
 case 4: 
 var $9=(($6+48)|0);
 var $ld$0$0=(($9)|0);
 var $10$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($9+4)|0);
 var $10$1=HEAP32[(($ld$1$1)>>2)];
 var $$etemp$2$0=-256;
 var $$etemp$2$1=-1;
 var $11$0=$10$0&$$etemp$2$0;
 var $11$1=$10$1&$$etemp$2$1;
 var $$etemp$3$0=1126902528;
 var $$etemp$3$1=1129074247;
 var $12=(($11$0|0) == ($$etemp$3$0|0)) & (($11$1|0) == ($$etemp$3$1|0));
 if($12){label=5;break;}else{label=6;break;}
 case 5: 
 var $14=(($6+12)|0);
 var $15=HEAP32[(($14)>>2)];
 __ZSt11__terminatePFvvE($15);
 throw "Reached an unreachable!";
 case 6: 
 var $17=(tempValue=HEAP32[((456)>>2)],HEAP32[((456)>>2)]=tempValue+0,tempValue);
 var $18=$17;
 __ZSt11__terminatePFvvE($18);
 throw "Reached an unreachable!";
 case 7: 
 var $20$0 = ___cxa_find_matching_catch(0); var $20$1 = tempRet0;
 var $21=$20$0;
 ___clang_call_terminate($21);
 throw "Reached an unreachable!";
  default: assert(0, "bad label: " + label);
 }

}


function __ZNSt9exceptionD2Ev($this){
 var label=0;


 return;
}


function __ZNSt9type_infoD2Ev($this){
 var label=0;


 return;
}


function __ZN10__cxxabiv116__shim_type_infoD2Ev($this){
 var label=0;


 var $1=(($this)|0);
 __ZNSt9type_infoD2Ev($1);
 return;
}


function __ZNK10__cxxabiv116__shim_type_info5noop1Ev($this){
 var label=0;


 return;
}


function __ZNK10__cxxabiv116__shim_type_info5noop2Ev($this){
 var label=0;


 return;
}


function __ZN10__cxxabiv117__class_type_infoD0Ev($this){
 var label=0;


 var $1=(($this)|0);
 __ZNSt9type_infoD2Ev($1);
 var $2=$this;
 __ZdlPv($2);
 return;
}


function __ZN10__cxxabiv120__si_class_type_infoD0Ev($this){
 var label=0;


 var $1=(($this)|0);
 __ZNSt9type_infoD2Ev($1);
 var $2=$this;
 __ZdlPv($2);
 return;
}


function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$adjustedPtr){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+56)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $info=sp;
 var $1=(($this)|0);
 var $2=(($thrown_type)|0);
 var $3=($1|0)==($2|0);
 if($3){var $_1=1;label=6;break;}else{label=2;break;}
 case 2: 
 var $5=($thrown_type|0)==0;
 if($5){var $_1=0;label=6;break;}else{label=3;break;}
 case 3: 
 var $7=$thrown_type;
 var $8=___dynamic_cast($7,3136,3120,0);
 var $9=$8;
 var $10=($8|0)==0;
 if($10){var $_1=0;label=6;break;}else{label=4;break;}
 case 4: 
 var $12=$info;
 var $$etemp$0$0=56;
 var $$etemp$0$1=0;

 _memset($12, 0, 56)|0;
 var $13=(($info)|0);
 HEAP32[(($13)>>2)]=$9;
 var $14=(($info+8)|0);
 HEAP32[(($14)>>2)]=$this;
 var $15=(($info+12)|0);
 HEAP32[(($15)>>2)]=-1;
 var $16=(($info+48)|0);
 HEAP32[(($16)>>2)]=1;
 var $17=$8;
 var $18=HEAP32[(($17)>>2)];
 var $19=(($18+28)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=HEAP32[(($adjustedPtr)>>2)];
 FUNCTION_TABLE[$20]($9,$info,$21,1);
 var $22=(($info+24)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=($23|0)==1;
 if($24){label=5;break;}else{var $_1=0;label=6;break;}
 case 5: 
 var $26=(($info+16)|0);
 var $27=HEAP32[(($26)>>2)];
 HEAP32[(($adjustedPtr)>>2)]=$27;
 var $_1=1;label=6;break;
 case 6: 
 var $_1;
 STACKTOP=sp;return $_1;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+16)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==0;
 if($3){label=2;break;}else{label=3;break;}
 case 2: 
 HEAP32[(($1)>>2)]=$adjustedPtr;
 var $5=(($info+24)|0);
 HEAP32[(($5)>>2)]=$path_below;
 var $6=(($info+36)|0);
 HEAP32[(($6)>>2)]=1;
 label=7;break;
 case 3: 
 var $8=($2|0)==($adjustedPtr|0);
 if($8){label=4;break;}else{label=6;break;}
 case 4: 
 var $10=(($info+24)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=($11|0)==2;
 if($12){label=5;break;}else{label=7;break;}
 case 5: 
 HEAP32[(($10)>>2)]=$path_below;
 label=7;break;
 case 6: 
 var $15=(($info+36)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=((($16)+(1))|0);
 HEAP32[(($15)>>2)]=$17;
 var $18=(($info+24)|0);
 HEAP32[(($18)>>2)]=2;
 var $19=(($info+54)|0);
 HEAP8[(($19)>>0)]=1;
 label=7;break;
 case 7: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+8)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==($this|0);
 if($3){label=2;break;}else{label=3;break;}
 case 2: 
 __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi(0,$info,$adjustedPtr,$path_below);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi(0,$info,$adjustedPtr,$path_below);
 label=4;break;
 case 3: 
 var $8=(($this+8)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=$9;
 var $11=HEAP32[(($10)>>2)];
 var $12=(($11+28)|0);
 var $13=HEAP32[(($12)>>2)];
 FUNCTION_TABLE[$13]($9,$info,$adjustedPtr,$path_below);
 label=4;break;
 case 4: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function ___dynamic_cast($static_ptr,$static_type,$dst_type,$src2dst_offset){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+56)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $info=sp;
 var $1=$static_ptr;
 var $2=HEAP32[(($1)>>2)];
 var $3=((($2)-(8))|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=$4;
 var $6=(($static_ptr+$5)|0);
 var $7=((($2)-(4))|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=$8;
 var $10=$info;
 var $$etemp$0$0=56;
 var $$etemp$0$1=0;

 var $11=(($info)|0);
 HEAP32[(($11)>>2)]=$dst_type;
 var $12=(($info+4)|0);
 HEAP32[(($12)>>2)]=$static_ptr;
 var $13=(($info+8)|0);
 HEAP32[(($13)>>2)]=$static_type;
 var $14=(($info+12)|0);
 HEAP32[(($14)>>2)]=$src2dst_offset;
 var $15=(($info+16)|0);
 var $16=(($info+20)|0);
 var $17=(($info+24)|0);
 var $18=(($info+28)|0);
 var $19=(($info+32)|0);
 var $20=(($info+40)|0);
 var $21=$8;
 var $22=(($dst_type)|0);
 var $23=($21|0)==($22|0);
 var $24=$15;
 _memset($24, 0, 39)|0;
 if($23){label=2;break;}else{label=3;break;}
 case 2: 
 var $26=(($info+48)|0);
 HEAP32[(($26)>>2)]=1;
 var $27=$8;
 var $28=HEAP32[(($27)>>2)];
 var $29=(($28+20)|0);
 var $30=HEAP32[(($29)>>2)];
 FUNCTION_TABLE[$30]($9,$info,$6,$6,1,0);
 var $31=HEAP32[(($17)>>2)];
 var $32=($31|0)==1;
 var $_=($32?$6:0);
 var $dst_ptr_0=$_;label=8;break;
 case 3: 
 var $34=(($info+36)|0);
 var $35=$8;
 var $36=HEAP32[(($35)>>2)];
 var $37=(($36+24)|0);
 var $38=HEAP32[(($37)>>2)];
 FUNCTION_TABLE[$38]($9,$info,$6,1,0);
 var $39=HEAP32[(($34)>>2)];
 if(($39|0)==0){ label=4;break;}else if(($39|0)==1){ label=5;break;}else{var $dst_ptr_0=0;label=8;break;}
 case 4: 
 var $41=HEAP32[(($20)>>2)];
 var $42=($41|0)==1;
 var $43=HEAP32[(($18)>>2)];
 var $44=($43|0)==1;
 var $or_cond=$42&$44;
 var $45=HEAP32[(($19)>>2)];
 var $46=($45|0)==1;
 var $or_cond3=$or_cond&$46;
 var $47=HEAP32[(($16)>>2)];
 var $_8=($or_cond3?$47:0);
 var $dst_ptr_0=$_8;label=8;break;
 case 5: 
 var $49=HEAP32[(($17)>>2)];
 var $50=($49|0)==1;
 if($50){label=7;break;}else{label=6;break;}
 case 6: 
 var $52=HEAP32[(($20)>>2)];
 var $53=($52|0)==0;
 var $54=HEAP32[(($18)>>2)];
 var $55=($54|0)==1;
 var $or_cond5=$53&$55;
 var $56=HEAP32[(($19)>>2)];
 var $57=($56|0)==1;
 var $or_cond7=$or_cond5&$57;
 if($or_cond7){label=7;break;}else{var $dst_ptr_0=0;label=8;break;}
 case 7: 
 var $59=HEAP32[(($15)>>2)];
 var $dst_ptr_0=$59;label=8;break;
 case 8: 
 var $dst_ptr_0;
 var $$etemp$1$0=56;
 var $$etemp$1$1=0;

 STACKTOP=sp;return $dst_ptr_0;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i($this,$info,$dst_ptr,$current_ptr,$path_below){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+53)|0);
 HEAP8[(($1)>>0)]=1;
 var $2=(($info+4)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=($3|0)==($current_ptr|0);
 if($4){label=2;break;}else{label=11;break;}
 case 2: 
 var $6=(($info+52)|0);
 HEAP8[(($6)>>0)]=1;
 var $7=(($info+16)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=5;break;}
 case 3: 
 HEAP32[(($7)>>2)]=$dst_ptr;
 var $11=(($info+24)|0);
 HEAP32[(($11)>>2)]=$path_below;
 var $12=(($info+36)|0);
 HEAP32[(($12)>>2)]=1;
 var $13=(($info+48)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=($14|0)==1;
 var $16=($path_below|0)==1;
 var $or_cond=$15&$16;
 if($or_cond){label=4;break;}else{label=11;break;}
 case 4: 
 var $18=(($info+54)|0);
 HEAP8[(($18)>>0)]=1;
 label=11;break;
 case 5: 
 var $20=($8|0)==($dst_ptr|0);
 if($20){label=6;break;}else{label=10;break;}
 case 6: 
 var $22=(($info+24)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=($23|0)==2;
 if($24){label=7;break;}else{var $27=$23;label=8;break;}
 case 7: 
 HEAP32[(($22)>>2)]=$path_below;
 var $27=$path_below;label=8;break;
 case 8: 
 var $27;
 var $28=(($info+48)|0);
 var $29=HEAP32[(($28)>>2)];
 var $30=($29|0)==1;
 var $31=($27|0)==1;
 var $or_cond1=$30&$31;
 if($or_cond1){label=9;break;}else{label=11;break;}
 case 9: 
 var $33=(($info+54)|0);
 HEAP8[(($33)>>0)]=1;
 label=11;break;
 case 10: 
 var $35=(($info+36)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=((($36)+(1))|0);
 HEAP32[(($35)>>2)]=$37;
 var $38=(($info+54)|0);
 HEAP8[(($38)>>0)]=1;
 label=11;break;
 case 11: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=5;break;}
 case 2: 
 var $7=(($info+4)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==($current_ptr|0);
 if($9){label=3;break;}else{label=20;break;}
 case 3: 
 var $11=(($info+28)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=($12|0)==1;
 if($13){label=20;break;}else{label=4;break;}
 case 4: 
 HEAP32[(($11)>>2)]=$path_below;
 label=20;break;
 case 5: 
 var $16=(($info)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17)|0);
 var $19=($1|0)==($18|0);
 if($19){label=6;break;}else{label=19;break;}
 case 6: 
 var $21=(($info+16)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=($22|0)==($current_ptr|0);
 if($23){label=8;break;}else{label=7;break;}
 case 7: 
 var $25=(($info+20)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=($26|0)==($current_ptr|0);
 if($27){label=8;break;}else{label=10;break;}
 case 8: 
 var $29=($path_below|0)==1;
 if($29){label=9;break;}else{label=20;break;}
 case 9: 
 var $31=(($info+32)|0);
 HEAP32[(($31)>>2)]=1;
 label=20;break;
 case 10: 
 var $33=(($info+32)|0);
 HEAP32[(($33)>>2)]=$path_below;
 var $34=(($info+44)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==4;
 if($36){label=20;break;}else{label=11;break;}
 case 11: 
 var $38=(($info+52)|0);
 HEAP8[(($38)>>0)]=0;
 var $39=(($info+53)|0);
 HEAP8[(($39)>>0)]=0;
 var $40=(($this+8)|0);
 var $41=HEAP32[(($40)>>2)];
 var $42=$41;
 var $43=HEAP32[(($42)>>2)];
 var $44=(($43+20)|0);
 var $45=HEAP32[(($44)>>2)];
 FUNCTION_TABLE[$45]($41,$info,$current_ptr,$current_ptr,1,$use_strcmp);
 var $46=HEAP8[(($39)>>0)];
 var $47=(($46<<24)>>24)==0;
 if($47){var $is_dst_type_derived_from_static_type_0_off01=0;label=13;break;}else{label=12;break;}
 case 12: 
 var $49=HEAP8[(($38)>>0)];
 var $not_=(($49<<24)>>24)==0;
 if($not_){var $is_dst_type_derived_from_static_type_0_off01=1;label=13;break;}else{label=17;break;}
 case 13: 
 var $is_dst_type_derived_from_static_type_0_off01;
 HEAP32[(($25)>>2)]=$current_ptr;
 var $50=(($info+40)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=((($51)+(1))|0);
 HEAP32[(($50)>>2)]=$52;
 var $53=(($info+36)|0);
 var $54=HEAP32[(($53)>>2)];
 var $55=($54|0)==1;
 if($55){label=14;break;}else{label=16;break;}
 case 14: 
 var $57=(($info+24)|0);
 var $58=HEAP32[(($57)>>2)];
 var $59=($58|0)==2;
 if($59){label=15;break;}else{label=16;break;}
 case 15: 
 var $61=(($info+54)|0);
 HEAP8[(($61)>>0)]=1;
 if($is_dst_type_derived_from_static_type_0_off01){label=17;break;}else{label=18;break;}
 case 16: 
 if($is_dst_type_derived_from_static_type_0_off01){label=17;break;}else{label=18;break;}
 case 17: 
 HEAP32[(($34)>>2)]=3;
 label=20;break;
 case 18: 
 HEAP32[(($34)>>2)]=4;
 label=20;break;
 case 19: 
 var $65=(($this+8)|0);
 var $66=HEAP32[(($65)>>2)];
 var $67=$66;
 var $68=HEAP32[(($67)>>2)];
 var $69=(($68+24)|0);
 var $70=HEAP32[(($69)>>2)];
 FUNCTION_TABLE[$70]($66,$info,$current_ptr,$path_below,$use_strcmp);
 label=20;break;
 case 20: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+8)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==($this|0);
 if($3){label=2;break;}else{label=5;break;}
 case 2: 
 var $5=(($info+4)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=($6|0)==($current_ptr|0);
 if($7){label=3;break;}else{label=14;break;}
 case 3: 
 var $9=(($info+28)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=($10|0)==1;
 if($11){label=14;break;}else{label=4;break;}
 case 4: 
 HEAP32[(($9)>>2)]=$path_below;
 label=14;break;
 case 5: 
 var $14=(($info)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=($15|0)==($this|0);
 if($16){label=6;break;}else{label=14;break;}
 case 6: 
 var $18=(($info+16)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=($19|0)==($current_ptr|0);
 if($20){label=8;break;}else{label=7;break;}
 case 7: 
 var $22=(($info+20)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=($23|0)==($current_ptr|0);
 if($24){label=8;break;}else{label=10;break;}
 case 8: 
 var $26=($path_below|0)==1;
 if($26){label=9;break;}else{label=14;break;}
 case 9: 
 var $28=(($info+32)|0);
 HEAP32[(($28)>>2)]=1;
 label=14;break;
 case 10: 
 var $30=(($info+32)|0);
 HEAP32[(($30)>>2)]=$path_below;
 HEAP32[(($22)>>2)]=$current_ptr;
 var $31=(($info+40)|0);
 var $32=HEAP32[(($31)>>2)];
 var $33=((($32)+(1))|0);
 HEAP32[(($31)>>2)]=$33;
 var $34=(($info+36)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==1;
 if($36){label=11;break;}else{label=13;break;}
 case 11: 
 var $38=(($info+24)|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=($39|0)==2;
 if($40){label=12;break;}else{label=13;break;}
 case 12: 
 var $42=(($info+54)|0);
 HEAP8[(($42)>>0)]=1;
 label=13;break;
 case 13: 
 var $44=(($info+44)|0);
 HEAP32[(($44)>>2)]=4;
 label=14;break;
 case 14: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i(0,$info,$dst_ptr,$current_ptr,$path_below);
 label=4;break;
 case 3: 
 var $8=(($this+8)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=$9;
 var $11=HEAP32[(($10)>>2)];
 var $12=(($11+20)|0);
 var $13=HEAP32[(($12)>>2)];
 FUNCTION_TABLE[$13]($9,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp);
 label=4;break;
 case 4: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+8)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==($this|0);
 if($3){label=2;break;}else{label=3;break;}
 case 2: 
 __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i(0,$info,$dst_ptr,$current_ptr,$path_below);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function ___cxa_can_catch($catchType,$excpType,$thrown){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $temp=sp;
 var $1=HEAP32[(($thrown)>>2)];
 HEAP32[(($temp)>>2)]=$1;
 var $2=$catchType;
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3+16)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=FUNCTION_TABLE[$5]($catchType,$excpType,$temp);
 var $7=($6&1);
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 var $9=HEAP32[(($temp)>>2)];
 HEAP32[(($thrown)>>2)]=$9;
 label=3;break;
 case 3: 
 STACKTOP=sp;return $7;
  default: assert(0, "bad label: " + label);
 }

}
Module["___cxa_can_catch"] = ___cxa_can_catch;

function ___cxa_is_pointer_type($type){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($type|0)==0;
 if($1){var $6=0;label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$type;
 var $4=___dynamic_cast($3,3136,3088,0);
 var $phitmp=($4|0)!=0;
 var $phitmp1=($phitmp&1);
 var $6=$phitmp1;label=3;break;
 case 3: 
 var $6;
 return $6;
  default: assert(0, "bad label: " + label);
 }

}
Module["___cxa_is_pointer_type"] = ___cxa_is_pointer_type;

function __ZL25default_terminate_handlerv(){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $thrown_object=sp;
 var $1=___cxa_get_globals_fast();
 var $2=($1|0)==0;
 if($2){label=11;break;}else{label=2;break;}
 case 2: 
 var $4=(($1)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)==0;
 if($6){label=11;break;}else{label=3;break;}
 case 3: 
 var $8=(($5+80)|0);
 var $9=(($5+48)|0);
 var $ld$0$0=(($9)|0);
 var $10$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($9+4)|0);
 var $10$1=HEAP32[(($ld$1$1)>>2)];
 var $$etemp$2$0=-256;
 var $$etemp$2$1=-1;
 var $11$0=$10$0&$$etemp$2$0;
 var $11$1=$10$1&$$etemp$2$1;
 var $$etemp$3$0=1126902528;
 var $$etemp$3$1=1129074247;
 var $12=(($11$0|0) == ($$etemp$3$0|0)) & (($11$1|0) == ($$etemp$3$1|0));
 if($12){label=4;break;}else{label=10;break;}
 case 4: 
 var $$etemp$4$0=1126902529;
 var $$etemp$4$1=1129074247;
 var $14=(($10$0|0) == ($$etemp$4$0|0)) & (($10$1|0) == ($$etemp$4$1|0));
 if($14){label=5;break;}else{label=6;break;}
 case 5: 
 var $16=(($5+44)|0);
 var $17=$16;
 var $18=HEAP32[(($17)>>2)];
 var $22=$18;label=7;break;
 case 6: 
 var $20=$8;
 var $22=$20;label=7;break;
 case 7: 
 var $22;
 HEAP32[(($thrown_object)>>2)]=$22;
 var $23=(($5)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=$24;
 var $26=(($24+4)|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=HEAP32[((3048)>>2)];
 var $29=(($28+16)|0);
 var $30=$29;
 var $31=HEAP32[(($30)>>2)];
 var $32=FUNCTION_TABLE[$31](3048,$25,$thrown_object);
 if($32){label=8;break;}else{label=9;break;}
 case 8: 
 var $34=HEAP32[(($thrown_object)>>2)];
 var $35=$34;
 var $36=HEAP32[((3840)>>2)];
 var $37=$34;
 var $38=HEAP32[(($37)>>2)];
 var $39=(($38+8)|0);
 var $40=HEAP32[(($39)>>2)];
 var $41=FUNCTION_TABLE[$40]($35);
 _abort_message(336,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$36,HEAP32[(((tempVarArgs)+(8))>>2)]=$27,HEAP32[(((tempVarArgs)+(16))>>2)]=$41,tempVarArgs)); STACKTOP=tempVarArgs;
 throw "Reached an unreachable!";
 case 9: 
 var $43=HEAP32[((3840)>>2)];
 _abort_message(176,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$43,HEAP32[(((tempVarArgs)+(8))>>2)]=$27,tempVarArgs)); STACKTOP=tempVarArgs;
 throw "Reached an unreachable!";
 case 10: 
 var $45=HEAP32[((3840)>>2)];
 _abort_message(80,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$45,tempVarArgs)); STACKTOP=tempVarArgs;
 throw "Reached an unreachable!";
 case 11: 
 _abort_message(8,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 throw "Reached an unreachable!";
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10__cxxabiv112_GLOBAL__N_110construct_Ev(){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=_pthread_key_create(4664,264);
 var $2=($1|0)==0;
 if($2){label=3;break;}else{label=2;break;}
 case 2: 
 _abort_message(120,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 throw "Reached an unreachable!";
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10__cxxabiv112_GLOBAL__N_19destruct_EPv($p){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 _free($p);
 var $1=HEAP32[((4664)>>2)];
 var $2=_pthread_setspecific($1,0);
 var $3=($2|0)==0;
 if($3){label=3;break;}else{label=2;break;}
 case 2: 
 _abort_message(24,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 throw "Reached an unreachable!";
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _malloc($bytes){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($bytes>>>0)<245;
 if($1){label=2;break;}else{label=78;break;}
 case 2: 
 var $3=($bytes>>>0)<11;
 if($3){var $8=16;label=4;break;}else{label=3;break;}
 case 3: 
 var $5=((($bytes)+(11))|0);
 var $6=$5&-8;
 var $8=$6;label=4;break;
 case 4: 
 var $8;
 var $9=$8>>>3;
 var $10=HEAP32[((4184)>>2)];
 var $11=$10>>>($9>>>0);
 var $12=$11&3;
 var $13=($12|0)==0;
 if($13){label=12;break;}else{label=5;break;}
 case 5: 
 var $15=$11&1;
 var $16=$15^1;
 var $17=((($16)+($9))|0);
 var $18=$17<<1;
 var $19=((4224+($18<<2))|0);
 var $20=$19;
 var $_sum11=((($18)+(2))|0);
 var $21=((4224+($_sum11<<2))|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=(($22+8)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=($20|0)==($24|0);
 if($25){label=6;break;}else{label=7;break;}
 case 6: 
 var $27=1<<$17;
 var $28=$27^-1;
 var $29=$10&$28;
 HEAP32[((4184)>>2)]=$29;
 label=11;break;
 case 7: 
 var $31=$24;
 var $32=HEAP32[((4200)>>2)];
 var $33=($31>>>0)<($32>>>0);
 if($33){label=10;break;}else{label=8;break;}
 case 8: 
 var $35=(($24+12)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=($36|0)==($22|0);
 if($37){label=9;break;}else{label=10;break;}
 case 9: 
 HEAP32[(($35)>>2)]=$20;
 HEAP32[(($21)>>2)]=$24;
 label=11;break;
 case 10: 
 _abort();
 throw "Reached an unreachable!";
 case 11: 
 var $40=$17<<3;
 var $41=$40|3;
 var $42=(($22+4)|0);
 HEAP32[(($42)>>2)]=$41;
 var $43=$22;
 var $_sum1314=$40|4;
 var $44=(($43+$_sum1314)|0);
 var $45=$44;
 var $46=HEAP32[(($45)>>2)];
 var $47=$46|1;
 HEAP32[(($45)>>2)]=$47;
 var $48=$23;
 var $mem_0=$48;label=341;break;
 case 12: 
 var $50=HEAP32[((4192)>>2)];
 var $51=($8>>>0)>($50>>>0);
 if($51){label=13;break;}else{var $nb_0=$8;label=160;break;}
 case 13: 
 var $53=($11|0)==0;
 if($53){label=27;break;}else{label=14;break;}
 case 14: 
 var $55=$11<<$9;
 var $56=2<<$9;
 var $57=(((-$56))|0);
 var $58=$56|$57;
 var $59=$55&$58;
 var $60=(((-$59))|0);
 var $61=$59&$60;
 var $62=((($61)-(1))|0);
 var $63=$62>>>12;
 var $64=$63&16;
 var $65=$62>>>($64>>>0);
 var $66=$65>>>5;
 var $67=$66&8;
 var $68=$67|$64;
 var $69=$65>>>($67>>>0);
 var $70=$69>>>2;
 var $71=$70&4;
 var $72=$68|$71;
 var $73=$69>>>($71>>>0);
 var $74=$73>>>1;
 var $75=$74&2;
 var $76=$72|$75;
 var $77=$73>>>($75>>>0);
 var $78=$77>>>1;
 var $79=$78&1;
 var $80=$76|$79;
 var $81=$77>>>($79>>>0);
 var $82=((($80)+($81))|0);
 var $83=$82<<1;
 var $84=((4224+($83<<2))|0);
 var $85=$84;
 var $_sum4=((($83)+(2))|0);
 var $86=((4224+($_sum4<<2))|0);
 var $87=HEAP32[(($86)>>2)];
 var $88=(($87+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($85|0)==($89|0);
 if($90){label=15;break;}else{label=16;break;}
 case 15: 
 var $92=1<<$82;
 var $93=$92^-1;
 var $94=$10&$93;
 HEAP32[((4184)>>2)]=$94;
 var $105=$50;label=20;break;
 case 16: 
 var $96=$89;
 var $97=HEAP32[((4200)>>2)];
 var $98=($96>>>0)<($97>>>0);
 if($98){label=19;break;}else{label=17;break;}
 case 17: 
 var $100=(($89+12)|0);
 var $101=HEAP32[(($100)>>2)];
 var $102=($101|0)==($87|0);
 if($102){label=18;break;}else{label=19;break;}
 case 18: 
 HEAP32[(($100)>>2)]=$85;
 HEAP32[(($86)>>2)]=$89;
 var $_pre=HEAP32[((4192)>>2)];
 var $105=$_pre;label=20;break;
 case 19: 
 _abort();
 throw "Reached an unreachable!";
 case 20: 
 var $105;
 var $106=$82<<3;
 var $107=((($106)-($8))|0);
 var $108=$8|3;
 var $109=(($87+4)|0);
 HEAP32[(($109)>>2)]=$108;
 var $110=$87;
 var $111=(($110+$8)|0);
 var $112=$111;
 var $113=$107|1;
 var $_sum67=$8|4;
 var $114=(($110+$_sum67)|0);
 var $115=$114;
 HEAP32[(($115)>>2)]=$113;
 var $116=(($110+$106)|0);
 var $117=$116;
 HEAP32[(($117)>>2)]=$107;
 var $118=($105|0)==0;
 if($118){label=26;break;}else{label=21;break;}
 case 21: 
 var $120=HEAP32[((4204)>>2)];
 var $121=$105>>>3;
 var $122=$121<<1;
 var $123=((4224+($122<<2))|0);
 var $124=$123;
 var $125=HEAP32[((4184)>>2)];
 var $126=1<<$121;
 var $127=$125&$126;
 var $128=($127|0)==0;
 if($128){label=22;break;}else{label=23;break;}
 case 22: 
 var $130=$125|$126;
 HEAP32[((4184)>>2)]=$130;
 var $_sum9_pre=((($122)+(2))|0);
 var $_pre107=((4224+($_sum9_pre<<2))|0);
 var $F4_0=$124;var $_pre_phi=$_pre107;label=25;break;
 case 23: 
 var $_sum10=((($122)+(2))|0);
 var $132=((4224+($_sum10<<2))|0);
 var $133=HEAP32[(($132)>>2)];
 var $134=$133;
 var $135=HEAP32[((4200)>>2)];
 var $136=($134>>>0)<($135>>>0);
 if($136){label=24;break;}else{var $F4_0=$133;var $_pre_phi=$132;label=25;break;}
 case 24: 
 _abort();
 throw "Reached an unreachable!";
 case 25: 
 var $_pre_phi;
 var $F4_0;
 HEAP32[(($_pre_phi)>>2)]=$120;
 var $139=(($F4_0+12)|0);
 HEAP32[(($139)>>2)]=$120;
 var $140=(($120+8)|0);
 HEAP32[(($140)>>2)]=$F4_0;
 var $141=(($120+12)|0);
 HEAP32[(($141)>>2)]=$124;
 label=26;break;
 case 26: 
 HEAP32[((4192)>>2)]=$107;
 HEAP32[((4204)>>2)]=$112;
 var $143=$88;
 var $mem_0=$143;label=341;break;
 case 27: 
 var $145=HEAP32[((4188)>>2)];
 var $146=($145|0)==0;
 if($146){var $nb_0=$8;label=160;break;}else{label=28;break;}
 case 28: 
 var $148=(((-$145))|0);
 var $149=$145&$148;
 var $150=((($149)-(1))|0);
 var $151=$150>>>12;
 var $152=$151&16;
 var $153=$150>>>($152>>>0);
 var $154=$153>>>5;
 var $155=$154&8;
 var $156=$155|$152;
 var $157=$153>>>($155>>>0);
 var $158=$157>>>2;
 var $159=$158&4;
 var $160=$156|$159;
 var $161=$157>>>($159>>>0);
 var $162=$161>>>1;
 var $163=$162&2;
 var $164=$160|$163;
 var $165=$161>>>($163>>>0);
 var $166=$165>>>1;
 var $167=$166&1;
 var $168=$164|$167;
 var $169=$165>>>($167>>>0);
 var $170=((($168)+($169))|0);
 var $171=((4488+($170<<2))|0);
 var $172=HEAP32[(($171)>>2)];
 var $173=(($172+4)|0);
 var $174=HEAP32[(($173)>>2)];
 var $175=$174&-8;
 var $176=((($175)-($8))|0);
 var $t_0_i=$172;var $v_0_i=$172;var $rsize_0_i=$176;label=29;break;
 case 29: 
 var $rsize_0_i;
 var $v_0_i;
 var $t_0_i;
 var $178=(($t_0_i+16)|0);
 var $179=HEAP32[(($178)>>2)];
 var $180=($179|0)==0;
 if($180){label=30;break;}else{var $185=$179;label=31;break;}
 case 30: 
 var $182=(($t_0_i+20)|0);
 var $183=HEAP32[(($182)>>2)];
 var $184=($183|0)==0;
 if($184){label=32;break;}else{var $185=$183;label=31;break;}
 case 31: 
 var $185;
 var $186=(($185+4)|0);
 var $187=HEAP32[(($186)>>2)];
 var $188=$187&-8;
 var $189=((($188)-($8))|0);
 var $190=($189>>>0)<($rsize_0_i>>>0);
 var $_rsize_0_i=($190?$189:$rsize_0_i);
 var $_v_0_i=($190?$185:$v_0_i);
 var $t_0_i=$185;var $v_0_i=$_v_0_i;var $rsize_0_i=$_rsize_0_i;label=29;break;
 case 32: 
 var $192=$v_0_i;
 var $193=HEAP32[((4200)>>2)];
 var $194=($192>>>0)<($193>>>0);
 if($194){label=76;break;}else{label=33;break;}
 case 33: 
 var $196=(($192+$8)|0);
 var $197=$196;
 var $198=($192>>>0)<($196>>>0);
 if($198){label=34;break;}else{label=76;break;}
 case 34: 
 var $200=(($v_0_i+24)|0);
 var $201=HEAP32[(($200)>>2)];
 var $202=(($v_0_i+12)|0);
 var $203=HEAP32[(($202)>>2)];
 var $204=($203|0)==($v_0_i|0);
 if($204){label=40;break;}else{label=35;break;}
 case 35: 
 var $206=(($v_0_i+8)|0);
 var $207=HEAP32[(($206)>>2)];
 var $208=$207;
 var $209=($208>>>0)<($193>>>0);
 if($209){label=39;break;}else{label=36;break;}
 case 36: 
 var $211=(($207+12)|0);
 var $212=HEAP32[(($211)>>2)];
 var $213=($212|0)==($v_0_i|0);
 if($213){label=37;break;}else{label=39;break;}
 case 37: 
 var $215=(($203+8)|0);
 var $216=HEAP32[(($215)>>2)];
 var $217=($216|0)==($v_0_i|0);
 if($217){label=38;break;}else{label=39;break;}
 case 38: 
 HEAP32[(($211)>>2)]=$203;
 HEAP32[(($215)>>2)]=$207;
 var $R_1_i=$203;label=47;break;
 case 39: 
 _abort();
 throw "Reached an unreachable!";
 case 40: 
 var $220=(($v_0_i+20)|0);
 var $221=HEAP32[(($220)>>2)];
 var $222=($221|0)==0;
 if($222){label=41;break;}else{var $R_0_i=$221;var $RP_0_i=$220;label=42;break;}
 case 41: 
 var $224=(($v_0_i+16)|0);
 var $225=HEAP32[(($224)>>2)];
 var $226=($225|0)==0;
 if($226){var $R_1_i=0;label=47;break;}else{var $R_0_i=$225;var $RP_0_i=$224;label=42;break;}
 case 42: 
 var $RP_0_i;
 var $R_0_i;
 var $227=(($R_0_i+20)|0);
 var $228=HEAP32[(($227)>>2)];
 var $229=($228|0)==0;
 if($229){label=43;break;}else{var $R_0_i=$228;var $RP_0_i=$227;label=42;break;}
 case 43: 
 var $231=(($R_0_i+16)|0);
 var $232=HEAP32[(($231)>>2)];
 var $233=($232|0)==0;
 if($233){label=44;break;}else{var $R_0_i=$232;var $RP_0_i=$231;label=42;break;}
 case 44: 
 var $235=$RP_0_i;
 var $236=($235>>>0)<($193>>>0);
 if($236){label=46;break;}else{label=45;break;}
 case 45: 
 HEAP32[(($RP_0_i)>>2)]=0;
 var $R_1_i=$R_0_i;label=47;break;
 case 46: 
 _abort();
 throw "Reached an unreachable!";
 case 47: 
 var $R_1_i;
 var $240=($201|0)==0;
 if($240){label=67;break;}else{label=48;break;}
 case 48: 
 var $242=(($v_0_i+28)|0);
 var $243=HEAP32[(($242)>>2)];
 var $244=((4488+($243<<2))|0);
 var $245=HEAP32[(($244)>>2)];
 var $246=($v_0_i|0)==($245|0);
 if($246){label=49;break;}else{label=51;break;}
 case 49: 
 HEAP32[(($244)>>2)]=$R_1_i;
 var $cond_i=($R_1_i|0)==0;
 if($cond_i){label=50;break;}else{label=57;break;}
 case 50: 
 var $248=1<<$243;
 var $249=$248^-1;
 var $250=HEAP32[((4188)>>2)];
 var $251=$250&$249;
 HEAP32[((4188)>>2)]=$251;
 label=67;break;
 case 51: 
 var $253=$201;
 var $254=HEAP32[((4200)>>2)];
 var $255=($253>>>0)<($254>>>0);
 if($255){label=55;break;}else{label=52;break;}
 case 52: 
 var $257=(($201+16)|0);
 var $258=HEAP32[(($257)>>2)];
 var $259=($258|0)==($v_0_i|0);
 if($259){label=53;break;}else{label=54;break;}
 case 53: 
 HEAP32[(($257)>>2)]=$R_1_i;
 label=56;break;
 case 54: 
 var $262=(($201+20)|0);
 HEAP32[(($262)>>2)]=$R_1_i;
 label=56;break;
 case 55: 
 _abort();
 throw "Reached an unreachable!";
 case 56: 
 var $265=($R_1_i|0)==0;
 if($265){label=67;break;}else{label=57;break;}
 case 57: 
 var $267=$R_1_i;
 var $268=HEAP32[((4200)>>2)];
 var $269=($267>>>0)<($268>>>0);
 if($269){label=66;break;}else{label=58;break;}
 case 58: 
 var $271=(($R_1_i+24)|0);
 HEAP32[(($271)>>2)]=$201;
 var $272=(($v_0_i+16)|0);
 var $273=HEAP32[(($272)>>2)];
 var $274=($273|0)==0;
 if($274){label=62;break;}else{label=59;break;}
 case 59: 
 var $276=$273;
 var $277=($276>>>0)<($268>>>0);
 if($277){label=61;break;}else{label=60;break;}
 case 60: 
 var $279=(($R_1_i+16)|0);
 HEAP32[(($279)>>2)]=$273;
 var $280=(($273+24)|0);
 HEAP32[(($280)>>2)]=$R_1_i;
 label=62;break;
 case 61: 
 _abort();
 throw "Reached an unreachable!";
 case 62: 
 var $283=(($v_0_i+20)|0);
 var $284=HEAP32[(($283)>>2)];
 var $285=($284|0)==0;
 if($285){label=67;break;}else{label=63;break;}
 case 63: 
 var $287=$284;
 var $288=HEAP32[((4200)>>2)];
 var $289=($287>>>0)<($288>>>0);
 if($289){label=65;break;}else{label=64;break;}
 case 64: 
 var $291=(($R_1_i+20)|0);
 HEAP32[(($291)>>2)]=$284;
 var $292=(($284+24)|0);
 HEAP32[(($292)>>2)]=$R_1_i;
 label=67;break;
 case 65: 
 _abort();
 throw "Reached an unreachable!";
 case 66: 
 _abort();
 throw "Reached an unreachable!";
 case 67: 
 var $296=($rsize_0_i>>>0)<16;
 if($296){label=68;break;}else{label=69;break;}
 case 68: 
 var $298=((($rsize_0_i)+($8))|0);
 var $299=$298|3;
 var $300=(($v_0_i+4)|0);
 HEAP32[(($300)>>2)]=$299;
 var $_sum4_i=((($298)+(4))|0);
 var $301=(($192+$_sum4_i)|0);
 var $302=$301;
 var $303=HEAP32[(($302)>>2)];
 var $304=$303|1;
 HEAP32[(($302)>>2)]=$304;
 label=77;break;
 case 69: 
 var $306=$8|3;
 var $307=(($v_0_i+4)|0);
 HEAP32[(($307)>>2)]=$306;
 var $308=$rsize_0_i|1;
 var $_sum_i41=$8|4;
 var $309=(($192+$_sum_i41)|0);
 var $310=$309;
 HEAP32[(($310)>>2)]=$308;
 var $_sum1_i=((($rsize_0_i)+($8))|0);
 var $311=(($192+$_sum1_i)|0);
 var $312=$311;
 HEAP32[(($312)>>2)]=$rsize_0_i;
 var $313=HEAP32[((4192)>>2)];
 var $314=($313|0)==0;
 if($314){label=75;break;}else{label=70;break;}
 case 70: 
 var $316=HEAP32[((4204)>>2)];
 var $317=$313>>>3;
 var $318=$317<<1;
 var $319=((4224+($318<<2))|0);
 var $320=$319;
 var $321=HEAP32[((4184)>>2)];
 var $322=1<<$317;
 var $323=$321&$322;
 var $324=($323|0)==0;
 if($324){label=71;break;}else{label=72;break;}
 case 71: 
 var $326=$321|$322;
 HEAP32[((4184)>>2)]=$326;
 var $_sum2_pre_i=((($318)+(2))|0);
 var $_pre_i=((4224+($_sum2_pre_i<<2))|0);
 var $F1_0_i=$320;var $_pre_phi_i=$_pre_i;label=74;break;
 case 72: 
 var $_sum3_i=((($318)+(2))|0);
 var $328=((4224+($_sum3_i<<2))|0);
 var $329=HEAP32[(($328)>>2)];
 var $330=$329;
 var $331=HEAP32[((4200)>>2)];
 var $332=($330>>>0)<($331>>>0);
 if($332){label=73;break;}else{var $F1_0_i=$329;var $_pre_phi_i=$328;label=74;break;}
 case 73: 
 _abort();
 throw "Reached an unreachable!";
 case 74: 
 var $_pre_phi_i;
 var $F1_0_i;
 HEAP32[(($_pre_phi_i)>>2)]=$316;
 var $335=(($F1_0_i+12)|0);
 HEAP32[(($335)>>2)]=$316;
 var $336=(($316+8)|0);
 HEAP32[(($336)>>2)]=$F1_0_i;
 var $337=(($316+12)|0);
 HEAP32[(($337)>>2)]=$320;
 label=75;break;
 case 75: 
 HEAP32[((4192)>>2)]=$rsize_0_i;
 HEAP32[((4204)>>2)]=$197;
 label=77;break;
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $340=(($v_0_i+8)|0);
 var $341=$340;
 var $mem_0=$341;label=341;break;
 case 78: 
 var $343=($bytes>>>0)>4294967231;
 if($343){var $nb_0=-1;label=160;break;}else{label=79;break;}
 case 79: 
 var $345=((($bytes)+(11))|0);
 var $346=$345&-8;
 var $347=HEAP32[((4188)>>2)];
 var $348=($347|0)==0;
 if($348){var $nb_0=$346;label=160;break;}else{label=80;break;}
 case 80: 
 var $350=(((-$346))|0);
 var $351=$345>>>8;
 var $352=($351|0)==0;
 if($352){var $idx_0_i=0;label=83;break;}else{label=81;break;}
 case 81: 
 var $354=($346>>>0)>16777215;
 if($354){var $idx_0_i=31;label=83;break;}else{label=82;break;}
 case 82: 
 var $356=((($351)+(1048320))|0);
 var $357=$356>>>16;
 var $358=$357&8;
 var $359=$351<<$358;
 var $360=((($359)+(520192))|0);
 var $361=$360>>>16;
 var $362=$361&4;
 var $363=$362|$358;
 var $364=$359<<$362;
 var $365=((($364)+(245760))|0);
 var $366=$365>>>16;
 var $367=$366&2;
 var $368=$363|$367;
 var $369=(((14)-($368))|0);
 var $370=$364<<$367;
 var $371=$370>>>15;
 var $372=((($369)+($371))|0);
 var $373=$372<<1;
 var $374=((($372)+(7))|0);
 var $375=$346>>>($374>>>0);
 var $376=$375&1;
 var $377=$376|$373;
 var $idx_0_i=$377;label=83;break;
 case 83: 
 var $idx_0_i;
 var $379=((4488+($idx_0_i<<2))|0);
 var $380=HEAP32[(($379)>>2)];
 var $381=($380|0)==0;
 if($381){var $v_2_i=0;var $rsize_2_i=$350;var $t_1_i=0;label=90;break;}else{label=84;break;}
 case 84: 
 var $383=($idx_0_i|0)==31;
 if($383){var $388=0;label=86;break;}else{label=85;break;}
 case 85: 
 var $385=$idx_0_i>>>1;
 var $386=(((25)-($385))|0);
 var $388=$386;label=86;break;
 case 86: 
 var $388;
 var $389=$346<<$388;
 var $v_0_i18=0;var $rsize_0_i17=$350;var $t_0_i16=$380;var $sizebits_0_i=$389;var $rst_0_i=0;label=87;break;
 case 87: 
 var $rst_0_i;
 var $sizebits_0_i;
 var $t_0_i16;
 var $rsize_0_i17;
 var $v_0_i18;
 var $391=(($t_0_i16+4)|0);
 var $392=HEAP32[(($391)>>2)];
 var $393=$392&-8;
 var $394=((($393)-($346))|0);
 var $395=($394>>>0)<($rsize_0_i17>>>0);
 if($395){label=88;break;}else{var $v_1_i=$v_0_i18;var $rsize_1_i=$rsize_0_i17;label=89;break;}
 case 88: 
 var $397=($393|0)==($346|0);
 if($397){var $v_2_i=$t_0_i16;var $rsize_2_i=$394;var $t_1_i=$t_0_i16;label=90;break;}else{var $v_1_i=$t_0_i16;var $rsize_1_i=$394;label=89;break;}
 case 89: 
 var $rsize_1_i;
 var $v_1_i;
 var $399=(($t_0_i16+20)|0);
 var $400=HEAP32[(($399)>>2)];
 var $401=$sizebits_0_i>>>31;
 var $402=(($t_0_i16+16+($401<<2))|0);
 var $403=HEAP32[(($402)>>2)];
 var $404=($400|0)==0;
 var $405=($400|0)==($403|0);
 var $or_cond21_i=$404|$405;
 var $rst_1_i=($or_cond21_i?$rst_0_i:$400);
 var $406=($403|0)==0;
 var $407=$sizebits_0_i<<1;
 if($406){var $v_2_i=$v_1_i;var $rsize_2_i=$rsize_1_i;var $t_1_i=$rst_1_i;label=90;break;}else{var $v_0_i18=$v_1_i;var $rsize_0_i17=$rsize_1_i;var $t_0_i16=$403;var $sizebits_0_i=$407;var $rst_0_i=$rst_1_i;label=87;break;}
 case 90: 
 var $t_1_i;
 var $rsize_2_i;
 var $v_2_i;
 var $408=($t_1_i|0)==0;
 var $409=($v_2_i|0)==0;
 var $or_cond_i=$408&$409;
 if($or_cond_i){label=91;break;}else{var $t_2_ph_i=$t_1_i;label=93;break;}
 case 91: 
 var $411=2<<$idx_0_i;
 var $412=(((-$411))|0);
 var $413=$411|$412;
 var $414=$347&$413;
 var $415=($414|0)==0;
 if($415){var $nb_0=$346;label=160;break;}else{label=92;break;}
 case 92: 
 var $417=(((-$414))|0);
 var $418=$414&$417;
 var $419=((($418)-(1))|0);
 var $420=$419>>>12;
 var $421=$420&16;
 var $422=$419>>>($421>>>0);
 var $423=$422>>>5;
 var $424=$423&8;
 var $425=$424|$421;
 var $426=$422>>>($424>>>0);
 var $427=$426>>>2;
 var $428=$427&4;
 var $429=$425|$428;
 var $430=$426>>>($428>>>0);
 var $431=$430>>>1;
 var $432=$431&2;
 var $433=$429|$432;
 var $434=$430>>>($432>>>0);
 var $435=$434>>>1;
 var $436=$435&1;
 var $437=$433|$436;
 var $438=$434>>>($436>>>0);
 var $439=((($437)+($438))|0);
 var $440=((4488+($439<<2))|0);
 var $441=HEAP32[(($440)>>2)];
 var $t_2_ph_i=$441;label=93;break;
 case 93: 
 var $t_2_ph_i;
 var $442=($t_2_ph_i|0)==0;
 if($442){var $rsize_3_lcssa_i=$rsize_2_i;var $v_3_lcssa_i=$v_2_i;label=96;break;}else{var $t_232_i=$t_2_ph_i;var $rsize_333_i=$rsize_2_i;var $v_334_i=$v_2_i;label=94;break;}
 case 94: 
 var $v_334_i;
 var $rsize_333_i;
 var $t_232_i;
 var $443=(($t_232_i+4)|0);
 var $444=HEAP32[(($443)>>2)];
 var $445=$444&-8;
 var $446=((($445)-($346))|0);
 var $447=($446>>>0)<($rsize_333_i>>>0);
 var $_rsize_3_i=($447?$446:$rsize_333_i);
 var $t_2_v_3_i=($447?$t_232_i:$v_334_i);
 var $448=(($t_232_i+16)|0);
 var $449=HEAP32[(($448)>>2)];
 var $450=($449|0)==0;
 if($450){label=95;break;}else{var $t_232_i=$449;var $rsize_333_i=$_rsize_3_i;var $v_334_i=$t_2_v_3_i;label=94;break;}
 case 95: 
 var $451=(($t_232_i+20)|0);
 var $452=HEAP32[(($451)>>2)];
 var $453=($452|0)==0;
 if($453){var $rsize_3_lcssa_i=$_rsize_3_i;var $v_3_lcssa_i=$t_2_v_3_i;label=96;break;}else{var $t_232_i=$452;var $rsize_333_i=$_rsize_3_i;var $v_334_i=$t_2_v_3_i;label=94;break;}
 case 96: 
 var $v_3_lcssa_i;
 var $rsize_3_lcssa_i;
 var $454=($v_3_lcssa_i|0)==0;
 if($454){var $nb_0=$346;label=160;break;}else{label=97;break;}
 case 97: 
 var $456=HEAP32[((4192)>>2)];
 var $457=((($456)-($346))|0);
 var $458=($rsize_3_lcssa_i>>>0)<($457>>>0);
 if($458){label=98;break;}else{var $nb_0=$346;label=160;break;}
 case 98: 
 var $460=$v_3_lcssa_i;
 var $461=HEAP32[((4200)>>2)];
 var $462=($460>>>0)<($461>>>0);
 if($462){label=158;break;}else{label=99;break;}
 case 99: 
 var $464=(($460+$346)|0);
 var $465=$464;
 var $466=($460>>>0)<($464>>>0);
 if($466){label=100;break;}else{label=158;break;}
 case 100: 
 var $468=(($v_3_lcssa_i+24)|0);
 var $469=HEAP32[(($468)>>2)];
 var $470=(($v_3_lcssa_i+12)|0);
 var $471=HEAP32[(($470)>>2)];
 var $472=($471|0)==($v_3_lcssa_i|0);
 if($472){label=106;break;}else{label=101;break;}
 case 101: 
 var $474=(($v_3_lcssa_i+8)|0);
 var $475=HEAP32[(($474)>>2)];
 var $476=$475;
 var $477=($476>>>0)<($461>>>0);
 if($477){label=105;break;}else{label=102;break;}
 case 102: 
 var $479=(($475+12)|0);
 var $480=HEAP32[(($479)>>2)];
 var $481=($480|0)==($v_3_lcssa_i|0);
 if($481){label=103;break;}else{label=105;break;}
 case 103: 
 var $483=(($471+8)|0);
 var $484=HEAP32[(($483)>>2)];
 var $485=($484|0)==($v_3_lcssa_i|0);
 if($485){label=104;break;}else{label=105;break;}
 case 104: 
 HEAP32[(($479)>>2)]=$471;
 HEAP32[(($483)>>2)]=$475;
 var $R_1_i22=$471;label=113;break;
 case 105: 
 _abort();
 throw "Reached an unreachable!";
 case 106: 
 var $488=(($v_3_lcssa_i+20)|0);
 var $489=HEAP32[(($488)>>2)];
 var $490=($489|0)==0;
 if($490){label=107;break;}else{var $R_0_i20=$489;var $RP_0_i19=$488;label=108;break;}
 case 107: 
 var $492=(($v_3_lcssa_i+16)|0);
 var $493=HEAP32[(($492)>>2)];
 var $494=($493|0)==0;
 if($494){var $R_1_i22=0;label=113;break;}else{var $R_0_i20=$493;var $RP_0_i19=$492;label=108;break;}
 case 108: 
 var $RP_0_i19;
 var $R_0_i20;
 var $495=(($R_0_i20+20)|0);
 var $496=HEAP32[(($495)>>2)];
 var $497=($496|0)==0;
 if($497){label=109;break;}else{var $R_0_i20=$496;var $RP_0_i19=$495;label=108;break;}
 case 109: 
 var $499=(($R_0_i20+16)|0);
 var $500=HEAP32[(($499)>>2)];
 var $501=($500|0)==0;
 if($501){label=110;break;}else{var $R_0_i20=$500;var $RP_0_i19=$499;label=108;break;}
 case 110: 
 var $503=$RP_0_i19;
 var $504=($503>>>0)<($461>>>0);
 if($504){label=112;break;}else{label=111;break;}
 case 111: 
 HEAP32[(($RP_0_i19)>>2)]=0;
 var $R_1_i22=$R_0_i20;label=113;break;
 case 112: 
 _abort();
 throw "Reached an unreachable!";
 case 113: 
 var $R_1_i22;
 var $508=($469|0)==0;
 if($508){label=133;break;}else{label=114;break;}
 case 114: 
 var $510=(($v_3_lcssa_i+28)|0);
 var $511=HEAP32[(($510)>>2)];
 var $512=((4488+($511<<2))|0);
 var $513=HEAP32[(($512)>>2)];
 var $514=($v_3_lcssa_i|0)==($513|0);
 if($514){label=115;break;}else{label=117;break;}
 case 115: 
 HEAP32[(($512)>>2)]=$R_1_i22;
 var $cond_i23=($R_1_i22|0)==0;
 if($cond_i23){label=116;break;}else{label=123;break;}
 case 116: 
 var $516=1<<$511;
 var $517=$516^-1;
 var $518=HEAP32[((4188)>>2)];
 var $519=$518&$517;
 HEAP32[((4188)>>2)]=$519;
 label=133;break;
 case 117: 
 var $521=$469;
 var $522=HEAP32[((4200)>>2)];
 var $523=($521>>>0)<($522>>>0);
 if($523){label=121;break;}else{label=118;break;}
 case 118: 
 var $525=(($469+16)|0);
 var $526=HEAP32[(($525)>>2)];
 var $527=($526|0)==($v_3_lcssa_i|0);
 if($527){label=119;break;}else{label=120;break;}
 case 119: 
 HEAP32[(($525)>>2)]=$R_1_i22;
 label=122;break;
 case 120: 
 var $530=(($469+20)|0);
 HEAP32[(($530)>>2)]=$R_1_i22;
 label=122;break;
 case 121: 
 _abort();
 throw "Reached an unreachable!";
 case 122: 
 var $533=($R_1_i22|0)==0;
 if($533){label=133;break;}else{label=123;break;}
 case 123: 
 var $535=$R_1_i22;
 var $536=HEAP32[((4200)>>2)];
 var $537=($535>>>0)<($536>>>0);
 if($537){label=132;break;}else{label=124;break;}
 case 124: 
 var $539=(($R_1_i22+24)|0);
 HEAP32[(($539)>>2)]=$469;
 var $540=(($v_3_lcssa_i+16)|0);
 var $541=HEAP32[(($540)>>2)];
 var $542=($541|0)==0;
 if($542){label=128;break;}else{label=125;break;}
 case 125: 
 var $544=$541;
 var $545=($544>>>0)<($536>>>0);
 if($545){label=127;break;}else{label=126;break;}
 case 126: 
 var $547=(($R_1_i22+16)|0);
 HEAP32[(($547)>>2)]=$541;
 var $548=(($541+24)|0);
 HEAP32[(($548)>>2)]=$R_1_i22;
 label=128;break;
 case 127: 
 _abort();
 throw "Reached an unreachable!";
 case 128: 
 var $551=(($v_3_lcssa_i+20)|0);
 var $552=HEAP32[(($551)>>2)];
 var $553=($552|0)==0;
 if($553){label=133;break;}else{label=129;break;}
 case 129: 
 var $555=$552;
 var $556=HEAP32[((4200)>>2)];
 var $557=($555>>>0)<($556>>>0);
 if($557){label=131;break;}else{label=130;break;}
 case 130: 
 var $559=(($R_1_i22+20)|0);
 HEAP32[(($559)>>2)]=$552;
 var $560=(($552+24)|0);
 HEAP32[(($560)>>2)]=$R_1_i22;
 label=133;break;
 case 131: 
 _abort();
 throw "Reached an unreachable!";
 case 132: 
 _abort();
 throw "Reached an unreachable!";
 case 133: 
 var $564=($rsize_3_lcssa_i>>>0)<16;
 if($564){label=134;break;}else{label=135;break;}
 case 134: 
 var $566=((($rsize_3_lcssa_i)+($346))|0);
 var $567=$566|3;
 var $568=(($v_3_lcssa_i+4)|0);
 HEAP32[(($568)>>2)]=$567;
 var $_sum19_i=((($566)+(4))|0);
 var $569=(($460+$_sum19_i)|0);
 var $570=$569;
 var $571=HEAP32[(($570)>>2)];
 var $572=$571|1;
 HEAP32[(($570)>>2)]=$572;
 label=159;break;
 case 135: 
 var $574=$346|3;
 var $575=(($v_3_lcssa_i+4)|0);
 HEAP32[(($575)>>2)]=$574;
 var $576=$rsize_3_lcssa_i|1;
 var $_sum_i2540=$346|4;
 var $577=(($460+$_sum_i2540)|0);
 var $578=$577;
 HEAP32[(($578)>>2)]=$576;
 var $_sum1_i26=((($rsize_3_lcssa_i)+($346))|0);
 var $579=(($460+$_sum1_i26)|0);
 var $580=$579;
 HEAP32[(($580)>>2)]=$rsize_3_lcssa_i;
 var $581=$rsize_3_lcssa_i>>>3;
 var $582=($rsize_3_lcssa_i>>>0)<256;
 if($582){label=136;break;}else{label=141;break;}
 case 136: 
 var $584=$581<<1;
 var $585=((4224+($584<<2))|0);
 var $586=$585;
 var $587=HEAP32[((4184)>>2)];
 var $588=1<<$581;
 var $589=$587&$588;
 var $590=($589|0)==0;
 if($590){label=137;break;}else{label=138;break;}
 case 137: 
 var $592=$587|$588;
 HEAP32[((4184)>>2)]=$592;
 var $_sum15_pre_i=((($584)+(2))|0);
 var $_pre_i27=((4224+($_sum15_pre_i<<2))|0);
 var $F5_0_i=$586;var $_pre_phi_i28=$_pre_i27;label=140;break;
 case 138: 
 var $_sum18_i=((($584)+(2))|0);
 var $594=((4224+($_sum18_i<<2))|0);
 var $595=HEAP32[(($594)>>2)];
 var $596=$595;
 var $597=HEAP32[((4200)>>2)];
 var $598=($596>>>0)<($597>>>0);
 if($598){label=139;break;}else{var $F5_0_i=$595;var $_pre_phi_i28=$594;label=140;break;}
 case 139: 
 _abort();
 throw "Reached an unreachable!";
 case 140: 
 var $_pre_phi_i28;
 var $F5_0_i;
 HEAP32[(($_pre_phi_i28)>>2)]=$465;
 var $601=(($F5_0_i+12)|0);
 HEAP32[(($601)>>2)]=$465;
 var $_sum16_i=((($346)+(8))|0);
 var $602=(($460+$_sum16_i)|0);
 var $603=$602;
 HEAP32[(($603)>>2)]=$F5_0_i;
 var $_sum17_i=((($346)+(12))|0);
 var $604=(($460+$_sum17_i)|0);
 var $605=$604;
 HEAP32[(($605)>>2)]=$586;
 label=159;break;
 case 141: 
 var $607=$464;
 var $608=$rsize_3_lcssa_i>>>8;
 var $609=($608|0)==0;
 if($609){var $I7_0_i=0;label=144;break;}else{label=142;break;}
 case 142: 
 var $611=($rsize_3_lcssa_i>>>0)>16777215;
 if($611){var $I7_0_i=31;label=144;break;}else{label=143;break;}
 case 143: 
 var $613=((($608)+(1048320))|0);
 var $614=$613>>>16;
 var $615=$614&8;
 var $616=$608<<$615;
 var $617=((($616)+(520192))|0);
 var $618=$617>>>16;
 var $619=$618&4;
 var $620=$619|$615;
 var $621=$616<<$619;
 var $622=((($621)+(245760))|0);
 var $623=$622>>>16;
 var $624=$623&2;
 var $625=$620|$624;
 var $626=(((14)-($625))|0);
 var $627=$621<<$624;
 var $628=$627>>>15;
 var $629=((($626)+($628))|0);
 var $630=$629<<1;
 var $631=((($629)+(7))|0);
 var $632=$rsize_3_lcssa_i>>>($631>>>0);
 var $633=$632&1;
 var $634=$633|$630;
 var $I7_0_i=$634;label=144;break;
 case 144: 
 var $I7_0_i;
 var $636=((4488+($I7_0_i<<2))|0);
 var $_sum2_i=((($346)+(28))|0);
 var $637=(($460+$_sum2_i)|0);
 var $638=$637;
 HEAP32[(($638)>>2)]=$I7_0_i;
 var $_sum3_i29=((($346)+(16))|0);
 var $639=(($460+$_sum3_i29)|0);
 var $_sum4_i30=((($346)+(20))|0);
 var $640=(($460+$_sum4_i30)|0);
 var $641=$640;
 HEAP32[(($641)>>2)]=0;
 var $642=$639;
 HEAP32[(($642)>>2)]=0;
 var $643=HEAP32[((4188)>>2)];
 var $644=1<<$I7_0_i;
 var $645=$643&$644;
 var $646=($645|0)==0;
 if($646){label=145;break;}else{label=146;break;}
 case 145: 
 var $648=$643|$644;
 HEAP32[((4188)>>2)]=$648;
 HEAP32[(($636)>>2)]=$607;
 var $649=$636;
 var $_sum5_i=((($346)+(24))|0);
 var $650=(($460+$_sum5_i)|0);
 var $651=$650;
 HEAP32[(($651)>>2)]=$649;
 var $_sum6_i=((($346)+(12))|0);
 var $652=(($460+$_sum6_i)|0);
 var $653=$652;
 HEAP32[(($653)>>2)]=$607;
 var $_sum7_i=((($346)+(8))|0);
 var $654=(($460+$_sum7_i)|0);
 var $655=$654;
 HEAP32[(($655)>>2)]=$607;
 label=159;break;
 case 146: 
 var $657=HEAP32[(($636)>>2)];
 var $658=($I7_0_i|0)==31;
 if($658){var $663=0;label=148;break;}else{label=147;break;}
 case 147: 
 var $660=$I7_0_i>>>1;
 var $661=(((25)-($660))|0);
 var $663=$661;label=148;break;
 case 148: 
 var $663;
 var $664=(($657+4)|0);
 var $665=HEAP32[(($664)>>2)];
 var $666=$665&-8;
 var $667=($666|0)==($rsize_3_lcssa_i|0);
 if($667){var $T_0_lcssa_i=$657;label=155;break;}else{label=149;break;}
 case 149: 
 var $668=$rsize_3_lcssa_i<<$663;
 var $T_028_i=$657;var $K12_029_i=$668;label=151;break;
 case 150: 
 var $670=$K12_029_i<<1;
 var $671=(($678+4)|0);
 var $672=HEAP32[(($671)>>2)];
 var $673=$672&-8;
 var $674=($673|0)==($rsize_3_lcssa_i|0);
 if($674){var $T_0_lcssa_i=$678;label=155;break;}else{var $T_028_i=$678;var $K12_029_i=$670;label=151;break;}
 case 151: 
 var $K12_029_i;
 var $T_028_i;
 var $676=$K12_029_i>>>31;
 var $677=(($T_028_i+16+($676<<2))|0);
 var $678=HEAP32[(($677)>>2)];
 var $679=($678|0)==0;
 if($679){label=152;break;}else{label=150;break;}
 case 152: 
 var $681=$677;
 var $682=HEAP32[((4200)>>2)];
 var $683=($681>>>0)<($682>>>0);
 if($683){label=154;break;}else{label=153;break;}
 case 153: 
 HEAP32[(($677)>>2)]=$607;
 var $_sum12_i=((($346)+(24))|0);
 var $685=(($460+$_sum12_i)|0);
 var $686=$685;
 HEAP32[(($686)>>2)]=$T_028_i;
 var $_sum13_i=((($346)+(12))|0);
 var $687=(($460+$_sum13_i)|0);
 var $688=$687;
 HEAP32[(($688)>>2)]=$607;
 var $_sum14_i=((($346)+(8))|0);
 var $689=(($460+$_sum14_i)|0);
 var $690=$689;
 HEAP32[(($690)>>2)]=$607;
 label=159;break;
 case 154: 
 _abort();
 throw "Reached an unreachable!";
 case 155: 
 var $T_0_lcssa_i;
 var $692=(($T_0_lcssa_i+8)|0);
 var $693=HEAP32[(($692)>>2)];
 var $694=$T_0_lcssa_i;
 var $695=HEAP32[((4200)>>2)];
 var $696=($694>>>0)>=($695>>>0);
 var $697=$693;
 var $698=($697>>>0)>=($695>>>0);
 var $or_cond26_i=$696&$698;
 if($or_cond26_i){label=156;break;}else{label=157;break;}
 case 156: 
 var $700=(($693+12)|0);
 HEAP32[(($700)>>2)]=$607;
 HEAP32[(($692)>>2)]=$607;
 var $_sum9_i=((($346)+(8))|0);
 var $701=(($460+$_sum9_i)|0);
 var $702=$701;
 HEAP32[(($702)>>2)]=$693;
 var $_sum10_i=((($346)+(12))|0);
 var $703=(($460+$_sum10_i)|0);
 var $704=$703;
 HEAP32[(($704)>>2)]=$T_0_lcssa_i;
 var $_sum11_i=((($346)+(24))|0);
 var $705=(($460+$_sum11_i)|0);
 var $706=$705;
 HEAP32[(($706)>>2)]=0;
 label=159;break;
 case 157: 
 _abort();
 throw "Reached an unreachable!";
 case 158: 
 _abort();
 throw "Reached an unreachable!";
 case 159: 
 var $708=(($v_3_lcssa_i+8)|0);
 var $709=$708;
 var $mem_0=$709;label=341;break;
 case 160: 
 var $nb_0;
 var $710=HEAP32[((4192)>>2)];
 var $711=($710>>>0)<($nb_0>>>0);
 if($711){label=165;break;}else{label=161;break;}
 case 161: 
 var $713=((($710)-($nb_0))|0);
 var $714=HEAP32[((4204)>>2)];
 var $715=($713>>>0)>15;
 if($715){label=162;break;}else{label=163;break;}
 case 162: 
 var $717=$714;
 var $718=(($717+$nb_0)|0);
 var $719=$718;
 HEAP32[((4204)>>2)]=$719;
 HEAP32[((4192)>>2)]=$713;
 var $720=$713|1;
 var $_sum2=((($nb_0)+(4))|0);
 var $721=(($717+$_sum2)|0);
 var $722=$721;
 HEAP32[(($722)>>2)]=$720;
 var $723=(($717+$710)|0);
 var $724=$723;
 HEAP32[(($724)>>2)]=$713;
 var $725=$nb_0|3;
 var $726=(($714+4)|0);
 HEAP32[(($726)>>2)]=$725;
 label=164;break;
 case 163: 
 HEAP32[((4192)>>2)]=0;
 HEAP32[((4204)>>2)]=0;
 var $728=$710|3;
 var $729=(($714+4)|0);
 HEAP32[(($729)>>2)]=$728;
 var $730=$714;
 var $_sum1=((($710)+(4))|0);
 var $731=(($730+$_sum1)|0);
 var $732=$731;
 var $733=HEAP32[(($732)>>2)];
 var $734=$733|1;
 HEAP32[(($732)>>2)]=$734;
 label=164;break;
 case 164: 
 var $736=(($714+8)|0);
 var $737=$736;
 var $mem_0=$737;label=341;break;
 case 165: 
 var $739=HEAP32[((4196)>>2)];
 var $740=($739>>>0)>($nb_0>>>0);
 if($740){label=166;break;}else{label=167;break;}
 case 166: 
 var $742=((($739)-($nb_0))|0);
 HEAP32[((4196)>>2)]=$742;
 var $743=HEAP32[((4208)>>2)];
 var $744=$743;
 var $745=(($744+$nb_0)|0);
 var $746=$745;
 HEAP32[((4208)>>2)]=$746;
 var $747=$742|1;
 var $_sum=((($nb_0)+(4))|0);
 var $748=(($744+$_sum)|0);
 var $749=$748;
 HEAP32[(($749)>>2)]=$747;
 var $750=$nb_0|3;
 var $751=(($743+4)|0);
 HEAP32[(($751)>>2)]=$750;
 var $752=(($743+8)|0);
 var $753=$752;
 var $mem_0=$753;label=341;break;
 case 167: 
 var $755=HEAP32[((4160)>>2)];
 var $756=($755|0)==0;
 if($756){label=168;break;}else{label=171;break;}
 case 168: 
 var $758=_sysconf(30);
 var $759=((($758)-(1))|0);
 var $760=$759&$758;
 var $761=($760|0)==0;
 if($761){label=170;break;}else{label=169;break;}
 case 169: 
 _abort();
 throw "Reached an unreachable!";
 case 170: 
 HEAP32[((4168)>>2)]=$758;
 HEAP32[((4164)>>2)]=$758;
 HEAP32[((4172)>>2)]=-1;
 HEAP32[((4176)>>2)]=-1;
 HEAP32[((4180)>>2)]=0;
 HEAP32[((4628)>>2)]=0;
 var $763=_time(0);
 var $764=$763&-16;
 var $765=$764^1431655768;
 HEAP32[((4160)>>2)]=$765;
 label=171;break;
 case 171: 
 var $767=((($nb_0)+(48))|0);
 var $768=HEAP32[((4168)>>2)];
 var $769=((($nb_0)+(47))|0);
 var $770=((($768)+($769))|0);
 var $771=(((-$768))|0);
 var $772=$770&$771;
 var $773=($772>>>0)>($nb_0>>>0);
 if($773){label=172;break;}else{var $mem_0=0;label=341;break;}
 case 172: 
 var $775=HEAP32[((4624)>>2)];
 var $776=($775|0)==0;
 if($776){label=174;break;}else{label=173;break;}
 case 173: 
 var $778=HEAP32[((4616)>>2)];
 var $779=((($778)+($772))|0);
 var $780=($779>>>0)<=($778>>>0);
 var $781=($779>>>0)>($775>>>0);
 var $or_cond1_i=$780|$781;
 if($or_cond1_i){var $mem_0=0;label=341;break;}else{label=174;break;}
 case 174: 
 var $783=HEAP32[((4628)>>2)];
 var $784=$783&4;
 var $785=($784|0)==0;
 if($785){label=175;break;}else{var $tsize_1_i=0;label=198;break;}
 case 175: 
 var $787=HEAP32[((4208)>>2)];
 var $788=($787|0)==0;
 if($788){label=181;break;}else{label=176;break;}
 case 176: 
 var $790=$787;
 var $sp_0_i_i=4632;label=177;break;
 case 177: 
 var $sp_0_i_i;
 var $792=(($sp_0_i_i)|0);
 var $793=HEAP32[(($792)>>2)];
 var $794=($793>>>0)>($790>>>0);
 if($794){label=179;break;}else{label=178;break;}
 case 178: 
 var $796=(($sp_0_i_i+4)|0);
 var $797=HEAP32[(($796)>>2)];
 var $798=(($793+$797)|0);
 var $799=($798>>>0)>($790>>>0);
 if($799){label=180;break;}else{label=179;break;}
 case 179: 
 var $801=(($sp_0_i_i+8)|0);
 var $802=HEAP32[(($801)>>2)];
 var $803=($802|0)==0;
 if($803){label=181;break;}else{var $sp_0_i_i=$802;label=177;break;}
 case 180: 
 var $804=($sp_0_i_i|0)==0;
 if($804){label=181;break;}else{label=188;break;}
 case 181: 
 var $805=_sbrk(0);
 var $806=($805|0)==-1;
 if($806){var $tsize_03141_i=0;label=197;break;}else{label=182;break;}
 case 182: 
 var $808=$805;
 var $809=HEAP32[((4164)>>2)];
 var $810=((($809)-(1))|0);
 var $811=$810&$808;
 var $812=($811|0)==0;
 if($812){var $ssize_0_i=$772;label=184;break;}else{label=183;break;}
 case 183: 
 var $814=((($810)+($808))|0);
 var $815=(((-$809))|0);
 var $816=$814&$815;
 var $817=((($772)-($808))|0);
 var $818=((($817)+($816))|0);
 var $ssize_0_i=$818;label=184;break;
 case 184: 
 var $ssize_0_i;
 var $820=HEAP32[((4616)>>2)];
 var $821=((($820)+($ssize_0_i))|0);
 var $822=($ssize_0_i>>>0)>($nb_0>>>0);
 var $823=($ssize_0_i>>>0)<2147483647;
 var $or_cond_i31=$822&$823;
 if($or_cond_i31){label=185;break;}else{var $tsize_03141_i=0;label=197;break;}
 case 185: 
 var $825=HEAP32[((4624)>>2)];
 var $826=($825|0)==0;
 if($826){label=187;break;}else{label=186;break;}
 case 186: 
 var $828=($821>>>0)<=($820>>>0);
 var $829=($821>>>0)>($825>>>0);
 var $or_cond2_i=$828|$829;
 if($or_cond2_i){var $tsize_03141_i=0;label=197;break;}else{label=187;break;}
 case 187: 
 var $831=_sbrk($ssize_0_i);
 var $832=($831|0)==($805|0);
 if($832){var $br_0_i=$805;var $ssize_1_i=$ssize_0_i;label=190;break;}else{var $ssize_129_i=$ssize_0_i;var $br_030_i=$831;label=191;break;}
 case 188: 
 var $834=HEAP32[((4196)>>2)];
 var $835=((($770)-($834))|0);
 var $836=$835&$771;
 var $837=($836>>>0)<2147483647;
 if($837){label=189;break;}else{var $tsize_03141_i=0;label=197;break;}
 case 189: 
 var $839=_sbrk($836);
 var $840=HEAP32[(($792)>>2)];
 var $841=HEAP32[(($796)>>2)];
 var $842=(($840+$841)|0);
 var $843=($839|0)==($842|0);
 if($843){var $br_0_i=$839;var $ssize_1_i=$836;label=190;break;}else{var $ssize_129_i=$836;var $br_030_i=$839;label=191;break;}
 case 190: 
 var $ssize_1_i;
 var $br_0_i;
 var $845=($br_0_i|0)==-1;
 if($845){var $tsize_03141_i=$ssize_1_i;label=197;break;}else{var $tsize_244_i=$ssize_1_i;var $tbase_245_i=$br_0_i;label=201;break;}
 case 191: 
 var $br_030_i;
 var $ssize_129_i;
 var $846=(((-$ssize_129_i))|0);
 var $847=($br_030_i|0)!=-1;
 var $848=($ssize_129_i>>>0)<2147483647;
 var $or_cond5_i=$847&$848;
 var $849=($767>>>0)>($ssize_129_i>>>0);
 var $or_cond4_i=$or_cond5_i&$849;
 if($or_cond4_i){label=192;break;}else{var $ssize_2_i=$ssize_129_i;label=196;break;}
 case 192: 
 var $851=HEAP32[((4168)>>2)];
 var $852=((($769)-($ssize_129_i))|0);
 var $853=((($852)+($851))|0);
 var $854=(((-$851))|0);
 var $855=$853&$854;
 var $856=($855>>>0)<2147483647;
 if($856){label=193;break;}else{var $ssize_2_i=$ssize_129_i;label=196;break;}
 case 193: 
 var $858=_sbrk($855);
 var $859=($858|0)==-1;
 if($859){label=195;break;}else{label=194;break;}
 case 194: 
 var $861=((($855)+($ssize_129_i))|0);
 var $ssize_2_i=$861;label=196;break;
 case 195: 
 var $862=_sbrk($846);
 var $tsize_03141_i=0;label=197;break;
 case 196: 
 var $ssize_2_i;
 var $864=($br_030_i|0)==-1;
 if($864){var $tsize_03141_i=0;label=197;break;}else{var $tsize_244_i=$ssize_2_i;var $tbase_245_i=$br_030_i;label=201;break;}
 case 197: 
 var $tsize_03141_i;
 var $865=HEAP32[((4628)>>2)];
 var $866=$865|4;
 HEAP32[((4628)>>2)]=$866;
 var $tsize_1_i=$tsize_03141_i;label=198;break;
 case 198: 
 var $tsize_1_i;
 var $868=($772>>>0)<2147483647;
 if($868){label=199;break;}else{label=340;break;}
 case 199: 
 var $870=_sbrk($772);
 var $871=_sbrk(0);
 var $872=($870|0)!=-1;
 var $873=($871|0)!=-1;
 var $or_cond3_i=$872&$873;
 var $874=($870>>>0)<($871>>>0);
 var $or_cond6_i=$or_cond3_i&$874;
 if($or_cond6_i){label=200;break;}else{label=340;break;}
 case 200: 
 var $876=$871;
 var $877=$870;
 var $878=((($876)-($877))|0);
 var $879=((($nb_0)+(40))|0);
 var $880=($878>>>0)>($879>>>0);
 var $_tsize_1_i=($880?$878:$tsize_1_i);
 if($880){var $tsize_244_i=$_tsize_1_i;var $tbase_245_i=$870;label=201;break;}else{label=340;break;}
 case 201: 
 var $tbase_245_i;
 var $tsize_244_i;
 var $881=HEAP32[((4616)>>2)];
 var $882=((($881)+($tsize_244_i))|0);
 HEAP32[((4616)>>2)]=$882;
 var $883=HEAP32[((4620)>>2)];
 var $884=($882>>>0)>($883>>>0);
 if($884){label=202;break;}else{label=203;break;}
 case 202: 
 HEAP32[((4620)>>2)]=$882;
 label=203;break;
 case 203: 
 var $887=HEAP32[((4208)>>2)];
 var $888=($887|0)==0;
 if($888){label=204;break;}else{var $sp_073_i=4632;label=211;break;}
 case 204: 
 var $890=HEAP32[((4200)>>2)];
 var $891=($890|0)==0;
 var $892=($tbase_245_i>>>0)<($890>>>0);
 var $or_cond8_i=$891|$892;
 if($or_cond8_i){label=205;break;}else{label=206;break;}
 case 205: 
 HEAP32[((4200)>>2)]=$tbase_245_i;
 label=206;break;
 case 206: 
 HEAP32[((4632)>>2)]=$tbase_245_i;
 HEAP32[((4636)>>2)]=$tsize_244_i;
 HEAP32[((4644)>>2)]=0;
 var $895=HEAP32[((4160)>>2)];
 HEAP32[((4220)>>2)]=$895;
 HEAP32[((4216)>>2)]=-1;
 var $i_02_i_i=0;label=207;break;
 case 207: 
 var $i_02_i_i;
 var $897=$i_02_i_i<<1;
 var $898=((4224+($897<<2))|0);
 var $899=$898;
 var $_sum_i_i=((($897)+(3))|0);
 var $900=((4224+($_sum_i_i<<2))|0);
 HEAP32[(($900)>>2)]=$899;
 var $_sum1_i_i=((($897)+(2))|0);
 var $901=((4224+($_sum1_i_i<<2))|0);
 HEAP32[(($901)>>2)]=$899;
 var $902=((($i_02_i_i)+(1))|0);
 var $903=($902>>>0)<32;
 if($903){var $i_02_i_i=$902;label=207;break;}else{label=208;break;}
 case 208: 
 var $904=((($tsize_244_i)-(40))|0);
 var $905=(($tbase_245_i+8)|0);
 var $906=$905;
 var $907=$906&7;
 var $908=($907|0)==0;
 if($908){var $912=0;label=210;break;}else{label=209;break;}
 case 209: 
 var $910=(((-$906))|0);
 var $911=$910&7;
 var $912=$911;label=210;break;
 case 210: 
 var $912;
 var $913=(($tbase_245_i+$912)|0);
 var $914=$913;
 var $915=((($904)-($912))|0);
 HEAP32[((4208)>>2)]=$914;
 HEAP32[((4196)>>2)]=$915;
 var $916=$915|1;
 var $_sum_i12_i=((($912)+(4))|0);
 var $917=(($tbase_245_i+$_sum_i12_i)|0);
 var $918=$917;
 HEAP32[(($918)>>2)]=$916;
 var $_sum2_i_i=((($tsize_244_i)-(36))|0);
 var $919=(($tbase_245_i+$_sum2_i_i)|0);
 var $920=$919;
 HEAP32[(($920)>>2)]=40;
 var $921=HEAP32[((4176)>>2)];
 HEAP32[((4212)>>2)]=$921;
 label=338;break;
 case 211: 
 var $sp_073_i;
 var $922=(($sp_073_i)|0);
 var $923=HEAP32[(($922)>>2)];
 var $924=(($sp_073_i+4)|0);
 var $925=HEAP32[(($924)>>2)];
 var $926=(($923+$925)|0);
 var $927=($tbase_245_i|0)==($926|0);
 if($927){label=213;break;}else{label=212;break;}
 case 212: 
 var $929=(($sp_073_i+8)|0);
 var $930=HEAP32[(($929)>>2)];
 var $931=($930|0)==0;
 if($931){label=218;break;}else{var $sp_073_i=$930;label=211;break;}
 case 213: 
 var $932=(($sp_073_i+12)|0);
 var $933=HEAP32[(($932)>>2)];
 var $934=$933&8;
 var $935=($934|0)==0;
 if($935){label=214;break;}else{label=218;break;}
 case 214: 
 var $937=$887;
 var $938=($937>>>0)>=($923>>>0);
 var $939=($937>>>0)<($tbase_245_i>>>0);
 var $or_cond47_i=$938&$939;
 if($or_cond47_i){label=215;break;}else{label=218;break;}
 case 215: 
 var $941=((($925)+($tsize_244_i))|0);
 HEAP32[(($924)>>2)]=$941;
 var $942=HEAP32[((4196)>>2)];
 var $943=((($942)+($tsize_244_i))|0);
 var $944=(($887+8)|0);
 var $945=$944;
 var $946=$945&7;
 var $947=($946|0)==0;
 if($947){var $951=0;label=217;break;}else{label=216;break;}
 case 216: 
 var $949=(((-$945))|0);
 var $950=$949&7;
 var $951=$950;label=217;break;
 case 217: 
 var $951;
 var $952=(($937+$951)|0);
 var $953=$952;
 var $954=((($943)-($951))|0);
 HEAP32[((4208)>>2)]=$953;
 HEAP32[((4196)>>2)]=$954;
 var $955=$954|1;
 var $_sum_i16_i=((($951)+(4))|0);
 var $956=(($937+$_sum_i16_i)|0);
 var $957=$956;
 HEAP32[(($957)>>2)]=$955;
 var $_sum2_i17_i=((($943)+(4))|0);
 var $958=(($937+$_sum2_i17_i)|0);
 var $959=$958;
 HEAP32[(($959)>>2)]=40;
 var $960=HEAP32[((4176)>>2)];
 HEAP32[((4212)>>2)]=$960;
 label=338;break;
 case 218: 
 var $961=HEAP32[((4200)>>2)];
 var $962=($tbase_245_i>>>0)<($961>>>0);
 if($962){label=219;break;}else{var $964=$961;label=220;break;}
 case 219: 
 HEAP32[((4200)>>2)]=$tbase_245_i;
 var $964=$tbase_245_i;label=220;break;
 case 220: 
 var $964;
 var $965=(($tbase_245_i+$tsize_244_i)|0);
 var $sp_166_i=4632;label=221;break;
 case 221: 
 var $sp_166_i;
 var $967=(($sp_166_i)|0);
 var $968=HEAP32[(($967)>>2)];
 var $969=($968|0)==($965|0);
 if($969){label=223;break;}else{label=222;break;}
 case 222: 
 var $971=(($sp_166_i+8)|0);
 var $972=HEAP32[(($971)>>2)];
 var $973=($972|0)==0;
 if($973){label=304;break;}else{var $sp_166_i=$972;label=221;break;}
 case 223: 
 var $974=(($sp_166_i+12)|0);
 var $975=HEAP32[(($974)>>2)];
 var $976=$975&8;
 var $977=($976|0)==0;
 if($977){label=224;break;}else{label=304;break;}
 case 224: 
 HEAP32[(($967)>>2)]=$tbase_245_i;
 var $979=(($sp_166_i+4)|0);
 var $980=HEAP32[(($979)>>2)];
 var $981=((($980)+($tsize_244_i))|0);
 HEAP32[(($979)>>2)]=$981;
 var $982=(($tbase_245_i+8)|0);
 var $983=$982;
 var $984=$983&7;
 var $985=($984|0)==0;
 if($985){var $990=0;label=226;break;}else{label=225;break;}
 case 225: 
 var $987=(((-$983))|0);
 var $988=$987&7;
 var $990=$988;label=226;break;
 case 226: 
 var $990;
 var $991=(($tbase_245_i+$990)|0);
 var $_sum102_i=((($tsize_244_i)+(8))|0);
 var $992=(($tbase_245_i+$_sum102_i)|0);
 var $993=$992;
 var $994=$993&7;
 var $995=($994|0)==0;
 if($995){var $1000=0;label=228;break;}else{label=227;break;}
 case 227: 
 var $997=(((-$993))|0);
 var $998=$997&7;
 var $1000=$998;label=228;break;
 case 228: 
 var $1000;
 var $_sum103_i=((($1000)+($tsize_244_i))|0);
 var $1001=(($tbase_245_i+$_sum103_i)|0);
 var $1002=$1001;
 var $1003=$1001;
 var $1004=$991;
 var $1005=((($1003)-($1004))|0);
 var $_sum_i19_i=((($990)+($nb_0))|0);
 var $1006=(($tbase_245_i+$_sum_i19_i)|0);
 var $1007=$1006;
 var $1008=((($1005)-($nb_0))|0);
 var $1009=$nb_0|3;
 var $_sum1_i20_i=((($990)+(4))|0);
 var $1010=(($tbase_245_i+$_sum1_i20_i)|0);
 var $1011=$1010;
 HEAP32[(($1011)>>2)]=$1009;
 var $1012=($1002|0)==($887|0);
 if($1012){label=229;break;}else{label=230;break;}
 case 229: 
 var $1014=HEAP32[((4196)>>2)];
 var $1015=((($1014)+($1008))|0);
 HEAP32[((4196)>>2)]=$1015;
 HEAP32[((4208)>>2)]=$1007;
 var $1016=$1015|1;
 var $_sum46_i_i=((($_sum_i19_i)+(4))|0);
 var $1017=(($tbase_245_i+$_sum46_i_i)|0);
 var $1018=$1017;
 HEAP32[(($1018)>>2)]=$1016;
 label=303;break;
 case 230: 
 var $1020=HEAP32[((4204)>>2)];
 var $1021=($1002|0)==($1020|0);
 if($1021){label=231;break;}else{label=232;break;}
 case 231: 
 var $1023=HEAP32[((4192)>>2)];
 var $1024=((($1023)+($1008))|0);
 HEAP32[((4192)>>2)]=$1024;
 HEAP32[((4204)>>2)]=$1007;
 var $1025=$1024|1;
 var $_sum44_i_i=((($_sum_i19_i)+(4))|0);
 var $1026=(($tbase_245_i+$_sum44_i_i)|0);
 var $1027=$1026;
 HEAP32[(($1027)>>2)]=$1025;
 var $_sum45_i_i=((($1024)+($_sum_i19_i))|0);
 var $1028=(($tbase_245_i+$_sum45_i_i)|0);
 var $1029=$1028;
 HEAP32[(($1029)>>2)]=$1024;
 label=303;break;
 case 232: 
 var $_sum2_i21_i=((($tsize_244_i)+(4))|0);
 var $_sum104_i=((($_sum2_i21_i)+($1000))|0);
 var $1031=(($tbase_245_i+$_sum104_i)|0);
 var $1032=$1031;
 var $1033=HEAP32[(($1032)>>2)];
 var $1034=$1033&3;
 var $1035=($1034|0)==1;
 if($1035){label=233;break;}else{var $oldfirst_0_i_i=$1002;var $qsize_0_i_i=$1008;label=280;break;}
 case 233: 
 var $1037=$1033&-8;
 var $1038=$1033>>>3;
 var $1039=($1033>>>0)<256;
 if($1039){label=234;break;}else{label=246;break;}
 case 234: 
 var $_sum3940_i_i=$1000|8;
 var $_sum114_i=((($_sum3940_i_i)+($tsize_244_i))|0);
 var $1041=(($tbase_245_i+$_sum114_i)|0);
 var $1042=$1041;
 var $1043=HEAP32[(($1042)>>2)];
 var $_sum41_i_i=((($tsize_244_i)+(12))|0);
 var $_sum115_i=((($_sum41_i_i)+($1000))|0);
 var $1044=(($tbase_245_i+$_sum115_i)|0);
 var $1045=$1044;
 var $1046=HEAP32[(($1045)>>2)];
 var $1047=$1038<<1;
 var $1048=((4224+($1047<<2))|0);
 var $1049=$1048;
 var $1050=($1043|0)==($1049|0);
 if($1050){label=237;break;}else{label=235;break;}
 case 235: 
 var $1052=$1043;
 var $1053=($1052>>>0)<($964>>>0);
 if($1053){label=245;break;}else{label=236;break;}
 case 236: 
 var $1055=(($1043+12)|0);
 var $1056=HEAP32[(($1055)>>2)];
 var $1057=($1056|0)==($1002|0);
 if($1057){label=237;break;}else{label=245;break;}
 case 237: 
 var $1058=($1046|0)==($1043|0);
 if($1058){label=238;break;}else{label=239;break;}
 case 238: 
 var $1060=1<<$1038;
 var $1061=$1060^-1;
 var $1062=HEAP32[((4184)>>2)];
 var $1063=$1062&$1061;
 HEAP32[((4184)>>2)]=$1063;
 label=279;break;
 case 239: 
 var $1065=($1046|0)==($1049|0);
 if($1065){label=240;break;}else{label=241;break;}
 case 240: 
 var $_pre62_i_i=(($1046+8)|0);
 var $_pre_phi63_i_i=$_pre62_i_i;label=243;break;
 case 241: 
 var $1067=$1046;
 var $1068=($1067>>>0)<($964>>>0);
 if($1068){label=244;break;}else{label=242;break;}
 case 242: 
 var $1070=(($1046+8)|0);
 var $1071=HEAP32[(($1070)>>2)];
 var $1072=($1071|0)==($1002|0);
 if($1072){var $_pre_phi63_i_i=$1070;label=243;break;}else{label=244;break;}
 case 243: 
 var $_pre_phi63_i_i;
 var $1073=(($1043+12)|0);
 HEAP32[(($1073)>>2)]=$1046;
 HEAP32[(($_pre_phi63_i_i)>>2)]=$1043;
 label=279;break;
 case 244: 
 _abort();
 throw "Reached an unreachable!";
 case 245: 
 _abort();
 throw "Reached an unreachable!";
 case 246: 
 var $1075=$1001;
 var $_sum34_i_i=$1000|24;
 var $_sum105_i=((($_sum34_i_i)+($tsize_244_i))|0);
 var $1076=(($tbase_245_i+$_sum105_i)|0);
 var $1077=$1076;
 var $1078=HEAP32[(($1077)>>2)];
 var $_sum5_i_i=((($tsize_244_i)+(12))|0);
 var $_sum106_i=((($_sum5_i_i)+($1000))|0);
 var $1079=(($tbase_245_i+$_sum106_i)|0);
 var $1080=$1079;
 var $1081=HEAP32[(($1080)>>2)];
 var $1082=($1081|0)==($1075|0);
 if($1082){label=252;break;}else{label=247;break;}
 case 247: 
 var $_sum3637_i_i=$1000|8;
 var $_sum107_i=((($_sum3637_i_i)+($tsize_244_i))|0);
 var $1084=(($tbase_245_i+$_sum107_i)|0);
 var $1085=$1084;
 var $1086=HEAP32[(($1085)>>2)];
 var $1087=$1086;
 var $1088=($1087>>>0)<($964>>>0);
 if($1088){label=251;break;}else{label=248;break;}
 case 248: 
 var $1090=(($1086+12)|0);
 var $1091=HEAP32[(($1090)>>2)];
 var $1092=($1091|0)==($1075|0);
 if($1092){label=249;break;}else{label=251;break;}
 case 249: 
 var $1094=(($1081+8)|0);
 var $1095=HEAP32[(($1094)>>2)];
 var $1096=($1095|0)==($1075|0);
 if($1096){label=250;break;}else{label=251;break;}
 case 250: 
 HEAP32[(($1090)>>2)]=$1081;
 HEAP32[(($1094)>>2)]=$1086;
 var $R_1_i_i=$1081;label=259;break;
 case 251: 
 _abort();
 throw "Reached an unreachable!";
 case 252: 
 var $_sum67_i_i=$1000|16;
 var $_sum112_i=((($_sum2_i21_i)+($_sum67_i_i))|0);
 var $1099=(($tbase_245_i+$_sum112_i)|0);
 var $1100=$1099;
 var $1101=HEAP32[(($1100)>>2)];
 var $1102=($1101|0)==0;
 if($1102){label=253;break;}else{var $R_0_i_i=$1101;var $RP_0_i_i=$1100;label=254;break;}
 case 253: 
 var $_sum113_i=((($_sum67_i_i)+($tsize_244_i))|0);
 var $1104=(($tbase_245_i+$_sum113_i)|0);
 var $1105=$1104;
 var $1106=HEAP32[(($1105)>>2)];
 var $1107=($1106|0)==0;
 if($1107){var $R_1_i_i=0;label=259;break;}else{var $R_0_i_i=$1106;var $RP_0_i_i=$1105;label=254;break;}
 case 254: 
 var $RP_0_i_i;
 var $R_0_i_i;
 var $1108=(($R_0_i_i+20)|0);
 var $1109=HEAP32[(($1108)>>2)];
 var $1110=($1109|0)==0;
 if($1110){label=255;break;}else{var $R_0_i_i=$1109;var $RP_0_i_i=$1108;label=254;break;}
 case 255: 
 var $1112=(($R_0_i_i+16)|0);
 var $1113=HEAP32[(($1112)>>2)];
 var $1114=($1113|0)==0;
 if($1114){label=256;break;}else{var $R_0_i_i=$1113;var $RP_0_i_i=$1112;label=254;break;}
 case 256: 
 var $1116=$RP_0_i_i;
 var $1117=($1116>>>0)<($964>>>0);
 if($1117){label=258;break;}else{label=257;break;}
 case 257: 
 HEAP32[(($RP_0_i_i)>>2)]=0;
 var $R_1_i_i=$R_0_i_i;label=259;break;
 case 258: 
 _abort();
 throw "Reached an unreachable!";
 case 259: 
 var $R_1_i_i;
 var $1121=($1078|0)==0;
 if($1121){label=279;break;}else{label=260;break;}
 case 260: 
 var $_sum31_i_i=((($tsize_244_i)+(28))|0);
 var $_sum108_i=((($_sum31_i_i)+($1000))|0);
 var $1123=(($tbase_245_i+$_sum108_i)|0);
 var $1124=$1123;
 var $1125=HEAP32[(($1124)>>2)];
 var $1126=((4488+($1125<<2))|0);
 var $1127=HEAP32[(($1126)>>2)];
 var $1128=($1075|0)==($1127|0);
 if($1128){label=261;break;}else{label=263;break;}
 case 261: 
 HEAP32[(($1126)>>2)]=$R_1_i_i;
 var $cond_i_i=($R_1_i_i|0)==0;
 if($cond_i_i){label=262;break;}else{label=269;break;}
 case 262: 
 var $1130=1<<$1125;
 var $1131=$1130^-1;
 var $1132=HEAP32[((4188)>>2)];
 var $1133=$1132&$1131;
 HEAP32[((4188)>>2)]=$1133;
 label=279;break;
 case 263: 
 var $1135=$1078;
 var $1136=HEAP32[((4200)>>2)];
 var $1137=($1135>>>0)<($1136>>>0);
 if($1137){label=267;break;}else{label=264;break;}
 case 264: 
 var $1139=(($1078+16)|0);
 var $1140=HEAP32[(($1139)>>2)];
 var $1141=($1140|0)==($1075|0);
 if($1141){label=265;break;}else{label=266;break;}
 case 265: 
 HEAP32[(($1139)>>2)]=$R_1_i_i;
 label=268;break;
 case 266: 
 var $1144=(($1078+20)|0);
 HEAP32[(($1144)>>2)]=$R_1_i_i;
 label=268;break;
 case 267: 
 _abort();
 throw "Reached an unreachable!";
 case 268: 
 var $1147=($R_1_i_i|0)==0;
 if($1147){label=279;break;}else{label=269;break;}
 case 269: 
 var $1149=$R_1_i_i;
 var $1150=HEAP32[((4200)>>2)];
 var $1151=($1149>>>0)<($1150>>>0);
 if($1151){label=278;break;}else{label=270;break;}
 case 270: 
 var $1153=(($R_1_i_i+24)|0);
 HEAP32[(($1153)>>2)]=$1078;
 var $_sum3233_i_i=$1000|16;
 var $_sum109_i=((($_sum3233_i_i)+($tsize_244_i))|0);
 var $1154=(($tbase_245_i+$_sum109_i)|0);
 var $1155=$1154;
 var $1156=HEAP32[(($1155)>>2)];
 var $1157=($1156|0)==0;
 if($1157){label=274;break;}else{label=271;break;}
 case 271: 
 var $1159=$1156;
 var $1160=($1159>>>0)<($1150>>>0);
 if($1160){label=273;break;}else{label=272;break;}
 case 272: 
 var $1162=(($R_1_i_i+16)|0);
 HEAP32[(($1162)>>2)]=$1156;
 var $1163=(($1156+24)|0);
 HEAP32[(($1163)>>2)]=$R_1_i_i;
 label=274;break;
 case 273: 
 _abort();
 throw "Reached an unreachable!";
 case 274: 
 var $_sum110_i=((($_sum2_i21_i)+($_sum3233_i_i))|0);
 var $1166=(($tbase_245_i+$_sum110_i)|0);
 var $1167=$1166;
 var $1168=HEAP32[(($1167)>>2)];
 var $1169=($1168|0)==0;
 if($1169){label=279;break;}else{label=275;break;}
 case 275: 
 var $1171=$1168;
 var $1172=HEAP32[((4200)>>2)];
 var $1173=($1171>>>0)<($1172>>>0);
 if($1173){label=277;break;}else{label=276;break;}
 case 276: 
 var $1175=(($R_1_i_i+20)|0);
 HEAP32[(($1175)>>2)]=$1168;
 var $1176=(($1168+24)|0);
 HEAP32[(($1176)>>2)]=$R_1_i_i;
 label=279;break;
 case 277: 
 _abort();
 throw "Reached an unreachable!";
 case 278: 
 _abort();
 throw "Reached an unreachable!";
 case 279: 
 var $_sum9_i_i=$1037|$1000;
 var $_sum111_i=((($_sum9_i_i)+($tsize_244_i))|0);
 var $1180=(($tbase_245_i+$_sum111_i)|0);
 var $1181=$1180;
 var $1182=((($1037)+($1008))|0);
 var $oldfirst_0_i_i=$1181;var $qsize_0_i_i=$1182;label=280;break;
 case 280: 
 var $qsize_0_i_i;
 var $oldfirst_0_i_i;
 var $1184=(($oldfirst_0_i_i+4)|0);
 var $1185=HEAP32[(($1184)>>2)];
 var $1186=$1185&-2;
 HEAP32[(($1184)>>2)]=$1186;
 var $1187=$qsize_0_i_i|1;
 var $_sum10_i_i=((($_sum_i19_i)+(4))|0);
 var $1188=(($tbase_245_i+$_sum10_i_i)|0);
 var $1189=$1188;
 HEAP32[(($1189)>>2)]=$1187;
 var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i19_i))|0);
 var $1190=(($tbase_245_i+$_sum11_i_i)|0);
 var $1191=$1190;
 HEAP32[(($1191)>>2)]=$qsize_0_i_i;
 var $1192=$qsize_0_i_i>>>3;
 var $1193=($qsize_0_i_i>>>0)<256;
 if($1193){label=281;break;}else{label=286;break;}
 case 281: 
 var $1195=$1192<<1;
 var $1196=((4224+($1195<<2))|0);
 var $1197=$1196;
 var $1198=HEAP32[((4184)>>2)];
 var $1199=1<<$1192;
 var $1200=$1198&$1199;
 var $1201=($1200|0)==0;
 if($1201){label=282;break;}else{label=283;break;}
 case 282: 
 var $1203=$1198|$1199;
 HEAP32[((4184)>>2)]=$1203;
 var $_sum27_pre_i_i=((($1195)+(2))|0);
 var $_pre_i22_i=((4224+($_sum27_pre_i_i<<2))|0);
 var $F4_0_i_i=$1197;var $_pre_phi_i23_i=$_pre_i22_i;label=285;break;
 case 283: 
 var $_sum30_i_i=((($1195)+(2))|0);
 var $1205=((4224+($_sum30_i_i<<2))|0);
 var $1206=HEAP32[(($1205)>>2)];
 var $1207=$1206;
 var $1208=HEAP32[((4200)>>2)];
 var $1209=($1207>>>0)<($1208>>>0);
 if($1209){label=284;break;}else{var $F4_0_i_i=$1206;var $_pre_phi_i23_i=$1205;label=285;break;}
 case 284: 
 _abort();
 throw "Reached an unreachable!";
 case 285: 
 var $_pre_phi_i23_i;
 var $F4_0_i_i;
 HEAP32[(($_pre_phi_i23_i)>>2)]=$1007;
 var $1212=(($F4_0_i_i+12)|0);
 HEAP32[(($1212)>>2)]=$1007;
 var $_sum28_i_i=((($_sum_i19_i)+(8))|0);
 var $1213=(($tbase_245_i+$_sum28_i_i)|0);
 var $1214=$1213;
 HEAP32[(($1214)>>2)]=$F4_0_i_i;
 var $_sum29_i_i=((($_sum_i19_i)+(12))|0);
 var $1215=(($tbase_245_i+$_sum29_i_i)|0);
 var $1216=$1215;
 HEAP32[(($1216)>>2)]=$1197;
 label=303;break;
 case 286: 
 var $1218=$1006;
 var $1219=$qsize_0_i_i>>>8;
 var $1220=($1219|0)==0;
 if($1220){var $I7_0_i_i=0;label=289;break;}else{label=287;break;}
 case 287: 
 var $1222=($qsize_0_i_i>>>0)>16777215;
 if($1222){var $I7_0_i_i=31;label=289;break;}else{label=288;break;}
 case 288: 
 var $1224=((($1219)+(1048320))|0);
 var $1225=$1224>>>16;
 var $1226=$1225&8;
 var $1227=$1219<<$1226;
 var $1228=((($1227)+(520192))|0);
 var $1229=$1228>>>16;
 var $1230=$1229&4;
 var $1231=$1230|$1226;
 var $1232=$1227<<$1230;
 var $1233=((($1232)+(245760))|0);
 var $1234=$1233>>>16;
 var $1235=$1234&2;
 var $1236=$1231|$1235;
 var $1237=(((14)-($1236))|0);
 var $1238=$1232<<$1235;
 var $1239=$1238>>>15;
 var $1240=((($1237)+($1239))|0);
 var $1241=$1240<<1;
 var $1242=((($1240)+(7))|0);
 var $1243=$qsize_0_i_i>>>($1242>>>0);
 var $1244=$1243&1;
 var $1245=$1244|$1241;
 var $I7_0_i_i=$1245;label=289;break;
 case 289: 
 var $I7_0_i_i;
 var $1247=((4488+($I7_0_i_i<<2))|0);
 var $_sum12_i24_i=((($_sum_i19_i)+(28))|0);
 var $1248=(($tbase_245_i+$_sum12_i24_i)|0);
 var $1249=$1248;
 HEAP32[(($1249)>>2)]=$I7_0_i_i;
 var $_sum13_i_i=((($_sum_i19_i)+(16))|0);
 var $1250=(($tbase_245_i+$_sum13_i_i)|0);
 var $_sum14_i_i=((($_sum_i19_i)+(20))|0);
 var $1251=(($tbase_245_i+$_sum14_i_i)|0);
 var $1252=$1251;
 HEAP32[(($1252)>>2)]=0;
 var $1253=$1250;
 HEAP32[(($1253)>>2)]=0;
 var $1254=HEAP32[((4188)>>2)];
 var $1255=1<<$I7_0_i_i;
 var $1256=$1254&$1255;
 var $1257=($1256|0)==0;
 if($1257){label=290;break;}else{label=291;break;}
 case 290: 
 var $1259=$1254|$1255;
 HEAP32[((4188)>>2)]=$1259;
 HEAP32[(($1247)>>2)]=$1218;
 var $1260=$1247;
 var $_sum15_i_i=((($_sum_i19_i)+(24))|0);
 var $1261=(($tbase_245_i+$_sum15_i_i)|0);
 var $1262=$1261;
 HEAP32[(($1262)>>2)]=$1260;
 var $_sum16_i_i=((($_sum_i19_i)+(12))|0);
 var $1263=(($tbase_245_i+$_sum16_i_i)|0);
 var $1264=$1263;
 HEAP32[(($1264)>>2)]=$1218;
 var $_sum17_i_i=((($_sum_i19_i)+(8))|0);
 var $1265=(($tbase_245_i+$_sum17_i_i)|0);
 var $1266=$1265;
 HEAP32[(($1266)>>2)]=$1218;
 label=303;break;
 case 291: 
 var $1268=HEAP32[(($1247)>>2)];
 var $1269=($I7_0_i_i|0)==31;
 if($1269){var $1274=0;label=293;break;}else{label=292;break;}
 case 292: 
 var $1271=$I7_0_i_i>>>1;
 var $1272=(((25)-($1271))|0);
 var $1274=$1272;label=293;break;
 case 293: 
 var $1274;
 var $1275=(($1268+4)|0);
 var $1276=HEAP32[(($1275)>>2)];
 var $1277=$1276&-8;
 var $1278=($1277|0)==($qsize_0_i_i|0);
 if($1278){var $T_0_lcssa_i26_i=$1268;label=300;break;}else{label=294;break;}
 case 294: 
 var $1279=$qsize_0_i_i<<$1274;
 var $T_056_i_i=$1268;var $K8_057_i_i=$1279;label=296;break;
 case 295: 
 var $1281=$K8_057_i_i<<1;
 var $1282=(($1289+4)|0);
 var $1283=HEAP32[(($1282)>>2)];
 var $1284=$1283&-8;
 var $1285=($1284|0)==($qsize_0_i_i|0);
 if($1285){var $T_0_lcssa_i26_i=$1289;label=300;break;}else{var $T_056_i_i=$1289;var $K8_057_i_i=$1281;label=296;break;}
 case 296: 
 var $K8_057_i_i;
 var $T_056_i_i;
 var $1287=$K8_057_i_i>>>31;
 var $1288=(($T_056_i_i+16+($1287<<2))|0);
 var $1289=HEAP32[(($1288)>>2)];
 var $1290=($1289|0)==0;
 if($1290){label=297;break;}else{label=295;break;}
 case 297: 
 var $1292=$1288;
 var $1293=HEAP32[((4200)>>2)];
 var $1294=($1292>>>0)<($1293>>>0);
 if($1294){label=299;break;}else{label=298;break;}
 case 298: 
 HEAP32[(($1288)>>2)]=$1218;
 var $_sum24_i_i=((($_sum_i19_i)+(24))|0);
 var $1296=(($tbase_245_i+$_sum24_i_i)|0);
 var $1297=$1296;
 HEAP32[(($1297)>>2)]=$T_056_i_i;
 var $_sum25_i_i=((($_sum_i19_i)+(12))|0);
 var $1298=(($tbase_245_i+$_sum25_i_i)|0);
 var $1299=$1298;
 HEAP32[(($1299)>>2)]=$1218;
 var $_sum26_i_i=((($_sum_i19_i)+(8))|0);
 var $1300=(($tbase_245_i+$_sum26_i_i)|0);
 var $1301=$1300;
 HEAP32[(($1301)>>2)]=$1218;
 label=303;break;
 case 299: 
 _abort();
 throw "Reached an unreachable!";
 case 300: 
 var $T_0_lcssa_i26_i;
 var $1303=(($T_0_lcssa_i26_i+8)|0);
 var $1304=HEAP32[(($1303)>>2)];
 var $1305=$T_0_lcssa_i26_i;
 var $1306=HEAP32[((4200)>>2)];
 var $1307=($1305>>>0)>=($1306>>>0);
 var $1308=$1304;
 var $1309=($1308>>>0)>=($1306>>>0);
 var $or_cond_i27_i=$1307&$1309;
 if($or_cond_i27_i){label=301;break;}else{label=302;break;}
 case 301: 
 var $1311=(($1304+12)|0);
 HEAP32[(($1311)>>2)]=$1218;
 HEAP32[(($1303)>>2)]=$1218;
 var $_sum21_i_i=((($_sum_i19_i)+(8))|0);
 var $1312=(($tbase_245_i+$_sum21_i_i)|0);
 var $1313=$1312;
 HEAP32[(($1313)>>2)]=$1304;
 var $_sum22_i_i=((($_sum_i19_i)+(12))|0);
 var $1314=(($tbase_245_i+$_sum22_i_i)|0);
 var $1315=$1314;
 HEAP32[(($1315)>>2)]=$T_0_lcssa_i26_i;
 var $_sum23_i_i=((($_sum_i19_i)+(24))|0);
 var $1316=(($tbase_245_i+$_sum23_i_i)|0);
 var $1317=$1316;
 HEAP32[(($1317)>>2)]=0;
 label=303;break;
 case 302: 
 _abort();
 throw "Reached an unreachable!";
 case 303: 
 var $_sum1819_i_i=$990|8;
 var $1318=(($tbase_245_i+$_sum1819_i_i)|0);
 var $mem_0=$1318;label=341;break;
 case 304: 
 var $1319=$887;
 var $sp_0_i_i_i=4632;label=305;break;
 case 305: 
 var $sp_0_i_i_i;
 var $1321=(($sp_0_i_i_i)|0);
 var $1322=HEAP32[(($1321)>>2)];
 var $1323=($1322>>>0)>($1319>>>0);
 if($1323){label=307;break;}else{label=306;break;}
 case 306: 
 var $1325=(($sp_0_i_i_i+4)|0);
 var $1326=HEAP32[(($1325)>>2)];
 var $1327=(($1322+$1326)|0);
 var $1328=($1327>>>0)>($1319>>>0);
 if($1328){label=308;break;}else{label=307;break;}
 case 307: 
 var $1330=(($sp_0_i_i_i+8)|0);
 var $1331=HEAP32[(($1330)>>2)];
 var $sp_0_i_i_i=$1331;label=305;break;
 case 308: 
 var $_sum_i13_i=((($1326)-(47))|0);
 var $_sum1_i14_i=((($1326)-(39))|0);
 var $1332=(($1322+$_sum1_i14_i)|0);
 var $1333=$1332;
 var $1334=$1333&7;
 var $1335=($1334|0)==0;
 if($1335){var $1340=0;label=310;break;}else{label=309;break;}
 case 309: 
 var $1337=(((-$1333))|0);
 var $1338=$1337&7;
 var $1340=$1338;label=310;break;
 case 310: 
 var $1340;
 var $_sum2_i15_i=((($_sum_i13_i)+($1340))|0);
 var $1341=(($1322+$_sum2_i15_i)|0);
 var $1342=(($887+16)|0);
 var $1343=$1342;
 var $1344=($1341>>>0)<($1343>>>0);
 var $1345=($1344?$1319:$1341);
 var $1346=(($1345+8)|0);
 var $1347=$1346;
 var $1348=((($tsize_244_i)-(40))|0);
 var $1349=(($tbase_245_i+8)|0);
 var $1350=$1349;
 var $1351=$1350&7;
 var $1352=($1351|0)==0;
 if($1352){var $1356=0;label=312;break;}else{label=311;break;}
 case 311: 
 var $1354=(((-$1350))|0);
 var $1355=$1354&7;
 var $1356=$1355;label=312;break;
 case 312: 
 var $1356;
 var $1357=(($tbase_245_i+$1356)|0);
 var $1358=$1357;
 var $1359=((($1348)-($1356))|0);
 HEAP32[((4208)>>2)]=$1358;
 HEAP32[((4196)>>2)]=$1359;
 var $1360=$1359|1;
 var $_sum_i_i_i=((($1356)+(4))|0);
 var $1361=(($tbase_245_i+$_sum_i_i_i)|0);
 var $1362=$1361;
 HEAP32[(($1362)>>2)]=$1360;
 var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
 var $1363=(($tbase_245_i+$_sum2_i_i_i)|0);
 var $1364=$1363;
 HEAP32[(($1364)>>2)]=40;
 var $1365=HEAP32[((4176)>>2)];
 HEAP32[((4212)>>2)]=$1365;
 var $1366=(($1345+4)|0);
 var $1367=$1366;
 HEAP32[(($1367)>>2)]=27;
 assert(16 % 1 === 0);HEAP32[(($1346)>>2)]=HEAP32[((4632)>>2)];HEAP32[((($1346)+(4))>>2)]=HEAP32[((4636)>>2)];HEAP32[((($1346)+(8))>>2)]=HEAP32[((4640)>>2)];HEAP32[((($1346)+(12))>>2)]=HEAP32[((4644)>>2)];
 HEAP32[((4632)>>2)]=$tbase_245_i;
 HEAP32[((4636)>>2)]=$tsize_244_i;
 HEAP32[((4644)>>2)]=0;
 HEAP32[((4640)>>2)]=$1347;
 var $1368=(($1345+28)|0);
 var $1369=$1368;
 HEAP32[(($1369)>>2)]=7;
 var $1370=(($1345+32)|0);
 var $1371=($1370>>>0)<($1327>>>0);
 if($1371){var $1372=$1369;label=313;break;}else{label=314;break;}
 case 313: 
 var $1372;
 var $1373=(($1372+4)|0);
 HEAP32[(($1373)>>2)]=7;
 var $1374=(($1372+8)|0);
 var $1375=$1374;
 var $1376=($1375>>>0)<($1327>>>0);
 if($1376){var $1372=$1373;label=313;break;}else{label=314;break;}
 case 314: 
 var $1377=($1345|0)==($1319|0);
 if($1377){label=338;break;}else{label=315;break;}
 case 315: 
 var $1379=$1345;
 var $1380=$887;
 var $1381=((($1379)-($1380))|0);
 var $1382=(($1319+$1381)|0);
 var $_sum3_i_i=((($1381)+(4))|0);
 var $1383=(($1319+$_sum3_i_i)|0);
 var $1384=$1383;
 var $1385=HEAP32[(($1384)>>2)];
 var $1386=$1385&-2;
 HEAP32[(($1384)>>2)]=$1386;
 var $1387=$1381|1;
 var $1388=(($887+4)|0);
 HEAP32[(($1388)>>2)]=$1387;
 var $1389=$1382;
 HEAP32[(($1389)>>2)]=$1381;
 var $1390=$1381>>>3;
 var $1391=($1381>>>0)<256;
 if($1391){label=316;break;}else{label=321;break;}
 case 316: 
 var $1393=$1390<<1;
 var $1394=((4224+($1393<<2))|0);
 var $1395=$1394;
 var $1396=HEAP32[((4184)>>2)];
 var $1397=1<<$1390;
 var $1398=$1396&$1397;
 var $1399=($1398|0)==0;
 if($1399){label=317;break;}else{label=318;break;}
 case 317: 
 var $1401=$1396|$1397;
 HEAP32[((4184)>>2)]=$1401;
 var $_sum11_pre_i_i=((($1393)+(2))|0);
 var $_pre_i_i=((4224+($_sum11_pre_i_i<<2))|0);
 var $F_0_i_i=$1395;var $_pre_phi_i_i=$_pre_i_i;label=320;break;
 case 318: 
 var $_sum12_i_i=((($1393)+(2))|0);
 var $1403=((4224+($_sum12_i_i<<2))|0);
 var $1404=HEAP32[(($1403)>>2)];
 var $1405=$1404;
 var $1406=HEAP32[((4200)>>2)];
 var $1407=($1405>>>0)<($1406>>>0);
 if($1407){label=319;break;}else{var $F_0_i_i=$1404;var $_pre_phi_i_i=$1403;label=320;break;}
 case 319: 
 _abort();
 throw "Reached an unreachable!";
 case 320: 
 var $_pre_phi_i_i;
 var $F_0_i_i;
 HEAP32[(($_pre_phi_i_i)>>2)]=$887;
 var $1410=(($F_0_i_i+12)|0);
 HEAP32[(($1410)>>2)]=$887;
 var $1411=(($887+8)|0);
 HEAP32[(($1411)>>2)]=$F_0_i_i;
 var $1412=(($887+12)|0);
 HEAP32[(($1412)>>2)]=$1395;
 label=338;break;
 case 321: 
 var $1414=$887;
 var $1415=$1381>>>8;
 var $1416=($1415|0)==0;
 if($1416){var $I1_0_i_i=0;label=324;break;}else{label=322;break;}
 case 322: 
 var $1418=($1381>>>0)>16777215;
 if($1418){var $I1_0_i_i=31;label=324;break;}else{label=323;break;}
 case 323: 
 var $1420=((($1415)+(1048320))|0);
 var $1421=$1420>>>16;
 var $1422=$1421&8;
 var $1423=$1415<<$1422;
 var $1424=((($1423)+(520192))|0);
 var $1425=$1424>>>16;
 var $1426=$1425&4;
 var $1427=$1426|$1422;
 var $1428=$1423<<$1426;
 var $1429=((($1428)+(245760))|0);
 var $1430=$1429>>>16;
 var $1431=$1430&2;
 var $1432=$1427|$1431;
 var $1433=(((14)-($1432))|0);
 var $1434=$1428<<$1431;
 var $1435=$1434>>>15;
 var $1436=((($1433)+($1435))|0);
 var $1437=$1436<<1;
 var $1438=((($1436)+(7))|0);
 var $1439=$1381>>>($1438>>>0);
 var $1440=$1439&1;
 var $1441=$1440|$1437;
 var $I1_0_i_i=$1441;label=324;break;
 case 324: 
 var $I1_0_i_i;
 var $1443=((4488+($I1_0_i_i<<2))|0);
 var $1444=(($887+28)|0);
 var $I1_0_c_i_i=$I1_0_i_i;
 HEAP32[(($1444)>>2)]=$I1_0_c_i_i;
 var $1445=(($887+20)|0);
 HEAP32[(($1445)>>2)]=0;
 var $1446=(($887+16)|0);
 HEAP32[(($1446)>>2)]=0;
 var $1447=HEAP32[((4188)>>2)];
 var $1448=1<<$I1_0_i_i;
 var $1449=$1447&$1448;
 var $1450=($1449|0)==0;
 if($1450){label=325;break;}else{label=326;break;}
 case 325: 
 var $1452=$1447|$1448;
 HEAP32[((4188)>>2)]=$1452;
 HEAP32[(($1443)>>2)]=$1414;
 var $1453=(($887+24)|0);
 var $_c_i_i=$1443;
 HEAP32[(($1453)>>2)]=$_c_i_i;
 var $1454=(($887+12)|0);
 HEAP32[(($1454)>>2)]=$887;
 var $1455=(($887+8)|0);
 HEAP32[(($1455)>>2)]=$887;
 label=338;break;
 case 326: 
 var $1457=HEAP32[(($1443)>>2)];
 var $1458=($I1_0_i_i|0)==31;
 if($1458){var $1463=0;label=328;break;}else{label=327;break;}
 case 327: 
 var $1460=$I1_0_i_i>>>1;
 var $1461=(((25)-($1460))|0);
 var $1463=$1461;label=328;break;
 case 328: 
 var $1463;
 var $1464=(($1457+4)|0);
 var $1465=HEAP32[(($1464)>>2)];
 var $1466=$1465&-8;
 var $1467=($1466|0)==($1381|0);
 if($1467){var $T_0_lcssa_i_i=$1457;label=335;break;}else{label=329;break;}
 case 329: 
 var $1468=$1381<<$1463;
 var $T_015_i_i=$1457;var $K2_016_i_i=$1468;label=331;break;
 case 330: 
 var $1470=$K2_016_i_i<<1;
 var $1471=(($1478+4)|0);
 var $1472=HEAP32[(($1471)>>2)];
 var $1473=$1472&-8;
 var $1474=($1473|0)==($1381|0);
 if($1474){var $T_0_lcssa_i_i=$1478;label=335;break;}else{var $T_015_i_i=$1478;var $K2_016_i_i=$1470;label=331;break;}
 case 331: 
 var $K2_016_i_i;
 var $T_015_i_i;
 var $1476=$K2_016_i_i>>>31;
 var $1477=(($T_015_i_i+16+($1476<<2))|0);
 var $1478=HEAP32[(($1477)>>2)];
 var $1479=($1478|0)==0;
 if($1479){label=332;break;}else{label=330;break;}
 case 332: 
 var $1481=$1477;
 var $1482=HEAP32[((4200)>>2)];
 var $1483=($1481>>>0)<($1482>>>0);
 if($1483){label=334;break;}else{label=333;break;}
 case 333: 
 HEAP32[(($1477)>>2)]=$1414;
 var $1485=(($887+24)|0);
 var $T_0_c8_i_i=$T_015_i_i;
 HEAP32[(($1485)>>2)]=$T_0_c8_i_i;
 var $1486=(($887+12)|0);
 HEAP32[(($1486)>>2)]=$887;
 var $1487=(($887+8)|0);
 HEAP32[(($1487)>>2)]=$887;
 label=338;break;
 case 334: 
 _abort();
 throw "Reached an unreachable!";
 case 335: 
 var $T_0_lcssa_i_i;
 var $1489=(($T_0_lcssa_i_i+8)|0);
 var $1490=HEAP32[(($1489)>>2)];
 var $1491=$T_0_lcssa_i_i;
 var $1492=HEAP32[((4200)>>2)];
 var $1493=($1491>>>0)>=($1492>>>0);
 var $1494=$1490;
 var $1495=($1494>>>0)>=($1492>>>0);
 var $or_cond_i_i=$1493&$1495;
 if($or_cond_i_i){label=336;break;}else{label=337;break;}
 case 336: 
 var $1497=(($1490+12)|0);
 HEAP32[(($1497)>>2)]=$1414;
 HEAP32[(($1489)>>2)]=$1414;
 var $1498=(($887+8)|0);
 var $_c7_i_i=$1490;
 HEAP32[(($1498)>>2)]=$_c7_i_i;
 var $1499=(($887+12)|0);
 var $T_0_c_i_i=$T_0_lcssa_i_i;
 HEAP32[(($1499)>>2)]=$T_0_c_i_i;
 var $1500=(($887+24)|0);
 HEAP32[(($1500)>>2)]=0;
 label=338;break;
 case 337: 
 _abort();
 throw "Reached an unreachable!";
 case 338: 
 var $1501=HEAP32[((4196)>>2)];
 var $1502=($1501>>>0)>($nb_0>>>0);
 if($1502){label=339;break;}else{label=340;break;}
 case 339: 
 var $1504=((($1501)-($nb_0))|0);
 HEAP32[((4196)>>2)]=$1504;
 var $1505=HEAP32[((4208)>>2)];
 var $1506=$1505;
 var $1507=(($1506+$nb_0)|0);
 var $1508=$1507;
 HEAP32[((4208)>>2)]=$1508;
 var $1509=$1504|1;
 var $_sum_i34=((($nb_0)+(4))|0);
 var $1510=(($1506+$_sum_i34)|0);
 var $1511=$1510;
 HEAP32[(($1511)>>2)]=$1509;
 var $1512=$nb_0|3;
 var $1513=(($1505+4)|0);
 HEAP32[(($1513)>>2)]=$1512;
 var $1514=(($1505+8)|0);
 var $1515=$1514;
 var $mem_0=$1515;label=341;break;
 case 340: 
 var $1516=___errno_location();
 HEAP32[(($1516)>>2)]=12;
 var $mem_0=0;label=341;break;
 case 341: 
 var $mem_0;
 return $mem_0;
  default: assert(0, "bad label: " + label);
 }

}
Module["_malloc"] = _malloc;

function _free($mem){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($mem|0)==0;
 if($1){label=140;break;}else{label=2;break;}
 case 2: 
 var $3=((($mem)-(8))|0);
 var $4=$3;
 var $5=HEAP32[((4200)>>2)];
 var $6=($3>>>0)<($5>>>0);
 if($6){label=139;break;}else{label=3;break;}
 case 3: 
 var $8=((($mem)-(4))|0);
 var $9=$8;
 var $10=HEAP32[(($9)>>2)];
 var $11=$10&3;
 var $12=($11|0)==1;
 if($12){label=139;break;}else{label=4;break;}
 case 4: 
 var $14=$10&-8;
 var $_sum=((($14)-(8))|0);
 var $15=(($mem+$_sum)|0);
 var $16=$15;
 var $17=$10&1;
 var $18=($17|0)==0;
 if($18){label=5;break;}else{var $p_0=$4;var $psize_0=$14;label=56;break;}
 case 5: 
 var $20=$3;
 var $21=HEAP32[(($20)>>2)];
 var $22=($11|0)==0;
 if($22){label=140;break;}else{label=6;break;}
 case 6: 
 var $_sum3=(((-8)-($21))|0);
 var $24=(($mem+$_sum3)|0);
 var $25=$24;
 var $26=((($21)+($14))|0);
 var $27=($24>>>0)<($5>>>0);
 if($27){label=139;break;}else{label=7;break;}
 case 7: 
 var $29=HEAP32[((4204)>>2)];
 var $30=($25|0)==($29|0);
 if($30){label=54;break;}else{label=8;break;}
 case 8: 
 var $32=$21>>>3;
 var $33=($21>>>0)<256;
 if($33){label=9;break;}else{label=21;break;}
 case 9: 
 var $_sum47=((($_sum3)+(8))|0);
 var $35=(($mem+$_sum47)|0);
 var $36=$35;
 var $37=HEAP32[(($36)>>2)];
 var $_sum48=((($_sum3)+(12))|0);
 var $38=(($mem+$_sum48)|0);
 var $39=$38;
 var $40=HEAP32[(($39)>>2)];
 var $41=$32<<1;
 var $42=((4224+($41<<2))|0);
 var $43=$42;
 var $44=($37|0)==($43|0);
 if($44){label=12;break;}else{label=10;break;}
 case 10: 
 var $46=$37;
 var $47=($46>>>0)<($5>>>0);
 if($47){label=20;break;}else{label=11;break;}
 case 11: 
 var $49=(($37+12)|0);
 var $50=HEAP32[(($49)>>2)];
 var $51=($50|0)==($25|0);
 if($51){label=12;break;}else{label=20;break;}
 case 12: 
 var $52=($40|0)==($37|0);
 if($52){label=13;break;}else{label=14;break;}
 case 13: 
 var $54=1<<$32;
 var $55=$54^-1;
 var $56=HEAP32[((4184)>>2)];
 var $57=$56&$55;
 HEAP32[((4184)>>2)]=$57;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 14: 
 var $59=($40|0)==($43|0);
 if($59){label=15;break;}else{label=16;break;}
 case 15: 
 var $_pre82=(($40+8)|0);
 var $_pre_phi83=$_pre82;label=18;break;
 case 16: 
 var $61=$40;
 var $62=($61>>>0)<($5>>>0);
 if($62){label=19;break;}else{label=17;break;}
 case 17: 
 var $64=(($40+8)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=($65|0)==($25|0);
 if($66){var $_pre_phi83=$64;label=18;break;}else{label=19;break;}
 case 18: 
 var $_pre_phi83;
 var $67=(($37+12)|0);
 HEAP32[(($67)>>2)]=$40;
 HEAP32[(($_pre_phi83)>>2)]=$37;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 19: 
 _abort();
 throw "Reached an unreachable!";
 case 20: 
 _abort();
 throw "Reached an unreachable!";
 case 21: 
 var $69=$24;
 var $_sum37=((($_sum3)+(24))|0);
 var $70=(($mem+$_sum37)|0);
 var $71=$70;
 var $72=HEAP32[(($71)>>2)];
 var $_sum38=((($_sum3)+(12))|0);
 var $73=(($mem+$_sum38)|0);
 var $74=$73;
 var $75=HEAP32[(($74)>>2)];
 var $76=($75|0)==($69|0);
 if($76){label=27;break;}else{label=22;break;}
 case 22: 
 var $_sum44=((($_sum3)+(8))|0);
 var $78=(($mem+$_sum44)|0);
 var $79=$78;
 var $80=HEAP32[(($79)>>2)];
 var $81=$80;
 var $82=($81>>>0)<($5>>>0);
 if($82){label=26;break;}else{label=23;break;}
 case 23: 
 var $84=(($80+12)|0);
 var $85=HEAP32[(($84)>>2)];
 var $86=($85|0)==($69|0);
 if($86){label=24;break;}else{label=26;break;}
 case 24: 
 var $88=(($75+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($89|0)==($69|0);
 if($90){label=25;break;}else{label=26;break;}
 case 25: 
 HEAP32[(($84)>>2)]=$75;
 HEAP32[(($88)>>2)]=$80;
 var $R_1=$75;label=34;break;
 case 26: 
 _abort();
 throw "Reached an unreachable!";
 case 27: 
 var $_sum40=((($_sum3)+(20))|0);
 var $93=(($mem+$_sum40)|0);
 var $94=$93;
 var $95=HEAP32[(($94)>>2)];
 var $96=($95|0)==0;
 if($96){label=28;break;}else{var $R_0=$95;var $RP_0=$94;label=29;break;}
 case 28: 
 var $_sum39=((($_sum3)+(16))|0);
 var $98=(($mem+$_sum39)|0);
 var $99=$98;
 var $100=HEAP32[(($99)>>2)];
 var $101=($100|0)==0;
 if($101){var $R_1=0;label=34;break;}else{var $R_0=$100;var $RP_0=$99;label=29;break;}
 case 29: 
 var $RP_0;
 var $R_0;
 var $102=(($R_0+20)|0);
 var $103=HEAP32[(($102)>>2)];
 var $104=($103|0)==0;
 if($104){label=30;break;}else{var $R_0=$103;var $RP_0=$102;label=29;break;}
 case 30: 
 var $106=(($R_0+16)|0);
 var $107=HEAP32[(($106)>>2)];
 var $108=($107|0)==0;
 if($108){label=31;break;}else{var $R_0=$107;var $RP_0=$106;label=29;break;}
 case 31: 
 var $110=$RP_0;
 var $111=($110>>>0)<($5>>>0);
 if($111){label=33;break;}else{label=32;break;}
 case 32: 
 HEAP32[(($RP_0)>>2)]=0;
 var $R_1=$R_0;label=34;break;
 case 33: 
 _abort();
 throw "Reached an unreachable!";
 case 34: 
 var $R_1;
 var $115=($72|0)==0;
 if($115){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=35;break;}
 case 35: 
 var $_sum41=((($_sum3)+(28))|0);
 var $117=(($mem+$_sum41)|0);
 var $118=$117;
 var $119=HEAP32[(($118)>>2)];
 var $120=((4488+($119<<2))|0);
 var $121=HEAP32[(($120)>>2)];
 var $122=($69|0)==($121|0);
 if($122){label=36;break;}else{label=38;break;}
 case 36: 
 HEAP32[(($120)>>2)]=$R_1;
 var $cond=($R_1|0)==0;
 if($cond){label=37;break;}else{label=44;break;}
 case 37: 
 var $124=1<<$119;
 var $125=$124^-1;
 var $126=HEAP32[((4188)>>2)];
 var $127=$126&$125;
 HEAP32[((4188)>>2)]=$127;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 38: 
 var $129=$72;
 var $130=HEAP32[((4200)>>2)];
 var $131=($129>>>0)<($130>>>0);
 if($131){label=42;break;}else{label=39;break;}
 case 39: 
 var $133=(($72+16)|0);
 var $134=HEAP32[(($133)>>2)];
 var $135=($134|0)==($69|0);
 if($135){label=40;break;}else{label=41;break;}
 case 40: 
 HEAP32[(($133)>>2)]=$R_1;
 label=43;break;
 case 41: 
 var $138=(($72+20)|0);
 HEAP32[(($138)>>2)]=$R_1;
 label=43;break;
 case 42: 
 _abort();
 throw "Reached an unreachable!";
 case 43: 
 var $141=($R_1|0)==0;
 if($141){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=44;break;}
 case 44: 
 var $143=$R_1;
 var $144=HEAP32[((4200)>>2)];
 var $145=($143>>>0)<($144>>>0);
 if($145){label=53;break;}else{label=45;break;}
 case 45: 
 var $147=(($R_1+24)|0);
 HEAP32[(($147)>>2)]=$72;
 var $_sum42=((($_sum3)+(16))|0);
 var $148=(($mem+$_sum42)|0);
 var $149=$148;
 var $150=HEAP32[(($149)>>2)];
 var $151=($150|0)==0;
 if($151){label=49;break;}else{label=46;break;}
 case 46: 
 var $153=$150;
 var $154=($153>>>0)<($144>>>0);
 if($154){label=48;break;}else{label=47;break;}
 case 47: 
 var $156=(($R_1+16)|0);
 HEAP32[(($156)>>2)]=$150;
 var $157=(($150+24)|0);
 HEAP32[(($157)>>2)]=$R_1;
 label=49;break;
 case 48: 
 _abort();
 throw "Reached an unreachable!";
 case 49: 
 var $_sum43=((($_sum3)+(20))|0);
 var $160=(($mem+$_sum43)|0);
 var $161=$160;
 var $162=HEAP32[(($161)>>2)];
 var $163=($162|0)==0;
 if($163){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=50;break;}
 case 50: 
 var $165=$162;
 var $166=HEAP32[((4200)>>2)];
 var $167=($165>>>0)<($166>>>0);
 if($167){label=52;break;}else{label=51;break;}
 case 51: 
 var $169=(($R_1+20)|0);
 HEAP32[(($169)>>2)]=$162;
 var $170=(($162+24)|0);
 HEAP32[(($170)>>2)]=$R_1;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 52: 
 _abort();
 throw "Reached an unreachable!";
 case 53: 
 _abort();
 throw "Reached an unreachable!";
 case 54: 
 var $_sum4=((($14)-(4))|0);
 var $174=(($mem+$_sum4)|0);
 var $175=$174;
 var $176=HEAP32[(($175)>>2)];
 var $177=$176&3;
 var $178=($177|0)==3;
 if($178){label=55;break;}else{var $p_0=$25;var $psize_0=$26;label=56;break;}
 case 55: 
 HEAP32[((4192)>>2)]=$26;
 var $180=$176&-2;
 HEAP32[(($175)>>2)]=$180;
 var $181=$26|1;
 var $_sum35=((($_sum3)+(4))|0);
 var $182=(($mem+$_sum35)|0);
 var $183=$182;
 HEAP32[(($183)>>2)]=$181;
 var $184=$15;
 HEAP32[(($184)>>2)]=$26;
 label=140;break;
 case 56: 
 var $psize_0;
 var $p_0;
 var $186=$p_0;
 var $187=($186>>>0)<($15>>>0);
 if($187){label=57;break;}else{label=139;break;}
 case 57: 
 var $_sum34=((($14)-(4))|0);
 var $189=(($mem+$_sum34)|0);
 var $190=$189;
 var $191=HEAP32[(($190)>>2)];
 var $192=$191&1;
 var $phitmp=($192|0)==0;
 if($phitmp){label=139;break;}else{label=58;break;}
 case 58: 
 var $194=$191&2;
 var $195=($194|0)==0;
 if($195){label=59;break;}else{label=112;break;}
 case 59: 
 var $197=HEAP32[((4208)>>2)];
 var $198=($16|0)==($197|0);
 if($198){label=60;break;}else{label=62;break;}
 case 60: 
 var $200=HEAP32[((4196)>>2)];
 var $201=((($200)+($psize_0))|0);
 HEAP32[((4196)>>2)]=$201;
 HEAP32[((4208)>>2)]=$p_0;
 var $202=$201|1;
 var $203=(($p_0+4)|0);
 HEAP32[(($203)>>2)]=$202;
 var $204=HEAP32[((4204)>>2)];
 var $205=($p_0|0)==($204|0);
 if($205){label=61;break;}else{label=140;break;}
 case 61: 
 HEAP32[((4204)>>2)]=0;
 HEAP32[((4192)>>2)]=0;
 label=140;break;
 case 62: 
 var $208=HEAP32[((4204)>>2)];
 var $209=($16|0)==($208|0);
 if($209){label=63;break;}else{label=64;break;}
 case 63: 
 var $211=HEAP32[((4192)>>2)];
 var $212=((($211)+($psize_0))|0);
 HEAP32[((4192)>>2)]=$212;
 HEAP32[((4204)>>2)]=$p_0;
 var $213=$212|1;
 var $214=(($p_0+4)|0);
 HEAP32[(($214)>>2)]=$213;
 var $215=(($186+$212)|0);
 var $216=$215;
 HEAP32[(($216)>>2)]=$212;
 label=140;break;
 case 64: 
 var $218=$191&-8;
 var $219=((($218)+($psize_0))|0);
 var $220=$191>>>3;
 var $221=($191>>>0)<256;
 if($221){label=65;break;}else{label=77;break;}
 case 65: 
 var $223=(($mem+$14)|0);
 var $224=$223;
 var $225=HEAP32[(($224)>>2)];
 var $_sum2829=$14|4;
 var $226=(($mem+$_sum2829)|0);
 var $227=$226;
 var $228=HEAP32[(($227)>>2)];
 var $229=$220<<1;
 var $230=((4224+($229<<2))|0);
 var $231=$230;
 var $232=($225|0)==($231|0);
 if($232){label=68;break;}else{label=66;break;}
 case 66: 
 var $234=$225;
 var $235=HEAP32[((4200)>>2)];
 var $236=($234>>>0)<($235>>>0);
 if($236){label=76;break;}else{label=67;break;}
 case 67: 
 var $238=(($225+12)|0);
 var $239=HEAP32[(($238)>>2)];
 var $240=($239|0)==($16|0);
 if($240){label=68;break;}else{label=76;break;}
 case 68: 
 var $241=($228|0)==($225|0);
 if($241){label=69;break;}else{label=70;break;}
 case 69: 
 var $243=1<<$220;
 var $244=$243^-1;
 var $245=HEAP32[((4184)>>2)];
 var $246=$245&$244;
 HEAP32[((4184)>>2)]=$246;
 label=110;break;
 case 70: 
 var $248=($228|0)==($231|0);
 if($248){label=71;break;}else{label=72;break;}
 case 71: 
 var $_pre80=(($228+8)|0);
 var $_pre_phi81=$_pre80;label=74;break;
 case 72: 
 var $250=$228;
 var $251=HEAP32[((4200)>>2)];
 var $252=($250>>>0)<($251>>>0);
 if($252){label=75;break;}else{label=73;break;}
 case 73: 
 var $254=(($228+8)|0);
 var $255=HEAP32[(($254)>>2)];
 var $256=($255|0)==($16|0);
 if($256){var $_pre_phi81=$254;label=74;break;}else{label=75;break;}
 case 74: 
 var $_pre_phi81;
 var $257=(($225+12)|0);
 HEAP32[(($257)>>2)]=$228;
 HEAP32[(($_pre_phi81)>>2)]=$225;
 label=110;break;
 case 75: 
 _abort();
 throw "Reached an unreachable!";
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $259=$15;
 var $_sum6=((($14)+(16))|0);
 var $260=(($mem+$_sum6)|0);
 var $261=$260;
 var $262=HEAP32[(($261)>>2)];
 var $_sum78=$14|4;
 var $263=(($mem+$_sum78)|0);
 var $264=$263;
 var $265=HEAP32[(($264)>>2)];
 var $266=($265|0)==($259|0);
 if($266){label=83;break;}else{label=78;break;}
 case 78: 
 var $268=(($mem+$14)|0);
 var $269=$268;
 var $270=HEAP32[(($269)>>2)];
 var $271=$270;
 var $272=HEAP32[((4200)>>2)];
 var $273=($271>>>0)<($272>>>0);
 if($273){label=82;break;}else{label=79;break;}
 case 79: 
 var $275=(($270+12)|0);
 var $276=HEAP32[(($275)>>2)];
 var $277=($276|0)==($259|0);
 if($277){label=80;break;}else{label=82;break;}
 case 80: 
 var $279=(($265+8)|0);
 var $280=HEAP32[(($279)>>2)];
 var $281=($280|0)==($259|0);
 if($281){label=81;break;}else{label=82;break;}
 case 81: 
 HEAP32[(($275)>>2)]=$265;
 HEAP32[(($279)>>2)]=$270;
 var $R7_1=$265;label=90;break;
 case 82: 
 _abort();
 throw "Reached an unreachable!";
 case 83: 
 var $_sum10=((($14)+(12))|0);
 var $284=(($mem+$_sum10)|0);
 var $285=$284;
 var $286=HEAP32[(($285)>>2)];
 var $287=($286|0)==0;
 if($287){label=84;break;}else{var $R7_0=$286;var $RP9_0=$285;label=85;break;}
 case 84: 
 var $_sum9=((($14)+(8))|0);
 var $289=(($mem+$_sum9)|0);
 var $290=$289;
 var $291=HEAP32[(($290)>>2)];
 var $292=($291|0)==0;
 if($292){var $R7_1=0;label=90;break;}else{var $R7_0=$291;var $RP9_0=$290;label=85;break;}
 case 85: 
 var $RP9_0;
 var $R7_0;
 var $293=(($R7_0+20)|0);
 var $294=HEAP32[(($293)>>2)];
 var $295=($294|0)==0;
 if($295){label=86;break;}else{var $R7_0=$294;var $RP9_0=$293;label=85;break;}
 case 86: 
 var $297=(($R7_0+16)|0);
 var $298=HEAP32[(($297)>>2)];
 var $299=($298|0)==0;
 if($299){label=87;break;}else{var $R7_0=$298;var $RP9_0=$297;label=85;break;}
 case 87: 
 var $301=$RP9_0;
 var $302=HEAP32[((4200)>>2)];
 var $303=($301>>>0)<($302>>>0);
 if($303){label=89;break;}else{label=88;break;}
 case 88: 
 HEAP32[(($RP9_0)>>2)]=0;
 var $R7_1=$R7_0;label=90;break;
 case 89: 
 _abort();
 throw "Reached an unreachable!";
 case 90: 
 var $R7_1;
 var $307=($262|0)==0;
 if($307){label=110;break;}else{label=91;break;}
 case 91: 
 var $_sum21=((($14)+(20))|0);
 var $309=(($mem+$_sum21)|0);
 var $310=$309;
 var $311=HEAP32[(($310)>>2)];
 var $312=((4488+($311<<2))|0);
 var $313=HEAP32[(($312)>>2)];
 var $314=($259|0)==($313|0);
 if($314){label=92;break;}else{label=94;break;}
 case 92: 
 HEAP32[(($312)>>2)]=$R7_1;
 var $cond69=($R7_1|0)==0;
 if($cond69){label=93;break;}else{label=100;break;}
 case 93: 
 var $316=1<<$311;
 var $317=$316^-1;
 var $318=HEAP32[((4188)>>2)];
 var $319=$318&$317;
 HEAP32[((4188)>>2)]=$319;
 label=110;break;
 case 94: 
 var $321=$262;
 var $322=HEAP32[((4200)>>2)];
 var $323=($321>>>0)<($322>>>0);
 if($323){label=98;break;}else{label=95;break;}
 case 95: 
 var $325=(($262+16)|0);
 var $326=HEAP32[(($325)>>2)];
 var $327=($326|0)==($259|0);
 if($327){label=96;break;}else{label=97;break;}
 case 96: 
 HEAP32[(($325)>>2)]=$R7_1;
 label=99;break;
 case 97: 
 var $330=(($262+20)|0);
 HEAP32[(($330)>>2)]=$R7_1;
 label=99;break;
 case 98: 
 _abort();
 throw "Reached an unreachable!";
 case 99: 
 var $333=($R7_1|0)==0;
 if($333){label=110;break;}else{label=100;break;}
 case 100: 
 var $335=$R7_1;
 var $336=HEAP32[((4200)>>2)];
 var $337=($335>>>0)<($336>>>0);
 if($337){label=109;break;}else{label=101;break;}
 case 101: 
 var $339=(($R7_1+24)|0);
 HEAP32[(($339)>>2)]=$262;
 var $_sum22=((($14)+(8))|0);
 var $340=(($mem+$_sum22)|0);
 var $341=$340;
 var $342=HEAP32[(($341)>>2)];
 var $343=($342|0)==0;
 if($343){label=105;break;}else{label=102;break;}
 case 102: 
 var $345=$342;
 var $346=($345>>>0)<($336>>>0);
 if($346){label=104;break;}else{label=103;break;}
 case 103: 
 var $348=(($R7_1+16)|0);
 HEAP32[(($348)>>2)]=$342;
 var $349=(($342+24)|0);
 HEAP32[(($349)>>2)]=$R7_1;
 label=105;break;
 case 104: 
 _abort();
 throw "Reached an unreachable!";
 case 105: 
 var $_sum23=((($14)+(12))|0);
 var $352=(($mem+$_sum23)|0);
 var $353=$352;
 var $354=HEAP32[(($353)>>2)];
 var $355=($354|0)==0;
 if($355){label=110;break;}else{label=106;break;}
 case 106: 
 var $357=$354;
 var $358=HEAP32[((4200)>>2)];
 var $359=($357>>>0)<($358>>>0);
 if($359){label=108;break;}else{label=107;break;}
 case 107: 
 var $361=(($R7_1+20)|0);
 HEAP32[(($361)>>2)]=$354;
 var $362=(($354+24)|0);
 HEAP32[(($362)>>2)]=$R7_1;
 label=110;break;
 case 108: 
 _abort();
 throw "Reached an unreachable!";
 case 109: 
 _abort();
 throw "Reached an unreachable!";
 case 110: 
 var $366=$219|1;
 var $367=(($p_0+4)|0);
 HEAP32[(($367)>>2)]=$366;
 var $368=(($186+$219)|0);
 var $369=$368;
 HEAP32[(($369)>>2)]=$219;
 var $370=HEAP32[((4204)>>2)];
 var $371=($p_0|0)==($370|0);
 if($371){label=111;break;}else{var $psize_1=$219;label=113;break;}
 case 111: 
 HEAP32[((4192)>>2)]=$219;
 label=140;break;
 case 112: 
 var $374=$191&-2;
 HEAP32[(($190)>>2)]=$374;
 var $375=$psize_0|1;
 var $376=(($p_0+4)|0);
 HEAP32[(($376)>>2)]=$375;
 var $377=(($186+$psize_0)|0);
 var $378=$377;
 HEAP32[(($378)>>2)]=$psize_0;
 var $psize_1=$psize_0;label=113;break;
 case 113: 
 var $psize_1;
 var $380=$psize_1>>>3;
 var $381=($psize_1>>>0)<256;
 if($381){label=114;break;}else{label=119;break;}
 case 114: 
 var $383=$380<<1;
 var $384=((4224+($383<<2))|0);
 var $385=$384;
 var $386=HEAP32[((4184)>>2)];
 var $387=1<<$380;
 var $388=$386&$387;
 var $389=($388|0)==0;
 if($389){label=115;break;}else{label=116;break;}
 case 115: 
 var $391=$386|$387;
 HEAP32[((4184)>>2)]=$391;
 var $_sum19_pre=((($383)+(2))|0);
 var $_pre=((4224+($_sum19_pre<<2))|0);
 var $F16_0=$385;var $_pre_phi=$_pre;label=118;break;
 case 116: 
 var $_sum20=((($383)+(2))|0);
 var $393=((4224+($_sum20<<2))|0);
 var $394=HEAP32[(($393)>>2)];
 var $395=$394;
 var $396=HEAP32[((4200)>>2)];
 var $397=($395>>>0)<($396>>>0);
 if($397){label=117;break;}else{var $F16_0=$394;var $_pre_phi=$393;label=118;break;}
 case 117: 
 _abort();
 throw "Reached an unreachable!";
 case 118: 
 var $_pre_phi;
 var $F16_0;
 HEAP32[(($_pre_phi)>>2)]=$p_0;
 var $400=(($F16_0+12)|0);
 HEAP32[(($400)>>2)]=$p_0;
 var $401=(($p_0+8)|0);
 HEAP32[(($401)>>2)]=$F16_0;
 var $402=(($p_0+12)|0);
 HEAP32[(($402)>>2)]=$385;
 label=140;break;
 case 119: 
 var $404=$p_0;
 var $405=$psize_1>>>8;
 var $406=($405|0)==0;
 if($406){var $I18_0=0;label=122;break;}else{label=120;break;}
 case 120: 
 var $408=($psize_1>>>0)>16777215;
 if($408){var $I18_0=31;label=122;break;}else{label=121;break;}
 case 121: 
 var $410=((($405)+(1048320))|0);
 var $411=$410>>>16;
 var $412=$411&8;
 var $413=$405<<$412;
 var $414=((($413)+(520192))|0);
 var $415=$414>>>16;
 var $416=$415&4;
 var $417=$416|$412;
 var $418=$413<<$416;
 var $419=((($418)+(245760))|0);
 var $420=$419>>>16;
 var $421=$420&2;
 var $422=$417|$421;
 var $423=(((14)-($422))|0);
 var $424=$418<<$421;
 var $425=$424>>>15;
 var $426=((($423)+($425))|0);
 var $427=$426<<1;
 var $428=((($426)+(7))|0);
 var $429=$psize_1>>>($428>>>0);
 var $430=$429&1;
 var $431=$430|$427;
 var $I18_0=$431;label=122;break;
 case 122: 
 var $I18_0;
 var $433=((4488+($I18_0<<2))|0);
 var $434=(($p_0+28)|0);
 var $I18_0_c=$I18_0;
 HEAP32[(($434)>>2)]=$I18_0_c;
 var $435=(($p_0+20)|0);
 HEAP32[(($435)>>2)]=0;
 var $436=(($p_0+16)|0);
 HEAP32[(($436)>>2)]=0;
 var $437=HEAP32[((4188)>>2)];
 var $438=1<<$I18_0;
 var $439=$437&$438;
 var $440=($439|0)==0;
 if($440){label=123;break;}else{label=124;break;}
 case 123: 
 var $442=$437|$438;
 HEAP32[((4188)>>2)]=$442;
 HEAP32[(($433)>>2)]=$404;
 var $443=(($p_0+24)|0);
 var $_c=$433;
 HEAP32[(($443)>>2)]=$_c;
 var $444=(($p_0+12)|0);
 HEAP32[(($444)>>2)]=$p_0;
 var $445=(($p_0+8)|0);
 HEAP32[(($445)>>2)]=$p_0;
 label=136;break;
 case 124: 
 var $447=HEAP32[(($433)>>2)];
 var $448=($I18_0|0)==31;
 if($448){var $453=0;label=126;break;}else{label=125;break;}
 case 125: 
 var $450=$I18_0>>>1;
 var $451=(((25)-($450))|0);
 var $453=$451;label=126;break;
 case 126: 
 var $453;
 var $454=(($447+4)|0);
 var $455=HEAP32[(($454)>>2)];
 var $456=$455&-8;
 var $457=($456|0)==($psize_1|0);
 if($457){var $T_0_lcssa=$447;label=133;break;}else{label=127;break;}
 case 127: 
 var $458=$psize_1<<$453;
 var $T_072=$447;var $K19_073=$458;label=129;break;
 case 128: 
 var $460=$K19_073<<1;
 var $461=(($468+4)|0);
 var $462=HEAP32[(($461)>>2)];
 var $463=$462&-8;
 var $464=($463|0)==($psize_1|0);
 if($464){var $T_0_lcssa=$468;label=133;break;}else{var $T_072=$468;var $K19_073=$460;label=129;break;}
 case 129: 
 var $K19_073;
 var $T_072;
 var $466=$K19_073>>>31;
 var $467=(($T_072+16+($466<<2))|0);
 var $468=HEAP32[(($467)>>2)];
 var $469=($468|0)==0;
 if($469){label=130;break;}else{label=128;break;}
 case 130: 
 var $471=$467;
 var $472=HEAP32[((4200)>>2)];
 var $473=($471>>>0)<($472>>>0);
 if($473){label=132;break;}else{label=131;break;}
 case 131: 
 HEAP32[(($467)>>2)]=$404;
 var $475=(($p_0+24)|0);
 var $T_0_c16=$T_072;
 HEAP32[(($475)>>2)]=$T_0_c16;
 var $476=(($p_0+12)|0);
 HEAP32[(($476)>>2)]=$p_0;
 var $477=(($p_0+8)|0);
 HEAP32[(($477)>>2)]=$p_0;
 label=136;break;
 case 132: 
 _abort();
 throw "Reached an unreachable!";
 case 133: 
 var $T_0_lcssa;
 var $479=(($T_0_lcssa+8)|0);
 var $480=HEAP32[(($479)>>2)];
 var $481=$T_0_lcssa;
 var $482=HEAP32[((4200)>>2)];
 var $483=($481>>>0)>=($482>>>0);
 var $484=$480;
 var $485=($484>>>0)>=($482>>>0);
 var $or_cond=$483&$485;
 if($or_cond){label=134;break;}else{label=135;break;}
 case 134: 
 var $487=(($480+12)|0);
 HEAP32[(($487)>>2)]=$404;
 HEAP32[(($479)>>2)]=$404;
 var $488=(($p_0+8)|0);
 var $_c15=$480;
 HEAP32[(($488)>>2)]=$_c15;
 var $489=(($p_0+12)|0);
 var $T_0_c=$T_0_lcssa;
 HEAP32[(($489)>>2)]=$T_0_c;
 var $490=(($p_0+24)|0);
 HEAP32[(($490)>>2)]=0;
 label=136;break;
 case 135: 
 _abort();
 throw "Reached an unreachable!";
 case 136: 
 var $492=HEAP32[((4216)>>2)];
 var $493=((($492)-(1))|0);
 HEAP32[((4216)>>2)]=$493;
 var $494=($493|0)==0;
 if($494){var $sp_0_in_i=4640;label=137;break;}else{label=140;break;}
 case 137: 
 var $sp_0_in_i;
 var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
 var $495=($sp_0_i|0)==0;
 var $496=(($sp_0_i+8)|0);
 if($495){label=138;break;}else{var $sp_0_in_i=$496;label=137;break;}
 case 138: 
 HEAP32[((4216)>>2)]=-1;
 label=140;break;
 case 139: 
 _abort();
 throw "Reached an unreachable!";
 case 140: 
 return;
  default: assert(0, "bad label: " + label);
 }

}
Module["_free"] = _free;

function _memcmp($vl,$vr,$n){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($n|0)==0;
 if($1){var $14=0;label=5;break;}else{var $_02=$n;var $l_03=$vl;var $r_04=$vr;label=2;break;}
 case 2: 
 var $r_04;
 var $l_03;
 var $_02;
 var $2=HEAP8[(($l_03)>>0)];
 var $3=HEAP8[(($r_04)>>0)];
 var $4=(($2<<24)>>24)==(($3<<24)>>24);
 if($4){label=3;break;}else{label=4;break;}
 case 3: 
 var $6=((($_02)-(1))|0);
 var $7=(($l_03+1)|0);
 var $8=(($r_04+1)|0);
 var $9=($6|0)==0;
 if($9){var $14=0;label=5;break;}else{var $_02=$6;var $l_03=$7;var $r_04=$8;label=2;break;}
 case 4: 
 var $11=($2&255);
 var $12=($3&255);
 var $13=((($11)-($12))|0);
 var $14=$13;label=5;break;
 case 5: 
 var $14;
 return $14;
  default: assert(0, "bad label: " + label);
 }

}



// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (typeof Module['locateFile'] === 'function') {
    memoryInitializer = Module['locateFile'](memoryInitializer);
  } else if (Module['memoryInitializerPrefixURL']) {
    memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      for (var i = 0; i < data.length; i++) {
        assert(HEAPU8[STATIC_BASE + i] === 0, "area for memory initializer should not have been touched before it's loaded");
      }
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram']), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    exit(ret);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return; 

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  if (Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') called, but noExitRuntime, so not exiting');
    return;
  }

  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  if (ENVIRONMENT_IS_NODE) {
    // Work around a node.js bug where stdout buffer is not flushed at process exit:
    // Instead of process.exit() directly, wait for stdout flush event.
    // See https://github.com/joyent/node/issues/1669 and https://github.com/kripken/emscripten/issues/2582
    // Workaround is based on https://github.com/RReverser/acorn/commit/50ab143cecc9ed71a2d66f78b4aec3bb2e9844f6
    process['stdout']['once']('drain', function () {
      process['exit'](status);
    });
    console.log(' '); // Make sure to print something to force the drain event to occur, in case the stdout buffer was empty.
    // Work around another node bug where sometimes 'drain' is never fired - make another effort
    // to emit the exit status, after a significant delay (if node hasn't fired drain by then, give up)
    setTimeout(function() {
      process['exit'](status);
    }, 500);
  } else
  if (ENVIRONMENT_IS_SHELL && typeof quit === 'function') {
    quit(status);
  }
  // if we reach here, we must throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



