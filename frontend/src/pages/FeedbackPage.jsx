import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  ArrowLeft,
  Info,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function FeedbackPage({ onSubmitFeedback, setCurrentRoute, showToast }) {
  const [category, setCategory] = useState('Academics');
  const [content, setContent] = useState('');
  const [containsPII, setContainsPII] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const categories = [
    'Academics',
    'Hospital & Clinical Postings',
    'Hostel & Mess Facilities',
    'Campus Infrastructure',
    'Library & E-Resources',
    'Sports & Cultural Welfare',
    'Transportation',
    'General Council Inquiry'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast("Please enter your feedback description", "error");
      return;
    }

    if (content.trim().length < 10) {
      showToast("Feedback must contain at least 10 characters", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmitFeedback({
        category,
        content: content.trim(),
        containsPII
      });
      setSubmissionResult(result);
      showToast("Grievance lodged anonymously with Student Council", "success");
    } catch (err) {
      showToast("Failed to lodge feedback: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setContent('');
    setContainsPII(false);
    setSubmissionResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 bg-grid-pattern">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-300/40 dark:border-slate-800/80 text-xs font-mono">
        <button 
          onClick={() => setCurrentRoute('home')}
          className="flex items-center space-x-1 text-slate-500 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center space-x-1 text-slate-400">
          <span>PORTAL</span>
          <span>/</span>
          <span className="text-sky-600 dark:text-sky-400 font-bold">GRIEVANCE REDRESSAL</span>
        </div>
      </div>

      {submissionResult ? (
        /* Confirmation Screen with Bleeding Thumbs Sticker */
        <div className="relative mt-12">
          
          {/* THUMBS STICKER: Bleeding out of the top edge */}
          <div 
            className="sticker-bleed sticker-float-r -top-16 sm:-top-20 left-1/2 -translate-x-1/2 w-32 sm:w-40 pointer-events-auto"
            title="Feedback Submission Success"
          >
            <img 
              src="/stickers/thumbs.png" 
              alt="Thumbs Up Success Mascot" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="portal-card p-8 sm:p-12 text-center pt-16 sm:pt-20 space-y-6 overflow-visible">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
                <CheckCircle className="w-4 h-4" />
                <span>Grievance Logged Securely</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
                Feedback Received Anonymously
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                Your message has been assigned a cryptographic hash and forwarded to the Student Council for review.
              </p>
            </div>

            {/* Tracking ID Badge */}
            <div className="p-4 rounded-2xl neu-pressed max-w-md mx-auto text-left font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Reference Tracking Token:</span>
                <span className="text-[10px] uppercase font-bold text-sky-500">Anonymous Token</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/40 text-sky-400 font-mono text-center tracking-widest break-all select-all font-bold">
                {submissionResult.id}
              </div>
            </div>

            {/* Redaction Notice if PII was detected */}
            {submissionResult.piiDetected ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left text-xs text-amber-700 dark:text-amber-300 flex items-start space-x-3 max-w-md mx-auto">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Privacy Filter Applied:</strong> Identifying elements (phone numbers, emails, or personal names) were sanitized to protect your anonymity.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-left text-xs text-sky-700 dark:text-sky-300 flex items-start space-x-3 max-w-md mx-auto">
                <ShieldCheck className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Anonymity Guarantee:</strong> Zero IP addresses, cookies, or user identifiers were recorded.
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="portal-button-primary w-full sm:w-auto px-6 py-3 text-xs font-semibold tracking-wide"
              >
                Submit Another Feedback
              </button>
              <button
                onClick={() => setCurrentRoute('home')}
                className="portal-button-secondary w-full sm:w-auto px-6 py-3 text-xs font-semibold"
              >
                Return to Campus Home
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Feedback Submission Form with Bleeding Doctor (doc.png) Sticker */
        <div className="relative mt-12">
          
          {/* DOCTOR STICKER: Bleeding prominently out of top-right corner */}
          <div 
            className="sticker-bleed sticker-float-r -top-14 sm:-top-20 right-1 sm:-right-8 w-24 sm:w-36 md:w-44 pointer-events-auto"
            title="GMC Clinical Council Doctor Mascot"
          >
            <img 
              src="/stickers/doc.png" 
              alt="GMC Doctor Mascot Bleeding Out" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Form Card (overflow-visible to let Doctor bleed out) */}
          <div className="portal-card p-5 sm:p-10 relative overflow-visible pt-10 sm:pt-10">
            
            {/* Header info */}
            <div className="mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full neu-pill text-[11px] font-semibold text-sky-600 dark:text-sky-400 mb-2 border border-sky-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Student Grievance Channel</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
                Anonymous Feedback Portal
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                Communicate directly with the GMC Student Council. Your submission is cryptographically untraceable.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Category Selection */}
              <div>
                <label 
                  htmlFor="feedback_category"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 font-mono"
                >
                  Grievance Category
                </label>
                <div className="relative">
                  <select
                    id="feedback_category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3.5 neu-input text-xs sm:text-sm font-medium appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#f8fafc] dark:bg-[#0e131f] text-slate-900 dark:text-slate-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 font-mono text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label 
                    htmlFor="feedback_content"
                    className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono"
                  >
                    Detailed Message
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {content.length} characters (min 10)
                  </span>
                </div>
                <textarea
                  id="feedback_content"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your concern with specific context (e.g. Ward 4 duty roster irregularities, Hostel Block C water pressure, or central library night hours)..."
                  className="w-full p-4 neu-input text-xs sm:text-sm placeholder-slate-400 transition-all resize-y leading-relaxed"
                  required
                />
              </div>

              {/* Sensitive Info Toggle to Avoid AI Analysis */}
              <div className="p-4 rounded-2xl neu-card border border-slate-200/60 dark:border-white/10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <label 
                      htmlFor="contains_pii_toggle" 
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      Contains specific info to be avoided by AI
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Turn on if this feedback includes names, doctor or staff titles, roll numbers, or sensitive specifics. When enabled, this message strictly bypasses AI processing and is routed directly to the student council.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    id="contains_pii_toggle"
                    checked={containsPII}
                    onChange={(e) => setContainsPII(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Privacy Disclaimer Callout */}
              <div className="p-4 rounded-2xl neu-pressed flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400">
                <Lock className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">Zero-Logging Policy:</strong> We do not log IP addresses, session cookies, or device telemetry. Automatic filters sanitize personal identifiers before routing to the council review desk.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="portal-button-primary w-full sm:w-auto px-8 py-3.5 text-xs font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Encrypting & Lodging..." : "Submit Anonymous Grievance"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentRoute('home')}
                  className="text-xs font-semibold text-slate-500 hover:text-sky-500 transition-colors"
                >
                  Cancel and Return
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
