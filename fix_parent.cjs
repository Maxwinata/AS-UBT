const fs = require('fs');
let code = fs.readFileSync('src/components/shared/CaptureComponent.tsx', 'utf8');

code = code.replace(
  /const parent = video\.parentElement;/,
  'const parent = video.parentElement;\n      if (!parent) return;'
);

fs.writeFileSync('src/components/shared/CaptureComponent.tsx', code);
