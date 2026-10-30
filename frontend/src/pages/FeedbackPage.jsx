import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Info, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  ArrowLeft
} from 'lucide-react';

export default function FeedbackPage({ onSubmitFeedback, setCurrentRoute, showToast }) {
  const [category, setCategory] = useState('Academics');
  const [content, setContent] = useState('');
  const [containsPII, setContainsPII] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const categories = [
    'Academics',
    'Infrastructure',
    'Hostel & Mess',
    'Transport',
    'Sports & Cultural',
    'Library',
    'Hospital & Clinical Postings',
    'Others'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast("Please enter your feedback message", "error");
      return;
    }

    if (content.trim().length < 10) {
      showToast("Feedback must be at least 10 characters long", "error");
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
      showToast("Feedback submitted successfully!", "success");
    } catch (err) {
      showToast("Failed to submit feedback: " + err.message, "error");
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200/50 dark:border-slate-800/80 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-800 dark:text-slate-200">GMC STUDENT COUNCIL</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400">
          <button 
            onClick={() => setCurrentRoute('home')}
            className="hover:text-sky-500 underline font-semibold"
          >
            HOME
          </button>
          {' > '}
          <span className="text-sky-600 dark:text-sky-400 font-bold">FEEDBACK</span>
        </div>
      </div>

      {submissionResult ? (
        /* Submission Confirmation with Thumbs sticker */
        <div className="portal-card p-8 sm:p-10 text-center animate-fadeIn space-y-6">
          <div className="w-24 h-24 neu-circle mx-auto p-2 flex items-center justify-center sticker-float">
            <img 
              src="/stickers/thumbs.png" 
              alt="Submission Success" 
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              FEEDBACK RECEIVED
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto">
              Your anonymous submission has been securely delivered to the Student Council review queue.
            </p>
          </div>

          {/* Reference tracking box */}
          <div className="p-4 rounded-2xl neu-pressed max-w-sm mx-auto font-mono text-center">
            <div className="text-xs text-slate-400">YOUR ANONYMOUS TRACKING ID</div>
            <div className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-1">
              {submissionResult.trackingId}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Keep this ID if you need to reference your submission in live chat.
            </div>
          </div>

          {submissionResult.containsPII ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left text-xs text-amber-700 dark:text-amber-300 flex items-start space-x-3 max-w-md mx-auto">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Privacy Protocol Active:</strong> This feedback was flagged as containing identifying information and will NOT be processed by external AI models. Only elected council representatives will review it directly.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-left text-xs text-sky-700 dark:text-sky-300 flex items-start space-x-3 max-w-md mx-auto">
              <ShieldCheck className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Anonymity Guaranteed:</strong> Zero identifying data or IP credentials were retained with this submission.
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="portal-button-primary w-full sm:w-auto font-mono text-xs px-6 py-3"
            >
              [SUBMIT ANOTHER FEEDBACK]
            </button>
            <button
              onClick={() => setCurrentRoute('home')}
              className="portal-button-secondary w-full sm:w-auto font-mono text-xs px-6 py-3"
            >
              RETURN TO HOME
            </button>
          </div>
        </div>
      ) : (
        /* Feedback Submission Form with Doctor (doc.png) Sticker matching prompt */
        <div className="portal-card p-6 sm:p-10 relative">
          {/* Header Banner with Doctor Sticker */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/50 dark:border-slate-800/80">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full neu-pill text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 mb-2">
                <span>GMC MEDICAL GRIEVANCE CELL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight">
                ANONYMOUS FEEDBACK
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
                Your voice matters. Share your clinical, academic, hostel, or campus concerns with total anonymity.
              </p>
            </div>

            {/* Doctor (doc.png) Mascot Sticker in Form */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 neu-circle p-2 flex items-center justify-center flex-shrink-0 sticker-float">
              <img 
                src="/stickers/doc.png" 
                alt="GMC Doctor Council Mascot" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category selection */}
            <div>
              <label 
                htmlFor="feedback_category"
                className="block text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
              >
                SELECT CATEGORY
              </label>
              <div className="relative">
                <select
                  id="feedback_category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3.5 neu-input text-sm appearance-none font-medium focus:ring-2 focus:ring-sky-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#e6edf8] dark:bg-[#0c1427]">
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                  [v]
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label 
                  htmlFor="feedback_content"
                  className="block text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  YOUR FEEDBACK
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {content.length} characters
                </span>
              </div>
              <textarea
                id="feedback_content"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your feedback here... Be as specific as possible regarding the issue or constructive suggestion."
                className="w-full p-4 neu-input text-sm placeholder-slate-400 transition-all resize-y"
                required
              />
            </div>

            {/* Privacy Check Block */}
            <div className="p-5 neu-pressed space-y-3">
              <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200">
                PRIVACY CHECK
              </div>

              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={containsPII}
                  onChange={(e) => setContainsPII(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-none"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  My feedback contains names, room numbers, or identifying personal information.
                </span>
              </label>

              <div className="flex items-start space-x-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>[i]</strong> Feedback containing identifying information will <strong>not</strong> be sent for external AI processing and will be kept strictly restricted to council triage.
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 text-center space-y-3">
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="portal-button-primary w-full sm:w-auto min-w-[240px] px-8 py-3.5 font-mono font-bold text-xs tracking-wider disabled:opacity-50 flex items-center justify-center space-x-2 mx-auto"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "TRANSMITTING..." : "[ SUBMIT FEEDBACK ]"}</span>
              </button>

              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1.5 font-mono">
                <Lock className="w-3.5 h-3.5 text-sky-500" />
                <span>No student login required. 100% Anonymous.</span>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
