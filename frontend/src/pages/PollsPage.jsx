import React, { useState } from 'react';
import { Vote, CheckCircle2, Clock, BarChart3, AlertCircle } from 'lucide-react';

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
      showToast("Please choose an option to cast your vote", "error");
      return;
    }

    setVotingPollId(pollId);
    try {
      await onVotePoll(pollId, selected);
      showToast("Your vote has been cast successfully!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setVotingPollId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
          STUDENT DEMOCRACY & FEEDBACK
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
          STUDENT POLLS & VOTING
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Vote on key student issues, academic facilities, campus event themes, and canteen selections.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'active'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span>ACTIVE POLLS</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-700/80 text-[10px] text-white">
            {activePolls.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('closed')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'closed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span>PREVIOUS RESULTS</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-300 dark:bg-slate-700 text-[10px] text-slate-800 dark:text-slate-200">
            {closedPolls.length}
          </span>
        </button>
      </div>

      {/* Poll Cards */}
      <div className="space-y-6">
        {currentList.length > 0 ? (
          currentList.map((poll) => {
            const hasVoted = poll.userVoted !== null && poll.userVoted !== undefined;
            const isClosed = poll.status === 'closed';

            return (
              <div key={poll.id} className="portal-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isClosed
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {isClosed ? "[CLOSED POLL]" : "[ACTIVE POLL]"}
                  </span>

                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Vote className="w-3.5 h-3.5" />
                      <span>{poll.totalVotes} Total Votes</span>
                    </span>
                    {poll.closingDate && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline: {poll.closingDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {poll.question}
                </h2>

                {/* If already voted or closed, display results */}
                {hasVoted || isClosed ? (
                  <div className="space-y-3.5">
                    {hasVoted && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Your vote has been counted. Live voting distribution:</span>
                      </div>
                    )}

                    {poll.options.map((opt, idx) => {
                      const percentage = poll.totalVotes > 0 
                        ? Math.round((opt.votes / poll.totalVotes) * 100) 
                        : 0;
                      const isVoted = poll.userVoted === idx;

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                            <span className={isVoted ? "font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5" : ""}>
                              <span>{opt.text}</span>
                              {isVoted && (
                                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                                  Your Choice
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-xs">{percentage}% ({opt.votes})</span>
                          </div>

                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-700 ${
                                isVoted ? 'bg-emerald-600' : 'bg-slate-400 dark:bg-slate-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Voting form */
                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      {poll.options.map((opt, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center space-x-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                            selectedOptions[poll.id] === idx
                              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 dark:border-emerald-500'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`poll_${poll.id}`}
                            checked={selectedOptions[poll.id] === idx}
                            onChange={() => handleSelectOption(poll.id, idx)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {opt.text}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleVoteSubmit(poll.id)}
                        disabled={votingPollId === poll.id || selectedOptions[poll.id] === undefined}
                        className="portal-button-primary font-mono tracking-wider font-bold text-xs"
                      >
                        {votingPollId === poll.id ? "RECORDING..." : "[SUBMIT VOTE]"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="portal-card p-12 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium">No polls found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
