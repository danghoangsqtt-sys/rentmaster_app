
import React from 'react';
import { Building2, Sparkles, ShieldCheck } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] max-w-md mx-auto bg-[#f8fafc] flex flex-col items-center justify-center overflow-hidden shadow-2xl border-x border-slate-200">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-5%] right-[-10%] w-80 h-80 bg-blue-100/60 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-5%] left-[-10%] w-80 h-80 bg-emerald-100/50 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative">
        {/* Animated Glow */}
        <div className="absolute inset-0 bg-blue-300/30 blur-[40px] rounded-full animate-pulse"></div>
        
        {/* Logo Container */}
        <div 
          className="relative z-10 w-28 h-28 rounded-[2rem] bg-cover bg-center shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-white animate-in zoom-in duration-1000"
          style={{ backgroundImage: "url('/rentmaster_logo.png')" }}
        >
        </div>
      </div>
      
      <div className="mt-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-black tracking-tight italic bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-500">
            RentMaster <span className="text-emerald-500">Pro</span>
          </h1>
           <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent mt-3"></div>
        </div>
        
        <div className="flex items-center justify-center gap-2.5">
          <Sparkles size={14} className="text-amber-500 fill-amber-500" />
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">
            Professional Real Estate
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-20 w-56 space-y-4 flex flex-col items-center">
        <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-[loading_2.5s_ease-in-out_infinite]"></div>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <ShieldCheck size={14} strokeWidth={2.5}/>
          <span className="text-[10px] uppercase tracking-widest">Secure Environment</span>
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
