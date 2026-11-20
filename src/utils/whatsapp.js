/**
 * WhatsApp message generation & URL utilities for Ganesh Mandal Automation
 * Includes smart gender/salutation detection (ભાઈ / બહેન) for respectful greetings.
 */

/**
 * Detects whether a member is female based on explicit gender or name patterns
 */
export const isFemaleMember = (name = '', gender = 'auto') => {
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

  // 3. Known common Gujarati / Indian female first names or word stems
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
};

/**
 * Returns respectful greetings and display titles for a member
 */
export const getMemberGreeting = (member) => {
  const name = (member?.name || '').trim();
  const isFemale = isFemaleMember(name, member?.gender);

  if (isFemale) {
    const alreadyHasBen = /બેન|બહેન|બાઈ/i.test(name) || /(ben|bahen|behn|bai)\b/i.test(name) || name.toLowerCase().endsWith('ben');
    return {
      isFemale: true,
      title: 'બહેન',
      salutationLabel: 'બહેન (મહિલા)',
      displayName: alreadyHasBen ? name : `${name} બહેન`,
      reminderLine: alreadyHasBen ? `નમસ્તે *${name}*,` : `નમસ્તે *${name}* બહેન,`,
      receiptLine: alreadyHasBen ? `માનનીય બહેન: *${name}*,` : `માનનીય બહેન: *${name}* બહેન,`
    };
  } else {
    const alreadyHasBhai = /ભાઈ/i.test(name) || /bhai\b/i.test(name) || name.toLowerCase().endsWith('bhai');
    return {
      isFemale: false,
      title: 'ભાઈ',
      salutationLabel: 'ભાઈ (પુરુષ)',
      displayName: alreadyHasBhai ? name : `${name} ભાઈ`,
      reminderLine: alreadyHasBhai ? `નમસ્તે *${name}*,` : `નમસ્તે *${name}* ભાઈ,`,
      receiptLine: alreadyHasBhai ? `માનનીય શ્રી: *${name}*,` : `માનનીય શ્રી: *${name}* ભાઈ,`
    };
  }
};

export const createPersonalReminderUrl = (member, monthObj, pendingAmount, settings) => {
  const phone = member.phone ? member.phone.replace(/[^0-9]/g, '') : '';
  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
  const greeting = getMemberGreeting(member);

  const text = 
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

  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
};

export const createMultiMonthReceiptUrl = (member, selectedMonthObjs, totalAmount, payment, settings) => {
  const phone = member.phone ? member.phone.replace(/[^0-9]/g, '') : '';
  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
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

  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
};

export const createPaymentReceiptUrl = (member, monthObj, payment, settings) => {
  const phone = member.phone ? member.phone.replace(/[^0-9]/g, '') : '';
  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
  const greeting = getMemberGreeting(member);

  const text =
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

  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
};

export const generateGroupSummaryMessage = (members, activeMonthObj, settings) => {
  const monthId = activeMonthObj.id;
  
  let paidMembers = [];
  let pendingMembers = [];
  let totalCollected = 0;
  let totalTarget = 0;

  members.forEach(member => {
    const payment = member.payments?.[monthId];
    const target = member.monthlyTarget || settings.monthlyAmount || 300;
    totalTarget += target;

    if (payment && payment.paid) {
      paidMembers.push({ name: member.name, amount: payment.amount || target, mode: payment.mode || 'UPI' });
      totalCollected += (payment.amount || target);
    } else {
      pendingMembers.push({ name: member.name, amount: target });
    }
  });

  const pendingAmount = totalTarget - totalCollected;
  const percentage = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  let msg = `🚩 *${settings.mandalName || 'શ્રી ગણેશ મહોત્સવ મંડળ'}* 🚩\n`;
  msg += `📅 *માસિક ફાળો રિપોર્ટ: ${activeMonthObj.nameGu} (${activeMonthObj.nameEn} ${settings.year || ''})*\n`;
  msg += `------------------------------------\n`;
  msg += `🎯 કુલ લક્ષ્યાંક: *₹${totalTarget.toLocaleString('en-IN')}*\n`;
  msg += `✅ જમા થયેલ: *₹${totalCollected.toLocaleString('en-IN')}* (${percentage}% પૂર્ણ)\n`;
  msg += `⏳ બાકી રકમ: *₹${pendingAmount.toLocaleString('en-IN')}*\n`;
  msg += `------------------------------------\n\n`;

  msg += `🟢 *જમા કરાવેલ સભ્યો (${paidMembers.length}/${members.length}):*\n`;
  if (paidMembers.length === 0) {
    msg += `(હજુ કોઈ જમા થયેલ નથી)\n`;
  } else {
    paidMembers.forEach((m, idx) => {
      msg += `${idx + 1}. ${m.name} - ₹${m.amount} [${m.mode}]\n`;
    });
  }

  msg += `\n🔴 *બાકી સભ્યો (${pendingMembers.length}):*\n`;
  if (pendingMembers.length === 0) {
    msg += `🎉 બધા સભ્યોનો ફાળો જમા થઈ ગયો છે! ધન્યવાદ! 🙏\n`;
  } else {
    pendingMembers.forEach((m, idx) => {
      msg += `${idx + 1}. ${m.name} - બાકી: ₹${m.amount}\n`;
    });
  }

  msg += `\n💳 *ઓનલાઈન પેમેન્ટ માટે UPI:* \`${settings.upiId || 'ganesh.mandal@upi'}\`\n`;
  msg += `ખજાનચી: ${settings.treasurerName || 'ખજાનચી'} (${settings.treasurerPhone || ''})\n\n`;
  msg += `_ગણપતિ બાપ્પા મોરિયા! મંગલ મૂર્તિ મોરિયા!_ 🌺`;

  return msg;
};

export const generateAnnualAuditReport = (members, months, expenses, settings) => {
  let totalFundCollected = 0;
  let totalFundExpected = 0;

  members.forEach(member => {
    months.forEach(m => {
      totalFundExpected += (member.monthlyTarget || settings.monthlyAmount || 300);
      const p = member.payments?.[m.id];
      if (p && p.paid) {
        totalFundCollected += (p.amount || 0);
      }
    });
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remainingCash = totalFundCollected - totalExpenseAmount;

  let msg = `🚩 *${settings.mandalName}* 🚩\n`;
  msg += `📊 *વાર્ષિક હિસાબ-કિતાબ (Annual Statement ${settings.year})*\n`;
  msg += `------------------------------------\n`;
  msg += `👥 કુલ સભ્યો: ${members.length}\n`;
  msg += `💰 વાર્ષિક અપેક્ષિત ફાળો: ₹${totalFundExpected.toLocaleString('en-IN')}\n`;
  msg += `📥 કુલ જમા ફાળો: ₹${totalFundCollected.toLocaleString('en-IN')}\n`;
  msg += `📤 અત્યાર સુધી થયેલ ખર્ચ: ₹${totalExpenseAmount.toLocaleString('en-IN')}\n`;
  msg += `💵 શિલક / બેંક બેલેન્સ: *₹${remainingCash.toLocaleString('en-IN')}*\n`;
  msg += `------------------------------------\n`;
  msg += `_પારદર્શક વહીવટ, સુખી ઉત્સવ! ગણપતિ બાપ્પા મોરિયા!_ 🙏`;

  return msg;
};
