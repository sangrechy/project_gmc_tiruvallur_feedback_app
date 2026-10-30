import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  MessageCircle, 
  Vote, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles,
  CheckCircle2
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

  // Take primary active poll
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
      <section className="relative overflow-hidden py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Subtle Raiden hero mascot pointing */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 neu-circle p-2 flex items-center justify-center sticker-float">
              <img 
                src="/stickers/look_there.webp" 
                alt="Welcome Guide" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full neu-pill text-sky-700 dark:text-sky-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Official Student Representation • GMC Thiruvallur</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            WELCOME TO GMC<br />
            <span className="text-sky-600 dark:text-sky-400 font-mono">STUDENT COUNCIL PORTAL</span>
          </h1>

          <p className="mt-4 text-base sm:text-xl font-medium text-slate-600 dark:text-slate-300">
            Your Voice. Your Campus. Your Council.
          </p>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            100% confidential anonymous grievances, live ephemeral student council chat, democratic polling, and timely campus updates.
          </p>

          {/* Wireframe Hero CTAs with Neumorphic buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setCurrentRoute('feedback')}
              className="portal-button-primary w-full sm:w-auto px-8 py-3.5 flex items-center justify-center space-x-2 font-mono text-xs sm:text-sm tracking-wider"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>SUBMIT FEEDBACK</span>
            </button>

            <button
              onClick={() => setCurrentRoute('chat')}
              className="portal-button-secondary w-full sm:w-auto px-8 py-3.5 flex items-center justify-center space-x-2 font-mono text-xs sm:text-sm tracking-wider text-sky-600 dark:text-sky-400"
            >
              <MessageCircle className="w-4 h-4" />
              <span>TALK TO COUNCIL</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ================= LATEST ANNOUNCEMENTS WITH GAURD & SYRINGE ================= */}
        <section className="portal-card p-6 sm:p-8 relative overflow-hidden">
          {/* Header with Guard on Left and Syringe on Right */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/80">
            <div className="flex items-center space-x-3">
              {/* Guard Sticker on Left of Announcements */}
              <div className="w-11 h-11 neu-circle p-1.5 flex items-center justify-center flex-shrink-0 sticker-float">
                <img 
                  src="/stickers/gaurd.webp" 
                  alt="Campus Security Guard" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-mono">
                  LATEST ANNOUNCEMENTS
                </h2>
                <div className="text-[11px] font-mono text-slate-400">Verified official council updates</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentRoute('announcements')}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 font-mono tracking-wider"
              >
                [VIEW ALL -&gt;]
              </button>

              {/* Syringe Sticker on Right of Announcements */}
              <div className="w-11 h-11 neu-circle p-1.5 flex items-center justify-center flex-shrink-0 sticker-float-delayed">
                <img 
                  src="/stickers/syringe.png" 
                  alt="Clinical Syringe" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {latestAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-2xl neu-pressed transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 neu-pill">
                      [{ann.category}]
                    </span>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                      {ann.title}
                    </h3>
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Posted: {ann.date}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {ann.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= QUICK ACCESS 4-CARD GRID ================= */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-mono">
              QUICK ACCESS
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immediate portals for campus concerns, dialogue, and participation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Anonymous Feedback */}
            <div className="portal-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 neu-circle flex items-center justify-center mb-4 text-sky-500">
                  <MessageSquarePlus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight font-mono">
                  ANONYMOUS FEEDBACK
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Share your concerns, academic feedback, hostel issues, or suggestions safely with zero login required.
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('feedback')}
                className="mt-6 w-full py-2.5 px-3 portal-button-secondary font-mono text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center justify-center space-x-1"
              >
                <span>[SUBMIT -&gt;]</span>
              </button>
            </div>

            {/* Card 2: Temporary Live Chat */}
            <div className="portal-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 neu-circle flex items-center justify-center mb-4 text-blue-500">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight font-mono">
                  TEMPORARY LIVE CHAT
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Talk directly with active student council members. Ephemeral sessions automatically self-purge after 24h.
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('chat')}
                className="mt-6 w-full py-2.5 px-3 portal-button-secondary font-mono text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center space-x-1"
              >
                <span>[START CHAT -&gt;]</span>
              </button>
            </div>

            {/* Card 3: Student Polls */}
            <div className="portal-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 neu-circle flex items-center justify-center mb-4 text-amber-500">
                  <Vote className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight font-mono">
                  STUDENT POLLS
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Participate in student voting and help shape decisions regarding college events, library timings, and menus.
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('polls')}
                className="mt-6 w-full py-2.5 px-3 portal-button-secondary font-mono text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center space-x-1"
              >
                <span>[VOTE -&gt;]</span>
              </button>
            </div>

            {/* Card 4: Events & Activities */}
            <div className="portal-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 neu-circle flex items-center justify-center mb-4 text-purple-500">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight font-mono">
                  EVENTS & ACTIVITIES
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Explore upcoming medical conferences, symposiums, sports meets, cultural nights, and register online.
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('events')}
                className="mt-6 w-full py-2.5 px-3 portal-button-secondary font-mono text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center space-x-1"
              >
                <span>[EXPLORE -&gt;]</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= UPCOMING EVENTS ================= */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-mono">
              UPCOMING EVENTS
            </h2>
            <button
              onClick={() => setCurrentRoute('events')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 font-mono"
            >
              [VIEW ALL EVENTS -&gt;]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((evt, idx) => (
              <div key={evt.id} className="portal-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                      EVENT 0{idx + 1}
                    </span>
                    <span className="text-xs font-medium px-3 py-1 rounded-full neu-pill text-slate-600 dark:text-slate-300">
                      {evt.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {evt.title}
                  </h3>
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
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
                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80">
                  <button
                    onClick={() => setCurrentRoute('events')}
                    className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center space-x-1"
                  >
                    <span>[DETAILS -&gt;]</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ACTIVE POLLS WIDGET WITH REFERING STICKER ================= */}
        {featuredPoll && (
          <section className="portal-card p-6 sm:p-8 relative">
            <div className="mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Referring / Thinking sticker in Polling */}
                <div className="w-12 h-12 neu-circle p-1.5 flex items-center justify-center flex-shrink-0 sticker-float">
                  <img 
                    src="/stickers/refering.webp" 
                    alt="Thinking / Polling Mascot" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-mono">
                    ACTIVE POLLS
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your opinion matters in council decisions
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium neu-pill text-sky-600 dark:text-sky-400 font-mono">
                {featuredPoll.totalVotes} Total Votes
              </span>
            </div>

            <div className="max-w-2xl">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base mb-4">
                {featuredPoll.question}
              </h3>

              {featuredPoll.userVoted !== null ? (
                /* Poll Results already voted */
                <div className="space-y-3.5">
                  <div className="p-3.5 neu-pressed rounded-xl text-sky-700 dark:text-sky-300 text-xs flex items-center space-x-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    <span>You voted in this poll. Here are the live results:</span>
                  </div>
                  {featuredPoll.options.map((opt, i) => {
                    const percentage = featuredPoll.totalVotes > 0 
                      ? Math.round((opt.votes / featuredPoll.totalVotes) * 100) 
                      : 0;
                    const isUserChoice = featuredPoll.userVoted === i;
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 font-mono">
                          <span className={isUserChoice ? "font-bold text-sky-600 dark:text-sky-400 flex items-center space-x-1" : ""}>
                            <span>{opt.text}</span>
                            {isUserChoice && <span className="text-[10px] neu-pill px-2 py-0.5 ml-2 font-mono">(Your Vote)</span>}
                          </span>
                          <span>{percentage}% ({opt.votes})</span>
                        </div>
                        <div className="w-full neu-pressed h-3 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${isUserChoice ? 'bg-sky-500 shadow-sm' : 'bg-slate-400 dark:bg-slate-600'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Interactive voting form */
                <form onSubmit={handleFeaturedVote} className="space-y-4">
                  <div className="space-y-3">
                    {featuredPoll.options.map((opt, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center space-x-3 p-3.5 rounded-2xl cursor-pointer transition-all ${
                          selectedPollOption === idx
                            ? 'neu-pressed text-sky-600 dark:text-sky-400'
                            : 'neu-button text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="featured_poll_option"
                          checked={selectedPollOption === idx}
                          onChange={() => setSelectedPollOption(idx)}
                          className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-none"
                        />
                        <span className="text-xs sm:text-sm font-medium">
                          {opt.text}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingVote || selectedPollOption === null}
                      className="portal-button-primary disabled:opacity-50 font-mono tracking-wider font-bold text-xs"
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
