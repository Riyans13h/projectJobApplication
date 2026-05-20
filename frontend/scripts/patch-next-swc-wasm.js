const fs = require("fs");
const path = require("path");

const swcPath = path.join(__dirname, "..", "node_modules", "next", "dist", "build", "swc", "index.js");

if (!fs.existsSync(swcPath)) {
  process.exit(0);
}

const source = fs.readFileSync(swcPath, "utf8");
const linuxMarker = '"x86_64-unknown-linux-gnu"';
const importMarker = "importPath ? (0, _url.pathToFileURL)(pkgPath).toString() : pkgPath";
const defaultMarker = "async function loadBindings(useWasmBinary = true)";

let patched = source;

if (!patched.includes(linuxMarker)) {
  patched = patched.replace(
    'const knownDefaultWasmFallbackTriples = [\n    "x86_64-unknown-freebsd",',
    'const knownDefaultWasmFallbackTriples = [\n    "x86_64-unknown-linux-gnu",\n    "x86_64-unknown-linux-musl",\n    "x86_64-unknown-freebsd",',
  );
}

if (!patched.includes(importMarker)) {
  patched = patched.replace(
    "await import((0, _url.pathToFileURL)(pkgPath).toString())",
    `await import(${importMarker})`,
  );
}

if (!patched.includes(defaultMarker)) {
  patched = patched.replace("async function loadBindings(useWasmBinary = false)", defaultMarker);
}

patched = patched.replace(
  /function getBinaryMetadata\(\) \{[\s\S]*?\n\}/,
  "function getBinaryMetadata() {\n    return { target: undefined };\n}",
);

patched = patched.replace(
  /const initCustomTraceSubscriber = \(traceFileName\)=>\{[\s\S]*?\n\};/,
  "const initCustomTraceSubscriber = (traceFileName)=>{};",
);

patched = patched.replace(
  /const initHeapProfiler = \(\)=>\{[\s\S]*?\n\};/,
  "const initHeapProfiler = ()=>{};",
);

patched = patched.replace(
  /const teardownHeapProfiler = \(\(\)=>\{[\s\S]*?\n\}\)\(\);/,
  "const teardownHeapProfiler = ()=>{};",
);

patched = patched.replace(
  /const teardownTraceSubscriber = \(\(\)=>\{[\s\S]*?\n\}\)\(\);/,
  "const teardownTraceSubscriber = ()=>{};",
);

if (patched === source) {
  console.log("Next SWC WASM patch already applied.");
  process.exit(0);
}

fs.writeFileSync(swcPath, patched);
console.log("Patched Next to prefer and correctly load the WASM SWC compiler on linux x64.");
