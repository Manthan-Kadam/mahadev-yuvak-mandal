import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Check, 
  MessageCircle, 
  Bell, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  Users,
  AlertCircle
} from 'lucide-react';
import { createPersonalReminderUrl, getMemberGreeting } from '../utils/whatsapp';

export const AutoReminderQueueModal = ({ 
  isOpen, 
  onClose, 
  members = [], 
  activeMonthObj, 
  settings, 
  lang 
}) => {
  if (!isOpen) return null;

  const isGu = lang === 'gu';
  const targetPerMonth = settings.monthlyAmount || 300;

  // Filter pending members for the current active month
  const pendingMembers = members.filter(m => !m.payments?.[activeMonthObj.id]?.paid);

  // Keep track of sent member IDs in this session
  const [sentMemberIds, setSentMemberIds] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMember = pendingMembers[currentIndex];

  const handleSendReminder = (member) => {
    if (!member || !member.phone) return;

    const url = createPersonalReminderUrl(
      member, 
      activeMonthObj, 
      member.monthlyTarget || targetPerMonth, 
      settings
    );

    // Open WhatsApp
    window.open(url, '_blank');

    // Mark as sent
    setSentMemberIds(prev => new Set(prev).add(member.id));

    // Auto-advance to next pending member if in queue
    if (currentIndex < pendingMembers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSendAllSequentially = () => {
    if (pendingMembers.length === 0) return;
    const firstUnsentIndex = pendingMembers.findIndex(m => !sentMemberIds.has(m.id) && m.phone);
    if (firstUnsentIndex !== -1) {
      setCurrentIndex(firstUnsentIndex);
      handleSendReminder(pendingMembers[firstUnsentIndex]);
    }
  };

  const completedCount = sentMemberIds.size;
  const totalCount = pendingMembers.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl">
              🔔
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isGu ? '૧ તારીખ માસિક WhatsApp રીમાઇન્ડર' : '1st of Month Auto-Reminder Dispatcher'}
              </h3>
              <p className="text-orange-100 text-xs">
                {isGu 
                  ? `${activeMonthObj.nameGu} મહિનાના બાકી સભ્યોને વ્યક્તિગત મેસેજ મોકલો` 
                  : `Send personal reminder to pending members for ${activeMonthObj.nameEn}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>
              {isGu ? 'રીમાઇન્ડર પ્રોગ્રેસ:' : 'Dispatch Progress:'} {completedCount} / {totalCount} {isGu ? 'સભ્યો મોકલાયા' : 'sent'}
            </span>
            <span className="text-orange-600 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {totalCount === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <h4 className="font-bold text-emerald-800 text-base">
                {isGu ? 'અભિનંદન! આ મહિનાનો કોઈ ફાળો બાકી નથી!' : 'All contributions collected for this month!'}
              </h4>
              <p className="text-xs text-slate-500">
                {isGu ? 'બધા સભ્યોનો ફાળો જમા થઈ ચૂક્યો છે.' : 'No pending reminders needed.'}
              </p>
            </div>
          ) : (
            <>
              {/* Highlight Queue Card for Next Member */}
              {currentMember && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-orange-200 rounded-2xl p-4 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full inline-block mb-2">
                    {isGu ? 'આગામી સભ્ય (Next in Line):' : 'Next Member to Message:'}
                  </span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 flex-wrap">
                        <span>{currentMember.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${getMemberGreeting(currentMember).isFemale ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                          {getMemberGreeting(currentMember).isFemale ? 'બહેન' : 'ભાઈ'}
                        </span>
                        {sentMemberIds.has(currentMember.id) && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> {isGu ? 'મોકલાઈ ગયું' : 'Sent'}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {currentMember.phone ? `📞 ${currentMember.phone}` : <span className="text-rose-500 font-bold">⚠️ મોબાઇલ નંબર નથી</span>} • {isGu ? 'બાકી રકમ:' : 'Due:'} <strong className="text-rose-600 font-bold">₹{currentMember.monthlyTarget || targetPerMonth}</strong>
                      </p>
                    </div>

                    {currentMember.phone ? (
                      <button
                        type="button"
                        onClick={() => handleSendReminder(currentMember)}
                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{isGu ? 'WhatsApp મોકલો & આગળ વધો' : 'Send on WhatsApp & Next'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {isGu ? 'નંબર ઉમેરો' : 'Add phone'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Complete Pending Members Queue List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{isGu ? 'બાકી તમામ સભ્યોની યાદી:' : 'All Pending Members:'}</span>
                  <span className="text-rose-600 font-semibold">{pendingMembers.length} {isGu ? 'બાકી' : 'pending'}</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  {pendingMembers.map((m, idx) => {
                    const isSent = sentMemberIds.has(m.id);
                    const isSelected = currentMember?.id === m.id;

                    return (
                      <div 
                        key={m.id}
                        className={`p-3 flex items-center justify-between transition ${
                          isSelected ? 'bg-orange-50/70 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-slate-400 w-5">{idx + 1}.</span>
                          <div>
                            <div className="text-xs sm:text-sm text-slate-800 font-bold flex items-center gap-1.5">
                              <span>{m.name}</span>
                              {isSent && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {m.phone ? m.phone : 'નંબર નથી'} • ₹{m.monthlyTarget || targetPerMonth}
                            </div>
                          </div>
                        </div>

                        {m.phone ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentIndex(idx);
                              handleSendReminder(m);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isSent 
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            <span>{isSent ? (isGu ? 'ફરીથી મોકલો' : 'Resend') : (isGu ? 'મોકલો' : 'Send')}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-rose-500 italic">
                            {isGu ? 'મોબાઇલ નંબર નથી' : 'No Phone'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            💡 {isGu ? 'બટન દબાવતાં જ સભ્યના નંબર પર વ્યક્તિગત WhatsApp રીમાઇન્ડર ખૂલી જશે.' : 'Personal WhatsApp reminder opens for each contact.'}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            {isGu ? 'બંધ કરો' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
