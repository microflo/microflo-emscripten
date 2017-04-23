
PROJECT_DIR=$(shell echo `pwd`)
MICROFLO_SOURCE_DIR=$(shell echo `pwd`/node_modules/microflo/microflo)
BUILD_DIR=./dist
MICROFLO=./node_modules/.bin/microflo
GRAPH=./examples/blink.fbp
TARGET=microflo-runtime.js

ifndef LIBRARY
LIBRARY=$(shell echo `pwd`/node_modules/microflo-core/components/emscripten-library.json)
endif

ifdef LIBRARY
LIBRARYOPTION=--library $(LIBRARY)
endif

EMSCRIPTEN_EXPORTS='["_emscripten_runtime_new", "_emscripten_runtime_free", "_emscripten_runtime_run", "_emscripten_runtime_send", "_emscripten_runtime_setup"]'

COMMON_CFLAGS:=-I. -I${PROJECT_DIR}/src -I${MICROFLO_SOURCE_DIR} -Wall -Wno-error=unused-variable
EMSCRIPTEN_CFLAGS:=-DMICROFLO_MESSAGE_LIMIT=200 -s NO_DYNAMIC_EXECUTION=1 -s EXPORTED_FUNCTIONS=$(EMSCRIPTEN_EXPORTS) -s RESERVED_FUNCTION_POINTERS=10

build-emscripten:
	rm -rf $(BUILD_DIR)
	mkdir -p $(BUILD_DIR)
	$(MICROFLO) generate $(GRAPH) $(BUILD_DIR)/main.cpp --target emscripten ${LIBRARYOPTION}
	cd $(BUILD_DIR) && echo '#include "emscripten.hpp"' >> main.cpp # HAAACK
	cd $(BUILD_DIR) && emcc -o $(TARGET) --pre-js ${PROJECT_DIR}/src/emscripten-pre.js main.cpp $(COMMON_CFLAGS) ${EMSCRIPTEN_CFLAGS}
	test -e $(BUILD_DIR)/$(TARGET)
	node fix-nodejs-check.js dist/microflo-runtime.js

release-emscripten: build-emscripten
    # TODO: package?

hack:
	cp library.json `pwd`/node_modules/microflo-core/components/emscripten-library.json

release: hack release-emscripten

check: release
	./node_modules/.bin/mocha --compilers=.coffee:coffee-script/register test/*.coffee
