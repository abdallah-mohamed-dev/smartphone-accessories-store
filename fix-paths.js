const fs = require('fs');
const path = require('path');
const https = require('https');

const LOCAL_ROOT = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';
const BASE_URL = 'https://woodmart.xtemos.com/accessories';

// Map of WordPress theme paths to local folders
const PATH_MAP = [
    { from: 'wp-content/themes/woodmart/css/', to: 'css/' },
    { from: 'wp-content/themes/woodmart/js/', to: 'js/' },
    { from: 'wp-content/themes/woodmart/fonts/', to: 'fonts/' },
    { from: 'wp-content/themes/woodmart/images/', to: 'img/' },
    { from: 'wp-content/uploads/sites/7/', to: 'img/' },
    { from: 'wp-content/plugins/', to: 'plugins/' },
];

// Get all HTML files excluding root
function getHtmlFiles() {
    const files = [];
    function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && entry.name !== 'css' && entry.name !== 'js' && entry.name !== 'img' && entry.name !== 'fonts' && entry.name !== 'plugins') {
                walk(fullPath);
            } else if (entry.isFile() && entry.name === 'index.html' && fullPath !== path.join(LOCAL_ROOT, 'index.html')) {
                files.push(fullPath);
            }
        }
    }
    walk(LOCAL_ROOT);
    return files;
}

// Download a file from URL to local path
function download(url, dest) {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                file.close();
                fs.unlinkSync(dest);
                download(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(dest);
                reject(new Error(`HTTP ${response.statusCode}: ${url}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(dest);
            });
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            reject(err);
        });
    });
}

// Extract all unique asset URLs from a page
function extractAssetUrls(html) {
    const urls = new Set();
    const regex = new RegExp(BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/([^"\'\\s<>)]+)', 'g');
    let match;
    while ((match = regex.exec(html)) !== null) {
        const url = match[1].split('?')[0]; // Remove query strings
        if (url.match(/\.(css|js|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp)(\?|$)/)) {
            urls.add(url);
        }
    }
    return [...urls];
}

// Calculate relative path prefix based on file depth
function getRelativePrefix(filePath) {
    const relative = path.relative(LOCAL_ROOT, filePath);
    const depth = relative.split(path.sep).length - 1; // -1 for the index.html itself
    return depth > 0 ? '../'.repeat(depth) : './';
}

// Fix paths in HTML content
function fixPaths(html, prefix) {
    let result = html;
    const escapedBase = BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace all absolute URLs with relative paths
    result = result.replace(new RegExp(escapedBase + '/', 'g'), prefix);
    
    // Fix specific asset mappings (theme CSS/JS to local)
    for (const mapping of PATH_MAP) {
        const fromPath = prefix + mapping.from;
        result = result.split(fromPath).join(prefix + mapping.to);
    }
    
    // Fix JS .download extension for local files
    result = result.replace(new RegExp('\\.js' + preg_quote('?') + '[^"\'\\s<>)]*', 'g'), '.js.download');
    
    // Fix woodmart_settings URLs
    result = result.replace(
        /"cart_url":"[^"]*"/g,
        `"cart_url":"${prefix}cart/"`
    );
    result = result.replace(
        /"ajaxurl":"[^"]*"/g,
        `"ajaxurl":"${prefix}wp-admin/admin-ajax.php"`
    );
    
    return result;
}

function preg_quote(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Main
async function main() {
    console.log('=== Phase 1: Extract all unique asset URLs ===');
    const allUrls = new Set();
    let totalFiles = 0;
    
    const htmlFiles = getHtmlFiles();
    console.log(`Found ${htmlFiles.length} subpage HTML files`);
    
    for (const file of htmlFiles) {
        const html = fs.readFileSync(file, 'utf8');
        const urls = extractAssetUrls(html);
        urls.forEach(u => allUrls.add(u));
        totalFiles++;
    }
    console.log(`Scanned ${totalFiles} files, found ${allUrls.size} unique asset URLs`);
    
    // Categorize
    const cssUrls = [...allUrls].filter(u => u.endsWith('.css'));
    const jsUrls = [...allUrls].filter(u => u.endsWith('.js'));
    const imgUrls = [...allUrls].filter(u => u.match(/\.(png|jpg|jpeg|gif|svg|webp)(\?|$)/));
    const fontUrls = [...allUrls].filter(u => u.match(/\.(woff2?|ttf|eot)(\?|$)/));
    
    console.log(`CSS: ${cssUrls.length}, JS: ${jsUrls.length}, Images: ${imgUrls.length}, Fonts: ${fontUrls.length}`);
    
    // Phase 2: Download missing CSS/JS files from the live site (that we don't have locally)
    console.log('\n=== Phase 2: Download missing theme assets ===');
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;
    
    // Download CSS files from wp-content/themes/woodmart/css/
    for (const assetUrl of cssUrls.concat(jsUrls).concat(fontUrls)) {
        if (!assetUrl.startsWith('wp-content/themes/woodmart/') && !assetUrl.startsWith('wp-content/plugins/')) continue;
        
        // Determine local path
        let localRelative;
        if (assetUrl.startsWith('wp-content/themes/woodmart/css/')) {
            localRelative = 'css/' + assetUrl.replace('wp-content/themes/woodmart/css/', '');
        } else if (assetUrl.startsWith('wp-content/themes/woodmart/js/')) {
            localRelative = 'js/' + assetUrl.replace('wp-content/themes/woodmart/js/', '');
        } else if (assetUrl.startsWith('wp-content/themes/woodmart/fonts/')) {
            localRelative = 'fonts/' + assetUrl.replace('wp-content/themes/woodmart/fonts/', '');
        } else if (assetUrl.startsWith('wp-content/plugins/')) {
            localRelative = 'plugins/' + assetUrl.replace('wp-content/plugins/', '');
        } else {
            continue;
        }
        
        const localPath = path.join(LOCAL_ROOT, localRelative);
        
        // Check if file already exists (also check .download extension)
        if (fs.existsSync(localPath) || fs.existsSync(localPath + '.download')) {
            skipped++;
            continue;
        }
        
        const fullUrl = `${BASE_URL}/${assetUrl}`;
        try {
            await download(fullUrl, localPath);
            downloaded++;
            if (downloaded % 10 === 0) process.stdout.write('.');
        } catch (err) {
            failed++;
        }
    }
    console.log(`\nDownloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
    
    // Phase 3: Fix paths in all HTML files
    console.log('\n=== Phase 3: Fix paths in HTML files ===');
    let fixed = 0;
    for (const file of htmlFiles) {
        const prefix = getRelativePrefix(file);
        let html = fs.readFileSync(file, 'utf8');
        const fixedHtml = fixPaths(html, prefix);
        fs.writeFileSync(file, fixedHtml, 'utf8');
        fixed++;
        if (fixed % 10 === 0) console.log(`Fixed ${fixed}/${htmlFiles.length}...`);
    }
    console.log(`Fixed ${fixed} files`);
    
    // Phase 4: Also update root index.html internal links
    console.log('\n=== Phase 4: Update root index.html internal links ===');
    const rootHtmlPath = path.join(LOCAL_ROOT, 'index.html');
    if (fs.existsSync(rootHtmlPath)) {
        let rootHtml = fs.readFileSync(rootHtmlPath, 'utf8');
        // Replace absolute links in root index.html
        rootHtml = rootHtml.replace(
            new RegExp(preg_quote(BASE_URL) + '/', 'g'),
            './'
        );
        // Fix path prefix mapping
        for (const mapping of PATH_MAP) {
            rootHtml = rootHtml.split('./' + mapping.from).join('./' + mapping.to);
        }
        fs.writeFileSync(rootHtmlPath, rootHtml, 'utf8');
        console.log('Root index.html updated');
    }
    
    console.log('\n=== All done! ===');
}

main().catch(console.error);
