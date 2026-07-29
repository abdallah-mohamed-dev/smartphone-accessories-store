const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';
const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
let changed = false;

// Build map of all files in img/
const imgDir = path.join(root, 'img');
const imgFiles = new Map();
fs.readdirSync(imgDir).forEach(f => imgFiles.set(f.toLowerCase(), f));

// ============ FIX 1: Inline CSS @font-face paths ============
// Fix 1a: wp-content/themes/woodmart/fonts/ -> fonts/
const fontThemeRegex = /url\(\\"\.\/wp-content\/themes\/woodmart\/fonts\/([^\\"]+)\\"\)/g;
html = html.replace(fontThemeRegex, (match, fontName) => {
    const fontClean = fontName.replace(/\?v=[\d.]+/, '');
    const fontPath = path.join(root, 'fonts', fontClean);
    if (fs.existsSync(fontPath)) {
        changed = true;
        return 'url("./fonts/' + fontClean + '")';
    }
    return match;
});

// Fix 1b: wp-content/uploads/sites/7/2022/04/hkgroteskpro-* and similar
const fontUploadRegex = /url\(\\"\.\/wp-content\/uploads\/sites\/7\/\d{4}\/\d{2}\/([^\\"]+)\\"\)/g;
html = html.replace(fontUploadRegex, (match, fontName) => {
    const fontPath = path.join(root, 'fonts', fontName);
    if (fs.existsSync(fontPath)) {
        changed = true;
        return 'url("./fonts/' + fontName + '")';
    }
    // Try wp-content/uploads/ directly
    const uploadPath = path.join(root, 'wp-content', 'uploads', 'sites', '7', '2022', '04', fontName);
    if (!fs.existsSync(uploadPath) && path.join(root, 'fonts', fontName)) {
        // just try to find the file anywhere
        const findResult = findFile(fontName);
        if (findResult) {
            changed = true;
            return 'url("./' + findResult + '")';
        }
    }
    return match;
});

// ============ FIX 2: Image paths with subdirectories ============
// Fix img/2022/08/xxx.jpg -> img/xxx.jpg (flat directory)
html = html.replace(/\.\/img\/\d{4}\/\d{2}\/([^"'\s?>]+\.(?:jpg|jpeg|png|gif|svg|webp))/gi, (match, basename) => {
    const lower = basename.toLowerCase();
    if (imgFiles.has(lower)) {
        changed = true;
        return './img/' + imgFiles.get(lower);
    }
    return match;
});

// ============ FIX 3: srcset images with subdirectories ============
html = html.replace(/(srcset="[^"]*?)(\.\/img\/\d{4}\/\d{2}\/)([^"\s,]+)/g, (match, prefix, _subdir, file) => {
    const lower = file.toLowerCase();
    if (imgFiles.has(lower)) {
        changed = true;
        return prefix + './img/' + imgFiles.get(lower);
    }
    return match;
});

// ============ FIX 4: Handle sized image variants (remove size suffix) ============
// For direct src references that don't exist, try base image
// Pattern: filename-123x456.ext -> filename.ext
const allImgRefs = [...html.matchAll(/src="\.\/(img\/[^"]+\.(?:jpg|jpeg|png|gif|webp))"/g)];
allImgRefs.forEach(m => {
    const ref = m[1];
    const fullPath = path.join(root, ref);
    if (!fs.existsSync(fullPath)) {
        const baseName = path.basename(ref).replace(/-\d+x\d+(?=\.\w+)/, '');
        const baseDir = path.dirname(ref);
        const baseRef = baseDir + '/' + baseName;
        const baseFullPath = path.join(root, baseRef);
        if (fs.existsSync(baseFullPath)) {
            // Replace the sized variant with base image
            const oldStr = m[0];
            const newStr = 'src="./' + baseRef + '"';
            html = html.replace(oldStr, newStr);
            changed = true;
        }
    }
});

// ============ FIX 5: Handle images without img/ prefix ============
const rootLevelImgs = [...html.matchAll(/src="\.\/([^"\/][^"]*\.(?:jpg|jpeg|png|gif|svg|webp))"/g)];
rootLevelImgs.forEach(m => {
    const ref = m[1];
    const fullPath = path.join(root, ref);
    if (!fs.existsSync(fullPath)) {
        // Try with img/ prefix
        const inImg = 'img/' + ref;
        if (fs.existsSync(path.join(root, inImg))) {
            const oldStr = m[0];
            const newStr = 'src="./' + inImg + '"';
            html = html.replace(oldStr, newStr);
            changed = true;
        }
    }
});

// ============ FIX 6: data-src attributes ============
const dataSrcRefs = [...html.matchAll(/data-src="\.\/([^"]+\.(?:jpg|jpeg|png|gif|svg|webp))"/g)];
dataSrcRefs.forEach(m => {
    const ref = m[1];
    const fullPath = path.join(root, ref);
    if (!fs.existsSync(fullPath)) {
        // Try removing size suffix
        const dirName = path.dirname(ref);
        const baseName = path.basename(ref).replace(/-\d+x\d+(?=\.\w+)/, '');
        const baseRef = dirName + '/' + baseName;
        if (fs.existsSync(path.join(root, baseRef))) {
            html = html.replace(m[0], 'data-src="./' + baseRef + '"');
            changed = true;
        }
        // Try flat img/ without subdir
        const justBase = path.basename(ref);
        if (imgFiles.has(justBase.toLowerCase())) {
            html = html.replace(m[0], 'data-src="./img/' + imgFiles.get(justBase.toLowerCase()) + '"');
            changed = true;
        }
    }
});

// ============ FIX 7: Handle srcset size variants ============
html = html.replace(/(srcset="[^"]*?)("[^"]*?\.(?:jpg|jpeg|png|gif|webp))/g, (match, prefix, suffix) => {
    // Check each URL in srcset
    let newSrcset = '';
    const urls = match.replace(/^srcset="/, '').replace(/"$/, '').split(',');
    let srcsetChanged = false;
    const newUrls = urls.map(entry => {
        let [url, ...sizeParts] = entry.trim().split(' ');
        const size = sizeParts.join(' ');
        
        // If url starts with ./
        if (url.startsWith('./')) {
            const fp = path.join(root, url.substring(2));
            if (!fs.existsSync(fp)) {
                // Try base name (remove size suffix)
                const dir = path.dirname(url);
                const base = path.basename(url).replace(/-\d+x\d+(?=\.\w+)/, '');
                const newUrl = dir + '/' + base;
                if (fs.existsSync(path.join(root, newUrl.substring(2)))) {
                    srcsetChanged = true;
                    return './' + newUrl + ' ' + size;
                }
            }
        }
        return entry.trim();
    });
    
    if (srcsetChanged) {
        changed = true;
        return 'srcset="' + newUrls.join(', ') + '"';
    }
    return match;
});

if (changed) {
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('Fixed root index.html - all applicable 404 fixes applied.');
} else {
    console.log('No changes needed.');
}

function findFile(name) {
    // Search in known directories
    const dirs = ['fonts', 'img', 'wp-content/uploads', 'css', 'js'];
    for (const d of dirs) {
        const fp = path.join(root, d, name);
        if (fs.existsSync(fp)) return d + '/' + name;
    }
    return null;
}

console.log('Done.');
