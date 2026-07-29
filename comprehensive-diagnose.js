const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function exists(relPath) {
    return fs.existsSync(path.join(root, relPath));
}

const imgDir = path.join(root, 'img');
const flatImgs = new Map();
fs.readdirSync(imgDir).forEach(f => flatImgs.set(f.toLowerCase(), f));

console.log('=== 1. Images with year/month subdirs ===');
const imgSubdirs = [...html.matchAll(/\.\/(img\/\d{4}\/\d{2}\/[^\s"'>]+)/g)];
const seen = new Set();
imgSubdirs.forEach(m => {
    const ref = m[1];
    if (seen.has(ref)) return;
    seen.add(ref);
    const base = path.basename(ref);
    const flatName = flatImgs.get(base.toLowerCase());
    if (flatName) {
        console.log('  FIX: ' + ref + ' -> img/' + flatName);
    } else if (exists(ref)) {
        // ok
    } else {
        console.log('  MISS: ' + ref + ' (base=' + base + ')');
    }
});

console.log('\n=== 2. Font paths in inline CSS ===');
const fontRefs = [...html.matchAll(/url\("([^"]+)"\)/g)];
const fontSeen = new Set();
fontRefs.forEach(m => {
    if (fontSeen.has(m[0])) return;
    fontSeen.add(m[0]);
    const urlPath = m[1];
    console.log('  URL: ' + urlPath);
    
    // Check if font exists
    let relPath = urlPath.startsWith('./') ? urlPath.substring(2) : urlPath;
    if (exists(relPath)) {
        console.log('    EXISTS');
    } else {
        // Try fonts/ directory
        const fontName = path.basename(relPath);
        const fontFile = 'fonts/' + fontName;
        if (exists(fontFile)) {
            console.log('    IN fonts/: ' + fontFile);
        } else {
            console.log('    MISSING');
        }
    }
});

console.log('\n=== 3. srcset references ===');
const srcSetRefs = [...html.matchAll(/srcset="([^"]+)"/g)];
const srcSetUrls = new Set();
srcSetRefs.forEach(m => {
    m[1].split(',').forEach(s => {
        const url = s.trim().split(' ')[0];
        if (url.startsWith('./')) {
            const relPath = url.substring(2);
            if (!exists(relPath)) {
                srcSetUrls.add(relPath);
            }
        }
    });
});
srcSetUrls.forEach(url => {
    const base = path.basename(url);
    const flatName = flatImgs.get(base.toLowerCase());
    if (flatName) {
        console.log('  FIX: ' + url + ' -> img/' + flatName);
    } else {
        console.log('  MISS: ' + url);
    }
});

console.log('\n=== 4. images without img/ prefix (root level) ===');
const rootImgs = [...html.matchAll(/src="\.\/([^\/][^"]*\.(?:jpg|jpeg|png|gif|svg|webp))"/g)];
rootImgs.forEach(m => {
    const ref = m[1];
    if (!exists(ref)) {
        // Check if in img/
        const inImg = 'img/' + ref;
        if (exists(inImg)) {
            console.log('  FIX: ' + ref + ' -> ' + inImg);
        } else {
            console.log('  MISS: ' + ref);
        }
    }
});

console.log('\nDone.');
