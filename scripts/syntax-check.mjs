// Lightweight syntax-only check for every .ts/.tsx file in src/.
// This does NOT do full type-checking (no node_modules is available in this
// sandbox), but it does catch real syntax errors: unclosed JSX tags,
// mismatched braces/parens, invalid TypeScript syntax, etc. Uses the
// TypeScript compiler's parser directly (ts.createSourceFile), which does
// not require module resolution.
import ts from '/home/claude/.npm-global/lib/node_modules/typescript/lib/typescript.js';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'src');
let fileCount = 0;
let errorCount = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (['.ts', '.tsx'].includes(extname(full))) {
      checkFile(full);
    }
  }
}

function checkFile(path) {
  fileCount++;
  const text = readFileSync(path, 'utf8');
  const scriptKind = path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, scriptKind);

  // Collect parse diagnostics attached to the source file.
  const diagnostics = sourceFile.parseDiagnostics ?? [];
  for (const d of diagnostics) {
    errorCount++;
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(d.start ?? 0);
    const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
    console.log(`${path}:${line + 1}:${character + 1} - ${message}`);
  }
}

walk(ROOT);
console.log(`\nChecked ${fileCount} files, ${errorCount} syntax error(s) found.`);
process.exit(errorCount > 0 ? 1 : 0);
