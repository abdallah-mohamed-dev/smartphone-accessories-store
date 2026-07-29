const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';
const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
let changed = false;

// Build flat image map
const imgDir = path.join(root, 'img');
const flatImgs = new Map();
fs.readdirSync(imgDir).forEach(f => flatImgs.set(f.toLowerCase(), f));

// ========== FIX 1: Inline CSS font paths ==========
// Pattern: url("./wp-content/themes/woodmart/fonts/fontname.woff2?v=...")
// Also: url("../wp-content/uploads/sites/7/2022/04/fontname.woff2")
// The CSS uses literal " quotes inside the style tag

// Fix ./wp-content/themes/woodmart/fonts/ paths
html = html.replace(/url\("\.\/wp-content\/themes\/woodmart\/fonts\/([^")\?]+)(\?[^"]*)?"\)/g, (match, fontName) => {
    const fontPath = path.join(root, 'fonts', fontName);
    if (fs.existsSync(fontPath)) {
        changed = true;
        return 'url("./fonts/' + fontName + '")';
    }
    return match;
});

// Fix ../wp-content/uploads/sites/7/YYYY/MM/ paths
html = html.replace(/url\("\.\.\/wp-content\/uploads\/sites\/7\/\d{4}\/\d{2}\/([^")]+)"\)/g, (match, fontName) => {
    const fontPath = path.join(root, 'fonts', fontName);
    if (fs.existsSync(fontPath)) {
        changed = true;
        return 'url("./fonts/' + fontName + '")';
    }
    return match;
});

// ========== FIX 2: Sized image variants ==========
// For any missing image in img/ with a -123x456 suffix, try the base image
function fixSizedImage(ref) {
    const refLower = ref.toLowerCase();
    // Check if file exists
    if (fs.existsSync(path.join(root, ref))) return null;
    
    // Try to find base image
    const baseName = path.basename(ref).replace(/-\d+x\d+(?=\.\w+)/, '');
    const dir = path.dirname(ref);
    const baseRef = dir + '/' + baseName;
    
    if (fs.existsSync(path.join(root, baseRef))) {
        return baseRef;
    }
    
    // Try flat img/ directory
    const flatName = flatImgs.get(baseName.toLowerCase());
    if (flatName) {
        return 'img/' + flatName;
    }
    
    // Try the base name directly in img/ (might have different case)
    if (flatImgs.has(baseName.toLowerCase())) {
        return 'img/' + flatImgs.get(baseName.toLowerCase());
    }
    
    return null;
}

// Fix src attributes
html = html.replace(/src="(\.\/img\/[^"]+\.(?:jpe?g|png|gif|webp))"/gi, (match, ref) => {
    const fixed = fixSizedImage(ref);
    if (fixed) {
        changed = true;
        return 'src="./' + fixed + '"';
    }
    return match;
});

// Fix srcset attributes (process each URL within srcset)
html = html.replace(/srcset="([^"]+)"/gi, (match, srcsetVal) => {
    const urls = srcsetVal.split(',').map(s => s.trim());
    let newUrls = [];
    let srcsetChanged = false;
    
    urls.forEach(entry => {
        const parts = entry.trim().split(/\s+/);
        const url = parts[0];
        const descriptor = parts.slice(1).join(' ');
        
        if (url.startsWith('./img/')) {
            const fixed = fixSizedImage(url.substring(2));
            if (fixed) {
                newUrls.push('./' + fixed + (descriptor ? ' ' + descriptor : ''));
                srcsetChanged = true;
                return;
            }
        }
        newUrls.push(entry);
    });
    
    if (srcsetChanged) {
        changed = true;
        return 'srcset="' + newUrls.join(', ') + '"';
    }
    return match;
});

// Fix data-src attributes
html = html.replace(/data-src="(\.\/img\/[^"]+\.(?:jpe?g|png|gif|webp))"/gi, (match, ref) => {
    const fixed = fixSizedImage(ref);
    if (fixed) {
        changed = true;
        return 'data-src="./' + fixed + '"';
    }
    return match;
});

// ========== FIX 3: Images without img/ prefix (root level images) ==========
html = html.replace(/src="\.\/([a-z][^"\/]*\.(?:jpe?g|png|gif|svg|webp))"/gi, (match, fileName) => {
    // Skip if it already has img/ or other known prefix
    if (fileName.startsWith('img/') || fileName.startsWith('css/') || fileName.startsWith('js/')) return match;
    
    // Check if file exists directly at root
    if (fs.existsSync(path.join(root, fileName))) return match;
    
    // Check in img/
    if (flatImgs.has(fileName.toLowerCase())) {
        changed = true;
        return 'src="./img/' + flatImgs.get(fileName.toLowerCase()) + '"';
    }
    
    return match;
});

// ========== FIX 4: Remove query strings from font URls in preload links ==========
// Already handled the inline CSS but let's also check href attributes

if (changed) {
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('Fixes applied successfully.');
} else {
    console.log('No changes were needed for remaining issues.');
}

// Final verification
console.log('\n=== Final verification ===');
const verifyHtml = fs.readFileSync(htmlPath, 'utf8');

// Count missing JS
const jsRefs = [...verifyHtml.matchAll(/src="\.\/(js\/[^"]*)"/g)];
let jsMissing = 0;
jsRefs.forEach(m => { if (!fs.existsSync(path.join(root, m[1]))) { console.log('  MISS JS: ' + m[1]); jsMissing++; } });

// Count missing CSS
const cssRefs = [...verifyHtml.matchAll(/href="\.\/(css\/[^"]*)"/g)];
let cssMissing = 0;
cssRefs.forEach(m => { if (!fs.existsSync(path.join(root, m[1]))) { console.log('  MISS CSS: ' + m[1]); cssMissing++; } });

// Count missing images
const imgRefs = [...verifyHtml.matchAll(/src="\.\/(img\/[^"]*\.(?:jpe?g|png|gif|svg|webp))"/gi)];
let imgMissing = 0;
imgRefs.forEach(m => { if (!fs.existsSync(path.join(root, m[1]))) { imgMissing++; } });

// Count missing srcset images with size suffixes
const srcsetRefs = [...verifyHtml.matchAll(/srcset="([^"]+)"/g)];
let srcsetMissing = 0;
srcsetRefs.forEach(m => {
    m[1].split(',').forEach(s => {
        const url = s.trim().split(/\s+/)[0];
        if (url.startsWith('./img/')) {
            const fp = path.join(root, url.substring(2));
            if (!fs.existsSync(fp)) { srcsetMissing++; }
        }
    });
});

// Count missing font references
const fontRefs = [...verifyHtml.matchAll(/url\("([^"]+\.woff2?)"\)/g)];
let fontMissing = 0;
fontRefs.forEach(m => {
    let ref = m[1];
    if (ref.startsWith('./')) ref = ref.substring(2);
    if (!fs.existsSync(path.join(root, ref))) { console.log('  MISS FONT: ' + ref); fontMissing++; }
});

console.log('JS: ' + jsRefs.length + ' refs, ' + jsMissing + ' missing');
console.log('CSS: ' + cssRefs.length + ' refs, ' + cssMissing + ' missing');
console.log('Images (src): ' + imgRefs.length + ' refs, ' + imgMissing + ' missing (sized variants)');
console.log('Images (srcset): ' + srcsetMissing + ' sized variants missing');
console.log('Fonts: ' + fontRefs.length + ' refs, ' + fontMissing + ' missing');
console.log('Done.');
