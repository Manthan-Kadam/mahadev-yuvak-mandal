// 12 Months standard cycle for Ganesh Chaturthi
// Starting after the previous year's festival (October) till the next festival (September)
export const DEFAULT_MONTHS = [
  { id: 'm1', nameEn: 'October', nameGu: 'ઓક્ટોબર', short: 'Oct' },
  { id: 'm2', nameEn: 'November', nameGu: 'નવેમ્બર', short: 'Nov' },
  { id: 'm3', nameEn: 'December', nameGu: 'ડિસેમ્બર', short: 'Dec' },
  { id: 'm4', nameEn: 'January', nameGu: 'જાન્યુઆરી', short: 'Jan' },
  { id: 'm5', nameEn: 'February', nameGu: 'ફેબ્રુઆરી', short: 'Feb' },
  { id: 'm6', nameEn: 'March', nameGu: 'માર્ચ', short: 'Mar' },
  { id: 'm7', nameEn: 'April', nameGu: 'એપ્રિલ', short: 'Apr' },
  { id: 'm8', nameEn: 'May', nameGu: 'મે', short: 'May' },
  { id: 'm9', nameEn: 'June', nameGu: 'જૂન', short: 'Jun' },
  { id: 'm10', nameEn: 'July', nameGu: 'જુલાઈ', short: 'Jul' },
  { id: 'm11', nameEn: 'August', nameGu: 'ઓગસ્ટ', short: 'Aug' },
  { id: 'm12', nameEn: 'September', nameGu: 'સપ્ટેમ્બર', short: 'Sep' },
];

export const INITIAL_SETTINGS = {
  mandalName: 'શ્રી મહાદેવ યુવક મંડળ',
  mandalNameEn: 'Shree Mahadev Yuvak Mandal',
  year: '2026-2027',
  monthlyAmount: 300, // Decided monthly amount: ₹300 (Can be changed anytime)
  treasurerName: 'રાજ મકવાણા (ખજાનચી / Treasurer)',
  treasurerPhone: '7046641547',
  upiId: 'rajmakwna4512@okaxis',
  upiQrNote: 'Mahadev Yuvak Mandal Ganesh Fund',
  tagline: 'હર હર મહાદેવ 🚩 ગણપતિ બાપ્પા મોરિયા!',
  autoOpenWhatsAppReceipt: true, // Automatically launch WhatsApp with digital receipt on payment
  customQrImage: null, // User's own uploaded QR code image (Base64)
  adminPin: '1020' // Secret PIN for Manthan Kadam (Admin) to protect QR & settings from being changed by others
};

export const INITIAL_MEMBERS = [
  {
    id: 'm_101',
    name: 'મંથન કદમ',
    phone: '9016991020',
    role: 'મુખ્ય આયોજક (Organiser)',
    gender: 'male',
    monthlyTarget: 300,
    joinedDate: '2026-10-01',
    payments: {
      m1: { paid: true, amount: 300, date: '2026-10-05', method: 'UPI' },
      m2: { paid: true, amount: 300, date: '2026-11-02', method: 'UPI' }
    }
  },
  {
    id: 'm_102',
    name: 'રાજ મકવાણા',
    phone: '7046641547',
    role: 'ખજાનચી (Treasurer)',
    gender: 'male',
    monthlyTarget: 300,
    joinedDate: '2026-10-01',
    payments: {
      m1: { paid: true, amount: 300, date: '2026-10-05', method: 'UPI' },
      m2: { paid: true, amount: 300, date: '2026-11-04', method: 'રોકડ (Cash)' }
    }
  },
  {
    id: 'm_103',
    name: 'હિતેશભાઈ પરમાર',
    phone: '9825100001',
    role: 'સભ્ય (Member)',
    gender: 'male',
    monthlyTarget: 300,
    joinedDate: '2026-10-01',
    payments: {
      m1: { paid: true, amount: 300, date: '2026-10-06', method: 'UPI' },
      m2: { paid: true, amount: 300, date: '2026-11-05', method: 'UPI' }
    }
  },
  {
    id: 'm_104',
    name: 'ભાવેશભાઈ ચૌહાણ',
    phone: '9825100002',
    role: 'સભ્ય (Member)',
    gender: 'male',
    monthlyTarget: 300,
    joinedDate: '2026-10-01',
    payments: {
      m1: { paid: true, amount: 300, date: '2026-10-08', method: 'રોકડ (Cash)' },
      m2: { paid: false }
    }
  },
  {
    id: 'm_105',
    name: 'પૂજાબેન સોલંકી',
    phone: '9825100003',
    role: 'સભ્ય (Member)',
    gender: 'female',
    monthlyTarget: 300,
    joinedDate: '2026-10-01',
    payments: {
      m1: { paid: true, amount: 300, date: '2026-10-07', method: 'UPI' },
      m2: { paid: true, amount: 300, date: '2026-11-06', method: 'UPI' }
    }
  },
  {
    id: 'm_106',
    name: 'અલ્પેશભાઈ વાઘેલા',
    phone: '9825100004',
    role: 'સભ્ય (Member)',
    gender: 'male',
    monthlyTarget: 300,
    joinedDate: '2026-10-01',
    payments: {
      m1: { paid: true, amount: 300, date: '2026-10-09', method: 'UPI' },
      m2: { paid: false }
    }
  },
  {
    id: 'm_107',
    name: 'સંજયભાઈ રાઠોડ',
    phone: '9825100005',
    role: 'સભ્ય (Member)',
    gender: 'male',
    monthlyTarget: 300,
    joinedDate: '2026-10-01',
    payments: {
      m1: { paid: true, amount: 300, date: '2026-10-10', method: 'રોકડ (Cash)' },
      m2: { paid: true, amount: 300, date: '2026-11-08', method: 'UPI' }
    }
  }
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp_1',
    title: 'ગણેશજી મૂર્તિ એડવાન્સ બુકિંગ',
    amount: 1500,
    category: 'મૂર્તિ (Idol)',
    date: '2026-10-15',
    paidBy: 'રાજ મકવાણા (ખજાનચી)'
  },
  {
    id: 'exp_2',
    title: 'સાઉન્ડ સિસ્ટમ એડવાન્સ',
    amount: 1000,
    category: 'સાઉન્ડ / લાઈટ',
    date: '2026-11-05',
    paidBy: 'મંથન કદમ'
  }
];
