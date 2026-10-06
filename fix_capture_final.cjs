const fs = require('fs');
let code = fs.readFileSync('src/components/shared/CaptureComponent.tsx', 'utf8');

code = code.replace(
  `if (parent) parent.appendChild(img);`,
  `if (parent) parent.appendChild(img);`
); // Let's check what it actually is in line 389

fs.writeFileSync('src/components/shared/CaptureComponent.tsx', code);
