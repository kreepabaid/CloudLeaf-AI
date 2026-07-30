import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConnectWizard() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/dashboard');
  };

  return (
    <div className="pt-20 px-4 max-w-2xl mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-on-surface mb-2">Connect Your Cloud</h2>
        <p className="text-sm text-on-surface-variant">Connect AWS, Azure, or GCP in seconds to start optimizing.</p>
      </div>
      
      {/* Progress Bar */}
      <div className="flex justify-between items-center relative mb-8">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container -z-10 -translate-y-1/2 rounded-full"></div>
        
        {/* Step 1 */}
        <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? (step > 1 ? 'bg-primary text-on-primary' : 'bg-primary/20 border-2 border-primary') : 'bg-surface-container border-2 border-outline-variant'}`}>
            {step > 1 ? <span className="material-symbols-outlined">check</span> : '1'}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider">Provider</span>
        </div>
        
        {/* Step 2 */}
        <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? (step > 2 ? 'bg-primary text-on-primary' : 'bg-primary/20 border-2 border-primary') : 'bg-surface-container border-2 border-outline-variant'}`}>
            {step > 2 ? <span className="material-symbols-outlined">check</span> : '2'}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider">Credentials</span>
        </div>
        
        {/* Step 3 */}
        <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary/20 border-2 border-primary' : 'bg-surface-container border-2 border-outline-variant'}`}>
            3
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider">Sync</span>
        </div>
      </div>

      <div className="min-h-[250px] flex items-center justify-center">
        {step === 1 && (
          <div className="flex gap-4 w-full">
            <button className="glass-card flex-1 p-8 rounded-xl flex flex-col items-center gap-4 border-primary bg-primary/5 active-glow">
              <span className="material-symbols-outlined text-4xl text-[#f59e0b]">cloud</span>
              <h3 className="font-bold text-on-surface">AWS</h3>
            </button>
            <button className="glass-card flex-1 p-8 rounded-xl flex flex-col items-center gap-4 opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined text-4xl text-[#3b82f6]">cloud</span>
              <h3 className="font-bold text-on-surface">Azure</h3>
            </button>
            <button className="glass-card flex-1 p-8 rounded-xl flex flex-col items-center gap-4 opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined text-4xl text-[#ef4444]">cloud</span>
              <h3 className="font-bold text-on-surface">GCP</h3>
            </button>
          </div>
        )}
        
        {step === 2 && (
          <div className="glass-card w-full p-8 rounded-xl">
            <div className="flex items-center gap-2 mb-6 p-4 rounded-lg bg-surface-container-high border-l-4 border-primary">
              <span className="material-symbols-outlined text-primary">lock</span>
              <p className="text-sm text-on-surface-variant">We only request read-only permissions to scan your resources.</p>
            </div>
            <label className="block mb-2 text-sm font-medium text-on-surface-variant">IAM Read-Only Role ARN</label>
            <input 
              type="text" 
              placeholder="arn:aws:iam::123456789012:role/CloudLeaf" 
              className="w-full p-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              defaultValue="arn:aws:iam::123456789012:role/CloudLeaf"
            />
          </div>
        )}
        
        {step === 3 && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-surface-container"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary">sync</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">Analyzing Infrastructure...</h3>
              <p className="text-sm text-on-surface-variant mt-1">This might take a few moments.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <button 
          onClick={handleNext} 
          className="bg-primary text-on-primary font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors active:scale-95"
        >
          {step === 3 ? 'Go to Dashboard' : 'Continue'} 
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
