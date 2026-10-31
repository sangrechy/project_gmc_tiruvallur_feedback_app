import React, { useState } from 'react';
import { Vote, CheckCircle2, Clock, BarChart3, ArrowLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function PollsPage({ polls, onVotePoll, showToast }) {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [votingPollId, setVotingPollId] = useState(null);

  const activePolls = polls.filter(p => p.status === 'active');
  const closedPolls = polls.filter(p => p.status === 'closed');
  const currentList = activeTab === 'active' ? activePolls : closedPolls;

  const handleSelectOption = (pollId, optionIndex) => {
    setSelectedOptions(prev => ({
      ...prev,
      [pollId]: optionIndex
    }));
  };

  const handleVoteSubmit = async (pollId) => {
    const selected = selectedOptions[pollId];
    if (selected === undefined || selected === null) {
      showToast("Please select an option before casting your vote", "error");
      return;
    }

    setVotingPollId(pollId);
    try {
      await onVotePoll(pollId, selected);
      showToast("Your vote has been counted successfully!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setVotingPollId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 pb-28 sm:py-10 space-y-6 sm:space-y-10 bg-grid-pattern">
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
          <span className="text-sky-600 dark:text-sky-400 font-bold">STUDENT BALLOTS</span>
        </div>
      </div>

      {/* Header with Bleeding Referring Sticker */}
      <div className="relative mt-8 sm:mt-12">
        
        {/* REFERRING STICKER: Bleeding out of top-right edge */}
        <div 
          className="sticker-bleed sticker-float-r -top-10 sm:-top-18 right-1 sm:-right-8 w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 pointer-events-auto"
          title="Student Opinion & Polling Mascot"
        >
          <img 
            src="/stickers/refering.webp" 
            alt="Thinking Mascot Bleeding Out" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Card (overflow-visible) */}
        <div className="portal-card p-4 sm:p-10 relative overflow-visible pt-10 sm:pt-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full neu-pill text-[11px] font-semibold text-sky-600 dark:text-sky-400 mb-3 border border-sky-500/20">
            <Vote className="w-3.5 h-3.5" />
            <span>Collegiate Student Democracy</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
            Student Council Polls &amp; Ballots
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-lg leading-relaxed">
            Vote on key campus matters including clinical rotas, hostel food committees, academic schedules, and annual fest artists.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center space-x-2 ${
            activeTab === 'active'
              ? 'portal-button-primary shadow-sm'
              : 'neu-button text-slate-600 dark:text-slate-300'
          }`}
        >
          <span>Active Ballots</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/20 text-[10px] font-mono">
            {activePolls.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('closed')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center space-x-2 ${
            activeTab === 'closed'
              ? 'portal-button-primary shadow-sm'
              : 'neu-button text-slate-600 dark:text-slate-300'
          }`}
        >
          <span>Concluded Results</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/20 text-[10px] font-mono">
            {closedPolls.length}
          </span>
        </button>
      </div>

      {/* Poll Cards Grid */}
      <div className="space-y-6">
        {currentList.length > 0 ? (
          currentList.map((poll) => {
            const hasVoted = poll.hasVoted;
            const selectedOpt = selectedOptions[poll.id];
            const isVotingThis = votingPollId === poll.id;

            return (
              <div key={poll.id} className="portal-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      {poll.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Closes: {poll.expiresAt}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-semibold neu-pill px-3 py-1 text-slate-500 dark:text-slate-400">
                    {poll.totalVotes} Total Votes
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {poll.question}
                </h2>

                {/* Options List */}
                <div className="space-y-3">
                  {poll.options.map((opt, idx) => {
                    const isSelected = selectedOpt === idx;
                    const percentage = poll.totalVotes > 0 
                      ? Math.round((opt.votes / poll.totalVotes) * 100) 
                      : 0;

                    return (
                      <div
                        key={idx}
                        onClick={() => !hasVoted && poll.status === 'active' && handleSelectOption(poll.id, idx)}
                        className={`relative p-4 rounded-xl transition-all overflow-hidden ${
                          hasVoted || poll.status === 'closed'
                            ? 'neu-pressed cursor-default'
                            : isSelected
                            ? 'neu-pressed border-sky-500 ring-1 ring-sky-500/50 cursor-pointer'
                            : 'neu-pressed hover:border-slate-400/40 cursor-pointer'
                        }`}
                      >
                        {/* Fill Progress Bar */}
                        <div 
                          className="absolute inset-y-0 left-0 bg-sky-500/10 dark:bg-sky-500/15 transition-all duration-500 rounded-l-xl"
                          style={{ width: `${percentage}%` }}
                        />

                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {!hasVoted && poll.status === 'active' && (
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'border-sky-500 bg-sky-500' : 'border-slate-400 dark:border-slate-600'
                              }`}>
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            )}
                            <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                              {opt.text}
                            </span>
                          </div>

                          <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                            <span>{percentage}%</span>
                            <span className="text-[10px] text-slate-400 font-normal ml-1.5">({opt.votes})</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submit Action */}
                {poll.status === 'active' && !hasVoted && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleVoteSubmit(poll.id)}
                      disabled={isVotingThis || selectedOpt === undefined}
                      className="portal-button-primary px-6 py-2.5 text-xs font-semibold disabled:opacity-50 flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isVotingThis ? "Submitting Vote..." : "Cast Vote"}</span>
                    </button>
                  </div>
                )}

                {hasVoted && (
                  <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your vote has been recorded.</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="portal-card p-12 text-center text-slate-500 text-xs font-mono">
            No {activeTab} ballots at this time.
          </div>
        )}
      </div>
    </div>
  );
}
