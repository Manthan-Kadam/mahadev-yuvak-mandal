import React, { useState, useEffect } from 'react';
import { X, UserPlus, Phone, User, DollarSign, Shield, ListPlus, FileText, CheckCircle2, Heart } from 'lucide-react';
import { getMemberGreeting, isFemaleMember } from '../utils/whatsapp';

export const AddMemberModal = ({ 
  isOpen, 
  onClose, 
  onSaveMember, 
  onBulkAddMembers,
  editingMember, 
  defaultMonthlyAmount = 300,
  lang 
}) => {
  if (!isOpen) return null;

  const isGu = lang === 'gu';
  const isEditing = !!editingMember;

  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'

  // Single Member State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('auto'); // 'auto', 'male', 'female'
  const [role, setRole] = useState(isGu ? 'સભ્ય (Member)' : 'Member');
  const [monthlyTarget, setMonthlyTarget] = useState(defaultMonthlyAmount);
  const [error, setError] = useState('');

  // Bulk Add State
  const [bulkText, setBulkText] = useState('');
  const [bulkAmount, setBulkAmount] = useState(defaultMonthlyAmount);
  const [bulkPreview, setBulkPreview] = useState([]);

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name || '');
      setPhone(editingMember.phone || '');
      setGender(editingMember.gender || 'auto');
      setRole(editingMember.role || (isGu ? 'સભ્ય (Member)' : 'Member'));
      setMonthlyTarget(editingMember.monthlyTarget || defaultMonthlyAmount);
      setActiveTab('single');
    } else {
      setName('');
      setPhone('');
      setGender('auto');
      setRole(isGu ? 'સભ્ય (Member)' : 'Member');
      setMonthlyTarget(defaultMonthlyAmount);
    }
    setError('');
  }, [editingMember, isOpen, defaultMonthlyAmount, isGu]);

  // Live greeting preview
  const liveGreeting = getMemberGreeting({ name, gender });

  // Parse bulk text whenever it changes
  useEffect(() => {
    if (!bulkText.trim()) {
      setBulkPreview([]);
      return;
    }

    const lines = bulkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed = lines.map(line => {
      // Remove leading serial numbers e.g. "1. ", "1 - ", "1) "
      let cleanLine = line.replace(/^\d+[\.\-\)\s]+/, '').trim();
      
      // Check if line contains a 10-digit phone number
      const phoneMatch = cleanLine.match(/(\b[6-9]\d{9}\b)/);
      let extractedPhone = '';
      if (phoneMatch) {
        extractedPhone = phoneMatch[1];
        cleanLine = cleanLine.replace(extractedPhone, '').replace(/[-–,]/g, '').trim();
      }

      const isFemale = isFemaleMember(cleanLine);

      return {
        name: cleanLine || line,
        phone: extractedPhone,
        monthlyTarget: Number(bulkAmount) || defaultMonthlyAmount,
        role: isGu ? 'સભ્ય' : 'Member',
        gender: isFemale ? 'female' : 'male'
      };
    }).filter(item => item.name.length > 0);

    setBulkPreview(parsed);
  }, [bulkText, bulkAmount, defaultMonthlyAmount, isGu]);

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isGu ? 'કૃપા કરીને સભ્યનું નામ દાખલ કરો.' : 'Please enter member name.');
      return;
    }

    const memberData = {
      name: name.trim(),
      phone: phone.trim().replace(/[^0-9]/g, ''),
      gender: gender,
      role: role.trim(),
      monthlyTarget: Number(monthlyTarget) || defaultMonthlyAmount,
    };

    onSaveMember(memberData, editingMember?.id);
    onClose();
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (bulkPreview.length === 0) {
      setError(isGu ? 'કૃપા કરીને ઓછામાં ઓછું એક નામ દાખલ કરો.' : 'Please enter at least one name.');
      return;
    }

    if (onBulkAddMembers) {
      onBulkAddMembers(bulkPreview);
    }
    onClose();
  };

  const roleOptions = isGu ? [
    'સભ્ય (Member)',
    'પ્રમુખ (President)',
    'ઉપપ્રમુખ (Vice President)',
    'મંત્રી (Secretary)',
    'સહ-મંત્રી (Joint Secretary)',
    'ખજાનચી (Treasurer)',
    'સલાહકાર (Advisor)',
    'યુવા કાર્યકર (Volunteer)'
  ] : [
    'Member',
    'President',
    'Vice President',
    'Secretary',
    'Joint Secretary',
    'Treasurer',
    'Advisor',
    'Volunteer'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isEditing 
                  ? (isGu ? 'સભ્યની વિગત સુધારો' : 'Edit Member Details')
                  : (isGu ? 'સભ્ય મેન્યુઅલી ઉમેરો' : 'Add Mandal Members')}
              </h3>
              <p className="text-orange-100 text-xs">
                {isGu ? 'મહાદેવ યુવક મંડળ - સભ્યોની યાદી' : 'Mahadev Yuvak Mandal Member Registry'}
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

        {/* Tab switch (only if not editing) */}
        {!isEditing && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'single'
                  ? 'bg-white border-t-2 border-orange-600 text-orange-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{isGu ? 'એક સભ્ય ઉમેરો' : 'Add Single Member'}</span>
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bulk'
                  ? 'bg-white border-t-2 border-orange-600 text-orange-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>{isGu ? 'એકસાથે ઘણા સભ્યો ઉમેરો (Bulk Add)' : 'Bulk Add from WhatsApp'}</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Tab 1: Single Member Form */}
        {activeTab === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isGu ? 'સભ્યનું પૂરું નામ *' : 'Member Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isGu ? "દા.ત. રાહુલ પટેલ / ગીતાબેન" : "e.g. Rahul Patel / Geetaben"}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Real-time Salutation Preview */}
              {name.trim() && (
                <div className="mt-2 flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-900 animate-in fade-in">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{isGu ? 'મેસેજમાં સંબોધન:' : 'Greeting:'}</span>
                    <span className="font-bold text-orange-700 underline">{liveGreeting.reminderLine.replace(',', '')}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${liveGreeting.isFemale ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                    {liveGreeting.isFemale ? '👩 બહેન' : '👨 ભાઈ'}
                  </span>
                </div>
              )}
            </div>

            {/* Salutation / Gender Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isGu ? 'સંબોધન / લિંગ (ભાઈ કે બહેન)' : 'Salutation / Gender'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('auto')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    gender === 'auto'
                      ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>⚡</span>
                  <span>{isGu ? 'ઓટો (નામ પરથી)' : 'Auto'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    gender === 'male'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>👨</span>
                  <span>{isGu ? 'ભાઈ (પુરુષ)' : 'Bhai'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    gender === 'female'
                      ? 'bg-pink-600 text-white border-pink-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>👩</span>
                  <span>{isGu ? 'બહેન (મહિલા)' : 'Ben'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isGu ? 'ઓટો રાખશો તો નામ પરથી આપોઆપ ભાઈ કે બહેન નક્કી કરી લેશે.' : 'Auto will detect Bhai or Ben automatically from the name.'}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isGu ? 'મોબાઇલ નંબર (વોટ્સએપ માટે)' : 'Phone Number (For WhatsApp)'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isGu ? '૧૦ આંકડાનો નંબર દાખલ કરો જેથી સીધું WhatsApp ખૂલી શકે' : '10-digit number for 1-click WhatsApp messaging'}
              </p>
            </div>

            {/* Role & Monthly Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'હોદ્દો' : 'Role in Mandal'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  {roleOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'માસિક ફાળો (₹)' : 'Monthly Target (₹)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={monthlyTarget}
                    onChange={(e) => setMonthlyTarget(e.target.value)}
                    placeholder="500"
                    min="0"
                    className="w-full pl-7 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                {isGu ? 'રદ કરો' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition cursor-pointer"
              >
                {isEditing 
                  ? (isGu ? 'સુધારો સાચવો' : 'Update Member')
                  : (isGu ? '+ સભ્ય ઉમેરો' : '+ Add Member')}
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Bulk Add Form */
          <form onSubmit={handleBulkSubmit} className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              💡 <strong>{isGu ? 'વોટ્સએપ ગ્રૂપનું લિસ્ટ સીધું પેસ્ટ કરો:' : 'Quick WhatsApp Paste:'}</strong><br />
              {isGu 
                ? 'દરેક લાઈનમાં એક નામ લખો (નંબર સાથે હોય તો પણ ચાલશે, જેમ કે: "1. રમેશભાઈ 9898112233")'
                : 'Enter one name per line (e.g. "1. Ramesh Patel 9898112233"). Serial numbers will be cleaned automatically.'}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isGu ? 'સભ્યોની યાદી (દર લાઈને એક નામ) *' : 'Paste Names List *'}
              </label>
              <textarea
                rows={5}
                required
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`1. રાહુલભાઈ પટેલ 9898123456\n2. અમિતભાઈ શાહ\n3. હાર્દિકભાઈ દવે\n4. મેહુલભાઈ પરમાર`}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 leading-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isGu ? 'બધા સભ્યો માટે ડિફોલ્ટ માસિક ફાળો (₹)' : 'Default Monthly Target for all (₹)'}
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">₹</span>
                <input
                  type="number"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(e.target.value)}
                  placeholder="500"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Preview */}
            {bulkPreview.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>{isGu ? 'ઉમેરાશે તે સભ્યોનું પ્રિવ્યુ:' : 'Preview to be added:'}</span>
                  <span className="text-emerald-600">{bulkPreview.length} {isGu ? 'સભ્યો' : 'members'}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 max-h-32 overflow-y-auto space-y-1 text-xs">
                  {bulkPreview.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 text-slate-700 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{idx + 1}. {item.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${item.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.gender === 'female' ? 'બહેન' : 'ભાઈ'}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {item.phone ? `📞 ${item.phone}` : ''} • ₹{item.monthlyTarget}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                {isGu ? 'રદ કરો' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={bulkPreview.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isGu 
                    ? `બધા ${bulkPreview.length} સભ્યો એકસાથે ઉમેરો` 
                    : `Add All ${bulkPreview.length} Members`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
