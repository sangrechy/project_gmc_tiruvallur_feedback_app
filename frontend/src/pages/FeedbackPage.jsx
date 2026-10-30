import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Info, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Sparkles,
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
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-800 dark:text-slate-200">GMC STUDENT COUNCIL</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400">
          <button 
            onClick={() => setCurrentRoute('home')}
            className="hover:text-emerald-600 underline font-semibold"
          >
            HOME
          </button>
          {' > '}
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">FEEDBACK</span>
        </div>
      </div>

      {submissionResult ? (
        /* Submission Confirmation */
        <div className="portal-card p-8 sm:p-10 text-center animate-fadeIn space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              FEEDBACK RECEIVED
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto">
              Your anonymous submission has been securely delivered to the Student Council review queue.
            </p>
          </div>

          {/* Reference tracking box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto font-mono text-center">
            <div className="text-xs text-slate-400">YOUR ANONYMOUS TRACKING ID</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {submissionResult.trackingId}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Keep this ID if you need to reference your submission in live chat.
            </div>
          </div>

          {submissionResult.containsPII ? (
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2.5 max-w-md mx-auto">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Privacy Protocol Active:</strong> This feedback was flagged as containing identifying information and will NOT be processed by external AI models. Only elected council representatives will review it directly.
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2.5 max-w-md mx-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Anonymity Guaranteed:</strong> Zero identifying data or IP credentials were retained with this submission.
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="portal-button-primary w-full sm:w-auto font-mono"
            >
              [SUBMIT ANOTHER FEEDBACK]
            </button>
            <button
              onClick={() => setCurrentRoute('home')}
              className="portal-button-secondary w-full sm:w-auto font-mono"
            >
              RETURN TO HOME
            </button>
          </div>
        </div>
      ) : (
        /* Feedback Submission Form matching wireframe */
        <div className="portal-card p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              ANONYMOUS FEEDBACK
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Your voice matters. Share your concerns, issues, and constructive suggestions with the student council.
            </p>
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
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm appearance-none transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
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
                className="w-full p-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors resize-y"
                required
              />
            </div>

            {/* Privacy Check Block */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200">
                PRIVACY CHECK
              </div>

              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={containsPII}
                  onChange={(e) => setContainsPII(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  My feedback contains names, room numbers, or identifying personal information.
                </span>
              </label>

              <div className="flex items-start space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
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
                className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-sm tracking-wider shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center space-x-2 mx-auto"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "TRANSMITTING..." : "[ SUBMIT FEEDBACK ]"}</span>
              </button>

              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>No student login required. 100% Anonymous.</span>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
