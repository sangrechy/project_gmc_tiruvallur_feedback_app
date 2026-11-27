import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowLeft, ShieldAlert } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { apiService } from '../services/apiService';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function AdminLoginPage({ onLoginSuccess, setCurrentRoute, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        onLoginSuccess({
          email: user.email,
          uid: user.uid,
          name: user.displayName || "Council Representative",
          role: "Council Executive",
          isFirebaseUser: true
        });
        showToast(`Council security clearance validated. Welcome, ${user.displayName || user.email}!`, "success");
      } else {
        showToast("Firebase Auth is not initialized. Please verify configuration.", "error");
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        showToast("Google sign-in popup was cancelled", "info");
      } else {
        showToast("Google sign-in failed: " + err.message, "error");
      }
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
        let sessionToken = null;
        let expiresAt = null;
        if (apiService.isConfigured) {
          try {
            const workerAuth = await apiService.verifyCouncilToken(password);
            if (workerAuth.valid) {
              sessionToken = workerAuth.sessionToken;
              expiresAt = workerAuth.expiresAt;
            }
          } catch {
            // Worker master passcode may differ from individual admin password
          }
        }
        onLoginSuccess({
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          name: "Council Representative",
          role: "Council Executive",
          sessionToken,
          expiresAt,
          isFirebaseUser: true
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
          name: result.role || "Council Executive",
          role: result.role || "Council Executive",
          sessionToken: result.sessionToken,
          expiresAt: result.expiresAt
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
      </div>

      {/* Login Card */}
      <div className="relative">
        <div className="portal-card p-5 sm:p-10 space-y-6 text-center relative">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full neu-pill text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400 mb-2 border border-sky-500/20">
              <ShieldAlert className="w-3 h-3 text-sky-500" />
              <span>Council Executive Access</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Council Admin Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authorized student council executives and administrators
            </p>
          </div>

          {/* Google / Gmail Sign-In Button */}
          {isFirebaseConfigured && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-3 transition-all active:scale-[0.99] shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? "Signing In..." : "Sign in with Google / Gmail"}</span>
            </button>
          )}

          {/* Institutional Email Divider */}
          {isFirebaseConfigured && (
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-medium  tracking-wide font-mono">
                or sign in with email
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>
          )}

          {/* Standard Email & Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-1 text-left">
            <div>
              <label 
                htmlFor="council_email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
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
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password / Passcode
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
              className="w-full py-3.5 portal-button-primary text-xs font-semibold  tracking-wide flex items-center justify-center space-x-2 transition-all active:scale-95 mt-4 shadow-sm"
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
