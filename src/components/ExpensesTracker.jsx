import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Tag, 
  Calendar, 
  User, 
  DollarSign, 
  FileText,
  PieChart,
  CheckCircle2
} from 'lucide-react';

export const ExpensesTracker = ({ 
  expenses, 
  onAddExpense, 
  onDeleteExpense, 
  totalCollections, 
  lang 
}) => {
  const isGu = lang === 'gu';
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [category, setCategory] = useState(isGu ? 'મુર્તિ (Ganesh Murti)' : 'Ganesh Murti');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidTo, setPaidTo] = useState('');
  const [note, setNote] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');

  const categories = isGu ? [
    'મુર્તિ એડવાન્સ/પેમેન્ટ (Ganesh Murti)',
    'મંડપ અને સ્ટેજ ડેકોરેશન (Pandal & Stage)',
    'લાઈટિંગ અને ઇલેક્ટ્રિકલ (Lighting)',
    'સાઉન્ડ સિસ્ટમ / ડીજે / ઢોલ (Sound & DJ)',
    'પ્રસાદ / મહાપ્રસાદ (Prasad & Food)',
    'પૂજા સામગ્રી અને હવન (Puja Samagri)',
    'આરતી પુસ્તિકા / આમંત્રણ પત્રિકા (Invitation & Cards)',
    'વિસર્જન શોભાયાત્રા ખર્ચ (Visarjan Procession)',
    'પરચુરણ ખર્ચ (Miscellaneous)'
  ] : [
    'Ganesh Murti / Idol',
    'Pandal & Stage Decoration',
    'Lighting & Electrical',
    'Sound System / DJ / Dhol',
    'Prasad & Mahaprasad',
    'Puja Samagri & Havan',
    'Printing & Invitations',
    'Visarjan Procession',
    'Miscellaneous'
  ];

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remainingSurplus = totalCollections - totalExpenseAmount;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const newExpense = {
      id: `exp_${Date.now()}`,
      category,
      amount: Number(amount),
      date,
      paidTo: paidTo.trim(),
      note: note.trim(),
      paymentMode
    };

    onAddExpense(newExpense);
    setShowAddModal(false);
    setAmount('');
    setPaidTo('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Financial Summary Card */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white rounded-2xl p-6 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="border-b sm:border-b-0 sm:border-r border-white/20 pb-4 sm:pb-0 sm:pr-4">
            <span className="text-xs uppercase tracking-wider text-orange-200 font-semibold">
              {isGu ? 'કુલ જમા ફાળો' : 'Total Collected Fund'}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold mt-1">
              ₹{totalCollections.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-orange-200 mt-1">
              {isGu ? '૧૨ મહિનાનો એકત્રિત ફાળો' : 'From all 12-month contributions'}
            </p>
          </div>

          <div className="border-b sm:border-b-0 sm:border-r border-white/20 pb-4 sm:pb-0 sm:pr-4">
            <span className="text-xs uppercase tracking-wider text-amber-200 font-semibold">
              {isGu ? 'કુલ થયેલ ખર્ચ' : 'Total Festival Expenses'}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-amber-200">
              ₹{totalExpenseAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-orange-200 mt-1">
              {expenses.length} {isGu ? 'ખર્ચ નોંધાયા' : 'entries recorded'}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
              {isGu ? 'હાથ પર શિલક / બેંક સિલક' : 'Net Surplus Balance'}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-emerald-300">
              ₹{remainingSurplus.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-100 mt-1">
              {remainingSurplus >= 0 
                ? (isGu ? '✅ ફંડ પર્યાપ્ત છે' : '✅ Sufficient Balance') 
                : (isGu ? '⚠️ ખાધ (Deficit)' : '⚠️ Deficit')}
            </p>
          </div>
        </div>
      </div>

      {/* Expense Management Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-600" />
              <span>{isGu ? 'ગણેશ મહોત્સવ ખર્ચનો હિસાબ-કિતાબ' : 'Ganesh Mahotsav Expense Tracker'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isGu ? 'મુર્તિ, મંડપ, સાઉન્ડ, પ્રસાદ વગેરે તમામ ખર્ચની પારદર્શક યાદી' : 'Transparent record of all festival preparations & expenses'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isGu ? '+ નવો ખર્ચ ઉમેરો' : '+ Add Expense'}</span>
          </button>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">{isGu ? 'તારીખ' : 'Date'}</th>
                <th className="py-3 px-4">{isGu ? 'ખર્ચ પ્રકાર (Category)' : 'Category'}</th>
                <th className="py-3 px-4">{isGu ? 'વેન્ડર / આપેલ વ્યક્તિ' : 'Paid To'}</th>
                <th className="py-3 px-4">{isGu ? 'વિગત / નોંધ' : 'Note'}</th>
                <th className="py-3 px-4 text-center">{isGu ? 'માધ્યમ' : 'Mode'}</th>
                <th className="py-3 px-4 text-right">{isGu ? 'રકમ' : 'Amount'}</th>
                <th className="py-3 px-4 text-center w-16 no-print">{isGu ? 'કાઢી નાખો' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {isGu ? 'હજુ સુધી કોઈ ખર્ચ ઉમેરેલ નથી.' : 'No expenses recorded yet.'}
                  </td>
                </tr>
              ) : (
                expenses.map((exp, idx) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center text-xs font-semibold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 text-sm">
                      {exp.category}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {exp.paidTo || '-'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {exp.note || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {exp.paymentMode || 'Cash'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-orange-700 text-sm whitespace-nowrap">
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center no-print">
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        title={isGu ? 'ખર્ચ કાઢી નાખો' : 'Delete Expense'}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {expenses.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 font-extrabold text-xs text-slate-800 border-t-2 border-slate-300">
                  <td colSpan={6} className="py-3 px-4 text-right uppercase">
                    {isGu ? 'કુલ થયેલ ખર્ચ:' : 'Total Expense Amount:'}
                  </td>
                  <td className="py-3 px-4 text-right text-orange-800 text-base">
                    ₹{totalExpenseAmount.toLocaleString('en-IN')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {isGu ? 'નવો ઉત્સવ ખર્ચ ઉમેરો' : 'Record New Festival Expense'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'ખર્ચ કેટેગરી *' : 'Category *'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'ખર્ચ રકમ (₹) *' : 'Amount (₹) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'તારીખ' : 'Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'વેન્ડર / દુકાન / વ્યક્તિનું નામ' : 'Paid To (Vendor Name)'}
                </label>
                <input
                  type="text"
                  placeholder={isGu ? "દા.ત. શ્રી ગણેશ મૂર્તિકાર, રાજકોટ" : "e.g. Rajkot Murti Kendra"}
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isGu ? 'પેમેન્ટ માધ્યમ' : 'Payment Mode'}
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Cash">Cash (રોકડ)</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isGu ? 'નોંધ / વિગત' : 'Note'}
                  </label>
                  <input
                    type="text"
                    placeholder={isGu ? "વિગત..." : "Details..."}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  {isGu ? 'રદ કરો' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition"
                >
                  {isGu ? 'ખર્ચ સાચવો' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
