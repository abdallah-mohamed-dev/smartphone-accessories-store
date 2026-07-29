const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';

// 1. Fix root index.html remaining domain refs
const rootHtml = path.join(root, 'index.html');
let c = fs.readFileSync(rootHtml, 'utf8');
let changed = false;

// Fix oembed URLs (these are %-encoded)
// href="./wp-json/oembed/1.0/embed?url=https%3A%2F%2Fwoodmart.xtemos.com%2Faccessories%2F"
// Replace the domain part in the URL parameter
const oembedPattern1 = /url=https%3A%2F%2Fwoodmart\.xtemos\.com%2F([^"&\s]+)/g;
c = c.replace(oembedPattern1, 'url=https%3A%2F%2Flocalhost%2F$1');
changed = true;

// Fix ExactMetrics page_referrer (escaped JSON)
c = c.replace(/"page_referrer":\s*"https?:\\\/\\\/woodmart\.xtemos\.com\\\/"/g, '"page_referrer": ""');

if (changed) {
    fs.writeFileSync(rootHtml, c, 'utf8');
    console.log('Fixed root index.html domain refs');
}

// 2. Find and fix all missing images
// Check what images exist
const imgDir = path.join(root, 'img');
const imgFiles = fs.readdirSync(imgDir).map(f => f.toLowerCase());
const missingImgNames = ['accessories-inst-2.jpg', 'accessories-inst-3.jpg', 'accessories-inst-4.jpg', 'accessories-inst-6.jpg', 'accessories-inst-7.jpg'];

missingImgNames.forEach(name => {
    const nameLower = name.toLowerCase();
    // Try to find a similar file
    const similar = imgFiles.filter(f => {
        const base = f.replace(/-\d+x\d+(?=\.\w+)/, '');
        const targetBase = nameLower.replace(/-\d+x\d+(?=\.\w+)/, '');
        return base === targetBase || f.includes('accessories-inst');
    });
    console.log('Missing: ' + name + ' | Similar files: ' + similar.join(', '));
});

// 3. Fix subpages domain refs
function fixSubpages() {
    function findHtmlFiles(dir) {
        let results = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const e of entries) {
                const fp = path.join(dir, e.name);
                if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== 'css' && e.name !== 'js' && e.name !== 'img' && e.name !== 'fonts' && e.name !== 'plugins' && e.name !== 'html') {
                    results = results.concat(findHtmlFiles(fp));
                } else if (e.name.endsWith('.html')) {
                    results.push(fp);
                }
            }
        } catch (e) {}
        return results;
    }

    const files = findHtmlFiles(root).filter(f => f !== rootHtml);
    let fixedCount = 0;
    
    files.forEach(fp => {
        let content = fs.readFileSync(fp, 'utf8');
        let changed = false;

        // Fix non-escaped domain refs (with or without trailing slash)
        const newContent = content.replace(/https?:\/\/woodmart\.xtemos\.com\/?/g, '/');
        if (newContent !== content) {
            content = newContent;
            changed = true;
        }

        // Fix escaped JSON domain refs
        const newContent2 = content.replace(/https?:\\\/\\\/woodmart\.xtemos\.com\\/g, '');
        if (newContent2 !== content) {
            content = newContent2;
            changed = true;
        }

        // Fix ExactMetrics page_referrer
        const newContent3 = content.replace(/"page_referrer":\s*"https?:\\\/\\\/woodmart\.xtemos\.com\\\/"/g, '"page_referrer": ""');
        if (newContent3 !== content) {
            content = newContent3;
            changed = true;
        }

        // Fix oembed %-encoded URLs
        const newContent4 = content.replace(/url=https?%3A%2F%2Fwoodmart\.xtemos\.com%2F([^"&\s]+)/g, 'url=https%3A%2F%2Flocalhost%2F$1');
        if (newContent4 !== content) {
            content = newContent4;
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(fp, content, 'utf8');
            fixedCount++;
        }
    });
    return fixedCount;
}

const fixed = fixSubpages();
console.log('Fixed ' + fixed + ' subpages');
