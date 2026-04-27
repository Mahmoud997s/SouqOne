const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, 'src');
const outputFile = path.join(__dirname, 'ARCHITECTURE_AUDIT.md');

let allFiles = [];
let pages = [];
let components = [];
let features = {};
let hooks = [];
let demos = [];
let emptyFiles = [];

function walk(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            allFiles.push(fullPath);
        }
    }
}

function runGitStatus() {
    try {
        return execSync('git status --short', { encoding: 'utf-8' });
    } catch (e) {
        return 'Could not run git status';
    }
}

function runTsc() {
    try {
        execSync('npx tsc --noEmit', { encoding: 'utf-8', stdio: 'pipe' });
        return { count: 0, brokenImports: [] };
    } catch (e) {
        const output = e.stdout || e.stderr || '';
        const lines = output.split('\n').filter(l => l.includes('error TS'));
        const errors = lines.filter(l => l.includes('Cannot find module') || l.includes('Module has no exported member'));
        return { count: lines.length, brokenImports: errors };
    }
}

function analyze() {
    walk(rootDir);
    
    // Feature usage regex
    const fileContents = {};
    for (const file of allFiles) {
        fileContents[file] = fs.readFileSync(file, 'utf-8');
    }

    for (const file of allFiles) {
        const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
        const content = fileContents[file];
        const lines = content.split('\n').length;
        
        // Demo/Test/Temp
        if (relPath.toLowerCase().match(/(demo|test|temp|tmp|backup|old|copy|-v2)/) || relPath.includes('/dev/') || relPath.includes('/test/')) {
            demos.push({ path: relPath, reason: 'Contains demo/test/backup keyword' });
        } else if (lines < 5) {
            emptyFiles.push({ path: relPath, lines });
        }
        
        // Pages
        if (file.endsWith('page.tsx')) {
            let type = '✅ صفحة حقيقية';
            if (relPath.includes('/dev/') || relPath.includes('/test/')) type = '🔴 dev/test';
            else if (lines < 5) type = '❌ فارغة';
            else if (content.includes('redirect(') || content.includes('permanentRedirect(')) type = '⚠️ redirect';
            
            pages.push({ path: relPath, type, lines });
        }
        
        // Features
        if (relPath.startsWith('features/')) {
            const parts = relPath.split('/');
            const featureName = parts[1];
            if (!features[featureName]) features[featureName] = { files: 0, usedIn: new Set() };
            features[featureName].files++;
        }
        
        // Components
        if (relPath.startsWith('components/')) {
            components.push({ path: relPath, name: path.basename(file, path.extname(file)) });
        }
        
        // Hooks
        if (relPath.startsWith('lib/api/')) {
            const exports = [];
            const regex = /export (?:const|function)\s+(use[A-Za-z0-9_]+)/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                exports.push(match[1]);
            }
            hooks.push({ path: relPath, exports, usedIn: new Set() });
        }
    }
    
    // Check usages
    for (const file of allFiles) {
        const content = fileContents[file];
        const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
        
        // Feature usage
        for (const feature of Object.keys(features)) {
            if (content.includes(`features/${feature}`)) {
                features[feature].usedIn.add(relPath);
            }
        }
        
        // Hook usage
        for (const hook of hooks) {
            for (const exp of hook.exports) {
                if (content.includes(exp) && file !== path.join(rootDir, hook.path)) {
                    hook.usedIn.add(relPath);
                }
            }
        }
    }

    const tscResult = runTsc();
    const gitStatus = runGitStatus();
    
    // Format output
    let md = `# Architecture Audit Report\n**Date:** ${new Date().toISOString()}\n\n`;
    
    md += `## 📊 إحصائيات المشروع\n`;
    md += `- إجمالي الملفات: ${allFiles.length}\n`;
    md += `- إجمالي الصفحات: ${pages.length}\n`;
    md += `- إجمالي الـ Components: ${components.length}\n`;
    md += `- إجمالي الـ Features: ${Object.keys(features).length}\n\n`;
    
    md += `## ✅ صفحات سليمة\n| المسار | النوع | السطور |\n|---|---|---|\n`;
    for (const p of pages.filter(p => p.type === '✅ صفحة حقيقية')) {
        md += `| ${p.path} | ${p.type} | ${p.lines} |\n`;
    }
    
    md += `\n## ⚠️ صفحات تحتاج مراجعة (فارغة، Redirect، تجريبية)\n| المسار | المشكلة | السطور |\n|---|---|---|\n`;
    for (const p of pages.filter(p => p.type !== '✅ صفحة حقيقية')) {
        md += `| ${p.path} | ${p.type} | ${p.lines} |\n`;
    }
    
    md += `\n## 🔴 ملفات يجب حذفها (Demo/Test/Old)\n| الملف | السبب |\n|---|---|\n`;
    for (const d of demos) {
        md += `| ${d.path} | ${d.reason} |\n`;
    }
    for (const e of emptyFiles) {
        md += `| ${e.path} | ملف فارغ أو صغير جداً (${e.lines} سطر) |\n`;
    }
    
    md += `\n## 📦 Features الموجودة\n| Feature | عدد الملفات | مستخدم في (أمثلة) | الحالة |\n|---|---|---|---|\n`;
    for (const f of Object.keys(features)) {
        const feat = features[f];
        const status = feat.usedIn.size > 0 ? '✅' : '🔴 مش مستخدم';
        const sample = Array.from(feat.usedIn).slice(0, 2).join(', ') || 'مفيش';
        md += `| ${f} | ${feat.files} | ${sample} | ${status} |\n`;
    }
    
    md += `\n## 🪝 API Hooks (src/lib/api/)\n| Hook file | الـ exports الرئيسية | الاستخدام | الحالة |\n|---|---|---|---|\n`;
    for (const h of hooks) {
        const exportsStr = h.exports.join(', ');
        const sample = Array.from(h.usedIn).slice(0, 2).join(', ') || 'مفيش';
        const status = h.usedIn.size > 0 ? '✅' : '🔴';
        md += `| ${h.path} | ${exportsStr || 'لا يوجد hooks واضحة'} | ${sample} | ${status} |\n`;
    }
    
    md += `\n## 🔗 Imports مكسورة\n`;
    if (tscResult.brokenImports.length > 0) {
        md += `| الخطأ |\n|---|\n`;
        for (const err of tscResult.brokenImports) {
            md += `| ${err} |\n`;
        }
    } else {
        md += `لا توجد Broken Imports!\n`;
    }
    
    md += `\n## 📋 Untracked/Modified Files (Git Status)\n\`\`\`\n${gitStatus}\n\`\`\`\n`;
    
    md += `\n## ✅ TypeScript Status\n`;
    md += `عدد الأخطاء الإجمالي (Type errors): ${tscResult.count}\n`;
    
    fs.writeFileSync(outputFile, md);
    console.log('Done!');
}

analyze();
