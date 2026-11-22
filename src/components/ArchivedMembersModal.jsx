import React, { useState } from 'react';
import { 
  X, 
  Archive, 
  RotateCcw, 
  Trash2, 
  Phone, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  User,
  Heart
} from 'lucide-react';
import { isFemaleMember } from '../utils/whatsapp';

export const ArchivedMembersModal = ({ 
  isOpen, 
  onClose, 
  archivedMembers = [], 
  onRestoreMember, 
  onPermanentlyDeleteMember, 
  months = [],
  settings, 
  lang 
}) => {
  if (!isOpen) return null;

  const isGu = lang === 'gu';
  const [searchTerm, setSearchTerm] = useState('');
  const [pinPromptMemberId, setPinPromptMemberId] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Total funds preserved in archive
  const totalArchivedFunds = archivedMembers.reduce((sum, m) => {
    return sum + (Number(m.totalPaidAtArchive) || 0);
  }, 0);

  // Filter archived members
  const filtered = archivedMembers.filter(m => {
    const q = searchTerm.toLowerCase();
    return (m.name && m.name.toLowerCase().includes(q)) || 
           (m.phone && m.phone.includes(q));
  });

  const handlePermanentDelete = (memberId) => {
    const validPin = settings?.adminPin || '1020';
    if (pinInput.trim() === String(validPin).trim()) {
      onPermanentlyDeleteMember(memberId);
      setPinPromptMemberId(null);
      setPinInput('');
      setPinError('');
    } else {
      setPinError(isGu 
        ? '❌ ખોટો PIN! ફક્ત એડમિન જ કાયમ માટે હટાવી શકે છે.' 
        : '❌ Incorrect PIN! Only Admin can permanently delete.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 flex items-center justify-center text-xl sm:text-2xl shadow-inner flex-shrink-0">
              📁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {isGu ? 'ડિલીટ થયેલ સભ્યોનો સુરક્ષિત હિસાબ' : 'Archived Members Audit Vault'}
                </h3>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {archivedMembers.length} {isGu ? 'સભ્યો' : 'Members'}
                </span>
              </div>
              <p className="text-orange-200 text-xs mt-0.5">
                {isGu ? 'ફાળો આપનાર સભ્યોનો હિસાબ ક્યારેય ખોવાતો નથી' : 'Preserves financial history of removed members'}
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

        {/* Top Summary Card */}
        <div className="bg-slate-50 border-b border-slate-200 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center gap-1 shadow-2xs">
              <IndianRupee className="w-5 h-5" />
              <span>{totalArchivedFunds.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {isGu ? 'આર્કાઇવમાં સુરક્ષિત જમા રકમ' : 'Total Funds Preserved in Vault'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isGu ? 'જે સભ્યોનો ફાળો ₹૦ હતો તેઓ સીધા દૂર થયા છે.' : 'Zero-contribution members are permanently cleared.'}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="w-full sm:w-56">
            <input 
              type="text" 
              placeholder={isGu ? 'આર્કાઇવમાં શોધો...' : 'Search archived...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Archive className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">
                {isGu ? 'હાલમાં કોઈ આર્કાઇવ રેકોર્ડ નથી' : 'No archived members found'}
              </p>
              <p className="text-[11px] max-w-sm mx-auto text-slate-400">
                {isGu 
                  ? 'જ્યારે પણ કોઈ ફાળો આપનાર સભ્ય ડિલીટ થશે ત્યારે તેમનો સમગ્ર હિસાબ અહીં સુરક્ષિત રહેશે.' 
                  : 'When any member with recorded contributions is removed, their data is kept safe here.'}
              </p>
            </div>
          ) : (
            filtered.map((member) => {
              const isFemale = member.gender === 'female' || isFemaleMember(member.name);
              const salutation = isFemale ? (isGu ? 'બહેન' : 'Sister') : (isGu ? 'ભાઈ' : 'Brother');
              const isPinPrompting = pinPromptMemberId === member.id;

              // Collect paid months list
              const paidMonthNames = [];
              if (member.payments) {
                Object.entries(member.payments).forEach(([mId, p]) => {
                  if (p && p.paid && Number(p.amount) > 0) {
                    const mObj = months.find(m => m.id === mId);
                    paidMonthNames.push({
                      name: mObj ? (isGu ? mObj.nameGu : mObj.short) : mId,
                      amount: p.amount,
                      mode: p.mode || 'UPI'
                    });
                  }
                });
              }

              return (
                <div 
                  key={member.id} 
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {member.name}
                        </span>
                        <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {salutation}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          📱 {member.phone || '-'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>🗓️ {isGu ? 'ડિલીટ તારીખ:' : 'Archived on:'}</span>
                        <span className="font-semibold text-slate-700">
                          {member.archivedDateFormatted || new Date(member.archivedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Paid Amount Pill */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl inline-flex items-center gap-1 shadow-2xs">
                        <span>{isGu ? 'કુલ જમા:' : 'Total Paid:'}</span>
                        <span className="font-black">₹{member.totalPaidAtArchive || 0}</span>
                      </span>
                    </div>
                  </div>

                  {/* Paid Months Badges */}
                  {paidMonthNames.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-[11px] font-bold text-slate-500">
                        {isGu ? 'જમા મહિનાઓ:' : 'Paid Months:'}
                      </span>
                      {paidMonthNames.map((pm, idx) => (
                        <span 
                          key={idx}
                          className="bg-white border border-emerald-200 text-emerald-900 px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{pm.name}: ₹{pm.amount} ({pm.mode})</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => onRestoreMember(member)}
                      className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title={isGu ? 'સક્રિય યાદીમાં પાછા ઉમેરો' : 'Restore back to active list'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isGu ? '🔄 સક્રિય સભ્યોમાં પાછા લાવો' : 'Restore Member'}</span>
                    </button>

                    {/* Permanent Delete Trigger */}
                    {!isPinPrompting ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPinPromptMemberId(member.id);
                          setPinInput('');
                          setPinError('');
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition hover:bg-rose-50 cursor-pointer flex items-center gap-1 text-[11px]"
                        title={isGu ? 'કાયમી હટાવો (Admin PIN)' : 'Permanently Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isGu ? 'કાયમી હટાવો' : 'Purge'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1.5 rounded-xl">
                        <Lock className="w-3 h-3 text-rose-600" />
                        <input
                          type="password"
                          maxLength={6}
                          autoFocus
                          value={pinInput}
                          onChange={(e) => {
                            setPinInput(e.target.value);
                            setPinError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePermanentDelete(member.id);
                          }}
                          placeholder="PIN"
                          className="w-16 px-1.5 py-0.5 bg-white border border-rose-300 rounded text-xs font-mono font-bold text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handlePermanentDelete(member.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-0.5 rounded text-[11px] cursor-pointer"
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPinPromptMemberId(null);
                            setPinInput('');
                            setPinError('');
                          }}
                          className="text-slate-500 hover:text-slate-800 text-[11px] px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {isPinPrompting && pinError && (
                    <p className="text-[11px] text-rose-600 font-bold text-right">
                      {pinError}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 text-right flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            {isGu ? 'બંધ કરો' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
