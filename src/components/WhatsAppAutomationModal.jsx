import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  ExternalLink, 
  Send, 
  Users, 
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { 
  generateGroupSummaryMessage, 
  generateAnnualAuditReport, 
  createPersonalReminderUrl 
} from '../utils/whatsapp';

export const WhatsAppAutomationModal = ({ 
  isOpen, 
  onClose, 
  members, 
  months, 
  expenses, 
  settings, 
  activeMonth, 
  lang 
}) => {
  if (!isOpen) return null;

  const isGu = lang === 'gu';
  const [activeReportTab, setActiveReportTab] = useState('monthly'); // 'monthly', 'reminders', 'annual'
  const [copied, setCopied] = useState(false);
  const [selectedMonthId, setSelectedMonthId] = useState(activeMonth);

  const currentMonthObj = months.find(m => m.id === selectedMonthId) || months[0];

  // Generate monthly message
  const monthlyMessage = generateGroupSummaryMessage(members, currentMonthObj, settings);
  const annualMessage = generateAnnualAuditReport(members, months, expenses, settings);

  const activeMessage = activeReportTab === 'monthly' ? monthlyMessage : annualMessage;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(activeMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Find all pending members for the selected month
  const pendingMembers = members.filter(m => !m.payments?.[selectedMonthId]?.paid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl flex-shrink-0">
              📲
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isGu ? 'WhatsApp ઓટોમેશન અને રિપોર્ટ શેરિંગ' : 'WhatsApp Automation & Group Reports'}
              </h3>
              <p className="text-emerald-100 text-xs">
                {isGu ? 'એક ક્લિકથી ગ્રૂપમાં રિપોર્ટ અથવા સભ્યોને રીમાઇન્ડર મોકલો' : '1-Click Group Bulletins & Instant Reminders'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-4 pt-2.5 gap-1.5 sm:gap-2 flex-shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveReportTab('monthly')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer border-t-2 border-x ${
              activeReportTab === 'monthly'
                ? 'bg-white border-slate-200 border-t-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isGu ? 'માસિક ગ્રૂપ રિપોર્ટ' : 'Monthly Group Report'}
          </button>

          <button
            onClick={() => setActiveReportTab('reminders')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer border-t-2 border-x flex items-center gap-1.5 ${
              activeReportTab === 'reminders'
                ? 'bg-white border-slate-200 border-t-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{isGu ? 'બાકી રીમાઇન્ડર્સ' : 'Pending Reminders'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-rose-100 text-rose-700">
              {pendingMembers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveReportTab('annual')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer border-t-2 border-x ${
              activeReportTab === 'annual'
                ? 'bg-white border-slate-200 border-t-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isGu ? 'વાર્ષિક ઓડિટ સ્ટેટમેન્ટ' : 'Annual Audit'}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Month Selector for Monthly & Reminders tabs */}
          {activeReportTab !== 'annual' && (
            <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl text-xs">
              <span className="font-semibold text-slate-700">
                {isGu ? 'રિપોર્ટ માટે મહિનો પસંદ કરો:' : 'Select Report Month:'}
              </span>
              <select
                value={selectedMonthId}
                onChange={(e) => setSelectedMonthId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {months.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nameGu} ({m.nameEn})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab 1: Monthly / Annual Text Preview */}
          {(activeReportTab === 'monthly' || activeReportTab === 'annual') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isGu ? 'મેસેજ પ્રિવ્યુ (ગ્રૂપમાં શેર કરવા માટે તૈયાર)' : 'Message Preview'}
                </span>
                <span className="text-xs text-slate-400">
                  {isGu ? 'વોટ્સએપ ફોર્મેટિંગ (*બોલ્ડ*, _ઇટાલિક_) સાથે' : 'Formatted for WhatsApp'}
                </span>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-4 text-xs sm:text-sm font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto select-all shadow-inner">
                {activeMessage}
              </div>
            </div>
          )}

          {/* Tab 2: Individual Reminders List */}
          {activeReportTab === 'reminders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {isGu ? `${currentMonthObj.nameGu} મહિનાના બાકી સભ્યો:` : `Pending in ${currentMonthObj.nameEn}:`}
                </span>
                <span className="text-xs text-rose-600 font-bold">
                  {pendingMembers.length} {isGu ? 'સભ્યો બાકી' : 'members pending'}
                </span>
              </div>

              {pendingMembers.length === 0 ? (
                <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-3xl mb-2">🎉</div>
                  <h4 className="font-bold text-emerald-800">
                    {isGu ? 'અભિનંદન! આ મહિનાનો બધો ફાળો જમા થઈ ગયો છે!' : 'All contributions collected for this month!'}
                  </h4>
                  <p className="text-xs text-emerald-600 mt-1">
                    {isGu ? 'કોઈ સભ્યનું પેમેન્ટ બાકી નથી.' : 'Zero pending dues.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto border border-slate-200 rounded-xl">
                  {pendingMembers.map((member, idx) => {
                    const target = member.monthlyTarget || settings.monthlyAmount || 500;
                    const hasPhone = !!member.phone;
                    const reminderUrl = hasPhone 
                      ? createPersonalReminderUrl(member, currentMonthObj, target, settings) 
                      : null;

                    return (
                      <div key={member.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                        <div>
                          <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <span>{idx + 1}. {member.name}</span>
                            {member.role && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                {member.role}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {hasPhone ? `📞 ${member.phone}` : <span className="text-amber-600">⚠️ {isGu ? 'મોબાઇલ નંબર નથી' : 'No phone number'}</span>} • {isGu ? 'બાકી રકમ:' : 'Due:'} <strong className="text-rose-600">₹{target}</strong>
                          </div>
                        </div>

                        {hasPhone ? (
                          <a
                            href={reminderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{isGu ? 'રીમાઇન્ડર મોકલો' : 'Send'}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            {isGu ? 'નંબર ઉમેરો' : 'Add phone'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>💡 {isGu ? 'મેસેજ કોપી કરીને આપના વ્હોટ્સએપ ગ્રૂપમાં પેસ્ટ કરો.' : 'Copy and paste into your WhatsApp group.'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                copied 
                  ? 'bg-emerald-500 text-white border-emerald-600' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isGu ? 'કોપી થઈ ગયું! ✅' : 'Copied! ✅') : (isGu ? 'મેસેજ કોપી કરો' : 'Copy Message')}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isGu ? 'WhatsApp ખોલો' : 'Open WhatsApp'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
