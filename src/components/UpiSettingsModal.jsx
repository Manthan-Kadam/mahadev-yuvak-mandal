import React, { useState, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Settings, 
  Check, 
  Copy, 
  ExternalLink, 
  Save, 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  Sparkles,
  Download,
  IndianRupee,
  Layers
} from 'lucide-react';

export const UpiSettingsModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSaveSettings, 
  lang 
}) => {
  if (!isOpen) return null;

  const isGu = lang === 'gu';
  const [formData, setFormData] = useState({ ...settings });
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'settings'
  const [applyToAllMembers, setApplyToAllMembers] = useState(false);
  
  // QR Amount Selector State: 'open' (user enters whatever amount), '100', '300', '600', '900', '1800', '3600', 'custom'
  const [qrAmountMode, setQrAmountMode] = useState('open'); 
  const [customQrAmount, setCustomQrAmount] = useState('100');

  const fileInputRef = useRef(null);
  const settingsFileInputRef = useRef(null);

  // Compute amount parameter for dynamic UPI URI
  let amountParam = '';
  let displayAmountLabel = isGu ? 'ખુલ્લી રકમ (સભ્ય જાતે ભરી શકે)' : 'Open / Any Amount';

  if (qrAmountMode === 'open') {
    amountParam = ''; // No &am parameter -> GPay/PhonePe prompts user to type any amount!
    displayAmountLabel = isGu ? 'ખુલ્લી રકમ (સભ્ય ગમે તેટલી રકમ ₹૧૦૦, ₹૨૦૦, ₹૩૦૦ ભરી શકે છે)' : 'Open Amount (Member enters any amount)';
  } else if (qrAmountMode === 'custom') {
    const val = Number(customQrAmount) || 0;
    amountParam = val > 0 ? `&am=${val}` : '';
    displayAmountLabel = `₹${val}`;
  } else {
    amountParam = `&am=${qrAmountMode}`;
    displayAmountLabel = `₹${qrAmountMode}`;
  }

  // Construct dynamic UPI URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(formData.upiId || '')}&pn=${encodeURIComponent(formData.mandalName || 'Mahadev Yuvak Mandal')}${amountParam}&cu=INR&tn=${encodeURIComponent(formData.upiQrNote || 'Mahadev Yuvak Mandal')}`;
  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUri)}`;

  // Active QR image to show: Custom image if uploaded, otherwise dynamic
  const activeQrImage = formData.customQrImage || dynamicQrCodeUrl;
  const isCustomImage = !!formData.customQrImage;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(formData.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress and scale down to max 500x500 to keep localStorage light & fast
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const updated = {
          ...formData,
          customQrImage: compressedDataUrl
        };
        setFormData(updated);
        onSaveSettings(updated, false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomQr = () => {
    const updated = {
      ...formData,
      customQrImage: null
    };
    setFormData(updated);
    onSaveSettings(updated, false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData, applyToAllMembers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleImageFileChange} 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={settingsFileInputRef} 
          accept="image/*" 
          onChange={handleImageFileChange} 
          className="hidden" 
        />

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isGu ? 'ઓનલાઈન UPI / QR કોડ વ્યવસ્થાપન' : 'UPI Payment QR & Mandal Settings'}
              </h3>
              <p className="text-orange-100 text-xs">
                {isGu ? 'ગમે તેટલી રકમ (₹૧૦૦, ₹૩૦૦ કે એકસાથે મહિના) સ્કેન કરીને ચૂકવી શકાય' : 'Supports Open Amount, ₹100, Multi-Month & Custom QR'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-4 pt-2 gap-1.5 sm:gap-2 flex-shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'qr'
                ? 'bg-white border-t-2 border-orange-600 text-orange-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{isGu ? 'QR કોડ જુઓ / સ્કેન કરો' : 'View / Scan QR'}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'settings'
                ? 'bg-white border-t-2 border-orange-600 text-orange-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isGu ? 'મંડળ સેટિંગ્સ & વિગતો' : 'Mandal Settings'}</span>
          </button>
        </div>

        {/* Tab 1: Live QR Code Display with Amount Selector */}
        {activeTab === 'qr' && (
          <div className="p-4 sm:p-5 text-center space-y-4 max-h-[72vh] overflow-y-auto flex-1">
            
            {/* Amount Selection Toolbar */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isGu ? '🎯 સ્કેન કરતી વખતે કેટલી રકમ રાખવી છે?' : '🎯 Select QR Amount Mode:'}
              </label>

              <div className="flex flex-wrap gap-1.5">
                {/* Open Amount Option */}
                <button
                  type="button"
                  onClick={() => setQrAmountMode('open')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    qrAmountMode === 'open'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  ✨ {isGu ? 'ખુલ્લી રકમ (સભ્ય જાતે ભરે)' : 'Open / Any Amount'}
                </button>

                {/* ₹100 option */}
                <button
                  type="button"
                  onClick={() => setQrAmountMode('100')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    qrAmountMode === '100'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  ₹100 ({isGu ? 'પરચુરણ' : 'Misc'})
                </button>

                {/* 1 Month (₹300) */}
                <button
                  type="button"
                  onClick={() => setQrAmountMode('300')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    qrAmountMode === '300'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  ₹300 ({isGu ? '૧ મહિનો' : '1 Mo'})
                </button>

                {/* 2 Months (₹600) */}
                <button
                  type="button"
                  onClick={() => setQrAmountMode('600')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    qrAmountMode === '600'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  ₹600 ({isGu ? '૨ મહિના' : '2 Mos'})
                </button>

                {/* 3 Months (₹900) */}
                <button
                  type="button"
                  onClick={() => setQrAmountMode('900')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    qrAmountMode === '900'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  ₹900 ({isGu ? '૩ મહિના' : '3 Mos'})
                </button>

                {/* 6 Months (₹1800) */}
                <button
                  type="button"
                  onClick={() => setQrAmountMode('1800')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    qrAmountMode === '1800'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  ₹1,800 ({isGu ? '૬ મહિના' : '6 Mos'})
                </button>

                {/* 12 Months (₹3600) */}
                <button
                  type="button"
                  onClick={() => setQrAmountMode('3600')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    qrAmountMode === '3600'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  ₹3,600 ({isGu ? 'આખું વર્ષ' : 'Full Year'})
                </button>

                {/* Custom Amount option */}
                <button
                  type="button"
                  onClick={() => setQrAmountMode('custom')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    qrAmountMode === 'custom'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  ✏️ {isGu ? 'કસ્ટમ રકમ' : 'Custom'}
                </button>
              </div>

              {/* Custom Amount input field */}
              {qrAmountMode === 'custom' && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    {isGu ? 'રકમ (₹):' : 'Amount (₹):'}
                  </span>
                  <input
                    type="number"
                    value={customQrAmount}
                    onChange={(e) => setCustomQrAmount(e.target.value)}
                    placeholder="100"
                    className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-[11px] text-slate-500">
                    {isGu ? 'સ્કેન કરતી વખતે આ રકમ પ્રિ-ફિલ થશે' : 'Will pre-fill on scan'}
                  </span>
                </div>
              )}
            </div>

            {/* QR Image Box */}
            <div className="bg-gradient-to-b from-orange-50 to-amber-50/40 border-2 border-dashed border-orange-200 p-4 rounded-2xl inline-block shadow-inner mx-auto max-w-[270px]">
              <img 
                src={activeQrImage} 
                alt="Ganesh Mandal UPI QR Code" 
                className="w-52 h-52 mx-auto rounded-xl shadow-sm object-contain bg-white p-2 border border-slate-100"
              />
              <div className="text-xs font-bold text-orange-900 mt-2 flex items-center justify-center gap-1">
                <span>🚩 {formData.mandalName}</span>
              </div>
              <div className="mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 py-0.5 px-2 rounded-full border border-emerald-200 inline-block">
                {displayAmountLabel}
              </div>
            </div>

            {/* Help Note on Scan Behavior */}
            <p className="text-[11px] text-slate-500 leading-tight">
              {qrAmountMode === 'open' 
                ? (isGu ? '💡 સ્કેન કર્યા પછી સભ્ય પોતાની મરજી મુજબ કોઈપણ રકમ (₹૧૦૦, ₹૨૦૦, ₹૩૦૦ કે એકસાથે મહિના) ભરી શકશે.' : '💡 Member can enter any amount (₹100, ₹300, etc.) in their UPI app.')
                : (isGu ? `💡 સ્કેન કરતાં જ Google Pay / PhonePe માં સીધા ${displayAmountLabel} લખાઈને આવશે.` : `💡 Will pre-fill ${displayAmountLabel} in UPI app.`)}
            </p>

            {/* Upload Custom QR Photo Button */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {isCustomImage 
                    ? (isGu ? '🔄 બીજો QR ફોટો અપલોડ કરો' : 'Change QR Image')
                    : (isGu ? '📷 તમારો પોતાનો QR ફોટો અપલોડ કરો' : 'Upload Your QR Image')}
                </span>
              </button>

              {isCustomImage && (
                <button
                  type="button"
                  onClick={handleRemoveCustomQr}
                  title={isGu ? 'ફોટો હટાવી મૂળ ઓટો-જનરેટેડ QR વાપરો' : 'Remove image & use generated QR'}
                  className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-semibold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isGu ? 'ફોટો હટાવો' : 'Reset'}</span>
                </button>
              )}
            </div>

            {/* UPI ID Details */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-semibold text-slate-500">UPI ID:</span>
                <code className="text-sm font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                  {formData.upiId || 'mahadev.mandal@upi'}
                </code>
                <button
                  onClick={handleCopyUpi}
                  className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 text-left">
              <strong>ખજાનચી:</strong> {formData.treasurerName} ({formData.treasurerPhone})
            </div>
          </div>
        )}

        {/* Tab 2: Settings Form */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {/* Custom QR Upload inside Settings too */}
            <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3.5 space-y-2">
              <label className="block text-xs font-bold text-orange-950 uppercase tracking-wider">
                {isGu ? 'તમારો QR કોડ ફોટો (GPay / PhonePe / Paytm સ્કેનર)' : 'Your QR Code Image'}
              </label>
              
              <div className="flex items-center gap-3">
                {formData.customQrImage ? (
                  <img 
                    src={formData.customQrImage} 
                    alt="Custom QR Preview" 
                    className="w-14 h-14 rounded-lg object-contain bg-white border border-orange-200 shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-orange-100 border border-dashed border-orange-300 flex items-center justify-center text-orange-600">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => settingsFileInputRef.current?.click()}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.customQrImage ? (isGu ? 'ફોટો બદલો' : 'Change') : (isGu ? 'ફોટો અપલોડ કરો' : 'Upload Image')}</span>
                    </button>

                    {formData.customQrImage && (
                      <button
                        type="button"
                        onClick={handleRemoveCustomQr}
                        className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg text-xs transition cursor-pointer"
                        title={isGu ? 'ફોટો હટાવો' : 'Remove'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isGu ? 'PhonePe કે Google Pay નો QR સ્ક્રિનશોટ સીધો અપલોડ કરી શકો છો.' : 'Upload screenshot of your official QR code.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mandal Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isGu ? 'મંડળનું નામ' : 'Mandal Name'}
              </label>
              <input
                type="text"
                value={formData.mandalName}
                onChange={(e) => setFormData({ ...formData, mandalName: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Year & Monthly Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'ઉત્સવ વર્ષ' : 'Festival Year'}
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2026-2027"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'સામાન્ય માસિક ફાળો (₹)' : 'Default Monthly Target (₹)'}
                </label>
                <input
                  type="number"
                  value={formData.monthlyAmount}
                  onChange={(e) => setFormData({ ...formData, monthlyAmount: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Apply new monthly amount to all members option */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAllMembers}
                  onChange={(e) => setApplyToAllMembers(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
                />
                <span className="text-xs text-amber-950 font-medium leading-tight">
                  {isGu 
                    ? `જો ફાળો બદલાય તો તમામ સભ્યોનો માસિક ફાળો પણ આપોઆપ ₹${formData.monthlyAmount || 300} કરી દો` 
                    : `Also update all existing members' monthly target to ₹${formData.monthlyAmount || 300}`}
                </span>
              </label>
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isGu ? 'ખજાનચીનો UPI ID *' : 'Treasurer UPI ID *'}
              </label>
              <input
                type="text"
                required
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="e.g. 9876543210@paytm or manthan@okhdfcbank"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Treasurer Name & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'ખજાનચીનું નામ' : 'Treasurer Name'}
                </label>
                <input
                  type="text"
                  value={formData.treasurerName}
                  onChange={(e) => setFormData({ ...formData, treasurerName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isGu ? 'ખજાનચી મોબાઇલ' : 'Treasurer Phone'}
                </label>
                <input
                  type="text"
                  value={formData.treasurerPhone}
                  onChange={(e) => setFormData({ ...formData, treasurerPhone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isGu ? 'મંડળ સૂત્ર (Tagline)' : 'Tagline'}
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
                {isGu ? 'સેટિંગ્સ સાચવો' : 'Save Settings'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
