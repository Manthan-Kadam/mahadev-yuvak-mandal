import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
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
  Check,
  Lock,
  Unlock,
  KeyRound
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

  // Admin PIN Protection State (Only Manthan Kadam can manage the WhatsApp QR/Session)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Poll status while modal is open
  const fetchStatus = async () => {
    try {
      const res = await fetch(getApiUrl('/api/bot/status'));
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

  const handleVerifyPin = () => {
    const validPin = settings?.adminPin || '1020';
    if (pinInput.trim() === String(validPin).trim()) {
      setIsAdminUnlocked(true);
      setShowPinPrompt(false);
      setPinError('');
      setPinInput('');
    } else {
      setPinError(isGu 
        ? '❌ ખોટો PIN! ફક્ત મંથન કદમ (એડમિન) જ WhatsApp બોટ બદલી શકે છે.' 
        : '❌ Incorrect PIN! Only Admin can manage WhatsApp Bot.');
    }
  };

  const handleLogout = async () => {
    if (!isAdminUnlocked) {
      setShowPinPrompt(true);
      return;
    }

    if (!window.confirm(isGu ? 'શું તમે ખરેખર બોટ લિંક રદ કરવા માંગો છો?' : 'Disconnect WhatsApp bot?')) return;
    try {
      await fetch(getApiUrl('/api/bot/logout'), { method: 'POST' });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshQr = async () => {
    if (!isAdminUnlocked) {
      setShowPinPrompt(true);
      return;
    }

    setRefreshingQr(true);
    try {
      await fetch(getApiUrl('/api/bot/refresh-qr'), { method: 'POST' });
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
    if (!isAdminUnlocked) {
      setShowPinPrompt(true);
      return;
    }

    const pendingMembers = members.filter(m => !m.payments?.[activeMonthObj.id]?.paid);
    if (pendingMembers.length === 0) {
      alert(isGu ? 'આ મહિના માટે કોઈ સભ્યનો ફાળો બાકી નથી!' : 'No pending members for this month!');
      return;
    }

    setSending(true);
    setDispatchResults(null);

    try {
      const res = await fetch(getApiUrl('/api/bot/send-reminders'), {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[94vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-800 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 flex items-center justify-center text-xl sm:text-2xl shadow-inner flex-shrink-0">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {isGu ? 'ઓટોમેટિક WhatsApp સેન્ડર બોટ' : 'Background WhatsApp Auto-Sender Bot'}
                </h3>
                {isAdminUnlocked ? (
                  <span className="text-[10px] bg-emerald-300 text-emerald-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>ADMIN</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>PROTECTED</span>
                  </span>
                )}
              </div>
              <p className="text-emerald-100 text-xs mt-0.5">
                {isGu ? 'સત્તાવાર બોટ • ફક્ત મંથન કદમ જ QR સ્કેન કરી શકે છે' : 'Official WhatsApp Gateway • Admin Protected'}
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
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
                      <span>{isGu ? 'મહાદેવ યુવક મંડળ WhatsApp બોટ સક્રિય છે' : 'WhatsApp Bot is Connected'}</span>
                    </span>
                    <span className="text-sm font-extrabold text-emerald-800">
                      +{botStatus.phone || 'Connected'}
                    </span>
                  </div>
                </div>

                {isAdminUnlocked ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isGu ? 'લિંક રદ કરો' : 'Logout'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPinPrompt(true)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>{isGu ? 'એડમિન કંટ્રોલ' : 'Admin'}</span>
                  </button>
                )}
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
          ) : !isAdminUnlocked ? (
            /* QR is locked for regular viewers */
            <div className="text-center py-8 px-4 space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-3xl shadow-xs">
                🔒
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {isGu ? 'સુરક્ષિત સત્તાવાર WhatsApp બોટ' : 'Official WhatsApp Gateway'}
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {isGu 
                    ? 'આ WhatsApp બોટ ફક્ત મુખ્ય એડમિન (મંથન કદમ) જ લિંક અથવા સ્કેન કરી શકે છે. જેથી બધા સભ્યોને એક જ સત્તાવાર નંબર પરથી મેસેજ પહોંચે અને કોઈ અન્ય લિંક ન કરી શકે.'
                    : 'Only Manthan Kadam (Admin) can scan and link this WhatsApp bot.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPinPrompt(true)}
                className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isGu ? '🔑 એડમિન QR સ્કેનર ખોલો (PIN દાખલ કરો)' : 'Unlock QR Scanner (Admin PIN)'}</span>
              </button>
            </div>
          ) : (
            /* QR Code Linking State (Admin Unlocked Only!) */
            <div className="text-center space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isGu ? '🔓 એડમિન સ્કેનર સક્રિય: તમારું WhatsApp લિંક કરો' : '🔓 Admin scanner active'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdminUnlocked(false)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-950 underline font-semibold cursor-pointer"
                >
                  {isGu ? 'લૉક કરો' : 'Lock'}
                </button>
              </div>

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
            </div>
          )}

        </div>

        {/* PIN Verification Dialog Overlay */}
        {showPinPrompt && (
          <div className="absolute inset-0 z-30 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 max-w-sm w-full space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {isGu ? '🔐 એડમિન વેરિફિકેશન' : '🔐 Admin Verification'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isGu 
                    ? 'WhatsApp બોટ સ્કેનર ફક્ત મંથન કદમ (એડમિન) જ બદલી શકે છે. તમારો સિક્રેટ PIN દાખલ કરો.' 
                    : 'Only Admin (Manthan Kadam) can link or control this WhatsApp bot.'}
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="password"
                  maxLength={8}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyPin();
                  }}
                  placeholder="••••"
                  className="w-full text-center text-xl tracking-[0.5em] font-mono py-2.5 px-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-bold"
                />
                {pinError && (
                  <p className="text-xs text-rose-600 text-center font-semibold flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinPrompt(false);
                    setPinInput('');
                    setPinError('');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  {isGu ? 'રદ કરો' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPin}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isGu ? 'અનલૉક કરો' : 'Unlock'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
