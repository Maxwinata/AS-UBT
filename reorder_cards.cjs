const fs = require('fs');

function extractCard(code, startMarker, endMarker) {
  const start = code.indexOf(startMarker);
  const end = code.indexOf(endMarker, start);
  if (start === -1 || end === -1) return null;
  return code.slice(start, end);
}

let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const card1 = extractCard(code, '{/* CARD 1: DATA AKADEMIK */}', '{/* CARD 3: KONTAK DARURAT */}');
const card3 = extractCard(code, '{/* CARD 3: KONTAK DARURAT */}', '{/* CARD 2: KONTAK PRIBADI */}');
const card2 = extractCard(code, '{/* CARD 2: KONTAK PRIBADI */}', '{/* CARD 4: PREFERENSI HUNIAN */}');
const card4 = extractCard(code, '{/* CARD 4: PREFERENSI HUNIAN */}', '</div>\n\n          {/* CARD 5: UPLOAD DOKUMEN & e-KYC */}');

if (card1 && card2 && card3 && card4) {
  // Replace class of card 1, 2, 3, 4 with correct ordering classes
  // card 1: order-1 lg:order-1
  // card 2: order-2 lg:order-3
  // card 3: order-3 lg:order-2 lg:row-span-2
  // card 4: order-4 lg:order-4
  
  let newCard1 = card1.replace('className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"', 'className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm order-1 lg:order-1"');
  let newCard2 = card2.replace('className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"', 'className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm order-2 lg:order-3"');
  let newCard3 = card3.replace('className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm row-span-2"', 'className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm order-3 lg:order-2 lg:row-span-2"');
  let newCard4 = card4.replace('className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"', 'className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm order-4 lg:order-4"');

  const startBlock = code.indexOf('{/* CARD 1: DATA AKADEMIK */}');
  const endBlock = code.indexOf('</div>\n\n          {/* CARD 5: UPLOAD DOKUMEN & e-KYC */}');
  
  const newBlock = newCard1 + newCard2 + newCard3 + newCard4;
  
  code = code.slice(0, startBlock) + newBlock + code.slice(endBlock);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Successfully reordered cards!");
} else {
  console.error("Failed to extract cards");
}
