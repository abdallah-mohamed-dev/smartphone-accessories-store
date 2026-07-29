const fs = require('fs');
const path = require('path');
const LOCAL_ROOT = 'C:\\Users\\Abdallah_PC\\Downloads\\wp-site';

function getRelativePrefix(filePath) {
    const relative = path.relative(LOCAL_ROOT, filePath);
    const depth = relative.split(path.sep).length - 1;
    return depth > 0 ? '../'.repeat(depth) : './';
}

function fixFile(filePath) {
    const prefix = getRelativePrefix(filePath);
    let html = fs.readFileSync(filePath, 'utf8');
    const original = html;

    // 1. Fix clickable breadcrumb "Home" link
    // Pattern: <a href="https://woodmart.xtemos.com/accessories">Home</a>
    html = html.replace(
        /<a\s+href="https:\/\/woodmart\.xtemos\.com\/accessories(?:\/[^"]*)?">\s*Home\s*<\/a>/g,
        `<a href="${prefix}">Home</a>`
    );

    // 2. Fix breadcrumb item @id (non-escaped)
    html = html.replace(
        /"@id":"https:\/\/woodmart\.xtemos\.com\/accessories(?:\/[^"]*)?"/g,
        `"@id":"${prefix.replace(/\/$/, '')}"`
    );

    // 3. Fix escaped breadcrumb @id
    html = html.replace(
        /"@id":"https:\\\/\\\/woodmart\\.xtemos\\.com\\\/accessories(?:\\\/[^"]*)?"/g,
        `"@id":"${prefix.replace(/\//g, '\\/').replace(/\/*$/, '')}"`
    );

    // 4. Fix organization URL in product JSON-LD
    html = html.replace(
        /"url":"https:\/\/woodmart\.xtemos\.com\/accessories"/g,
        `"url":"${prefix.replace(/\/$/, '')}"`
    );
    
    // 5. Fix escaped organization URL
    html = html.replace(
        /"url":"https:\\\/\\\/woodmart\\.xtemos\\.com\\\/accessories"/g,
        `"url":"${prefix.replace(/\//g, '\\/').replace(/\/*$/, '')}"`
    );

    // 6. Fix ExactMetrics page_referrer
    html = html.replace(
        /"page_referrer":"https:\\\/\\\/woodmart\\.xtemos\\.com\\\/accessories[^"]*"/g,
        `"page_referrer":"${prefix.replace(/\//g, '\\/')}"`
    );

    // 7. Fix WP Rocket beacon_data ajax_url
    html = html.replace(
        /"ajax_url":"https:\\\/\\\/woodmart\\.xtemos\\.com\\\/accessories\\\/wp-admin\\\/admin-ajax\.php"/g,
        `"ajax_url":"${prefix.replace(/\//g, '\\/')}wp-admin\\/admin-ajax.php"`
    );

    // 8. Fix Contact Form 7 api.root
    html = html.replace(
        /"root":\s*"https:\\\/\\\/woodmart\\.xtemos\\.com\\\/accessories\\\/wp-json\\\/"/g,
        `"root": "${prefix.replace(/\//g, '\\/')}wp-json\\/"`
    );

    // 9. Fix map marker icon URL (escaped)
    html = html.replace(
        /"iconUrl":"https:\\\/\\\/woodmart\\.xtemos\\.com\\\/accessories\\\/wp-content\\\/themes\\\/woodmart\\\/images\\\/icons\\\/marker-icon\.png"/g,
        `"iconUrl":"${prefix.replace(/\//g, '\\/').replace(/\/$/, '')}css\/..\/img\/marker-icon.png"`
    );

    // 10. Fix map point image (escaped)
    html = html.replace(
        /"image":"https:\\\/\\\/woodmart\\.xtemos\\.com\\\/accessories\\\/wp-content\\\/uploads\\\/sites\\\/7\\\/2022\\\/04\\\/map-point\.svg"/g,
        `"image":"${prefix.replace(/\//g, '\\/')}img\/map-point.svg"`
    );

    if (html !== original) {
        fs.writeFileSync(filePath, html, 'utf8');
        return true;
    }
    return false;
}

// Process all HTML files
const files = [];
function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory() && !['css','js','img','fonts','plugins','wp-content','wp-admin','wp-includes','node_modules'].includes(e.name)) {
            walk(fp);
        } else if (e.isFile() && e.name === 'index.html') {
            files.push(fp);
        }
    }
}
walk(LOCAL_ROOT);

console.log(`Found ${files.length} HTML files`);
let fixed = 0;
for (const f of files) {
    if (fixFile(f)) {
        fixed++;
        if (fixed % 10 === 0) console.log(`Fixed ${fixed}...`);
    }
}
console.log(`Fixed ${fixed} files`);

// Verify: count remaining breadcrumb Home links
let remaining = 0;
for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const breadcrumbLinks = html.match(/<a\s+href="https:\/\/woodmart\.xtemos\.com\/accessories[^"]*">\s*Home\s*<\/a>/g);
    const anyLinks = html.match(/https?:\/\/woodmart\.xtemos\.com\//g);
    if (anyLinks) {
        remaining += anyLinks.length;
    }
}
console.log(`Remaining live links: ${remaining}`);
console.log('Done!');
