const fs = require('fs');
let content = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const regex = /(<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">)(\s*{\/\* CARD 1[\s\S]*?)({\/\* CARD 5: UPLOAD DOKUMEN)/;
const match = content.match(regex);

if (match) {
  let inner = match[2];
  
  const c1Match = inner.match(/(\{\/\* CARD 1: DATA AKADEMIK \*\/\}(?:.|\n)*?)\s*\{\/\* CARD 2: KONTAK PRIBADI \*\/\}/);
  const c2Match = inner.match(/(\{\/\* CARD 2: KONTAK PRIBADI \*\/\}(?:.|\n)*?)\s*\{\/\* CARD 3: KONTAK DARURAT \*\/\}/);
  const c3Match = inner.match(/(\{\/\* CARD 3: KONTAK DARURAT \*\/\}(?:.|\n)*?)\s*\{\/\* CARD 4: PREFERENSI HUNIAN \*\/\}/);
  const c4Match = inner.match(/(\{\/\* CARD 4: PREFERENSI HUNIAN \*\/\}(?:.|\n)*?)\s*<\/div>\s*$/);
  
  if (c1Match && c2Match && c3Match && c4Match) {
    let c1 = c1Match[1].replace('order-1 lg:order-1', '');
    let c2 = c2Match[1].replace('order-2 lg:order-3', '');
    let c3 = c3Match[1].replace('order-3 lg:order-2 lg:row-span-2', '');
    let c4 = c4Match[1].replace('order-4 lg:order-4', '');
    
    const newHTML = '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">\n' +
            '            <div className="flex flex-col gap-6">\n' +
            '              ' + c1 + '\n' +
            '              ' + c2 + '\n' +
            '            </div>\n' +
            '            <div className="flex flex-col gap-6">\n' +
            '              ' + c3 + '\n' +
            '              ' + c4 + '\n' +
            '            </div>\n' +
            '          </div>\n          ';
          
    content = content.replace(match[0], newHTML + match[3]);
    fs.writeFileSync('src/components/maba/MabaDashboard.tsx', content);
    console.log("Successfully patched grid layout!");
  } else {
    console.log("Could not parse individual cards.");
  }
} else {
  console.log("Could not find the grid container regex.");
}
