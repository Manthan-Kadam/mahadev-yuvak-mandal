import React, { useState, useEffect } from 'react';
import { Phone, Mail, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { MembersMatrix } from './components/MembersMatrix';
import { PaymentModal } from './components/PaymentModal';
import { AddMemberModal } from './components/AddMemberModal';
import { WhatsAppAutomationModal } from './components/WhatsAppAutomationModal';
import { ExpensesTracker } from './components/ExpensesTracker';
import { MemberPassbookView } from './components/MemberPassbookView';
import { UpiSettingsModal } from './components/UpiSettingsModal';
import { MonthlyReminderBanner } from './components/MonthlyReminderBanner';
import { AutoReminderQueueModal } from './components/AutoReminderQueueModal';
import { WhatsAppBotModal } from './components/WhatsAppBotModal';
import { SelfJoinModal } from './components/SelfJoinModal';
import { 
  loadStoredData, 
  saveToStorage, 
  exportToJsonFile, 
  exportToCsv 
} from './utils/storage';
import { getApiUrl } from './utils/api';
import { INITIAL_MEMBERS, INITIAL_EXPENSES, INITIAL_SETTINGS, DEFAULT_MONTHS } from './data/initialData';

export function App() {
  const [initial] = useState(() => loadStoredData());

  const [members, setMembers] = useState(() => {
    return (initial.members && initial.members.length > 0) ? initial.members : INITIAL_MEMBERS;
  });
  const [expenses, setExpenses] = useState(() => {
    return (initial.expenses && initial.expenses.length > 0) ? initial.expenses : INITIAL_EXPENSES;
  });
  const [settings, setSettings] = useState(initial.settings);
  const [months, setMonths] = useState(initial.months);
  const [lang, setLang] = useState(initial.lang || 'gu');
  
  // Default active month: 'm2' (November 2026 - current cycle month)
  const [activeMonth, setActiveMonth] = useState('m2');
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix', 'expenses', 'members'

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState({ member: null, month: null });

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isUpiSettingsOpen, setIsUpiSettingsOpen] = useState(false);
  const [isAutoReminderOpen, setIsAutoReminderOpen] = useState(false);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [isSelfJoinOpen, setIsSelfJoinOpen] = useState(false);

  // Auto-sync with backend so all devices & users see the exact same real-time members
  useEffect(() => {
    let isMounted = true;
    const fetchServerData = async () => {
      try {
        const res = await fetch(getApiUrl('/api/data'));
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            if (data.members && Array.isArray(data.members) && data.members.length > 0) {
              setMembers(data.members);
            }
            if (data.settings && Object.keys(data.settings).length > 0) {
              setSettings(prev => ({ ...prev, ...data.settings }));
            }
          }
        }
      } catch (e) {
        // Fallback to local storage if offline
      }
    };

    fetchServerData();
    const interval = setInterval(fetchServerData, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    saveToStorage('MEMBERS', members);
  }, [members]);

  useEffect(() => {
    saveToStorage('EXPENSES', expenses);
  }, [expenses]);

  useEffect(() => {
    saveToStorage('SETTINGS', settings);
  }, [settings]);

  useEffect(() => {
    saveToStorage('MONTHS', months);
  }, [months]);

  useEffect(() => {
    saveToStorage('LANG', lang);
  }, [lang]);

  // Sync state to backend database so cron job can access it even when browser is closed (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(getApiUrl('/api/sync-data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members, settings, months, expenses, activeMonth })
      }).catch(() => {});
    }, 2500);

    return () => clearTimeout(timer);
  }, [members, settings, months, expenses, activeMonth]);

  const isGu = lang === 'gu';

  // Compute total collections
  let totalCollections = 0;
  members.forEach(m => {
    const target = m.monthlyTarget || settings.monthlyAmount || 500;
    months.forEach(month => {
      const p = m.payments?.[month.id];
      if (p && p.paid) {
        totalCollections += (p.amount || target);
      }
    });
  });

  // Handlers
  const handleSaveMember = (memberData, id) => {
    if (id) {
      // Editing
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...memberData } : m));
    } else {
      // Adding new
      const newMember = {
        ...memberData,
        id: `mem_${Date.now()}`,
        joinedDate: new Date().toISOString().split('T')[0],
        payments: {}
      };
      setMembers(prev => [...prev, newMember]);
    }
  };

  const handleBulkAddMembers = (newMembersList) => {
    const formatted = newMembersList.map((m, idx) => ({
      id: `mem_${Date.now()}_${idx}`,
      name: m.name,
      phone: m.phone || '',
      role: m.role || (isGu ? 'સભ્ય' : 'Member'),
      monthlyTarget: m.monthlyTarget || settings.monthlyAmount || 500,
      joinedDate: new Date().toISOString().split('T')[0],
      payments: {}
    }));
    setMembers(prev => [...prev, ...formatted]);
  };

  const handleSelfJoinMember = async (memberData) => {
    const newMember = {
      ...memberData,
      id: `mem_${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
      payments: {}
    };

    setMembers(prev => [...prev, newMember]);

    try {
      const res = await fetch(getApiUrl('/api/members/join'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.allMembers) {
          setMembers(data.allMembers);
        }
      } else {
        const errData = await res.json();
        if (errData.error) throw new Error(errData.error);
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch')) throw err;
    }
  };

  const handleClearMembers = () => {
    const enteredPin = prompt(isGu 
      ? 'સભ્યોની યાદી સાફ કરવા માટે એડમિન PIN દાખલ કરો (મંથન કદમ):' 
      : 'Enter Admin PIN to clear list:');
    if (enteredPin === (settings.adminPin || '1020')) {
      const confirmMsg = isGu 
        ? 'શું તમે ખરેખર હાલના તમામ સભ્યો હટાવીને તમારા મહાદેવ યુવક મંડળના નવા સભ્યો ઉમેરવા માંગો છો?' 
        : 'Clear all members from the list?';
      if (window.confirm(confirmMsg)) {
        setMembers([]);
      }
    } else if (enteredPin !== null) {
      alert(isGu ? 'ખોટો PIN! ફક્ત એડમિન જ યાદી સાફ કરી શકે છે.' : 'Incorrect PIN! Only Admin can clear the list.');
    }
  };

  const handleDeleteMember = (id, name) => {
    const confirmMsg = isGu 
      ? `શું તમે ખરેખર ${name} ને સભ્યોની યાદીમાંથી કાઢી નાખવા માંગો છો?`
      : `Are you sure you want to delete ${name}?`;
    if (window.confirm(confirmMsg)) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleOpenEditMember = (member) => {
    setEditingMember(member);
    setIsAddMemberOpen(true);
  };

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setIsAddMemberOpen(true);
  };

  const handleOpenPaymentModal = (member, month) => {
    setPaymentModalData({ member, month });
    setIsPaymentOpen(true);
  };

  const handleSavePayment = (memberId, monthId, paymentData) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          payments: {
            ...m.payments,
            [monthId]: paymentData
          }
        };
      }
      return m;
    }));
  };

  const handleSaveMultiMonthPayment = (memberId, monthIds, paymentData) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updatedPayments = { ...m.payments };
        const count = monthIds.length || 1;
        const totalAmt = Number(paymentData.amount) || (count * (m.monthlyTarget || settings.monthlyAmount || 300));
        const amountPerMonth = Math.round(totalAmt / count);

        monthIds.forEach(mId => {
          updatedPayments[mId] = {
            paid: true,
            amount: amountPerMonth,
            date: paymentData.date,
            mode: paymentData.mode,
            ref: paymentData.ref
          };
        });

        return {
          ...m,
          payments: updatedPayments
        };
      }
      return m;
    }));
  };

  const handleAddExpense = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id) => {
    const confirmMsg = isGu ? 'આ ખર્ચ કાઢી નાખવો છે?' : 'Delete this expense?';
    if (window.confirm(confirmMsg)) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleSaveSettings = (newSettings, applyToAll = false) => {
    setSettings(newSettings);
    if (applyToAll && newSettings.monthlyAmount) {
      setMembers(prev => prev.map(m => ({
        ...m,
        monthlyTarget: Number(newSettings.monthlyAmount)
      })));
    }
  };

  const handleUpdateMemberPhone = (memberId, newPhone) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, phone: newPhone } : m));
  };

  const handleExportBackup = () => {
    exportToJsonFile({
      settings,
      members,
      expenses,
      months,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    });
  };

  const handleImportBackup = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.members && parsed.settings) {
            setMembers(parsed.members);
            setExpenses(parsed.expenses || []);
            setSettings(parsed.settings);
            if (parsed.months) setMonths(parsed.months);
            alert(isGu ? 'બેકઅપ સફળતાપૂર્વક લોડ થઈ ગયું છે!' : 'Backup restored successfully!');
          } else {
            alert(isGu ? 'અમાન્ય બેકઅપ ફાઈલ!' : 'Invalid backup file structure!');
          }
        } catch (err) {
          alert(isGu ? 'ફાઈલ વાંચવામાં ભૂલ આવી!' : 'Error parsing backup file!');
        }
      };
    }
  };

  const handleExportCsvData = () => {
    exportToCsv(members, months, settings);
  };

  const handleResetDemoData = () => {
    if (window.confirm(isGu ? 'શું તમે મૂળ ડેમો ડેટા ફરીથી લોડ કરવા માંગો છો?' : 'Reset to initial sample data?')) {
      setMembers(INITIAL_MEMBERS);
      setExpenses(INITIAL_EXPENSES);
      setSettings(INITIAL_SETTINGS);
      setMonths(DEFAULT_MONTHS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        settings={settings}
        lang={lang}
        setLang={setLang}
        onOpenAddMember={handleOpenAddMember}
        onOpenSelfJoin={() => setIsSelfJoinOpen(true)}
        onOpenWhatsAppReport={() => setIsWhatsAppOpen(true)}
        onOpenAutoReminder={() => setIsAutoReminderOpen(true)}
        onOpenBotModal={() => setIsBotModalOpen(true)}
        onOpenUpiSettings={() => setIsUpiSettingsOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onExportCsv={handleExportCsvData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* KPI Stats & Month Selector */}
        <StatsOverview
          members={members}
          months={months}
          expenses={expenses}
          settings={settings}
          activeMonth={activeMonth}
          setActiveMonth={setActiveMonth}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
        />

        {/* 1st of Month Auto-Reminder Banner */}
        <MonthlyReminderBanner
          members={members}
          activeMonthObj={months.find(m => m.id === activeMonth) || months[0]}
          settings={settings}
          onOpenAutoReminderQueue={() => setIsAutoReminderOpen(true)}
          onOpenBotModal={() => setIsBotModalOpen(true)}
          lang={lang}
        />

        {/* Tab 1: 12-Month Matrix */}
        {activeTab === 'matrix' && (
          <MembersMatrix
            members={members}
            months={months}
            settings={settings}
            activeMonth={activeMonth}
            lang={lang}
            onOpenPaymentModal={handleOpenPaymentModal}
            onEditMember={handleOpenEditMember}
            onDeleteMember={handleDeleteMember}
            onOpenAddMember={handleOpenAddMember}
            onOpenSelfJoin={() => setIsSelfJoinOpen(true)}
            onClearMembers={handleClearMembers}
          />
        )}

        {/* Tab 2: Expenses Tracker */}
        {activeTab === 'expenses' && (
          <ExpensesTracker
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            totalCollections={totalCollections}
            lang={lang}
          />
        )}

        {/* Tab 3: Member Passbook View */}
        {activeTab === 'members' && (
          <MemberPassbookView
            members={members}
            months={months}
            settings={settings}
            activeMonth={activeMonth}
            lang={lang}
            onOpenPaymentModal={handleOpenPaymentModal}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs pt-8 sm:pt-10 pb-6 sm:pb-8 px-3 sm:px-4 mt-10 sm:mt-14 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-7">
          
          {/* Top Row: Mandal Info & Quick Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-center md:text-left">
            <div>
              <p className="text-slate-200 font-bold text-sm flex items-center justify-center md:justify-start gap-2">
                <span className="text-base">🚩</span>
                <span>{settings.mandalName}</span>
                <span className="text-orange-400 font-normal bg-orange-950/80 px-2 py-0.5 rounded-full text-xs border border-orange-800/40">• {settings.year}</span>
              </p>
              <p className="text-slate-500 mt-1 text-xs max-w-xl">
                {isGu 
                  ? 'ગણેશ ચતુર્થી ૧૨ મહિનાનો માસિક ફાળો, ખર્ચ અને ઓટોમેટિક WhatsApp રીમાઇન્ડર/પાવતી સિસ્ટમ' 
                  : '12-Month Ganesh Festival Fund Tracker with WhatsApp Automation & Digital Receipts'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs">
              <button
                onClick={() => setIsUpiSettingsOpen(true)}
                className="hover:text-orange-400 transition cursor-pointer text-slate-400"
              >
                {isGu ? 'QR કોડ જુઓ' : 'View QR Code'}
              </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={handleExportBackup}
                className="hover:text-orange-400 transition cursor-pointer text-slate-400"
              >
                {isGu ? 'બેકઅપ ડાઉનલોડ' : 'Download Backup'}
              </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={handleResetDemoData}
                className="text-slate-500 hover:text-rose-400 transition cursor-pointer text-[11px]"
                title="Reset to sample data"
              >
                {isGu ? 'ડેમો ડેટા રીસેટ' : 'Reset Sample Data'}
              </button>
            </div>
          </div>

          {/* Developer Credit & Contact Card: Manthan Kadam (Display only - no direct dialer) */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left shadow-lg">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-500 text-white flex items-center justify-center text-base sm:text-lg shadow-md font-extrabold flex-shrink-0">
                MK
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-slate-400 text-xs">
                    {isGu ? 'તૈયાર કરનાર (Developed by):' : 'Designed & Developed by:'}
                  </span>
                  <span className="text-white font-extrabold text-sm sm:text-base tracking-wide bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                    Manthan Kadam
                  </span>
                  <span className="text-[10px] bg-orange-500/15 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30 font-medium">
                    Creator
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {isGu 
                    ? 'તમારા મંડળ, ટ્રસ્ટ અથવા સંસ્થા માટે આવા કસ્ટમ સોફ્ટવેર/પોર્ટલ બનાવવા માટે સંપર્ક કરી શકો છો' 
                    : 'Custom web portals & automated software solutions for groups and communities'}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Mobile Number - Display only (not direct click to call) */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 shadow-xs select-all"
                title="Mobile: 9016991020"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-400 font-normal">{isGu ? 'મોબાઇલ:' : 'Mobile:'}</span>
                <span className="text-white font-bold tracking-wide">9016991020</span>
              </div>

              {/* Clickable WhatsApp Chat */}
              <a
                href="https://wa.me/919016991020?text=Hello%20Manthan,%20I%20saw%20your%20Ganesh%20Mandal%20Portal!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-100 transition text-xs font-semibold border border-emerald-800/60 shadow-xs cursor-pointer"
                title="WhatsApp Manthan Kadam"
              >
                <span>💬 WhatsApp</span>
              </a>

              {/* Clickable Email */}
              <a
                href="mailto:mannkadam20@gmail.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition text-xs font-semibold border border-slate-700/80 shadow-xs cursor-pointer"
                title="Email Manthan Kadam"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>mannkadam20@gmail.com</span>
              </a>
            </div>
          </div>

          <p className="text-center text-slate-600 text-[11px]">
            © {new Date().getFullYear()} {settings.mandalName} • Built with devotion for Ganesh Mahotsav 🙏
          </p>
        </div>
      </footer>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        member={paymentModalData.member}
        month={paymentModalData.month}
        months={months}
        settings={settings}
        lang={lang}
        onSavePayment={handleSavePayment}
        onSaveMultiPayment={handleSaveMultiMonthPayment}
        onUpdateMemberPhone={handleUpdateMemberPhone}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSaveMember={handleSaveMember}
        onBulkAddMembers={handleBulkAddMembers}
        editingMember={editingMember}
        defaultMonthlyAmount={settings.monthlyAmount}
        lang={lang}
      />

      <WhatsAppAutomationModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        members={members}
        months={months}
        expenses={expenses}
        settings={settings}
        activeMonth={activeMonth}
        lang={lang}
      />

      <UpiSettingsModal
        isOpen={isUpiSettingsOpen}
        onClose={() => setIsUpiSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        lang={lang}
      />

      <AutoReminderQueueModal
        isOpen={isAutoReminderOpen}
        onClose={() => setIsAutoReminderOpen(false)}
        members={members}
        activeMonthObj={months.find(m => m.id === activeMonth) || months[0]}
        settings={settings}
        lang={lang}
      />

      <WhatsAppBotModal
        isOpen={isBotModalOpen}
        onClose={() => setIsBotModalOpen(false)}
        members={members}
        activeMonthObj={months.find(m => m.id === activeMonth) || months[0]}
        settings={settings}
        lang={lang}
      />

      <SelfJoinModal
        isOpen={isSelfJoinOpen}
        onClose={() => setIsSelfJoinOpen(false)}
        onRegisterMember={handleSelfJoinMember}
        defaultMonthlyAmount={settings.monthlyAmount || 300}
        settings={settings}
        lang={lang}
      />

    </div>
  );
}

export default App;
