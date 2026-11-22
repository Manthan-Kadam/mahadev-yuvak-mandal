import { INITIAL_MEMBERS, INITIAL_EXPENSES, INITIAL_SETTINGS, DEFAULT_MONTHS } from '../data/initialData';

const STORAGE_KEYS = {
  MEMBERS: 'ganpati_mandal_members_v1',
  ARCHIVED_MEMBERS: 'ganpati_mandal_archived_members_v1',
  EXPENSES: 'ganpati_mandal_expenses_v1',
  SETTINGS: 'ganpati_mandal_settings_v1',
  MONTHS: 'ganpati_mandal_months_v1',
  LANG: 'ganpati_mandal_lang_v1',
};

export const loadStoredData = () => {
  try {
    const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const storedArchived = localStorage.getItem(STORAGE_KEYS.ARCHIVED_MEMBERS);
    const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const storedMonths = localStorage.getItem(STORAGE_KEYS.MONTHS);
    const storedLang = localStorage.getItem(STORAGE_KEYS.LANG);

    let settings = storedSettings ? JSON.parse(storedSettings) : INITIAL_SETTINGS;
    if (settings) {
      if (settings.mandalName === 'શ્રી સિદ્ધિવિનાયક ગણેશ મહોત્સવ મંડળ' || !settings.mandalName) {
        settings.mandalName = 'શ્રી મહાદેવ યુવક મંડળ';
        settings.mandalNameEn = 'Shree Mahadev Yuvak Mandal';
        settings.tagline = 'હર હર મહાદેવ 🚩 ગણપતિ બાપ્પા મોરિયા!';
      }
      if (settings.monthlyAmount === 500 || !settings.monthlyAmount) {
        settings.monthlyAmount = 300; // Updated to ₹300 as decided
      }
      if (settings.year === '2025-2026' || settings.year === '2025-26' || !settings.year) {
        settings.year = '2026-2027'; // Updated to 2026-2027
      }
      if (settings.autoOpenWhatsAppReceipt === undefined) {
        settings.autoOpenWhatsAppReceipt = true;
      }
      if (!settings.upiId || settings.upiId === 'mahadev.mandal@upi') {
        settings.upiId = 'rajmakwna4512@okaxis';
      }
      if (!settings.treasurerPhone || settings.treasurerPhone === '9876543210') {
        settings.treasurerPhone = '7046641547';
        settings.treasurerName = 'રાજ મકવાણા (ખજાનચી / Treasurer)';
      }
      if (!settings.adminPin) {
        settings.adminPin = '1020';
      }
    }

    let parsedMembers = storedMembers ? JSON.parse(storedMembers) : [];
    if (parsedMembers.length > 0 && (parsedMembers[0]?.id === 'mem_1' || parsedMembers[0]?.name === 'રમેશભાઈ પટેલ')) {
      parsedMembers = [];
    }
    let members = (parsedMembers && parsedMembers.length > 0) ? parsedMembers : INITIAL_MEMBERS;

    return {
      members: members,
      archivedMembers: storedArchived ? JSON.parse(storedArchived) : [],
      expenses: storedExpenses ? JSON.parse(storedExpenses) : INITIAL_EXPENSES,
      settings: settings,
      months: storedMonths ? JSON.parse(storedMonths) : DEFAULT_MONTHS,
      lang: storedLang || 'gu', // 'gu' or 'en'
    };
  } catch (err) {
    console.error('Error loading data from localStorage:', err);
    return {
      members: INITIAL_MEMBERS,
      archivedMembers: [],
      expenses: INITIAL_EXPENSES,
      settings: INITIAL_SETTINGS,
      months: DEFAULT_MONTHS,
      lang: 'gu',
    };
  }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
};

export const exportToJsonFile = (data) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `ganesh_mandal_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportToCsv = (members, months, settings) => {
  let csv = 'Member Name,Phone,Role,Monthly Target,Total Paid,Total Pending,';
  months.forEach(m => {
    csv += `${m.nameEn} (${m.nameGu}),`;
  });
  csv += '\n';

  members.forEach(mem => {
    let paidTotal = 0;
    const target = mem.monthlyTarget || settings.monthlyAmount || 300;
    const expected = target * 12;

    const monthCols = months.map(m => {
      const p = mem.payments?.[m.id];
      if (p && p.paid) {
        paidTotal += (p.amount || target);
        return `PAID (Rs.${p.amount || target} - ${p.mode || 'UPI'})`;
      }
      return 'PENDING';
    });

    const pendingTotal = expected - paidTotal;
    const row = [
      `"${mem.name}"`,
      `"${mem.phone || ''}"`,
      `"${mem.role || ''}"`,
      target,
      paidTotal,
      pendingTotal,
      ...monthCols.map(c => `"${c}"`)
    ];

    csv += row.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ganesh_mandal_fado_report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
