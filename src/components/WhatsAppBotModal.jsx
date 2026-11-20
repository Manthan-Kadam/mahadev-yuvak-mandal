import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  RefreshCw, 
  Send, 
  LogOut, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  Check
} from 'lucide-react';

export const WhatsAppBotModal = ({ 
  isOpen, 
  onClose, 
  members = [], 
  activeMonthObj, 
  settings, 
  lang 
}) => {
  if (!isOpen) return null;

  const isGu = lang === 'gu';
  const [botStatus, setBotStatus] = useState({ connected: false, phone: null, qr: null });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshingQr, setRefreshingQr] = useState(false);
  const [dispatchResults, setDispatchResults] = useState(null);

  // Poll status while modal is open
  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/bot/status');
      if (res.ok) {
        const data = await res.json();
        setBotStatus(data);
      } else {
        setBotStatus({ connected: false, phone: null, qr: null, offline: true });
      }
    } catch (e) {
      // Backend not running
      setBotStatus({ connected: false, phone: null, qr: null, offline: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (!window.confirm(isGu ? 'શું તમે ખરેખર બોટ લિંક રદ કરવા માંગો છો?' : 'Disconnect WhatsApp bot?')) return;
    try {
      await fetch('http://localhost:3001/api/bot/logout', { method: 'POST' });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshQr = async () => {
    setRefreshingQr(true);
    try {
      await fetch('http://localhost:3001/api/bot/refresh-qr', { method: 'POST' });
      await new Promise(r => setTimeout(r, 1500));
      await fetchStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshingQr(false);
    }
  };

  // 100% Background Auto-Send to all pending members
  const handleAutoSendAll = async () => {
    const pendingMembers = members.filter(m => !m.payments?.[activeMonthObj.id]?.paid);
    if (pendingMembers.length === 0) {
      alert(isGu ? 'આ મહિના માટે કોઈ સભ્યનો ફાળો બાકી નથી!' : 'No pending members for this month!');
      return;
    }

    setSending(true);
    setDispatchResults(null);

    try {
      const res = await fetch('http://localhost:3001/api/bot/send-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          members: pendingMembers,
          monthObj: activeMonthObj,
          settings
        })
      });

      const data = await res.json();
      setDispatchResults(data);
    } catch (e) {
      alert(isGu ? 'મેસેજ મોકલવામાં ક્ષતિ આવી.' : 'Error sending automated reminders.');
    } finally {
      setSending(false);
    }
  };

  const pendingCount = members.filter(m => !m.payments?.[activeMonthObj.id]?.paid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shadow-inner">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  {isGu ? 'ઓટોમેટિક WhatsApp સેન્ડર બોટ' : 'Background WhatsApp Auto-Sender Bot'}
                </h3>
                <span className="text-[10px] bg-emerald-400 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full">
                  100% Hands-Free
                </span>
              </div>
              <p className="text-emerald-100 text-xs mt-0.5">
                {isGu ? 'કોઈપણ ક્લિક વગર બધા બાકી સભ્યોને બેકગ્રાઉન્ડમાં સીધા મેસેજ પહોંચશે' : 'Silently dispatches reminders & receipts without manual clicking'}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-xs">{isGu ? 'બોટ સ્થિતિ તપાસી રહ્યા છીએ...' : 'Checking bot status...'}</p>
            </div>
          ) : botStatus.connected ? (
            /* Connected State */
            <div className="space-y-4">
              
              {/* Connected Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{isGu ? 'WhatsApp બોટ સક્રિય છે (Active)' : 'WhatsApp Bot is Connected'}</span>
                    </span>
                    <span className="text-sm font-extrabold text-emerald-800">
                      +{botStatus.phone || 'Connected'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition font-semibold cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isGu ? 'લિંક રદ કરો' : 'Logout'}</span>
                </button>
              </div>

              {/* Automatic Cron Scheduler Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-xs text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{isGu ? '૧ તારીખનું ઓટોમેટિક શેડ્યૂલર સક્રિય છે:' : 'Scheduled 1st of Month Automation Active:'}</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  {isGu 
                    ? `દર મહિનાની ૧ તારીખે સવારે ૦૯:૦૦ વાગ્યે આ બોટ આપોઆપ તમામ બાકી સભ્યોને વ્યક્તિગત WhatsApp મેસેજ મોકલી આપશે.` 
                    : `Every month on the 1st at 09:00 AM, this bot will automatically dispatch personal reminders.`}
                </p>
              </div>

              {/* Instant Auto-Send Button */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {isGu ? 'હમણાં જ તમામ બાકી સભ્યોને મોકલો' : 'Instant Automated Dispatch'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isGu ? `${activeMonthObj.nameGu} મહિનાના ${pendingCount} સભ્યો બાકી છે.` : `${pendingCount} members pending for ${activeMonthObj.nameEn}.`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={sending || pendingCount === 0}
                  onClick={handleAutoSendAll}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isGu ? 'બેકગ્રાઉન્ડમાં ઓટોમેટિક મેસેજ મોકલાઈ રહ્યા છે...' : 'Dispatching in background...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {isGu 
                          ? `🚀 બધા ${pendingCount} બાકી સભ્યોને બેકગ્રાઉન્ડમાં ઓટોમેટિક મોકલો` 
                          : `🚀 Send All ${pendingCount} Reminders in Background`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Dispatch Results */}
              {dispatchResults && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-800">
                    <span>{isGu ? 'રિપોર્ટ:' : 'Dispatch Report:'}</span>
                    <span>{dispatchResults.sentCount} / {dispatchResults.totalCount} {isGu ? 'સફળ' : 'sent'}</span>
                  </div>

                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 text-[11px]">
                    {dispatchResults.results.map((res, i) => (
                      <div key={i} className="py-1 flex items-center justify-between">
                        <span>{res.name} ({res.phone})</span>
                        <span className={res.status === 'sent' ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                          {res.status === 'sent' ? '✅ પહોંચી ગયો' : 'નંબર નથી'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : botStatus.offline ? (
            /* Backend Offline State */
            <div className="text-center py-8 space-y-4 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
                ⚠️
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {isGu ? 'વોટ્સએપ બોટ સર્વર સાથે સંપર્ક થઈ શક્યો નથી' : 'WhatsApp Bot Server Disconnected'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isGu ? 'કૃપા કરીને ખાતરી કરો કે બેકએન્ડ સર્વર (Port 3001) કાર્યરત છે.' : 'Please ensure the background bot server is running on port 3001.'}
                </p>
              </div>
              <button
                type="button"
                onClick={fetchStatus}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition cursor-pointer flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isGu ? 'ફરી પ્રયાસ કરો (Retry)' : 'Retry Connection'}</span>
              </button>
            </div>
          ) : (
            /* QR Code Linking State */
            <div className="text-center space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-sm mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    {isGu ? 'તમારું WhatsApp સ્કેન કરો:' : 'Scan to Connect Your WhatsApp:'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRefreshQr}
                    disabled={refreshingQr}
                    title={isGu ? 'નવો QR કોડ મેળવો' : 'Regenerate QR'}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshingQr ? 'animate-spin' : ''}`} />
                    <span>{isGu ? 'રીફ્રેશ QR' : 'Refresh'}</span>
                  </button>
                </div>

                {botStatus.qr ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-emerald-500/20 inline-block relative group">
                      <img 
                        src={botStatus.qr} 
                        alt="WhatsApp Bot Pairing QR" 
                        className="w-60 h-60 mx-auto rounded-xl"
                      />
                      <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 py-1 px-2 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>{isGu ? 'સ્કેન કરવા માટે તૈયાર' : 'Ready to Scan'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-slate-500 space-y-3 bg-white rounded-xl border border-dashed border-slate-200">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto text-emerald-600" />
                    <div>
                      <p className="font-semibold text-xs text-slate-700">
                        {isGu ? 'વોટ્સએપ સ્કેનર તૈયાર થઈ રહ્યું છે...' : 'Preparing WhatsApp QR Scanner...'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isGu ? 'કૃપા કરીને ૫-૧૦ સેકન્ડ રાહ જુઓ' : 'Please wait 5-10 seconds'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRefreshQr}
                      disabled={refreshingQr}
                      className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 cursor-pointer inline-flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className={`w-3 h-3 ${refreshingQr ? 'animate-spin' : ''}`} />
                      <span>{isGu ? 'નવો QR કોડ બનાવો' : 'Force Generate QR'}</span>
                    </button>
                  </div>
                )}

                <div className="text-left text-xs text-slate-600 space-y-1 bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>📱</span>
                    <span>{isGu ? 'સ્કેન કરવાની સરળ રીત:' : 'Steps to link:'}</span>
                  </p>
                  <p>1. તમારા મોબાઈલમાં <strong>WhatsApp</strong> ખોલો.</p>
                  <p>2. ઉપર જમણી બાજુના ત્રણ ટપકાં (Settings) -&gt; <strong>Linked Devices (લિંક કરેલ ડિવાઇસ)</strong> પર જાઓ.</p>
                  <p>3. <strong>"Link a Device"</strong> પર ક્લિક કરી આ QR સ્કેન કરો.</p>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                🔒 {isGu ? 'એક વાર સ્કેન કર્યા પછી સિસ્ટમ આપોઆપ દર ૧ તારીખે જાતે જ મેસેજ મોકલી દેશે.' : 'Once connected, reminders and receipts will send automatically.'}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            {isGu ? 'બંધ કરો' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
