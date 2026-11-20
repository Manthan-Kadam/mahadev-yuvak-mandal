import { Bell, ArrowRight, MessageCircle, AlertCircle, Sparkles, Bot } from 'lucide-react';

export const MonthlyReminderBanner = ({ 
  members = [], 
  activeMonthObj, 
  settings, 
  onOpenAutoReminderQueue, 
  onOpenBotModal,
  lang 
}) => {
  const isGu = lang === 'gu';
  const targetPerMonth = settings.monthlyAmount || 300;

  // Filter pending members for active month
  const pendingMembers = members.filter(m => !m.payments?.[activeMonthObj.id]?.paid);
  const totalPendingAmount = pendingMembers.reduce((sum, m) => sum + (m.monthlyTarget || targetPerMonth), 0);

  // If no members are pending or list is empty, don't show the reminder banner
  if (pendingMembers.length === 0 || members.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-orange-200/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200 no-print">
      
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
          🔔
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {isGu ? '૧ તારીખ માસિક રીમાઇન્ડર' : '1st of Month Reminder'}
            </span>
            <span className="text-orange-100 text-xs font-semibold">
              {activeMonthObj.nameGu} ({activeMonthObj.nameEn})
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            {isGu 
              ? `${pendingMembers.length} સભ્યોનો આ મહિનાનો ફાળો બાકી છે (કુલ ₹${totalPendingAmount.toLocaleString('en-IN')})` 
              : `${pendingMembers.length} members pending for this month (Total ₹${totalPendingAmount.toLocaleString('en-IN')})`}
          </h3>

          <p className="text-orange-100 text-xs opacity-90 mt-0.5">
            {isGu 
              ? '૧-ક્લિકથી દરેક સભ્યના પર્સનલ WhatsApp પર બાકી રકમ અને UPI ID સાથેનો મેસેજ મોકલો.' 
              : 'Send personalized WhatsApp reminder with due amount and UPI details in 1 click.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        {onOpenBotModal && (
          <button
            onClick={onOpenBotModal}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95 font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500"
          >
            <Bot className="w-4 h-4" />
            <span>{isGu ? '🤖 ઓટો બોટથી મોકલો' : 'Auto Bot Dispatch'}</span>
          </button>
        )}

        <button
          onClick={onOpenAutoReminderQueue}
          className="w-full sm:w-auto bg-white hover:bg-orange-50 text-orange-700 active:scale-95 font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          <span>{isGu ? 'રીમાઇન્ડર લિસ્ટ (Queue)' : 'Reminder Queue'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
