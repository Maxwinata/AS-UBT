import React from 'react';
import { Check, ShieldCheck, CreditCard, FileSignature, QrCode } from 'lucide-react';
import { AdmissionStep } from '../../types/asrama';

interface VisualProgressIndicatorProps {
  currentStep: AdmissionStep;
  isTicketActive: boolean;
}

export const VisualProgressIndicator: React.FC<VisualProgressIndicatorProps> = ({ currentStep, isTicketActive }) => {
  const stages = [
    {
      id: 'kyc',
      label: 'Registrasi & e-KYC',
      icon: <ShieldCheck className="w-5 h-5" />,
      isActive: currentStep === 1,
      isDone: currentStep > 1,
    },
    {
      id: 'payment',
      label: 'Tagihan & Pembayaran',
      icon: <CreditCard className="w-5 h-5" />,
      isActive: currentStep === 2 || currentStep === 3,
      isDone: currentStep > 3,
    },
    {
      id: 'contract',
      label: 'Kamar & Kontrak',
      icon: <FileSignature className="w-5 h-5" />,
      isActive: currentStep === 4 || currentStep === 5,
      isDone: currentStep > 5,
    },
    {
      id: 'ticket',
      label: 'e-Ticket Check-In',
      icon: <QrCode className="w-5 h-5" />,
      isActive: currentStep === 6 && !isTicketActive,
      isDone: currentStep === 6 && isTicketActive,
    },
  ];

  // Calculate progress percentage for the connecting line
  let progressIdx = 0;
  if (currentStep > 1) progressIdx = 1;
  if (currentStep > 3) progressIdx = 2;
  if (currentStep > 5) progressIdx = 3;
  if (currentStep === 6 && isTicketActive) progressIdx = 3;

  const progressPercentage = (progressIdx / (stages.length - 1)) * 100;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-6">Status Admisi Asrama</h3>
      
      <div className="relative">
        {/* Background lines */}
        <div className="absolute left-[23px] top-6 bottom-6 w-1 md:hidden bg-slate-100 rounded-full"></div>
        <div className="absolute top-[23px] left-12 right-12 h-1 hidden md:block bg-slate-100 rounded-full"></div>
        
        {/* Active progress lines */}
        <div 
          className="absolute left-[23px] top-6 w-1 md:hidden bg-teal-500 rounded-full transition-all duration-500 ease-in-out" 
          style={{ height: `calc(${progressPercentage}% - 24px)` }}
        ></div>
        <div 
          className="absolute top-[23px] left-12 h-1 hidden md:block bg-teal-500 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `calc(${progressPercentage}% - 48px)` }}
        ></div>

        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-10">
          {stages.map((stage, idx) => {
            let statusColor = 'bg-white text-slate-400 border-slate-200';
            
            if (stage.isDone) {
              statusColor = 'bg-teal-600 text-white border-teal-600';
            } else if (stage.isActive) {
              statusColor = 'bg-white text-teal-600 border-teal-500 shadow-md ring-4 ring-teal-50';
            }

            return (
              <div key={stage.id} className="flex md:flex-col items-start md:items-center flex-1 group">
                <div className={`w-12 h-12 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-20 ${statusColor}`}>
                  {stage.isDone ? <Check className="w-6 h-6" /> : stage.icon}
                </div>
                
                <div className="ml-4 md:ml-0 md:mt-4 text-left md:text-center flex-1 pt-1 md:pt-0">
                  <div className={`text-sm font-bold ${stage.isActive || stage.isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                    {stage.label}
                  </div>
                  <div className={`text-xs mt-0.5 ${stage.isActive ? 'text-teal-600 font-semibold' : 'text-slate-400'}`}>
                    {stage.isDone ? 'Selesai' : stage.isActive ? 'Dalam Proses' : 'Menunggu'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
