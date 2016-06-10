
PROJECT_DIR=$(shell echo `pwd`)
MICROFLO_SOURCE_DIR=$(shell echo `pwd`/node_modules/microflo/microflo)
BUILD_DIR=./build
MICROFLO=./node_modules/.bin/microflo
GRAPH=./examples/blink.fbp

COMMON_CFLAGS:=-I. -I${MICROFLO_SOURCE_DIR} -Wall -Wno-error=unused-variable

EMSCRIPTEN_EXPORTS='["_emscripten_runtime_new", "_emscripten_runtime_free", "_emscripten_runtime_run", "_emscripten_runtime_send", "_emscripten_runtime_setup"]'

build-emscripten:
	rm -rf $(BUILD_DIR)/emscripten
	mkdir -p $(BUILD_DIR)/emscripten
	$(MICROFLO) generate $(GRAPH) $(BUILD_DIR)/emscripten --target emscripten ${LIBRARYOPTION}
	cd $(BUILD_DIR)/emscripten && emcc -o microflo-runtime.html --pre-js ${PROJECT_DIR}/src/emscripten-pre.js main.cpp $(COMMON_CFLAGS) -DMICROFLO_MESSAGE_LIMIT=200 -s NO_DYNAMIC_EXECUTION=1 -s EXPORTED_FUNCTIONS=$(EMSCRIPTEN_EXPORTS) -s RESERVED_FUNCTION_POINTERS=10

release-emscripten: build-emscripten
    # TODO: package?

release: release-emscripten

check: release
