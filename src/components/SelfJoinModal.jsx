import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Phone, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Heart, 
  ShieldCheck, 
  MessageCircle,
  IndianRupee
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { isFemaleMember } from '../utils/whatsapp';

export const SelfJoinModal = ({ 
  isOpen, 
  onClose, 
  onRegisterMember, 
  defaultMonthlyAmount = 300,
  settings,
  lang 
}) => {
  if (!isOpen) return null;

  const isGu = lang === 'gu';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('auto');
  const [monthlyTarget, setMonthlyTarget] = useState(defaultMonthlyAmount);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [joinedMember, setJoinedMember] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-detect gender for respectful 'ભાઈ' / 'બહેન'
  const detectedIsFemale = gender === 'auto' ? isFemaleMember(name) : gender === 'female';
  const currentSalutation = detectedIsFemale ? (isGu ? 'બહેન' : 'Sister') : (isGu ? 'ભાઈ' : 'Brother');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(isGu ? 'કૃપા કરીને તમારું પૂરું નામ લખો.' : 'Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      setError(isGu ? 'કૃપા કરીને ૧૦ અંકનો સાચો મોબાઇલ નંબર લખો.' : 'Please enter valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);

    try {
      const memberData = {
        name: name.trim(),
        phone: cleanPhone,
        gender: detectedIsFemale ? 'female' : 'male',
        monthlyTarget: Number(monthlyTarget) || defaultMonthlyAmount,
        role: isGu ? 'સભ્ય (Member)' : 'Member'
      };

      await onRegisterMember(memberData);
      
      // Fire confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setJoinedMember(memberData);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || (isGu ? 'જોડાવામાં ક્ષતિ આવી, ફરી પ્રયાસ કરો.' : 'Registration failed, please retry.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWhatsAppConfirmation = () => {
    if (!joinedMember) return;
    const adminPhone = settings?.treasurerPhone || '9016991020';
    const text = encodeURIComponent(
      `🚩 *શ્રી મહાદેવ યુવક મંડળ* 🚩\n\nજય ગણેશ! 🙏 હું મંડળમાં સભ્ય તરીકે જોડાયો/જોડાઈ છું:\n👤 *નામ:* ${joinedMember.name} (${currentSalutation})\n📱 *મોબાઇલ:* ${joinedMember.phone || '-'}\n💰 *માસિક ફાળો:* ₹${joinedMember.monthlyTarget}\n\nગણપતિ બાપ્પા મોરિયા! 🌺`
    );
    window.open(`https://wa.me/91${adminPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white p-5 sm:p-6 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-3xl shadow-inner mb-2 border border-white/20">
            🚩
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">
            {settings?.mandalName || 'શ્રી મહાદેવ યુવક મંડળ'}
          </h3>
          <p className="text-orange-100 text-xs sm:text-sm mt-0.5">
            {isGu ? 'ગણેશ મહોત્સવ સભ્ય તરીકે જાતે જોડાઓ' : 'Self-Register as Mandal Member'}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6">
          {isSuccess ? (
            /* Success Card */
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                🎉
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {isGu ? 'અભિનંદન! તમે જોડાઈ ગયા છો' : 'Welcome to the Mandal!'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isGu 
                    ? `નમસ્તે ${joinedMember.name} ${currentSalutation}, તમારી નોંધણી સફળ થઈ ગઈ છે. તમારું નામ હવે ડેશબોર્ડ પર બધા સભ્યોને દેખાશે!`
                    : `Welcome ${joinedMember.name}! You are now successfully listed in the mandal directory.`}
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 text-left text-xs space-y-1.5 text-orange-950">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isGu ? 'નામ:' : 'Name:'}</span>
                  <span className="font-bold">{joinedMember.name} ({currentSalutation})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isGu ? 'મોબાઇલ:' : 'Phone:'}</span>
                  <span className="font-bold">{joinedMember.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isGu ? 'માસિક ફાળો:' : 'Monthly Target:'}</span>
                  <span className="font-bold text-emerald-700">₹{joinedMember.monthlyTarget}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsAppConfirmation}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isGu ? '📲 આયોજકને WhatsApp પર જાણ કરો' : 'Notify Organiser on WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  {isGu ? 'ડેશબોર્ડ પર પાછા જાઓ' : 'Return to Dashboard'}
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-600" />
                  <span>{isGu ? 'તમારું પૂરું નામ *' : 'Your Full Name *'}</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isGu ? 'દા.ત. કિશનભાઈ પરમાર' : 'e.g. Kishan Parmar'}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900"
                />
              </div>

              {/* Salutation / Gender Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isGu ? 'આદરપૂર્વક સન્માન:' : 'Salutation:'}</span>
                  </span>
                  <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    {currentSalutation}
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('auto')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      gender === 'auto'
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ✨ Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      gender === 'male'
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👨 {isGu ? 'ભાઈ' : 'Brother'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      gender === 'female'
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👩 {isGu ? 'બહેન' : 'Sister'}
                  </button>
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isGu ? 'વોટ્સએપ મોબાઇલ નંબર (૧૦ અંક) *' : 'WhatsApp Number (10 Digits) *'}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isGu ? 'આ નંબર પર તમને ફાળાની ઓનલાઈન ડિજિટલ રસીદ મળશે.' : 'Digital receipts will be sent to this WhatsApp number.'}
                </p>
              </div>

              {/* Monthly Amount Target */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isGu ? 'માસિક ફાળો લક્ષ્યાંક (₹)' : 'Monthly Contribution (₹)'}</span>
                </label>
                <div className="flex gap-2">
                  {[200, 300, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMonthlyTarget(amt)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        monthlyTarget === amt
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-95 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{submitting ? (isGu ? 'નોંધણી થઈ રહી છે...' : 'Registering...') : (isGu ? '✨ સભ્ય તરીકે અત્યારે જ જોડાવો' : '✨ Join Now as Member')}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
