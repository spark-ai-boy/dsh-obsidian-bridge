import { createHash } from "node:crypto";

/**
 * Lightweight, dependency-free Obsidian Markdown parsing.
 *
 * The goal is retrieval quality, not a complete YAML implementation. Frontmatter
 * supports the scalar/array shapes used by Obsidian for tags, aliases, titles,
 * and common metadata; everything else remains available as a string.
 */

const CJK_RUN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]+/gu;

export function sha1(value) {
  return createHash("sha1").update(value).digest("hex");
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineArray(value) {
  const body = value.slice(1, -1).trim();
  if (!body) return [];
  return body
    .split(",")
    .map((item) => stripQuotes(item))
    .filter(Boolean);
}

function parseScalar(value) {
  const clean = stripQuotes(value);
  if (clean === "true") return true;
  if (clean === "false") return false;
  if (clean === "null" || clean === "~") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(clean)) return Number(clean);
  if (clean.startsWith("[") && clean.endsWith("]")) return parseInlineArray(clean);
  return clean;
}

export function parseLiteYaml(source) {
  const result = {};
  const lines = source.split(/\r?\n/);
  let currentKey = null;

  for (const rawLine of lines) {
    if (!rawLine.trim() || /^\s*#/.test(rawLine)) continue;
    const item = rawLine.match(/^\s*-\s+(.*)$/);
    if (item && currentKey) {
      if (!Array.isArray(result[currentKey])) result[currentKey] = [];
      result[currentKey].push(parseScalar(item[1] ?? ""));
      continue;
    }
    const pair = rawLine.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!pair) continue;
    const key = pair[1];
    const value = pair[2] ?? "";
    currentKey = key;
    if (value === "") {
      result[key] = [];
      continue;
    }
    if (/^[>|][+-]?$/.test(value.trim())) {
      result[key] = "";
      continue;
    }
    result[key] = parseScalar(value);
  }

  return result;
}

export function parseFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, "");
  if (!text.startsWith("---")) {
    return { frontmatter: {}, body: text, yaml: "" };
  }
  const open = text.match(/^---[ \t]*\r?\n/);
  if (!open) return { frontmatter: {}, body: text, yaml: "" };
  const rest = text.slice(open[0].length);
  const close = /(^|\r?\n)---[ \t]*(?:\r?\n|$)/.exec(rest);
  if (!close || close.index === undefined) {
    return { frontmatter: {}, body: text, yaml: "" };
  }
  const yaml = rest.slice(0, close.index);
  const bodyStart = close.index + close[0].length;
  return { frontmatter: parseLiteYaml(yaml), body: rest.slice(bodyStart), yaml };
}

export function asStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,，]/)
      .map((item) => item.trim().replace(/^#+/, ""))
      .filter(Boolean);
  }
  return [];
}

export function extractTags(frontmatter, body) {
  const tags = new Set([
    ...asStringArray(frontmatter.tags),
    ...asStringArray(frontmatter.tag)
  ]);
  const inline = /(^|[\s(])#([\p{L}\p{N}_/-]{1,64})/gu;
  let match;
  while ((match = inline.exec(body)) !== null) {
    tags.add(match[2]);
  }
  return [...tags];
}

export function extractLinks(body) {
  const links = new Set();
  const wiki = /\[\[([^\]\n]+)\]\]/g;
  let match;
  while ((match = wiki.exec(body)) !== null) {
    const target = (match[1] ?? "").split("|", 1)[0]?.split("#", 1)[0]?.trim();
    if (target && !/^https?:\/\//i.test(target) && !/\.(png|jpe?g|gif|webp|avif|svg)$/i.test(target)) {
      links.add(target);
    }
  }
  const markdown = /(?<!!)\[[^\]\n]*\]\(([^)\s]+\.md(?:#[^)]+)?)\)/g;
  while ((match = markdown.exec(body)) !== null) {
    const target = (match[1] ?? "").split("#", 1)[0]?.replace(/^\.\//, "").trim();
    if (target) links.add(target.replace(/\.md$/i, ""));
  }
  return [...links];
}

function headingTitle(line) {
  return line.replace(/^#{1,6}\s+/, "").replace(/\s+#+\s*$/, "").trim();
}

function cleanTitle(value) {
  return value
    .replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, "$2$1")
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, "$2$1")
    .replace(/[*_`~]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text) {
  const cjk = (text.match(CJK_RUN) ?? []).join("").length;
  const latin = (text.match(/[A-Za-z0-9_]+/g) ?? []).length;
  return cjk + latin;
}

function splitLongSection(section, maxChars) {
  if (section.text.length <= maxChars) return [section];
  const paragraphs = section.text.split(/\n{2,}/);
  const chunks = [];
  let current = "";
  let startLine = section.startLine;
  let lineCursor = section.startLine;
  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > maxChars && current) {
      chunks.push({ ...section, text: current, startLine, endLine: lineCursor });
      const overlap = current.slice(-Math.min(220, Math.floor(maxChars * 0.12)));
      current = `${overlap}\n\n${paragraph}`;
      startLine = Math.max(section.startLine, lineCursor - 2);
    } else {
      current = candidate;
    }
    lineCursor += paragraph.split(/\r?\n/).length + 1;
  }
  if (current.trim()) {
    chunks.push({ ...section, text: current, startLine, endLine: lineCursor });
  }
  return chunks.length ? chunks : [section];
}

export function parseNote({ path, raw, mtime, size, maxChunkChars = 2200 }) {
  const { frontmatter, body } = parseFrontmatter(raw);
  const lines = body.split(/\r?\n/);
  const headings = [];
  const sections = [];
  let stack = [];
  let current = {
    headingPath: [],
    lines: [],
    startLine: 1
  };
  let inFence = false;

  const flush = (endLine) => {
    const text = current.lines.join("\n").trim();
    if (text) {
      sections.push({
        headingPath: current.headingPath,
        text,
        startLine: current.startLine,
        endLine
      });
    }
    current = { headingPath: [...current.headingPath], lines: [], startLine: endLine + 1 };
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const heading = !inFence ? line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/) : null;
    if (!heading) {
      current.lines.push(line);
      return;
    }

    flush(lineNumber - 1);
    const level = heading[1].length;
    const title = headingTitle(line);
    headings.push({ level, title, line: lineNumber });
    stack = stack.filter((item) => item.level < level);
    stack.push({ level, title });
    current = {
      headingPath: stack.map((item) => item.title),
      lines: [],
      startLine: lineNumber + 1
    };
  });
  flush(lines.length);

  const titleFromH1 = headings.find((heading) => heading.level === 1)?.title;
  const title =
    cleanTitle(titleFromH1 || (typeof frontmatter.title === "string" ? frontmatter.title : "")) ||
    path.split("/").pop().replace(/\.md$/i, "");
  const tags = extractTags(frontmatter, body);
  const links = extractLinks(body);
  const aliases = asStringArray(frontmatter.aliases ?? frontmatter.alias);
  const noteHash = sha1(raw);
  const chunks = [];

  for (const section of sections) {
    for (const part of splitLongSection(section, Math.max(400, Number(maxChunkChars) || 2200))) {
      const headingPath = part.headingPath ?? [];
      const searchText = [title, path, ...headingPath, ...tags, part.text].join("\n");
      const chunkHash = sha1(searchText);
      chunks.push({
        // Content-addressed id: stable across position shifts so a mid-note
        // edit keeps the vector cache valid for every unchanged chunk. The
        // leading ordinal only disambiguates two identical sections within
        // the same note and never keys the vector cache (rebuild() matches
        // on `hash`).
        id: `${path}#${chunks.length}-${chunkHash.slice(0, 8)}`,
        notePath: path,
        title,
        headingPath,
        text: part.text,
        searchText,
        startLine: part.startLine,
        endLine: part.endLine,
        hash: chunkHash
      });
    }
  }

  return {
    id: path,
    path,
    title,
    folder: path.includes("/") ? path.split("/")[0] : "(root)",
    tags,
    aliases,
    links,
    frontmatter,
    body,
    words: countWords(body),
    headings,
    chunks,
    hash: noteHash,
    mtime,
    size
  };
}

export function tokenize(text) {
  const value = text.toLowerCase();
  const tokens = [];
  for (const word of value.match(/[a-z0-9_]{2,}/g) ?? []) tokens.push(word);
  for (const run of value.match(CJK_RUN) ?? []) {
    for (let index = 0; index < run.length; index += 1) {
      tokens.push(run[index]);
      if (index + 1 < run.length) tokens.push(run.slice(index, index + 2));
    }
  }
  return tokens;
}

export function snippetAround(text, query, maxLength = 240) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!query.trim()) return clean.slice(0, maxLength);
  const index = clean.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return clean.slice(0, maxLength);
  const start = Math.max(0, index - Math.floor(maxLength * 0.3));
  const snippet = clean.slice(start, start + maxLength);
  return `${start > 0 ? "…" : ""}${snippet}${start + maxLength < clean.length ? "…" : ""}`;
}

