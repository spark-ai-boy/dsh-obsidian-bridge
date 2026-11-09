import test from "node:test";
import assert from "node:assert/strict";
import { extractLinks, extractTags, parseFrontmatter, parseNote, tokenize } from "../src/host/markdown.js";

test("parses frontmatter arrays and body", () => {
  const parsed = parseFrontmatter("---\ntags: [RAG, LLM]\naliases:\n  - search\n---\n# Title\n\nBody");
  assert.deepEqual(parsed.frontmatter.tags, ["RAG", "LLM"]);
  assert.deepEqual(parsed.frontmatter.aliases, ["search"]);
  assert.equal(parsed.body.trim(), "# Title\n\nBody");
});

test("extracts tags and wiki links", () => {
  assert.deepEqual(extractTags({ tags: ["RAG"] }, "A #知识管理 with [[Note|alias]]."), ["RAG", "知识管理"]);
  assert.deepEqual(extractLinks("[[Note#H|Alias]] and [x](Other.md)"), ["Note", "Other"]);
});

test("chunks by heading and keeps line numbers", () => {
  const note = parseNote({
    path: "技术/Test.md",
    raw: "---\ntags: [RAG]\n---\n# Title\n\nIntro\n\n## Section\n\nA paragraph about retrieval.\n",
    mtime: Date.now(),
    size: 10
  });
  assert.equal(note.title, "Title");
  assert.deepEqual(note.tags, ["RAG"]);
  assert.ok(note.chunks.length >= 2);
  assert.ok(note.chunks.some((chunk) => chunk.headingPath.includes("Section")));
  assert.ok(note.chunks.every((chunk) => chunk.notePath === "技术/Test.md"));
  assert.equal(note.headings[0].line, 4);
  assert.equal(note.chunks[0].startLine, 6);
});

test("tokenizes Chinese and Latin text", () => {
  const tokens = tokenize("RAG 知识管理");
  assert.ok(tokens.includes("rag"));
  assert.ok(tokens.includes("知识"));
  assert.ok(tokens.includes("管理"));
});

test("splits a single paragraph exceeding maxChunkChars (giant table)", () => {
  const row = `| ${"x".repeat(990)} |`;
  const raw = `# Model\n\n| head | a |\n| --- | --- |\n${Array(40).fill(row).join("\n")}\n`;
  const note = parseNote({ path: "t/big.md", raw, mtime: 0, size: raw.length, maxChunkChars: 2200 });
  assert.ok(note.chunks.length > 1, "giant single paragraph must be split");
  for (const chunk of note.chunks) {
    assert.ok(chunk.text.length <= 2200, `chunk length ${chunk.text.length} exceeds maxChunkChars`);
  }
});
