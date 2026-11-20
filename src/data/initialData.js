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
  treasurerName: 'મંથનભાઈ (ખજાનચી / Treasurer)',
  treasurerPhone: '9876543210',
  upiId: 'mahadev.mandal@upi',
  upiQrNote: 'Mahadev Yuvak Mandal Ganesh Fund',
  tagline: 'હર હર મહાદેવ 🚩 ગણપતિ બાપ્પા મોરિયા!',
  autoOpenWhatsAppReceipt: true, // Automatically launch WhatsApp with digital receipt on payment
  customQrImage: null // User's own uploaded QR code image (Base64)
};

// No inbuilt members - clean slate for user's actual group members
export const INITIAL_MEMBERS = [];

export const INITIAL_EXPENSES = [];
