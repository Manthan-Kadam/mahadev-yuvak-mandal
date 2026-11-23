import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import pino from 'pino';
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health / Keep-Alive Ping endpoint for 24/7 uptime monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date().toISOString() });
});

app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Directories
const AUTH_DIR = path.join(__dirname, 'whatsapp_auth');
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = path.join(DATA_DIR, 'database.json');

// WhatsApp Client State
let sock = null;
let currentQr = null;
let isConnected = false;
let connectedPhone = null;

const logger = pino({ level: 'silent' });

// Initialize Baileys WhatsApp Connection
async function connectToWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    
    let version = [2, 3000, 1015901307];
    try {
      const v = await fetchLatestBaileysVersion();
      if (v?.version) version = v.version;
    } catch (e) {
      console.log('Using default Baileys version');
    }

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger,
      browser: ['Mahadev Yuvak Mandal', 'Chrome', '1.0.0'],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          currentQr = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
          isConnected = false;
          console.log('⚡ New WhatsApp QR generated. Ready to scan on web portal.');
        } catch (qrErr) {
          console.error('Error generating QR DataURL:', qrErr);
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
        isConnected = false;
        currentQr = null;
        connectedPhone = null;
        console.log(`⚠️ WhatsApp connection closed. StatusCode: ${statusCode}, isLoggedOut: ${isLoggedOut}`);

        if (isLoggedOut) {
          console.log('🧹 Clearing stale auth directory to generate a fresh QR code...');
          if (fs.existsSync(AUTH_DIR)) {
            try {
              fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            } catch (e) {
              console.error('Error removing auth dir:', e);
            }
          }
          setTimeout(connectToWhatsApp, 2000);
        } else {
          // Reconnect automatically on normal drop/timeout
          setTimeout(connectToWhatsApp, 3000);
        }
      } else if (connection === 'open') {
        isConnected = true;
        currentQr = null;
        connectedPhone = sock.user?.id ? sock.user.id.split(':')[0] : 'Connected';
        console.log(`✅ WhatsApp Bot Connected successfully as: ${connectedPhone}`);
      }
    });

  } catch (err) {
    console.error('Error connecting to WhatsApp:', err);
    setTimeout(connectToWhatsApp, 5000);
  }
}

// Start connection
connectToWhatsApp();

// Helper to format 10-digit Indian numbers to WhatsApp JID (e.g. 919876543210@s.whatsapp.net)
function formatJid(phone) {
  if (!phone) return null;
  const clean = phone.replace(/[^0-9]/g, '');
  const withCountryCode = clean.length === 10 ? `91${clean}` : clean;
  return `${withCountryCode}@s.whatsapp.net`;
}

// Helper to wait milliseconds
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Smart Gender / Salutation Detection (ભાઈ / બહેન)
function isFemaleMember(name = '', gender = 'auto') {
  if (gender === 'female' || gender === 'ben') return true;
  if (gender === 'male' || gender === 'bhai') return false;

  const cleanName = (name || '').trim().toLowerCase();

  // 1. Explicit Gujarati female indicators
  if (/બેન|બહેન|બાઈ|શ્રીમતી|સુશ્રી|કુમારી/.test(cleanName)) return true;

  // 2. English female indicators
  if (/(ben|bahen|behn|bai|devi)\b/i.test(cleanName) || cleanName.endsWith('ben') || cleanName.endsWith('bahen')) {
    return true;
  }
  if (/\b(mrs|ms|miss|smt)\b/i.test(cleanName)) return true;

  // 3. Known common Gujarati female names
  const femaleKeywords = [
    'ગીતા', 'સીતા', 'નીતા', 'મીના', 'હીના', 'ટીના', 'રીટા', 'પૂજા', 'પ્રિયા', 'રેખા', 
    'દક્ષા', 'ભાવના', 'હંસા', 'ચેતના', 'વંદના', 'જિજ્ઞાસા', 'અલ્પા', 'નેહા', 'દિવ્યા', 
    'પારુલ', 'સોનલ', 'શીતલ', 'કોકિલા', 'જશોદા', 'શાંતા', 'જયા', 'તારા', 'રમા', 'ઉમા', 
    'આશા', 'ઉષા', 'અનિતા', 'સુનીતા', 'કવિતા', 'સંગીતા', 'કલ્પના', 'જ્યોતિ', 'સ્વાતિ', 
    'શ્રદ્ધા', 'વૈશાલી', 'શ્વેતા', 'રાધિકા', 'પલ્લવી', 'રૂપલ', 'માનસી', 'દિપ્તી', 'દીપ્તિ', 
    'ભારતી', 'જાગૃતિ', 'સ્મિતા', 'લીલા', 'કાન્તા', 'મંજુલા', 'સરલા', 'સુધા', 'સુલોચના', 
    'શારદા', 'દમયંતી', 'ભાનુ', 'ચંપા', 'કંકુ', 'કિંજલ', 'મિત્તલ', 'હેતલ', 'કાજલ', 'પાયલ', 
    'સેજલ', 'જલ્પા', 'અલ્કા', 'પ્રીતિ', 'રિદ્ધિ', 'સિદ્ધિ', 'ખુશ્બુ', 'દ્રષ્ટિ', 'નિશા', 
    'તન્વી', 'કોમલ', 'ઉર્વી', 'પિંકી', 'ભૂમિકા', 'ડિમ્પલ', 'અમી', 'અંકિતા', 'દર્શના', 
    'ધ્રુવી', 'ઇલા', 'ઈલા', 'જાનકી', 'કાવ્યા', 'મધુ', 'મનીષા', 'નયના', 'પૂર્વી', 'પુષ્પા', 
    'રાધા', 'રૂપા', 'સપના', 'સેતુ', 'શિલ્પા', 'સુમન', 'વર્ષા', 'યામિની', 'તૃષ્ણા', 'ખુશી', 
    'દિયા', 'રિયા', 'અંજલિ', 'પ્રાચી', 'દિશા', 'કૃપા', 'શ્રુતિ', 'તેજલ', 'તૃપ્તિ', 'ફાલ્ગુની'
  ];

  for (const word of femaleKeywords) {
    if (cleanName.includes(word)) return true;
  }

  const englishFemaleWords = [
    'geeta', 'gita', 'neeta', 'nita', 'pooja', 'puja', 'priya', 'rekha', 'bhavna', 'bhavana',
    'hansa', 'chetna', 'chetana', 'vandana', 'jignasa', 'alpa', 'neha', 'divya', 'parul',
    'sonal', 'sheetal', 'shital', 'kokila', 'jashoda', 'shanta', 'jaya', 'tara', 'rama',
    'uma', 'asha', 'usha', 'anita', 'sunita', 'kavita', 'sangeeta', 'sangita', 'kalpana',
    'jyoti', 'swati', 'shraddha', 'vaishali', 'shweta', 'radhika', 'pallavi', 'rupal',
    'mansi', 'deepti', 'dipti', 'bharti', 'jagruti', 'smita', 'leela', 'lila', 'kanta',
    'manjula', 'sarla', 'sudha', 'sulochana', 'sharda', 'damyanti', 'bhanu', 'champa',
    'kinjal', 'mittal', 'hetal', 'kajal', 'payal', 'sejal', 'jalpa', 'alka', 'priti',
    'preeti', 'riddhi', 'siddhi', 'khushbu', 'khushboo', 'drashti', 'drasti', 'nisha',
    'tanvi', 'komal', 'urvi', 'pinky', 'pinki', 'bhumika', 'dimple', 'ami', 'ankita',
    'darshana', 'dhruvi', 'ila', 'janaki', 'janki', 'kavya', 'madhu', 'manisha', 'nayana',
    'purvi', 'pushpa', 'radha', 'rupa', 'sapna', 'shilpa', 'suman', 'varsha', 'yamini',
    'trushna', 'khushi', 'diya', 'riya', 'anjali', 'prachi', 'disha', 'krupa', 'shruti',
    'tejal', 'trupti', 'falguni'
  ];

  for (const word of englishFemaleWords) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(cleanName) || cleanName.includes(word)) return true;
  }

  return false;
}

// Helper: Formats respectful greeting line based on gender and name
function getMemberGreeting(member) {
  const name = (member?.name || '').trim();
  const isFemale = isFemaleMember(name, member?.gender);

  if (isFemale) {
    const alreadyHasBen = /બેન|બહેન|બાઈ/i.test(name) || /(ben|bahen|behn|bai)\b/i.test(name) || name.toLowerCase().endsWith('ben');
    return {
      isFemale: true,
      title: 'બહેન',
      displayName: alreadyHasBen ? name : `${name} બહેન`,
      reminderLine: alreadyHasBen ? `નમસ્તે *${name}*,` : `નમસ્તે *${name}* બહેન,`,
      receiptLine: alreadyHasBen ? `માનનીય બહેન: *${name}*,` : `માનનીય બહેન: *${name}* બહેન,`
    };
  } else {
    const alreadyHasBhai = /ભાઈ/i.test(name) || /bhai\b/i.test(name) || name.toLowerCase().endsWith('bhai');
    return {
      isFemale: false,
      title: 'ભાઈ',
      displayName: alreadyHasBhai ? name : `${name} ભાઈ`,
      reminderLine: alreadyHasBhai ? `નમસ્તે *${name}*,` : `નમસ્તે *${name}* ભાઈ,`,
      receiptLine: alreadyHasBhai ? `માનનીય શ્રી: *${name}*,` : `માનનીય શ્રી: *${name}* ભાઈ,`
    };
  }
}

// ================= API ENDPOINTS ================= //

// 1. Check Bot Status & Get QR Code
app.get('/api/bot/status', (req, res) => {
  res.json({
    connected: isConnected,
    phone: connectedPhone,
    qr: currentQr
  });
});

// 2. Disconnect / Logout Bot
app.post('/api/bot/logout', async (req, res) => {
  try {
    if (sock) {
      try { await sock.logout(); } catch (e) {}
    }
    isConnected = false;
    currentQr = null;
    connectedPhone = null;
    // Clear auth folder
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }
    setTimeout(connectToWhatsApp, 2000);
    res.json({ success: true, message: 'Bot logged out' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2b. Force Refresh / Regenerate WhatsApp QR Code
app.post('/api/bot/refresh-qr', async (req, res) => {
  try {
    if (sock) {
      try { sock.end(); } catch (e) {}
    }
    isConnected = false;
    currentQr = null;
    connectedPhone = null;
    if (fs.existsSync(AUTH_DIR)) {
      try {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      } catch (e) {}
    }
    setTimeout(connectToWhatsApp, 1000);
    res.json({ success: true, message: 'QR regeneration requested' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Send Single WhatsApp Message
app.post('/api/bot/send-message', async (req, res) => {
  const { phone, message } = req.body;
  if (!isConnected || !sock) {
    return res.status(503).json({ error: 'WhatsApp bot is not connected' });
  }

  const jid = formatJid(phone);
  if (!jid) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  try {
    await sock.sendMessage(jid, { text: message });
    res.json({ success: true, phone });
  } catch (err) {
    console.error(`Failed to send to ${phone}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Send Reminders to Multiple Pending Members (Automated Batch Dispatch)
app.post('/api/bot/send-reminders', async (req, res) => {
  const { members, monthObj, settings } = req.body;

  if (!isConnected || !sock) {
    return res.status(503).json({ error: 'WhatsApp bot is not connected' });
  }

  if (!Array.isArray(members) || members.length === 0) {
    return res.json({ success: true, sentCount: 0, results: [] });
  }

  console.log(`🚀 Starting automated background dispatch to ${members.length} members for ${monthObj.nameGu}...`);

  const results = [];
  let sentCount = 0;

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    if (!member.phone) {
      results.push({ name: member.name, phone: '', status: 'skipped_no_phone' });
      continue;
    }

    const jid = formatJid(member.phone);
    const pendingAmount = member.monthlyTarget || settings.monthlyAmount || 300;
    const greeting = getMemberGreeting(member);

    const reminderText = 
`🚩 *${settings.mandalName || 'શ્રી મહાદેવ યુવક મંડળ'}* 🚩

${greeting.reminderLine}
જય શ્રી ગણેશ! હર હર મહાદેવ! 🙏

આજે મહિનાની ૧ તારીખ થઈ ગઈ છે. આપણા ગણેશ ચતુર્થી મહોત્સવ ${settings.year || '2026-27'} ના આયોજન માટે આપનો *${monthObj.nameGu} (${monthObj.nameEn})* મહિનાનો ફાળો જમા કરાવવાનો સમય થઈ ગયો છે.

💰 *આ મહિનાનો બાકી ફાળો:* ₹${pendingAmount}

💳 *ઓનલાઈન પેમેન્ટ માટે UPI:*
UPI ID: \`${settings.upiId || 'mahadev.mandal@upi'}\`
(Google Pay / PhonePe / Paytm / BHIM)

ખજાનચી: ${settings.treasurerName || 'ખજાનચી'} (${settings.treasurerPhone || ''})

કૃપા કરીને સમયસર જમા કરાવી સહકાર આપવા વિનંતી. રકમ જમા કર્યા પછી સ્ક્રીનશોટ મોકલી આપશો.
_હર હર મહાદેવ 🚩 ગણપતિ બાપ્પા મોરિયા!_ 🌺`;

    try {
      await sock.sendMessage(jid, { text: reminderText });
      sentCount++;
      results.push({ name: member.name, phone: member.phone, status: 'sent' });
      console.log(`✅ [${i + 1}/${members.length}] Sent automated reminder to ${member.name} (${member.phone})`);
      
      // Delay between 1.5 to 3 seconds to ensure safe natural delivery
      if (i < members.length - 1) {
        await delay(2000);
      }
    } catch (err) {
      console.error(`❌ Failed to send to ${member.name}:`, err.message);
      results.push({ name: member.name, phone: member.phone, status: 'failed', error: err.message });
    }
  }

  res.json({
    success: true,
    sentCount,
    totalCount: members.length,
    results
  });
});

// 5. Send Payment Confirmation Receipt Automatically
app.post('/api/bot/send-receipt', async (req, res) => {
  const { member, monthObj, payment, settings } = req.body;

  if (!isConnected || !sock || !member.phone) {
    return res.status(200).json({ success: false, reason: 'Bot not connected or no phone' });
  }

  const jid = formatJid(member.phone);
  const greeting = getMemberGreeting(member);

  const receiptText = 
`🧾 *જમા પહોંચ (Receipt) - શ્રી મહાદેવ યુવક મંડળ* 🚩
------------------------------------
${greeting.receiptLine}
જય શ્રી ગણેશ! હર હર મહાદેવ! 🙏

આપનો ગણેશ ચતુર્થી મહોત્સવ ${settings.year || '2026-27'} માટે *${monthObj.nameGu} (${monthObj.nameEn})* મહિનાનો ફાળો સફળતાપૂર્વક જમા આવી ગયો છે! ✅

💰 *જમા થયેલ રકમ:* ₹${payment.amount}
📅 *તારીખ:* ${payment.date || new Date().toISOString().split('T')[0]}
💳 *પેમેન્ટ મોડ:* ${payment.mode || 'UPI'}
🔢 *પાવતી નં:* #${payment.ref || 'REC-' + Math.floor(1000 + Math.random() * 9000)}
------------------------------------
મહાદેવ યુવક મંડળ આપનો ખૂબ ખૂબ આભાર માને છે. આપનો ફાળો ખાતામાં નોંધાઈ ગયેલ છે.
_હર હર મહાદેવ 🚩 ગણપતિ બાપ્પા મોરિયા!_ 🌺`;

  try {
    await sock.sendMessage(jid, { text: receiptText });
    console.log(`🧾 Sent automated payment receipt to ${member.name} (${member.phone})`);
    res.json({ success: true });
  } catch (err) {
    console.error(`Failed to send receipt to ${member.name}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// 5b. Send Multi-Month Consolidated Receipt Automatically
app.post('/api/bot/send-multi-receipt', async (req, res) => {
  const { member, selectedMonthObjs = [], totalAmount, payment, settings } = req.body;

  if (!isConnected || !sock || !member.phone) {
    return res.status(200).json({ success: false, reason: 'Bot not connected or no phone' });
  }

  const jid = formatJid(member.phone);
  const greeting = getMemberGreeting(member);
  const monthsText = selectedMonthObjs.map(m => m.nameGu).join(', ');

  const text =
`🧾 *ડિજિટલ પાવતી - એકસાથે ફાળો જમા* 🚩
*${settings.mandalName || 'શ્રી મહાદેવ યુવક મંડળ'}*
------------------------------------
${greeting.receiptLine}
જય શ્રી ગણેશ! હર હર મહાદેવ! 🙏

આપનો ગણેશ ચતુર્થી મહોત્સવ ${settings.year || ''} માટે એકસાથે *${selectedMonthObjs.length} મહિનાનો* ફાળો સફળતાપૂર્વક જમા થઈ ગયેલ છે.

📅 *જમા કરેલ મહિનાઓ:*
${monthsText}

💰 *કુલ જમા રકમ:* ₹${totalAmount}
📅 *તારીખ:* ${payment.date || new Date().toISOString().split('T')[0]}
💳 *પેમેન્ટ મોડ:* ${payment.mode || 'UPI'}
🔢 *પાવતી / રસીદ નં:* #${payment.ref || 'REC-' + Math.floor(1000 + Math.random() * 9000)}
------------------------------------
મહાદેવ યુવક મંડળ આપનો ખૂબ ખૂબ આભાર માને છે.
_હર હર મહાદેવ 🚩 ગણપતિ બાપ્પા મોરિયા!_ 🌺`;

  try {
    await sock.sendMessage(jid, { text });
    console.log(`🧾 Sent automated multi-month receipt to ${member.name} (${member.phone})`);
    res.json({ success: true });
  } catch (err) {
    console.error(`Failed to send multi-month receipt to ${member.name}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Portal Database for all clients/devices
app.get('/api/data', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (!data.archivedMembers) data.archivedMembers = [];
      return res.json(data);
    }
    res.json({ members: [], archivedMembers: [], settings: {}, months: [], expenses: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Public Self-Registration endpoint (Anyone can join as member)
app.post('/api/members/join', async (req, res) => {
  try {
    const { name, phone, gender = 'auto', monthlyTarget = 300 } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'કૃપા કરીને પૂરું નામ લખો.' });
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'કૃપા કરીને ૧૦ અંકનો સાચો મોબાઇલ નંબર લખો.' });
    }

    let data = { members: [], settings: {}, months: [], expenses: [] };
    if (fs.existsSync(DB_FILE)) {
      data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }

    // Check if phone already registered
    if (cleanPhone) {
      const exists = data.members.find(m => m.phone && m.phone.replace(/\D/g, '') === cleanPhone);
      if (exists) {
        return res.status(400).json({ error: `આ મોબાઇલ નંબર (${cleanPhone}) પહેલેથી જ સભ્ય '${exists.name}' ના નામે નોંધાયેલ છે!` });
      }
    }

    const newMember = {
      id: `mem_${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone,
      role: 'સભ્ય (Member)',
      gender: gender,
      monthlyTarget: Number(monthlyTarget) || 300,
      joinedDate: new Date().toISOString().split('T')[0],
      payments: {}
    };

    data.members.push(newMember);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✨ New member self-registered: ${newMember.name} (${newMember.phone || 'No phone'})`);

    // If WhatsApp Bot is active, send an automated welcome message!
    if (isConnected && sock && cleanPhone) {
      try {
        const jid = formatJid(cleanPhone);
        const greeting = getMemberGreeting(newMember);
        const welcomeText = 
`🚩 *${data.settings?.mandalName || 'શ્રી મહાદેવ યુવક મંડળ'}* 🚩
ગણેશ મહોત્સવ ${data.settings?.year || '૨૦૨૬-૨૦૨૭'}

નમસ્તે ${newMember.name} ${greeting}! 🙏

તમે શ્રી મહાદેવ યુવક મંડળમાં સભ્ય તરીકે સફળતાપૂર્વક જોડાઈ ગયા છો. 
તમારો માસિક ફાળો લક્ષ્યાંક ₹${newMember.monthlyTarget} નોંધાયેલ છે.

હર હર મહાદેવ 🚩 ગણપતિ બાપ્પા મોરિયા! 🌺`;

        await sock.sendMessage(jid, { text: welcomeText });
        console.log(`📲 Sent automated welcome WhatsApp to ${newMember.name}`);
      } catch (waErr) {
        console.error('Welcome WhatsApp send error:', waErr.message);
      }
    }

    res.json({ success: true, member: newMember, allMembers: data.members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Delete Member endpoint (Smart Archive: preserves if funds > 0, discards if 0)
app.delete('/api/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!fs.existsSync(DB_FILE)) {
      return res.status(404).json({ error: 'Database file not found' });
    }
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!data.archivedMembers) data.archivedMembers = [];

    const memberIndex = (data.members || []).findIndex(m => m.id === id);
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const member = data.members[memberIndex];
    let totalPaid = 0;
    if (member.payments) {
      Object.values(member.payments).forEach(p => {
        if (p && p.paid) {
          const amt = Number(p.amount) || member.monthlyTarget || 300;
          if (amt > 0) totalPaid += amt;
        }
      });
    }

    let archived = false;
    if (totalPaid > 0) {
      const archivedRecord = {
        ...member,
        archivedAt: new Date().toISOString(),
        totalPaidAtArchive: totalPaid
      };
      data.archivedMembers = [archivedRecord, ...data.archivedMembers.filter(a => a.id !== id)];
      archived = true;
    }

    data.members.splice(memberIndex, 1);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');

    res.json({
      success: true,
      archived,
      totalPaid,
      members: data.members,
      archivedMembers: data.archivedMembers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Sync Portal Database from frontend
app.post('/api/sync-data', (req, res) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= 1st OF THE MONTH CRON SCHEDULER ================= //
// Runs on the 1st day of every month at 09:00 AM ('0 9 1 * *')
cron.schedule('0 9 1 * *', async () => {
  console.log('⏰ [CRON TRIGGER] 1st of the month reached! Executing automated reminders...');

  if (!fs.existsSync(DB_FILE)) {
    console.log('No database file found to read members.');
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    const { members = [], months = [], settings = {}, activeMonth = 'm2' } = data;

    if (!isConnected || !sock) {
      console.log('⚠️ WhatsApp bot is offline during 1st of month cron trigger.');
      return;
    }

    const currentMonthObj = months.find(m => m.id === activeMonth) || months[0];
    const pendingMembers = members.filter(m => !m.payments?.[currentMonthObj.id]?.paid);

    console.log(`⏰ Found ${pendingMembers.length} pending members for ${currentMonthObj.nameGu}. Dispatched automatically!`);

    for (const member of pendingMembers) {
      if (!member.phone) continue;
      const jid = formatJid(member.phone);
      const pendingAmount = member.monthlyTarget || settings.monthlyAmount || 300;
      const greeting = getMemberGreeting(member);

      const reminderText = 
`🚩 *${settings.mandalName || 'શ્રી મહાદેવ યુવક મંડળ'}* 🚩

${greeting.reminderLine}
જય શ્રી ગણેશ! હર હર મહાદેવ! 🙏

આજે ૧ તારીખ થઈ ગઈ છે. આપણા ગણેશ ચતુર્થી મહોત્સવ ${settings.year || '2026-27'} ના આયોજન માટે આપનો *${currentMonthObj.nameGu}* મહિનાનો ફાળો જમા કરાવવાનો સમય થઈ ગયો છે.

💰 *આ મહિનાનો બાકી ફાળો:* ₹${pendingAmount}

💳 *ઓનલાઈન પેમેન્ટ માટે UPI:*
UPI ID: \`${settings.upiId || 'mahadev.mandal@upi'}\`

ખજાનચી: ${settings.treasurerName || 'ખજાનચી'} (${settings.treasurerPhone || ''})

કૃપા કરીને સમયસર જમા કરાવી સહકાર આપવા વિનંતી.
_હર હર મહાદેવ 🚩 ગણપતિ બાપ્પા મોરિયા!_ 🌺`;

      try {
        await sock.sendMessage(jid, { text: reminderText });
        console.log(`[Auto-Cron] Sent reminder to ${member.name}`);
        await delay(2500);
      } catch (err) {
        console.error(`[Auto-Cron] Error sending to ${member.name}:`, err.message);
      }
    }
  } catch (e) {
    console.error('Error in 1st of month cron:', e);
  }
});

const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Mahadev Yuvak Mandal WhatsApp Bot Server running on http://localhost:${PORT}`);
});
