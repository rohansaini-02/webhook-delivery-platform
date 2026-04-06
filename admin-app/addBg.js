const fs = require('fs');
const path = require('path');
const dir = 'd:/SEMESTERS DATA/SEM 4/Projects of Sem4/webhook-delivery-platform/admin-app/src/screens';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // 1. Add ImageBackground import
  if (content.includes('react-native') && !content.includes('ImageBackground')) {
    content = content.replace(/import \{(.*?)\} from 'react-native';/s, (match, p1) => {
      return `import {${p1}, ImageBackground } from 'react-native';`;
    });
  }

  // 2. Replace opening View
  let replaced = false;
  content = content.replace(/return \(\s*<View style=\{styles\.container\}>/, () => {
    replaced = true;
    return `return (\n    <ImageBackground source={require('../../assets/background.jpg')} style={styles.container}>`;
  });

  // 3. Replace closing View
  if (replaced) {
    content = content.replace(/<\/View>(\s*\);\s*\})/s, '</ImageBackground>$1');
  }

  // 4. Update styles.container background
  content = content.replace(/container: \{ (flex: 1,) backgroundColor: colors\.bg \}/g, 'container: { $1 }');
  content = content.replace(/container: \{ flex: 1, backgroundColor: colors\.bg(.*?)\}/g, 'container: { flex: 1$1}');
  
  fs.writeFileSync(path.join(dir, file), content);
  console.log('Updated ' + file);
}
