const fs = require('fs');
const path = require('path');
const https = require('https');

const LOCAL_ROOT = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';
const BASE_URL = 'https://woodmart.xtemos.com/accessories';
const DOMAIN_URL = 'https://woodmart.xtemos.com';

// Files to download
const EXTRA_DOWNLOADS = [
    // Favicon
    { url: 'https://woodmart.xtemos.com/wp-content/uploads/2021/06/cropped-woodmart-favicon-512px.png', dest: 'img/cropped-woodmart-favicon-512px.png' },
    // Uploaded fonts (not in sites/7/)
    { url: 'https://woodmart.xtemos.com/accessories/wp-content/uploads/sites/7/2022/04/hkgroteskpro-semibold.woff2', dest: 'fonts/hkgroteskpro-semibold.woff2' },
    { url: 'https://woodmart.xtemos.com/accessories/wp-content/uploads/sites/7/2022/04/hkgroteskpro-semibold.woff', dest: 'fonts/hkgroteskpro-semibold.woff' },
    { url: 'https://woodmart.xtemos.com/accessories/wp-content/uploads/sites/7/2022/09/Jost-Regular.woff2', dest: 'fonts/Jost-Regular.woff2' },
    { url: 'https://woodmart.xtemos.com/accessories/wp-content/uploads/sites/7/2022/09/Jost-SemiBold.woff2', dest: 'fonts/Jost-SemiBold.woff2' },
    { url: 'https://woodmart.xtemos.com/accessories/wp-content/uploads/sites/7/2022/09/Jost-Bold.woff2', dest: 'fonts/Jost-Bold.woff2' },
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(LOCAL_ROOT, dest);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (fs.existsSync(fullPath)) { resolve('skipped'); return; }
        
        const file = fs.createWriteStream(fullPath);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                file.close();
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                download(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                file.close();
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                reject(new Error(`HTTP ${response.statusCode}: ${url}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => { file.close(); resolve('downloaded'); });
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            reject(err);
        });
    });
}

function getRelativePrefix(filePath) {
    const relative = path.relative(LOCAL_ROOT, filePath);
    const depth = relative.split(path.sep).length - 1;
    return depth > 0 ? '../'.repeat(depth) : './';
}

function fixFile(filePath) {
    const prefix = getRelativePrefix(filePath);
    let html = fs.readFileSync(filePath, 'utf8');
    const original = html;

    // 1. Fix protocol-relative URLs: //woodmart.xtemos.com/accessories/...
    html = html.replace(/\/\/woodmart\.xtemos\.com\/accessories\//g, prefix);
    
    // 2. Fix escaped-slash URLs: https:\/\/woodmart.xtemos.com\/accessories\/
    html = html.replace(/https:\\\/\\\/woodmart\\.xtemos\\.com\\\/accessories\\\//g, prefix.replace(/\//g, '\\/'));
    
    // 3. Fix regular URLs: https://woodmart.xtemos.com/accessories/...
    html = html.replace(/https:\/\/woodmart\.xtemos\.com\/accessories\//g, prefix);
    
    // 4. Fix woodmart.xtemos.com without /accessories/ subpath (favicon, etc.)
    html = html.replace(/https:\/\/woodmart\.xtemos\.com\/wp-content\//g, prefix + 'wp-content/');
    
    // 5. Fix ExactMetrics home_url
    html = html.replace(/"home_url":"[^"]*"/g, `"home_url":"${prefix.replace(/\/$/, '')}"`);
    html = html.replace(/"page_location":"[^"]*"/g, `"page_location":"${prefix}shop/"`);
    
    // 6. Fix cart_url in woodmart_settings
    html = html.replace(/"cart_url":"[^"]*"/g, `"cart_url":"${prefix}cart/"`);
    html = html.replace(/"ajaxurl":"[^"]*"/g, `"ajaxurl":"${prefix}wp-admin/admin-ajax.php"`);
    html = html.replace(/"menu_storage_key":"[^"]*"/g, `"menu_storage_key":"woodmart_local"`);
    
    // 7. Fix JS files - remove .download extension addition (revert the old change)
    html = html.replace(/\.js\.download/g, '.js');

    // 8. Fix CSS font-face src URLs (already handled by URL replacement above)
    
    // 9. Fix @id references in JSON-LD (escaped slashes)
    html = html.replace(/"@id":"[^"]*\\\/accessories\\\//g, `"@id":"${prefix.replace(/\//g, '\\/')}`);
    html = html.replace(/"url":"[^"]*\\\/accessories\\\//g, `"url":"${prefix.replace(/\//g, '\\/')}`);
    html = html.replace(/"@id":"[^"]*\/accessories\//g, `"@id":"${prefix}`);
    html = html.replace(/"url":"[^"]*\/accessories\//g, `"url":"${prefix}`);
    
    // 10. Fix contentUrl / thumbnailUrl / image in JSON
    html = html.replace(/"contentUrl":"[^"]*\\\/accessories\\\//g, `"contentUrl":"${prefix.replace(/\//g, '\\/')}`);
    html = html.replace(/"thumbnailUrl":"[^"]*\\\/accessories\\\//g, `"thumbnailUrl":"${prefix.replace(/\//g, '\\/')}`);
    
    // 11. Fix item / name->item in breadcrumb JSON
    html = html.replace(/"item":"[^"]*\\\/accessories\\\//g, `"item":"${prefix.replace(/\//g, '\\/')}`);
    html = html.replace(/"item":"[^"]*\/accessories\//g, `"item":"${prefix}`);
    
    // 12. Fix @type SearchAction target/template
    html = html.replace(/"urlTemplate":"[^"]*"/g, `"urlTemplate":"${prefix}?s={search_term_string}"`);
    
    // 13. Fix potentialAction target arrays
    html = html.replace(/"target":\["[^"]*\\\/accessories\\\//g, `"target":["${prefix.replace(/\//g, '\\/')}`);
    html = html.replace(/"target":\["[^"]*\/accessories\//g, `"target":["${prefix}`);

    // 14. Fix image references in JSON (@id pattern)
    html = html.replace(/"@id":"[^"]*\\\/#primaryimage"/g, `"@id":"${prefix.replace(/\//g, '\\/')}#primaryimage"`);
    html = html.replace(/"@id":"[^"]*\/#primaryimage"/g, `"@id":"${prefix}#primaryimage"`);
    html = html.replace(/"@id":"[^"]*\\\/#breadcrumb"/g, `"@id":"${prefix.replace(/\//g, '\\/')}#breadcrumb"`);
    html = html.replace(/"@id":"[^"]*\/#breadcrumb"/g, `"@id":"${prefix}#breadcrumb"`);
    html = html.replace(/"@id":"[^"]*\\\/#website"/g, `"@id":"${prefix.replace(/\//g, '\\/')}#website"`);
    html = html.replace(/"@id":"[^"]*\/#website"/g, `"@id":"${prefix}#website"`);

    // 15. Fix ExactMetrics js_events_tracking inline_paths
    html = html.replace(/\\\/go\\\//g, '/go/');
    html = html.replace(/\\\/recommend\\\//g, '/recommend/');
    
    // 16. Fix any remaining woodmart.xtemos.com in non-URL contexts
    // (should be handled by above replacements)

    if (html !== original) {
        fs.writeFileSync(filePath, html, 'utf8');
        return true;
    }
    return false;
}

async function main() {
    // Step 1: Download extra files
    console.log('=== Downloading extra files (favicon, fonts) ===');
    for (const dl of EXTRA_DOWNLOADS) {
        try {
            const result = await download(dl.url, dl.dest);
            console.log(`  ${result}: ${dl.dest}`);
        } catch (err) {
            console.log(`  FAIL: ${dl.dest} - ${err.message}`);
        }
    }

    // Step 2: Fix all HTML files
    console.log('\n=== Fixing all HTML files ===');
    const htmlFiles = [];
    function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && !['css','js','img','fonts','plugins','wp-content','wp-admin','wp-includes'].includes(entry.name)) {
                walk(fullPath);
            } else if (entry.isFile() && entry.name === 'index.html') {
                htmlFiles.push(fullPath);
            }
        }
    }
    walk(LOCAL_ROOT);
    
    console.log(`Found ${htmlFiles.length} HTML files`);
    let fixed = 0;
    for (const file of htmlFiles) {
        if (fixFile(file)) {
            fixed++;
            if (fixed % 10 === 0) console.log(`  Fixed ${fixed}...`);
        }
    }
    console.log(`Fixed ${fixed} files`);
    
    // Step 3: Verify remaining references
    console.log('\n=== Verification ===');
    let remaining = 0;
    for (const file of htmlFiles) {
        const html = fs.readFileSync(file, 'utf8');
        const relPath = path.relative(LOCAL_ROOT, file);
        if (html.includes('woodmart.xtemos.com')) {
            remaining++;
            if (remaining <= 3) {
                console.log(`  REMAINING in ${relPath}:`);
                const lines = html.split('\n');
                lines.forEach((line, i) => {
                    if (line.includes('woodmart.xtemos.com')) {
                        console.log(`    Line ${i+1}: ${line.trim().substring(0, 150)}`);
                    }
                });
            }
        }
    }
    console.log(`Files with remaining references: ${remaining}`);
    console.log('\nDone!');
}

main().catch(console.error);
