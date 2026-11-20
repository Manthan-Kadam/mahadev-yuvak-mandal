import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Receipt,
  PiggyBank
} from 'lucide-react';

export const StatsOverview = ({ 
  members, 
  months, 
  expenses, 
  settings, 
  activeMonth, 
  setActiveMonth,
  activeTab,
  setActiveTab,
  lang 
}) => {
  const isGu = lang === 'gu';

  // Compute overall annual metrics
  let totalAnnualTarget = 0;
  let totalAnnualCollected = 0;
  
  // Compute active month metrics
  let monthTarget = 0;
  let monthCollected = 0;
  let monthPaidCount = 0;

  members.forEach(m => {
    const target = m.monthlyTarget || settings.monthlyAmount || 300;
    
    // Annual
    totalAnnualTarget += (target * months.length);
    months.forEach(month => {
      const p = m.payments?.[month.id];
      if (p && p.paid) {
        totalAnnualCollected += (p.amount || target);
      }
    });

    // Active month
    monthTarget += target;
    const activeP = m.payments?.[activeMonth];
    if (activeP && activeP.paid) {
      monthCollected += (activeP.amount || target);
      monthPaidCount++;
    }
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalAnnualPending = Math.max(0, totalAnnualTarget - totalAnnualCollected);
  const netBalance = totalAnnualCollected - totalExpenses;
  const annualPercentage = totalAnnualTarget > 0 ? Math.round((totalAnnualCollected / totalAnnualTarget) * 100) : 0;
  const monthPending = Math.max(0, monthTarget - monthCollected);
  const monthPercentage = monthTarget > 0 ? Math.round((monthCollected / monthTarget) * 100) : 0;

  const currentMonthObj = months.find(m => m.id === activeMonth) || months[0];

  return (
    <div className="space-y-6">
      
      {/* Top Hero Banner with Month Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-orange-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200/50">
            {isGu ? 'વાર્ષિક ચક્ર પ્રગતિ' : 'Annual Cycle Overview'} ({settings.year})
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-1.5">
            {isGu ? 'ગણેશ મહોત્સવ ફાળો અને બચત સમીક્ષા' : 'Ganesh Utsav Fund & Collection Dashboard'}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isGu 
              ? `${members.length} સભ્યો દર મહિને ફાળો જમા કરે છે • ૧૨ મહિનાનું કુલ લક્ષ્યાંક ₹${totalAnnualTarget.toLocaleString('en-IN')}`
              : `${members.length} members contributing monthly • Annual Target ₹${totalAnnualTarget.toLocaleString('en-IN')}`}
          </p>
        </div>

        {/* Quick Month Selector Pill Bar */}
        <div className="flex flex-col gap-1.5 no-print">
          <span className="text-xs font-semibold text-slate-600 flex items-center justify-between">
            <span>{isGu ? 'ચાલુ મહિનો પસંદ કરો:' : 'Select Current Month:'}</span>
            <span className="text-orange-600 font-bold">{isGu ? currentMonthObj.nameGu : currentMonthObj.nameEn}</span>
          </span>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {months.map(m => {
              const isSelected = m.id === activeMonth;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMonth(m.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    isSelected 
                      ? 'bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/20' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isGu ? m.nameGu : m.short}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        
        {/* Card 1: Total Annual Collection */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-3 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between opacity-85">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
              {isGu ? 'કુલ જમા ફાળો' : 'Total Collected'}
            </span>
            <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <span className="text-xl sm:text-3xl font-extrabold tracking-tight">
              ₹{totalAnnualCollected.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] sm:text-xs ml-1 opacity-80 block sm:inline">/ ₹{totalAnnualTarget.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-center gap-2">
            <div className="flex-1 bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, annualPercentage)}%` }}
              />
            </div>
            <span className="text-xs font-bold">{annualPercentage}%</span>
          </div>
        </div>

        {/* Card 2: Active Month Status */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              {isGu ? `${currentMonthObj.nameGu} ફાળો` : `${currentMonthObj.short} Status`}
            </span>
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              ₹{monthCollected.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 ml-1 block sm:inline">/ ₹{monthTarget.toLocaleString('en-IN')}</span>
          </div>
          <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-slate-500 flex items-center justify-between">
            <span>{isGu ? 'જમા:' : 'Paid:'} <strong className="text-emerald-600">{monthPaidCount}/{members.length}</strong></span>
            <span className="font-semibold text-emerald-600">{monthPercentage}%</span>
          </p>
        </div>

        {/* Card 3: Pending in Active Month */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              {isGu ? `${currentMonthObj.nameGu} બાકી` : `${currentMonthObj.short} Pending`}
            </span>
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 flex-shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <span className="text-xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
              ₹{monthPending.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-slate-500">
            <span>{isGu ? 'બાકી:' : 'Pending:'} </span>
            <strong className="text-rose-600 font-bold">{members.length - monthPaidCount} {isGu ? 'સભ્યો' : 'members'}</strong>
          </p>
        </div>

        {/* Card 4: Total Expenses */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
              {isGu ? 'કુલ ખર્ચ' : 'Total Expenses'}
            </span>
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-slate-500">
            <span>{expenses.length} {isGu ? 'ખર્ચ નોંધાયેલ' : 'entries'}</span>
          </p>
        </div>

        {/* Card 5: Available Balance / Surplus */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-3 sm:p-4 shadow-sm relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between opacity-85">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
              {isGu ? 'શિલક (બચત)' : 'Net Balance'}
            </span>
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <span className="text-xl sm:text-3xl font-extrabold tracking-tight">
              ₹{netBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs opacity-90 font-medium truncate">
            {netBalance >= 0 
              ? (isGu ? '✅ બેલેન્સ સુરક્ષિત છે' : '✅ Healthy Balance')
              : (isGu ? '⚠️ ખાધ (Deficit)' : '⚠️ Deficit')}
          </p>
        </div>

      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 no-print overflow-x-auto scrollbar-none flex-nowrap">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 ${
            activeTab === 'matrix' 
              ? 'bg-orange-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span>{isGu ? '૧૨ મહિના મેટ્રિક્સ' : '12-Month Matrix'}</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 ${
            activeTab === 'expenses' 
              ? 'bg-orange-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4 flex-shrink-0" />
          <span>{isGu ? 'ખર્ચ હિસાબ' : 'Expenses'}</span>
          {expenses.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] sm:text-xs ${activeTab === 'expenses' ? 'bg-orange-800 text-orange-100' : 'bg-slate-200 text-slate-700'}`}>
              {expenses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 ${
            activeTab === 'members' 
              ? 'bg-orange-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4 flex-shrink-0" />
          <span>{isGu ? 'સભ્યોની પાસબુક' : 'Passbooks'}</span>
        </button>
      </div>

    </div>
  );
};
