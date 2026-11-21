import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Share2, 
  Calendar, 
  CreditCard, 
  MessageCircle, 
  DollarSign, 
  FileText, 
  Phone,
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
import { createPaymentReceiptUrl, createMultiMonthReceiptUrl } from '../utils/whatsapp';
import { getApiUrl } from '../utils/api';
import confetti from 'canvas-confetti';

export const PaymentModal = ({ 
  isOpen, 
  onClose, 
  member, 
  month, 
  months = [],
  settings, 
  lang, 
  onSavePayment,
  onSaveMultiPayment,
  onUpdateMemberPhone 
}) => {
  if (!isOpen || !member) return null;

  const isGu = lang === 'gu';
  const targetPerMonth = member.monthlyTarget || settings.monthlyAmount || 300;

  // Mode: 'single' (this month only) or 'multi' (multiple months at once)
  const [payMode, setPayMode] = useState('single');

  // Single month state
  const existingPayment = (month && member.payments?.[month.id]) || {};
  const [isPaid, setIsPaid] = useState(existingPayment.paid ?? true);
  const [amount, setAmount] = useState(
    existingPayment.amount ?? targetPerMonth
  );
  const [date, setDate] = useState(
    existingPayment.date || new Date().toISOString().split('T')[0]
  );
  const [mode, setMode] = useState(existingPayment.mode || 'UPI');
  const [ref, setRef] = useState(existingPayment.ref || '');
  const [phone, setPhone] = useState(member.phone || '');
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);

  // Multi-month state: Set of selected month IDs
  const [selectedMonthIds, setSelectedMonthIds] = useState([]);
  const [multiAmount, setMultiAmount] = useState(0);

  useEffect(() => {
    setPhone(member.phone || '');
    setIsPaid(existingPayment.paid ?? true);
    setAmount(existingPayment.amount ?? targetPerMonth);
    setDate(existingPayment.date || new Date().toISOString().split('T')[0]);
    setMode(existingPayment.mode || 'UPI');
    setRef(existingPayment.ref || '');

    // Initialize multi-selection: Default with current month + next pending months
    if (month) {
      setSelectedMonthIds([month.id]);
      setMultiAmount(targetPerMonth);
    } else {
      // Find first pending month
      const firstPending = months.find(m => !member.payments?.[m.id]?.paid);
      if (firstPending) {
        setSelectedMonthIds([firstPending.id]);
        setMultiAmount(targetPerMonth);
      }
    }
  }, [member, month, existingPayment.paid, targetPerMonth]);

  // Update multi amount when selectedMonthIds change
  const handleToggleMonth = (mId) => {
    let next;
    if (selectedMonthIds.includes(mId)) {
      next = selectedMonthIds.filter(id => id !== mId);
    } else {
      next = [...selectedMonthIds, mId];
    }
    setSelectedMonthIds(next);
    setMultiAmount(next.length * targetPerMonth);
  };

  // Quick Multi Selection Helpers
  const selectNextMonths = (count) => {
    const pendingMonths = months.filter(m => !member.payments?.[m.id]?.paid);
    const chosen = pendingMonths.slice(0, count).map(m => m.id);
    setSelectedMonthIds(chosen);
    setMultiAmount(chosen.length * targetPerMonth);
  };

  const selectAllPendingMonths = () => {
    const pending = months.filter(m => !member.payments?.[m.id]?.paid).map(m => m.id);
    setSelectedMonthIds(pending);
    setMultiAmount(pending.length * targetPerMonth);
  };

  const paymentModes = [
    { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
    { id: 'GPay', label: 'Google Pay' },
    { id: 'PhonePe', label: 'PhonePe' },
    { id: 'Paytm', label: 'Paytm' },
    { id: 'Cash', label: isGu ? 'રોકડ (Cash)' : 'Cash' },
    { id: 'Bank Transfer', label: isGu ? 'બેંક ટ્રાન્સફર (NEFT/IMPS)' : 'Bank Transfer' }
  ];

  // Handler for Single Month Save
  const handleSingleSave = (forceSendReceipt = null) => {
    const shouldSendReceipt = forceSendReceipt !== null ? forceSendReceipt : autoSendWhatsApp;

    const paymentData = isPaid ? {
      paid: true,
      amount: Number(amount) || 0,
      date: date,
      mode: mode,
      ref: ref.trim() || `REC-${Math.floor(1000 + Math.random() * 9000)}`
    } : {
      paid: false,
      amount: 0
    };

    if (phone && phone !== member.phone && onUpdateMemberPhone) {
      onUpdateMemberPhone(member.id, phone.trim());
    }

    if (month) {
      onSavePayment(member.id, month.id, paymentData);
    }

    if (isPaid) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    }

    const finalPhone = phone || member.phone;
    if (isPaid && shouldSendReceipt && finalPhone && month) {
      const receiptMember = { ...member, phone: finalPhone };
      const receiptUrl = createPaymentReceiptUrl(receiptMember, month, paymentData, settings);

      // Attempt silent background send via bot first
      fetch(getApiUrl('/api/bot/send-receipt'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: receiptMember,
          monthObj: month,
          payment: paymentData,
          settings
        })
      }).then(r => r.json()).then(res => {
        if (!res.success) {
          window.open(receiptUrl, '_blank');
        }
      }).catch(() => {
        window.open(receiptUrl, '_blank');
      });
    }

    onClose();
  };

  // Handler for Multi-Month Save
  const handleMultiSave = (forceSendReceipt = null) => {
    if (selectedMonthIds.length === 0) {
      alert(isGu ? 'કૃપા કરીને ઓછામાં ઓછો એક મહિનો પસંદ કરો.' : 'Please select at least one month.');
      return;
    }

    const shouldSendReceipt = forceSendReceipt !== null ? forceSendReceipt : autoSendWhatsApp;

    const paymentData = {
      paid: true,
      amount: Number(multiAmount) || (selectedMonthIds.length * targetPerMonth),
      date: date,
      mode: mode,
      ref: ref.trim() || `REC-${Math.floor(1000 + Math.random() * 9000)}`
    };

    if (phone && phone !== member.phone && onUpdateMemberPhone) {
      onUpdateMemberPhone(member.id, phone.trim());
    }

    if (onSaveMultiPayment) {
      onSaveMultiPayment(member.id, selectedMonthIds, paymentData);
    }

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    } catch (e) {}

    const finalPhone = phone || member.phone;
    if (shouldSendReceipt && finalPhone) {
      const selectedObjs = months.filter(m => selectedMonthIds.includes(m.id));
      const receiptMember = { ...member, phone: finalPhone };
      const receiptUrl = createMultiMonthReceiptUrl(
        receiptMember, 
        selectedObjs, 
        paymentData.amount, 
        paymentData, 
        settings
      );

      // Attempt silent background send via bot first
      fetch(getApiUrl('/api/bot/send-multi-receipt'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: receiptMember,
          selectedMonthObjs: selectedObjs,
          totalAmount: paymentData.amount,
          payment: paymentData,
          settings
        })
      }).then(r => r.json()).then(res => {
        if (!res.success) {
          window.open(receiptUrl, '_blank');
        }
      }).catch(() => {
        window.open(receiptUrl, '_blank');
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
              {isGu ? 'ગણેશ મહોત્સવ ફાળો પાવતી' : 'Contribution Record'}
            </span>
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mt-0.5">
              <span>{member.name}</span>
            </h3>
            <p className="text-orange-100 text-[11px] sm:text-xs mt-0.5">
              {settings.mandalName} • {settings.year}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs: Single Month vs Multiple Months */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-4 pt-2 gap-1.5 sm:gap-2 flex-shrink-0 overflow-x-auto scrollbar-none">
          {month && (
            <button
              type="button"
              onClick={() => setPayMode('single')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer flex-shrink-0 ${
                payMode === 'single'
                  ? 'bg-white border-t-2 border-orange-600 text-orange-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isGu ? `આ મહિનો (${month.nameGu})` : `This Month (${month.short})`}
            </button>
          )}

          <button
            type="button"
            onClick={() => setPayMode('multi')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              payMode === 'multi' || !month
                ? 'bg-white border-t-2 border-orange-600 text-orange-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-orange-600" />
            <span className="hidden sm:inline">{isGu ? '⚡ એકસાથે ઘણા મહિના જમા કરો (Multi-Month)' : '⚡ Pay Multiple Months'}</span>
            <span className="sm:hidden">{isGu ? '⚡ એકસાથે જમા' : '⚡ Multi-Month'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto flex-1">
          
          {/* TAB 1: Single Month Payment */}
          {payMode === 'single' && month && (
            <div className="space-y-4">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isGu ? `${month.nameGu} મહિનાની સ્થિતિ:` : `${month.nameEn} Status:`}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPaid(true)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition cursor-pointer ${
                      isPaid 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm' 
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${isPaid ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{isGu ? 'જમા થયેલ (Paid)' : 'Paid'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPaid(false)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition cursor-pointer ${
                      !isPaid 
                        ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-sm' 
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <X className={`w-4 h-4 ${!isPaid ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span>{isGu ? 'બાકી છે (Pending)' : 'Pending'}</span>
                  </button>
                </div>
              </div>

              {isPaid && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isGu ? 'જમા રકમ (₹)' : 'Amount (₹)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Multi-Month Payment */}
          {payMode === 'multi' && (
            <div className="space-y-4">
              
              {/* Quick Preset Selection Chips */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">
                  {isGu ? '⚡ ઝડપી પસંદગી (Quick Select):' : '⚡ Quick Select Months:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectNextMonths(2)}
                    className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {isGu ? '+ ૨ મહિના (₹600)' : '+ 2 Months (₹600)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectNextMonths(3)}
                    className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {isGu ? '+ ૩ મહિના (₹900)' : '+ 3 Months (₹900)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectNextMonths(6)}
                    className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {isGu ? '+ ૬ મહિના (₹1,800)' : '+ 6 Months (₹1,800)'}
                  </button>
                  <button
                    type="button"
                    onClick={selectAllPendingMonths}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {isGu ? '🎯 બાકી તમામ મહિના' : '🎯 All Pending Months'}
                  </button>
                </div>
              </div>

              {/* 12 Months Checkbox Grid */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    {isGu ? 'જે મહિના જમા કરવા હોય તેના પર ક્લિક કરો:' : 'Select Months to Pay:'}
                  </span>
                  <span className="text-orange-600 font-bold">
                    {selectedMonthIds.length} {isGu ? 'મહિના પસંદ કર્યા' : 'selected'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                  {months.map(m => {
                    const isAlreadyPaid = member.payments?.[m.id]?.paid;
                    const isChecked = selectedMonthIds.includes(m.id);

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleMonth(m.id)}
                        className={`p-2 rounded-lg text-left text-xs transition border flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                            : isAlreadyPaid
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 opacity-75'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-bold block">{m.nameGu}</span>
                          <span className="text-[10px] opacity-80">
                            {isAlreadyPaid ? (isChecked ? (isGu ? 'ફરીથી જમા' : 'Re-pay') : (isGu ? 'જમા છે' : 'Paid')) : `₹${targetPerMonth}`}
                          </span>
                        </div>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-white flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total Multi Amount */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-950 block">
                    {isGu ? `કુલ જમા રકમ (${selectedMonthIds.length} મહિના):` : `Total Amount (${selectedMonthIds.length} mos):`}
                  </span>
                  <span className="text-[11px] text-amber-700">
                    ₹{targetPerMonth} × {selectedMonthIds.length} {isGu ? 'મહિના' : 'months'}
                  </span>
                </div>

                <div className="relative max-w-[120px]">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={multiAmount}
                    onChange={(e) => setMultiAmount(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 bg-white border border-amber-300 rounded-lg text-sm font-extrabold text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Common Payment Details: Date, Mode, Ref, WhatsApp */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            
            {/* Auto WhatsApp Checkbox */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSendWhatsApp}
                  onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <div>
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isGu ? 'સેવ થતાં જ સભ્યને WhatsApp પર આપોઆપ રસીદ મોકલો' : 'Auto-open WhatsApp receipt on save'}</span>
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    {payMode === 'multi' 
                      ? (isGu ? 'એકસાથે જમા કરેલા તમામ મહિનાઓની વિગતવાર પાવતી WhatsApp પર ખૂલશે.' : 'Consolidated multi-month receipt will open in WhatsApp.')
                      : (isGu ? 'ડિજિટલ પાવતી આપોઆપ સભ્યના WhatsApp પર ખૂલશે.' : 'Personalized receipt message will auto-open in WhatsApp.')}
                  </p>
                </div>
              </label>

              {/* If member has no phone, prompt here to add it */}
              {!member.phone && (
                <div className="pt-2 border-t border-emerald-200/60">
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                    {isGu ? 'સભ્યનો WhatsApp મોબાઇલ નંબર (૧૦ આંકડા):' : 'Member WhatsApp Phone Number:'}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Date and Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'જમા તારીખ' : 'Payment Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'પેમેન્ટ માધ્યમ' : 'Payment Mode'}
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  {paymentModes.map(pm => (
                    <option key={pm.id} value={pm.id}>{pm.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reference / Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isGu ? 'ટ્રાન્ઝેક્શન રેફરન્સ / પાવતી નં (Optional)' : 'Transaction ID / Reference'}
              </label>
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder={isGu ? "દા.ત. UPI-827364 અથવા રોકડા આપ્યા" : "e.g. UPI Ref / Cash note"}
                className="w-full px-3.5 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            {isGu ? 'રદ કરો' : 'Cancel'}
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {payMode === 'single' ? (
              (phone || member.phone) && autoSendWhatsApp && isPaid ? (
                <button
                  type="button"
                  onClick={() => handleSingleSave(true)}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isGu ? 'જમા કરો & WhatsApp પાવતી મોકલો' : 'Confirm & Open WhatsApp'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSingleSave(false)}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
                >
                  {isGu ? 'જમા કરો (Save Record)' : 'Save Record'}
                </button>
              )
            ) : (
              /* Multi-Month Button */
              <button
                type="button"
                onClick={() => handleMultiSave(autoSendWhatsApp)}
                disabled={selectedMonthIds.length === 0}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {isGu 
                    ? `એકસાથે ${selectedMonthIds.length} મહિના જમા કરો (₹${multiAmount})` 
                    : `Confirm ${selectedMonthIds.length} Mos (₹${multiAmount})`}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
