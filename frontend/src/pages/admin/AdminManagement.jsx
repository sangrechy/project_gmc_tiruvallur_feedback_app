import React, { useState } from 'react';
import { Users, UserPlus, Shield, Bot, Terminal, CheckCircle2 } from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function AdminManagement({ showToast }) {
  const [admins, setAdmins] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Council Representative');

  React.useEffect(() => {
    storageService.getAdmins().then(setAdmins);
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast("Please fill in name and email", "error");
      return;
    }

    try {
      const created = await storageService.addAdmin({
        name: name.trim(),
        email: email.trim(),
        role
      });
      setAdmins(prev => [...prev, created]);
      setShowAddModal(false);
      setName('');
      setEmail('');
      showToast("Council member authorized", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const telegramCommands = [
    { cmd: '/status', desc: 'Check health status and connection of the Council alert relay service' },
    { cmd: '/help', desc: 'Display command overview and emergency contact guidance' },
    { cmd: '/start', desc: 'Initialize conversation with GMC Student Council Notification Bot' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            Admin &amp; Bot Management
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="portal-button-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Authorize Admin</span>
        </button>
      </div>

      {/* Authorized Council Members Table */}
      <div className="portal-card p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Users className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
            Authorized Council Representatives
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Council Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {admins.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{adm.name}</td>
                  <td className="py-3 px-3 text-slate-500">{adm.email}</td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">{adm.role}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Telegram Admin Bot Controls Section matching wireframe */}
      <div className="portal-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
              TELEGRAM ADMIN BOT INTERFACE (@GMCThiruvallurCouncilBot)
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            WEBHOOK INTEGRATED
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          The Telegram Bot serves as a real-time notification relay, alerting council members instantly when new student grievances or live chat inquiries are submitted. For data security and audit trails, all portal management (grievance triage, circulars, live chat responses, and polls) is conducted securely via this web dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {telegramCommands.map((tc, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 font-mono text-xs space-y-1"
            >
              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                {tc.cmd}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                {tc.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase">
                Authorize Council Admin
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-mono text-slate-400 hover:text-slate-600"
              >
                [CLOSE X]
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Full Name & Designation
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. R. Sanjay (Vice President)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Council Representative Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name.council@gmcthiruvallur.ac.in"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="President">President</option>
                  <option value="Vice President">Vice President</option>
                  <option value="General Secretary">General Secretary</option>
                  <option value="Academic Secretary">Academic Secretary</option>
                  <option value="Hostel & Mess Secretary">Hostel & Mess Secretary</option>
                  <option value="Cultural Secretary">Cultural Secretary</option>
                  <option value="Sports Secretary">Sports Secretary</option>
                  <option value="Council Representative">Council Representative</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="portal-button-secondary text-xs font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="portal-button-primary text-xs font-mono font-bold"
                >
                  SAVE & AUTHORIZE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
