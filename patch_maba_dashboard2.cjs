const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// Replace the UI block restricting to KIP
const regexRestrictingToKip = /\{\/\* Opsi Pembayaran Deposit \(KIP Only\) \*\/\}\s*<div className=\{`transition-all duration-300 \$\{![^`]+\}`\}>\s*<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">\s*<div className="mb-4">\s*<h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">\s*Opsi Pembayaran Deposit \(Khusus KIP\)\s*\{\!profile\.isKipStudent && \(\s*<span className="text-\[10px\] bg-slate-100 text-slate-500 px-2 py-0\.5 rounded-full font-normal border border-slate-200">\s*Hanya tersedia untuk KIP\s*<\/span>\s*\)\}\s*<\/h4>\s*<span className="text-xs text-slate-500">\s*Sistem otomatis menghitung penyesuaian biaya deposit berdasarkan skema cicilan yang berlaku di Master Tarif\.\s*<\/span>\s*<\/div>\s*<div className=\{`grid grid-cols-1 gap-3 \$\{maxCicilan >= 3 \? "md:grid-cols-3" : maxCicilan === 2 \? "md:grid-cols-2" : ""\}`\}>\s*\{Array\.from\(\{ length: maxCicilan \}, \(_, i\) => i \+ 1\)\.map\(opsi => \{\s*const isLunas = opsi === 1;\s*const multiplier = isLunas \? 1\.0 : activeScheme\.installmentMultiplier;\s*const baseDeposit = tariffs\.find\(t => t\.category === 'DEPOSIT' && t\.target === \(profile\.isKipStudent \? 'KIP' : 'REGULER'\) && t\.name\.includes\('Lunas'\)\)\?\.amount \|\| 500000;/g;

const replacementBlock = `{/* Opsi Pembayaran Deposit */}
            <div className={\`transition-all duration-300 \${maxCicilan <= 1 ? 'opacity-50 grayscale pointer-events-none' : ''}\`}>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="mb-4">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    Opsi Pembayaran Deposit
                    {maxCicilan <= 1 && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal border border-slate-200">
                        Cicilan tidak tersedia untuk jalur ini
                      </span>
                    )}
                  </h4>
                  <span className="text-xs text-slate-500">
                    Sistem otomatis menghitung penyesuaian biaya deposit berdasarkan skema cicilan yang berlaku di Master Tarif.
                  </span>
                </div>
                
                <div className={\`grid grid-cols-1 gap-3 \${maxCicilan >= 3 ? "md:grid-cols-3" : maxCicilan === 2 ? "md:grid-cols-2" : ""}\`}>
                  {Array.from({ length: maxCicilan }, (_, i) => i + 1).map(opsi => {
                    const isLunas = opsi === 1;
                    const multiplier = isLunas ? 1.0 : activeScheme.installmentMultiplier;
                    const baseDeposit = tariffs.find(t => t.category === 'DEPOSIT' && (t.target === studentCategory || t.target === 'ALL') && t.name.includes('Lunas'))?.amount || 500000;`;

code = code.replace(regexRestrictingToKip, replacementBlock);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
