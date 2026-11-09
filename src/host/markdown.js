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

function removeYamlComment(value) {
  let quote = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote === "'") {
      if (char === "'" && value[index + 1] === "'") index += 1;
      else if (char === "'") quote = "";
    } else if (quote === '"') {
      if (char === "\\") index += 1;
      else if (char === '"') quote = "";
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "#" && (index === 0 || /\s/.test(value[index - 1]))) {
      return value.slice(0, index).trimEnd();
    }
  }
  return value;
}

function stripQuotes(value) {
  const trimmed = removeYamlComment(value).trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const decoded = JSON.parse(trimmed);
      if (typeof decoded === "string") return decoded;
    } catch {
      // Keep the literal value for malformed YAML, rather than dropping metadata.
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  return trimmed;
}

function parseInlineArray(value) {
  const body = value.slice(1, -1).trim();
  if (!body) return [];
  // A quoted comma is part of an Obsidian alias/tag, not a new list item.
  const items = [];
  let quote = "";
  let start = 0;
  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (quote === "'") {
      if (char === "'" && body[index + 1] === "'") index += 1;
      else if (char === "'") quote = "";
    } else if (quote === '"') {
      if (char === "\\") index += 1;
      else if (char === '"') quote = "";
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === ",") {
      items.push(body.slice(start, index));
      start = index + 1;
    }
  }
  items.push(body.slice(start));
  return items.map((item) => parseScalar(item));
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
    const pair = rawLine.match(/^([^\s:#][^:]*?)\s*:(?:\s+(.*)|[ \t]*)$/);
    if (!pair) {
      if (rawLine.trim() && !/^\s/.test(rawLine)) currentKey = null;
      continue;
    }
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
  const withoutFrontmatter = (body) => ({ frontmatter: {}, body, yaml: "", bodyLineOffset: 0 });
  if (!text.startsWith("---")) return withoutFrontmatter(text);
  const open = text.match(/^---[ \t]*\r?\n/);
  if (!open) return withoutFrontmatter(text);
  const rest = text.slice(open[0].length);
  const close = /(^|\r?\n)---[ \t]*(?:\r?\n|$)/.exec(rest);
  if (!close) return withoutFrontmatter(text);
  const yaml = rest.slice(0, close.index);
  const bodyStart = close.index + close[0].length;
  // Returned heading/chunk ranges must reference the actual Markdown file,
  // not a body with its YAML header removed.
  const bodyLineOffset = text.slice(0, open[0].length + bodyStart).split(/\r?\n/).length - 1;
  return { frontmatter: parseLiteYaml(yaml), body: rest.slice(bodyStart), yaml, bodyLineOffset };
}

export function asStringArray(value) {
  if (Array.isArray(value)) {
    return value.flat(Infinity)
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
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, "$1$2")
    .replace(/(^|\s)[*_~]([^*_~\s]+)[*_~](?=\s|$)/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text) {
  const cjk = (text.match(CJK_RUN) ?? []).join("").length;
  const latin = (text.match(/[A-Za-z0-9_]+/g) ?? []).length;
  return cjk + latin;
}



export function parseNote({ path, raw, mtime, size, maxChunkChars = 2200 }) {
  const { frontmatter, body, bodyLineOffset } = parseFrontmatter(raw);
  const lines = raw.split(/\r?\n/).slice(bodyLineOffset);
  const headings = [];
  const sections = [];
  let stack = [];
  const bodyStart = bodyLineOffset + 1;
  let current = { headingPath: [], lines: [], startLine: bodyStart };
  let fenceMarker = null;
  const flush = () => {
    const first = current.lines.findIndex((line) => line.trim());
    if (first >= 0) {
      const last = current.lines.findLastIndex((line) => line.trim());
      sections.push({
        headingPath: current.headingPath,
        text: current.lines.slice(first, last + 1).join("\n"),
        startLine: current.startLine + first,
        endLine: current.startLine + last
      });
    }
    current.lines = [];
  };

  lines.forEach((line, index) => {
    const lineNumber = bodyLineOffset + index + 1;
    if (fenceMarker) {
      if (new RegExp(`^\\s{0,3}${fenceMarker}`).test(line)) fenceMarker = null;
      current.lines.push(line);
      return;
    }
    if (/^\s{0,3}(`{3,}|~{3,})/.test(line)) {
      fenceMarker = line.match(/^\s{0,3}(`{3,}|~{3,})/)[1];
      current.lines.push(line);
      return;
    }
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) {
      current.lines.push(line);
      return;
    }
    flush();
    const level = heading[1].length;
    const title = headingTitle(line);
    headings.push({ level, title, line: lineNumber });
    stack = stack.filter((item) => item.level < level);
    stack.push({ level, title });
    current = { headingPath: stack.map((item) => item.title), lines: [], startLine: lineNumber + 1 };
  });
  current.startLine = bodyLineOffset + lines.length - current.lines.length + 1;
  flush();

  const titleFromH1 = headings.find((heading) => heading.level === 1)?.title;
  const title =
    cleanTitle(titleFromH1 || (typeof frontmatter.title === "string" ? frontmatter.title : "")) ||
    path.split("/").pop().replace(/\.md$/i, "");
  const tags = extractTags(frontmatter, body);
  const links = extractLinks(body);
  const aliases = asStringArray(frontmatter.aliases ?? frontmatter.alias);
  const noteHash = sha1(raw);
  const chunks = [];


  const splitLongSection = (section, cap) => {
    // Empty lines are normalized by flush between headings (keeps all
    // separators join("\n")-encoded below), so length is computed once.
    const text = section.text;
    if (text.length <= cap) return [section];
    const parts = [];
    let rest = text;
    let sourceStart = section.startLine;
    while (rest.length > cap) {
      // Prefer a natural line break, but gracefully hard-split a single long
      // paragraph/table. Newlines count toward maxChunkChars.
      let end = rest.lastIndexOf("\n", cap - 1) + 1;
      if (end <= 0) end = cap;
      const used = rest.slice(0, end);
      const sourceEnd = sourceStart + used.split("\n").length - 1;
      parts.push({ headingPath: section.headingPath, text: used.trim(), startLine: sourceStart, endLine: sourceEnd });
      sourceStart = sourceEnd + (used.endsWith("\n") ? 1 : 0);
      rest = rest.slice(end).replace(/^\s+/, "");
    }
    if (rest) parts.push({ headingPath: section.headingPath, text: rest, startLine: sourceStart, endLine: section.endLine });
    return parts;
  };

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

