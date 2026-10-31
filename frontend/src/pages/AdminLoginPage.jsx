import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowLeft, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLoginPage({ onLoginSuccess, setCurrentRoute, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter email and password", "error");
      return;
    }

    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess({
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          name: "Council Representative"
        });
      } else {
        // Demo authentication simulation
        onLoginSuccess({
          email: email.trim(),
          name: "Dr. K. Vignesh (Council President)",
          role: "Council President"
        });
      }
      showToast("Council security clearance validated", "success");
    } catch (err) {
      showToast("Authentication failed: " + err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLoginSuccess({
      email: "president.council@gmcthiruvallur.ac.in",
      name: "Dr. K. Vignesh (President)",
      role: "Council President"
    });
    showToast("Signed in as Demo Council Representative", "success");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 bg-grid-pattern">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-300/40 dark:border-slate-800/80 text-xs font-mono">
        <button 
          onClick={() => setCurrentRoute('home')}
          className="flex items-center space-x-1 text-slate-500 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <span className="text-sky-600 dark:text-sky-400 font-bold">COUNCIL CLEARANCE</span>
      </div>

      {/* Login Card with Bleeding FBI Mascot */}
      <div className="relative mt-12">
        
        {/* FBI STICKER: Bleeding out of top edge center */}
        <div 
          className="sticker-bleed sticker-float-r -top-12 sm:-top-18 left-1/2 -translate-x-1/2 w-24 sm:w-36 pointer-events-auto"
          title="FBI Security Clearance Mascot"
        >
          <img 
            src="/stickers/fbi.webp" 
            alt="FBI Council Security Mascot Bleeding Out" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Card (overflow-visible) */}
        <div className="portal-card p-5 sm:p-10 space-y-6 text-center relative overflow-visible pt-14 sm:pt-20">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full neu-pill text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2 border border-sky-500/20">
              <ShieldAlert className="w-3 h-3 text-sky-500" />
              <span>Official Representative Access</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Council Admin Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authorized student council executives and administrators
            </p>
          </div>

          {/* 1-Click Demo Login Banner */}
          <div className="p-4 rounded-2xl neu-pressed space-y-2.5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Review Mode</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-emerald-500 font-bold">1-Click</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Sign in instantly to test the triage dashboard, Telegram-relayed live chats, and poll management.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-3 portal-button-primary text-xs font-semibold flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Instant Council Demo Access</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Standard Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-2 text-left">
            <div>
              <label 
                htmlFor="council_email"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono"
              >
                Council Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="council_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rep.council@gmcthiruvallur.ac.in"
                  className="w-full pl-10 pr-4 py-3 neu-input text-xs sm:text-sm placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="council_password"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono"
              >
                Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="council_password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 neu-input text-xs sm:text-sm placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 portal-button-secondary text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all mt-4"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isLoading ? "Authenticating..." : "Authorize Session"}</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
