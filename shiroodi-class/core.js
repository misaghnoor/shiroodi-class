/* core.js — هستهٔ مشترک سامانه (مرورگر + سرور، بدون وابستگی) */
(function (g) {
'use strict';

/* ---------------- utils ---------------- */
const SCHEMA = 12;
const FA = '۰۱۲۳۴۵۶۷۸۹';
const fa = n => String(n ?? '').replace(/\d/g, d => FA[+d]);
const faNum = (v, d = 1) => fa(Number(v || 0).toFixed(d)).replace('.', '٫');
const en = s => String(s ?? '').replace(/[۰-۹٠-٩]/g, c => { const i = FA.indexOf(c); return i > -1 ? String(i) : String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)); });
const num = v => { const n = Number(en(v).replace(/[^\d.\-]/g, '')); return Number.isFinite(n) ? n : NaN; };
const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const clone = o => typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o));
const pad = n => String(n).padStart(2, '0');
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const norm = s => String(s || '').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, ' ').replace(/\s+/g, ' ').trim();
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CPAL = ['#0d9488', '#1d4ed8', '#f59e0b', '#e11d48', '#84cc16', '#8b5cf6', '#0ea5e9', '#f97316'];
const ATT = {
  present: { label: 'حاضر', icon: '✅', color: '#16a34a', sym: '✓' },
  late: { label: 'تأخیر', icon: '⏰', color: '#f59e0b', sym: 'ت' },
  absent: { label: 'غایب', icon: '❌', color: '#e11d48', sym: 'غ' },
  excused: { label: 'موجه', icon: '📝', color: '#2563eb', sym: 'م' }
};
const ROLES = {
  judge: { label: 'قاضی کلاس', icon: '⚖️', color: '#8b5cf6', panel: 'judgePanel', desc: 'بررسی پرونده و صدور رأی' },
  mayor: { label: 'شهردار کلاس', icon: '🏙️', color: '#0ea5e9', panel: 'mayorPanel', desc: 'نظافت و ظاهر کلاس' },
  rep: { label: 'نماینده کلاس', icon: '🎖️', color: '#f59e0b', panel: 'repPanel', desc: 'گزارش انضباطی کلاس' }
};
const RSTAT = {
  pending_teacher: { l: 'در انتظار تأیید معلم', c: '#f59e0b', i: '⏳' },
  to_judge: { l: 'در دست بررسی قاضی', c: '#8b5cf6', i: '⚖️' },
  pending_final: { l: 'در انتظار تأیید نهایی', c: '#0ea5e9', i: '📨' },
  approved: { l: 'قطعی و ابلاغ‌شده', c: '#16a34a', i: '✅' },
  rejected: { l: 'رد شده', c: '#e11d48', i: '✖️' }
};
const HW = { done: { l: 'انجام داده', c: '#16a34a', i: '✅' }, partial: { l: 'ناقص', c: '#f59e0b', i: '🌗' }, none: { l: 'انجام نداده', c: '#e11d48', i: '❌' } };
const PTYPES = { choice: { l: 'تک‌انتخابی', i: '🔘' }, multi: { l: 'چندانتخابی', i: '☑️' }, yesno: { l: 'بله / خیر', i: '⚖️' }, rating: { l: 'امتیاز ستاره‌ای', i: '⭐' }, election: { l: 'انتخابات افراد', i: '🗳️' } };
const ATYPE = { oral: 'پرسش شفاهی', written: 'آزمون کتبی', performance: 'عملکردی', homework: 'تکلیف' };
const JWEEK = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
const JMONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

/* ---------------- time (Asia/Tehran, +03:30) ---------------- */
const OFFSET = 3.5 * 3600000;
const iranISO = d => { const x = new Date(d.getTime() + OFFSET); return `${x.getUTCFullYear()}-${pad(x.getUTCMonth() + 1)}-${pad(x.getUTCDate())}`; };
const iranHM = d => { const x = new Date(d.getTime() + OFFSET); return [x.getUTCHours(), x.getUTCMinutes()]; };
const todayISO = () => iranISO(new Date());
const nowHM = () => iranHM(new Date());

/* ---------------- Jalali ---------------- */
const div = (a, b) => ~~(a / b), mod = (a, b) => a - ~~(a / b) * b;
const BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
function jalCal(jy) {
  const bl = BREAKS.length, gy = jy + 621;
  let leapJ = -14, jp = BREAKS[0], jm, jump = 0, leap, n, i;
  for (i = 1; i < bl; i++) { jm = BREAKS[i]; jump = jm - jp; if (jy < jm) break; leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4); jp = jm; }
  n = jy - jp; leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ++;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150, march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  leap = mod(mod(n + 1, 33) - 1, 4); if (leap === -1) leap = 4;
  return { leap, gy, march };
}
function g2d(gy, gm, gd) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}
function d2g(jdn) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1, gm = mod(div(i, 153), 12) + 1, gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}
function j2d(jy, jm, jd) { const r = jalCal(jy); return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1; }
function d2j(jdn) {
  const gy = d2g(jdn).gy; let jy = gy - 621;
  const r = jalCal(jy), jdn1f = g2d(gy, 3, r.march); let k = jdn - jdn1f;
  if (k >= 0) { if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 }; k -= 186; }
  else { jy--; k += 179; if (r.leap === 1) k++; }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}
const Jalali = {
  toJ: (gy, gm, gd) => d2j(g2d(gy, gm, gd)),
  toG: (jy, jm, jd) => d2g(j2d(jy, jm, jd)),
  monthLen: (jy, jm) => jm <= 6 ? 31 : jm <= 11 ? 30 : (jalCal(jy).leap === 0 ? 30 : 29)
};
const isoToDate = iso => { const [y, m, d] = String(iso).split('-').map(Number); return new Date(y, m - 1, d, 12); };
const dateToISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const jOf = iso => { const d = isoToDate(iso); return Jalali.toJ(d.getFullYear(), d.getMonth() + 1, d.getDate()); };
const jToISO = (jy, jm, jd) => { const x = Jalali.toG(jy, jm, jd); return `${x.gy}-${pad(x.gm)}-${pad(x.gd)}`; };
const jShift = (j, d) => { let { jy, jm } = j; jm += d; if (jm < 1) { jm = 12; jy--; } if (jm > 12) { jm = 1; jy++; } return { jy, jm, jd: 1 }; };
const jLabel = iso => { const j = jOf(iso); return `${fa(j.jd)} ${JMONTHS[j.jm - 1]} ${fa(j.jy)}`; };
const jShort = iso => { const j = jOf(iso); return `${fa(j.jy)}/${fa(pad(j.jm))}/${fa(pad(j.jd))}`; };
const jShortEn = iso => { const j = jOf(iso); return `${j.jy}/${pad(j.jm)}/${pad(j.jd)}`; };
const wdIdx = iso => (isoToDate(iso).getDay() + 1) % 7;
const weekDay = iso => JWEEK[wdIdx(iso)];
const isSchoolDay = iso => wdIdx(iso) <= 4;
function monthGrid(jy, jm) {
  const off = wdIdx(jToISO(jy, jm, 1)), len = Jalali.monthLen(jy, jm), cells = [];
  for (let i = 0; i < off; i++) cells.push(null);
  for (let d = 1; d <= len; d++) cells.push(jToISO(jy, jm, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}
function parseDateAny(v) {
  const s = en(String(v || '')).trim().replace(/[./]/g, '-');
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  if (y > 1700 && y < 2200) return `${y}-${pad(mo)}-${pad(d)}`;
  if (y > 1200 && y < 1600) { try { return jToISO(y, mo, Math.min(d, Jalali.monthLen(y, mo))); } catch { return null; } }
  return null;
}
const dtLabel = iso => { const d = new Date(iso), [h, mi] = iranHM(d); return `${jLabel(iranISO(d))} • ساعت ${fa(pad(h))}:${fa(pad(mi))}`; };
const fmtDur = ms => { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return (h ? fa(pad(h)) + ':' : '') + fa(pad(m)) + ':' + fa(pad(ss)); };

/* ---------------- دادهٔ واقعی کلاس (فشرده) ---------------- */
const S_NAMES = ['محمد حسام بازیار', 'عرشیا توکلی', 'امیرحسین جبارزاده', 'ارشیا جعفری', 'سید محمدطاها حسینی', 'سید مهدی حسینی', 'کیارش رنجبر', 'محمدیاسین رنجبر', 'مهدیار رنجبر', 'محمدرضا شالی کار', 'محمدطاها عبدی', 'مهراد عبدی', 'مهرسام عبدی', 'علیرضا فیاضی', 'امیرحسام قلی پور', 'محمدرایان کاظمی', 'حسام کاویان پور', 'علی اکبر کاویان پور', 'عرفان محرمی', 'یاسین محمدی', 'آرسن محمدی فرد', 'فرهام محمدیان', 'سید امیرعباس مرتضوی', 'سید علی اصغر مرتضوی', 'سید یاسین مرتضوی', 'علی اصغر مرتضوی', 'سهیل گودرزی', 'محمدطاها رحمانی'];
const S_IDS = ['7g2xphj7fy', 'gm2xzm27fy', 'x8i0a497fy', '3w0z0at7fy', 'leplyan7fy', 'bikv9ve7fy', '81tmqr57fy', 'zc01p5f7fy', 'fguf0jy7fy', 'i6o9yso7fy', 'd3aau187fy', 'dk2fdhs7fy', 'ry2an0c7fy', 'e8mbwia7fy', 'ecvmbug7fy', 'q70nhpq7fy', 'to0yoj67fy', 'd8ha4qp7fy', '18osm9o7fy', 'wil8ukq7fy', 'ue8dc887fy', 'cexwn0t7fy', '4w2cxlb7fy', 'og18jb37fy', 'h18n0y47fy', 'enw2inj7fy', 'qf47jew7fy', 'yxb5syp7fy'];
const S_CODES = ['482915', '739164', '158372', '627408', '913547', '284761', '506293', '841026', '375194', '692830', '157849', '430572', '908316', '263985', '719604', '385027', '648913', '527491', '870365', '146728', '932584', '415960', '763241', '298106', '581493', '627048', '394815', '850271'];
const S_SUBJECTS = ['ریاضی', 'علوم تجربی', 'فارسی', 'مطالعات اجتماعی', 'هدیه‌های آسمانی', 'قرآن', 'تربیت بدنی', 'هنر', 'املا', 'انشا'];
const LV = { e: 'excellent', g: 'good', a: 'acceptable', n: 'needs_effort' };
const A = (id, title, date, type, subjects, gs, description = '') => ({ id, title, date, type, subjects, gs, description });
const SEED_A = [
A('gipaloumtn', 'پرسش قرآن درس ۱', '2026-10-04', 'oral', ['قرآن'], { 'قرآن': '8a 17g 22e 5e 24e 4e 16e 21e 25e 18e' }),
A('7qifbxvfnj', 'پرسش فارسی درس ۱', '2026-10-04', 'oral', ['فارسی'], { 'فارسی': '7g 25a 21e 18e 8a 1e 14e 0n 3a 19a 23e' }),
A('qoofchl1zu', 'پرسش اجتماعی درس ۱', '2026-10-04', 'oral', ['مطالعات اجتماعی'], { 'مطالعات اجتماعی': '13a 10a 6a 9g 20g 17g' }),
A('k457b77ag6', 'پرسش اجتماعی درس۱', '2026-10-05', 'oral', ['مطالعات اجتماعی'], { 'مطالعات اجتماعی': '25e 21e 18g 13a 8a 7e' }),
A('wcs3vq1paa', 'پرسش علوم درس ۱', '2026-10-05', 'oral', ['علوم تجربی'], { 'علوم تجربی': '15g 1e 26g 14g 5g 4g 22g 16g 24a 10a 6a 13a 9g 20g 17a 11a 0n 19e 23e 3g' }),
A('pszn3d9nz1', 'پرسش فارسی درس۱', '2026-10-07', 'oral', ['فارسی'], { 'فارسی': '16a 4a 24a 9a 22e 5g 15a 1e 26a 12a 25e 27a 18g 8a' }),
A('hv97nsy2aj', 'پرسش هدیه درس ۱', '2026-10-10', 'oral', ['هدیه‌های آسمانی'], { 'هدیه‌های آسمانی': '24e 4a 21e 25e 8a 18a 7g 27a' }),
A('vocbs9cr0w', 'پرسش فارسی درس ۱و۲', '2026-10-11', 'oral', ['فارسی'], { 'فارسی': '21e 25e 7g 27a 8a 18g 2a' }),
A('eletjsm4n4', 'پرسش اجتماعی درس ۱ و ۲', '2026-10-11', 'oral', ['مطالعات اجتماعی'], { 'مطالعات اجتماعی': '2e 26e 12a 15g 14e' }),
A('m0ee77k4xk', 'املا درس ۱', '2026-10-14', 'written', ['املا'], { 'املا': '21e 19e 23e 10a 25e 3a 11a 4g 22g 13a 5e 27g 2g 9e 14e 1e 6n 17n 12g 26a 8a 15e 18a 24g 20e 7g 0n' }),
A('576jv8syuc', 'پرسش علوم درس ۱ و ۲', '2026-10-14', 'oral', ['علوم تجربی'], { 'علوم تجربی': '0a 11a 19e 23g 3g' }),
A('pejptfiu7x', 'پرسش ریاضی فصل ۱', '2026-10-17', 'oral', ['ریاضی'], { 'ریاضی': '13a 0n 8n 3a 21g 2n 27a 12a 5a 16n' }),
A('33cfq5479c', 'پرسش هدیه درس ۱', '2026-10-17', 'oral', ['هدیه‌های آسمانی'], { 'هدیه‌های آسمانی': '24g 2a 8a 20g 27a' }),
A('6r2sh7vei0', 'پرسش فارسی درس ۱ و ۲', '2026-10-18', 'oral', ['فارسی'], { 'فارسی': '2a 0n 16n 20a 9g 24a 17a' }),
A('ngovahzk2v', 'پرسش اجتماعی درس ۱ و ۲', '2026-10-18', 'oral', ['مطالعات اجتماعی'], { 'مطالعات اجتماعی': '21a 15g 1g 24g 2g 18a' }),
A('umegwl3bfl', 'درس هنر سخنرانی در کلاس', '2026-10-19', 'oral', ['هنر'], { 'هنر': '3g 6a 7e 8a 10a 11g 12g 14g 15e 16g 18g 19g 20g 21e 25g 26g 9g 17e 13e 2e 5g 22e 27g 4g 0a 23g 24g' }),
A('mn4k6atbzb', 'پرسش علوم درس ۱و ۲', '2026-10-19', 'oral', ['علوم تجربی'], { 'علوم تجربی': '9e 13a 8g 6a' }),
A('k8tmdvk4k9', 'پرسش هدیه درس ۱ و۲', '2026-10-19', 'oral', ['هدیه‌های آسمانی'], { 'هدیه‌های آسمانی': '2a 11g 9e 18g 16a 10a 12a 14e' }),
A('9kblawbx7z', 'پرسش علوم درس ۱ و ۲', '2026-10-21', 'oral', ['علوم تجربی'], { 'علوم تجربی': '26e 1e 15e 12a 14g 16n 8a 24a 0n 23g 11g 19e 3e 27a 10a 18g' }),
A('qywmgplkxp', 'امتحان ریاضی فصل اول', '2026-10-24', 'written', ['ریاضی'], { 'ریاضی': '21g 9g 27n 3a 6a 17a 20a 4a 11n 26a 12a 5a 0n 16n 23a 15a 1e 2a 13n 22g 24n 14a 18g 10n 19g 8a 25g' }),
A('1ped5tfvvf', 'پرسش فارسی درس ۱ تا ۳', '2026-10-25', 'oral', ['فارسی'], { 'فارسی': '14e 1e 2a 15g 12g 23e 11a 7e 0a 3e 16a 4e 27g 10a 24g' }),
A('a160be9ghr', 'املا درس ۱ تا ۳', '2026-10-25', 'written', ['املا'], { 'املا': '25e 7e 14e 24a 9e 17n 1e 23g 21e 22e' }, 'پای تخته'),
A('qqcbjp6ng8', 'پرسش ریاضی', '2026-10-28', 'oral', ['ریاضی'], { 'ریاضی': '13a 15a 5a' }),
A('fn4rs697ri', 'پرسش فارسی درس ۱ تا ۳', '2026-10-28', 'oral', ['فارسی'], { 'فارسی': '24a 7g' }),
A('sdbx6548d2', 'امتحان علوم درس ۱ و ۲', '2026-10-27', 'written', ['علوم تجربی'], { 'علوم تجربی': '19e 12g 3g 13g 21g 2g 20g 1e 23e 9e 24a 4g 16a 0n 22a 10a 15a 18e 14g 8a 11a 27a 25e 5g 6e 17a' }),
A('6lssktx1eg', 'پرسش هدیه درس ۱و۲', '2026-10-31', 'oral', ['هدیه‌های آسمانی'], { 'هدیه‌های آسمانی': '0n 10a 6n 13n' }),
A('ofqbqykxkh', 'پرسش ریاضی فصل ۲', '2026-11-01', 'oral', ['ریاضی'], { 'ریاضی': '10n 13n 16a 0g 14g 27n 5a' }, 'پای تخته'),
A('2dlv4n4cvs', 'پرسش اجتماعی درس ۱ تا ۴', '2026-11-01', 'oral', ['مطالعات اجتماعی'], { 'مطالعات اجتماعی': '21g 10a 20a 27a 7e 2g 13e 26e 24g' }),
A('2qnu69nb2s', 'املا درس ۱ تا ۳', '2026-11-02', 'written', ['املا'], { 'املا': '1e 13a 5e 22e 2g 9e 27a 0n 16n 14e 24a 7g 8a 18a 20g 15g 6n 4e 12g 17a 21e 25e 10a 11a 3a 19e 23e' }),
A('gyr1brytzo', 'پرسش علوم درس ۱تا۳', '2026-11-03', 'oral', ['علوم تجربی'], { 'علوم تجربی': '13a 10a 20a 25g 9g 17a 22e 5a 16g 4a 24e 18e 6a 7g 8a' }),
A('g8rv9ouc5o', 'امتحان فارسی درس ۱تا۳', '2026-11-04', 'written', ['فارسی'], { 'فارسی': '27a 20a 10n 4a 3a 9a 12a 6n 2n 8n 5n 15a 25e 21g 26a 14g 23e 16n 13a 18a 22g 0n 11a 1g 19e 24a' }),
A('fz2e55g252', 'امتحان اجتماعی درس ۱ تا ۵', '2026-11-10', 'written', ['مطالعات اجتماعی'], { 'مطالعات اجتماعی': '6n 16n 0n 8g 4g 17n 9e 7g 18g 20g 10a 15g 21e 3a 11a 24a 14g 25e 22g 13a 12a 1e 19e 23a' }),
A('dq44cq17hr', 'پرسش علوم ۱ تا ۴', '2026-11-11', 'oral', ['قرآن', 'مطالعات اجتماعی'], { 'قرآن': '17a 7g 24e 14e 1e 26g 25g 18e 12a 10g 9e 21e' }),
A('vms3bq16kn', 'پرسش هدیه درس ۱تا۴', '2026-11-14', 'oral', ['هدیه‌های آسمانی'], { 'هدیه‌های آسمانی': '10g 22a 6a 15g 7g 21e 16e 18g 9g 24a' }),
A('qdrk1erhgo', 'پرسش فارسی ۱ تا ۵', '2026-11-14', 'oral', ['فارسی'], { 'فارسی': '2g 27a' }),
A('oe3fh4vlp8', 'پرسش علوم ۱ تا ۴', '2026-11-17', 'oral', ['علوم تجربی'], { 'علوم تجربی': '9g 1e 2a 10a 11a 24a 0n 27a' }),
A('cspoupbslu', 'پرسش اجتماعی درس ۱ تا ۶', '2026-11-17', 'oral', ['مطالعات اجتماعی'], { 'مطالعات اجتماعی': '13a 19a 24a 17n 10a 18n 9a 8a' }),
A('u3zw0apqbw', 'پرسش فارسی درس ۱ تا ۵', '2026-11-18', 'oral', ['فارسی'], { 'فارسی': '10a 4g 6n 16a' }),
A('cfykmk4zsn', 'پرسش ریاضی فصل دوم', '2026-11-21', 'oral', ['ریاضی'], { 'ریاضی': '9e 0g 22a 11g 20a 10a 24a 8a 18e' }),
A('5egiq5c7nq', 'پرسش هدیه درس تا ۵', '2026-11-21', 'oral', ['هدیه‌های آسمانی'], { 'هدیه‌های آسمانی': '26e 1e 12a 15a 14g 2g 24a 13g 9e 0a' })];
const SEED_ATT = { '2026-10-03': '0a 11e 26a', '2026-10-04': '0l 2a 7l 8l 11a 12a 15a 17l 26a', '2026-10-05': '2a 12a 27a', '2026-10-06': '2a 12a 16a 27a', '2026-10-07': '20a', '2026-10-10': '5a 16a 22a 23a', '2026-10-11': '1a 16a 22a 23a', '2026-10-12': '1a 16a', '2026-10-13': '16a', '2026-10-14': '16a', '2026-10-17': '10a', '2026-10-18': '6e', '2026-10-19': '1a', '2026-10-21': '6a 7e 15e 24l', '2026-10-24': '7a', '2026-10-26': '26a', '2026-10-27': '26a', '2026-10-28': '16a 26a', '2026-10-31': '16a 20a', '2026-11-01': '20l 24l', '2026-11-02': '', '2026-11-04': '7a 17a 18l 20l', '2026-11-07': '7a 15a', '2026-11-08': '2a 21a', '2026-11-10': '2a 5a 26a 27a', '2026-11-14': '', '2026-11-15': '9a', '2026-11-17': '6a 21a', '2026-11-18': '', '2026-11-21': '21a' };
const ATT_CH = { p: 'present', l: 'late', a: 'absent', e: 'excused' };
const D_REASONS = ['مشارکت فعال در کلاس', 'صحبت در کلاس', 'بی‌توجهی به تذکر', 'انجام ندادن ۲ تکلیف ریاضی و فارسی', 'فراموش کردن کتاب و تکلیف', 'غفلت در درس', 'نمی‌تواند تکالیفی که نوشته را بخواند', 'عدم انجام تکالیف', 'نظم و انضباط عالی', 'رعایت ادب و احترام', 'خوردن آدامس در کلاس', 'استفاده از الفاظ رکیک', 'غفلت و بی‌توجهی در درس'];
const SEED_DISC = `2026-10-02|5|2|1
2026-10-03|4|-1|2
2026-10-03|16|-1|3
2026-10-03|6|-1|2
2026-10-04|16|-2|3
2026-10-04|24|-2|3
2026-10-04|4|-1|3
2026-10-07|18|1|1
2026-10-07|13|-1|3
2026-10-10|10|-2|4
2026-10-10|18|-1|5
2026-10-11|26|2|1
2026-10-11|18|2|1
2026-10-11|24|2|1
2026-10-11|7|2|1
2026-10-11|15|2|1
2026-10-11|27|-1|6
2026-10-11|0|-1|6
2026-10-12|13|-5|3
2026-10-13|18|-2|3
2026-10-13|2|-2|3
2026-10-13|0|-1|3
2026-10-13|10|-1|3
2026-10-13|17|-1|3
2026-10-14|0|-1|7
2026-10-14|5|-1|8
2026-10-14|10|-2|3
2026-10-18|24|-2|3
2026-10-18|7|2|9
2026-10-18|19|2|10
2026-10-18|26|2|10
2026-10-18|4|2|10
2026-10-18|14|2|10
2026-10-18|25|2|10
2026-10-18|21|2|10
2026-10-18|1|2|10
2026-10-20|13|-1|3
2026-10-21|26|1|1
2026-10-26|16|-1|11
2026-10-27|0|-3|12
2026-10-28|20|-2|3
2026-10-31|10|-2|6
2026-11-07|10|-3|13
2026-11-07|25|1|10
2026-11-07|21|1|10
2026-11-07|3|1|10
2026-11-08|4|-2|6
2026-11-08|0|-2|6
2026-11-18|13|-2|3
2026-11-18|2|-1|3
2026-11-18|5|1|10
2026-11-18|25|1|10
2026-11-18|3|1|10
2026-11-18|24|-1|3`;
const SEED_GROUPS = [
  { id: 'um07tpfcgw', name: 'دانش', idx: [22, 24, 4, 5, 16], createdAt: '2026-10-03' },
  { id: 'ou007pmwps', name: 'البرز', idx: [19, 23, 3, 11, 0], createdAt: '2026-10-03' },
  { id: 'rzwgbjddbs', name: 'ایران', idx: [1, 14, 12, 2, 15, 26], createdAt: '2026-10-03' },
  { id: '0g6e88smnv', name: 'زاگرس', idx: [18, 8, 27, 7, 21, 6], createdAt: '2026-10-25' },
  { id: 'znsqhaxva1', name: 'دماوند', idx: [9, 17, 10, 13, 20, 25], createdAt: '2026-10-25' }];
const TIPS = {
  'ریاضی': ['روزانه ۵ مسئلهٔ کوتاه از فصل جاری حل شود و راه‌حل شفاهی توضیح داده شود.', 'جدول ضرب و محاسبات سریع با کارت تمرین، هفته‌ای سه نوبت.', 'تمرین پای تخته با صدای بلند فکر کردن تا خطای مفهومی مشخص شود.'],
  'علوم تجربی': ['شکل‌ها و آزمایش‌های فصل مرور و در یک خط خلاصه شود.', 'پاسخ شفاهی به پرسش‌های «چرا» و «چگونه» درس.', 'دفترچهٔ واژه‌های علمی ساخته و هفته‌ای یک‌بار مرور شود.'],
  'فارسی': ['روخوانی روزانهٔ ۱۰ دقیقه با صدای بلند.', 'واژه‌های نو و هم‌خانواده در دفتر واژه نوشته شود.', 'بازگویی داستان درس در ۵ جمله برای تقویت درک مطلب.'],
  'املا': ['۵ سطر املا در خانه با تمرکز بر واژه‌های دشوار درس.', 'واژه‌های اشتباه‌شده سه بار صحیح نوشته شود.', 'تمرین تشخیص حروف هم‌صدا (س/ص/ث و ز/ذ/ض/ظ).'],
  'انشا': ['روزانه یک بند ۵ جمله‌ای دربارهٔ موضوع ساده نوشته شود.', 'پیش از نوشتن، نقشهٔ ذهنی تهیه شود.', 'انشا با صدای بلند خوانده و جمله‌ها اصلاح شود.'],
  'مطالعات اجتماعی': ['نقشه‌ها و جدول‌های درس مرور شود.', 'پرسش‌های پایان درس شفاهی پاسخ داده شود.', 'هر درس در ۳ خط خلاصه شود.'],
  'هدیه‌های آسمانی': ['پیام درس با یک مثال از زندگی روزمره بیان شود.', 'داستان درس و نتیجهٔ اخلاقی آن بازگویی شود.', 'پرسش‌های کوتاه با هم‌کلاسی تمرین شود.'],
  'قرآن': ['روخوانی روزانهٔ ۵ سطر همراه فایل صوتی.', 'قواعد وقف و اتصال تمرین شود.', 'هم‌خوانی با گروه کلاس برای روان‌خوانی.'],
  'هنر': ['ارائهٔ کوتاه یک‌دقیقه‌ای در کلاس تمرین شود.', 'پروژهٔ عملی درس تکمیل و ارائه شود.', 'نمونه‌کار دیده و بازطراحی شود.'],
  'تربیت بدنی': ['مهارت پایهٔ درس در خانه تمرین شود.', 'نظم، آمادگی جسمانی و رعایت ایمنی تمرین شود.']
};

/* ---------------- model ---------------- */
const LMAX = st => (st.levels || []).length || 4;
function scoreOf(st, g) {
  if (g == null || g === '') return null;
  const L = LMAX(st);
  if (st.meta.gradingMode === 'numeric') { const v = Number(en(g)); if (!Number.isFinite(v)) return null; return clamp(v, 0, st.meta.numericMax || 20) / (st.meta.numericMax || 20) * L; }
  const i = st.levels.findIndex(l => l.key === g);
  return i < 0 ? null : L - i;
}
const levelIdxOfScore = (st, avg) => clamp(LMAX(st) - Math.round(avg), 0, LMAX(st) - 1);
function levelFor(st, g) {
  if (g == null || g === '') return null;
  if (st.meta.gradingMode === 'numeric') {
    const v = Number(en(g)); if (!Number.isFinite(v)) return null;
    const t = st.meta.numericThresholds;
    const key = v >= t.excellent ? 'excellent' : v >= t.good ? 'good' : v >= t.acceptable ? 'acceptable' : 'needs_effort';
    return st.levels.find(l => l.key === key) || null;
  }
  return st.levels.find(l => l.key === g) || null;
}
function stats(st, sid) {
  let sum = 0, cnt = 0;
  for (const a of st.assessments || []) for (const sub of a.subjects || []) {
    const s = scoreOf(st, st.grades?.[a.id]?.[sub]?.[sid]);
    if (s != null) { sum += s; cnt++; }
  }
  let total = 0, present = 0, late = 0, absent = 0, excused = 0;
  for (const d in st.attendance || {}) {
    const v = st.attendance[d][sid]; if (!v) continue;
    total++;
    if (v === 'present') present++; else if (v === 'late') late++; else if (v === 'absent') absent++; else excused++;
  }
  const pts = (st.discipline || []).filter(r => r.sid === sid).reduce((a, r) => a + (Number(r.points) || 0), 0);
  const lpts = (st.leaderLogs || []).filter(l => l.leader === sid).reduce((a, l) => a + (Number(l.points) || 0), 0);
  return { avg: cnt ? sum / cnt : 0, cnt, total, present, late, absent, excused, attRate: total ? Math.round((present + late) / total * 100) : 0, pts, lpts };
}
function subjectSeries(st, sid, sub) {
  const out = [];
  for (const a of [...(st.assessments || [])].sort((x, y) => String(x.date).localeCompare(String(y.date)))) {
    if (!(a.subjects || []).includes(sub)) continue;
    const g = st.grades?.[a.id]?.[sub]?.[sid]; if (g == null) continue;
    out.push({ date: a.date, aid: a.id, title: a.title, score: scoreOf(st, g), g });
  }
  return out;
}
const subjectAvgFor = (st, sid, sub) => { const s = subjectSeries(st, sid, sub); return s.length ? mean(s.map(x => x.score)) : null; };
function subjectAvg(st, sub) {
  let sum = 0, c = 0;
  for (const a of st.assessments || []) {
    if (!(a.subjects || []).includes(sub)) continue;
    for (const s of st.students || []) { const sc = scoreOf(st, st.grades?.[a.id]?.[sub]?.[s.id]); if (sc != null) { sum += sc; c++; } }
  }
  return c ? sum / c : 0;
}
const smartScore = (st, sid) => { const s = stats(st, sid); return s.avg / LMAX(st) * 50 + s.attRate * .3 + clamp(s.pts, -12, 12) * 1.4 + s.lpts * .5; };
const bestOf = (st, ids) => { let best = null, bs = -1e9; for (const id of ids || []) { const sc = smartScore(st, id); if (sc > bs) { bs = sc; best = id; } } return best; };
function groupStats(st, g) {
  let sum = 0, cnt = 0, pts = 0, attSum = 0, attCnt = 0;
  for (const m of g.members || []) { const s = stats(st, m); if (s.cnt) { sum += s.avg; cnt++; } if (s.total) { attSum += s.attRate; attCnt++; } pts += s.pts; }
  return { avg: cnt ? sum / cnt : 0, attRate: attCnt ? Math.round(attSum / attCnt) : 0, pts, count: (g.members || []).length };
}
const groupRanks = st => (st.groups || []).map(g => ({ id: g.id, ...groupStats(st, g) })).sort((a, b) => b.avg - a.avg);
const groupOf = (st, sid) => (st.groups || []).find(g => (g.members || []).includes(sid));
const stuById = (st, sid) => (st.students || []).find(s => s.id === sid);
const myRoles = (st, sid) => Object.keys(ROLES).filter(k => st.roles?.[k] === sid);
const leaderGids = (st, sid) => (st.groups || []).filter(g => g.leader === sid).map(g => g.id);
const leaderPts = (st, sid) => (st.leaderLogs || []).filter(l => l.leader === sid).reduce((a, l) => a + (l.points || 0), 0);
function judgePerf(st, sid) {
  const rs = (st.reports || []).filter(r => r.verdict && r.verdict.by === sid);
  const issued = rs.length, ok = rs.filter(r => r.status === 'approved').length, ret = rs.reduce((a, r) => a + (r.returns || 0), 0);
  return { issued, ok, ret, score: ok * 3 + issued - ret * 2, acc: issued ? Math.round(ok / issued * 100) : 0 };
}
function reporterPerf(st, sid) {
  const rs = (st.reports || []).filter(r => r.by === sid);
  const ok = rs.filter(r => ['to_judge', 'pending_final', 'approved'].includes(r.status)).length, no = rs.filter(r => r.status === 'rejected').length;
  return { sent: rs.length, ok, no, score: ok * 2 - no };
}
const quizStatus = (q, now = Date.now()) => q.forceClosed ? 'closed' : now < new Date(q.startAt).getTime() ? 'scheduled' : now > new Date(q.endAt).getTime() ? 'closed' : 'active';
function pollCounts(p) {
  const c = {}; let total = 0;
  for (const k in p.votes || {}) {
    const v = p.votes[k];
    if (Array.isArray(v)) v.forEach(x => c[x] = (c[x] || 0) + 1); else c[v] = (c[v] || 0) + 1;
    total++;
  }
  return { c, total };
}
function voteText(st, p, v) {
  if (v == null) return '—';
  if (p.type === 'election') return stuById(st, v)?.name || '—';
  if (p.type === 'multi') return (v || []).map(id => (p.options || []).find(o => o.id === id)?.text).filter(Boolean).join('، ') || '—';
  if (p.type === 'rating') return '⭐'.repeat(Number(v) || 0);
  return (p.options || []).find(o => o.id === v)?.text || '—';
}
function negScore(q, answers) {
  let correct = 0, wrong = 0, blank = 0;
  for (const qq of q.questions || []) { const a = answers?.[qq.id]; if (a == null) blank++; else if (a === qq.correctOptionId) correct++; else wrong++; }
  const ratio = q.negative ? (Number(q.negRatio) || 0.333) : 0;
  const raw = correct - wrong * ratio, total = (q.questions || []).length || 1;
  return { correct, wrong, blank, raw: Math.round(raw * 100) / 100, score: Math.round(raw / total * 100) };
}
function pearson(xs, ys) {
  const n = xs.length; if (n < 3) return 0;
  const mx = mean(xs), my = mean(ys); let a = 0, bx = 0, by = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; a += dx * dy; bx += dx * dx; by += dy * dy; }
  return bx && by ? a / Math.sqrt(bx * by) : 0;
}

/* ---------------- AI ---------------- */
function classContext(st, sid) {
  if (st.scope === 'student' && st.aggregates) {
    return { subAvg: st.aggregates.subjectAvgs || {}, standing: st.aggregates.standing || {}, rank: st.aggregates.myRank || 0, total: st.aggregates.gradedStudents || 0 };
  }
  const subAvg = {}, standing = {};
  for (const sub of st.subjects || []) subAvg[sub] = subjectAvg(st, sub);
  for (const sub of st.subjects || []) {
    const mine = subjectAvgFor(st, sid, sub);
    const all = (st.students || []).map(s => subjectAvgFor(st, s.id, sub)).filter(v => v != null);
    standing[sub] = { percentile: mine == null || !all.length ? 0 : Math.round(all.filter(v => v < mine).length / all.length * 100), total: all.length };
  }
  const wg = (st.students || []).map(s => ({ id: s.id, ...stats(st, s.id) })).filter(s => s.cnt).sort((a, b) => b.avg - a.avg);
  return { subAvg, standing, rank: wg.findIndex(s => s.id === sid) + 1 || 0, total: wg.length };
}
function aiStudent(st, sid) {
  const s = stuById(st, sid); if (!s) return null;
  const base = stats(st, sid); if (!base.cnt) return null;
  const ctx = classContext(st, sid);
  const subjects = [];
  for (const sub of st.subjects || []) {
    const series = subjectSeries(st, sid, sub); if (!series.length) continue;
    const vals = series.map(x => x.score), avg = mean(vals), cavg = ctx.subAvg[sub] || 0;
    const h = Math.max(1, Math.floor(vals.length / 2));
    const trend = vals.length >= 2 ? mean(vals.slice(-h)) - mean(vals.slice(0, h)) : 0;
    const sd = Math.sqrt(mean(vals.map(v => (v - avg) ** 2)));
    subjects.push({ sub, avg, cavg, delta: avg - cavg, trend, sd, n: vals.length, series, last: series[series.length - 1], percentile: ctx.standing[sub]?.percentile || 0, level: st.levels[levelIdxOfScore(st, avg)] });
  }
  if (!subjects.length) return null;
  const byPower = [...subjects].sort((a, b) => (b.avg + b.trend * .6) - (a.avg + a.trend * .6));
  const strengths = byPower.filter(x => x.avg >= 2.9 || x.delta >= .25).slice(0, 3);
  const weaknesses = [...subjects].sort((a, b) => (a.avg + a.trend * .6) - (b.avg + b.trend * .6)).filter(x => x.avg < 2.75 || x.delta <= -.25 || x.trend <= -.34).slice(0, 3);
  if (!strengths.length) strengths.push(byPower[0]);
  if (!weaknesses.length) weaknesses.push(byPower[byPower.length - 1]);
  const chrono = [];
  for (const a of [...(st.assessments || [])].sort((x, y) => String(x.date).localeCompare(String(y.date)))) {
    const vs = (a.subjects || []).map(sub => scoreOf(st, st.grades?.[a.id]?.[sub]?.[sid])).filter(v => v != null);
    if (vs.length) chrono.push({ date: a.date, title: a.title, v: mean(vs) });
  }
  const ch = chrono.map(x => x.v), hh = Math.max(1, Math.floor(ch.length / 2));
  const momentum = ch.length >= 2 ? mean(ch.slice(-hh)) - mean(ch.slice(0, hh)) : 0;
  const consistency = Math.sqrt(mean(ch.map(v => (v - base.avg) ** 2)));
  let risk = clamp((3 - base.avg) * 22, 0, 46) + clamp((92 - base.attRate) * .75, 0, 22) + clamp(-base.pts * 2.2, 0, 18) + clamp(-momentum * 22, 0, 16) + clamp((consistency - .55) * 18, 0, 10);
  risk = Math.round(clamp(risk, 0, 100));
  const riskLevel = risk >= 58 ? { l: 'نیازمند مداخلهٔ فوری', c: '#e11d48', i: '🚨' } : risk >= 34 ? { l: 'نیازمند توجه', c: '#f59e0b', i: '⚠️' } : { l: 'وضعیت پایدار', c: '#16a34a', i: '✅' };
  const predict = st.levels[levelIdxOfScore(st, clamp(base.avg + momentum * .6, 1, LMAX(st)))];
  const b = strengths[0], w = weaknesses[0];
  const insights = [
    { t: 'info', i: '📌', text: `میانگین کل ${s.name} در ${fa(base.cnt)} نمرهٔ ثبت‌شده «${st.levels[levelIdxOfScore(st, base.avg)].label}» (${faNum(base.avg)} از ${fa(LMAX(st))}) است${ctx.rank ? ` و رتبهٔ ${fa(ctx.rank)} از ${fa(ctx.total)} دانش‌آموزِ دارای نمره را دارد` : ''}.` },
    { t: 'good', i: '💪', text: `نقطهٔ قوت اصلی: ${b.sub} با میانگین ${faNum(b.avg)} (${b.level.label}) در ${fa(b.n)} ارزشیابی؛ ${b.delta >= 0 ? faNum(Math.abs(b.delta)) + ' بالاتر از میانگین کلاس' : faNum(Math.abs(b.delta)) + ' پایین‌تر از میانگین کلاس'} و بهتر از ${fa(b.percentile)}٪ هم‌کلاسی‌ها.` },
    { t: 'bad', i: '🎯', text: `نقطهٔ ضعف اصلی: ${w.sub} با میانگین ${faNum(w.avg)} (${w.level.label})؛ آخرین نتیجه «${levelFor(st, w.last.g)?.label || '—'}» در ${jLabel(w.last.date)}. ${w.trend < -.15 ? 'روند این درس نزولی است.' : w.trend > .15 ? 'روند این درس رو به بهبود است.' : 'روند این درس ثابت مانده است.'}` },
    { t: momentum > .12 ? 'good' : momentum < -.12 ? 'warn' : 'info', i: momentum > .12 ? '📈' : momentum < -.12 ? '📉' : '➖', text: `روند کلی: ${momentum > .12 ? 'صعودی' : momentum < -.12 ? 'نزولی' : 'تقریباً ثابت'} (${momentum >= 0 ? '+' : ''}${faNum(momentum)} در نیمهٔ اخیر ارزشیابی‌ها) و نوسان نمرات ${faNum(consistency)} است؛ ${consistency > .6 ? 'عملکرد ناپایدار و وابسته به موضوع درس است.' : 'عملکرد باثباتی دارد.'}` },
    { t: base.attRate >= 95 ? 'good' : base.attRate >= 88 ? 'warn' : 'bad', i: '📅', text: `حضور ${fa(base.attRate)}٪ در ${fa(base.total)} روز (${fa(base.absent)} غیبت، ${fa(base.late)} تأخیر، ${fa(base.excused)} موجه). ${base.attRate < 90 ? 'غیبت‌ها مستقیماً روی افت نمرات اثر گذاشته است.' : 'حضور منظم، پشتوانهٔ خوبی برای پیشرفت است.'}` }
  ];
  if (base.pts !== 0) insights.push({ t: base.pts > 0 ? 'good' : 'warn', i: '⭐', text: `امتیاز انضباطی ${base.pts > 0 ? '+' : ''}${fa(base.pts)}؛ ${(st.discipline || []).filter(r => r.sid === sid && r.points < 0).length} رویداد منفی ثبت شده است.` });
  const plans = [];
  for (const w2 of weaknesses.slice(0, 2)) plans.push({ sub: w2.sub, text: (TIPS[w2.sub] || ['مرور هدفمند درس و تمرین کوتاه روزانه.'])[0] });
  if (base.attRate < 93) plans.push({ sub: 'حضور', text: 'پیگیری علت غیبت‌ها و جبران درس‌های از دست رفته در روز بازگشت.' });
  if (base.pts < 0) plans.push({ sub: 'انضباط', text: 'تعیین یک هدف رفتاری هفتگی و ثبت بازخورد مثبت توسط معلم.' });
  plans.push({ sub: b.sub, text: `تقویت نقطهٔ قوت: سپردن نقش کمک‌آموز در ${b.sub} برای تثبیت یادگیری.` });
  return { sid, base, subjects, strengths, weaknesses, chrono, momentum, consistency, rank: ctx.rank, total: ctx.total, risk, riskLevel, predict, insights, plans: plans.slice(0, 4) };
}
function aiClass(st) {
  const all = (st.students || []).map(s => ({ id: s.id, name: s.name, ...stats(st, s.id) }));
  const wg = all.filter(s => s.cnt);
  const subjects = (st.subjects || []).map(sub => {
    let sum = 0, n = 0, miss = 0;
    for (const a of st.assessments || []) { if (!(a.subjects || []).includes(sub)) continue; for (const s of st.students || []) { const sc = scoreOf(st, st.grades?.[a.id]?.[sub]?.[s.id]); if (sc != null) { sum += sc; n++; } else miss++; } }
    return { sub, avg: n ? sum / n : 0, n, miss };
  }).filter(x => x.n).sort((a, b) => b.avg - a.avg);
  const analyses = (st.students || []).map(s => aiStudent(st, s.id)).filter(Boolean);
  const atRisk = analyses.filter(a => a.risk >= 34).sort((a, b) => b.risk - a.risk);
  const improvers = [...analyses].sort((a, b) => b.momentum - a.momentum).slice(0, 5);
  const decliners = [...analyses].sort((a, b) => a.momentum - b.momentum).slice(0, 3).filter(a => a.momentum < -.1);
  const corr = pearson(wg.map(s => s.attRate), wg.map(s => s.avg));
  const corrD = pearson(all.map(s => s.pts), all.map(s => s.avg));
  let graded = 0, possible = 0;
  for (const a of st.assessments || []) for (const sub of a.subjects || []) for (const s of st.students || []) { possible++; if (st.grades?.[a.id]?.[sub]?.[s.id] != null) graded++; }
  const easiest = subjects[0], hardest = subjects[subjects.length - 1];
  const insights = [];
  if (easiest) insights.push({ t: 'good', i: '🏅', text: `قوی‌ترین درس کلاس «${easiest.sub}» با میانگین ${faNum(easiest.avg)} از ${fa(LMAX(st))} در ${fa(easiest.n)} نمره است.` });
  if (hardest) insights.push({ t: 'bad', i: '🧩', text: `چالش‌برانگیزترین درس «${hardest.sub}» با میانگین ${faNum(hardest.avg)} است؛ ${fa(Math.round((1 - hardest.avg / LMAX(st)) * 100))}٪ فاصله تا سطح مطلوب. پیشنهاد: بازتدریس مفاهیم پایه و ارزشیابی کوتاه هفتگی.` });
  insights.push({ t: Math.abs(corr) > .4 ? 'info' : 'warn', i: '🔗', text: `همبستگی حضور و پیشرفت در این کلاس ${faNum(corr, 2)} است؛ ${corr > .4 ? 'حضور منظم به‌وضوح با نمرهٔ بالاتر همراه است.' : corr > .15 ? 'رابطهٔ مثبت اما متوسطی دیده می‌شود.' : 'رابطهٔ ضعیفی دیده می‌شود؛ کیفیت حضور مهم‌تر از کمیت آن است.'}` });
  if (Math.abs(corrD) > .25) insights.push({ t: 'info', i: '⭐', text: `همبستگی امتیاز انضباطی و میانگین درسی ${faNum(corrD, 2)} است؛ رفتار کلاسی و یادگیری در این کلاس هم‌جهت‌اند.` });
  insights.push({ t: atRisk.length ? 'warn' : 'good', i: '🚨', text: atRisk.length ? `${fa(atRisk.length)} دانش‌آموز نیازمند توجه هستند: ${atRisk.slice(0, 4).map(a => stuById(st, a.sid)?.name).filter(Boolean).join('، ')}${atRisk.length > 4 ? ' و …' : ''}` : 'هیچ دانش‌آموزی در وضعیت پرخطر نیست؛ وضعیت کلاس پایدار است.' });
  if (decliners.length) insights.push({ t: 'bad', i: '📉', text: `افت اخیر در: ${decliners.map(a => `${stuById(st, a.sid)?.name} (${faNum(a.momentum)})`).join('، ')}` });
  insights.push({ t: 'info', i: '🗂️', text: `پوشش ثبت نمرات ${fa(Math.round(graded / Math.max(1, possible) * 100))}٪ است (${fa(graded)} از ${fa(possible)} خانهٔ ممکن). خانه‌های خالی در ارزشیابی شفاهی طبیعی است، اما برای تحلیل دقیق‌تر تکمیل شود.` });
  return { subjects, analyses, atRisk, improvers, decliners, corr, corrD, graded, possible, insights, wg, all };
}
function audit(st) {
  const out = [], words = ['ریاضی', 'علوم', 'فارسی', 'اجتماعی', 'هدیه', 'قرآن', 'هنر', 'املا', 'انشا'];
  const map = { 'علوم': 'علوم تجربی', 'اجتماعی': 'مطالعات اجتماعی', 'هدیه': 'هدیه‌های آسمانی' };
  for (const a of st.assessments || []) {
    const mapped = words.filter(w => (a.title || '').includes(w)).map(w => map[w] || w);
    const mismatch = mapped.filter(m => !(a.subjects || []).some(s => s.includes(m)));
    if (mismatch.length && (a.subjects || []).length) out.push({ t: 'warn', i: '🏷️', text: `در «${a.title}» (${jShort(a.date)}) عنوان به «${mismatch.join('، ')}» اشاره دارد ولی درس ثبت‌شده «${a.subjects.join('، ')}» است.`, fix: { type: 'asmt.addSubject', id: a.id, subject: mismatch[0] } });
    const empty = (a.subjects || []).filter(sub => !Object.keys(st.grades?.[a.id]?.[sub] || {}).length);
    if (empty.length) out.push({ t: 'info', i: '📭', text: `در «${a.title}» درس «${empty.join('، ')}» هیچ نمره‌ای ندارد.`, fix: { type: 'asmt.dropSubject', id: a.id, subject: empty[0] } });
  }
  const attDates = new Set(Object.keys(st.attendance || {}));
  const noAtt = [...new Set((st.assessments || []).filter(a => !attDates.has(a.date)).map(a => a.date))].sort();
  if (noAtt.length) out.push({ t: 'info', i: '📅', text: `${fa(noAtt.length)} روز ارزشیابی بدون حضور و غیاب: ${noAtt.map(jShort).join('، ')}` });
  const un = (st.students || []).filter(s => !groupOf(st, s.id));
  if (un.length) out.push({ t: 'info', i: '🧩', text: `${fa(un.length)} دانش‌آموز بدون گروه: ${un.map(s => s.name).join('، ')}` });
  if (!out.length) out.push({ t: 'good', i: '✅', text: 'هیچ ناهماهنگی در داده‌ها یافت نشد؛ ساختار کلاس سالم است.' });
  return out;
}

/* ---------------- seed / normalize ---------------- */
function buildSeed() {
  const students = S_NAMES.map((name, i) => ({ id: S_IDS[i], name, code: S_CODES[i], avatar: null }));
  const levels = [
    { key: 'excellent', label: 'خیلی خوب', icon: '🌟', color: '#16a34a' },
    { key: 'good', label: 'خوب', icon: '✅', color: '#2563eb' },
    { key: 'acceptable', label: 'قابل قبول', icon: '👍', color: '#f59e0b' },
    { key: 'needs_effort', label: 'نیاز به تلاش', icon: '💪', color: '#ef4444' }];
  const assessments = [], grades = {};
  for (const a of SEED_A) {
    assessments.push({ id: a.id, title: a.title, date: a.date, type: a.type, subjects: [...a.subjects], description: a.description, createdAt: a.date });
    grades[a.id] = {};
    for (const sub of a.subjects) {
      grades[a.id][sub] = {};
      for (const tok of String(a.gs[sub] || '').split(/\s+/)) {
        const m = tok.match(/^(\d+)([egan])$/); if (!m) continue;
        const sid = S_IDS[+m[1]]; if (sid) grades[a.id][sub][sid] = LV[m[2]];
      }
    }
  }
  const attendance = {};
  for (const d in SEED_ATT) {
    attendance[d] = {};
    students.forEach(s => attendance[d][s.id] = 'present');
    for (const tok of SEED_ATT[d].split(/\s+/)) {
      const m = tok.match(/^(\d+)([plae])$/); if (!m) continue;
      const sid = S_IDS[+m[1]]; if (sid) attendance[d][sid] = ATT_CH[m[2]];
    }
  }
  const discipline = SEED_DISC.split('\n').map(l => { const [d, i, p, r] = l.split('|'); return { id: uid(), sid: S_IDS[+i], date: d, points: +p, reason: D_REASONS[+r - 1], by: 'teacher' }; });
  const groups = SEED_GROUPS.map((g, i) => ({ id: g.id, name: g.name, color: CPAL[i % CPAL.length], leader: null, members: g.idx.map(k => S_IDS[k]), createdAt: g.createdAt }));
  const last = Object.keys(attendance).sort().pop();
  const st = {
    schema: SCHEMA,
    meta: {
      school: 'دبستان شهید شیرودی عباس‌آباد', className: 'پایه پنجم', teacher: 'محمدباقر کالجی', year: '۱۴۰۵-۱۴۰۶',
      teacherCode: '991404', gradingMode: 'descriptive', numericMax: 20, numericMin: 0,
      numericThresholds: { excellent: 17, good: 14, acceptable: 10 },
      appearance: { accent: 'teal', theme: 'light', font: 'vazirmatn', fontScale: 1, density: 'cozy', pattern: true, anim: true },
      csv: { delim: ',', digits: 'fa', dates: 'jalali', bom: true }
    },
    levels, subjects: [...S_SUBJECTS], students, assessments, grades, attendance, discipline, groups,
    leaderLogs: [], roles: { judge: null, mayor: null, rep: null, termEnds: null, autoRotate: false, termWeeks: 4, history: [] },
    reports: [], inspections: [], polls: [], quizzes: [],
    news: [{ id: uid(), pinned: true, date: last, title: 'کارنامهٔ کلاس روی سرور منتشر شد 🌐', body: `اطلاعات واقعی کلاس بارگذاری شد: ${fa(students.length)} دانش‌آموز، ${fa(assessments.length)} ارزشیابی، ${fa(Object.keys(attendance).length)} روز حضور و غیاب، ${fa(discipline.length)} رویداد انضباطی و ${fa(groups.length)} گروه.\nهر تغییری که معلم ثبت کند، بلافاصله برای همهٔ دانش‌آموزان نمایش داده می‌شود.` }],
    studentVisibility: { grades: true, analysis: true, group: true, discipline: true, news: true, polls: true, quizzes: true },
    antiScreenshot: true, savedViews: [], _applied: []
  };
  groups.forEach(g => g.leader = bestOf(st, g.members));
  return st;
}
function normalize(raw) {
  if (!raw || !Array.isArray(raw.students) || !raw.students.length) return buildSeed();
  const st = raw;
  const fresh = buildSeed();
  st.schema = SCHEMA;
  for (const k of ['assessments', 'discipline', 'groups', 'leaderLogs', 'reports', 'inspections', 'polls', 'quizzes', 'news', 'savedViews', 'levels', 'subjects'])
    if (!Array.isArray(st[k])) st[k] = fresh[k];
  if (!st.grades || typeof st.grades !== 'object') st.grades = {};
  if (!st.attendance || typeof st.attendance !== 'object') st.attendance = {};
  if (!Array.isArray(st._applied)) st._applied = [];
  st.meta = Object.assign({}, fresh.meta, st.meta || {});
  st.meta.appearance = Object.assign({}, fresh.meta.appearance, st.meta.appearance || {});
  st.meta.csv = Object.assign({}, fresh.meta.csv, st.meta.csv || {});
  st.meta.numericThresholds = Object.assign({}, fresh.meta.numericThresholds, st.meta.numericThresholds || {});
  if (!st.meta.teacherCode) st.meta.teacherCode = fresh.meta.teacherCode;
  if (String(st.meta.school).includes('عباسا') && !String(st.meta.school).includes('عباس‌آباد')) st.meta.school = fresh.meta.school;
  st.assessments.forEach(a => { if (!a.title) a.title = a.name || 'ارزشیابی'; delete a.name; if (!a.type) a.type = 'oral'; if (!Array.isArray(a.subjects)) a.subjects = []; if (!a.createdAt) a.createdAt = a.date; });
  const used = new Set();
  st.students.forEach((s, i) => {
    let c = en(String(s.code || '')).trim();
    if (!/^\d{6}$/.test(c) || used.has(c)) c = S_CODES[i] || String(100000 + i);
    while (used.has(c)) c = String(Math.floor(100000 + Math.random() * 900000));
    used.add(c); s.code = c;
    if (s.avatar === undefined) s.avatar = null;
  });
  st.discipline.forEach(r => { if (!r.by) r.by = 'teacher'; });
  const seenColor = new Set();
  st.groups.forEach((g, i) => {
    if (!Array.isArray(g.members)) g.members = [];
    if (g.leader === undefined) g.leader = null;
    if (!g.color || seenColor.has(g.color)) g.color = CPAL[i % CPAL.length];
    seenColor.add(g.color);
    if (!g.leader || !g.members.includes(g.leader)) g.leader = bestOf(st, g.members);
  });
  st.quizzes.forEach(q => { if (!q.attempts) q.attempts = {}; if (!q.submissions) q.submissions = {}; if (!Array.isArray(q.questions)) q.questions = []; });
  st.polls.forEach(p => { if (!p.votes) p.votes = {}; if (!p.type) p.type = 'choice'; });
  st.roles = Object.assign({ judge: null, mayor: null, rep: null, termEnds: null, autoRotate: false, termWeeks: 4, history: [] }, st.roles || {});
  if (!Array.isArray(st.roles.history)) st.roles.history = [];
  st.studentVisibility = Object.assign({}, fresh.studentVisibility, st.studentVisibility || {});
  if (st.antiScreenshot === undefined) st.antiScreenshot = true;
  return st;
}

/* ---------------- views (privacy) ---------------- */
function teacherView(st) { const v = clone(st); v.scope = 'teacher'; delete v._applied; return v; }
function filterForStudent(st, sid) {
  const me = stuById(st, sid); if (!me) return null;
  const vis = st.studentVisibility || {};
  const meta = clone(st.meta); delete meta.teacherCode;
  const out = {
    schema: SCHEMA, scope: 'student', meta, levels: st.levels, subjects: st.subjects,
    studentVisibility: vis, antiScreenshot: st.antiScreenshot,
    student: { id: me.id, name: me.name, code: me.code, avatar: me.avatar || null },
    students: (st.students || []).map(s => s.id === sid ? { id: s.id, name: s.name, code: s.code, avatar: s.avatar || null } : { id: s.id, name: s.name, avatar: s.avatar || null }),
    groups: (st.groups || []).map(g => ({ id: g.id, name: g.name, color: g.color, leader: g.leader, members: g.members, createdAt: g.createdAt })),
    roles: st.roles, assessments: [], grades: {}, attendance: {}, discipline: [],
    reports: [], inspections: [], leaderLogs: [], news: [], polls: [], quizzes: [], savedViews: [],
    aggregates: null
  };
  for (const d in st.attendance || {}) { const v = st.attendance[d][sid]; if (v) out.attendance[d] = { [sid]: v }; }
  if (vis.grades !== false) {
    out.assessments = st.assessments || [];
    for (const aid in st.grades || {}) for (const sub in st.grades[aid]) {
      const g = st.grades[aid][sub][sid];
      if (g !== undefined) { (out.grades[aid] ||= {}); (out.grades[aid][sub] ||= {})[sid] = g; }
    }
  }
  if (vis.discipline !== false) {
    out.discipline = (st.discipline || []).filter(r => r.sid === sid);
    out.reports = (st.reports || []).filter(r => r.by === sid || (r.target === sid && r.status === 'approved'));
  }
  out.inspections = (st.inspections || []).filter(x => x.by === sid);
  out.leaderLogs = (st.leaderLogs || []).filter(l => l.leader === sid);
  if (vis.news !== false) out.news = st.news || [];
  if (vis.polls !== false) out.polls = (st.polls || []).map(p => {
    const { c, total } = pollCounts(p), show = p.status === 'closed' || p.showResults;
    return { id: p.id, type: p.type, question: p.question, options: p.options, candidates: p.candidates, targetRole: p.targetRole, status: p.status, showResults: !!p.showResults, applied: !!p.applied, createdAt: p.createdAt, myVote: p.votes?.[sid] ?? null, totalVotes: total, counts: show ? c : null };
  });
  if (vis.quizzes !== false) out.quizzes = (st.quizzes || []).map(q => {
    const sub = q.submissions?.[sid], status = quizStatus(q);
    const hideAnswers = !(status === 'closed' && q.resultsVisible);
    return {
      id: q.id, title: q.title, description: q.description, startAt: q.startAt, endAt: q.endAt, durationMin: q.durationMin,
      negative: !!q.negative, negRatio: q.negRatio, forceClosed: !!q.forceClosed, resultsVisible: !!q.resultsVisible,
      questions: (q.questions || []).map(qq => { if (hideAnswers) { const { correctOptionId, ...rest } = qq; return rest; } return qq; }),
      myAttempt: q.attempts?.[sid] || null,
      mySubmission: sub ? (q.resultsVisible ? sub : { submitted: true, at: sub.at }) : null
    };
  });
  if (vis.analysis !== false) {
    const all = (st.students || []).map(s => ({ id: s.id, ...stats(st, s.id) }));
    const wg = all.filter(s => s.cnt).sort((a, b) => b.avg - a.avg);
    const subjectAvgs = {}, standing = {};
    for (const sub of st.subjects || []) {
      subjectAvgs[sub] = subjectAvg(st, sub);
      const mine = subjectAvgFor(st, sid, sub);
      const vals = (st.students || []).map(s => subjectAvgFor(st, s.id, sub)).filter(v => v != null);
      standing[sub] = { percentile: mine == null || !vals.length ? 0 : Math.round(vals.filter(v => v < mine).length / vals.length * 100), total: vals.length };
    }
    const ranks = groupRanks(st), groupSummary = {}, peerStats = {};
    for (const g of st.groups || []) {
      const gs = groupStats(st, g);
      groupSummary[g.id] = { ...gs, rank: ranks.findIndex(r => r.id === g.id) + 1, totalGroups: (st.groups || []).length };
      if (g.leader === sid) for (const m of g.members || []) { const s = stats(st, m); peerStats[m] = { avg: s.avg, cnt: s.cnt, attRate: s.attRate, pts: s.pts, lpts: s.lpts, total: s.total }; }
    }
    out.aggregates = {
      classOverallAvg: wg.length ? mean(wg.map(s => s.avg)) : 0,
      myRank: wg.findIndex(s => s.id === sid) + 1 || 0,
      gradedStudents: wg.length, totalStudents: (st.students || []).length,
      subjectAvgs, standing, groupSummary, peerStats
    };
  }
  return out;
}
function viewFor(st, session) { return session.role === 'teacher' ? teacherView(st) : filterForStudent(st, session.sid); }

/* ---------------- CSV ---------------- */
const CSV_KINDS = {
  students: { l: 'دانش‌آموزان', icon: '👦', cols: ['نام', 'کد', 'گروه'] },
  attendance: { l: 'حضور و غیاب', icon: '📅', cols: ['تاریخ', 'روز', 'نام', 'کد', 'وضعیت'] },
  grades: { l: 'نمرات', icon: '📝', cols: ['ارزشیابی', 'تاریخ', 'درس', 'نام', 'کد', 'نمره'] },
  discipline: { l: 'انضباط', icon: '⭐', cols: ['تاریخ', 'نام', 'کد', 'امتیاز', 'دلیل'] },
  groups: { l: 'گروه‌ها', icon: '🧩', cols: ['گروه', 'نام', 'کد', 'سرگروه'] },
  analysis: { l: 'تحلیل هوشمند', icon: '🧠', cols: ['نام', 'کد', 'گروه', 'میانگین', 'سطح', 'رتبه', 'حضور٪', 'غیبت', 'امتیاز', 'ریسک', 'وضعیت', 'نقطه قوت', 'نقطه ضعف', 'روند'] }
};
function serializeCSV(st, rows) {
  const c = st.meta.csv, d = c.delim === '\\t' ? '\t' : c.delim;
  const q = v => { let s = String(v ?? ''); if (c.digits === 'fa') s = fa(s); return /["\n\r]|[,;\t]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return (c.bom ? '\uFEFF' : '') + rows.map(r => r.map(q).join(d)).join('\r\n');
}
const csvDate = (st, iso) => st.meta.csv.dates === 'jalali' ? jShortEn(iso) : iso;
function csvRows(st, kind, ids) {
  const set = ids ? new Set(ids) : null;
  const studs = (st.students || []).filter(s => !set || set.has(s.id));
  if (kind === 'students') return [CSV_KINDS.students.cols, ...studs.map(s => [s.name, s.code, groupOf(st, s.id)?.name || ''])];
  if (kind === 'attendance') {
    const rows = [CSV_KINDS.attendance.cols];
    Object.keys(st.attendance || {}).sort().forEach(d => { for (const s of studs) { const v = st.attendance[d][s.id]; if (v) rows.push([csvDate(st, d), weekDay(d), s.name, s.code, ATT[v].label]); } });
    return rows;
  }
  if (kind === 'grades') {
    const rows = [CSV_KINDS.grades.cols];
    for (const a of [...(st.assessments || [])].sort((x, y) => String(x.date).localeCompare(String(y.date))))
      for (const sub of a.subjects || []) for (const s of studs) {
        const g = st.grades?.[a.id]?.[sub]?.[s.id]; if (g == null) continue;
        rows.push([a.title, csvDate(st, a.date), sub, s.name, s.code, st.meta.gradingMode === 'numeric' ? g : (st.levels.find(l => l.key === g)?.label || g)]);
      }
    return rows;
  }
  if (kind === 'discipline') return [CSV_KINDS.discipline.cols, ...(st.discipline || []).filter(r => !set || set.has(r.sid)).sort((a, b) => String(a.date).localeCompare(String(b.date))).map(r => { const s = stuById(st, r.sid); return [csvDate(st, r.date), s?.name || '', s?.code || '', r.points, r.reason]; })];
  if (kind === 'groups') {
    const rows = [CSV_KINDS.groups.cols];
    for (const g of st.groups || []) for (const m of g.members || []) { const s = stuById(st, m); if (s && (!set || set.has(m))) rows.push([g.name, s.name, s.code, g.leader === m ? 'بله' : 'خیر']); }
    return rows;
  }
  const rows = [CSV_KINDS.analysis.cols];
  for (const s of studs) {
    const b = stats(st, s.id), a = aiStudent(st, s.id), g = groupOf(st, s.id);
    rows.push([s.name, s.code, g?.name || '', b.cnt ? faNum(b.avg, 2) : '', b.cnt ? st.levels[levelIdxOfScore(st, b.avg)].label : '', a ? fa(a.rank) : '', fa(b.attRate), fa(b.absent), fa(b.pts), a ? fa(a.risk) : '', a ? a.riskLevel.l : '', a ? a.strengths.map(x => x.sub).join(' | ') : '', a ? a.weaknesses.map(x => x.sub).join(' | ') : '', a ? faNum(a.momentum, 2) : '']);
  }
  return rows;
}
function parseCSV(text) {
  text = String(text).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const first = text.split('\n')[0] || '';
  const counts = { ',': (first.match(/,/g) || []).length, ';': (first.match(/;/g) || []).length, '\t': (first.match(/\t/g) || []).length };
  const delim = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === delim) { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}
const IMP_FIELDS = {
  students: [{ key: 'name', label: 'نام دانش‌آموز', req: true }, { key: 'code', label: 'کد ورود' }, { key: 'group', label: 'گروه' }],
  attendance: [{ key: 'date', label: 'تاریخ', req: true }, { key: 'name', label: 'نام یا کد', req: true }, { key: 'status', label: 'وضعیت', req: true }],
  grades: [{ key: 'asmt', label: 'عنوان ارزشیابی', req: true }, { key: 'date', label: 'تاریخ ارزشیابی' }, { key: 'subject', label: 'درس', req: true }, { key: 'name', label: 'نام یا کد', req: true }, { key: 'grade', label: 'نمره/سطح', req: true }],
  discipline: [{ key: 'date', label: 'تاریخ', req: true }, { key: 'name', label: 'نام یا کد', req: true }, { key: 'points', label: 'امتیاز', req: true }, { key: 'reason', label: 'دلیل', req: true }],
  groups: [{ key: 'group', label: 'نام گروه', req: true }, { key: 'name', label: 'نام یا کد عضو', req: true }, { key: 'leader', label: 'سرگروه (بله/خیر)' }]
};
const IMP_SYN = { name: ['نام', 'دانش آموز', 'دانشآموز', 'name'], code: ['کد', 'code'], group: ['گروه', 'group'], date: ['تاریخ', 'date'], status: ['وضعیت', 'status'], asmt: ['ارزشیابی', 'عنوان ارزشیابی', 'عنوان', 'assessment'], subject: ['درس', 'subject'], grade: ['نمره', 'سطح', 'grade'], points: ['امتیاز', 'points'], reason: ['دلیل', 'reason'], leader: ['سرگروه', 'leader'] };
function autoMap(kind, headers) {
  const map = {};
  for (const f of IMP_FIELDS[kind] || []) {
    const syn = IMP_SYN[f.key] || [];
    const i = headers.findIndex(h => syn.some(s => norm(h) === norm(s) || norm(h).includes(norm(s))));
    if (i > -1) map[f.key] = i;
  }
  return map;
}
const findStudent = (st, v) => {
  const s = norm(v), code = en(v).trim();
  return (st.students || []).find(x => x.code === code) || (st.students || []).find(x => norm(x.name) === s) || (st.students || []).find(x => s.length > 3 && norm(x.name).includes(s));
};
function findLevel(st, v) {
  const s = norm(v);
  const byKey = st.levels.find(l => l.key === s); if (byKey) return byKey.key;
  const byLabel = st.levels.find(l => norm(l.label) === s); if (byLabel) return byLabel.key;
  const aliases = { 'خیلیخوب': 'excellent', 'عالی': 'excellent', 'خوب': 'good', 'قابلقبول': 'acceptable', 'نیازبهتلاش': 'needs_effort', 'نیازمندتلاش': 'needs_effort' };
  const k = aliases[s.replace(/\s/g, '')]; if (k) return k;
  const n = num(v);
  if (Number.isFinite(n) && st.meta.gradingMode === 'numeric') return String(clamp(n, st.meta.numericMin || 0, st.meta.numericMax || 20));
  return null;
}
function findStatus(v) {
  const s = norm(v);
  for (const k in ATT) if (norm(ATT[k].label) === s || ATT[k].sym === s) return k;
  const map = { 'حاضر': 'present', present: 'present', p: 'present', 'غایب': 'absent', absent: 'absent', a: 'absent', 'غ': 'absent', 'تأخیر': 'late', 'تاخیر': 'late', late: 'late', l: 'late', 'ت': 'late', 'موجه': 'excused', excused: 'excused', e: 'excused', 'م': 'excused' };
  return map[s] || null;
}
function normalizeImport(st, kind, rows, map, create) {
  const ok = [], err = [], F = IMP_FIELDS[kind] || [];
  const get = (r, k) => { const i = map[k]; return i == null || i === '' ? '' : String(r[i] ?? '').trim(); };
  rows.forEach((r, idx) => {
    const row = idx + 2, rec = {};
    for (const f of F) { const v = get(r, f.key); if (f.req && !v) { err.push({ row, msg: `«${f.label}» خالی است` }); return; } rec[f.key] = v; }
    if (kind === 'students') { ok.push(rec); return; }
    const stu = findStudent(st, rec.name);
    if (!stu) { err.push({ row, msg: `دانش‌آموز «${rec.name}» یافت نشد` }); return; }
    if (rec.date) { const d = parseDateAny(rec.date); if (!d) { err.push({ row, msg: `تاریخ «${rec.date}» نامعتبر` }); return; } rec.dateISO = d; }
    if (kind === 'attendance') {
      const s = findStatus(rec.status); if (!s) { err.push({ row, msg: `وضعیت «${rec.status}» نامعتبر` }); return; }
      rec.sid = stu.id; rec.statusKey = s; ok.push(rec); return;
    }
    if (kind === 'grades') {
      const sub = st.subjects.find(x => norm(x) === norm(rec.subject));
      if (!sub) { err.push({ row, msg: `درس «${rec.subject}» در کلاس نیست` }); return; }
      const lv = findLevel(st, rec.grade);
      if (lv == null) { err.push({ row, msg: `نمره «${rec.grade}» نامعتبر` }); return; }
      rec.sid = stu.id; rec.sub = sub; rec.lv = lv; ok.push(rec); return;
    }
    if (kind === 'discipline') {
      const p = num(rec.points); if (!Number.isFinite(p)) { err.push({ row, msg: 'امتیاز نامعتبر' }); return; }
      rec.sid = stu.id; rec.pts = clamp(Math.round(p), -10, 10); ok.push(rec); return;
    }
    rec.sid = stu.id; rec.isLeader = /بله|yes|1|✓/i.test(rec.leader || ''); ok.push(rec);
  });
  return { ok, err };
}
function applyImport(st, kind, recs, create) {
  let n = 0;
  const usedCodes = new Set(st.students.map(s => s.code));
  const newCode = () => { let c; do { c = String(Math.floor(100000 + Math.random() * 900000)); } while (usedCodes.has(c)); usedCodes.add(c); return c; };
  for (const r of recs) {
    if (kind === 'students') {
      let s = st.students.find(x => norm(x.name) === norm(r.name));
      if (!s) { if (!create) continue; s = { id: uid(), name: r.name, code: /^\d{6}$/.test(en(r.code || '')) && !usedCodes.has(en(r.code)) ? en(r.code) : newCode(), avatar: null }; usedCodes.add(s.code); st.students.push(s); }
      else if (r.code && /^\d{6}$/.test(en(r.code)) && !st.students.some(x => x.code === en(r.code) && x.id !== s.id)) s.code = en(r.code);
      if (r.group) {
        let g = st.groups.find(x => norm(x.name) === norm(r.group));
        if (!g && create) { g = { id: uid(), name: r.group, color: CPAL[st.groups.length % CPAL.length], leader: null, members: [], createdAt: todayISO() }; st.groups.push(g); }
        if (g) { st.groups.forEach(x => { x.members = x.members.filter(m => m !== s.id); if (x.leader === s.id) x.leader = null; }); if (!g.members.includes(s.id)) g.members.push(s.id); }
      }
      n++; continue;
    }
    if (kind === 'attendance') { (st.attendance[r.dateISO] ||= {})[r.sid] = r.statusKey; n++; continue; }
    if (kind === 'grades') {
      let a = st.assessments.find(x => norm(x.title) === norm(r.asmt) && (!r.dateISO || x.date === r.dateISO));
      if (!a && create) { a = { id: uid(), title: r.asmt, date: r.dateISO || todayISO(), type: 'oral', subjects: [r.sub], description: '', createdAt: todayISO() }; st.assessments.push(a); }
      if (!a) continue;
      if (!a.subjects.includes(r.sub)) a.subjects.push(r.sub);
      ((st.grades[a.id] ||= {})[r.sub] ||= {})[r.sid] = st.meta.gradingMode === 'numeric' ? Number(r.lv) : r.lv;
      n++; continue;
    }
    if (kind === 'discipline') { st.discipline.push({ id: uid(), sid: r.sid, date: r.dateISO, points: r.pts, reason: r.reason, by: 'teacher' }); n++; continue; }
    let g = st.groups.find(x => norm(x.name) === norm(r.group));
    if (!g && create) { g = { id: uid(), name: r.group, color: CPAL[st.groups.length % CPAL.length], leader: null, members: [], createdAt: todayISO() }; st.groups.push(g); }
    if (!g) continue;
    if (!g.members.includes(r.sid)) { st.groups.forEach(x => { x.members = x.members.filter(m => m !== r.sid); if (x.leader === r.sid) x.leader = null; }); g.members.push(r.sid); }
    if (r.isLeader) g.leader = r.sid;
    n++;
  }
  return n;
}

/* ---------------- command reducer ---------------- */
class CmdError extends Error { constructor(message, status = 400, code = 'bad_request') { super(message); this.status = status; this.code = code; } }
const bad = (m, c) => new CmdError(m, 400, c);
const forb = m => new CmdError(m, 403, 'forbidden');
const str = (v, n) => String(v ?? '').trim().slice(0, n);
const isTeacher = s => s?.role === 'teacher';
function moveToGroup(st, sid, gid) {
  st.groups.forEach(g => { g.members = (g.members || []).filter(m => m !== sid); if (g.leader === sid) g.leader = null; });
  if (gid) { const g = st.groups.find(x => x.id === gid); if (g && !g.members.includes(sid)) g.members.push(sid); }
}
function removeStudent(st, sid) {
  st.students = st.students.filter(s => s.id !== sid);
  for (const aid in st.grades) for (const sub in st.grades[aid]) delete st.grades[aid][sub][sid];
  for (const d in st.attendance) delete st.attendance[d][sid];
  st.discipline = st.discipline.filter(r => r.sid !== sid);
  st.reports = st.reports.filter(r => r.by !== sid && r.target !== sid);
  st.leaderLogs = st.leaderLogs.filter(l => l.leader !== sid && l.member !== sid);
  st.inspections = st.inspections.filter(x => x.by !== sid);
  st.groups.forEach(g => { g.members = g.members.filter(m => m !== sid); if (g.leader === sid) g.leader = bestOf(st, g.members); });
  Object.keys(ROLES).forEach(k => { if (st.roles[k] === sid) st.roles[k] = null; });
  st.polls.forEach(p => { if (p.votes) delete p.votes[sid]; if (p.candidates) p.candidates = p.candidates.filter(c => c !== sid); });
  st.quizzes.forEach(q => { if (q.submissions) delete q.submissions[sid]; if (q.attempts) delete q.attempts[sid]; });
}
function setGrade(st, aid, sub, sid, value) {
  const a = st.assessments.find(x => x.id === aid); if (!a) throw bad('ارزشیابی یافت نشد');
  if (!a.subjects.includes(sub)) throw bad('درس در این ارزشیابی نیست');
  if (!stuById(st, sid)) throw bad('دانش‌آموز یافت نشد');
  const col = ((st.grades[aid] ||= {})[sub] ||= {});
  if (value == null || value === '') { delete col[sid]; return; }
  if (st.meta.gradingMode === 'numeric') {
    const n = num(value); if (!Number.isFinite(n)) throw bad('نمره نامعتبر');
    col[sid] = clamp(n, st.meta.numericMin || 0, st.meta.numericMax || 20);
  } else {
    if (!st.levels.some(l => l.key === value)) throw bad('سطح نامعتبر');
    col[sid] = value;
  }
}
const levelMid = (st, key) => {
  const t = st.meta.numericThresholds, max = st.meta.numericMax || 20;
  const m = { excellent: (t.excellent + max) / 2, good: (t.good + t.excellent) / 2, acceptable: (t.acceptable + t.good) / 2, needs_effort: t.acceptable / 2 };
  return Math.round((m[key] ?? 0) * 2) / 2;
};
const SETTING_PATHS = ['meta.school', 'meta.className', 'meta.teacher', 'meta.year', 'meta.numericMax', 'meta.numericMin', 'meta.numericThresholds.excellent', 'meta.numericThresholds.good', 'meta.numericThresholds.acceptable', 'meta.appearance.accent', 'meta.appearance.theme', 'meta.appearance.font', 'meta.appearance.fontScale', 'meta.appearance.density', 'meta.appearance.pattern', 'meta.appearance.anim', 'meta.csv.delim', 'meta.csv.digits', 'meta.csv.dates', 'meta.csv.bom', 'antiScreenshot'];
function setPath(o, p, v) { const k = p.split('.'); let t = o; for (let i = 0; i < k.length - 1; i++) { t[k[i]] = t[k[i]] || {}; t = t[k[i]]; } t[k[k.length - 1]] = v; }

function applyCommand(st, cmd, session) {
  if (!cmd || typeof cmd.type !== 'string') throw bad('درخواست نامعتبر');
  if (!session) throw new CmdError('نشست نامعتبر است', 401, 'unauthorized');
  const cid = str(cmd.cid, 40);
  if (cid && st._applied.includes(cid)) return { state: st, result: { duplicate: true } };
  const T = cmd.type, sid = session.sid, D = todayISO();
  let result = null;
  const teacher = () => { if (!isTeacher(session)) throw forb('این عملیات مخصوص معلم است.'); };
  const needRole = r => { if (st.roles?.[r] !== sid) throw forb('شما مسئول این بخش نیستید.'); };

  switch (T) {
    /* ---- students ---- */
    case 'student.add': {
      teacher();
      const name = str(cmd.name, 80), code = en(str(cmd.code, 12));
      if (!name) throw bad('نام الزامی است');
      if (!/^\d{6}$/.test(code)) throw bad('کد باید ۶ رقم باشد');
      if (st.students.some(s => s.code === code)) throw bad('این کد تکراری است');
      const id = str(cmd.id, 24) || uid();
      st.students.push({ id, name, code, avatar: null });
      if (cmd.groupId) moveToGroup(st, id, cmd.groupId);
      result = { id }; break;
    }
    case 'student.update': {
      teacher();
      const s = stuById(st, cmd.id); if (!s) throw bad('دانش‌آموز یافت نشد');
      const name = str(cmd.name, 80), code = en(str(cmd.code, 12));
      if (!name) throw bad('نام الزامی است');
      if (!/^\d{6}$/.test(code)) throw bad('کد باید ۶ رقم باشد');
      if (st.students.some(x => x.code === code && x.id !== s.id)) throw bad('این کد تکراری است');
      s.name = name; s.code = code; moveToGroup(st, s.id, cmd.groupId || '');
      break;
    }
    case 'student.delete': teacher(); removeStudent(st, str(cmd.id, 24)); break;
    case 'student.bulkDelete': teacher(); (cmd.ids || []).slice(0, 300).forEach(id => removeStudent(st, id)); break;
    case 'student.bulkGroup': teacher(); (cmd.ids || []).slice(0, 300).forEach(id => moveToGroup(st, id, cmd.gid === 'none' ? '' : cmd.gid)); break;
    case 'student.photo': {
      const target = isTeacher(session) ? str(cmd.id, 24) : sid;
      const s = stuById(st, target); if (!s) throw bad('دانش‌آموز یافت نشد');
      const a = cmd.avatar == null ? null : String(cmd.avatar);
      if (a && (a.length > 120000 || !/^data:image\/(jpeg|png|webp);base64,/.test(a))) throw bad('تصویر نامعتبر است');
      s.avatar = a; break;
    }
    case 'student.regenCode': {
      teacher(); const s = stuById(st, cmd.id); if (!s) throw bad('دانش‌آموز یافت نشد');
      const used = new Set(st.students.map(x => x.code)); let c;
      do { c = String(Math.floor(100000 + Math.random() * 900000)); } while (used.has(c));
      s.code = c; result = { code: c }; break;
    }
    case 'codes.regenerate': {
      teacher(); const used = new Set();
      st.students.forEach(s => { let c; do { c = String(Math.floor(100000 + Math.random() * 900000)); } while (used.has(c)); used.add(c); s.code = c; });
      break;
    }
    /* ---- groups ---- */
    case 'group.add': {
      teacher(); const name = str(cmd.name, 40); if (!name) throw bad('نام گروه الزامی است');
      st.groups.push({ id: str(cmd.id, 24) || uid(), name, color: cmd.color || CPAL[st.groups.length % CPAL.length], leader: null, members: [], createdAt: D });
      break;
    }
    case 'group.update': {
      teacher(); const g = st.groups.find(x => x.id === cmd.id); if (!g) throw bad('گروه یافت نشد');
      if (cmd.name != null) g.name = str(cmd.name, 40) || g.name;
      if (cmd.color != null && /^#[0-9a-f]{6}$/i.test(cmd.color)) g.color = cmd.color;
      break;
    }
    case 'group.delete': teacher(); st.groups = st.groups.filter(g => g.id !== cmd.id); break;
    case 'group.move': teacher(); if (!stuById(st, cmd.sid)) throw bad('دانش‌آموز یافت نشد'); moveToGroup(st, cmd.sid, cmd.gid || ''); break;
    case 'group.setLeader': {
      teacher(); const g = st.groups.find(x => x.id === cmd.gid); if (!g) throw bad('گروه یافت نشد');
      if (cmd.sid && !g.members.includes(cmd.sid)) throw bad('این دانش‌آموز عضو گروه نیست');
      g.leader = cmd.sid || null; break;
    }
    case 'group.autoLeaders': teacher(); st.groups.forEach(g => g.leader = bestOf(st, g.members)); break;
    case 'group.balance': {
      teacher(); if (st.groups.length < 2) throw bad('حداقل دو گروه لازم است');
      const sorted = st.students.map(s => ({ id: s.id, ...stats(st, s.id) })).sort((a, b) => b.avg - a.avg);
      st.groups.forEach(g => { g.members = []; g.leader = null; });
      let i = 0, dir = 1;
      for (const s of sorted) { st.groups[i].members.push(s.id); i += dir; if (i >= st.groups.length) { i = st.groups.length - 1; dir = -1; } else if (i < 0) { i = 0; dir = 1; } }
      st.groups.forEach(g => g.leader = bestOf(st, g.members));
      break;
    }
    /* ---- assessments & grades ---- */
    case 'asmt.add': {
      teacher();
      const title = str(cmd.title, 90), date = parseDateAny(cmd.date);
      if (!title || !date) throw bad('عنوان و تاریخ الزامی است');
      const subjects = (cmd.subjects || []).filter(s => st.subjects.includes(s));
      if (!subjects.length) throw bad('حداقل یک درس انتخاب کنید');
      const id = str(cmd.id, 24) || uid();
      st.assessments.push({ id, title, date, type: ATYPE[cmd.type] ? cmd.type : 'oral', subjects, description: str(cmd.description, 200), createdAt: D });
      st.grades[id] = {}; subjects.forEach(s => st.grades[id][s] = {});
      result = { id }; break;
    }
    case 'asmt.update': {
      teacher(); const a = st.assessments.find(x => x.id === cmd.id); if (!a) throw bad('ارزشیابی یافت نشد');
      if (cmd.title != null) a.title = str(cmd.title, 90) || a.title;
      if (cmd.date != null) { const d = parseDateAny(cmd.date); if (!d) throw bad('تاریخ نامعتبر'); a.date = d; }
      if (cmd.type != null && ATYPE[cmd.type]) a.type = cmd.type;
      if (cmd.description != null) a.description = str(cmd.description, 200);
      if (Array.isArray(cmd.subjects)) {
        const subs = cmd.subjects.filter(s => st.subjects.includes(s));
        if (!subs.length) throw bad('حداقل یک درس لازم است');
        a.subjects = subs; st.grades[a.id] = st.grades[a.id] || {};
        subs.forEach(s => st.grades[a.id][s] = st.grades[a.id][s] || {});
        Object.keys(st.grades[a.id]).forEach(s => { if (!subs.includes(s)) delete st.grades[a.id][s]; });
      }
      break;
    }
    case 'asmt.delete': teacher(); st.assessments = st.assessments.filter(a => a.id !== cmd.id); delete st.grades[cmd.id]; break;
    case 'asmt.addSubject': {
      teacher(); const a = st.assessments.find(x => x.id === cmd.id); if (!a) throw bad('ارزشیابی یافت نشد');
      if (!st.subjects.includes(cmd.subject)) throw bad('درس نامعتبر');
      if (!a.subjects.includes(cmd.subject)) a.subjects.push(cmd.subject);
      ((st.grades[a.id] ||= {})[cmd.subject] ||= {});
      break;
    }
    case 'asmt.dropSubject': {
      teacher(); const a = st.assessments.find(x => x.id === cmd.id); if (!a) throw bad('ارزشیابی یافت نشد');
      a.subjects = a.subjects.filter(s => s !== cmd.subject);
      if (st.grades[a.id]) delete st.grades[a.id][cmd.subject];
      break;
    }
    case 'grade.set': teacher(); setGrade(st, cmd.aid, cmd.sub, cmd.sid, cmd.value); break;
    case 'grade.fill': {
      teacher(); const a = st.assessments.find(x => x.id === cmd.aid); if (!a) throw bad('ارزشیابی یافت نشد');
      const col = ((st.grades[a.id] ||= {})[cmd.sub] ||= {});
      if (cmd.value === '__clear') st.students.forEach(s => delete col[s.id]);
      else if (st.meta.gradingMode === 'numeric') st.students.forEach(s => col[s.id] = levelMid(st, cmd.value));
      else { if (!st.levels.some(l => l.key === cmd.value)) throw bad('سطح نامعتبر'); st.students.forEach(s => col[s.id] = cmd.value); }
      break;
    }
    case 'grading.mode': {
      teacher(); const mode = cmd.mode === 'numeric' ? 'numeric' : 'descriptive';
      if (st.meta.gradingMode === mode) break;
      const old = st.meta.gradingMode; st.meta.gradingMode = mode;
      const t = st.meta.numericThresholds;
      for (const aid in st.grades) for (const sub in st.grades[aid]) for (const s in st.grades[aid][sub]) {
        const g = st.grades[aid][sub][s];
        if (mode === 'numeric' && old === 'descriptive') st.grades[aid][sub][s] = levelMid(st, g);
        else if (mode === 'descriptive' && old === 'numeric') {
          const v = Number(en(g));
          if (Number.isFinite(v)) st.grades[aid][sub][s] = v >= t.excellent ? 'excellent' : v >= t.good ? 'good' : v >= t.acceptable ? 'acceptable' : 'needs_effort';
        }
      }
      break;
    }
    /* ---- attendance ---- */
    case 'att.set': {
      teacher(); const d = parseDateAny(cmd.date); if (!d) throw bad('تاریخ نامعتبر');
      if (!stuById(st, cmd.sid)) throw bad('دانش‌آموز یافت نشد');
      const day = (st.attendance[d] ||= {});
      if (cmd.status == null || cmd.status === '') { delete day[cmd.sid]; if (!Object.keys(day).length) delete st.attendance[d]; }
      else { if (!ATT[cmd.status]) throw bad('وضعیت نامعتبر'); day[cmd.sid] = cmd.status; }
      break;
    }
    case 'att.allPresent': {
      teacher(); const d = parseDateAny(cmd.date); if (!d) throw bad('تاریخ نامعتبر');
      const day = (st.attendance[d] ||= {}); st.students.forEach(s => day[s.id] = 'present'); break;
    }
    case 'att.clear': { teacher(); const d = parseDateAny(cmd.date); if (d) delete st.attendance[d]; break; }
    /* ---- discipline ---- */
    case 'disc.add': {
      teacher();
      if (!stuById(st, cmd.sid)) throw bad('دانش‌آموز یافت نشد');
      const d = parseDateAny(cmd.date) || D, p = clamp(Math.round(num(cmd.points) || 0), -10, 10), reason = str(cmd.reason, 140);
      if (!p || !reason) throw bad('امتیاز و دلیل الزامی است');
      st.discipline.push({ id: str(cmd.id, 24) || uid(), sid: cmd.sid, date: d, points: p, reason, by: 'teacher' });
      break;
    }
    case 'disc.delete': teacher(); st.discipline = st.discipline.filter(r => r.id !== cmd.id); break;
    /* ---- news ---- */
    case 'news.add': {
      teacher(); const title = str(cmd.title, 120), body = str(cmd.body, 2000);
      if (!title || !body) throw bad('عنوان و متن الزامی است');
      st.news.push({ id: str(cmd.id, 24) || uid(), title, body, pinned: !!cmd.pinned, date: D }); break;
    }
    case 'news.update': {
      teacher(); const n = st.news.find(x => x.id === cmd.id); if (!n) throw bad('خبر یافت نشد');
      if (cmd.title != null) n.title = str(cmd.title, 120) || n.title;
      if (cmd.body != null) n.body = str(cmd.body, 2000) || n.body;
      if (cmd.pinned != null) n.pinned = !!cmd.pinned;
      break;
    }
    case 'news.pin': { teacher(); const n = st.news.find(x => x.id === cmd.id); if (n) n.pinned = !n.pinned; break; }
    case 'news.delete': teacher(); st.news = st.news.filter(n => n.id !== cmd.id); break;
    /* ---- polls ---- */
    case 'poll.create': {
      teacher();
      const type = PTYPES[cmd.type] ? cmd.type : 'choice', question = str(cmd.question, 180);
      if (!question) throw bad('پرسش الزامی است');
      let options = [], candidates = [];
      if (type === 'election') {
        candidates = [...new Set(cmd.candidates || [])].filter(id => stuById(st, id));
        if (candidates.length < 2) throw bad('حداقل ۲ نامزد لازم است');
        if (!ROLES[cmd.targetRole]) throw bad('سمت نامعتبر');
      } else if (type === 'rating') options = [1, 2, 3, 4, 5].map(n => ({ id: String(n), text: '⭐'.repeat(n) }));
      else if (type === 'yesno') options = [{ id: 'yes', text: 'بله، موافقم' }, { id: 'no', text: 'خیر' }];
      else {
        options = (cmd.options || []).map(o => ({ id: str(o.id, 24) || uid(), text: str(o.text, 90) })).filter(o => o.text).slice(0, 6);
        if (options.length < 2) throw bad('حداقل ۲ گزینه لازم است');
      }
      st.polls.push({ id: str(cmd.id, 24) || uid(), type, question, options, candidates, targetRole: cmd.targetRole || null, status: 'active', showResults: !!cmd.showResults, votes: {}, createdAt: D, applied: false });
      break;
    }
    case 'poll.update': {
      teacher(); const p = st.polls.find(x => x.id === cmd.id); if (!p) throw bad('نظرسنجی یافت نشد');
      if (cmd.question != null) p.question = str(cmd.question, 180) || p.question;
      if (cmd.showResults != null) p.showResults = !!cmd.showResults;
      if (Array.isArray(cmd.options) && p.type !== 'election' && p.type !== 'rating') {
        const opts = cmd.options.map(o => ({ id: str(o.id, 24) || uid(), text: str(o.text, 90) })).filter(o => o.text);
        if (opts.length < 2) throw bad('حداقل ۲ گزینه لازم است');
        p.options = opts;
        const ids = new Set(opts.map(o => o.id));
        for (const k in p.votes) { const v = p.votes[k]; if (Array.isArray(v)) { const f = v.filter(x => ids.has(x)); if (f.length) p.votes[k] = f; else delete p.votes[k]; } else if (!ids.has(v)) delete p.votes[k]; }
      }
      break;
    }
    case 'poll.toggle': { teacher(); const p = st.polls.find(x => x.id === cmd.id); if (p) p.status = p.status === 'active' ? 'closed' : 'active'; break; }
    case 'poll.results': { teacher(); const p = st.polls.find(x => x.id === cmd.id); if (p) p.showResults = !p.showResults; break; }
    case 'poll.delete': teacher(); st.polls = st.polls.filter(p => p.id !== cmd.id); break;
    case 'poll.apply': {
      teacher(); const p = st.polls.find(x => x.id === cmd.id);
      if (!p || p.type !== 'election' || !p.targetRole) throw bad('این نظرسنجی انتخاباتی نیست');
      const { c } = pollCounts(p);
      const winner = [...(p.candidates || [])].sort((a, b) => (c[b] || 0) - (c[a] || 0))[0];
      if (!winner || !(c[winner] > 0)) throw bad('رأیی ثبت نشده است');
      p.applied = true; st.roles[p.targetRole] = winner;
      st.roles.history.push({ role: p.targetRole, sid: winner, date: D, via: 'انتخابات کلاسی' });
      const end = new Date(Date.now() + (st.roles.termWeeks || 4) * 7 * 864e5);
      st.roles.termEnds = iranISO(end);
      result = { winner, votes: c[winner] }; break;
    }
    case 'poll.vote': {
      if (isTeacher(session)) throw forb('رأی‌دهی مخصوص دانش‌آموز است.');
      const p = st.polls.find(x => x.id === cmd.pollId);
      if (!p || p.status !== 'active') throw bad('این نظرسنجی فعال نیست', 'poll_closed');
      if (p.votes?.[sid] !== undefined) throw bad('رأی شما قبلاً ثبت نهایی شده است', 'already_voted');
      p.votes = p.votes || {};
      if (p.type === 'multi') {
        const ids = [...new Set(cmd.optionIds || [])].filter(id => (p.options || []).some(o => o.id === id));
        if (!ids.length) throw bad('حداقل یک گزینهٔ معتبر انتخاب کنید');
        p.votes[sid] = ids;
      } else {
        const ok = p.type === 'election' ? (p.candidates || []).includes(cmd.optionId) : (p.options || []).some(o => o.id === cmd.optionId);
        if (!ok) throw bad('گزینهٔ نامعتبر');
        p.votes[sid] = cmd.optionId;
      }
      break;
    }
    /* ---- quizzes ---- */
    case 'quiz.create':
    case 'quiz.update': {
      teacher();
      const src = cmd.quiz || {};
      const title = str(src.title, 120); if (!title) throw bad('عنوان آزمون الزامی است');
      const startAt = new Date(src.startAt), endAt = new Date(src.endAt);
      if (isNaN(startAt) || isNaN(endAt) || endAt <= startAt) throw bad('ساعت پایان باید بعد از شروع باشد');
      const questions = (src.questions || []).map(q => {
        const opts = (q.options || []).map(o => ({ id: str(o.id, 24) || uid(), text: str(o.text, 160) })).filter(o => o.text);
        const text = str(q.text, 400);
        if (!text || opts.length < 2) throw bad('هر سؤال به متن و حداقل ۲ گزینه نیاز دارد');
        if (!opts.some(o => o.id === q.correctOptionId)) throw bad('گزینهٔ درست همهٔ سؤال‌ها را مشخص کنید');
        return { id: str(q.id, 24) || uid(), text, type: q.type === 'tf' ? 'tf' : 'mcq', options: opts, correctOptionId: q.correctOptionId };
      });
      if (!questions.length) throw bad('حداقل یک سؤال لازم است');
      const patch = {
        title, description: str(src.description, 400), startAt: startAt.toISOString(), endAt: endAt.toISOString(),
        durationMin: clamp(Math.round(num(src.durationMin) || 10), 1, 180),
        negative: !!src.negative, negRatio: [0.25, 0.333, 0.5, 1].includes(Number(src.negRatio)) ? Number(src.negRatio) : 0.333,
        resultsVisible: !!src.resultsVisible, questions
      };
      if (T === 'quiz.create') {
        const id = str(src.id, 24) || uid();
        st.quizzes.push({ id, ...patch, forceClosed: false, submissions: {}, attempts: {} });
        result = { id };
      } else {
        const q = st.quizzes.find(x => x.id === (cmd.id || src.id)); if (!q) throw bad('آزمون یافت نشد');
        Object.assign(q, patch);
      }
      break;
    }
    case 'quiz.delete': teacher(); st.quizzes = st.quizzes.filter(q => q.id !== cmd.id); break;
    case 'quiz.close': { teacher(); const q = st.quizzes.find(x => x.id === cmd.id); if (q) q.forceClosed = true; break; }
    case 'quiz.results': { teacher(); const q = st.quizzes.find(x => x.id === cmd.id); if (q) q.resultsVisible = !q.resultsVisible; break; }
    case 'quiz.start': {
      if (isTeacher(session)) throw forb('شروع آزمون مخصوص دانش‌آموز است.');
      const q = st.quizzes.find(x => x.id === cmd.quizId); if (!q) throw bad('آزمون یافت نشد');
      if (quizStatus(q) !== 'active') throw bad('آزمون در بازهٔ زمانی مجاز نیست', 'quiz_closed');
      if (q.submissions?.[sid]) throw bad('شما قبلاً در این آزمون شرکت کرده‌اید', 'already_submitted');
      q.attempts = q.attempts || {};
      if (!q.attempts[sid]) q.attempts[sid] = { startedAt: new Date().toISOString() };
      result = { startedAt: q.attempts[sid].startedAt }; break;
    }
    case 'quiz.submit': {
      if (isTeacher(session)) throw forb('پاسخ‌دهی مخصوص دانش‌آموز است.');
      const q = st.quizzes.find(x => x.id === cmd.quizId); if (!q) throw bad('آزمون یافت نشد');
      q.submissions = q.submissions || {};
      if (q.submissions[sid]) throw bad('پاسخ شما قبلاً ثبت نهایی شده است', 'already_submitted');
      if (q.forceClosed) throw bad('آزمون پایان یافته است', 'quiz_closed');
      const answers = (cmd.answers && typeof cmd.answers === 'object') ? cmd.answers : {};
      const clean = {};
      for (const qq of q.questions || []) { const a = answers[qq.id]; if (a != null && qq.options.some(o => o.id === a)) clean[qq.id] = a; }
      const res = negScore(q, clean);
      q.submissions[sid] = { answers: clean, ...res, at: new Date().toISOString() };
      result = q.resultsVisible ? { score: res.score, correct: res.correct, wrong: res.wrong, blank: res.blank, raw: res.raw } : null;
      break;
    }
    /* ---- roles & court ---- */
    case 'role.assign': {
      teacher(); if (!ROLES[cmd.role]) throw bad('سمت نامعتبر');
      if (cmd.sid && !stuById(st, cmd.sid)) throw bad('دانش‌آموز یافت نشد');
      st.roles[cmd.role] = cmd.sid || null;
      if (cmd.sid) st.roles.history.push({ role: cmd.role, sid: cmd.sid, date: D, via: 'انتصاب معلم' });
      break;
    }
    case 'role.settings': {
      teacher();
      if (cmd.autoRotate != null) st.roles.autoRotate = !!cmd.autoRotate;
      if (cmd.termWeeks != null) {
        st.roles.termWeeks = clamp(Math.round(num(cmd.termWeeks) || 4), 1, 12);
        st.roles.termEnds = iranISO(new Date(Date.now() + st.roles.termWeeks * 7 * 864e5));
      }
      break;
    }
    case 'role.rotate': {
      teacher();
      const holders = new Set(Object.keys(ROLES).map(k => st.roles[k]).filter(Boolean));
      const ranked = st.students.map(s => ({ id: s.id, sc: smartScore(st, s.id) })).sort((a, b) => b.sc - a.sc);
      const picked = new Set();
      for (const k of Object.keys(ROLES)) {
        const c = ranked.find(x => !holders.has(x.id) && !picked.has(x.id)) || ranked.find(x => !picked.has(x.id));
        if (c) { picked.add(c.id); st.roles[k] = c.id; st.roles.history.push({ role: k, sid: c.id, date: D, via: cmd.via || 'چرخش معلم' }); }
      }
      st.roles.termEnds = iranISO(new Date(Date.now() + (st.roles.termWeeks || 4) * 7 * 864e5));
      break;
    }
    case 'report.create': {
      if (isTeacher(session)) throw forb('ثبت گزارش مخصوص نماینده یا شهردار است.');
      const kind = cmd.kind === 'cleanliness' ? 'cleanliness' : 'discipline';
      needRole(kind === 'cleanliness' ? 'mayor' : 'rep');
      const target = stuById(st, cmd.target);
      if (!target || target.id === sid) throw bad('دانش‌آموز نامعتبر است');
      const title = str(cmd.title, 120), description = str(cmd.description, 1200);
      if (!title || !description) throw bad('عنوان و شرح الزامی است');
      st.reports.push({ id: str(cmd.id, 24) || uid(), type: kind, by: sid, target: target.id, title, description, severity: clamp(Math.round(num(cmd.severity) || 1), 1, 3), date: D, status: 'pending_teacher', teacherNote: '', returns: 0, verdict: null, finalNote: '' });
      break;
    }
    case 'case.approve': {
      teacher(); const r = st.reports.find(x => x.id === cmd.id);
      if (!r || r.status !== 'pending_teacher') throw bad('این پرونده در این مرحله نیست');
      r.status = 'to_judge'; r.teacherNote = 'تأیید معلم در ' + jLabel(D); break;
    }
    case 'case.reject': {
      teacher(); const r = st.reports.find(x => x.id === cmd.id);
      if (!r || r.status !== 'pending_teacher') throw bad('این پرونده در این مرحله نیست');
      r.status = 'rejected'; r.teacherNote = str(cmd.note, 300) || 'گزارش رد شد'; break;
    }
    case 'case.final': {
      teacher(); const r = st.reports.find(x => x.id === cmd.id);
      if (!r || r.status !== 'pending_final' || !r.verdict) throw bad('این پرونده رأی آماده ندارد');
      r.status = 'approved'; r.finalNote = 'ابلاغ در ' + jLabel(D);
      if (r.verdict.type !== 'acquittal' && r.verdict.points < 0)
        st.discipline.push({ id: uid(), sid: r.target, points: r.verdict.points, reason: 'رأی قاضی: ' + r.title, date: D, by: 'court', rid: r.id });
      break;
    }
    case 'case.return': {
      teacher(); const r = st.reports.find(x => x.id === cmd.id);
      if (!r || r.status !== 'pending_final') throw bad('این پرونده در این مرحله نیست');
      r.status = 'to_judge'; r.returns = (r.returns || 0) + 1;
      r.teacherNote = 'برگشت رأی: ' + (str(cmd.note, 300) || 'نیاز به بررسی مجدد'); r.verdict = null; break;
    }
    case 'case.delete': teacher(); st.reports = st.reports.filter(r => r.id !== cmd.id); st.discipline = st.discipline.filter(d => d.rid !== cmd.id); break;
    case 'verdict.submit': {
      if (isTeacher(session)) throw forb('صدور رأی مخصوص قاضی کلاس است.');
      needRole('judge');
      const r = st.reports.find(x => x.id === cmd.rid);
      if (!r || r.status !== 'to_judge') throw bad('این پرونده در مرحلهٔ بررسی نیست');
      const text = str(cmd.text, 1500); if (!text) throw bad('متن رأی الزامی است');
      const vtype = cmd.vtype === 'acquittal' ? 'acquittal' : 'guilty';
      const points = vtype === 'acquittal' ? 0 : clamp(Math.round(num(cmd.points) || 0), -5, 0);
      r.verdict = { by: sid, type: vtype, points, text, date: D };
      r.status = 'pending_final'; break;
    }
    case 'inspect.save': {
      if (isTeacher(session)) throw forb('بازرسی مخصوص شهردار کلاس است.');
      needRole('mayor');
      const items = { board: !!cmd.items?.board, floor: !!cmd.items?.floor, bin: !!cmd.items?.bin, desks: !!cmd.items?.desks };
      const note = str(cmd.note, 400);
      const ex = st.inspections.find(x => x.by === sid && x.date === D);
      if (ex) { ex.items = items; ex.note = note; }
      else st.inspections.push({ id: uid(), by: sid, date: D, items, note });
      break;
    }
    case 'leaderLog.save': {
      if (isTeacher(session)) throw forb('این ثبت مخصوص سرگروه است.');
      const g = st.groups.find(x => x.id === cmd.gid);
      if (!g || g.leader !== sid) throw forb('شما سرگروه این گروه نیستید.');
      if (!(g.members || []).includes(cmd.member) || cmd.member === sid) throw bad('عضو نامعتبر است');
      const homework = HW[cmd.homework] ? cmd.homework : 'done', help = !!cmd.help, note = str(cmd.note, 400);
      const ex = st.leaderLogs.find(l => l.leader === sid && l.member === cmd.member && l.date === D);
      const data = { homework, help, note, points: 1 + (help ? 1 : 0) };
      if (ex) Object.assign(ex, data);
      else st.leaderLogs.push({ id: uid(), gid: g.id, leader: sid, member: cmd.member, date: D, ...data });
      break;
    }
    /* ---- settings / subjects / levels / views ---- */
    case 'settings.patch': {
      teacher();
      const p = String(cmd.path || '');
      if (p.startsWith('studentVisibility.')) {
        const k = p.split('.')[1];
        if (!(k in st.studentVisibility)) throw bad('کلید نامعتبر');
        st.studentVisibility[k] = !!cmd.value; break;
      }
      if (!SETTING_PATHS.includes(p)) throw bad('مسیر تنظیمات مجاز نیست');
      let v = cmd.value;
      if (p === 'meta.appearance.fontScale') v = clamp(Number(v) || 1, .85, 1.3);
      if (p === 'meta.numericMax') v = clamp(Math.round(num(v) || 20), 5, 100);
      if (p === 'meta.numericMin') v = clamp(Math.round(num(v) || 0), 0, 20);
      if (p.startsWith('meta.numericThresholds.')) v = clamp(num(v) || 0, 0, 100);
      if (typeof v === 'string') v = str(v, 120);
      setPath(st, p, v); break;
    }
    case 'teacherCode.set': {
      teacher(); const code = en(str(cmd.code, 12));
      if (!/^\d{4,12}$/.test(code)) throw bad('کد مدیریت باید ۴ تا ۱۲ رقم باشد');
      st.meta.teacherCode = code; break;
    }
    case 'subject.add': {
      teacher(); const name = str(cmd.name, 40);
      if (!name) throw bad('نام درس الزامی است');
      if (st.subjects.includes(name)) throw bad('این درس قبلاً هست');
      st.subjects.push(name); break;
    }
    case 'subject.delete': {
      teacher(); const i = Math.round(num(cmd.index));
      if (!(i >= 0 && i < st.subjects.length)) throw bad('درس نامعتبر');
      const name = st.subjects[i]; st.subjects.splice(i, 1);
      st.assessments.forEach(a => { a.subjects = a.subjects.filter(s => s !== name); });
      for (const aid in st.grades) delete st.grades[aid][name];
      break;
    }
    case 'subject.move': {
      teacher();
      const from = Math.round(num(cmd.from)), to = Math.round(num(cmd.to));
      if (!(from >= 0 && from < st.subjects.length && to >= 0 && to < st.subjects.length)) throw bad('جابه‌جایی نامعتبر');
      const [x] = st.subjects.splice(from, 1); st.subjects.splice(to, 0, x); break;
    }
    case 'level.patch': {
      teacher(); const i = Math.round(num(cmd.index));
      if (!(i >= 0 && i < st.levels.length)) throw bad('سطح نامعتبر');
      const f = cmd.field;
      if (f === 'label') st.levels[i].label = str(cmd.value, 30) || st.levels[i].label;
      else if (f === 'icon') st.levels[i].icon = str(cmd.value, 6) || st.levels[i].icon;
      else if (f === 'color' && /^#[0-9a-f]{6}$/i.test(cmd.value)) st.levels[i].color = cmd.value;
      else throw bad('فیلد نامعتبر');
      break;
    }
    case 'view.save': {
      teacher(); const name = str(cmd.name, 60); if (!name) throw bad('نام نما الزامی است');
      st.savedViews.push({ id: str(cmd.id, 24) || uid(), name, q: str(cmd.q, 60), sort: str(cmd.sort, 20), group: str(cmd.group, 24) });
      if (st.savedViews.length > 20) st.savedViews.shift();
      break;
    }
    case 'view.delete': teacher(); st.savedViews = st.savedViews.filter(v => v.id !== cmd.id); break;
    /* ---- data ---- */
    case 'data.import': {
      teacher();
      const kind = IMP_FIELDS[cmd.kind] ? cmd.kind : null;
      if (!kind) throw bad('نوع داده نامعتبر');
      const rows = Array.isArray(cmd.rows) ? cmd.rows.slice(0, 4000) : [];
      const { ok, err } = normalizeImport(st, kind, rows, cmd.map || {}, !!cmd.create);
      if (!ok.length) throw bad(err[0]?.msg || 'هیچ ردیف معتبری یافت نشد');
      const n = applyImport(st, kind, ok, !!cmd.create);
      result = { applied: n, skipped: err.length }; break;
    }
    case 'data.replace': {
      teacher();
      const incoming = normalize(clone(cmd.state || {}));
      const applied = st._applied.slice(-40);
      Object.keys(st).forEach(k => delete st[k]);
      Object.assign(st, incoming);
      st._applied = applied;
      break;
    }
    case 'data.reset': {
      teacher();
      const fresh = buildSeed(), applied = st._applied.slice(-40);
      Object.keys(st).forEach(k => delete st[k]);
      Object.assign(st, fresh); st._applied = applied;
      break;
    }
    default: throw bad('عملیات ناشناخته: ' + T);
  }
  if (cid) { st._applied.push(cid); if (st._applied.length > 60) st._applied = st._applied.slice(-60); }
  st.schema = SCHEMA;
  return { state: st, result };
}

/* ---------------- export ---------------- */
g.ClassCore = {
  SCHEMA, FA, fa, faNum, en, num, uid, clamp, clone, pad, mean, norm, esc, CPAL,
  ATT, ROLES, RSTAT, HW, PTYPES, ATYPE, JWEEK, JMONTHS, D_REASONS, TIPS, CSV_KINDS, IMP_FIELDS,
  OFFSET, iranISO, iranHM, todayISO, nowHM, Jalali, isoToDate, dateToISO, jOf, jToISO, jShift, jLabel, jShort, jShortEn,
  wdIdx, weekDay, isSchoolDay, monthGrid, parseDateAny, dtLabel, fmtDur,
  buildSeed, normalize, teacherView, filterForStudent, viewFor,
  LMAX, scoreOf, levelIdxOfScore, levelFor, stats, subjectSeries, subjectAvgFor, subjectAvg, smartScore, bestOf,
  groupStats, groupRanks, groupOf, stuById, myRoles, leaderGids, leaderPts, judgePerf, reporterPerf,
  quizStatus, pollCounts, voteText, negScore, pearson, aiStudent, aiClass, audit, classContext,
  serializeCSV, csvRows, parseCSV, autoMap, normalizeImport, applyImport, csvDate,
  applyCommand, CmdError, setGrade, levelMid, moveToGroup, removeStudent
};
})(typeof globalThis !== 'undefined' ? globalThis : this);