import React from 'react';
import { AlertTriangle, Clock, Zap } from 'lucide-react';

export type ResumeType = 'installment' | 'renewal' | 'payment_pending' | 'contract_pending';

interface AutoResumeBannerProps {
  type: ResumeType;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  isBlocking?: boolean; // If true, it might take over the screen (like installment)
}

export const AutoResumeBanner: React.FC<AutoResumeBannerProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  isBlocking = false,
}) => {
  if (isBlocking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
          <div className="bg-red-50 border-b border-red-100 p-6 flex items-start space-x-4">
            <div className="bg-red-100 p-3 rounded-full text-red-600 mt-1 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900">{title}</h2>
              <p className="text-sm text-red-700 mt-1">{description}</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <button
              onClick={onAction}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <Zap className="w-5 h-5" />
              <span>{actionText}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Non-blocking banner (e.g., top of the dashboard)
  let bgClass = 'bg-blue-50 border-blue-200';
  let iconBgClass = 'bg-blue-100 text-blue-700';
  let titleClass = 'text-blue-900';
  let textClass = 'text-blue-700';
  let buttonClass = 'bg-blue-700 hover:bg-blue-800 text-white';

  if (type === 'renewal') {
    bgClass = 'bg-purple-50 border-purple-200';
    iconBgClass = 'bg-purple-100 text-purple-700';
    titleClass = 'text-purple-900';
    textClass = 'text-purple-700';
    buttonClass = 'bg-purple-700 hover:bg-purple-800 text-white';
  } else if (type === 'payment_pending') {
    bgClass = 'bg-amber-50 border-amber-200';
    iconBgClass = 'bg-amber-100 text-amber-700';
    titleClass = 'text-amber-900';
    textClass = 'text-amber-700';
    buttonClass = 'bg-amber-700 hover:bg-amber-800 text-white';
  }

  return (
    <div className={`border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${bgClass}`}>
      <div className="flex items-center space-x-3 w-full md:w-auto">
        <div className={`p-2 rounded-full flex-shrink-0 ${iconBgClass}`}>
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`text-sm font-bold ${titleClass}`}>{title}</h3>
          <p className={`text-xs ${textClass}`}>{description}</p>
        </div>
      </div>
      <button
        onClick={onAction}
        className={`whitespace-nowrap text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm w-full md:w-auto ${buttonClass}`}
      >
        {actionText}
      </button>
    </div>
  );
};
