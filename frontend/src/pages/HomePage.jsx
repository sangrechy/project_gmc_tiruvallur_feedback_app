import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  MessageCircle, 
  Vote, 
  Calendar, 
  ArrowRight, 
  Megaphone, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function HomePage({ 
  setCurrentRoute, 
  announcements, 
  events, 
  polls, 
  onVotePoll, 
  showToast 
}) {
  const [selectedPollOption, setSelectedPollOption] = useState(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  // Take the primary active poll
  const featuredPoll = polls.find(p => p.status === 'active') || polls[0];
  const upcomingEvents = events.filter(e => e.isUpcoming).slice(0, 2);
  const latestAnnouncements = announcements.slice(0, 2);

  const handleFeaturedVote = async (e) => {
    e.preventDefault();
    if (selectedPollOption === null) {
      showToast("Please select an option first", "error");
      return;
    }
    setIsSubmittingVote(true);
    try {
      await onVotePoll(featuredPoll.id, selectedPollOption);
      showToast("Vote recorded successfully!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmittingVote(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-transparent dark:from-emerald-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-200 dark:border-slate-800 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Official Student Representation • GMC Thiruvallur</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            WELCOME TO GMC<br />
            <span className="text-emerald-600 dark:text-emerald-500 font-mono">STUDENT COUNCIL PORTAL</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300">
            Your Voice. Your Campus. Your Council.
          </p>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            100% confidential anonymous grievances, live ephemeral student council chat, democratic polling, and timely campus updates.
          </p>

          {/* Wireframe Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setCurrentRoute('feedback')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 focus:ring-4 focus:ring-emerald-500/20"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>SUBMIT FEEDBACK</span>
            </button>

            <button
              onClick={() => setCurrentRoute('chat')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm tracking-wide border border-slate-300 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>TALK TO COUNCIL</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ================= LATEST ANNOUNCEMENTS ================= */}
        <section className="portal-card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <Megaphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                LATEST ANNOUNCEMENTS
              </h2>
            </div>
            <button
              onClick={() => setCurrentRoute('announcements')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center space-x-1 font-mono tracking-wider"
            >
              <span>[VIEW ALL -&gt;]</span>
            </button>
          </div>

          <div className="space-y-4">
            {latestAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      [{ann.category}]
                    </span>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                      {ann.title}
                    </h3>
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Posted: {ann.date}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {ann.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= QUICK ACCESS 4-CARD GRID ================= */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              QUICK ACCESS
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immediate portals for campus concerns, dialogue, and participation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Anonymous Feedback */}
            <div className="portal-card p-6 flex flex-col justify-between border-t-4 border-t-emerald-500">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight font-mono">
                  ANONYMOUS FEEDBACK
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Share your concerns, academic feedback, hostel issues, or suggestions safely with zero login required.
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('feedback')}
                className="mt-6 w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold transition-colors flex items-center justify-center space-x-1"
              >
                <span>[SUBMIT -&gt;]</span>
              </button>
            </div>

            {/* Card 2: Temporary Live Chat */}
            <div className="portal-card p-6 flex flex-col justify-between border-t-4 border-t-blue-500">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight font-mono">
                  TEMPORARY LIVE CHAT
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Talk directly with active student council members. Ephemeral sessions automatically self-purge after 24h.
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('chat')}
                className="mt-6 w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold transition-colors flex items-center justify-center space-x-1"
              >
                <span>[START CHAT -&gt;]</span>
              </button>
            </div>

            {/* Card 3: Student Polls */}
            <div className="portal-card p-6 flex flex-col justify-between border-t-4 border-t-amber-500">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Vote className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight font-mono">
                  STUDENT POLLS
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Participate in student voting and help shape decisions regarding college events, library timings, and menus.
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('polls')}
                className="mt-6 w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold transition-colors flex items-center justify-center space-x-1"
              >
                <span>[VOTE -&gt;]</span>
              </button>
            </div>

            {/* Card 4: Events & Activities */}
            <div className="portal-card p-6 flex flex-col justify-between border-t-4 border-t-purple-500">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight font-mono">
                  EVENTS & ACTIVITIES
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Explore upcoming medical conferences, symposiums, sports meets, cultural nights, and register online.
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('events')}
                className="mt-6 w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-400 font-mono text-xs font-bold transition-colors flex items-center justify-center space-x-1"
              >
                <span>[EXPLORE -&gt;]</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= UPCOMING EVENTS ================= */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              UPCOMING EVENTS
            </h2>
            <button
              onClick={() => setCurrentRoute('events')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-mono"
            >
              [VIEW ALL EVENTS -&gt;]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((evt, idx) => (
              <div key={evt.id} className="portal-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      EVENT 0{idx + 1}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {evt.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {evt.title}
                  </h3>
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.venue}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {evt.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setCurrentRoute('events')}
                    className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center space-x-1"
                  >
                    <span>[DETAILS -&gt;]</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ACTIVE POLLS WIDGET ================= */}
        {featuredPoll && (
          <section className="portal-card p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  ACTIVE POLLS
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your opinion matters in council decisions
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono">
                {featuredPoll.totalVotes} Total Votes
              </span>
            </div>

            <div className="max-w-2xl">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-4">
                {featuredPoll.question}
              </h3>

              {featuredPoll.userVoted !== null ? (
                /* Poll Results already voted */
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>You voted in this poll. Here are the live results:</span>
                  </div>
                  {featuredPoll.options.map((opt, i) => {
                    const percentage = featuredPoll.totalVotes > 0 
                      ? Math.round((opt.votes / featuredPoll.totalVotes) * 100) 
                      : 0;
                    const isUserChoice = featuredPoll.userVoted === i;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                          <span className={isUserChoice ? "font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1" : ""}>
                            <span>{opt.text}</span>
                            {isUserChoice && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.2 rounded font-mono">(Your Vote)</span>}
                          </span>
                          <span className="font-mono">{percentage}% ({opt.votes})</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${isUserChoice ? 'bg-emerald-600' : 'bg-slate-400 dark:bg-slate-600'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Interactive voting form matching wireframe */
                <form onSubmit={handleFeaturedVote} className="space-y-4">
                  <div className="space-y-2.5">
                    {featuredPoll.options.map((opt, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedPollOption === idx
                            ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-500'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="featured_poll_option"
                          checked={selectedPollOption === idx}
                          onChange={() => setSelectedPollOption(idx)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                          {opt.text}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingVote || selectedPollOption === null}
                      className="portal-button-primary disabled:opacity-50 font-mono tracking-wider font-bold"
                    >
                      {isSubmittingVote ? "SUBMITTING..." : "[SUBMIT VOTE]"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
