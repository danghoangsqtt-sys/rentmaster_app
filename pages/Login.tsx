import React, { useState } from 'react';
/* Added CheckCircle2 to the import list to fix the missing component error */
import { Building2, ShieldCheck, AlertCircle, User, Lock, Mail, ArrowRight, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { verifyLogin, registerUser } from '../data/mockData';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [identity, setIdentity] = useState(''); // Email or Username
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isRegistering) {
        if (!email || !identity || !password) {
          setError("Vui lòng điền đầy đủ thông tin.");
          setIsLoading(false);
          return;
        }
        const result = await registerUser({
          email: email,
          username: identity,
          password: password,
          name: name
        });
        if (result.success) {
          setMessage(result.message + " Hãy đăng nhập.");
          setIsRegistering(false);
        } else {
          setError(result.message);
        }
      } else {
        if (!identity || !password) {
          setError("Vui lòng nhập tài khoản và mật khẩu.");
          setIsLoading(false);
          return;
        }
        const user = await verifyLogin(identity, password);
        if (user) {
          onLogin(user);
        } else {
          setError("Tài khoản hoặc mật khẩu không chính xác.");
        }
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 flex items-center gap-2";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors duration-300 overflow-y-auto custom-scrollbar pt-safe">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-8 py-12 space-y-10">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200 dark:shadow-none rotate-12 transition-transform active:scale-95">
            <Building2 size={48} className="text-white -rotate-12" />
          </div>
        </div>
        
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">
            RentMaster <span className="text-indigo-600">Pro</span>
          </h1>
          <div className="h-1 w-12 bg-indigo-600 mx-auto rounded-full"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium px-4 leading-relaxed">
            {isRegistering ? 'Tham gia cộng đồng quản lý bất động sản chuyên nghiệp' : 'Đăng nhập vào hệ thống quản lý bất động sản'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-5">
          {isRegistering && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className={labelClass}><User size={12}/> Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Nguyễn Văn A" 
                  className={inputClass}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {isRegistering && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className={labelClass}><Mail size={12}/> Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" 
                  placeholder="example@gmail.com" 
                  className={inputClass}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-top-2">
            <label className={labelClass}><User size={12}/> {isRegistering ? 'Tên đăng nhập' : 'Tên đăng nhập / Email'}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={isRegistering ? "john_doe" : "admin hoặc email..."} 
                className={inputClass}
                value={identity}
                onChange={e => setIdentity(e.target.value)}
              />
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-top-2">
            <label className={labelClass}><Lock size={12}/> Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className={inputClass}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="w-full p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-[11px] font-bold animate-in fade-in zoom-in">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="w-full p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold animate-in fade-in zoom-in">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                {isRegistering ? 'Đăng ký ngay' : 'Đăng nhập hệ thống'}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setMessage(null);
            }}
            className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 active:scale-95 transition-all"
          >
            {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
          </button>
          
          <div className="flex items-center gap-2.5 justify-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] pb-safe">
            <ShieldCheck size={14} className="text-indigo-500" /> Dữ liệu được mã hóa & bảo mật
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;