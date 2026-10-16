#!/usr/bin/env node
/* Checks style records against schema/style-schema.json.
   Usage: node tools/check-style.mjs styles/<slug>/style.json (or all of them)
   Exit 1 on any fault. Unknown keys are a warning: the panel drops them. */
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const schema = JSON.parse(fs.readFileSync(path.join(here, '../schema/style-schema.json'), 'utf8'));
const EXTRA = new Set(['preset', 'vibetiles']); /* carried by records, not described by the schema */
const HEX = /^#[0-9a-f]{6}$/i;

function lum(hex) {
	const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
	return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

function checkValue(where, value, rule, faults, warns) {
	if (Array.isArray(rule)) { if (!rule.includes(String(value))) faults.push(`${where}: "${value}" is not one of ${rule.join(', ')}`); return; }
	if (rule === 'boolean') { if (typeof value !== 'boolean') faults.push(`${where}: must be true or false`); return; }
	if (rule === 'hex') { if (typeof value !== 'string' || !HEX.test(value)) faults.push(`${where}: must be a six-digit hex colour`); return; }
	if (typeof rule === 'number') { if (value !== rule) faults.push(`${where}: must be ${rule}`); return; }
	if (typeof rule === 'string') { if (typeof value !== 'string' || value.length > 64) faults.push(`${where}: must be a short string`); return; }
	if (rule && typeof rule === 'object') {
		if (Array.isArray(value) && !value.length) return; /* an empty table a server wrote as a list */
		if (!value || typeof value !== 'object' || Array.isArray(value)) { faults.push(`${where}: must be an object`); return; }
		for (const k of Object.keys(value)) {
			if (!(k in rule)) { warns.push(`${where}.${k}: not a known key, the panel will drop it`); continue; }
			checkValue(`${where}.${k}`, value[k], rule[k], faults, warns);
		}
	}
}

function checkFile(file) {
	const faults = [], warns = [];
	let r;
	try { r = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return { file, faults: [`not valid JSON: ${e.message}`], warns }; }
	if (r.architrave !== 3) faults.push('architrave must be 3');
	if (typeof r.label !== 'string' || !r.label.trim() || r.label.length > 40) faults.push('label: a name of 1 to 40 characters');
	if ('id' in r) faults.push('id: leave it out, the site gives a style its id');
	if (typeof r.vibetiles !== 'string' || !/^\d+\.\d+(\.\d+)?$/.test(r.vibetiles)) faults.push('vibetiles: the version the style needs, like "0.57"');
	for (const k of Object.keys(r)) {
		if (k === 'architrave' || k === 'label') continue;
		if (EXTRA.has(k)) { if (typeof r[k] !== 'string') faults.push(`${k}: must be a string`); continue; }
		if (!(k in schema)) { warns.push(`${k}: not a known key, the panel will drop it`); continue; }
		checkValue(k, r[k], schema[k], faults, warns);
	}
	for (const side of ['light', 'dark']) {
		const c = r.colours && r.colours[side];
		if (c && HEX.test(c.background || '') && HEX.test(c.text || '')) {
			const q = ratio(c.background, c.text);
			if (q < 4.5) faults.push(`colours.${side}: text on paper reads at ${q.toFixed(2)}:1, needs 4.5:1`);
		}
	}
	const dir = path.dirname(file);
	if (!fs.existsSync(path.join(dir, 'README.md'))) faults.push('README.md beside the record: one line on what the style is and who made it');
	if (!fs.existsSync(path.join(dir, 'preview.png'))) warns.push('no preview.png: the gallery draws a swatch tile instead');
	return { file, faults, warns };
}

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node tools/check-style.mjs styles/*/style.json'); process.exit(2); }
let bad = 0;
for (const f of files) {
	const { faults, warns } = checkFile(f);
	for (const w of warns) console.log(`  note  ${f}: ${w}`);
	for (const x of faults) console.log(`  FAULT ${f}: ${x}`);
	if (faults.length) bad++; else console.log(`  ok    ${f}`);
}
process.exit(bad ? 1 : 0);
