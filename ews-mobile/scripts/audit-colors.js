#!/usr/bin/env node
/**
 * Lists hex colour literals written outside theme/colors.ts, and flags any
 * that are not in the v2 palette. Run: npm run colors:audit
 * Exits 1 if a colour not in the palette is found, so new screens stay on-token.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const themeFile = path.join(root, 'theme', 'colors.ts');
const dirs = ['app', 'components', 'contexts', 'context', 'utils', 'App.tsx'];
const hex = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
const expand = (h) => (h.length === 4 ? '#' + [...h.slice(1)].map((c) => c + c).join('') : h).toLowerCase();

const palette = new Set((fs.readFileSync(themeFile, 'utf8').match(hex) || []).map(expand));

function files(p) {
  const full = path.join(root, p);
  if (!fs.existsSync(full)) return [];
  if (fs.statSync(full).isFile()) return [full];
  return fs.readdirSync(full).flatMap((f) => files(path.join(p, f)));
}

let literals = 0;
const perFile = [];
const offPalette = [];
for (const f of dirs.flatMap(files).filter((f) => /\.(ts|tsx)$/.test(f))) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  let count = 0;
  lines.forEach((line, i) => {
    for (const m of line.match(hex) || []) {
      count++;
      if (!palette.has(expand(m))) offPalette.push(`${path.relative(root, f)}:${i + 1}  ${m}`);
    }
  });
  if (count) perFile.push([path.relative(root, f), count]);
  literals += count;
}

perFile.sort((a, b) => b[1] - a[1]).forEach(([f, n]) => console.log(`${String(n).padStart(4)}  ${f}`));
console.log(`\n${literals} hex literals in ${perFile.length} files still to move onto theme tokens.`);
if (offPalette.length) {
  console.log(`\nNot in the v2 palette (theme/colors.ts):\n  ${offPalette.join('\n  ')}`);
  process.exit(1);
}
