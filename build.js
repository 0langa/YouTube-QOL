const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT_FILE = path.join(ROOT, 'youtube.user.js');
const HEADER_FILE = path.join(ROOT, 'userscript.js');
const ORDER_FILE = path.join(ROOT, 'build.order.json');
const SRC_DIR = path.join(ROOT, 'src');
const LOCALES_DIR = path.join(ROOT, 'locales');

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractUserscriptHeader(content) {
  const match = content.match(/\/\/\s*==UserScript==[\s\S]*?\/\/\s*==\/UserScript==/);
  if (!match) {
    throw new Error('userscript metadata block not found in userscript.js');
  }
  return match[0].trim();
}

function stripUserscriptHeader(content) {
  return content
    .replace(/\/\/\s*==UserScript==[\s\S]*?\/\/\s*==\/UserScript==/g, '')
    .replace(/\/\*\s*==UserScript==[\s\S]*?==\/UserScript==\s*\*\//g, '')
    .trim();
}

function loadModuleOrder() {
  const order = JSON.parse(readUtf8(ORDER_FILE));
  if (!Array.isArray(order) || order.length === 0) {
    throw new Error('build.order.json must contain a non-empty array');
  }
  return order;
}

function loadEmbeddedTranslations() {
  const result = {};
  if (!fs.existsSync(LOCALES_DIR)) {
    return result;
  }

  const files = fs
    .readdirSync(LOCALES_DIR)
    .filter(name => name.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const key = path.basename(file, '.json');
    const fullPath = path.join(LOCALES_DIR, file);
    try {
      result[key] = JSON.parse(readUtf8(fullPath));
    } catch (error) {
      throw new Error(`Invalid locale JSON in ${file}: ${error.message}`);
    }
  }

  return result;
}

function build() {
  const headerContent = readUtf8(HEADER_FILE);
  const header = extractUserscriptHeader(headerContent);
  const moduleOrder = loadModuleOrder();
  const embeddedTranslations = loadEmbeddedTranslations();

  const outputParts = [header, ''];

  outputParts.push('// --- MODULE: embedded-translations ---');
  outputParts.push('(function () {');
  outputParts.push("  'use strict';");
  outputParts.push('  if (typeof window !== \'undefined\') {');
  outputParts.push('    window.YouTubePlusEmbeddedTranslations = ' + JSON.stringify(embeddedTranslations) + ';');
  outputParts.push('  }');
  outputParts.push('})();');
  outputParts.push('');

  for (const moduleName of moduleOrder) {
    const modulePath = path.join(SRC_DIR, moduleName);
    if (!fs.existsSync(modulePath)) {
      throw new Error(`Missing module listed in build.order.json: ${moduleName}`);
    }

    const moduleSource = stripUserscriptHeader(readUtf8(modulePath));
    if (!moduleSource) {
      continue;
    }

    outputParts.push(`// --- MODULE: ${moduleName} ---`);
    outputParts.push(moduleSource);
    outputParts.push('');
  }

  const output = outputParts.join('\n').trimEnd() + '\n';
  fs.writeFileSync(OUT_FILE, output, 'utf8');

  const sizeKb = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(2);
  console.log(`Built youtube.user.js (${sizeKb} KB)`);
}

try {
  build();
} catch (error) {
  console.error('[build] Failed:', error.message);
  process.exitCode = 1;
}
