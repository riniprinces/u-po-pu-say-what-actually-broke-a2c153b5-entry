// Say What Actually Broke — entry program (revised).
// Writes the single-line error message to entry.txt and validates it
// against the gate: UTF-8, one line, 1..200 characters, no trailing
// newline, not only whitespace. Then reads it back and verifies the
// bytes on disk are exactly the line that was written.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "Your file didn't save — the server ran out of disk space. The computer whose only job is storing files ran out of room for files.";

const MAX_CHARS = 200;

// --- validation gate: fail loudly before anything is written ---
function validate(line: string): void {
  const chars = [...line].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`FAIL: line is ${chars} chars, gate requires 1..${MAX_CHARS}`);
  }
  if (/[\r\n]/.test(line)) {
    throw new Error("FAIL: line must be a single line (no CR/LF)");
  }
  if (line.trim().length === 0) {
    throw new Error("FAIL: line must not be only whitespace");
  }
  // Strict UTF-8 round-trip: no lone surrogates or unencodable code points.
  const encoded = new TextEncoder().encode(line);
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(encoded);
  if (decoded !== line) {
    throw new Error("FAIL: line is not valid UTF-8 text");
  }
  console.log(`gate PASS: ${chars} chars, ${encoded.byteLength} bytes`);
}

validate(LINE);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? process.cwd();
const outPath = join(outDir, "entry.txt");

writeFileSync(outPath, LINE, "utf8");

// --- read-back verify: the file on disk must be byte-identical ---
const back = readFileSync(outPath, "utf8");
const backBytes = readFileSync(outPath);
if (back !== LINE) {
  throw new Error("FAIL: read-back mismatch — entry.txt differs from the line");
}
if (back.endsWith("\n") || back.endsWith("\r")) {
  throw new Error("FAIL: entry.txt must not end with a newline");
}

console.log(`wrote ${outPath}`);
console.log(`chars: ${[...LINE].length}, bytes: ${backBytes.byteLength}`);
console.log(LINE);
