import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One line: the excuse a developer gives when code breaks in production.
// Chosen against the judge's brief, in its own order: it is squarely an
// excuse on the subject (code broke in production, and the developer is
// deflecting); it turns on a twist every developer recognises — the tests
// all passed, so the dev is technically innocent, except the one
// environment that actually matters was never under test, which is the
// real story of the incident; it sounds like something a developer would
// actually say out loud in the war room ("it passed every test" is the
// first sentence of every postmortem); it lands fast, with nothing to
// trim; and it is fresh — it turns the worn "the tests passed" defence
// inside out instead of repeating "works on my machine".
// Alternatives weighed and set aside: a staging variant ("Production
// found the bug staging was too polite to mention") personifies staging
// nicely but blames an environment instead of the gap in coverage, so
// the twist explains less; a "works on my machine" variant repeats the
// most worn excuse in the book, which the brief explicitly punishes. The
// test line keeps the blame-shift and the confession in the same breath,
// and at 58 characters it lands before the judge has time to blink.
const text =
  "It passed every test \u2014 production just wasn\u2019t one of them.";

// The bounty requires 1-200 characters, not only white space, and a single
// line: fail loudly instead of writing an entry the judge would refuse.
// The gate is strict on purpose — the entry file must be exactly this one
// line, byte for byte: no carriage return (a second kind of line break),
// no leading or trailing padding (the judge reads the file as submitted),
// and no control characters.
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 200 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-200 characters of non-blank text, got ${codePoints}`,
  );
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (text !== text.trim()) {
  throw new Error("entry must not start or end with whitespace");
}
if (/[\u0000-\u001f\u007f]/.test(text)) {
  throw new Error("entry must not contain control characters");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, "utf8");

// Read it back and prove the file on disk is exactly the line: a write
// that silently truncated, re-encoded or padded the entry would otherwise
// ship a different text to the judge than the one gated above.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated line");
}
