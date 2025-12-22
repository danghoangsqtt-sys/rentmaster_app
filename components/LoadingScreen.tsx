
import React from 'react';
import { Building2, Sparkles, ShieldCheck } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0F172A] flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative">
        {/* Animated Glow */}
        <div className="absolute inset-0 bg-blue-500/30 blur-[60px] rounded-full animate-pulse"></div>
        
        {/* Logo Container */}
        <div className="relative z-10 w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.75rem] flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.3)] rotate-12 animate-in zoom-in duration-1000 border border-white/10">
          <Building2 size={56} className="-rotate-12 text-white" />
        </div>
      </div>
      
      <div className="mt-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-black tracking-tight italic bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
            RentMaster <span className="text-blue-500">Pro</span>
          </h1>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mt-2"></div>
        </div>
        
        <div className="flex items-center justify-center gap-2.5">
          <Sparkles size={14} className="text-amber-400 fill-amber-400" />
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
            Professional Real Estate
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-20 w-56 space-y-4 flex flex-col items-center">
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[loading_2.5s_ease-in-out_infinite]"></div>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <ShieldCheck size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">Secure Connection</span>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(0%); }
          50% { width: 60%; transform: translateX(20%); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
