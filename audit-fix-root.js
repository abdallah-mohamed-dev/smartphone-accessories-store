const fs = require('fs');
const path = require('path');
const LOCAL_ROOT = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';
const rootHtml = path.join(LOCAL_ROOT, 'index.html');

// First, let's understand what the root index.html references
let html = fs.readFileSync(rootHtml, 'utf8');

// Extract all JS references (src="./js/...")
const jsRefs = [...html.matchAll(/src="\.\/([^"]*\.(?:js|js\.download)[^"]*)"/g)].map(m => m[1]);
const cssRefs = [...html.matchAll(/href="\.\/([^"]*\.css[^"]*)"/g)].map(m => m[1]);
const imgRefs = [...html.matchAll(/src="\.\/([^"]*\.(?:jpg|jpeg|png|gif|svg|webp)[^"]*)"/g)].map(m => m[1]);
const fontRefs = [...html.matchAll(/href="\.\/([^"]*\.(?:woff2?|ttf|eot)[^"]*)"/g)].map(m => m[1]);

console.log('=== Root index.html references ===');
console.log(`JS files referenced: ${jsRefs.length}`);
console.log(`CSS files referenced: ${cssRefs.length}`);
console.log(`Images referenced: ${imgRefs.length}`);
console.log(`Fonts referenced: ${fontRefs.length}`);

// Check which files actually exist locally
function checkFile(subpath) {
    const fullPath = path.join(LOCAL_ROOT, subpath);
    if (fs.existsSync(fullPath)) return 'OK';
    // Try with .download extension for JS
    if (fullPath.endsWith('.js')) {
        const dlPath = fullPath + '.download';
        if (fs.existsSync(dlPath)) return 'HAS_DOWNLOAD';
    }
    // Try without .download
    if (fullPath.endsWith('.js.download')) {
        const noDl = fullPath.replace(/\.download$/, '');
        if (fs.existsSync(noDl)) return 'NO_DOWNLOAD';
    }
    return 'MISSING';
}

console.log('\n=== Checking JS files ===');
let jsMissing = 0, jsHasDownload = 0, jsOk = 0, jsNoDownload = 0;
jsRefs.forEach(ref => {
    const result = checkFile(ref);
    switch (result) {
        case 'OK': jsOk++; break;
        case 'HAS_DOWNLOAD': jsHasDownload++; break;
        case 'NO_DOWNLOAD': jsNoDownload++; break;
        case 'MISSING': 
            jsMissing++;
            // Also check in plugins/
            const pluginPath = ref.replace(/^js\//, 'plugins/');
            if (fs.existsSync(path.join(LOCAL_ROOT, pluginPath))) {
                console.log(`  PLUGIN: ${ref} -> ${pluginPath}`);
            } else {
                console.log(`  MISSING: ${ref}`);
            }
            break;
    }
});
console.log(`JS: ${jsOk} ok, ${jsHasDownload} need .download ext, ${jsNoDownload} no .download needed, ${jsMissing} missing`);

console.log('\n=== Checking CSS files ===');
let cssMissing = 0, cssOk = 0;
cssRefs.forEach(ref => {
    const fullPath = path.join(LOCAL_ROOT, ref);
    if (fs.existsSync(fullPath)) {
        cssOk++;
    } else {
        // Check in parts/
        const partsPath = ref.replace(/^css\//, 'css/parts/');
        if (fs.existsSync(path.join(LOCAL_ROOT, partsPath))) {
            cssOk++;
            console.log(`  PARTS: ${ref} -> ${partsPath}`);
        } else {
            // Check in new css/parts/ without subdirs  
            const filename = path.basename(ref);
            const partsFile = `css/parts/${filename}`;
            if (fs.existsSync(path.join(LOCAL_ROOT, partsFile))) {
                cssOk++;
                console.log(`  PARTS-OK: ${ref} -> ${partsFile}`);
            } else {
                cssMissing++;
                console.log(`  MISSING: ${ref}`);
            }
        }
    }
});
console.log(`CSS: ${cssOk} ok, ${cssMissing} missing`);

console.log('\n=== Checking Image files ===');
let imgMissing = 0, imgOk = 0;
const imgDir = path.join(LOCAL_ROOT, 'img');
const existingImgs = new Set(fs.readdirSync(imgDir).map(f => f.toLowerCase()));
const existingUploads = new Set();
// Also check wp-content/uploads if it exists
const uploadsDir = path.join(LOCAL_ROOT, 'wp-content', 'uploads');
if (fs.existsSync(uploadsDir)) {
    function walkUploads(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
            const fp = path.join(dir, e.name);
            if (e.isDirectory()) walkUploads(fp);
            else existingUploads.add(e.name.toLowerCase());
        }
    }
    walkUploads(uploadsDir);
}

imgRefs.forEach(ref => {
    const filename = path.basename(ref).toLowerCase();
    if (existingImgs.has(filename)) {
        imgOk++;
    } else if (existingUploads.has(filename)) {
        imgOk++;
    } else {
        // Check without size suffix
        const baseName = filename.replace(/-\d+x\d+(?=\.(jpg|jpeg|png|gif|webp))/, '');
        if (existingImgs.has(baseName)) {
            imgOk++;
            console.log(`  SIZE-MISMATCH: ${ref} -> using base ${baseName}`);
        } else {
            imgMissing++;
            console.log(`  MISSING: ${ref}`);
        }
    }
});
console.log(`Images: ${imgOk} ok, ${imgMissing} missing`);

console.log('\n=== Checking Font files ===');
let fontOk = 0, fontMissing = 0;
fontRefs.forEach(ref => {
    const fullPath = path.join(LOCAL_ROOT, ref);
    if (fs.existsSync(fullPath)) {
        fontOk++;
    } else {
        fontMissing++;
        console.log(`  MISSING: ${ref}`);
    }
});
console.log(`Fonts: ${fontOk} ok, ${fontMissing} missing`);

// FIX THE ISSUES
console.log('\n=== APPLYING FIXES ===');

// 1. Fix JS files - add .download extension back
let fixedJs = 0;
jsRefs.forEach(ref => {
    const fullPath = path.join(LOCAL_ROOT, ref);
    const dlPath = fullPath + '.download';
    if (!fs.existsSync(fullPath) && fs.existsSync(dlPath)) {
        // Replace the reference to add .download
        const search = `src="./${ref}"`;
        const replace = `src="./${ref}.download"`;
        if (html.includes(search)) {
            html = html.replace(search, replace);
            fixedJs++;
        } else if (html.includes(`src='./${ref}'`)) {
            html = html.replace(`src='./${ref}'`, `src='./${ref}.download'`);
            fixedJs++;
        }
    }
});
console.log(`Fixed JS references: ${fixedJs}`);

// 2. Fix missing images by checking with the right names
let fixedImg = 0;
imgRefs.forEach(ref => {
    const filename = path.basename(ref).toLowerCase();
    const baseName = filename.replace(/-\d+x\d+(?=\.(jpg|jpeg|png|gif|webp))/, '');
    if (!existingImgs.has(filename) && existingImgs.has(baseName)) {
        // Image missing at specific size, but base exists
        // Replace the reference to point to base image
        const refEscaped = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const oldFilename = path.basename(ref);
        const newRef = ref.replace(oldFilename, baseName);
        html = html.replace(new RegExp(`src="\\.\\/${refEscaped}"`, 'g'), `src="./${newRef}"`);
        fixedImg++;
    }
});
console.log(`Fixed image references: ${fixedImg}`);

// Write fixed HTML
fs.writeFileSync(rootHtml, html, 'utf8');
console.log('Root index.html updated!');
