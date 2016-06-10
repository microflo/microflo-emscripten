
BUILD_DIR=./build
MICROFLO=./node_modules/.bin/microflo

EMSCRIPTEN_EXPORTS='["_emscripten_runtime_new", "_emscripten_runtime_free", "_emscripten_runtime_run", "_emscripten_runtime_send", "_emscripten_runtime_setup"]'

build-emscripten:
	rm -rf $(BUILD_DIR)/emscripten
	mkdir -p $(BUILD_DIR)/emscripten
	$(MICROFLO) generate $(GRAPH) $(BUILD_DIR)/emscripten --target emscripten ${LIBRARYOPTION}
	cd $(BUILD_DIR)/emscripten && emcc -o microflo-runtime.html --pre-js $(MICROFLO_SOURCE_DIR)/emscripten-pre.js main.cpp $(COMMON_CFLAGS) -DMICROFLO_MESSAGE_LIMIT=200 -s NO_DYNAMIC_EXECUTION=1 -s EXPORTED_FUNCTIONS=$(EMSCRIPTEN_EXPORTS) -s RESERVED_FUNCTION_POINTERS=10

release-emscripten: build-emscripten
    # TODO: package?

release: release-emscripten

check: release
