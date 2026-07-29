const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';

// Find all HTML files
function findHtmlFiles(dir, depth = 0) {
    if (depth > 5) return [];
    let results = [];
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
            const fp = path.join(dir, e.name);
            if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
                results = results.concat(findHtmlFiles(fp, depth + 1));
            } else if (e.name.endsWith('.html') || e.name.endsWith('.htm')) {
                results.push(fp);
            }
        }
    } catch (e) {}
    return results;
}

const htmlFiles = findHtmlFiles(root).filter(f => f !== path.join(root, 'index.html'));
console.log(`Found ${htmlFiles.length} HTML subpage files`);

let totalJsFixed = 0;
let totalDomainsFixed = 0;
let totalJsonFixed = 0;

htmlFiles.forEach(fp => {
    let content = fs.readFileSync(fp, 'utf8');
    let changed = false;

    // Determine depth: relative to root
    const relPath = path.relative(root, fp);
    const depth = relPath.split(path.sep).length - 1; // number of dir levels
    const prefix = depth > 0 ? '../'.repeat(depth) : '';

    // Fix 1: JS references that need .download
    // Subpages reference like: src="../js/script.js"
    const jsRefs = [...content.matchAll(/(src=["'])((?:\.\.\/)*)(js\/[^"']*\.js)(["'])/g)];
    jsRefs.forEach(match => {
        const fullMatch = match[0];
        const q1 = match[1];
        const pfx = match[2]; // e.g. "../" or "../../"
        const refPath = match[3];
        const q2 = match[4];

        // Build absolute path
        const absPath = path.resolve(path.dirname(fp), pfx, refPath);
        const dlPath = absPath + '.download';
        if (fs.existsSync(dlPath) && !fs.existsSync(absPath)) {
            const newRef = `${q1}${pfx}${refPath}.download${q2}`;
            content = content.replace(fullMatch, newRef);
            changed = true;
            totalJsFixed++;
        }
    });

    // Fix 2: JS references already having .download (maybe ok)
    // Fix 3: Remove query strings from font URLs
    content = content.replace(/(fonts\/woodmart-font-1-400\.woff2)\?v=[\d.]+/g, '$1');

    // Fix 4: JSON-LD escaped URLs pointing to woodmart.xtemos.com
    const domainRegex = /https?:\\\/\\\/woodmart\.xtemos\.com\\/gi;
    if (domainRegex.test(content)) {
        content = content.replace(domainRegex, '');
        changed = true;
        totalJsonFixed++;
    }

    // Fix 5: Non-escaped JSON URLs
    const domainRegex2 = /https?:\/\/woodmart\.xtemos\.com\//gi;
    if (domainRegex2.test(content)) {
        content = content.replace(domainRegex2, '/');
        changed = true;
        totalDomainsFixed++;
    }

    if (changed) {
        fs.writeFileSync(fp, content, 'utf8');
    }
});

console.log(`Fixed ${totalJsFixed} JS references needing .download`);
console.log(`Fixed ${totalJsonFixed} JSON-LD escaped domain refs`);
console.log(`Fixed ${totalDomainsFixed} non-escaped domain refs`);

// Final verification on root index.html
const rootHtml = path.join(root, 'index.html');
let rootContent = fs.readFileSync(rootHtml, 'utf8');

// Check root index.html all JS files exist
const rootJsRefs = [...rootContent.matchAll(/src="\.\/([^"]*\.js[^"]*)"/g)];
let rootMissing = 0;
rootJsRefs.forEach(m => {
    const absPath = path.join(root, m[1]);
    if (!fs.existsSync(absPath)) {
        rootMissing++;
    }
});
console.log(`Root index.html: ${rootJsRefs.length} JS refs, ${rootMissing} missing`);
