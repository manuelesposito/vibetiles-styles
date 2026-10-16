#!/usr/bin/env node
/* Writes index.json from styles/<slug>/: the record's label and needs, the README's
   first paragraph as the note, and the files, so a gallery or a tool reads one file. */
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const out = [];
for (const slug of fs.readdirSync(path.join(root, 'styles')).sort()) {
	const dir = path.join(root, 'styles', slug);
	if (!fs.existsSync(path.join(dir, 'style.json'))) continue;
	const r = JSON.parse(fs.readFileSync(path.join(dir, 'style.json'), 'utf8'));
	const readme = fs.existsSync(path.join(dir, 'README.md')) ? fs.readFileSync(path.join(dir, 'README.md'), 'utf8') : '';
	const paras = readme.split(/\n\s*\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'));
	const by = (paras.find(p => /^By /i.test(p)) || '').replace(/^By\s+/i, '').split('.')[0];
	out.push({
		slug, label: r.label, note: paras[0] || '', by, needs: r.vibetiles || '',
		preset: r.preset || null, colours: r.colours || null,
		file: `styles/${slug}/style.json`, preview: fs.existsSync(path.join(dir, 'preview.png')) ? `styles/${slug}/preview.png` : null,
	});
}
fs.writeFileSync(path.join(root, 'index.json'), JSON.stringify({ updated: new Date().toISOString().slice(0, 10), styles: out }, null, '\t') + '\n');
console.log(`index.json: ${out.length} styles`);
