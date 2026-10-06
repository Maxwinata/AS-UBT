const fs = require('fs');
let code = fs.readFileSync('src/components/shared/CaptureComponent.tsx', 'utf8');

code = code.replace(
  `parent?.appendChild(img);`,
  `if (parent) { parent.appendChild(img); }`
);
code = code.replace(
  `parent.appendChild(img);`,
  `if (parent) { parent.appendChild(img); }`
);

fs.writeFileSync('src/components/shared/CaptureComponent.tsx', code);
