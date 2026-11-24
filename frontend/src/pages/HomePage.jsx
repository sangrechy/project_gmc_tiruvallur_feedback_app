import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  MessageCircle, 
  Vote, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Megaphone
} from 'lucide-react';

export default function HomePage({ 
  setCurrentRoute, 
  announcements, 
  polls, 
  onVotePoll, 
  showToast 
}) {
  const [selectedPollOption, setSelectedPollOption] = useState(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  // Take primary active poll
  const featuredPoll = polls.find(p => p.status === 'active') || polls[0];
  const latestAnnouncements = announcements.slice(0, 3);

  const handleFeaturedVote = async (e) => {
    e.preventDefault();
    if (selectedPollOption === null) {
      showToast("Please select an option before casting your vote", "error");
      return;
    }
    setIsSubmittingVote(true);
    try {
      await onVotePoll(featuredPoll.id, selectedPollOption);
      showToast("Your vote has been counted!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmittingVote(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-28 sm:pb-20 bg-grid-pattern">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-6 sm:pt-14 pb-4 sm:pb-6 px-3 sm:px-4 overflow-visible">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Student Council Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full neu-pill text-xs font-semibold mb-4 sm:mb-5">
            <ShieldCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span>Student Council • GMC Thiruvallur</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Talk to <span className="text-sky-600 dark:text-sky-400 font-sans">Student Council</span>
          </h1>

          {/* Clean Primary Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setCurrentRoute('feedback')}
              className="portal-button-primary w-full sm:w-auto px-6 sm:px-7 py-3.5 flex items-center justify-center space-x-2.5 text-sm font-semibold tracking-wide group"
            >
              <MessageSquarePlus className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Submit Anonymous Feedback</span>
              <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setCurrentRoute('chat')}
              className="portal-button-secondary w-full sm:w-auto px-6 sm:px-7 py-3.5 flex items-center justify-center space-x-2.5 text-sm font-semibold tracking-wide"
            >
              <MessageCircle className="w-4 h-4 text-sky-500" />
              <span>Talk to Student Council</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* ================= LATEST ANNOUNCEMENTS ================= */}
        <section className="relative">
          {/* Announcements Card Container */}
          <div className="portal-card p-4 sm:p-7 relative">
            <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-slate-200/60 dark:border-white/10 gap-2.5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 status-pulse-dot flex-shrink-0" />
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">
                    Latest Announcements
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full neu-pill text-[10px] font-mono font-semibold">
                  <Megaphone className="w-3 h-3 text-sky-500" />
                  <span>Council Circulars</span>
                </span>
                <button
                  onClick={() => setCurrentRoute('announcements')}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors"
                >
                  <span>View All Updates</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {latestAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => setCurrentRoute('announcements')}
                  className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-[#141c2e]/70 border border-slate-200/60 dark:border-white/5 hover:border-sky-500/40 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider neu-pill truncate max-w-[60%]">
                        {ann.category}
                      </span>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{ann.date}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base group-hover:text-sky-500 transition-colors line-clamp-1">
                      {ann.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {ann.description}
                    </p>
                  </div>
                  
                  <div className="mt-3.5 pt-3 border-t border-slate-200/40 dark:border-white/5 flex items-center text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                    <span>Read Circular</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ACTIVE POLLS WIDGET ================= */}
        {featuredPoll && (
          <section className="relative">
            {/* Active Poll Card */}
            <div className="portal-card p-4 sm:p-7 relative">
              <div className="mb-5 pb-4 border-b border-slate-200/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2">
                  <Vote className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">
                    Student Council Poll
                  </h2>
                </div>
                
                <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-semibold neu-pill">
                  {featuredPoll.totalVotes} Votes
                </span>
              </div>

              <div className="max-w-3xl">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 break-words">
                  {featuredPoll.question}
                </h3>

                <form onSubmit={handleFeaturedVote} className="space-y-2.5 sm:space-y-3">
                  {featuredPoll.options.map((opt, idx) => {
                    const isSelected = selectedPollOption === idx;
                    const percentage = featuredPoll.totalVotes > 0 
                      ? Math.round((opt.votes / featuredPoll.totalVotes) * 100) 
                      : 0;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedPollOption(idx)}
                        className={`relative p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all overflow-hidden ${
                          isSelected
                            ? 'bg-sky-500/10 border border-sky-500 ring-1 ring-sky-500/50'
                            : 'bg-white/60 dark:bg-[#141c2e]/60 border border-slate-200/60 dark:border-white/5 hover:border-slate-400/40'
                        }`}
                      >
                        {/* Progress Fill Bar in background */}
                        <div 
                          className="absolute inset-y-0 left-0 bg-sky-500/15 dark:bg-sky-500/20 transition-all duration-500 rounded-l-xl"
                          style={{ width: `${percentage}%` }}
                        />

                        <div className="relative z-10 flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected ? 'border-sky-500 bg-sky-500' : 'border-slate-400 dark:border-slate-600'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 break-words">
                              {opt.text}
                            </span>
                          </div>

                          <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex-shrink-0 text-right whitespace-nowrap">
                            <span>{percentage}%</span>
                            <span className="text-[10px] text-slate-400 font-normal ml-1">({opt.votes})</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <button
                      type="submit"
                      disabled={isSubmittingVote || selectedPollOption === null}
                      className="portal-button-primary w-full sm:w-auto px-6 py-2.5 text-xs font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isSubmittingVote ? "Tallying Vote..." : "Submit Vote"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentRoute('polls')}
                      className="text-xs font-semibold text-slate-500 hover:text-sky-500 transition-colors flex items-center space-x-1"
                    >
                      <span>Explore all college polls</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* ================= QUICK ACCESS 3-CARD GRID ================= */}
        <section>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">
              Quick Access
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Card 1: Anonymous Feedback */}
            <div 
              onClick={() => setCurrentRoute('feedback')}
              className="portal-card p-6 flex flex-col justify-between hover:scale-[1.02] cursor-pointer transition-all group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-5 text-sky-500 group-hover:text-sky-400 transition-colors">
                  <MessageSquarePlus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  Anonymous Feedback
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Submit grievances regarding clinical rotas, hostel amenities, or faculty concerns with zero credential logging.
                </p>
              </div>
              <div className="mt-6 flex items-center space-x-1 text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                <span>Submit Grievance</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Temporary Live Chat */}
            <div 
              onClick={() => setCurrentRoute('chat')}
              className="portal-card p-6 flex flex-col justify-between hover:scale-[1.02] cursor-pointer transition-all group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-5 text-blue-500 group-hover:text-blue-400 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  Temporary Live Chat
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Encrypted session with student council representatives. Backed by 24h browser cookies with instant self-purge.
                </p>
              </div>
              <div className="mt-6 flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Connect Live</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: Student Polls */}
            <div 
              onClick={() => setCurrentRoute('polls')}
              className="portal-card p-6 flex flex-col justify-between hover:scale-[1.02] cursor-pointer transition-all group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-5 text-amber-500 group-hover:text-amber-400 transition-colors">
                  <Vote className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  Collegiate Polls
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Vote on academic schedules, canteen menus, cultural night themes, and council resolutions.
                </p>
              </div>
              <div className="mt-6 flex items-center space-x-1 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Cast Your Vote</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
