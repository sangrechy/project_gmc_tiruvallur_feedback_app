import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowLeft, Sparkles } from 'lucide-react';
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
      showToast("Council session authenticated", "success");
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
    showToast("Signed in as Demo Council Admin", "success");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="portal-card p-8 sm:p-10 space-y-6 text-center">
        {/* FBI Sticker for Admin Authentication matching prompt */}
        <div className="w-24 h-24 neu-circle mx-auto p-2 flex items-center justify-center sticker-float">
          <img 
            src="/stickers/fbi.webp" 
            alt="FBI Council Security Clearance" 
            className="w-full h-full object-contain"
          />
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full neu-pill text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
            <span>COUNCIL CLEARANCE REQUIRED</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
            COUNCIL ADMIN LOGIN
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authorized student council representatives only
          </p>
        </div>

        {/* Demo Fast Login Banner with Neumorphic Styling */}
        <div className="p-4 rounded-2xl neu-pressed space-y-2 text-left">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 dark:text-sky-300">
            <Sparkles className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span>Interactive Demo Mode Enabled</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            You can sign in with 1-click to test the full Council Dashboard, feedback triage, and Telegram-relayed live chats.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-3 portal-button-primary text-xs font-mono font-bold flex items-center justify-center space-x-1"
          >
            <span>[ ⚡ ONE-CLICK DEMO ADMIN LOGIN ]</span>
          </button>
        </div>

        {/* Standard credentials form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2 text-left">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Council Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="council.member@gmcthiruvallur.ac.in"
                className="w-full pl-10 pr-3 py-3 neu-input text-xs sm:text-sm font-mono placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3 py-3 neu-input text-xs sm:text-sm font-mono placeholder-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="portal-button-primary w-full py-3.5 font-mono font-bold text-xs"
          >
            {isLoading ? "AUTHENTICATING..." : "[ SIGN IN WITH CREDENTIALS ]"}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setCurrentRoute('home')}
            className="text-xs font-mono text-slate-500 hover:text-sky-500 flex items-center justify-center space-x-1 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Student Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
