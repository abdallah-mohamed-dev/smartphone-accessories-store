const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';
const rootHtml = path.join(root, 'index.html');
let c = fs.readFileSync(rootHtml, 'utf8');

const imgRefs = [...c.matchAll(/src="\.\/(img\/[^"]*)"/g)];
const imgDir = path.join(root, 'img');
const uploaded = {};
function walkDir(dir, prefix) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) {
            walkDir(fp, prefix + e.name + '/');
        } else {
            uploaded[e.name.toLowerCase()] = prefix + e.name;
        }
    }
}
walkDir(imgDir, '');

console.log('=== Image audit ===');
imgRefs.forEach(m => {
    const ref = m[1];
    const basename = path.basename(ref);
    const lower = basename.toLowerCase();
    if (fs.existsSync(path.join(root, ref))) {
        // OK
    } else if (uploaded[lower]) {
        console.log('RENAME: ' + ref + ' -> img/' + uploaded[lower]);
    } else {
        console.log('MISSING: ' + ref + ' (base=' + basename + ')');
        // Check if we have similar files
        const similar = Object.keys(uploaded).filter(k => k.includes(basename.replace(/-\d+x\d+/, '').replace(/\.\w+$/, '')));
        if (similar.length > 0) {
            console.log('  Similar: ' + similar.slice(0, 3).join(', '));
        }
    }
});
