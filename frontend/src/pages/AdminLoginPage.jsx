import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowLeft, ShieldAlert, Key } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { apiService } from '../services/apiService';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLoginPage({ onLoginSuccess, setCurrentRoute, showToast }) {
  const [authMode, setAuthMode] = useState('token'); // 'token' or 'credentials'
  const [councilToken, setCouncilToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTokenLogin = async (e) => {
    e.preventDefault();
    if (!councilToken.trim()) {
      showToast("Please enter Council Master Token or Passcode", "error");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.verifyCouncilToken(councilToken);
      if (result.valid) {
        onLoginSuccess(result.user || {
          email: "executive.council@gmcthiruvallur.ac.in",
          name: "Council Executive",
          role: "Council Executive"
        });
        showToast("Council clearance validated via Master Token", "success");
      } else {
        showToast(result.error || "Invalid Council Master Token / Passcode", "error");
      }
    } catch (err) {
      showToast("Token validation error: " + err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

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
        // Verify passcode through the serverless backend
        const result = await apiService.verifyCouncilToken(password);
        if (!result.valid) {
          showToast(result.error || "Invalid Council Passcode", "error");
          setIsLoading(false);
          return;
        }

        onLoginSuccess({
          email: email.trim(),
          name: "Council Executive",
          role: "Council Executive",
          token: password.trim()
        });
      }
      showToast("Council security clearance validated", "success");
    } catch (err) {
      showToast("Authentication failed: " + err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-3 sm:px-4 pt-4 pb-28 sm:py-16 bg-grid-pattern">
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
              <span>Council Executive Access</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Council Admin Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authorized student council executives and administrators
            </p>
          </div>

          {/* Authentication Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300/40 dark:border-slate-800/80 text-xs font-mono">
            <button
              type="button"
              onClick={() => setAuthMode('token')}
              className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all ${
                authMode === 'token'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Master Token</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('credentials')}
              className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all ${
                authMode === 'credentials'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Passcode</span>
            </button>
          </div>

          {authMode === 'token' ? (
            /* Decoupled Master Token Form */
            <form onSubmit={handleTokenLogin} className="space-y-4 pt-1 text-left">
              <div>
                <label 
                  htmlFor="council_token"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono"
                >
                  Council Master Secret Token
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="council_token"
                    type="password"
                    value={councilToken}
                    onChange={(e) => setCouncilToken(e.target.value)}
                    placeholder="Enter Council Master Passcode"
                    className="w-full pl-10 pr-4 py-3.5 neu-input text-base sm:text-sm placeholder-slate-400"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Server-verified authentication. Configured in Cloudflare Worker secrets.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 portal-button-secondary text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 mt-4"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isLoading ? "Validating Token..." : "Authorize with Master Token"}</span>
              </button>
            </form>
          ) : (
            /* Standard Email & Credentials Form */
            <form onSubmit={handleLogin} className="space-y-4 pt-1 text-left">
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
                    className="w-full pl-10 pr-4 py-3.5 neu-input text-base sm:text-sm placeholder-slate-400"
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
                    className="w-full pl-10 pr-4 py-3.5 neu-input text-base sm:text-sm placeholder-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 portal-button-secondary text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 mt-4"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isLoading ? "Authenticating..." : "Authorize Session"}</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

