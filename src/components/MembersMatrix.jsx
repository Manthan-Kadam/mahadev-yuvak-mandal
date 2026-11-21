import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  MessageCircle, 
  QrCode, 
  Edit2, 
  Trash2, 
  Receipt, 
  ChevronRight,
  Send,
  PhoneCall,
  UserPlus,
  ListPlus,
  Layers,
  Sparkles
} from 'lucide-react';
import { createPersonalReminderUrl, getMemberGreeting } from '../utils/whatsapp';

export const MembersMatrix = ({ 
  members, 
  months, 
  settings, 
  activeMonth, 
  lang,
  onOpenPaymentModal,
  onEditMember,
  onDeleteMember,
  onOpenAddMember,
  onOpenSelfJoin,
  onClearMembers,
  onOpenReceiptModal
}) => {
  const isGu = lang === 'gu';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'pending'

  const activeMonthObj = months.find(m => m.id === activeMonth) || months[0];

  // Filtering members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.phone && member.phone.includes(searchTerm));
    
    if (!matchesSearch) return false;

    if (statusFilter === 'paid') {
      return member.payments?.[activeMonth]?.paid === true;
    }
    if (statusFilter === 'pending') {
      return !member.payments?.[activeMonth]?.paid;
    }
    return true;
  });

  // Calculate monthly column totals
  const monthlyTotals = months.map(m => {
    let paidAmount = 0;
    let paidCount = 0;
    members.forEach(mem => {
      const p = mem.payments?.[m.id];
      if (p && p.paid) {
        paidAmount += (p.amount || mem.monthlyTarget || settings.monthlyAmount || 300);
        paidCount++;
      }
    });
    return {
      monthId: m.id,
      paidAmount,
      paidCount
    };
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder={isGu ? "સભ્યનું નામ અથવા મોબાઇલ નંબરથી શોધો..." : "Search member by name or phone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition shadow-sm"
          />
        </div>

        {/* Filter Pills & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            {isGu ? `${activeMonthObj.nameGu}:` : `${activeMonthObj.short}:`}
          </span>
          <div className="inline-flex rounded-lg bg-slate-200/70 p-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isGu ? 'બધા' : 'All'} ({members.length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              {isGu ? 'જમા' : 'Paid'}
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'pending' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              {isGu ? 'બાકી' : 'Pending'}
            </button>
          </div>

          {/* Self Join button for public */}
          {onOpenSelfJoin && (
            <button
              onClick={onOpenSelfJoin}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-extrabold px-3 py-1.5 rounded-lg text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer no-print border border-amber-500/30"
              title={isGu ? 'કોઈપણ વ્યક્તિ સભ્ય તરીકે જાતે જોડાઈ શકે છે' : 'Join as Member'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>{isGu ? '✨ જાતે જોડાઓ' : 'Join'}</span>
            </button>
          )}

          {/* Quick Add Member button */}
          {onOpenAddMember && (
            <button
              onClick={onOpenAddMember}
              className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer no-print"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isGu ? '+ સભ્ય ઉમેરો' : '+ Add Member'}</span>
            </button>
          )}

          {/* Clear / Start Fresh button */}
          {members.length > 0 && onClearMembers && (
            <button
              onClick={onClearMembers}
              title={isGu ? 'હાલના સભ્યો સાફ કરી તમારા નવા સભ્યો ઉમેરો' : 'Clear members to start fresh'}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg text-xs transition cursor-pointer no-print flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isGu ? 'યાદી સાફ કરો' : 'Clear List'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile Swipe Guidance Banner */}
      <div className="md:hidden px-3.5 py-1.5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b border-orange-200/60 text-[11px] text-orange-950 flex items-center justify-between font-medium">
        <span className="flex items-center gap-1 font-semibold text-orange-800">
          <span>👈</span>
          <span>મહિનાઓ જોવા સ્ક્રોલ કરો</span>
          <span>👉</span>
        </span>
        <span className="text-orange-700 font-bold bg-white px-2 py-0.5 rounded-full shadow-2xs border border-orange-200/60">
          👆 ખાના પર ક્લિક કરી જમા કરો
        </span>
      </div>

      {/* Main Responsive Matrix Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[960px] sm:min-w-[1100px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 w-8 sm:w-10 text-center sticky left-0 bg-slate-100 z-20">#</th>
              <th className="py-2.5 sm:py-3 px-2.5 sm:px-4 min-w-[150px] sm:min-w-[200px] sticky left-8 sm:left-10 bg-slate-100 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                {isGu ? 'સભ્યનું નામ અને વિગત' : 'Member Name & Details'}
              </th>
              <th className="py-2.5 sm:py-3 px-2 text-center min-w-[70px] sm:min-w-[90px]">
                {isGu ? 'લક્ષ્યાંક' : 'Target'}
              </th>
              
              {/* 12 Months Columns */}
              {months.map(m => {
                const isActive = m.id === activeMonth;
                return (
                  <th 
                    key={m.id} 
                    className={`py-2.5 sm:py-3 px-1.5 sm:px-2 text-center min-w-[66px] sm:min-w-[76px] transition-colors ${
                      isActive ? 'bg-orange-100 text-orange-950 font-extrabold border-b-2 border-orange-500' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{isGu ? m.nameGu : m.short}</span>
                      {isActive && (
                        <span className="text-[10px] lowercase text-orange-600 font-semibold">(ચાલુ)</span>
                      )}
                    </div>
                  </th>
                );
              })}

              <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center min-w-[75px] sm:min-w-[95px] bg-slate-50">
                {isGu ? 'કુલ જમા' : 'Total Paid'}
              </th>
              <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center min-w-[75px] sm:min-w-[95px] bg-slate-50">
                {isGu ? 'કુલ બાકી' : 'Pending'}
              </th>
              <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center min-w-[90px] sm:min-w-[100px] no-print">
                {isGu ? 'એક્શન' : 'Actions'}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={17} className="py-16 text-center text-slate-500">
                  <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
                      👥
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base">
                        {members.length === 0 
                          ? (isGu ? 'હાલમાં યાદી ખાલી છે!' : 'Member list is currently empty!') 
                          : (isGu ? 'કોઈ સભ્ય મળ્યા નથી.' : 'No members found.')}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {members.length === 0
                          ? (isGu ? 'મહાદેવ યુવક મંડળના સભ્યો એક-એક કરીને ઉમેરો અથવા વોટ્સએપ લિસ્ટ સીધું પેસ્ટ કરો.' : 'Add your group members one-by-one or paste the list from WhatsApp.')
                          : (isGu ? 'શોધ શબ્દ તપાસો અથવા ફિલ્ટર બદલો.' : 'Check your search query or reset filter.')}
                      </p>
                    </div>
                    {onOpenAddMember && (
                      <button
                        onClick={onOpenAddMember}
                        className="mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{isGu ? '+ સભ્યો ઉમેરો (Manual / Bulk Add)' : '+ Add Members'}</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredMembers.map((member, index) => {
                const target = member.monthlyTarget || settings.monthlyAmount || 300;
                
                // Calculate member stats across 12 months
                let memberTotalPaid = 0;
                let memberPaidMonthsCount = 0;

                months.forEach(m => {
                  const p = member.payments?.[m.id];
                  if (p && p.paid) {
                    memberTotalPaid += (p.amount || target);
                    memberPaidMonthsCount++;
                  }
                });

                const memberTotalTarget = target * months.length;
                const memberTotalPending = Math.max(0, memberTotalTarget - memberTotalPaid);
                const activePayment = member.payments?.[activeMonth];
                const isActiveMonthPaid = activePayment && activePayment.paid;
                const greeting = getMemberGreeting(member);

                return (
                  <tr 
                    key={member.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center text-xs font-semibold text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                      {index + 1}
                    </td>

                    {/* Member Info (Sticky Column) */}
                    <td className="py-2.5 sm:py-3 px-2.5 sm:px-4 sticky left-8 sm:left-10 bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5 flex-wrap">
                            <span>{member.name}</span>
                            <span 
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full cursor-help ${
                                greeting.isFemale 
                                  ? 'bg-pink-50 text-pink-700 border border-pink-200' 
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`} 
                              title={isGu ? `મેસેજ સંબોધન: ${greeting.reminderLine}` : `Salutation: ${greeting.title}`}
                            >
                              {greeting.isFemale ? 'બહેન' : 'ભાઈ'}
                            </span>
                            {member.role && (
                              <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {member.role}
                              </span>
                            )}
                          </div>
                          {member.phone && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <span>📞 {member.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Quick WhatsApp Reminder Link for active month if pending */}
                        {!isActiveMonthPaid && member.phone && (
                          <a
                            href={createPersonalReminderUrl(member, activeMonthObj, target, settings)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={isGu ? 'વોટ્સએપ રીમાઇન્ડર મોકલો' : 'Send WhatsApp Reminder'}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition flex-shrink-0 cursor-pointer no-print"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Monthly Target */}
                    <td className="py-3 px-3 text-center text-xs font-semibold text-slate-700">
                      ₹{target}
                    </td>

                    {/* 12 Months Payment Status Cells */}
                    {months.map(m => {
                      const p = member.payments?.[m.id];
                      const isPaid = p && p.paid;
                      const isActive = m.id === activeMonth;

                      return (
                        <td 
                          key={m.id}
                          className={`py-2 px-1 text-center transition-colors ${
                            isActive ? 'bg-orange-50/50' : ''
                          }`}
                        >
                          <button
                            onClick={() => onOpenPaymentModal(member, m)}
                            title={isPaid 
                              ? (isGu ? `જમા: ₹${p.amount} (${p.mode || 'UPI'}) તારીખ: ${p.date || '-'}` : `Paid: ₹${p.amount}`)
                              : (isGu ? 'બાકી - વિગત ભરવા ક્લિક કરો' : 'Pending - Click to record payment')}
                            className={`w-full py-1.5 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              isPaid 
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300' 
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-dashed border-rose-300'
                            }`}
                          >
                            {isPaid ? (
                              <>
                                <span className="flex items-center gap-0.5 text-[11px] leading-tight">
                                  <Check className="w-3 h-3 stroke-[3] text-emerald-600" />
                                  <span>₹{p.amount || target}</span>
                                </span>
                                <span className="text-[9px] font-normal opacity-75">
                                  {p.mode || 'UPI'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center gap-0.5 text-[11px] leading-tight text-rose-500">
                                  <X className="w-3 h-3 stroke-[3]" />
                                  <span>{isGu ? 'બાકી' : 'Due'}</span>
                                </span>
                                <span className="text-[9px] font-normal opacity-60">
                                  ₹{target}
                                </span>
                              </>
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Member Total Paid */}
                    <td className="py-3 px-3 text-center bg-slate-50/80">
                      <span className="font-extrabold text-emerald-700 text-xs">
                        ₹{memberTotalPaid.toLocaleString('en-IN')}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {memberPaidMonthsCount}/12 {isGu ? 'મહિના' : 'mos'}
                      </div>
                    </td>

                    {/* Member Total Pending */}
                    <td className="py-3 px-3 text-center bg-slate-50/80">
                      <span className={`font-bold text-xs ${memberTotalPending > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {memberTotalPending > 0 ? `₹${memberTotalPending.toLocaleString('en-IN')}` : '₹0'}
                      </span>
                      {memberTotalPending === 0 && (
                        <span className="block text-[9px] text-emerald-600 font-bold uppercase">
                          {isGu ? 'પૂર્ણ' : 'Completed'}
                        </span>
                      )}
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 px-3 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenPaymentModal(member, null)}
                          title={isGu ? 'એકસાથે ઘણા મહિના જમા કરો (Multi-Month Pay)' : 'Pay Multiple Months'}
                          className="p-1.5 text-orange-600 hover:text-white hover:bg-orange-600 rounded-lg transition flex items-center gap-0.5 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditMember(member)}
                          title={isGu ? 'સભ્ય સંપાદિત કરો' : 'Edit Member'}
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMember(member.id, member.name)}
                          title={isGu ? 'સભ્ય કાઢી નાખો' : 'Delete Member'}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer with Monthly Column Totals */}
          <tfoot>
            <tr className="bg-slate-100 font-bold text-xs text-slate-800 border-t-2 border-slate-300">
              <td className="py-3 px-3 text-center sticky left-0 bg-slate-100 z-10">∑</td>
              <td className="py-3 px-4 sticky left-10 bg-slate-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                {isGu ? `કુલ જમા થયેલ રકમ (${members.length} સભ્યો)` : `Total Collection (${members.length} members)`}
              </td>
              <td className="py-3 px-3 text-center text-slate-500">-</td>

              {monthlyTotals.map(mt => {
                const isActive = mt.monthId === activeMonth;
                return (
                  <td 
                    key={mt.monthId} 
                    className={`py-3 px-2 text-center ${isActive ? 'bg-orange-200/60 font-extrabold text-orange-950' : ''}`}
                  >
                    <div className="text-emerald-700 font-extrabold text-xs">
                      ₹{mt.paidAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {mt.paidCount}/{members.length}
                    </div>
                  </td>
                );
              })}

              <td className="py-3 px-3 text-center text-emerald-700 font-extrabold text-sm bg-slate-200">
                ₹{monthlyTotals.reduce((sum, m) => sum + m.paidAmount, 0).toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-3 text-center text-slate-500 bg-slate-200">-</td>
              <td className="py-3 px-3 text-center no-print bg-slate-200"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend & Help bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>{isGu ? 'લીલો: ફાળો જમા છે (ક્લિક કરી વિગત જુઓ/બદલો)' : 'Green: Paid'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span>{isGu ? 'લાલ: ફાળો બાકી છે (ક્લિક કરી જમા કરો)' : 'Red: Pending (Click to Pay)'}</span>
          </span>
        </div>
        <div className="text-slate-400">
          💡 {isGu ? 'કોઈપણ ખાના પર ક્લિક કરી પેમેન્ટ નોંધી શકાય છે અથવા રસીદ વોટ્સએપ પર મોકલી શકાય છે.' : 'Click on any cell to record payment or generate WhatsApp receipt.'}
        </div>
      </div>

    </div>
  );
};
