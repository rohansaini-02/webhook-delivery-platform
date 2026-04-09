const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'admin-app', 'src', 'screens');
const themePath = path.join(__dirname, 'admin-app', 'src', 'styles', 'theme.ts');

const fontMapping = {
  // Ultra small pills and badges
  7: 11,
  8: 12,
  9: 13,
  
  // Standard captions and subtext
  10: 14,
  11: 14,
  
  // Body text
  12: 15,
  13: 16,
  14: 16,
  
  // Headers (incremental bumps)
  15: 17,
  16: 18,
  18: 20,
  20: 22,
  22: 24,
  24: 26,
  26: 28,
  28: 32
};

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Replace fontSize: <number>
  newContent = newContent.replace(/fontSize:\s*(\d+)/g, (match, p1) => {
    const size = parseInt(p1, 10);
    if (fontMapping[size]) {
      return `fontSize: ${fontMapping[size]}`;
    }
    return match; // keep original if no specific mapping
  });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated fonts in ${path.basename(filePath)}`);
  }
}

// Process all files in screens directory
if (fs.existsSync(screensDir)) {
  const files = fs.readdirSync(screensDir);
  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(path.join(screensDir, file));
    }
  });
}

// Process theme.ts separately
if (fs.existsSync(themePath)) {
  processFile(themePath);
}

console.log("Global Typography Scaling Complete!");
