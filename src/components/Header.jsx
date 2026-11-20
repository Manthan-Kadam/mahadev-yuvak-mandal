import React from 'react';
import { 
  Plus, 
  Share2, 
  QrCode, 
  Download, 
  Upload, 
  Printer, 
  FileSpreadsheet, 
  Settings as SettingsIcon,
  Sparkles,
  Users,
  Bell,
  Bot
} from 'lucide-react';

export const Header = ({ 
  settings, 
  lang, 
  setLang, 
  onOpenAddMember, 
  onOpenWhatsAppReport, 
  onOpenAutoReminder,
  onOpenBotModal,
  onOpenUpiSettings,
  onExportBackup,
  onImportBackup,
  onExportCsv
}) => {
  const isGu = lang === 'gu';

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-lg sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Mandal Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-3xl shadow-inner shadow-black/10 flex-shrink-0">
              🚩
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
                  {settings.mandalName}
                </h1>
                <span className="bg-amber-300 text-amber-950 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  {settings.year}
                </span>
              </div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium opacity-90 flex items-center gap-1.5 mt-0.5">
                <span>{settings.tagline}</span>
                <span className="text-orange-300">•</span>
                <span>{isGu ? '૧૨ મહિના ફાળો અને બચત પોર્ટલ' : '12-Month Fund & Savings Portal'}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Language Toggle */}
            <button
              onClick={() => setLang(isGu ? 'en' : 'gu')}
              className="bg-white/10 hover:bg-white/20 active:scale-95 transition px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20 backdrop-blur-sm flex items-center gap-1.5 cursor-pointer"
              title="Change Language"
            >
              <span>🌐</span>
              <span>{isGu ? 'English' : 'ગુજરાતી'}</span>
            </button>

            {/* WhatsApp Group Report */}
            <button
              onClick={onOpenWhatsAppReport}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              title={isGu ? 'વોટ્સએપ ગ્રૂપ રિપોર્ટ' : 'WhatsApp Group Report'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isGu ? 'વોટ્સએપ રિપોર્ટ' : 'WhatsApp Report'}</span>
            </button>

            {/* 1st of Month Reminder Queue */}
            {onOpenAutoReminder && (
              <button
                onClick={onOpenAutoReminder}
                className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer animate-pulse"
                title={isGu ? '૧ તારીખ માસિક રીમાઇન્ડર' : '1st of Month Auto-Reminder'}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isGu ? '૧ તારીખ રીમાઇન્ડર' : '1st Reminder'}</span>
              </button>
            )}

            {/* Auto WhatsApp Bot Control */}
            {onOpenBotModal && (
              <button
                onClick={onOpenBotModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer border border-emerald-400/50"
                title={isGu ? 'ઓટોમેટિક WhatsApp સેન્ડર બોટ' : 'Automatic Background WhatsApp Bot'}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{isGu ? '🤖 ઓટો બોટ' : 'Auto Bot'}</span>
              </button>
            )}

            {/* UPI QR & Details */}
            <button
              onClick={onOpenUpiSettings}
              className="bg-amber-500/80 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              title={isGu ? 'UPI QR અને સેટિંગ્સ' : 'UPI QR & Settings'}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{isGu ? 'UPI / QR' : 'UPI / QR'}</span>
            </button>

            {/* Add Member Button */}
            <button
              onClick={onOpenAddMember}
              className="bg-white text-orange-700 hover:bg-orange-50 active:scale-95 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isGu ? '+ નવો સભ્ય ઉમેરો' : '+ Add Member'}</span>
            </button>

            {/* More Menu / Quick Export */}
            <div className="flex items-center gap-1 bg-black/15 p-1 rounded-lg border border-white/10">
              <button 
                onClick={onExportCsv}
                title={isGu ? 'Excel / CSV ડાઉનલોડ કરો' : 'Export Excel/CSV'}
                className="p-1 hover:bg-white/20 rounded text-orange-100 hover:text-white transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button 
                onClick={handlePrint}
                title={isGu ? 'પ્રિન્ટ કરો' : 'Print Statement'}
                className="p-1 hover:bg-white/20 rounded text-orange-100 hover:text-white transition"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button 
                onClick={onExportBackup}
                title={isGu ? 'બેકઅપ ફાઈલ ડાઉનલોડ (JSON)' : 'Download Backup'}
                className="p-1 hover:bg-white/20 rounded text-orange-100 hover:text-white transition"
              >
                <Download className="w-4 h-4" />
              </button>
              <label 
                title={isGu ? 'બેકઅપ ફાઈલ રિસ્ટોર કરો' : 'Restore Backup'}
                className="p-1 hover:bg-white/20 rounded text-orange-100 hover:text-white transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={onImportBackup} 
                  className="hidden" 
                />
              </label>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
