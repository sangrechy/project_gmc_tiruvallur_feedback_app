import React, { useState } from 'react';
import { Lock, Shield, Mail, KeyRound, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
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
      <div className="portal-card p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            RESTRICTED ACCESS
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            COUNCIL ADMIN LOGIN
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authorized student council representatives only
          </p>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Interactive Demo Mode Enabled</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            You can sign in with 1-click to test the full Council Dashboard, feedback triage, and Telegram-relayed live chats.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1 shadow-sm"
          >
            <span>[ ⚡ ONE-CLICK DEMO ADMIN LOGIN ]</span>
          </button>
        </div>

        {/* Standard credentials form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Council Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="council.member@gmcthiruvallur.ac.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Secret Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="portal-button-primary w-full py-3 font-mono font-bold text-xs"
          >
            {isLoading ? "AUTHENTICATING..." : "[ SIGN IN WITH CREDENTIALS ]"}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setCurrentRoute('home')}
            className="text-xs font-mono text-slate-500 hover:text-emerald-600 flex items-center justify-center space-x-1 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Student Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
