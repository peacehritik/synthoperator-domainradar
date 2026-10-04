import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(ROOT_DIR, 'src', 'locales');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const LANGUAGES = ['en', 'fr', 'ar', 'es', 'pt'];
const BASE_LANG = 'en';

// Helper to read and parse JSON cleanly
function loadJson(filepath) {
  try {
    const raw = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Error] Failed to read JSON file: ${filepath}`, err.message);
    return null;
  }
}

// Recursively find all .ts and .tsx files in src
function getAllSourceFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        getAllSourceFiles(fullPath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Extract t('key') occurrences from source code
function extractUsedKeysFromCode() {
  const sourceFiles = getAllSourceFiles(SRC_DIR);
  const usedKeys = new Set();
  const tRegex = /\bt\(\s*['"`]([a-zA-Z0-9_.]+)['"`]/g;

  for (const filePath of sourceFiles) {
    if (filePath.includes('translations.ts')) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = tRegex.exec(content)) !== null) {
      if (match[1]) {
        usedKeys.add(match[1]);
      }
    }
  }

  return { usedKeys: Array.from(usedKeys).sort(), sourceFilesCount: sourceFiles.length };
}

// Main verification runner
function runI18nAudit() {
  console.log('\n============================================================');
  console.log('       Domain Decision Engine - i18n Parity & Integrity Auditor        ');
  console.log('============================================================\n');

  const enPath = path.join(LOCALES_DIR, `${BASE_LANG}.json`);
  const enDict = loadJson(enPath);

  if (!enDict) {
    console.error('[Fatal] Canonical en.json baseline not found.');
    process.exit(1);
  }

  const enKeys = Object.keys(enDict);
  console.log(`[Baseline] Canonical en.json loaded: ${enKeys.length} total keys.\n`);

  const { usedKeys, sourceFilesCount } = extractUsedKeysFromCode();
  console.log(`[Code Scan] Scanned ${sourceFilesCount} source files. Found ${usedKeys.length} distinct t('key') calls.`);

  // Check if any key used in code is missing from en.json (excluding dynamically generated IDs)
  const missingFromBaseline = usedKeys.filter(
    (k) =>
      !(k in enDict) &&
      !k.startsWith('gate_') &&
      !k.startsWith('bull_') &&
      !k.startsWith('bear_') &&
      !k.startsWith('unknown_') &&
      !k.startsWith('action_')
  );

  if (missingFromBaseline.length > 0) {
    console.warn(`\n[Warning] ${missingFromBaseline.length} keys used in code are not in en.json:`);
    missingFromBaseline.forEach((k) => console.warn(`  - ${k}`));
  } else {
    console.log('[Code Scan] All direct UI keys in code exist in baseline en.json.\n');
  }

  // Audit all target languages
  let hasErrors = false;
  const results = [];

  for (const lang of LANGUAGES) {
    if (lang === BASE_LANG) {
      results.push({
        lang: 'en (Base)',
        keys: enKeys.length,
        missing: 0,
        empty: 0,
        orphan: 0,
        coverage: '100.0%',
        status: 'OK',
      });
      continue;
    }

    const langPath = path.join(LOCALES_DIR, `${lang}.json`);
    const langDict = loadJson(langPath);

    if (!langDict) {
      results.push({
        lang,
        keys: 0,
        missing: enKeys.length,
        empty: 0,
        orphan: 0,
        coverage: '0.0%',
        status: 'MISSING FILE',
      });
      hasErrors = true;
      continue;
    }

    const langKeys = Object.keys(langDict);
    const missingKeys = enKeys.filter((k) => !(k in langDict));
    const emptyKeys = langKeys.filter((k) => typeof langDict[k] !== 'string' || langDict[k].trim() === '');
    const orphanKeys = langKeys.filter((k) => !(k in enDict));

    const totalExpected = enKeys.length;
    const validTranslated = totalExpected - missingKeys.length - emptyKeys.length;
    const coveragePct = ((Math.max(0, validTranslated) / totalExpected) * 100).toFixed(1);

    const isOk = missingKeys.length === 0 && emptyKeys.length === 0;
    if (!isOk) hasErrors = true;

    results.push({
      lang,
      keys: langKeys.length,
      missing: missingKeys.length,
      empty: emptyKeys.length,
      orphan: orphanKeys.length,
      coverage: `${coveragePct}%`,
      status: isOk ? 'OK' : 'DEFICIT',
      missingDetails: missingKeys,
    });
  }

  // Display summary table
  console.log('+------------+------------+------------+------------+------------+------------+');
  console.log('| Language   | Total Keys | Missing    | Empty      | Coverage   | Status     |');
  console.log('+------------+------------+------------+------------+------------+------------+');

  for (const r of results) {
    const langCol = r.lang.padEnd(10);
    const keysCol = String(r.keys).padStart(10);
    const missingCol = String(r.missing).padStart(10);
    const emptyCol = String(r.empty).padStart(10);
    const covCol = r.coverage.padStart(10);
    const statusCol = r.status.padEnd(10);

    console.log(`| ${langCol} | ${keysCol} | ${missingCol} | ${emptyCol} | ${covCol} | ${statusCol} |`);
  }

  console.log('+------------+------------+------------+------------+------------+------------+\n');

  // Print missing key details if any
  for (const r of results) {
    if (r.missingDetails && r.missingDetails.length > 0) {
      console.log(`[Details] Missing keys in ${r.lang}:`);
      r.missingDetails.slice(0, 10).forEach((k) => console.log(`  - ${k}`));
      if (r.missingDetails.length > 10) {
        console.log(`  ... and ${r.missingDetails.length - 10} more.`);
      }
      console.log('');
    }
  }

  // --- Phase 3: Glossary & Protected Terminology Compliance Check ---
  console.log('------------------------------------------------------------');
  console.log('       Phase 3: Domain Glossary & Terminology Audit         ');
  console.log('------------------------------------------------------------\n');

  const PROTECTED_TERMS = [
    'RDAP', 'WHOIS', 'DNS', 'MX', 'TLD', 'SLD', 'Wayback CDX',
    'SHA-256', 'TTL', 'Net EV', 'ROI', 'CPM', 'CPC', 'MAPE',
    'TypeSafe JEV', 'Sedo', 'GoDaddy', 'NameJet', 'DropCatch', 'Dynadot'
  ];

  let glossaryViolations = 0;

  for (const lang of LANGUAGES) {
    if (lang === BASE_LANG) continue;

    const langPath = path.join(LOCALES_DIR, `${lang}.json`);
    const langDict = loadJson(langPath);
    if (!langDict) continue;

    for (const [key, baseValue] of Object.entries(enDict)) {
      const transValue = langDict[key] || '';

      for (const term of PROTECTED_TERMS) {
        const inBase = baseValue.toLowerCase().includes(term.toLowerCase());
        const inTrans = transValue.toLowerCase().includes(term.toLowerCase());

        // In Arabic, some generic terms like TLD can be rendered alongside or in context,
        // but technical protocols must remain protected
        if (inBase && !inTrans && (term === 'RDAP' || term === 'WHOIS' || term === 'DNS' || term === 'SHA-256' || term === 'TypeSafe JEV' || term === 'Net EV')) {
          console.warn(`[Glossary Violation] ${lang}.json key "${key}": missing protected term "${term}"`);
          glossaryViolations++;
        }
      }
    }
  }

  if (glossaryViolations === 0) {
    console.log('[Glossary Check] 100% compliant. All protected technical terms (RDAP, WHOIS, DNS, Net EV, SHA-256, JEV) are intact across all languages.\n');
  } else {
    console.warn(`[Glossary Check] ${glossaryViolations} terminology warnings detected.\n`);
  }

  if (hasErrors) {
    console.error('[Result] Translation deficits detected across locales.\n');
    process.exit(1);
  } else {
    console.log('[Result] All 5 locales are 100.0% synchronized and parity-verified!\n');
  }
}

runI18nAudit();