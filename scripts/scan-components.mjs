import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../apps/web/src');
const OUTPUT_FILE = path.resolve(ROOT_DIR, 'app/[locale]/dev/ui-inventory/inventory-data.json');

// Helpers
const isDirectory = (p) => fs.statSync(p).isDirectory();
const getFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (isDirectory(fullPath)) {
      getFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
};

// Start scan
console.log('🔍 Starting Deep Frontend Scan...');
const allFiles = getFiles(ROOT_DIR);
console.log(`Scanned ${allFiles.length} files`);

const components = [];
const componentMap = new Map(); // path -> { name, exportName }
let failedParses = 0;

// 1. Detect Components
for (const file of allFiles) {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Quick heuristic: must contain JSX-like syntax or React imports
    if (!content.includes('/>') && !content.includes('</') && !content.includes('React.createElement')) {
      continue;
    }

    // Exclude basic Next.js app pages/layouts unless they are in 'components'
    // but the prompt says to exclude Pages from UI list but track usage.
    const isPageOrLayout = file.includes('\\app\\') && (file.endsWith('page.tsx') || file.endsWith('layout.tsx'));
    
    // Find exported components
    const exportRegex = /export\s+(?:default\s+)?(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)/g;
    let match;
    const exports = [];
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    if (exports.length > 0) {
      const relPath = file.replace(ROOT_DIR, '').replace(/\\/g, '/').substring(1);
      
      if (!isPageOrLayout) {
        let category = 'Feature';
        if (relPath.startsWith('components/ui')) category = 'Core';
        else if (relPath.startsWith('components/')) category = 'Shared';
        
        components.push({
          id: relPath,
          name: exports[0], // primary component name
          path: relPath,
          category,
          status: 'stable',
          usedIn: [],
          usageCount: 0,
          variantsCount: (content.match(/variant=|variants/g) || []).length > 0 ? 1 : 0, // rough estimate
        });
      }

      componentMap.set(relPath, exports);
    }
  } catch (e) {
    failedParses++;
  }
}

console.log(`Detected ${components.length} components`);

// 2. Map Usage (Build Component Graph)
let relationsMapped = 0;
for (const file of allFiles) {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const relPath = file.replace(ROOT_DIR, '').replace(/\\/g, '/').substring(1);
    
    // Check which components are used in this file
    for (const comp of components) {
      // Check if the component's name is in the content (rough heuristic for usage)
      // A better way is checking imports, but name matching is faster for a simple script
      // Regex ensures it's used as a JSX tag <Name or imported
      const tagRegex = new RegExp(`<${comp.name}[\\s/>]`, 'g');
      if (tagRegex.test(content) && comp.path !== relPath) {
        comp.usageCount++;
        if (!comp.usedIn.includes(relPath)) {
          comp.usedIn.push(relPath);
        }
        relationsMapped++;
      }
    }
  } catch (e) {}
}

console.log(`Mapped ${relationsMapped} usage relations`);

// 3. Post-process Status
for (const comp of components) {
  if (comp.usageCount === 0) {
    comp.status = 'unused';
  } else {
    // Detect potential duplicates (same name but different path)
    const duplicates = components.filter(c => c.name === comp.name && c.id !== comp.id);
    if (duplicates.length > 0) {
      comp.status = 'duplicate';
      comp.notes = `Duplicate name collision with: ${duplicates.map(d => d.path).join(', ')}`;
    }
  }
}

// 4. Save Output
const outputData = {
  metadata: {
    totalScanned: allFiles.length,
    totalComponents: components.length,
    failedParses,
    timestamp: new Date().toISOString()
  },
  components
};

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));

console.log('✅ Inventory JSON generated successfully at: ' + OUTPUT_FILE);
