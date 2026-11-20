import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Check, 
  X, 
  MessageCircle, 
  CreditCard, 
  Search, 
  Calendar,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { createPersonalReminderUrl, createPaymentReceiptUrl } from '../utils/whatsapp';

export const MemberPassbookView = ({ 
  members, 
  months, 
  settings, 
  activeMonth, 
  lang,
  onOpenPaymentModal 
}) => {
  const isGu = lang === 'gu';
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMemberId, setExpandedMemberId] = useState(null);

  const activeMonthObj = months.find(m => m.id === activeMonth) || months[0];

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.phone && m.phone.includes(searchTerm))
  );

  const toggleExpand = (id) => {
    setExpandedMemberId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4">
      
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder={isGu ? "સભ્ય શોધો (નામ અથવા મોબાઇલ નંબર)..." : "Search passbook by name or phone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          {isGu ? `કુલ ${filtered.length} સભ્યોની પાસબુક` : `Showing ${filtered.length} member passbooks`}
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(member => {
          const target = member.monthlyTarget || settings.monthlyAmount || 300;
          let totalPaid = 0;
          let paidCount = 0;

          months.forEach(m => {
            const p = member.payments?.[m.id];
            if (p && p.paid) {
              totalPaid += (p.amount || target);
              paidCount++;
            }
          });

          const totalTarget = target * months.length;
          const pendingTotal = Math.max(0, totalTarget - totalPaid);
          const percent = totalTarget > 0 ? Math.round((totalPaid / totalTarget) * 100) : 0;
          const isExpanded = expandedMemberId === member.id;
          const isActiveMonthPaid = member.payments?.[activeMonth]?.paid;

          return (
            <div 
              key={member.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-orange-200 transition"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 flex items-start justify-between gap-3 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>{member.name}</span>
                      {member.role && (
                        <span className="text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                          {member.role}
                        </span>
                      )}
                    </h4>
                    {member.phone && (
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <span>📞 {member.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick WhatsApp Reminder if active month pending */}
                {!isActiveMonthPaid && member.phone && (
                  <a
                    href={createPersonalReminderUrl(member, activeMonthObj, target, settings)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={isGu ? 'WhatsApp Reminder મોકલો' : 'Send Reminder'}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition flex-shrink-0 cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Progress Summary */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {isGu ? 'વાર્ષિક લક્ષ્યાંક' : 'Target'}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-700">
                      ₹{totalTarget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {isGu ? 'જમા રકમ' : 'Paid'}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-600">
                      ₹{totalPaid.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {isGu ? 'બાકી રકમ' : 'Pending'}
                    </span>
                    <span className={`text-xs sm:text-sm font-extrabold ${pendingTotal > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      ₹{pendingTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>{isGu ? '૧૨ મહિનાની પ્રગતિ' : '12-Month Progress'}</span>
                    <span className="text-orange-600 font-bold">{paidCount}/12 {isGu ? 'મહિના પૂર્ણ' : 'months'} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Toggle Breakdown Button */}
                <button
                  onClick={() => toggleExpand(member.id)}
                  className="w-full py-2 text-xs font-bold text-slate-600 hover:text-orange-600 flex items-center justify-center gap-1.5 transition cursor-pointer border-t border-slate-100 pt-3"
                >
                  <span>{isExpanded ? (isGu ? 'વિગત છુપાવો' : 'Hide Details') : (isGu ? '૧૨ મહિનાની સંપૂર્ણ પાસબુક જુઓ' : 'View 12-Month Breakdown')}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Expanded Month-by-month List */}
                {isExpanded && (
                  <div className="pt-2 divide-y divide-slate-100 text-xs animate-in fade-in duration-150">
                    {months.map(m => {
                      const p = member.payments?.[m.id];
                      const isPaid = p && p.paid;

                      return (
                        <div key={m.id} className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                            <span className="font-semibold text-slate-800">{m.nameGu} ({m.short})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPaid ? (
                              <>
                                <span className="text-emerald-700 font-bold">
                                  ₹{p.amount || target} ({p.mode || 'UPI'})
                                </span>
                                {p.date && (
                                  <span className="text-slate-400 text-[10px]">{p.date}</span>
                                )}
                                {member.phone && (
                                  <a
                                    href={createPaymentReceiptUrl(member, m, p, settings)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={isGu ? 'વોટ્સએપ રસીદ મોકલો' : 'Share Receipt'}
                                    className="p-1 text-slate-400 hover:text-emerald-600"
                                  >
                                    <Share2 className="w-3 h-3" />
                                  </a>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => onOpenPaymentModal(member, m)}
                                className="text-rose-600 hover:text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded cursor-pointer"
                              >
                                {isGu ? 'બાકી - જમા કરો' : 'Pending - Pay'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
