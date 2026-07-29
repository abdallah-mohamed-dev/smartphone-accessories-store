const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';
const htmlDir = path.join(root, 'html');

// Check if html dir exists
if (!fs.existsSync(htmlDir)) {
    console.log('No html dir found');
    process.exit(0);
}

const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

// Fix font reference in root index.html
const rootHtml = path.join(root, 'index.html');
if (fs.existsSync(rootHtml)) {
    let content = fs.readFileSync(rootHtml, 'utf8');
    const oldFont = 'fonts/woodmart-font-1-400.woff2?v=8.5.5';
    if (content.includes(oldFont)) {
        // Check if font file exists without query string
        const fontName = 'fonts/woodmart-font-1-400.woff2';
        if (fs.existsSync(path.join(root, 'fonts', 'woodmart-font-1-400.woff2'))) {
            content = content.replace(oldFont, fontName);
            fs.writeFileSync(rootHtml, content, 'utf8');
            console.log('Fixed font reference in root index.html');
        }
    }
}

// Fix subpages
let totalFixed = 0;
let totalChecked = 0;

files.forEach(f => {
    const filePath = path.join(htmlDir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix JS references that need .download extension
    // Match: src="../js/whatever.js"  or  src="js/whatever.js"
    const jsRefs = [...content.matchAll(/(src=['"])((?:\.\.\/)?)(js\/[^'"]*\.js)(['"])/g)];
    jsRefs.forEach(match => {
        const fullMatch = match[0];
        const quote1 = match[1];
        const prefix = match[2];  // ../ or empty
        const refPath = match[3];  // js/whatever.js
        const quote2 = match[4];

        // Check if .download version exists
        const fullPath = path.join(root, prefix ? path.join(root, prefix, refPath) : refPath);
        const absPath = path.resolve(root, prefix, refPath);
        const dlPath = absPath + '.download';
        if (fs.existsSync(dlPath) && !fs.existsSync(absPath)) {
            const newRef = `${quote1}${prefix}${refPath}.download${quote2}`;
            content = content.replace(fullMatch, newRef);
            changed = true;
            totalFixed++;
        }
    });

    // Fix font refs (remove query strings)
    content = content.replace(/fonts\/woodmart-font-1-400\.woff2\?v=[\d.]+/g, 'fonts/woodmart-font-1-400.woff2');
    if (content.includes('fonts/woodmart-font-1-400.woff2?v=')) {
        // already handled
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
    totalChecked++;
});

console.log(`Checked ${totalChecked} subpages, fixed ${totalFixed} JS references`);
