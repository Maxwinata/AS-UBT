const fs = require('fs');
let code = fs.readFileSync('src/components/admin/CorrectionRequestsAdmin.tsx', 'utf8');

const targetStr = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start mt-4 max-h-[60vh] overflow-y-auto pr-2 pb-4">`;

const newStr = `              <div className="flex items-center space-x-2 pt-2 pb-1 text-[11px] font-bold text-indigo-700 uppercase tracking-widest border-t border-slate-100 mt-4">
                <span>ADMISSION FORM</span>
                <span className="text-indigo-300">•</span>
                <span>ASRAMA UBT</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start mt-2 max-h-[55vh] overflow-y-auto pr-2 pb-4">`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/admin/CorrectionRequestsAdmin.tsx', code);
  console.log("Patched label successfully.");
} else {
  console.error("Target string not found.");
}
