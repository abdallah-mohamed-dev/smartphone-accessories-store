const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';

const rootHtml = path.join(root, 'index.html');
let c = fs.readFileSync(rootHtml, 'utf8');

console.log('=== Root index.html verification ===');

const jsRefs = [...c.matchAll(/src="\.\/(js\/[^"]*)"/g)];
const cssRefs = [...c.matchAll(/href="\.\/(css\/[^"]*)"/g)];
const imgRefs = [...c.matchAll(/src="\.\/(img\/[^"]*)"/g)];

let jsMissing = 0, cssMissing = 0, imgMissing = 0;

jsRefs.forEach(m => {
    if (!fs.existsSync(path.join(root, m[1]))) {
        jsMissing++;
        console.log('  MISSING JS: ' + m[1]);
    }
});

cssRefs.forEach(m => {
    if (!fs.existsSync(path.join(root, m[1]))) {
        cssMissing++;
        console.log('  MISSING CSS: ' + m[1]);
    }
});

imgRefs.forEach(m => {
    if (!fs.existsSync(path.join(root, m[1]))) {
        imgMissing++;
        console.log('  MISSING IMG: ' + m[1]);
    }
});

console.log('JS: ' + jsRefs.length + ' refs, ' + jsMissing + ' missing');
console.log('CSS: ' + cssRefs.length + ' refs, ' + cssMissing + ' missing');
console.log('IMG: ' + imgRefs.length + ' refs, ' + imgMissing + ' missing');

const domainCount = (c.match(/woodmart\.xtemos\.com/g) || []).length;
console.log('Remaining woodmart.xtemos.com refs: ' + domainCount);

// Show first 5 remaining domain refs in context
if (domainCount > 0) {
    const lines = c.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('woodmart.xtemos.com')) {
            console.log('  L' + (i+1) + ': ' + line.trim().substring(0, 150));
        }
    });
}

// Check subpages
console.log('\n=== Subpages verification ===');
const subdirs = fs.readdirSync(root).filter(d => {
    try { return fs.statSync(path.join(root, d)).isDirectory() && d !== 'css' && d !== 'js' && d !== 'img' && d !== 'fonts' && d !== 'plugins' && d !== 'html' && !d.startsWith('.'); }
    catch(e) { return false; }
});

subdirs.forEach(dir => {
    const idx = path.join(root, dir, 'index.html');
    if (fs.existsSync(idx)) {
        const content = fs.readFileSync(idx, 'utf8');
        const count = (content.match(/woodmart\.xtemos\.com/g) || []).length;
        if (count > 0) console.log('  ' + dir + '/index.html: ' + count + ' domain refs remaining');
    }
});

console.log('\nDone.');
