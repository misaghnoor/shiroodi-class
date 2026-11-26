/* app.js — رابط کاربری سامانه (سرورمحور + حالت نمایشی همگام) — نسخهٔ امن: بدون هیچ کد معلم در سورس */
'use strict';
const C = globalThis.ClassCore;
const {
fa, faNum, en, num, uid, clamp, clone, pad, mean, norm, esc, CPAL,
ATT, ROLES, RSTAT, HW, PTYPES, ATYPE, JWEEK, JMONTHS, D_REASONS, CSV_KINDS, IMP_FIELDS,
iranISO, iranHM, todayISO, Jalali, isoToDate, dateToISO, jOf, jToISO, jShift, jLabel, jShort, jShortEn,
wdIdx, weekDay, monthGrid, parseDateAny, dtLabel, fmtDur,
buildSeed, normalize, teacherView, filterForStudent, viewFor,
LMAX, scoreOf, levelIdxOfScore, levelFor, stats, subjectSeries, subjectAvgFor, subjectAvg,
smartScore, bestOf, groupStats, groupRanks, groupOf, stuById, myRoles, leaderGids, leaderPts,
judgePerf, reporterPerf, quizStatus, pollCounts, voteText, negScore, aiStudent, aiClass, audit,
serializeCSV, csvRows, parseCSV, autoMap, normalizeImport, applyCommand
} = C;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const tint = (hex, a) => { const h = String(hex).replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
const initials = n => String(n || '؟').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('‌');
const SHORT = { 'مطالعات اجتماعی': 'اجتماعی', 'هدیه‌های آسمانی': 'هدیه‌ها', 'علوم تجربی': 'علوم', 'تربیت بدنی': 'ورزش' };
const shortSub = s => SHORT[s] || s;
const SS = { get(k, d) { try { const v = sessionStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} }, del(k) { try { sessionStorage.removeItem(k); } catch {} } };
const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } }, del(k) { try { localStorage.removeItem(k); } catch {} } };
let ST = null, SESS = null, ROLE = null;
const S = () => ST;
const me = () => ROLE === 'student' ? stuById(ST, SESS.sid) : null;
const isT = () => ROLE === 'teacher';
const UI = {
section: 'dash', loginRole: 'student', attDate: todayISO(), attTab: 'reg', attCal: null, attStu: '',
gradeAid: '', gradeQ: '', stuQ: '', stuSort: 'name', stuGroup: 'all', sel: new Set(),
discFilter: 'all', discQ: '', rolesTab: 'roles', caseFilter: 'inbox', aiStu: '',
run: null, draftQ: null, draftP: null, qCal: null, quizDay: '', repMonth: null,
editNews: null, newsDraft: null, imp: null, jdate: {}, pending: 0, lastSync: 0
};
/* ================= sound ================= */
const Sound = {
ctx: null, on: LS.get('sh_sound', true),
ensure() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } if (this.ctx?.state === 'suspended') this.ctx.resume(); },
tone(f, t0, dur, type = 'sine', vol = .07) { const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .012); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + .05); },
play(k) {
if (!this.on || !k) return; this.ensure(); if (!this.ctx) return;
const t = this.ctx.currentTime;
if (k === 'tap') this.tone(660, t, .07, 'sine', .045);
else if (k === 'pop') this.tone(880, t, .06, 'triangle', .06);
else if (k === 'ok') { this.tone(523, t, .12); this.tone(784, t + .09, .16); }
else if (k === 'err') this.tone(220, t, .18, 'sawtooth', .05);
else if (k === 'win') [523, 659, 784, 1047].forEach((f, i) => this.tone(f, t + i * .09, .16, 'triangle', .06));
else if (k === 'gavel') { this.tone(180, t, .09, 'square', .08); this.tone(140, t + .12, .12, 'square', .07); }
else if (k === 'sync') this.tone(1046, t, .05, 'sine', .03);
}
};
/* ================= backend ================= */
const Net = {
mode: 'demo', online: true, rev: 0, busy: false, lastError: null,
key: 'sh12_state', revKey: 'sh12_rev', chan: null,
async probe() {
if (location.protocol === 'file:') return { mode: 'demo' };
try {
const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 5000);
const r = await fetch('api/login', { signal: ctl.signal, headers: { Accept: 'application/json' } });
clearTimeout(t);
const j = await r.json().catch(() => null);
if (r.ok && j && j.ok) return { mode: 'server', pub: j.public };
} catch {}
return { mode: 'demo' };
},
headers() { const h = { 'Content-Type': 'application/json', Accept: 'application/json' }; if (SESS?.token) h.Authorization = 'Bearer ' + SESS.token; return h; },
async call(path, opts = {}) {
const r = await fetch('api/' + path, { ...opts, headers: this.headers() });
const j = await r.json().catch(() => ({}));
if (!r.ok) { const e = new Error(j.message || 'خطای سرور'); e.status = r.status; e.code = j.error; throw e; }
return j;
},
demoState() { let st = LS.get(this.key, null); if (!st || st.schema !== C.SCHEMA) { st = buildSeed(); LS.set(this.key, st); LS.set(this.revKey, 1); } return normalize(st); },
demoWrite(st) { LS.set(this.key, st); const rev = (LS.get(this.revKey, 0) || 0) + 1; LS.set(this.revKey, rev); this.rev = rev; try { this.chan?.postMessage({ rev }); } catch {} },
async login(code) {
if (this.mode === 'server') return this.call('login', { method: 'POST', body: JSON.stringify({ code }) });
/* 🔒 امنیت: ورود معلم در حالت نمایشی برای همیشه بسته است — هیچ کدی در سورس وجود ندارد */
if (UI.loginRole === 'teacher') { const e = new Error('🔒 ورود معلم فقط با اتصال به سرور ممکن است. اینترنت را وصل کنید و دوباره تلاش کنید.'); e.code = 'demo_teacher_blocked'; throw e; }
const st = this.demoState();
const s = st.students.find(x => x.code === code);
if (!s) throw new Error('کد وارد شده معتبر نیست');
return { token: 'demo-' + uid(), role: 'student', sid: s.id, name: s.name, exp: Date.now() + 432e5 };
},
async state(rev) {
if (this.mode === 'server') return this.call('state' + (rev != null ? '?rev=' + rev : ''));
const st = this.demoState(), r = LS.get(this.revKey, 1) || 1;
this.rev = r;
if (rev != null && rev === r) return { revision: r, changed: false };
return { revision: r, changed: true, state: viewFor(st, SESS), role: SESS.role };
},
async mutate(cmd) {
if (this.mode === 'server') return this.call('mutate', { method: 'POST', body: JSON.stringify({ cmd }) });
const st = this.demoState();
const out = applyCommand(st, cmd, SESS);
this.demoWrite(out.state);
return { revision: this.rev, state: viewFor(out.state, SESS), role: SESS.role, result: out.result };
},
async logout() { if (this.mode === 'server' && SESS?.token) { try { await this.call('logout', { method: 'POST' }); } catch {} } }
};
/* ================= UI primitives ================= */
function toast(msg, type = 'ok', action = null, ms = 5000) {
const box = $('#toasts'); if (!box) return;
const el = document.createElement('div'); el.className = 'toast ' + type;
el.innerHTML = `<span>${type === 'ok' ? '✅' : type === 'err' ? '⚠️' : '💡'}</span><span style="flex:1">${esc(msg)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}<span class="tb" style="animation-duration:${ms}ms"></span>`;
const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); };
if (action) el.querySelector('button').addEventListener('click', () => { action.cb(); kill(); });
box.appendChild(el); setTimeout(kill, ms);
while (box.children.length > 4) box.firstChild.remove();
}
let MODAL_OK = null;
function openModal(html) { const w = $('#modalWrap'); $('#modalBox').innerHTML = html; w.classList.remove('hidden'); requestAnimationFrame(() => w.classList.add('open')); }
function closeModal() { const w = $('#modalWrap'); w.classList.remove('open'); setTimeout(() => w.classList.add('hidden'), 260); MODAL_OK = null; }
function confirmDlg({ title, body, okText = 'تأیید', danger = false, onOk }) {
MODAL_OK = onOk;
openModal(`<h3>${esc(title)}</h3><div class="mbody">${esc(body)}</div><div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-act="modalClose">انصراف</button><button type="button" class="btn ${danger ? 'danger' : ''}" data-act="modalOk">${esc(okText)}</button></div>`);
}
function promptDlg({ title, placeholder = '', value = '', onOk }) {
MODAL_OK = () => { const v = $('#promptInput').value.trim(); if (v) onOk(v); };
openModal(`<h3>${esc(title)}</h3><div class="mbody"><input class="input" id="promptInput" value="${esc(value)}" placeholder="${esc(placeholder)}"></div><div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-act="modalClose">انصراف</button><button type="button" class="btn" data-act="modalOk">ذخیره</button></div>`);
setTimeout(() => $('#promptInput')?.focus(), 80);
}
function openDrawer(title, html, wide = false) {
$('#drawerTitle').textContent = title; $('#drawerBody').innerHTML = html;
$('#drawer').classList.toggle('wide', wide);
const w = $('#drawerWrap'); w.classList.remove('hidden');
requestAnimationFrame(() => w.classList.add('open'));
document.body.style.overflow = 'hidden'; $('#drawerBody').scrollTop = 0;
}
function closeDrawer() { const w = $('#drawerWrap'); w.classList.remove('open'); setTimeout(() => w.classList.add('hidden'), 320); document.body.style.overflow = ''; }
function openPop(anchor, html) {
const p = $('#pop'); p.innerHTML = html; p.classList.remove('hidden');
const r = anchor.getBoundingClientRect(), pw = p.offsetWidth, ph = p.offsetHeight;
const x = clamp(r.left + r.width / 2 - pw / 2, 8, innerWidth - pw - 8);
let y = r.bottom + 8; if (y + ph > innerHeight - 8) y = Math.max(8, r.top - ph - 8);
p.style.left = x + 'px'; p.style.top = y + 'px';
}
const closePop = () => $('#pop').classList.add('hidden');
function syncStatus(state, text) {
const el = $('#sync'); if (!el) return;
el.classList.toggle('busy', state === 'busy'); el.classList.toggle('err', state === 'err');
$('#syncTxt').textContent = text;
$('#offline').classList.toggle('hidden', Net.online);
}
/* ================= mutation pipeline ================= */
async function send(type, payload, patch, opts = {}) {
if (!Net.online && Net.mode === 'server') { toast('اتصال به سرور برقرار نیست؛ تغییر ثبت نشد.', 'err', { label: 'تلاش مجدد', cb: () => send(type, payload, patch, opts) }, 8000); return null; }
const before = clone(ST);
const cmd = { type, cid: uid(), ...payload };
if (patch) { try { patch(ST); } catch (e) { console.warn('patch', e); } render(true); }
UI.pending++; syncStatus('busy', 'در حال ثبت…');
try {
const r = await Net.mutate(cmd);
ST = r.state; Net.rev = r.revision; Net.online = true; Net.lastError = null; UI.lastSync = Date.now();
render(true);
if (opts.msg) toast(opts.msg, 'ok');
Sound.play(opts.sound === undefined ? 'ok' : opts.sound);
if (opts.undo && isT()) {
toast(opts.msg || 'تغییر اعمال شد', 'ok', {
label: 'بازگردانی', cb: async () => {
try { const rr = await Net.mutate({ type: 'data.replace', cid: uid(), state: before }); ST = rr.state; Net.rev = rr.revision; render(true); toast('بازگردانی شد', 'ok'); }
catch (e) { toast('بازگردانی ناموفق: ' + e.message, 'err'); }
}
}, 9000);
}
return r.result;
} catch (e) {
ST = before; render(true);
if (e.status === 401) { SS.del('sh12_sess'); toast('نشست منقضی شده است؛ دوباره وارد شوید.', 'err'); setTimeout(() => location.reload(), 1200); return null; }
if (e.status === 0 || e.message === 'Failed to fetch') { Net.online = false; syncStatus('err', 'آفلاین'); }
toast(e.message || 'ثبت تغییر ناموفق بود', 'err', { label: 'تلاش مجدد', cb: () => send(type, payload, patch, opts) }, 9000);
Sound.play('err');
return null;
} finally {
UI.pending = Math.max(0, UI.pending - 1);
if (!UI.pending) syncStatus(Net.online ? '' : 'err', Net.online ? (Net.mode === 'server' ? 'همگام با سرور' : 'نمایشی همگام') : 'آفلاین');
}
}
async function pull(force = false) {
if (!SESS || Net.busy) return;
Net.busy = true;
try {
const r = await Net.state(force ? null : Net.rev);
Net.online = true;
if (r.changed) {
const had = Net.rev;
ST = r.state; Net.rev = r.revision; UI.lastSync = Date.now();
render(true);
if (had && !force) Sound.play('sync');
}
if (!UI.pending) syncStatus('', Net.mode === 'server' ? 'همگام با سرور' : 'نمایشی همگام');
} catch (e) {
if (e.status === 401) { SS.del('sh12_sess'); toast('نشست پایان یافت؛ دوباره وارد شوید.', 'err'); setTimeout(() => location.reload(), 1000); }
else { Net.online = false; syncStatus('err', 'آفلاین'); }
} finally { Net.busy = false; }
}
/* ================= appearance & shell ================= */
function applyAppearance() {
const ap = S()?.meta?.appearance || {};
const root = document.documentElement;
root.dataset.accent = ap.accent || 'teal';
root.dataset.theme = LS.get('sh_theme', null) || ap.theme || 'light';
root.dataset.density = ap.density || 'cozy';
root.dataset.font = ap.font || 'vazirmatn';
root.style.fontSize = (16 * clamp(ap.fontScale || 1, .85, 1.3)) + 'px';
document.body.classList.toggle('no-pattern', ap.pattern === false);
document.body.classList.toggle('no-anim', ap.anim === false);
const tb = $('#themeBtn'); if (tb) tb.textContent = root.dataset.theme === 'dark' ? '☀️' : '🌙';
const sb = $('#soundBtn'); if (sb) sb.textContent = Sound.on ? '🔊' : '🔇';
}
function navItems() {
if (isT()) return [['dash', '🏠', 'داشبورد'], ['students', '👦', 'دانش‌آموزان'], ['attendance', '📅', 'حضور و غیاب'], ['grades', '📝', 'ارزشیابی'], ['ai', '🧠', 'تحلیل هوشمند'], ['discipline', '⭐', 'انضباط'], ['groups', '🧩', 'گروه‌ها و سرگروه'], ['roles', '🏛️', 'مسئولیت‌ها و دادگاه'], ['polls', '🗳️', 'نظرسنجی و انتخابات'], ['quizzes', '🧠', 'آزمون زمان‌دار'], ['news', '📢', 'اخبار'], ['reports', '🖨️', 'گزارش و چاپ A4'], ['data', '🔄', 'ورود و خروج CSV'], ['settings', '⚙️', 'تنظیمات']];
const sid = SESS.sid, vis = S().studentVisibility || {};
const items = [['report', '🎓', 'کارنامه من'], ['ai', '🧠', 'تحلیل هوشمند من'], ['attendance', '📅', 'حضور من']];
if (vis.discipline !== false) items.push(['myCourt', '⚖️', 'احکام و انضباط']);
for (const r of myRoles(S(), sid)) items.push([ROLES[r].panel, ROLES[r].icon, ROLES[r].label.replace(' کلاس', '') + ' — پنل من']);
if (leaderGids(S(), sid).length) items.push(['leaderPanel', '🏅', 'پنل سرگروهی']);
if (vis.group !== false) items.push(['group', '🧩', 'گروه من']);
if (vis.polls !== false) items.push(['polls', '🗳️', 'نظرسنجی‌ها']);
if (vis.quizzes !== false) items.push(['quizzes', '🧠', 'آزمون‌ها']);
if (vis.news !== false) items.push(['news', '📢', 'اخبار کلاس']);
return items;
}
function renderSidebar() {
const items = navItems(), st = S();
const marked = !!st.attendance?.[todayISO()];
const activeQ = (st.quizzes || []).filter(q => quizStatus(q) === 'active').length;
const judgeInbox = (st.reports || []).filter(r => r.status === 'to_judge').length;
const tInbox = (st.reports || []).filter(r => r.status === 'pending_teacher' || r.status === 'pending_final').length;
$('#sidebar').innerHTML = items.map(([key, icon, label]) => {
let extra = '';
if (isT() && key === 'attendance' && !marked) extra = '<span class="nd" title="حضور امروز ثبت نشده"></span>';
if (isT() && key === 'roles' && tInbox) extra = `<span class="nb">${fa(tInbox)}</span>`;
if (key === 'judgePanel' && judgeInbox) extra = `<span class="nb">${fa(judgeInbox)}</span>`;
if (key === 'quizzes' && activeQ) extra = `<span class="nb">${fa(activeQ)}</span>`;
return `<button type="button" class="nav ${UI.section === key ? 'on' : ''}" data-act="nav" data-sec="${key}"><span class="ni">${icon}</span>${esc(label)}${extra}</button>`;
}).join('') + `<div class="sfoot"><b>${esc(st.meta.school)}</b><br>${esc(st.meta.className)} • ${esc(st.meta.year)}<br>معلم: ${esc(st.meta.teacher)}<br><span style="opacity:.75">${Net.mode === 'server' ? '🟢 دادهٔ مشترک سرور' : '🟡 حالت نمایشی — تب‌ها همگام‌اند'}</span></div>`;
}
function updateTopbar() {
$('#topSchool').textContent = S().meta.school;
$('#userName').textContent = SESS.name || '';
$('#userRole').textContent = isT() ? '👨‍🏫 معلم' : ((myRoles(S(), SESS.sid).map(r => ROLES[r].icon).join('') + (leaderGids(S(), SESS.sid).length ? '🏅' : '')) || '👦') + ' دانش‌آموز';
const m = me();
$('#userAv').outerHTML = isT() ? '<span class="av sm" id="userAv">👨‍🏫</span>' : avHTML(m, 'sm').replace('class="av sm"', 'class="av sm" id="userAv"');
}
function focusSig() {
const el = document.activeElement;
if (!el || !el.matches?.('input,textarea,select')) return null;
const attr = el.dataset.inp ? 'data-inp' : el.dataset.chg ? 'data-chg' : el.name ? 'name' : el.id ? 'id' : null;
if (!attr) return null;
const key = attr === 'data-inp' ? el.dataset.inp : attr === 'data-chg' ? el.dataset.chg : attr === 'name' ? el.name : el.id;
let start = null, end = null;
try { start = el.selectionStart; end = el.selectionEnd; } catch {}
return { attr, key, ds: { ...el.dataset }, start, end };
}
function restoreFocus(sig) {
if (!sig) return;
const list = $$(`[${sig.attr}="${CSS.escape(sig.key)}"]`);
const el = list.find(x => Object.entries(sig.ds).every(([k, v]) => x.dataset[k] === v));
if (!el) return;
el.focus({ preventScroll: true });
if (sig.start != null) { try { el.setSelectionRange(sig.start, sig.end); } catch {} }
}
function render(keep = true) {
if (!ST || !SESS) return;
const sig = focusSig(), y = window.scrollY;
renderSidebar(); updateTopbar(); renderView();
if (keep) window.scrollTo(0, y);
restoreFocus(sig);
}
function renderView() {
const v = $('#view');
try {
const map = isT()
? { dash: V.dash, students: V.students, attendance: V.attendance, grades: V.grades, ai: V.ai, discipline: V.discipline, groups: V.groups, roles: V.roles, polls: V.polls, quizzes: V.quizzes, news: V.news, reports: V.reports, data: V.data, settings: V.settings }
: { report: V.report, ai: V.ai, attendance: V.myAttendance, myCourt: V.myCourt, group: V.myGroup, polls: V.polls, quizzes: V.quizzes, news: V.news, judgePanel: V.judgePanel, mayorPanel: V.mayorPanel, repPanel: V.repPanel, leaderPanel: V.leaderPanel };
const fn = map[UI.section] || Object.values(map)[0];
v.innerHTML = `<div class="ve">${fn()}</div>`;
} catch (e) {
console.error(e);
v.innerHTML = empty('🛠️', 'خطایی در نمایش رخ داد', 'صفحه را دوباره بارگذاری کنید.', '<button type="button" class="btn" data-act="reload">بارگذاری مجدد</button>');
}
}
function setSection(sec) {
if (UI.run && sec !== 'quizzes') { confirmDlg({ title: 'آزمون در جریان است', body: 'با خروج، پاسخ‌های فعلی ارسال نهایی می‌شود.', okText: 'ارسال و خروج', onOk: () => { finalizeRun(true); UI.section = sec; render(); } }); return; }
UI.section = sec; closeDrawer(); closePop(); document.body.classList.remove('side-open');
render(false); window.scrollTo({ top: 0, behavior: 'smooth' });
}
const pageHead = (title, sub, actions = '') => `<div class="page-head spread"><div><h1>${title}</h1><p>${sub}</p></div><div class="row">${actions}</div></div>`;
const empty = (icon, title, sub, action = '') => `<div class="empty"><span class="ei">${icon}</span><h3>${esc(title)}</h3><p class="small">${esc(sub)}</p>${action ? `<div class="mt">${action}</div>` : ''}</div>`;
function avHTML(s, cls = '') { if (!s) return `<span class="av ${cls}">؟</span>`; return s.avatar ? `<span class="av ${cls}"><img src="${s.avatar}" alt=""></span>` : `<span class="av ${cls}">${esc(initials(s.name))}</span>`; }
function statOf(sid) {
if (isT() || sid === SESS.sid) return stats(S(), sid);
return S().aggregates?.peerStats?.[sid] || null;
}
const subAvgOf = sub => isT() ? subjectAvg(S(), sub) : (S().aggregates?.subjectAvgs?.[sub] || 0);
/* ================= charts ================= */
function bars(items, { max = 100, fmt = v => fa(Math.round(v)) + '٪' } = {}) {
if (!items.length) return empty('📊', 'داده‌ای نیست', 'پس از ثبت نمره، نمودارها نمایش داده می‌شوند.');
return items.map((it, i) => `<div class="bar-row"><span class="bar-label" title="${esc(it.label)}">${esc(it.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${clamp(it.value / max * 100, 0, 100)}%;background:linear-gradient(90deg,${tint(it.color || CPAL[i % 8], .7)},${it.color || CPAL[i % 8]})"></div>${it.mark != null ? `<span class="bar-mark" style="right:${clamp(it.mark / max * 100, 0, 100)}%" title="میانگین کلاس"></span>` : ''}</div><span class="bar-val" style="color:${it.color || CPAL[i % 8]}">${fmt(it.value)}</span></div>`).join('');
}
function donut(segs, { size = 150, thick = 17, center = '', sub = '' } = {}) {
const total = segs.reduce((a, s) => a + s.value, 0), r = (size - thick) / 2, c = 2 * Math.PI * r;
let off = 0;
const circles = total ? segs.filter(s => s.value > 0).map(s => {
const dash = s.value / total * c;
const el = `<circle r="${r}" cx="${size / 2}" cy="${size / 2}" fill="none" stroke="${s.color}" stroke-width="${thick}" stroke-dasharray="${dash} ${c - dash}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size / 2} ${size / 2})"><title>${esc(s.label)}: ${fa(s.value)}</title></circle>`;
off += dash; return el;
}).join('') : `<circle r="${r}" cx="${size / 2}" cy="${size / 2}" fill="none" stroke="var(--line)" stroke-width="${thick}"/>`;
return `<div class="donut" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${circles}</svg><div class="donut-c"><b>${center}</b><span>${sub}</span></div></div>`;
}
function lineChart(vals, labels, { h = 210, color = 'var(--acc)', max = 100 } = {}) {
if (!vals.length) return empty('📈', 'داده‌ای نیست', 'پس از ثبت داده، روند رسم می‌شود.');
const w = 640, p = 34, n = vals.length, gid = 'g' + uid();
const X = i => p + (w - 2 * p) * (n === 1 ? .5 : i / (n - 1)), Y = v => h - p - (h - 2 * p) * clamp(v, 0, max) / max;
const pts = vals.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
const area = `M${X(0)},${Y(vals[0])} ` + vals.map((v, i) => `L${X(i)},${Y(v)}`).join(' ') + ` L${X(n - 1)},${h - p} L${X(0)},${h - p} Z`;
const grid = [0, .25, .5, .75, 1].map(k => `<line x1="${p}" x2="${w - p}" y1="${Y(k * max)}" y2="${Y(k * max)}" stroke="var(--line)" stroke-dasharray="${k === 0 ? '0' : '4 5'}"/><text x="${p - 6}" y="${Y(k * max) + 4}" font-size="10" fill="var(--muted)" text-anchor="end">${faNum(k * max, k * max % 1 ? 1 : 0)}</text>`).join('');
const step = Math.max(1, Math.ceil(n / 7));
const xl = labels.map((l, i) => i % step === 0 || i === n - 1 ? `<text x="${X(i)}" y="${h - 8}" font-size="10" fill="var(--muted)" text-anchor="middle">${esc(l)}</text>` : '').join('');
const dots = vals.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3.4" fill="${color}" stroke="var(--surface)" stroke-width="2"><title>${esc(labels[i])}: ${faNum(v)}</title></circle>`).join('');
return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".3"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#${gid})"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${dots}${xl}</svg>`;
}
function radar(items, { size = 280, max = 4 } = {}) {
const n = items.length;
if (n < 3) return bars(items.map((x, i) => ({ label: shortSub(x.label), value: x.value / max * 100, color: CPAL[i % 8], mark: (x.classValue || 0) / max * 100 })), { fmt: v => faNum(v / 100 * max) });
const cx = size / 2, cy = size / 2, R = size / 2 - 44;
const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
const poly = vals => vals.map((v, i) => pt(i, R * clamp(v, 0, max) / max).map(x => x.toFixed(1)).join(',')).join(' ');
let grid = '';
for (let k = 1; k <= max; k++) grid += `<polygon points="${poly(items.map(() => k))}" fill="none" stroke="var(--line)"/>`;
let axes = '', labels = '';
items.forEach((it, i) => {
const [x, y] = pt(i, R); axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)"/>`;
const [lx, ly] = pt(i, R + 20), a = -Math.PI / 2 + i * 2 * Math.PI / n;
const anchor = Math.abs(Math.cos(a)) < .25 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
labels += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" font-size="11" font-weight="700" fill="var(--muted)" text-anchor="${anchor}">${esc(shortSub(it.label))}</text>`;
});
const dots = items.map((it, i) => { const [x, y] = pt(i, R * clamp(it.value, 0, max) / max); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="var(--acc)" stroke="var(--surface)" stroke-width="1.6"><title>${esc(it.label)}: ${faNum(it.value)}</title></circle>`; }).join('');
return `<svg viewBox="0 0 ${size} ${size}" style="width:100%;max-width:${size}px;height:auto;display:block;margin:auto">${grid}${axes}<polygon points="${poly(items.map(x => x.classValue || 0))}" fill="${tint('#7b7261', .12)}" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="5 4"/><polygon points="${poly(items.map(x => x.value))}" fill="${tint('#0d9488', .26)}" stroke="var(--acc)" stroke-width="2.6"/>${dots}${labels}</svg>`;
}
function spark(vals, color) {
if (vals.length < 2) return '';
const w = 92, h = 26, mn = Math.min(...vals), mx = Math.max(...vals), rg = mx - mn || 1;
const pts = vals.map((v, i) => `${4 + (w - 8) * i / (vals.length - 1)},${h - 4 - (h - 8) * (v - mn) / rg}`).join(' ');
return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/></svg>`;
}
function gradeBadge(g) {
const l = levelFor(S(), g); if (!l) return '<span class="chip">—</span>';
const val = S().meta.gradingMode === 'numeric' ? faNum(Number(en(g)), Number(en(g)) % 1 ? 1 : 0) : l.label;
return `<span class="badge" style="background:${tint(l.color, .13)};color:${l.color};border:1px solid ${tint(l.color, .35)}">${l.icon} ${esc(val)}</span>`;
}
function avgBadge(avg) {
if (!avg) return '<span class="chip">بدون نمره</span>';
const st = S();
if (st.meta.gradingMode === 'numeric') return `<span class="badge" style="background:${tint('#0d9488', .12)};color:#0d9488">📊 ${faNum(avg / LMAX(st) * (st.meta.numericMax || 20))}</span>`;
const l = st.levels[levelIdxOfScore(st, avg)];
return `<span class="badge" style="background:${tint(l.color, .13)};color:${l.color};border:1px solid ${tint(l.color, .35)}">${l.icon} ${esc(l.label)}</span>`;
}
/* ================= views: teacher ================= */
const V = {};
V.dash = function () {
const st = S(), ai = aiClass(st), wg = ai.wg;
const classAvg = wg.length ? mean(wg.map(s => s.avg)) : 0;
const dates = Object.keys(st.attendance || {}).sort();
const last = dates[dates.length - 1], dayRec = st.attendance?.[last] || {};
const dv = Object.values(dayRec);
const lastRate = dv.length ? Math.round(dv.filter(v => v === 'present' || v === 'late').length / dv.length * 100) : null;
const trend = dates.slice(-14).map(d => { const v = Object.values(st.attendance[d]); return v.length ? v.filter(x => x === 'present' || x === 'late').length / v.length * 100 : 0; });
const trendLabels = dates.slice(-14).map(d => { const j = jOf(d); return `${fa(j.jd)} ${JMONTHS[j.jm - 1].slice(0, 4)}`; });
const subjItems = st.subjects.map((sub, i) => ({ label: shortSub(sub), value: subjectAvg(st, sub) / LMAX(st) * 100, color: CPAL[i % 8], has: subjectAvg(st, sub) > 0 })).filter(x => x.has);
const dist = st.levels.map(l => ({ label: l.label, color: l.color, value: 0 }));
for (const aid in st.grades) for (const sub in st.grades[aid]) for (const sid in st.grades[aid][sub]) {
const l = levelFor(st, st.grades[aid][sub][sid]); const i = l ? st.levels.indexOf(l) : -1; if (i > -1) dist[i].value++;
}
const top = [...wg].sort((a, b) => b.avg - a.avg).slice(0, 5);
const inbox = (st.reports || []).filter(r => r.status === 'pending_teacher' || r.status === 'pending_final');
const pinned = (st.news || []).find(n => n.pinned);
const roleCards = Object.entries(ROLES).map(([k, r]) => {
const s = stuById(st, st.roles[k]);
const perf = k === 'judge' ? judgePerf(st, st.roles[k]) : reporterPerf(st, st.roles[k]);
return `<div class="card rcard" style="--rc:${r.color}"><div class="row"><span class="ri">${r.icon}</span><div style="flex:1"><b class="small">${r.label}</b>${s ? `<div class="row" style="gap:7px">${avHTML(s, 'sm')}<span class="small bold">${esc(s.name)}</span></div>` : '<div class="small muted">منصوب نشده — از بخش مسئولیت‌ها انتخاب کنید</div>'}</div>${s ? `<span class="badge" style="background:${tint(r.color, .13)};color:${r.color}">⭐ ${fa(perf.score)}</span>` : ''}</div></div>`;
}).join('');
return pageHead(`سلام، ${esc(st.meta.teacher)} 👋`, `${weekDay(todayISO())} ${jLabel(todayISO())} — آخرین دادهٔ ثبت‌شده: ${last ? jLabel(last) : '—'}`,
`<button type="button" class="btn sm" data-act="nav" data-sec="attendance">📅 ثبت حضور امروز</button><button type="button" class="btn sm ai" data-act="nav" data-sec="ai">🧠 تحلیل هوشمند</button><button type="button" class="btn sm soft" data-act="asmtNew">📝 ارزشیابی</button>`) +
`<div class="grid g4 stagger mb">
<div class="card stat" style="--i:0"><span class="si" style="background:linear-gradient(135deg,#0d9488,#1d4ed8)">👦</span><div><b>${fa(st.students.length)}</b><span>دانش‌آموز • ${fa(st.groups.length)} گروه</span></div></div>
<div class="card stat" style="--i:1"><span class="si" style="background:linear-gradient(135deg,#16a34a,#84cc16)">📅</span><div><b>${lastRate == null ? '—' : fa(lastRate) + '٪'}</b><span>حضور ${last ? jShort(last) : '—'} (${fa(dates.length)} روز)</span></div></div>
<div class="card stat" style="--i:2"><span class="si" style="background:linear-gradient(135deg,#f59e0b,#e11d48)">📝</span><div><b>${fa(st.assessments.length)}</b><span>ارزشیابی • ${fa(ai.graded)} نمره</span></div></div>
<div class="card stat" style="--i:3"><span class="si" style="background:linear-gradient(135deg,#7c3aed,#0ea5e9)">🧠</span><div><b>${wg.length ? avgBadge(classAvg) : '—'}</b><span>میانگین کلاس</span></div></div>
</div>
<div class="card aihero mb"><div class="spread mb"><div class="row"><span class="aib">🧠 تحلیلگر هوشمند کلاس</span><b>خلاصهٔ وضعیت یادگیری</b></div><button type="button" class="btn sm ai" data-act="nav" data-sec="ai">گزارش کامل ←</button></div>
<div class="grid g2">${ai.insights.slice(0, 4).map(x => `<div class="ins ${x.t}"><span class="ii">${x.i}</span><span>${esc(x.text)}</span></div>`).join('')}</div></div>
<div class="grid g3 mb stagger">${roleCards}</div>
<div class="grid g2 mb">
<div class="card"><div class="spread mb"><h3>📈 روند حضور کلاس</h3><span class="chip">${fa(trend.length)} روز اخیر</span></div>${lineChart(trend, trendLabels)}</div>
<div class="card"><div class="spread mb"><h3>📚 میانگین دروس</h3><span class="chip acc">${st.meta.gradingMode === 'numeric' ? 'عددی' : 'توصیفی'}</span></div>${bars(subjItems, { fmt: v => faNum(v / 100 * LMAX(st)) })}</div>
</div>
<div class="grid g3">
<div class="card"><h3 class="mb">🎯 توزیع سطوح</h3><div class="row" style="justify-content:center;gap:18px">${donut(dist, { center: fa(dist.reduce((a, b) => a + b.value, 0)), sub: 'نمرهٔ ثبت‌شده' })}<div class="legend">${dist.map(d => `<div class="li"><span class="dot" style="background:${d.color}"></span>${esc(d.label)}<b style="margin-inline-start:auto">${fa(d.value)}</b></div>`).join('')}</div></div></div>
<div class="card"><h3 class="mb">🏆 برترین‌های کلاس</h3>${top.map((s, i) => `<div class="row" style="padding:7px 0;border-bottom:1px dashed var(--line)"><span style="width:24px">${['🥇', '🥈', '🥉', '🏅', '🏅'][i]}</span>${avHTML(s, 'sm')}<button type="button" class="bold small" style="flex:1;border:none;background:none;color:var(--ink);text-align:right" data-act="stuDetail" data-id="${s.id}">${esc(s.name)}</button>${avgBadge(s.avg)}</div>`).join('')}</div>
<div class="card"><h3 class="mb">🚨 نیازمند توجه</h3>${ai.atRisk.length ? ai.atRisk.slice(0, 5).map(a => { const s = stuById(st, a.sid); return `<div class="row" style="padding:7px 0;border-bottom:1px dashed var(--line)">${avHTML(s, 'sm')}<button type="button" class="small bold" style="flex:1;border:none;background:none;color:var(--ink);text-align:right" data-act="aiOpen" data-id="${a.sid}">${esc(s.name)}</button><span class="badge" style="background:${tint(a.riskLevel.c, .13)};color:${a.riskLevel.c}">${a.riskLevel.i} ${fa(a.risk)}</span></div>`; }).join('') : empty('🌿', 'کلاس پایدار است', 'هیچ دانش‌آموزی در وضعیت پرخطر نیست.')}
${inbox.length ? `<div class="divider"></div><button type="button" class="btn sm warn" data-act="nav" data-sec="roles">📨 ${fa(inbox.length)} پرونده در انتظار شما</button>` : ''}</div>
</div>
${pinned ? `<div class="card mt hero"><div class="row"><span style="font-size:1.5rem">📌</span><div style="flex:1"><b>${esc(pinned.title)}</b><p class="small muted" style="white-space:pre-wrap">${esc(pinned.body)}</p></div><span class="chip">${jLabel(pinned.date)}</span></div></div>` : ''}`;
};
V.students = function () {
const st = S();
return pageHead('👦 دانش‌آموزان', `${fa(st.students.length)} نفر • جستجو، فیلتر، مرتب‌سازی، نمای ذخیره‌شده و کارنامهٔ A4`,
`<button type="button" class="btn sm soft" data-act="nav" data-sec="data">📥 ورود CSV</button><button type="button" class="btn sm" data-act="stuAdd">➕ دانش‌آموز</button>`) +
`<div class="card mb"><div class="row" style="gap:10px">
<input class="input" style="max-width:230px" placeholder="🔍 جستجوی نام یا کد…" value="${esc(UI.stuQ)}" data-inp="stuQ">
<select class="select" style="max-width:170px" data-chg="stuGroup"><option value="all">همهٔ گروه‌ها</option><option value="none" ${UI.stuGroup === 'none' ? 'selected' : ''}>بدون گروه</option>${st.groups.map(g => `<option value="${g.id}" ${UI.stuGroup === g.id ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select>
<select class="select" style="max-width:190px" data-chg="stuSort">${[['name', 'مرتب‌سازی: نام'], ['avg', 'بیشترین میانگین'], ['att', 'بیشترین حضور'], ['pts', 'بیشترین امتیاز'], ['smart', 'شایستگی کلی'], ['risk', 'بیشترین ریسک']].map(([v, l]) => `<option value="${v}" ${UI.stuSort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
<select class="select" style="max-width:180px" data-chg="viewApply"><option value="">📁 نماهای ذخیره‌شده…</option>${st.savedViews.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('')}</select>
<button type="button" class="btn sm ghost" data-act="viewSave">💾 ذخیرهٔ نما</button>
</div></div><div id="stuWrap">${stuList()}</div>`;
};
function stuFiltered() {
const st = S();
let list = st.students.map(s => ({ ...s, ...stats(st, s.id) }));
const q = norm(UI.stuQ);
if (q) { const qn = en(UI.stuQ); list = list.filter(s => norm(s.name).includes(q) || s.code.includes(qn)); }
if (UI.stuGroup !== 'all') list = list.filter(s => { const g = groupOf(st, s.id); return UI.stuGroup === 'none' ? !g : g?.id === UI.stuGroup; });
const riskOf = id => aiStudent(st, id)?.risk || 0;
const sorts = { name: (a, b) => a.name.localeCompare(b.name, 'fa'), avg: (a, b) => b.avg - a.avg, att: (a, b) => b.attRate - a.attRate, pts: (a, b) => b.pts - a.pts, smart: (a, b) => smartScore(st, b.id) - smartScore(st, a.id), risk: (a, b) => riskOf(b.id) - riskOf(a.id) };
return list.sort(sorts[UI.stuSort] || sorts.name);
}
function stuList() {
const st = S(), list = stuFiltered(), sel = UI.sel;
const bulk = sel.size ? `<div class="card mb" style="border-color:var(--acc)"><div class="row"><b class="small">${fa(sel.size)} نفر انتخاب شده</b>
<select class="select" style="max-width:180px" data-chg="bulkGroup"><option value="">انتقال به گروه…</option><option value="none">حذف از گروه</option>${st.groups.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select>
<button type="button" class="btn sm soft" data-act="bulkCSV">📤 CSV انتخاب‌شده‌ها</button>
<button type="button" class="btn sm danger" data-act="bulkDel">🗑 حذف</button>
<button type="button" class="btn sm ghost" data-act="bulkClear">✕ لغو</button></div></div>` : '';
if (!list.length) return bulk + `<div class="card">${empty('🔍', 'موردی یافت نشد', 'عبارت جستجو یا فیلتر را تغییر دهید.')}</div>`;
const roleIcons = sid => myRoles(st, sid).map(r => ROLES[r].icon).join('') + (st.groups.some(g => g.leader === sid) ? '🏅' : '');
const rows = list.map(s => {
const g = groupOf(st, s.id);
return `<tr>
<td><input type="checkbox" class="cb" data-chg="stuSel" data-id="${s.id}" ${sel.has(s.id) ? 'checked' : ''}></td>
<td><div class="row" style="gap:9px;flex-wrap:nowrap">${avHTML(s, 'sm')}<button type="button" class="bold small" style="border:none;background:none;color:var(--ink)" data-act="stuDetail" data-id="${s.id}">${esc(s.name)}</button><span class="small">${roleIcons(s.id)}</span></div></td>
<td><span class="chip mono">${fa(s.code)}</span></td>
<td>${g ? `<span class="chip" style="background:${tint(g.color, .12)};color:${g.color}">${esc(g.name)}</span>` : '<span class="chip">—</span>'}</td>
<td>${s.cnt ? avgBadge(s.avg) : '<span class="chip">—</span>'}</td>
<td><b style="color:${s.attRate >= 90 ? '#16a34a' : s.attRate >= 75 ? '#f59e0b' : '#e11d48'}">${s.total ? fa(s.attRate) + '٪' : '—'}</b></td>
<td><b style="color:${s.pts >= 0 ? '#16a34a' : '#e11d48'}">${s.pts > 0 ? '+' : ''}${fa(s.pts)}</b>${s.lpts ? ` <span class="chip">🏅${fa(s.lpts)}</span>` : ''}</td>
<td><div class="row" style="gap:5px;flex-wrap:nowrap"><button type="button" class="ib sm" data-act="aiOpen" data-id="${s.id}" title="تحلیل هوشمند">🧠</button><button type="button" class="ib sm" data-act="stuReport" data-id="${s.id}" title="کارنامهٔ A4">🖨️</button><button type="button" class="ib sm" data-act="stuEdit" data-id="${s.id}">✏️</button><button type="button" class="ib sm" data-act="stuDel" data-id="${s.id}">🗑</button></div></td></tr>`;
}).join('');
const cards = list.map(s => {
const g = groupOf(st, s.id);
return `<div class="card" style="padding:14px"><div class="spread"><div class="row"><input type="checkbox" class="cb" data-chg="stuSel" data-id="${s.id}" ${sel.has(s.id) ? 'checked' : ''}>${avHTML(s)}<div><b class="small">${esc(s.name)} ${roleIcons(s.id)}</b><div class="row" style="gap:5px"><span class="chip mono">${fa(s.code)}</span>${g ? `<span class="chip" style="color:${g.color}">${esc(g.name)}</span>` : ''}</div></div></div>
<div class="row" style="gap:5px"><button type="button" class="ib sm" data-act="aiOpen" data-id="${s.id}">🧠</button><button type="button" class="ib sm" data-act="stuReport" data-id="${s.id}">🖨️</button><button type="button" class="ib sm" data-act="stuEdit" data-id="${s.id}">✏️</button></div></div>
<div class="row mt" style="gap:8px">${s.cnt ? avgBadge(s.avg) : ''}<span class="chip">حضور ${s.total ? fa(s.attRate) + '٪' : '—'}</span><span class="chip">امتیاز ${fa(s.pts)}</span></div></div>`;
}).join('');
return bulk + `<div class="tw only-desktop"><table class="tbl"><thead><tr><th><input type="checkbox" class="cb" data-chg="stuSelAll" ${list.every(s => sel.has(s.id)) ? 'checked' : ''}></th><th>نام</th><th>کد</th><th>گروه</th><th>میانگین</th><th>حضور</th><th>امتیاز</th><th>عملیات</th></tr></thead><tbody>${rows}</tbody></table></div><div class="only-mobile grid" style="gap:10px">${cards}</div>`;
}
/* ---- attendance ---- */
V.attendance = function () {
return pageHead('📅 حضور و غیاب', `ثبت روزانه + تاریخچهٔ کامل شمسی • ${weekDay(UI.attDate)} ${jLabel(UI.attDate)}`,
`<button type="button" class="btn sm soft" data-act="csvExport" data-kind="attendance">📤 CSV</button><button type="button" class="btn sm ghost" data-act="nav" data-sec="data">📥 ورود CSV</button>`) +
`<div class="tabs">${[['reg', '📝 ثبت حضور'], ['hist', '🗓️ تاریخچه و تقویم'], ['stu', '👦 گزارش دانش‌آموز']].map(([k, l]) => `<button type="button" class="${UI.attTab === k ? 'on' : ''}" data-act="attTab" data-tab="${k}">${l}</button>`).join('')}</div>
<div id="attBody">${UI.attTab === 'reg' ? attReg() : UI.attTab === 'hist' ? attHist() : attStuReport()}</div>`;
};
function attNav() {
return `<div class="card mb"><div class="spread"><div class="row">
<button type="button" class="ib" data-act="attPrev">→</button>
<button type="button" class="btn soft" data-act="attCal" data-pop="1">🗓️ ${weekDay(UI.attDate)} ${jLabel(UI.attDate)}</button>
<button type="button" class="ib" data-act="attNext">←</button>
${UI.attDate !== todayISO() ? '<button type="button" class="btn sm ghost" data-act="attToday">امروز</button>' : ''}
</div><div class="row"><button type="button" class="btn sm soft" data-act="attAll">✅ همه حاضر</button><button type="button" class="btn sm ghost" data-act="attClear">🧹 پاک کردن روز</button></div></div></div>`;
}
function attReg() {
const st = S(), day = st.attendance?.[UI.attDate] || {};
const c = { present: 0, late: 0, absent: 0, excused: 0 };
Object.values(day).forEach(v => { if (c[v] != null) c[v]++; });
const vals = Object.values(day), rate = vals.length ? Math.round((c.present + c.late) / vals.length * 100) : 0;
return attNav() +
`<div class="grid g4 mb stagger">${Object.entries(ATT).map(([k, a], i) => `<div class="card stat" style="--i:${i};padding:13px"><span class="si" style="background:${a.color};width:42px;height:42px;font-size:1.2rem">${a.icon}</span><div><b style="font-size:1.35rem">${fa(c[k])}</b><span>${a.label}</span></div></div>`).join('')}</div>
<div class="card mb"><div class="spread"><b class="small">نرخ حضور این روز</b><b style="color:var(--acc)">${vals.length ? fa(rate) + '٪' : 'ثبت نشده'}</b></div><div class="progress" style="margin-top:8px"><i style="width:${rate}%"></i></div></div>
<div class="card" style="padding:6px 0">${st.students.map(s => {
const v = day[s.id];
return `<div class="arow">${avHTML(s, 'sm')}<span class="an">${esc(s.name)}</span><div class="aseg">${Object.entries(ATT).map(([k, a]) => `<button type="button" class="abtn ${v === k ? 'on' : ''}" style="${v === k ? `background:${a.color}` : ''}" data-act="attSet" data-sid="${s.id}" data-v="${k}">${a.icon} ${a.label}</button>`).join('')}</div></div>`;
}).join('')}</div>`;
}
function calHTML(j, mode) {
const cells = monthGrid(j.jy, j.jm), st = S();
return `<div class="cnav"><button type="button" class="ib" data-act="calNav" data-mode="${mode}" data-d="-1">→</button><b>${JMONTHS[j.jm - 1]} ${fa(j.jy)}</b><button type="button" class="ib" data-act="calNav" data-mode="${mode}" data-d="1">←</button></div>
<div class="cal">${JWEEK.map(w => `<span class="ch">${w.slice(0, 3)}</span>`).join('')}${cells.map(iso => {
if (!iso) return '<button type="button" class="cc" disabled></button>';
const wd = wdIdx(iso), today = iso === todayISO();
if (mode === 'stu' || mode === 'my') {
const sid = mode === 'my' ? SESS.sid : (UI.attStu || st.students[0]?.id);
const v = st.attendance?.[iso]?.[sid], a = v ? ATT[v] : null;
return `<button type="button" class="cc ${today ? 'today' : ''} ${wd === 6 ? 'fri' : ''}" style="${a ? `background:${tint(a.color, .16)};border-color:${tint(a.color, .4)}` : ''}" ${mode === 'stu' ? `data-act="attPick" data-iso="${iso}"` : ''} title="${a ? a.label : 'بدون ثبت'}">${fa(jOf(iso).jd)}<small>${a ? a.icon : ''}</small></button>`;
}
const day = st.attendance?.[iso], vals = day ? Object.values(day) : [];
const p = vals.filter(v => v === 'present' || v === 'late').length, r = vals.length ? p / vals.length : 0;
const bg = vals.length ? (r >= .9 ? tint('#16a34a', .18) : r >= .75 ? tint('#f59e0b', .2) : tint('#e11d48', .16)) : '';
return `<button type="button" class="cc ${today ? 'today' : ''} ${wd === 6 ? 'fri' : ''} ${iso === UI.attDate && mode === 'pick' ? 'sel' : ''}" style="${bg ? `background:${bg}` : ''}" data-act="attPick" data-iso="${iso}" title="${vals.length ? `حضور ${fa(Math.round(r * 100))}٪` : 'بدون ثبت'}">${fa(jOf(iso).jd)}<small>${vals.length ? fa(Math.round(r * 100)) + '٪' : ''}</small></button>`;
}).join('')}</div>`;
}
function attHist() {
const st = S(), j = UI.attCal || jOf(UI.attDate);
const dates = Object.keys(st.attendance || {}).sort().reverse();
const rows = dates.map(d => {
const day = st.attendance[d], c = { present: 0, late: 0, absent: 0, excused: 0 };
Object.values(day).forEach(v => { if (c[v] != null) c[v]++; });
const tot = Object.values(day).length, r = tot ? Math.round((c.present + c.late) / tot * 100) : 0;
const absent = Object.entries(day).filter(([, v]) => v === 'absent').map(([sid]) => stuById(st, sid)?.name).filter(Boolean);
return `<div class="hday"><div><b class="small">${jLabel(d)}</b><div class="small muted">${weekDay(d)}</div></div>
<div class="hcounts">${Object.entries(ATT).map(([k, a]) => c[k] ? `<span class="achip" style="background:${tint(a.color, .13)};color:${a.color}">${a.icon} ${fa(c[k])}</span>` : '').join('')}${absent.length ? `<span class="small muted">غایب: ${esc(absent.join('، '))}</span>` : ''}</div>
<div class="row" style="gap:8px"><div class="progress" style="flex:1"><i style="width:${r}%"></i></div><b class="small" style="color:var(--acc)">${fa(r)}٪</b><button type="button" class="ib sm" data-act="attPick" data-iso="${d}">✏️</button></div></div>`;
}).join('');
return `<div class="grid g2" style="align-items:start"><div class="card"><h3 class="mb">🗓️ تقویم حضور کلاس</h3>${calHTML(j, 'class')}
<p class="small muted mt">سبز = حضور بالای ۹۰٪ • زرد = بالای ۷۵٪ • قرمز = کمتر. روی هر روز بزنید تا باز شود.</p>
<div class="divider"></div><button type="button" class="btn sm soft" data-act="repAttPreview">🖨️ گزارش ماهانهٔ A4</button></div>
<div class="card" style="padding:6px 0"><div style="padding:12px 16px" class="spread"><h3>📜 همهٔ روزهای ثبت‌شده</h3><span class="chip acc">${fa(dates.length)} روز</span></div>
<div class="hscroll">${dates.length ? rows : empty('🗓️', 'روزی ثبت نشده', 'از تب «ثبت حضور» شروع کنید.')}</div></div></div>`;
}
function attStuReport() {
const st = S(), sid = UI.attStu || st.students[0]?.id;
const recs = Object.keys(st.attendance || {}).filter(d => st.attendance[d][sid]).sort().reverse();
const c = { present: 0, late: 0, absent: 0, excused: 0 };
recs.forEach(d => c[st.attendance[d][sid]]++);
const rate = recs.length ? Math.round((c.present + c.late) / recs.length * 100) : 0;
return `<div class="card mb"><label class="lbl">انتخاب دانش‌آموز</label><select class="select" style="max-width:300px" data-chg="attStu">${st.students.map(s => `<option value="${s.id}" ${s.id === sid ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
<div class="grid g2" style="align-items:start">
<div class="card"><div class="row" style="justify-content:center;gap:22px">${donut(Object.entries(ATT).map(([k, a]) => ({ label: a.label, color: a.color, value: c[k] })), { center: fa(rate) + '٪', sub: 'نرخ حضور' })}<div class="legend">${Object.entries(ATT).map(([k, a]) => `<div class="li"><span class="dot" style="background:${a.color}"></span>${a.label}<b style="margin-inline-start:auto">${fa(c[k])}</b></div>`).join('')}</div></div>
<div class="divider"></div>${calHTML(UI.attCal || jOf(UI.attDate), 'stu')}</div>
<div class="card" style="padding:6px 0"><div style="padding:12px 16px"><h3>📜 تاریخچهٔ کامل (${fa(recs.length)} روز)</h3></div><div class="hscroll">
${recs.length ? recs.map(d => { const a = ATT[st.attendance[d][sid]]; return `<div class="arow"><span class="achip" style="background:${tint(a.color, .13)};color:${a.color}">${a.icon} ${a.label}</span><span style="flex:1" class="small bold">${weekDay(d)} ${jLabel(d)}</span><button type="button" class="ib sm" data-act="attPick" data-iso="${d}">✏️</button></div>`; }).join('') : empty('🗓️', 'سابقه‌ای نیست', 'برای این دانش‌آموز حضوری ثبت نشده.')}</div></div></div>`;
}
/* ---- grades ---- */
V.grades = function () {
const st = S();
if (!UI.gradeAid || !st.assessments.find(a => a.id === UI.gradeAid)) UI.gradeAid = [...st.assessments].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0]?.id || '';
const list = [...st.assessments].sort((a, b) => String(b.date).localeCompare(String(a.date)));
const cards = list.map(a => {
const g = st.grades?.[a.id] || {}; let sum = 0, c = 0;
for (const sub in g) for (const sid in g[sub]) { const s = scoreOf(st, g[sub][sid]); if (s != null) { sum += s; c++; } }
return `<div class="acard ${a.id === UI.gradeAid ? 'on' : ''}" data-act="asmtSel" data-id="${a.id}"><b>${esc(a.title)}</b><span class="small muted">${jShort(a.date)} • ${ATYPE[a.type] || 'ارزشیابی'} • ${fa(a.subjects.length)} درس</span>
<div class="row" style="gap:5px;margin-top:6px">${c ? avgBadge(sum / c) : '<span class="chip">بدون نمره</span>'}<span class="chip">${fa(c)} نمره</span><button type="button" class="ib sm" data-act="asmtEdit" data-id="${a.id}">✏️</button><button type="button" class="ib sm" data-act="asmtDel" data-id="${a.id}">🗑</button></div></div>`;
}).join('');
return pageHead('📝 ارزشیابی و نمرات', `${fa(st.assessments.length)} ارزشیابی • شیوهٔ ${st.meta.gradingMode === 'numeric' ? 'عددی' : 'توصیفی'} • تاریخ‌ها شمسی`,
`<button type="button" class="btn sm soft" data-act="csvExport" data-kind="grades">📤 CSV</button><button type="button" class="btn sm" data-act="asmtNew">➕ ارزشیابی جدید</button>`) +
`<div class="glayout"><div><div class="alist">${cards || `<div class="card">${empty('📝', 'ارزشیابی‌ای نیست', 'اولین ارزشیابی را بسازید.')}</div>`}</div></div>
<div><div class="card mb" style="padding:12px"><input class="input" placeholder="🔍 جستجوی دانش‌آموز در جدول…" value="${esc(UI.gradeQ)}" data-inp="gradeQ"></div><div id="gradeWrap">${gradeGrid()}</div></div></div>`;
};
function gradeGrid() {
const st = S(), a = st.assessments.find(x => x.id === UI.gradeAid);
if (!a) return `<div class="card">${empty('👈', 'یک ارزشیابی انتخاب کنید', 'یا ارزشیابی جدید بسازید.')}</div>`;
const q = norm(UI.gradeQ);
const students = st.students.filter(s => !q || norm(s.name).includes(q) || s.code.includes(en(UI.gradeQ)));
const numeric = st.meta.gradingMode === 'numeric';
const head = a.subjects.map(sub => `<th>${esc(sub)}<select class="fsel" data-chg="fillCol" data-sub="${esc(sub)}"><option value="">پرکردن ستون…</option>${st.levels.map(l => `<option value="${l.key}">${l.icon} ${l.label}</option>`).join('')}<option value="__clear">🧹 پاک کردن</option></select></th>`).join('');
const rows = students.map(s => {
let sum = 0, c = 0;
const cells = a.subjects.map(sub => {
const g = st.grades?.[a.id]?.[sub]?.[s.id], sc = scoreOf(st, g);
if (sc != null) { sum += sc; c++; }
if (numeric) return `<td><input type="text" inputmode="decimal" data-fa class="gnum" value="${g == null ? '' : fa(g)}" data-chg="grade" data-aid="${a.id}" data-sub="${esc(sub)}" data-sid="${s.id}" placeholder="—"></td>`;
const l = levelFor(st, g), col = l ? l.color : '#9aa0a6';
return `<td><select class="gsel" style="background:${tint(col, .1)};color:${l ? col : 'var(--muted)'};border-color:${tint(col, .35)}" data-chg="grade" data-aid="${a.id}" data-sub="${esc(sub)}" data-sid="${s.id}"><option value="">—</option>${st.levels.map(lv => `<option value="${lv.key}" ${g === lv.key ? 'selected' : ''}>${lv.icon} ${esc(lv.label)}</option>`).join('')}</select></td>`;
}).join('');
const absent = st.attendance?.[a.date]?.[s.id] === 'absent';
return `<tr><td><div class="row" style="gap:7px;flex-wrap:nowrap">${avHTML(s, 'sm')}<span class="small">${esc(s.name)}</span>${absent ? `<span class="achip" style="background:${tint('#e11d48', .12)};color:#e11d48" title="در روز ارزشیابی غایب بوده">غ</span>` : ''}<button type="button" class="ib sm" data-act="stuReport" data-id="${s.id}">🖨️</button></div></td>${cells}<td>${c ? avgBadge(sum / c) : '<span class="chip">—</span>'}</td></tr>`;
}).join('');
const avgs = a.subjects.map(sub => {
let s = 0, c = 0;
for (const stu of st.students) { const sc = scoreOf(st, st.grades?.[a.id]?.[sub]?.[stu.id]); if (sc != null) { s += sc; c++; } }
return `<td>${c ? avgBadge(s / c) : '—'}</td>`;
}).join('');
return `<div class="card mb" style="padding:12px"><div class="spread"><div><b>${esc(a.title)}</b><span class="small muted"> • ${weekDay(a.date)} ${jLabel(a.date)} • ${ATYPE[a.type] || ''}${a.description ? ' • ' + esc(a.description) : ''}</span></div><span class="chip acc">${fa(students.length)} دانش‌آموز</span></div></div>
<div class="gwrap"><table class="gg"><thead><tr><th>دانش‌آموز</th>${head}<th>میانگین</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td class="bold small" style="background:var(--surface2)">میانگین کلاس</td>${avgs}<td></td></tr></tfoot></table></div>`;
}
/* ---- AI ---- */
V.ai = function () {
const st = S();
if (!isT()) return aiBlock(aiStudent(st, SESS.sid), true);
const ai = aiClass(st);
const sid = UI.aiStu && stuById(st, UI.aiStu) ? UI.aiStu : (ai.atRisk[0]?.sid || ai.wg.slice().sort((a, b) => b.avg - a.avg)[0]?.id || st.students[0]?.id);
return pageHead('🧠 تحلیل هوشمند کارنامه', 'موتور تحلیل: نقاط قوت، ضعف، روند، شاخص ریسک و برنامهٔ بهبود — محاسبه روی دادهٔ واقعی کلاس',
`<span class="aib">🧠 تحلیلگر فعال</span><button type="button" class="btn sm soft" data-act="csvExport" data-kind="analysis">📤 CSV تحلیل</button>`) +
`<div class="grid g4 mb stagger">
<div class="card stat" style="--i:0"><span class="si" style="background:linear-gradient(135deg,#7c3aed,#0ea5e9)">📚</span><div><b>${fa(ai.subjects.length)}</b><span>درس تحلیل‌شده</span></div></div>
<div class="card stat" style="--i:1"><span class="si" style="background:linear-gradient(135deg,#16a34a,#84cc16)">🧾</span><div><b>${fa(ai.graded)}</b><span>نمرهٔ مبنای تحلیل</span></div></div>
<div class="card stat" style="--i:2"><span class="si" style="background:linear-gradient(135deg,#f59e0b,#e11d48)">🚨</span><div><b>${fa(ai.atRisk.length)}</b><span>نیازمند توجه</span></div></div>
<div class="card stat" style="--i:3"><span class="si" style="background:linear-gradient(135deg,#0d9488,#1d4ed8)">🔗</span><div><b>${faNum(ai.corr, 2)}</b><span>همبستگی حضور و نمره</span></div></div>
</div>
<div class="grid g2 mb">
<div class="card aihero"><h3 class="mb">🔎 بینش‌های کلاس</h3>${ai.insights.map(x => `<div class="ins ${x.t}"><span class="ii">${x.i}</span><span>${esc(x.text)}</span></div>`).join('')}</div>
<div class="card"><div class="spread mb"><h3>📊 سختی نسبی دروس</h3><span class="chip">۰ تا ${fa(LMAX(st))}</span></div>
${bars(ai.subjects.map((x, i) => ({ label: shortSub(x.sub), value: x.avg / LMAX(st) * 100, color: CPAL[i % 8] })), { fmt: v => faNum(v / 100 * LMAX(st)) })}
<div class="divider"></div><h3 class="mb">🚀 بیشترین پیشرفت</h3>
${ai.improvers.filter(x => x.momentum > 0).slice(0, 4).map(x => { const s = stuById(st, x.sid); return `<div class="row" style="padding:6px 0;border-bottom:1px dashed var(--line)">${avHTML(s, 'sm')}<button type="button" class="small bold" style="flex:1;border:none;background:none;color:var(--ink);text-align:right" data-act="aiPick" data-id="${s.id}">${esc(s.name)}</button><span class="badge" style="background:${tint('#16a34a', .12)};color:#16a34a">📈 +${faNum(x.momentum)}</span></div>`; }).join('') || '<p class="small muted">روند صعودی معناداری ثبت نشده است.</p>'}</div>
</div>
<div class="card mb"><div class="spread"><div class="row"><h3>🎯 تحلیل فردی</h3><span class="chip acc">رادار + روند + برنامه</span></div>
<div class="row"><select class="select" style="max-width:250px" data-chg="aiSel">${st.students.map(s => `<option value="${s.id}" ${s.id === sid ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
<button type="button" class="btn sm soft" data-act="aiPrint" data-id="${sid}">🖨️ گزارش تحلیلی A4</button></div></div></div>
<div id="aiBox">${aiBlock(aiStudent(st, sid), false)}</div>`;
};
function aiBlock(a, own) {
if (!a) return `<div class="card">${empty('🌱', 'داده‌ای برای تحلیل نیست', 'پس از ثبت چند نمره، تحلیل هوشمند فعال می‌شود.')}</div>`;
const st = S(), s = stuById(st, a.sid);
const radarItems = a.subjects.map(x => ({ label: x.sub, value: x.avg, classValue: x.cavg }));
const tv = a.chrono.map(x => x.v), tl = a.chrono.map(x => { const j = jOf(x.date); return `${fa(j.jd)} ${JMONTHS[j.jm - 1].slice(0, 3)}`; });
return `<div class="card aihero mb"><div class="spread"><div class="row" style="gap:14px">${avHTML(s, 'lg')}<div><span class="aib">🧠 تحلیل هوشمند</span><h2 style="font-size:1.35rem">${esc(s.name)}</h2>
<div class="row" style="gap:6px">${avgBadge(a.base.avg)}${a.rank ? `<span class="chip">رتبه ${fa(a.rank)} از ${fa(a.total)}</span>` : ''}<span class="chip">${fa(a.base.cnt)} نمره</span><span class="chip">حضور ${fa(a.base.attRate)}٪</span></div></div></div>
<div style="min-width:210px"><div class="spread small bold mb"><span>${a.riskLevel.i} ${a.riskLevel.l}</span><span style="color:${a.riskLevel.c}">${fa(a.risk)}/۱۰۰</span></div>
<div class="risk"><i style="right:${a.risk}%"></i></div><div class="small muted mt">پیش‌بینی سطح بعدی: <b>${a.predict.icon} ${esc(a.predict.label)}</b></div></div></div></div>
<div class="grid g2 mb">
<div class="card"><div class="spread mb"><h3>🕸️ رادار دروس</h3><span class="chip">خط‌چین = میانگین کلاس</span></div>${radar(radarItems, { max: LMAX(st) })}
<div class="row mt" style="justify-content:center;gap:14px"><span class="legend"><span class="li"><span class="dot" style="background:var(--acc)"></span>${esc(s.name)}</span></span><span class="legend"><span class="li"><span class="dot" style="background:var(--muted)"></span>میانگین کلاس</span></span></div></div>
<div class="card"><div class="spread mb"><h3>📈 روند نمرات در طول زمان</h3><span class="chip ${a.momentum >= 0 ? 'acc' : ''}">${a.momentum >= 0 ? '📈' : '📉'} ${a.momentum >= 0 ? '+' : ''}${faNum(a.momentum)}</span></div>
${lineChart(tv, tl, { max: LMAX(st) })}
<div class="divider"></div><h3 class="mb">📚 مقایسه با کلاس</h3>
${bars(a.subjects.map((x, i) => ({ label: shortSub(x.sub), value: x.avg / LMAX(st) * 100, mark: x.cavg / LMAX(st) * 100, color: x.delta >= 0 ? CPAL[i % 8] : '#e11d48' })), { fmt: v => faNum(v / 100 * LMAX(st)) })}</div>
</div>
<div class="grid g2 mb">
<div class="card"><h3 class="mb">💪 نقاط قوت</h3>${a.strengths.map(x => `<div class="ins good"><span class="ii">${x.level.icon}</span><span><b>${esc(x.sub)}</b> — میانگین ${faNum(x.avg)} (${esc(x.level.label)})، ${fa(x.n)} نمره، بهتر از ${fa(x.percentile)}٪ کلاس${x.trend > .1 ? ` • روند صعودی +${faNum(x.trend)}` : ''}</span></div>`).join('')}
<h3 class="mb mt">🎯 نقاط ضعف</h3>${a.weaknesses.map(x => `<div class="ins bad"><span class="ii">${x.level.icon}</span><span><b>${esc(x.sub)}</b> — میانگین ${faNum(x.avg)} (${esc(x.level.label)})، ${x.delta < 0 ? faNum(Math.abs(x.delta)) + ' زیر میانگین کلاس' : 'نزدیک میانگین کلاس'}${x.trend < -.1 ? ` • افت ${faNum(x.trend)}` : ''}</span></div>`).join('')}</div>
<div class="card"><h3 class="mb">🧠 روایت تحلیلی</h3>${a.insights.map(x => `<div class="ins ${x.t}"><span class="ii">${x.i}</span><span>${esc(x.text)}</span></div>`).join('')}</div>
</div>
<div class="grid g2">
<div class="card"><h3 class="mb">🗺️ برنامهٔ بهبود پیشنهادی</h3>${a.plans.map((p, i) => `<div class="plan"><b>${fa(i + 1)}</b><span><b>${esc(p.sub)}:</b> ${esc(p.text)}</span></div>`).join('')}
${own ? '' : `<div class="row mt"><button type="button" class="btn sm soft" data-act="stuDetail" data-id="${a.sid}">👁 پرونده</button><button type="button" class="btn sm" data-act="stuReport" data-id="${a.sid}">🖨️ کارنامهٔ A4</button><button type="button" class="btn sm ai" data-act="aiPrint" data-id="${a.sid}">🧠 گزارش تحلیلی</button></div>`}</div>
<div class="card"><h3 class="mb">📋 ریز نمرات هر درس</h3><div class="tw" style="max-height:340px"><table class="tbl" style="min-width:420px"><thead><tr><th>درس</th><th>تعداد</th><th>میانگین</th><th>کلاس</th><th>روند</th><th>آخرین</th></tr></thead><tbody>
${a.subjects.map(x => `<tr><td class="bold small">${esc(x.sub)}</td><td>${fa(x.n)}</td><td>${avgBadge(x.avg)}</td><td>${faNum(x.cavg)}</td><td style="color:${x.trend > .05 ? '#16a34a' : x.trend < -.05 ? '#e11d48' : 'var(--muted)'}">${x.trend > .05 ? '📈' : x.trend < -.05 ? '📉' : '➖'} ${x.trend >= 0 ? '+' : ''}${faNum(x.trend)}</td><td>${gradeBadge(x.last.g)}</td></tr>`).join('')}
</tbody></table></div></div></div>`;
}
/* ---- discipline ---- */
V.discipline = function () {
const st = S();
let recs = [...st.discipline].sort((a, b) => String(b.date).localeCompare(String(a.date)));
if (UI.discFilter !== 'all') recs = recs.filter(r => r.sid === UI.discFilter);
if (UI.discQ) recs = recs.filter(r => norm(r.reason).includes(norm(UI.discQ)));
const board = st.students.map(s => ({ ...s, ...stats(st, s.id) })).filter(s => s.pts !== 0).sort((a, b) => b.pts - a.pts).slice(0, 8);
const pos = st.discipline.filter(r => r.points > 0).length;
UI.jdate.disc = UI.jdate.disc || todayISO();
return pageHead('⭐ انضباط و امتیاز', `${fa(st.discipline.length)} رویداد واقعی • ${fa(pos)} مثبت، ${fa(st.discipline.length - pos)} منفی`,
`<button type="button" class="btn sm soft" data-act="csvExport" data-kind="discipline">📤 CSV</button><button type="button" class="btn sm ghost" data-act="nav" data-sec="data">📥 ورود CSV</button>`) +
`<div class="grid g2" style="align-items:start"><div>
<div class="card mb"><h3 class="mb">➕ ثبت رویداد</h3><form data-form="disc">
<div class="field"><label class="lbl">دانش‌آموز</label><select class="select" name="sid" required><option value="">انتخاب کنید…</option>${st.students.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
<div class="field"><label class="lbl">تاریخ (شمسی)</label>${jDateSelects('disc')}</div>
<div class="field"><label class="lbl">امتیاز</label><div class="row" style="gap:6px">${[1, 2, 5, -1, -2].map(p => `<button type="button" class="btn sm ${p > 0 ? 'soft' : 'ghost'}" data-act="discQuick" data-pts="${p}">${p > 0 ? '+' : ''}${fa(p)}</button>`).join('')}<input type="text" inputmode="numeric" data-fa class="input" name="points" id="discPts" value="۱" style="width:80px" required></div></div>
<div class="field"><label class="lbl">دلیل</label><input class="input" name="reason" list="discReasons" placeholder="مثلاً: مشارکت فعال در کلاس" required><datalist id="discReasons">${D_REASONS.map(r => `<option value="${esc(r)}">`).join('')}</datalist></div>
<button class="btn" type="submit">⭐ ثبت رویداد</button></form></div>
<div class="card"><h3 class="mb">🏆 تابلوی امتیاز</h3>${board.map(s => `<div class="row" style="padding:6px 0;border-bottom:1px dashed var(--line)">${avHTML(s, 'sm')}<span class="small bold" style="flex:1">${esc(s.name)}</span><span class="badge" style="background:${tint(s.pts > 0 ? '#16a34a' : '#e11d48', .13)};color:${s.pts > 0 ? '#16a34a' : '#e11d48'}">${s.pts > 0 ? '+' : ''}${fa(s.pts)}</span></div>`).join('') || empty('🌱', 'امتیازی نیست', 'اولین رویداد را ثبت کنید.')}</div>
</div>
<div class="card" style="padding:6px 0"><div class="spread" style="padding:12px 16px"><h3>📜 رویدادها (${fa(recs.length)})</h3>
<div class="row"><input class="input" style="max-width:150px" placeholder="🔍 دلیل…" value="${esc(UI.discQ)}" data-inp="discQ"><select class="select" style="max-width:180px" data-chg="discFilter"><option value="all">همه</option>${st.students.map(s => `<option value="${s.id}" ${UI.discFilter === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div></div>
<div class="hscroll">${recs.length ? recs.map(r => { const s = stuById(st, r.sid); return `<div class="arow"><span class="badge" style="background:${tint(r.points > 0 ? '#16a34a' : '#e11d48', .13)};color:${r.points > 0 ? '#16a34a' : '#e11d48'}">${r.points > 0 ? '+' : ''}${fa(r.points)}</span><div style="flex:1"><b class="small">${esc(s?.name || '—')}</b><div class="small muted">${r.by === 'court' ? '⚖️ ' : ''}${esc(r.reason)} • ${jLabel(r.date)}</div></div>${r.rid ? `<button type="button" class="ib sm" data-act="caseOpen" data-id="${r.rid}" title="پرونده">📁</button>` : ''}<button type="button" class="ib sm" data-act="discDel" data-id="${r.id}">🗑</button></div>`; }).join('') : empty('🕊️', 'رویدادی نیست', 'از فرم کنار ثبت کنید.')}</div></div></div>`;
};
/* ---- groups ---- */
V.groups = function () {
const st = S(), ranks = groupRanks(st);
const un = st.students.filter(s => !groupOf(st, s.id));
const chip = (s, g) => `<span class="mchip" draggable="true" data-drag='{"t":"m","sid":"${s.id}"}'>${avHTML(s, 'sm')}${esc(s.name)}${g && g.leader === s.id ? ' 🏅' : ''}<button type="button" data-act="grpMove" data-sid="${s.id}" data-pop="1">⇄</button>${g ? `<button type="button" data-act="grpOut" data-sid="${s.id}">✕</button>` : ''}</span>`;
const logs = [...st.leaderLogs].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 15);
return pageHead('🧩 گروه‌ها و سرگروه‌ها', `${fa(st.groups.length)} گروه واقعی کلاس • انتخاب هوشمند سرگروه بر پایهٔ شایستگی`,
`<button type="button" class="btn sm warn" data-act="leaderAuto">🤖 انتخاب هوشمند سرگروه‌ها</button><button type="button" class="btn sm soft" data-act="csvExport" data-kind="groups">📤 CSV</button><button type="button" class="btn sm" data-act="grpAdd">➕ گروه</button>`) +
`<div class="card mb"><h3 class="mb">🏁 رتبه‌بندی گروه‌ها</h3>${bars(ranks.map((r, i) => { const g = st.groups.find(x => x.id === r.id); return { label: (i === 0 ? '👑 ' : '') + g.name, value: r.avg / LMAX(st) * 100, color: g.color }; }), { fmt: v => faNum(v / 100 * LMAX(st)) })}</div>
<div class="grid g2 stagger mb">${st.groups.map((g, i) => {
const gs = groupStats(st, g), rank = ranks.findIndex(r => r.id === g.id) + 1, leader = stuById(st, g.leader);
return `<div class="card gcard" style="--gc:${g.color};--i:${i}">
<div class="ghead"><input type="color" value="${g.color}" data-chg="grpColor" data-id="${g.id}"><input class="gname" value="${esc(g.name)}" data-chg="grpName" data-id="${g.id}"><span class="chip">${rank === 1 ? '👑' : ''} رتبه ${fa(rank)}</span><button type="button" class="ib sm" data-act="grpDel" data-id="${g.id}">🗑</button></div>
<div class="card mb" style="padding:10px;background:var(--surface2)"><div class="row">${leader ? avHTML(leader) : '<span class="av">🏅</span>'}<div style="flex:1"><b class="small">سرگروه: ${esc(leader?.name || 'تعیین نشده')}</b><div class="small muted">${leader ? `امتیاز مدیریتی 🏅 ${fa(leaderPts(st, leader.id))}` : 'با دکمهٔ 🤖 یا فهرست زیر انتخاب کنید'}</div></div>
${leader ? `<label class="btn sm ghost" style="cursor:pointer">📷<input type="file" accept="image/*" class="hidden" data-chg="photo" data-sid="${leader.id}"></label>` : ''}</div>
<select class="select" style="margin-top:8px" data-chg="leaderSel" data-gid="${g.id}"><option value="">— انتخاب سرگروه —</option>${g.members.map(m => { const s = stuById(st, m); return s ? `<option value="${m}" ${g.leader === m ? 'selected' : ''}>${esc(s.name)} (شایستگی ${fa(Math.round(smartScore(st, m)))})</option>` : ''; }).join('')}</select></div>
<div class="row mb" style="gap:7px"><span class="chip">${fa(gs.count)} عضو</span>${gs.avg ? avgBadge(gs.avg) : ''}<span class="chip">حضور ${fa(gs.attRate)}٪</span><span class="chip">امتیاز ${fa(gs.pts)}</span></div>
<div class="dz" data-drop="g" data-gid="${g.id}">${g.members.map(m => { const s = stuById(st, m); return s ? chip(s, g) : ''; }).join('') || '<span class="small muted">اعضا را اینجا رها کنید…</span>'}</div></div>`;
}).join('')}
<div class="card" style="--i:${st.groups.length}"><h3 class="mb">📦 بدون گروه (${fa(un.length)})</h3><div class="dz" data-drop="g" data-gid="">${un.map(s => chip(s, null)).join('') || '<span class="small muted">همه عضو گروه هستند 🎉</span>'}</div></div></div>
<div class="card"><div class="spread mb"><h3>📨 گزارش سرگروه‌ها</h3><span class="chip acc">${fa(st.leaderLogs.length)} گزارش</span></div>
${logs.length ? logs.map(l => { const ld = stuById(st, l.leader), m = stuById(st, l.member), g = st.groups.find(x => x.id === l.gid), hw = HW[l.homework]; return `<div class="arow">${avHTML(ld, 'sm')}<div style="flex:1"><b class="small">${esc(ld?.name || '—')} 🏅 → ${esc(m?.name || '—')}</b><div class="small muted">${esc(g?.name || '')} • ${jLabel(l.date)}${l.note ? ' • ' + esc(l.note) : ''}</div></div><span class="badge" style="background:${tint(hw.c, .12)};color:${hw.c}">${hw.i} ${hw.l}</span>${l.help ? '<span class="chip" style="color:#0d9488">📚 یاد داده</span>' : ''}<span class="chip">+${fa(l.points)}🏅</span></div>`; }).join('') : empty('📭', 'گزارشی ثبت نشده', 'سرگروه‌ها از پنل خود وضعیت تکالیف اعضا را ثبت می‌کنند.')}</div>`;
};
/* ---- roles & court ---- */
V.roles = function () {
const tabs = [['roles', '🏛️ مسئولیت‌ها'], ['cases', '📁 پرونده‌ها و دادگاه'], ['inspect', '🧹 بازرسی شهردار']];
return pageHead('🏛️ مسئولیت‌ها و دادگاه کلاس', 'نماینده/شهردار → تأیید معلم → رأی قاضی → تأیید نهایی معلم → ابلاغ به دانش‌آموز',
`<button type="button" class="btn sm warn" data-act="pollElect">🗳️ انتخابات جدید</button>`) +
`<div class="tabs">${tabs.map(([k, l]) => `<button type="button" class="${UI.rolesTab === k ? 'on' : ''}" data-act="rolesTab" data-tab="${k}">${l}</button>`).join('')}</div>
${UI.rolesTab === 'cases' ? rolesCases() : UI.rolesTab === 'roles' ? rolesManage() : rolesInspect()}`;
};
function rolesManage() {
const st = S(), r = st.roles;
const daysLeft = r.termEnds ? Math.ceil((isoToDate(r.termEnds) - isoToDate(todayISO())) / 864e5) : null;
return `<div class="grid g3 mb stagger">${Object.entries(ROLES).map(([k, role], i) => {
const s = stuById(st, r[k]), perf = k === 'judge' ? judgePerf(st, r[k]) : reporterPerf(st, r[k]);
const suggestion = bestOf(st, st.students.filter(x => !Object.values(r).includes(x.id)).map(x => x.id));
return `<div class="card rcard" style="--rc:${role.color};--i:${i}"><div class="row mb"><span class="ri">${role.icon}</span><div><b>${role.label}</b><div class="small muted">${role.desc}</div></div></div>
${s ? `<div class="row mb">${avHTML(s)}<div style="flex:1"><b class="small">${esc(s.name)}</b><div class="small muted">${k === 'judge' ? `دقت آرا ${fa(perf.acc)}٪ • امتیاز ${fa(perf.score)}` : `گزارش تأییدشده ${fa(perf.ok)} از ${fa(perf.sent)}`}</div></div></div>` : '<p class="small muted mb">هنوز کسی منصوب نشده است.</p>'}
<label class="lbl">انتصاب توسط معلم</label><select class="select" data-chg="roleAssign" data-role="${k}"><option value="">— بدون متصدی —</option>${st.students.map(x => `<option value="${x.id}" ${r[k] === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
${!s && suggestion ? `<button type="button" class="btn sm soft mt" data-act="roleSuggest" data-role="${k}" data-sid="${suggestion}">🤖 پیشنهاد هوشمند: ${esc(stuById(st, suggestion).name)}</button>` : ''}</div>`;
}).join('')}</div>
<div class="card mb"><h3 class="mb">🔄 چرخش دوره‌ای مسئولیت‌ها</h3>
<div class="srow"><div><span class="sl">چرخش خودکار در پایان دوره</span><span class="ss">بر اساس شایستگی (میانگین + حضور + امتیاز)</span></div><span class="switch"><input type="checkbox" ${r.autoRotate ? 'checked' : ''} data-chg="rotAuto"><i></i></span></div>
<div class="srow"><span class="sl">طول دوره (هفته)</span><input type="text" inputmode="numeric" data-fa class="input" style="width:90px" value="${fa(r.termWeeks || 4)}" data-chg="termWeeks"></div>
<div class="srow"><div><span class="sl">پایان دورهٔ فعلی</span><span class="ss">${r.termEnds ? jLabel(r.termEnds) + (daysLeft != null ? ` (${daysLeft >= 0 ? fa(daysLeft) + ' روز مانده' : 'گذشته'})` : '') : 'تعیین نشده'}</span></div><button type="button" class="btn sm warn" data-act="rotate">🔄 چرخش همین حالا</button></div></div>
<div class="card"><h3 class="mb">📜 تاریخچهٔ مسئولیت‌ها</h3>${(r.history || []).slice().reverse().slice(0, 12).map(h => { const s = stuById(st, h.sid), role = ROLES[h.role]; return `<div class="row" style="padding:7px 0;border-bottom:1px dashed var(--line)"><span>${role?.icon || '🏛️'}</span><b class="small">${esc(s?.name || '—')}</b><span class="chip">${role?.label || h.role}</span><span class="small muted" style="flex:1">${esc(h.via)}</span><span class="small muted">${jLabel(h.date)}</span></div>`; }).join('') || '<p class="small muted">سابقه‌ای نیست.</p>'}</div>`;
}
function rolesCases() {
const st = S();
const filters = [['inbox', '📨 اقدام لازم'], ['to_judge', '⚖️ نزد قاضی'], ['approved', '✅ قطعی'], ['rejected', '✖️ رد شده'], ['all', 'همه']];
let list = [...st.reports].sort((a, b) => String(b.date).localeCompare(String(a.date)));
const inboxN = st.reports.filter(r => r.status === 'pending_teacher' || r.status === 'pending_final').length;
if (UI.caseFilter === 'inbox') list = list.filter(r => r.status === 'pending_teacher' || r.status === 'pending_final');
else if (UI.caseFilter !== 'all') list = list.filter(r => r.status === UI.caseFilter);
return `<div class="card mb"><div class="pipe"><span class="ps">🎖️/🏙️ گزارش</span><span class="pa">←</span><span class="ps">👨‍🏫 تأیید معلم</span><span class="pa">←</span><span class="ps">⚖️ رأی قاضی</span><span class="pa">←</span><span class="ps">👨‍🏫 تأیید نهایی</span><span class="pa">←</span><span class="ps">👦 ابلاغ</span></div></div>
<div class="row mb">${filters.map(([k, l]) => { const n = k === 'inbox' ? inboxN : k === 'all' ? st.reports.length : st.reports.filter(r => r.status === k).length; return `<button type="button" class="btn sm ${UI.caseFilter === k ? '' : 'ghost'}" data-act="caseFilter" data-f="${k}">${l} (${fa(n)})</button>`; }).join('')}</div>
${list.length ? `<div class="grid g2 stagger">${list.map((r, i) => caseCard(r, i)).join('')}</div>` : `<div class="card">${empty('🕊️', 'پرونده‌ای نیست', 'گزارش‌های نماینده و شهردار پس از ثبت اینجا نمایش داده می‌شوند.')}</div>`}`;
}
function caseCard(r, i = 0) {
const st = S(), t = stuById(st, r.target), b = stuById(st, r.by), rs = RSTAT[r.status];
return `<div class="card ccard" style="--cc:${rs.c};--i:${i}" data-act="caseOpen" data-id="${r.id}">
<div class="spread"><div class="row"><span style="font-size:1.35rem">${r.type === 'cleanliness' ? '🧹' : '📋'}</span><div><b class="small">${esc(r.title)}</b><div class="small muted">${jLabel(r.date)} • شدت ${'🔴'.repeat(r.severity || 1)}</div></div></div><span class="badge" style="background:${tint(rs.c, .13)};color:${rs.c}">${rs.i} ${rs.l}</span></div>
<div class="row mt" style="gap:8px"><span class="chip">گزارش: ${esc(b?.name || '—')}</span><span class="chip" style="color:var(--anar)">دانش‌آموز: ${esc(t?.name || '—')}</span>${r.verdict ? `<span class="chip" style="color:${r.verdict.type === 'acquittal' ? '#16a34a' : '#8b5cf6'}">${r.verdict.type === 'acquittal' ? '🕊️ برائت' : '⚖️ ' + fa(r.verdict.points)}</span>` : ''}</div></div>`;
}
function rolesInspect() {
const st = S(), list = [...st.inspections].sort((a, b) => String(b.date).localeCompare(String(a.date)));
const items = { board: '🧽 تخته', floor: '🧹 کف کلاس', bin: '🗑️ سطل زباله', desks: '🪑 نیمکت‌ها' };
return list.length ? `<div class="grid g2 stagger">${list.map((x, i) => { const s = stuById(st, x.by); return `<div class="card" style="--i:${i}"><div class="spread mb"><div class="row">${avHTML(s, 'sm')}<b class="small">${esc(s?.name || '—')} 🏙️</b></div><span class="chip">${jLabel(x.date)}</span></div><div class="row">${Object.entries(items).map(([k, l]) => `<span class="badge" style="background:${tint(x.items[k] ? '#16a34a' : '#e11d48', .12)};color:${x.items[k] ? '#16a34a' : '#e11d48'}">${x.items[k] ? '✅' : '❌'} ${l}</span>`).join('')}</div>${x.note ? `<p class="small muted mt">${esc(x.note)}</p>` : ''}</div>`; }).join('')}</div>` : `<div class="card">${empty('🧹', 'بازرسی‌ای ثبت نشده', 'شهردار کلاس از پنل خود بازرسی روزانه ثبت می‌کند.')}</div>`;
}
function caseDrawer(rid) {
const st = S(), r = st.reports.find(x => x.id === rid); if (!r) return;
const t = stuById(st, r.target), b = stuById(st, r.by), j = stuById(st, st.roles.judge), rs = RSTAT[r.status];
const steps = [
{ l: 'ثبت گزارش توسط ' + (r.type === 'cleanliness' ? 'شهردار' : 'نماینده'), done: true, note: `${b?.name || ''} • ${jLabel(r.date)}` },
{ l: 'تأیید معلم و ارجاع به قاضی', done: ['to_judge', 'pending_final', 'approved'].includes(r.status), cur: r.status === 'pending_teacher', note: r.teacherNote || '' },
{ l: 'بررسی و صدور رأی قاضی', done: ['pending_final', 'approved'].includes(r.status), cur: r.status === 'to_judge', note: r.verdict ? `${j?.name || ''} • ${jLabel(r.verdict.date)}` : '' },
{ l: 'تأیید نهایی و ابلاغ', done: r.status === 'approved', cur: r.status === 'pending_final', note: r.finalNote || '' }];
let actions = '';
if (isT()) {
if (r.status === 'pending_teacher') actions = `<div class="row mt"><button type="button" class="btn ok" data-act="caseOk" data-id="${r.id}">✅ تأیید و ارجاع به قاضی</button><button type="button" class="btn danger" data-act="caseNo" data-id="${r.id}">✖️ رد گزارش</button></div>`;
else if (r.status === 'pending_final') actions = `<div class="row mt"><button type="button" class="btn ok" data-act="caseFinal" data-id="${r.id}">✅ تأیید رأی و ابلاغ</button><button type="button" class="btn warn" data-act="caseBack" data-id="${r.id}">↩️ برگشت به قاضی</button></div>`;
actions += `<div class="row mt"><button type="button" class="btn sm ghost" data-act="caseDel" data-id="${r.id}">🗑 حذف پرونده</button></div>`;
}
if (!isT() && st.roles.judge === SESS.sid && r.status === 'to_judge') {
actions = `<div class="divider"></div><h3 class="mb">⚖️ صدور رأی</h3><form data-form="verdict"><input type="hidden" name="rid" value="${r.id}">
<div class="field"><div class="seg"><button type="button" class="on" data-act="vType" data-v="guilty" id="vtG">⚖️ محکومیت</button><button type="button" data-act="vType" data-v="acquittal" id="vtA">🕊️ برائت</button></div><input type="hidden" name="vtype" id="vtInp" value="guilty"></div>
<div class="field" id="vtPts"><label class="lbl">کسر امتیاز</label><select class="select" name="points">${[0, -1, -2, -3, -5].map(p => `<option value="${fa(p)}">${p === 0 ? 'بدون کسر (فقط تذکر)' : fa(p) + ' امتیاز'}</option>`).join('')}</select></div>
<div class="field"><label class="lbl">متن رأی (در پنل دانش‌آموز نمایش داده می‌شود)</label><textarea class="input" name="text" rows="4" required placeholder="استدلال و تصمیم دادگاه کلاس…"></textarea></div>
<button class="btn" type="submit" style="width:100%">🔨 ثبت رأی و ارسال به معلم</button></form>`;
}
openDrawer((r.type === 'cleanliness' ? '🧹 ' : '📋 ') + r.title, `
<div class="row mb"><span class="badge" style="background:${tint(rs.c, .13)};color:${rs.c}">${rs.i} ${rs.l}</span><span class="chip">شدت ${'🔴'.repeat(r.severity || 1)}</span><span class="chip">${jLabel(r.date)}</span>${r.returns ? `<span class="chip" style="color:#e11d48">↩️ ${fa(r.returns)} برگشت</span>` : ''}</div>
<div class="card mb" style="padding:13px"><div class="row mb"><span class="chip">گزارش‌دهنده: ${esc(b?.name || '—')}</span><span class="chip" style="color:var(--anar)">دانش‌آموز: ${esc(t?.name || '—')}</span></div><p class="small">${esc(r.description)}</p></div>
<div class="tl">${steps.map(x => `<div class="tls ${x.done ? 'done' : ''} ${x.cur ? 'cur' : ''}"><span class="tld">${x.done ? '✓' : x.cur ? '…' : ''}</span><div><b class="small">${x.l}</b>${x.note ? `<div class="small muted">${esc(x.note)}</div>` : ''}</div></div>`).join('')}</div>
${r.verdict ? `<div class="vbox ${r.verdict.type === 'acquittal' ? 'acq' : ''}"><div class="row mb"><b>${r.verdict.type === 'acquittal' ? '🕊️ رأی برائت' : '🔨 رأی محکومیت'}</b><span class="chip">قاضی: ${esc(j?.name || '—')}</span></div><p class="small">${esc(r.verdict.text)}</p></div>` : ''}
${r.status === 'rejected' ? `<div class="vbox" style="border-color:${tint('#e11d48', .4)}"><b class="small">✖️ گزارش رد شد</b><p class="small">${esc(r.teacherNote || '')}</p></div>` : ''}
${actions}`, true);
}
/* ---- polls ---- */
V.polls = function () {
const st = S(), t = isT();
const list = (st.polls || []).map(p => pollCard(p, t)).join('');
return pageHead('🗳️ نظرسنجی و انتخابات', t ? '۵ نوع نظرسنجی + ریز آرا + انتصاب برنده' : 'رأی شما محرمانه و فقط یک‌بار ثبت می‌شود',
t ? '<button type="button" class="btn sm" data-act="pollNew">➕ نظرسنجی</button><button type="button" class="btn sm warn" data-act="pollElect">🗳️ انتخابات مسئولیت</button>' : '') +
(list || `<div class="card">${empty('🗳️', 'نظرسنجی‌ای نیست', t ? 'برای انتخاب قاضی، شهردار یا نماینده یک انتخابات بسازید.' : 'به‌زودی نظرسنجی جدیدی می‌آید.', t ? '<button type="button" class="btn warn" data-act="pollElect">🗳️ ساخت انتخابات</button>' : '')}</div>`);
};
function pollCard(p, t) {
const st = S();
const counts = t ? pollCounts(p) : { c: p.counts || {}, total: p.totalVotes || 0 };
const myVote = t ? p.votes?.[SESS.sid] : p.myVote;
const voted = t ? myVote !== undefined : myVote != null;
const active = p.status === 'active', show = t || p.status === 'closed' || p.showResults;
const pt = PTYPES[p.type] || PTYPES.choice;
const opts = p.type === 'election' ? (p.candidates || []).map(sid => ({ id: sid, text: stuById(st, sid)?.name || '—', stu: stuById(st, sid) })) : p.type === 'rating' ? [1, 2, 3, 4, 5].map(n => ({ id: String(n), text: '⭐'.repeat(n) })) : (p.options || []);
const maxC = Math.max(1, ...Object.values(counts.c));
let body;
if (p.type === 'multi' && !t && active && !voted) {
body = `<div class="mb">${opts.map(o => `<label class="popt" style="cursor:pointer"><input type="checkbox" class="cb" name="mv_${p.id}" value="${o.id}"><span>${esc(o.text)}</span></label>`).join('')}</div><button type="button" class="btn" data-act="pollMulti" data-pid="${p.id}">☑️ ثبت نهایی رأی</button>`;
} else {
body = opts.map((o, i) => {
const cnt = counts.c[o.id] || 0, pct = counts.total ? Math.round(cnt / counts.total * 100) : 0;
const mine = p.type === 'multi' ? Array.isArray(myVote) && myVote.includes(o.id) : myVote === o.id;
const inner = `${o.stu ? avHTML(o.stu, 'sm') : mine ? '✅' : '⚪'} <span style="flex:1">${esc(o.text)}</span>${show ? `<span class="pp">${p.type === 'multi' ? fa(cnt) + ' رأی' : fa(pct) + '٪ (' + fa(cnt) + ')'}</span><span class="pf" style="width:${p.type === 'multi' ? cnt / maxC * 100 : pct}%;background:${tint(CPAL[i % 8], .14)}"></span>` : mine ? '<span class="chip acc">رأی شما</span>' : ''}`;
return (!t && active && !voted) ? `<button type="button" class="popt ${mine ? 'mine' : ''}" data-act="pollVote" data-pid="${p.id}" data-oid="${o.id}">${inner}</button>` : `<div class="popt ${mine ? 'mine' : ''}" style="cursor:default">${inner}</div>`;
}).join('');
}
let extra = '';
if (p.type === 'election' && t) {
const win = [...opts].sort((a, b) => (counts.c[b.id] || 0) - (counts.c[a.id] || 0))[0];
extra = `<div class="row mt">${p.status === 'closed' && !p.applied && p.targetRole ? `<button type="button" class="btn ok sm" data-act="pollApply" data-id="${p.id}">🏛️ انتصاب برنده (${esc(win?.text || '—')})</button>` : ''}${p.applied ? `<span class="badge" style="background:${tint('#16a34a', .13)};color:#16a34a">✅ نتیجه اعمال شد</span>` : ''}${p.targetRole ? `<span class="chip">${ROLES[p.targetRole]?.icon || ''} ${ROLES[p.targetRole]?.label || ''}</span>` : ''}</div>`;
}
return `<div class="card mb"><div class="spread mb"><div><b style="font-size:1.02rem">${pt.i} ${esc(p.question)}</b>
<div class="row" style="gap:6px;margin-top:5px"><span class="chip acc">${pt.l}</span><span class="badge" style="background:${tint(active ? '#16a34a' : '#7b7261', .13)};color:${active ? '#16a34a' : 'var(--muted)'}">${active ? '🟢 فعال' : '⚪ بسته'}</span><span class="chip">${fa(counts.total)} رأی</span>${p.createdAt ? `<span class="chip">${jShort(p.createdAt)}</span>` : ''}</div></div>
${t ? `<div class="row" style="gap:5px"><button type="button" class="btn sm ${active ? 'ghost' : 'soft'}" data-act="pollToggle" data-id="${p.id}">${active ? 'بستن' : 'فعال‌سازی'}</button><button type="button" class="btn sm soft" data-act="pollVotes" data-id="${p.id}">👥 ریز آرا</button><button type="button" class="btn sm ghost" data-act="pollRes" data-id="${p.id}">${p.showResults ? '🙈 مخفی' : '👁 نمایش'}</button><button type="button" class="ib sm" data-act="pollEdit" data-id="${p.id}">✏️</button><button type="button" class="ib sm" data-act="pollDel" data-id="${p.id}">🗑</button></div>` : ''}</div>
${body}${extra}${!t && voted ? '<p class="small bold mt" style="color:var(--ok)">🔒 رأی شما ثبت نهایی شد و قابل تغییر نیست.</p>' : ''}</div>`;
}
function pollVotesDrawer(pid) {
const st = S(), p = st.polls.find(x => x.id === pid); if (!p) return;
const rows = st.students.map(s => {
const v = p.votes?.[s.id];
return `<tr><td><div class="row" style="gap:8px;flex-wrap:nowrap">${avHTML(s, 'sm')}<b class="small">${esc(s.name)}</b></div></td><td>${v === undefined ? '<span class="chip">شرکت نکرده</span>' : `<span class="badge" style="background:${tint('#0d9488', .1)};color:#0d9488">${esc(voteText(st, p, v))}</span>`}</td></tr>`;
}).join('');
openDrawer('👥 ریز آرا: ' + p.question, `<div class="row mb"><span class="chip acc">${fa(pollCounts(p).total)} رأی از ${fa(st.students.length)}</span><button type="button" class="btn sm soft" data-act="pollCSV" data-id="${p.id}">📤 CSV آرا</button></div>
<div class="tw"><table class="tbl" style="min-width:420px"><thead><tr><th>دانش‌آموز</th><th>رأی</th></tr></thead><tbody>${rows}</tbody></table></div>`, true);
}
/* ---- quizzes ---- */
V.quizzes = function () {
const st = S(), t = isT();
if (!t && UI.run) return quizRunner();
const j = UI.qCal || jOf(todayISO());
const byDay = {};
for (const q of st.quizzes) { const d = iranISO(new Date(q.startAt)); (byDay[d] ||= []).push(q); }
let list = [...st.quizzes].sort((a, b) => new Date(b.startAt) - new Date(a.startAt));
if (UI.quizDay) list = list.filter(q => iranISO(new Date(q.startAt)) === UI.quizDay);
const cal = `<div class="card mb"><div class="spread mb"><h3>🗓️ تقویم شمسی آزمون‌ها</h3>${UI.quizDay ? '<button type="button" class="btn sm ghost" data-act="qDayClear">نمایش همه</button>' : ''}</div>
<div class="cnav"><button type="button" class="ib" data-act="qCalNav" data-d="-1">→</button><b>${JMONTHS[j.jm - 1]} ${fa(j.jy)}</b><button type="button" class="ib" data-act="qCalNav" data-d="1">←</button></div>
<div class="cal">${JWEEK.map(w => `<span class="ch">${w.slice(0, 3)}</span>`).join('')}${monthGrid(j.jy, j.jm).map(iso => {
if (!iso) return '<button type="button" class="cc" disabled></button>';
const qs = byDay[iso] || [], sel = UI.quizDay === iso;
return `<button type="button" class="cc ${iso === todayISO() ? 'today' : ''} ${wdIdx(iso) === 6 ? 'fri' : ''} ${sel ? 'sel' : ''}" data-act="qDayPick" data-iso="${iso}" title="${qs.length ? esc(qs.map(q => q.title).join(' • ')) : 'بدون آزمون'}">${fa(jOf(iso).jd)}${qs.length ? '<span class="cd"></span>' : ''}</button>`;
}).join('')}</div>
${UI.quizDay ? `<div class="mt small muted">آزمون‌های ${jLabel(UI.quizDay)}: ${fa(byDay[UI.quizDay]?.length || 0)}</div>` : ''}</div>`;
return pageHead('🧠 آزمون‌های زمان‌دار', t ? 'ساعت شروع/پایان با تقویم شمسی + نمرهٔ منفی + فقط یک‌بار شرکت' : 'در بازهٔ زمانی مقرر شرکت کنید؛ هر آزمون فقط یک‌بار',
t ? '<button type="button" class="btn sm" data-act="quizNew">➕ آزمون زمان‌دار</button>' : '') + cal +
(list.length ? list.map(q => quizCard(q, t)).join('') : `<div class="card">${empty('🧠', 'آزمونی نیست', t ? 'با آزمون‌ساز و تقویم شمسی شروع کنید.' : 'به‌زودی آزمون جدیدی می‌آید.', t ? '<button type="button" class="btn" data-act="quizNew">ساخت آزمون</button>' : '')}</div>`);
};
function quizCard(q, t) {
const st = S(), status = quizStatus(q);
const subs = t ? (q.submissions || {}) : (q.mySubmission ? { [SESS.sid]: q.mySubmission } : {});
const my = t ? null : q.mySubmission;
const scores = Object.values(subs).map(s => Math.max(0, s.score || 0));
const avg = scores.length ? Math.round(mean(scores)) : null;
const chip = status === 'active' ? `<span class="badge" style="background:${tint('#16a34a', .13)};color:#16a34a">🟢 در حال برگزاری</span>` : status === 'scheduled' ? `<span class="badge" style="background:${tint('#f59e0b', .13)};color:#d97706">⏳ زمان‌بندی‌شده</span>` : `<span class="badge" style="background:${tint('#7b7261', .13)};color:var(--muted)">⚪ پایان‌یافته</span>`;
const cd = status === 'scheduled' ? `<span class="chip acc">شروع تا <b data-cd="${q.startAt}">…</b></span>` : status === 'active' ? `<span class="chip" style="color:var(--anar)">پایان تا <b data-cd="${q.endAt}">…</b></span>` : '';
let sp = '';
if (!t) {
if (my) {
sp = `<div class="row mt">${q.resultsVisible && my.score != null ? donut([{ label: 'درست', color: '#16a34a', value: my.correct }, { label: 'نادرست', color: '#e11d48', value: my.wrong }, { label: 'نزده', color: '#9aa0a6', value: my.blank }], { size: 92, thick: 11, center: fa(my.score) + '٪', sub: 'نمرهٔ شما' }) : ''}
<div><span class="badge" style="background:${tint('#16a34a', .13)};color:#16a34a">🔒 شرکت کرده‌اید (یک‌بار مجاز)</span>${q.resultsVisible && my.score != null ? `<div class="row mt" style="gap:5px"><span class="chip" style="color:#16a34a">✅ ${fa(my.correct)}</span><span class="chip" style="color:#e11d48">❌ ${fa(my.wrong)}</span><span class="chip">⬜ ${fa(my.blank)}</span>${q.negative ? `<span class="chip">خام ${faNum(my.raw)}</span>` : ''}</div>` : '<div class="small muted">نتایج پس از اعلام معلم</div>'}</div></div>`;
} else if (status === 'active') sp = `<div class="mt"><button type="button" class="btn" data-act="quizStart" data-id="${q.id}">🚀 ${q.myAttempt ? 'ادامهٔ آزمون' : 'شروع آزمون'} (${fa(q.durationMin)} دقیقه)</button>${q.negative ? '<span class="chip" style="color:var(--anar);margin-inline-start:8px">⚠️ نمرهٔ منفی</span>' : ''}</div>`;
else sp = `<p class="small muted mt">${status === 'scheduled' ? '⏳ هنوز شروع نشده؛ در ساعت مقرر دکمهٔ شروع ظاهر می‌شود.' : 'این آزمون پایان یافته است.'}</p>`;
}
return `<div class="card mb" style="border-right:5px solid ${status === 'active' ? '#16a34a' : status === 'scheduled' ? '#f59e0b' : 'var(--line2)'}">
<div class="spread"><div><b style="font-size:1.05rem">🧠 ${esc(q.title)}</b>
<div class="row" style="gap:6px;margin-top:5px">${chip}${cd}<span class="chip">${fa(q.questions.length)} سؤال</span><span class="chip">⏱ ${fa(q.durationMin)} دقیقه</span>${q.negative ? `<span class="chip" style="color:var(--anar)">➖ منفی ${q.negRatio === 0.25 ? '¼' : q.negRatio === 0.5 ? '½' : q.negRatio === 1 ? 'کامل' : '⅓'}</span>` : ''}${t ? `<span class="chip acc">${fa(Object.keys(subs).length)}/${fa(st.students.length)} شرکت</span>${avg != null ? `<span class="chip">میانگین ${fa(avg)}٪</span>` : ''}` : ''}</div>
<div class="small muted" style="margin-top:5px">🗓️ شروع: ${dtLabel(q.startAt)} • پایان: ${dtLabel(q.endAt)}</div>${q.description ? `<p class="small muted">${esc(q.description)}</p>` : ''}</div>
${t ? `<div class="row" style="gap:5px">${status !== 'closed' ? `<button type="button" class="btn sm ghost" data-act="quizClose" data-id="${q.id}">⏹ پایان فوری</button>` : ''}<button type="button" class="btn sm ghost" data-act="quizRes" data-id="${q.id}">${q.resultsVisible ? '🙈 مخفی' : '👁 نمایش'}</button><button type="button" class="btn sm soft" data-act="quizResults" data-id="${q.id}">📊 نتایج</button><button type="button" class="ib sm" data-act="quizEdit" data-id="${q.id}">✏️</button><button type="button" class="ib sm" data-act="quizDel" data-id="${q.id}">🗑</button></div>` : ''}</div>${sp}</div>`;
}
function quizRunner() {
const q = S().quizzes.find(x => x.id === UI.run.qid);
if (!q) { UI.run = null; return V.quizzes(); }
const run = UI.run, qq = q.questions[run.idx];
return `<div class="card mb"><div class="spread"><div><b style="font-size:1.1rem">🧠 ${esc(q.title)}</b><div class="small muted">سؤال ${fa(run.idx + 1)} از ${fa(q.questions.length)} • ${fa(Object.keys(run.answers).length)} پاسخ • ${q.negative ? '⚠️ نمرهٔ منفی دارد' : 'بدون نمرهٔ منفی'}</div></div><div class="row"><span class="chip">⏱</span><span id="qTimer">--:--</span></div></div>
<div class="progress" style="margin-top:10px"><i style="width:${Math.round((run.idx + 1) / q.questions.length * 100)}%"></i></div></div>
<div class="card"><h3 style="font-size:1.2rem;margin-bottom:16px">${esc(qq.text)}</h3>
${qq.options.map((o, i) => `<button type="button" class="qopt ${run.answers[qq.id] === o.id ? 'sel' : ''}" data-act="quizOpt" data-qid="${qq.id}" data-oid="${o.id}"><span class="ql">${fa(i + 1)}</span>${esc(o.text)}</button>`).join('')}
<button type="button" class="btn sm ghost mb" data-act="quizClr" data-qid="${qq.id}">⬜ پاک کردن پاسخ</button>
<div class="spread mt"><button type="button" class="btn ghost" data-act="quizPrev" ${run.idx === 0 ? 'disabled' : ''}>→ قبلی</button>
<div class="row" style="gap:5px">${q.questions.map((x, i) => `<button type="button" class="qdot ${i === run.idx ? 'cur' : ''} ${run.answers[x.id] ? 'done' : ''}" data-act="quizJump" data-i="${i}">${fa(i + 1)}</button>`).join('')}</div>
${run.idx < q.questions.length - 1 ? '<button type="button" class="btn" data-act="quizNext">بعدی ←</button>' : '<button type="button" class="btn ok" data-act="quizSubmit">✅ ارسال نهایی</button>'}</div>
${run.idx < q.questions.length - 1 ? '<div class="mt" style="text-align:left"><button type="button" class="btn soft sm" data-act="quizSubmit">ارسال زودهنگام</button></div>' : ''}</div>`;
}
function quizResultsDrawer(qid) {
const st = S(), q = st.quizzes.find(x => x.id === qid); if (!q) return;
const subs = q.submissions || {};
const rows = st.students.map(s => {
const sub = subs[s.id];
return `<tr><td><b class="small">${esc(s.name)}</b></td>${sub ? `<td><span class="badge" style="background:${tint(sub.score >= 70 ? '#16a34a' : sub.score >= 40 ? '#f59e0b' : '#e11d48', .13)};color:${sub.score >= 70 ? '#16a34a' : sub.score >= 40 ? '#d97706' : '#e11d48'}">${fa(sub.score)}٪</span></td><td class="small">${fa(sub.correct)}✅ ${fa(sub.wrong)}❌ ${fa(sub.blank)}⬜</td>${q.questions.map(qq => { const a = sub.answers?.[qq.id]; return `<td>${a == null ? '⬜' : a === qq.correctOptionId ? '✅' : '❌'}</td>`; }).join('')}` : `<td colspan="${q.questions.length + 2}"><span class="chip">شرکت نکرده</span></td>`}</tr>`;
}).join('');
openDrawer('📊 نتایج: ' + q.title, `<div class="row mb"><span class="chip acc">${fa(Object.keys(subs).length)} شرکت از ${fa(st.students.length)}</span><button type="button" class="btn sm soft" data-act="quizCSV" data-id="${q.id}">📤 CSV نتایج</button></div>
<div class="tw"><table class="tbl"><thead><tr><th>دانش‌آموز</th><th>نمره</th><th>وضعیت</th>${q.questions.map((_, i) => `<th>س${fa(i + 1)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`, true);
}
/* ---- news ---- */
V.news = function () {
const st = S(), t = isT();
const list = [...st.news].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.date).localeCompare(String(a.date)));
const cards = list.map(n => `<div class="card mb ${n.pinned ? 'hero' : ''}"><div class="spread"><div class="row"><span style="font-size:1.35rem">${n.pinned ? '📌' : '📰'}</span><div><b>${esc(n.title)}</b><div class="small muted">${jLabel(n.date)}</div></div></div>
${t ? `<div class="row" style="gap:5px"><button type="button" class="ib sm" data-act="newsPin" data-id="${n.id}">${n.pinned ? '📍' : '📌'}</button><button type="button" class="ib sm" data-act="newsEdit" data-id="${n.id}">✏️</button><button type="button" class="ib sm" data-act="newsDel" data-id="${n.id}">🗑</button></div>` : ''}</div>
<p class="small" style="margin-top:8px;white-space:pre-wrap">${esc(n.body)}</p></div>`).join('');
const composer = t ? `<div class="card mb"><h3 class="mb">${UI.editNews ? '✏️ ویرایش خبر' : '📢 خبر جدید'}</h3><form data-form="news">
<div class="field"><label class="lbl">عنوان</label><input class="input" name="title" id="newsTitle" required value="${esc(UI.newsDraft?.title || '')}"></div>
<div class="field"><label class="lbl">متن</label><textarea class="input" name="body" rows="3" required>${esc(UI.newsDraft?.body || '')}</textarea></div>
<div class="row"><label class="row small bold" style="gap:8px;cursor:pointer"><span class="switch"><input type="checkbox" name="pinned" ${UI.newsDraft?.pinned ? 'checked' : ''}><i></i></span>📌 سنجاق</label><button class="btn" type="submit">${UI.editNews ? 'ذخیره' : 'انتشار برای همه'}</button>${UI.editNews ? '<button type="button" class="btn ghost" data-act="newsCancel">انصراف</button>' : ''}</div></form></div>` : '';
return pageHead('📢 اخبار و اطلاعیه‌ها', t ? 'انتشار خبر برای همهٔ دانش‌آموزان' : 'تازه‌های کلاس ما') + composer + (cards || `<div class="card">${empty('📭', 'خبری نیست', 'هنوز اطلاعیه‌ای منتشر نشده.')}</div>`);
};
/* ---- reports ---- */
V.reports = function () {
const st = S(), j = UI.repMonth || jOf(todayISO());
return pageHead('🖨️ مرکز گزارش و چاپ A4', 'خروجی رسمی، دقیقاً اندازهٔ برگهٔ A4، آمادهٔ چاپ و امضا') +
`<div class="grid g3 stagger mb">
<div class="card" style="--i:0"><h3 class="mb">🎓 کارنامهٔ رسمی</h3><p class="small muted mb">جدول دروس + حضور + انضباط + خلاصهٔ تحلیل هوشمند</p>
<select class="select mb" id="repStu">${st.students.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select>
<div class="row"><button type="button" class="btn soft sm" data-act="repStuPrev">👁 پیش‌نمایش</button><button type="button" class="btn sm" data-act="repStuPrint">🖨️ چاپ</button></div></div>
<div class="card" style="--i:1"><h3 class="mb">🧠 گزارش تحلیلی</h3><p class="small muted mb">رادار دروس، نقاط قوت/ضعف و برنامهٔ بهبود در یک برگه</p>
<select class="select mb" id="repAi">${st.students.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select>
<div class="row"><button type="button" class="btn soft sm" data-act="repAiPrev">👁 پیش‌نمایش</button><button type="button" class="btn ai sm" data-act="repAiPrint">🖨️ چاپ</button></div></div>
<div class="card" style="--i:2"><h3 class="mb">📋 گزارش جامع کلاس</h3><p class="small muted mb">همهٔ دانش‌آموزان: میانگین، حضور، امتیاز، ریسک و مسئولیت</p>
<div class="row"><button type="button" class="btn soft sm" data-act="repClassPrev">👁 پیش‌نمایش</button><button type="button" class="btn sm" data-act="repClassPrint">🖨️ چاپ</button></div></div>
</div>
<div class="grid g2">
<div class="card"><h3 class="mb">📅 گزارش حضور ماهانه</h3>
<div class="row mb"><select class="select" data-chg="repMonth" style="flex:2">${JMONTHS.map((m, i) => `<option value="${fa(i + 1)}" ${j.jm === i + 1 ? 'selected' : ''}>${m}</option>`).join('')}</select><select class="select" data-chg="repYear" style="flex:1">${[1404, 1405, 1406].map(y => `<option value="${fa(y)}" ${j.jy === y ? 'selected' : ''}>${fa(y)}</option>`).join('')}</select></div>
<div class="row"><button type="button" class="btn soft sm" data-act="repAttPrev">👁 پیش‌نمایش</button><button type="button" class="btn sm" data-act="repAttPrint">🖨️ چاپ</button></div></div>
<div class="card"><h3 class="mb">🔑 برگهٔ محرمانهٔ کدها</h3><p class="small muted mb">کد ورود همهٔ دانش‌آموزان؛ فقط نزد معلم نگهداری شود.</p>
<button type="button" class="btn warn" data-act="codesPrint">🖨️ چاپ محرمانه</button></div>
</div>`;
};
/* ---- CSV center ---- */
V.data = function () {
const st = S(), c = st.meta.csv, audits = audit(st);
return pageHead('🔄 ورود و خروج CSV', 'جابه‌جایی داده‌ها با اکسل و گوگل‌شیت — اعداد فارسی یا انگلیسی، تاریخ شمسی یا میلادی') +
`<div class="grid g2 mb" style="align-items:start">
<div class="card"><h3 class="mb">📤 خروجی CSV</h3>
<div class="grid g2"><div class="field"><label class="lbl">جداکننده</label><select class="select" data-chg="csvOpt" data-k="delim"><option value="," ${c.delim === ',' ? 'selected' : ''}>کاما (,)</option><option value=";" ${c.delim === ';' ? 'selected' : ''}>نقطه‌ویرگول (;)</option><option value="\\t" ${c.delim === '\\t' ? 'selected' : ''}>Tab</option></select></div>
<div class="field"><label class="lbl">قالب اعداد</label><select class="select" data-chg="csvOpt" data-k="digits"><option value="fa" ${c.digits === 'fa' ? 'selected' : ''}>فارسی (۱۲۳)</option><option value="en" ${c.digits === 'en' ? 'selected' : ''}>انگلیسی (123)</option></select></div></div>
<div class="grid g2"><div class="field"><label class="lbl">قالب تاریخ</label><select class="select" data-chg="csvOpt" data-k="dates"><option value="jalali" ${c.dates === 'jalali' ? 'selected' : ''}>شمسی (۱۴۰۵/۰۸/۳۰)</option><option value="greg" ${c.dates === 'greg' ? 'selected' : ''}>میلادی (2026-11-21)</option></select></div>
<div class="field"><label class="lbl">سازگاری با اکسل</label><div class="srow" style="border:none;padding:6px 0"><span class="sl small">افزودن BOM</span><span class="switch"><input type="checkbox" ${c.bom ? 'checked' : ''} data-chg="csvBool" data-k="bom"><i></i></span></div></div></div>
<div class="divider"></div><div class="grid g2">${Object.entries(CSV_KINDS).map(([k, v]) => `<button type="button" class="btn soft" data-act="csvExport" data-kind="${k}">${v.icon} ${v.l}</button>`).join('')}</div>
<p class="small muted mt">فایل‌ها با همان قالب بالا ساخته و مستقیماً در اکسل باز می‌شوند.</p></div>
<div class="card"><h3 class="mb">📥 ورود CSV</h3>
<div class="field"><label class="lbl">نوع داده</label><select class="select" data-chg="impKind">${Object.entries(CSV_KINDS).filter(([k]) => k !== 'analysis').map(([k, v]) => `<option value="${k}" ${UI.imp?.kind === k ? 'selected' : ''}>${v.icon} ${v.l}</option>`).join('')}</select></div>
<div class="row mb"><label class="btn soft" style="cursor:pointer">📂 انتخاب فایل CSV<input type="file" accept=".csv,.txt,text/csv" class="hidden" data-chg="impFile"></label><button type="button" class="btn ghost" data-act="impTpl">📄 دانلود نمونه</button></div>
<div class="field"><label class="lbl">یا محتوای CSV را اینجا بچسبانید</label><textarea class="input" id="impText" rows="5" placeholder="نام,کد,گروه&#10;علی محمدی,۱۲۳۴۵۶,دانش">${esc(UI.imp?.text || '')}</textarea></div>
<label class="row small bold mb" style="gap:8px;cursor:pointer"><span class="switch"><input type="checkbox" id="impCreate" checked><i></i></span>ساخت رکورد جدید در صورت نبود</label>
<button type="button" class="btn" data-act="impParse">🔍 بررسی و پیش‌نمایش</button>
<div id="impPrev" class="mt">${UI.imp?.parsed ? impPreview() : ''}</div></div>
</div>
<div class="card"><div class="spread mb"><h3>🩺 ممیزی هوشمند داده‌ها</h3><span class="chip acc">${fa(audits.length)} یافته</span></div>
${audits.map(x => `<div class="ins ${x.t}"><span class="ii">${x.i}</span><span style="flex:1">${esc(x.text)}</span>${x.fix ? `<button type="button" class="btn sm soft" data-act="auditFix" data-fix='${esc(JSON.stringify(x.fix))}'>اصلاح</button>` : ''}</div>`).join('')}
<div class="divider"></div><div class="row"><button type="button" class="btn soft" data-act="exportJSON">💾 پشتیبان JSON</button><label class="btn ghost" style="cursor:pointer">📥 بازیابی JSON<input type="file" accept=".json" class="hidden" data-chg="importJSON"></label></div></div>`;
};
function impPreview() {
const im = UI.imp; if (!im?.parsed) return '';
const F = IMP_FIELDS[im.kind] || [];
return `<div class="divider"></div><h3 class="mb">🔗 تطبیق ستون‌ها</h3>
${F.map(f => `<div class="cmap"><span class="small bold">${f.label}${f.req ? ' *' : ''}</span><select class="select" data-chg="impMap" data-f="${f.key}"><option value="">— نادیده —</option>${im.headers.map((h, i) => `<option value="${i}" ${im.map[f.key] === i ? 'selected' : ''}>${esc(h || 'ستون ' + (i + 1))}</option>`).join('')}</select></div>`).join('')}
<div class="row mt"><button type="button" class="btn soft sm" data-act="impCheck">✅ اعتبارسنجی</button></div>
${im.valid ? `<div class="divider"></div><div class="row mb"><span class="pill-ok">${fa(im.valid.ok.length)} ردیف معتبر</span>${im.valid.err.length ? `<span class="pill-err">${fa(im.valid.err.length)} خطا</span>` : ''}</div>
${im.valid.err.length ? `<div class="hscroll" style="max-height:150px">${im.valid.err.slice(0, 20).map(e => `<div class="ins bad"><span class="ii">⚠️</span><span>ردیف ${fa(e.row)}: ${esc(e.msg)}</span></div>`).join('')}</div>` : ''}
<div class="tw" style="max-height:260px"><table class="tbl" style="min-width:420px"><thead><tr>${im.headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${im.rows.slice(0, 8).map(r => `<tr>${im.headers.map((_, i) => `<td class="small">${esc(r[i] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
<button class="btn ok mt" data-act="impApply" ${im.valid.ok.length ? '' : 'disabled'}>📥 اعمال ${fa(im.valid.ok.length)} ردیف روی سرور</button>` : ''}`;
}
/* ---- settings ---- */
V.settings = function () {
const st = S(), ap = st.meta.appearance, vis = st.studentVisibility;
const accents = [['teal', 'فیروزه‌ای', '#0d9488'], ['lapis', 'لاجوردی', '#1d4ed8'], ['saffron', 'زعفرانی', '#d97706'], ['anar', 'اناری', '#e11d48'], ['pistachio', 'پسته‌ای', '#65a30d'], ['banafsh', 'بنفش', '#7c3aed']];
const fonts = [['vazirmatn', 'وزیرمتن'], ['yekan', 'یکان'], ['anjoman', 'انجمن'], ['vazir', 'وزیر'], ['nazanin', 'نازنین']];
const visKeys = [['grades', '📝 کارنامه و نمرات'], ['analysis', '🧠 تحلیل هوشمند'], ['group', '🧩 گروه من'], ['discipline', '⚖️ احکام و انضباط'], ['news', '📢 اخبار'], ['polls', '🗳️ نظرسنجی'], ['quizzes', '🧠 آزمون‌ها']];
return pageHead('⚙️ تنظیمات و شخصی‌سازی', 'تغییرات روی سرور ذخیره و برای همهٔ دانش‌آموزان اعمال می‌شود') +
`<div class="grid g2" style="align-items:start">
<div class="card"><h3 class="mb">🏫 هویت کلاس</h3>${[['school', 'نام مدرسه'], ['className', 'پایه / کلاس'], ['teacher', 'نام معلم'], ['year', 'سال تحصیلی']].map(([k, l]) => `<div class="field"><label class="lbl">${l}</label><input class="input" value="${esc(st.meta[k])}" data-inp="model" data-path="meta.${k}"></div>`).join('')}</div>
<div class="card"><h3 class="mb">🎨 ظاهر و قلم (برای همه)</h3>
<div class="field"><label class="lbl">رنگ اصلی</label><div class="row" style="gap:9px">${accents.map(([k, l, c]) => `<button type="button" class="sw ${ap.accent === k ? 'on' : ''}" style="background:linear-gradient(135deg,${c},${c}cc)" title="${l}" data-act="setAccent" data-v="${k}"></button>`).join('')}</div></div>
<div class="field"><label class="lbl">قلم سامانه</label><select class="select" data-chg="setFont">${fonts.map(([k, l]) => `<option value="${k}" ${ap.font === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
<div class="srow"><span class="sl">پوستهٔ پیش‌فرض</span><div class="seg"><button type="button" class="${ap.theme !== 'dark' ? 'on' : ''}" data-act="setTheme" data-v="light">☀️ روشن</button><button type="button" class="${ap.theme === 'dark' ? 'on' : ''}" data-act="setTheme" data-v="dark">🌙 تیره</button></div></div>
<div class="srow"><div><span class="sl">اندازهٔ قلم</span><span class="ss" id="fsVal">${fa(Math.round(ap.fontScale * 100))}٪</span></div><input type="range" min="0.85" max="1.3" step="0.05" value="${ap.fontScale}" data-inp="fontScale" style="max-width:170px"></div>
<div class="srow"><span class="sl">تراکم چیدمان</span><div class="seg"><button type="button" class="${ap.density !== 'compact' ? 'on' : ''}" data-act="setDensity" data-v="cozy">راحت</button><button type="button" class="${ap.density === 'compact' ? 'on' : ''}" data-act="setDensity" data-v="compact">فشرده</button></div></div>
<div class="srow"><span class="sl">نقش‌ونگار کاشی ایرانی</span><span class="switch"><input type="checkbox" ${ap.pattern ? 'checked' : ''} data-chg="setBool" data-path="meta.appearance.pattern"><i></i></span></div>
<div class="srow"><span class="sl">انیمیشن‌ها</span><span class="switch"><input type="checkbox" ${ap.anim ? 'checked' : ''} data-chg="setBool" data-path="meta.appearance.anim"><i></i></span></div>
<div class="srow"><span class="sl">صداهای سامانه (این دستگاه)</span><span class="switch"><input type="checkbox" ${Sound.on ? 'checked' : ''} data-chg="soundSet"><i></i></span></div></div>
<div class="card"><h3 class="mb">🧮 شیوهٔ ارزشیابی</h3>
<div class="seg mb"><button type="button" class="${st.meta.gradingMode === 'descriptive' ? 'on' : ''}" data-act="gradeMode" data-mode="descriptive">🌟 توصیفی</button><button type="button" class="${st.meta.gradingMode === 'numeric' ? 'on' : ''}" data-act="gradeMode" data-mode="numeric">🔢 عددی</button></div>
${st.meta.gradingMode === 'numeric' ? `<div class="grid g2"><div class="field"><label class="lbl">حداکثر</label><input type="text" inputmode="numeric" data-fa class="input" value="${fa(st.meta.numericMax)}" data-chg="modelNum" data-path="meta.numericMax"></div><div class="field"><label class="lbl">حداقل</label><input type="text" inputmode="numeric" data-fa class="input" value="${fa(st.meta.numericMin)}" data-chg="modelNum" data-path="meta.numericMin"></div></div>
<div class="grid g3">${[['excellent', 'خیلی خوب'], ['good', 'خوب'], ['acceptable', 'قابل قبول']].map(([k, l]) => `<div class="field"><label class="lbl">آستانهٔ ${l}</label><input type="text" inputmode="numeric" data-fa class="input" value="${fa(st.meta.numericThresholds[k])}" data-chg="modelNum" data-path="meta.numericThresholds.${k}"></div>`).join('')}</div>` : '<p class="small muted">سطوح توصیفی را در کارت بعدی شخصی‌سازی کنید.</p>'}
<div class="divider"></div><div class="row">${st.levels.map(l => `<span class="badge" style="background:${tint(l.color, .13)};color:${l.color}">${l.icon} ${esc(l.label)}</span>`).join('')}</div></div>
<div class="card"><h3 class="mb">🌟 سطوح ارزشیابی</h3>${st.levels.map((l, i) => `<div class="lrow"><input class="input" style="text-align:center;padding:8px 4px" value="${esc(l.icon)}" data-chg="levelField" data-i="${i}" data-f="icon" maxlength="4"><input class="input" value="${esc(l.label)}" data-inp="levelField" data-i="${i}" data-f="label"><input type="color" value="${l.color}" data-chg="levelField" data-i="${i}" data-f="color"><span class="badge" style="background:${tint(l.color, .13)};color:${l.color}">${l.icon}</span></div>`).join('')}</div>
<div class="card"><h3 class="mb">📚 درس‌های کلاس</h3><div id="subjWrap">${subjChips()}</div>
<div class="row mt"><input class="input" id="newSubj" placeholder="نام درس جدید…" style="flex:1"><button type="button" class="btn sm" data-act="subjAdd">➕ افزودن</button></div></div>
<div class="card"><h3 class="mb">🔐 دسترسی و امنیت</h3>${visKeys.map(([k, l]) => `<div class="srow"><span class="sl">${l}</span><span class="switch"><input type="checkbox" ${vis[k] !== false ? 'checked' : ''} data-chg="visibility" data-k="${k}"><i></i></span></div>`).join('')}
<div class="srow"><div><span class="sl">🛡️ محافظ حریم صفحه</span><span class="ss">با رفتن به تب دیگر، محتوا پنهان می‌شود</span></div><span class="switch"><input type="checkbox" ${st.antiScreenshot ? 'checked' : ''} data-chg="setBool" data-path="antiScreenshot"><i></i></span></div>
<div class="divider"></div>
<div class="srow"><span class="sl">کد مدیریت</span><span class="row" style="gap:6px"><span class="chip mono" id="tcShow">••••••</span><button type="button" class="ib sm" data-act="tcReveal">👁</button></span></div>
<form data-form="code"><div class="field"><label class="lbl">تغییر کد مدیریت</label><div class="row"><input class="input" type="password" data-fa name="code" autocomplete="new-password" placeholder="حداقل ۴ رقم" style="flex:1"><button class="btn sm warn" type="submit">تغییر</button></div></div></form>
<div class="srow"><div><span class="sl">🔄 تولید کدهای جدید</span><span class="ss">کدهای قبلی باطل می‌شوند</span></div><button type="button" class="btn sm ghost" data-act="regenCodes">تولید</button></div></div>
<div class="card"><h3 class="mb">♻️ بازنشانی داده‌ها</h3><p class="small muted mb">داده‌های واقعی کلاس (۲۸ دانش‌آموز، ۴۰ ارزشیابی، ۳۰ روز حضور، ۵۴ رویداد انضباطی و ۵ گروه) دوباره روی سرور بارگذاری می‌شود.</p>
<button type="button" class="btn danger" data-act="resetReal">بازنشانی به داده‌های واقعی</button></div>
</div>`;
};
const subjChips = () => S().subjects.map((s, i) => `<span class="schip" draggable="true" data-drag='{"t":"s","i":${i}}' data-drop="s" data-i="${i}"><span>${esc(s)}</span><button type="button" data-act="subjMove" data-i="${i}" data-d="-1">↑</button><button type="button" data-act="subjMove" data-i="${i}" data-d="1">↓</button><button type="button" data-act="subjDel" data-i="${i}">✕</button></span>`).join('');
/* ================= views: student ================= */
V.report = function () {
const st = S(), m = me(), vis = st.studentVisibility, my = stats(st, m.id);
const latest = {};
for (const a of [...st.assessments].sort((x, y) => String(x.date).localeCompare(String(y.date)))) for (const sub of a.subjects) { const g = st.grades?.[a.id]?.[sub]?.[m.id]; if (g != null) latest[sub] = g; }
const cards = st.subjects.filter(s => latest[s] !== undefined).map((sub, i) => {
const l = levelFor(st, latest[sub]), tr = subjectSeries(st, m.id, sub).map(x => x.score);
return `<div class="card subcard hov" style="--i:${i}"><div class="sn">${esc(sub)}</div>${gradeBadge(latest[sub])}<div style="margin-top:8px">${spark(tr, l?.color || '#0d9488')}</div><div class="small muted">${fa(tr.length)} نمره</div></div>`;
}).join('');
const agg = st.aggregates, g = groupOf(st, m.id), roles = myRoles(st, m.id);
return `<div class="card hero mb"><div class="spread"><div class="row" style="gap:16px">${avHTML(m, 'lg')}<div><h1 style="font-size:1.5rem">${esc(m.name)}</h1>
<div class="row" style="gap:6px">${roles.map(r => `<span class="chip" style="color:${ROLES[r].color}">${ROLES[r].icon} ${ROLES[r].label}</span>`).join('')}${leaderGids(st, m.id).length ? '<span class="chip" style="color:#d97706">🏅 سرگروه</span>' : ''}${g ? `<span class="chip" style="color:${g.color}">${esc(g.name)}</span>` : ''}<span class="chip mono">کد ${fa(m.code)}</span></div></div></div>
<div class="row" style="gap:10px">${my.cnt ? avgBadge(my.avg) : ''}${agg?.myRank ? `<span class="badge" style="background:${tint('#f59e0b', .14)};color:#d97706">🏆 رتبه ${fa(agg.myRank)} از ${fa(agg.gradedStudents)}</span>` : ''}<button type="button" class="btn sm ai" data-act="nav" data-sec="ai">🧠 تحلیل من</button><button type="button" class="btn sm soft" data-act="printOwn">🖨️ کارنامه</button></div></div></div>
${vis.grades !== false ? `<h3 class="mb">📚 کارنامهٔ درسی</h3><div class="grid g4 stagger mb">${cards || `<div class="card" style="grid-column:1/-1">${empty('🌱', 'نمره‌ای ثبت نشده', 'پس از ارزشیابی معلم، کارنامه اینجا نمایش داده می‌شود.')}</div>`}</div>` : `<div class="card mb">${empty('🔒', 'نمایش نمرات غیرفعال است', 'معلم نمایش کارنامه را موقتاً بسته است.')}</div>`}
<div class="grid g3">
<div class="card"><h3 class="mb">📅 حضور من</h3><div class="row mb"><span class="badge" style="font-size:1rem;background:${tint('#16a34a', .13)};color:#16a34a">${fa(my.attRate)}٪</span><span class="chip">${fa(my.total)} روز</span><span class="chip" style="color:#e11d48">${fa(my.absent)} غیبت</span></div><button type="button" class="btn sm soft" data-act="nav" data-sec="attendance">تاریخچهٔ کامل ←</button></div>
<div class="card"><h3 class="mb">⭐ امتیاز من</h3><div class="row"><span class="badge" style="font-size:1rem;background:${tint(my.pts >= 0 ? '#16a34a' : '#e11d48', .13)};color:${my.pts >= 0 ? '#16a34a' : '#e11d48'}">${my.pts > 0 ? '+' : ''}${fa(my.pts)} انضباطی</span>${my.lpts ? `<span class="badge" style="background:${tint('#f59e0b', .13)};color:#d97706">🏅 ${fa(my.lpts)} مدیریتی</span>` : ''}</div><div class="mt"><button type="button" class="btn sm soft" data-act="nav" data-sec="myCourt">جزئیات ←</button></div></div>
${g ? `<div class="card"><h3 class="mb">🧩 گروه من</h3><div class="row mb"><span class="av" style="background:${g.color}">🚩</span><div><b>${esc(g.name)}</b><div class="small muted">${fa(g.members.length)} عضو</div></div></div><button type="button" class="btn sm soft" data-act="nav" data-sec="group">جزئیات ←</button></div>` : ''}
</div>`;
};
V.myAttendance = function () {
const st = S(), m = me();
const recs = Object.keys(st.attendance || {}).filter(d => st.attendance[d][m.id]).sort().reverse();
const c = { present: 0, late: 0, absent: 0, excused: 0 };
recs.forEach(d => c[st.attendance[d][m.id]]++);
const rate = recs.length ? Math.round((c.present + c.late) / recs.length * 100) : 0;
return pageHead('📅 حضور و غیاب من', `تاریخچهٔ کامل ${fa(recs.length)} روز ثبت‌شده`) +
`<div class="grid g2" style="align-items:start"><div class="card"><div class="row mb" style="justify-content:center;gap:20px">${donut(Object.entries(ATT).map(([k, a]) => ({ label: a.label, color: a.color, value: c[k] })), { center: fa(rate) + '٪', sub: 'نرخ حضور' })}<div class="legend">${Object.entries(ATT).map(([k, a]) => `<div class="li"><span class="dot" style="background:${a.color}"></span>${a.label}<b style="margin-inline-start:auto">${fa(c[k])}</b></div>`).join('')}</div></div>
<div class="divider"></div>${calHTML(UI.attCal || jOf(todayISO()), 'my')}</div>
<div class="card" style="padding:6px 0"><div style="padding:12px 16px"><h3>📜 همهٔ روزها</h3></div><div class="hscroll">
${recs.map(d => { const a = ATT[st.attendance[d][m.id]]; return `<div class="arow"><span class="achip" style="background:${tint(a.color, .13)};color:${a.color}">${a.icon} ${a.label}</span><span style="flex:1" class="small bold">${weekDay(d)} ${jLabel(d)}</span></div>`; }).join('') || empty('🗓️', 'سابقه‌ای نیست', '')}</div></div></div>`;
};
V.myCourt = function () {
const st = S(), sid = SESS.sid;
const verdicts = st.reports.filter(r => r.target === sid && r.status === 'approved').sort((a, b) => String(b.date).localeCompare(String(a.date)));
const events = st.discipline.filter(r => r.sid === sid).sort((a, b) => String(b.date).localeCompare(String(a.date)));
const my = stats(st, sid);
return pageHead('⚖️ احکام و انضباط من', 'آرای قطعی دادگاه کلاس و رویدادهای انضباطی', `<span class="badge" style="font-size:1rem;background:${tint(my.pts >= 0 ? '#16a34a' : '#e11d48', .13)};color:${my.pts >= 0 ? '#16a34a' : '#e11d48'}">${my.pts > 0 ? '+' : ''}${fa(my.pts)} امتیاز</span>`) +
(verdicts.length ? verdicts.map(r => `<div class="card mb" style="border-right:5px solid ${r.verdict.type === 'acquittal' ? '#16a34a' : '#8b5cf6'}"><div class="spread mb"><b>${r.verdict.type === 'acquittal' ? '🕊️' : '⚖️'} ${esc(r.title)}</b><span class="chip">${jLabel(r.verdict.date)}</span></div><div class="vbox ${r.verdict.type === 'acquittal' ? 'acq' : ''}"><p class="small">${esc(r.verdict.text)}</p></div></div>`).join('') : `<div class="card mb">${empty('🕊️', 'رأیی علیه شما نیست', 'آفرین! کلاس به انضباط تو افتخار می‌کند.')}</div>`) +
`<h3 class="mb">⭐ رویدادهای انضباطی (${fa(events.length)})</h3><div class="card" style="padding:6px 0"><div class="hscroll">${events.map(r => `<div class="arow"><span class="badge" style="background:${tint(r.points > 0 ? '#16a34a' : '#e11d48', .13)};color:${r.points > 0 ? '#16a34a' : '#e11d48'}">${r.points > 0 ? '+' : ''}${fa(r.points)}</span><span style="flex:1" class="small">${r.by === 'court' ? '⚖️ ' : ''}${esc(r.reason)}</span><span class="small muted">${jLabel(r.date)}</span></div>`).join('') || empty('🌱', 'رویدادی نیست', '')}</div></div>`;
};
V.myGroup = function () {
const st = S(), sid = SESS.sid, g = groupOf(st, sid);
if (!g) return pageHead('🧩 گروه من', '') + `<div class="card">${empty('🧩', 'گروهی ندارید', 'معلم هنوز شما را در گروهی قرار نداده.')}</div>`;
const gs = st.aggregates?.groupSummary?.[g.id] || groupStats(st, g);
const leader = stuById(st, g.leader);
return pageHead('🧩 گروه من', 'کار گروهی و رقابت سالم') +
`<div class="card hero mb"><div class="spread"><div class="row" style="gap:14px"><span class="av lg" style="background:${g.color}">🚩</span><div><h1 style="font-size:1.45rem">${esc(g.name)}</h1><span class="chip">${fa(g.members.length)} عضو</span></div></div>${gs.rank ? `<span class="badge" style="font-size:1rem;background:${tint('#f59e0b', .14)};color:#d97706">${gs.rank === 1 ? '👑' : ''} رتبه ${fa(gs.rank)} از ${fa(gs.totalGroups || st.groups.length)}</span>` : ''}</div></div>
<div class="grid g3 mb">
<div class="card stat"><span class="si" style="background:linear-gradient(135deg,#0d9488,#1d4ed8)">📊</span><div><b>${gs.avg ? avgBadge(gs.avg) : '—'}</b><span>میانگین گروه</span></div></div>
<div class="card stat"><span class="si" style="background:linear-gradient(135deg,#16a34a,#84cc16)">📅</span><div><b>${fa(gs.attRate)}٪</b><span>حضور گروه</span></div></div>
<div class="card stat"><span class="si" style="background:linear-gradient(135deg,#f59e0b,#e11d48)">⭐</span><div><b>${fa(gs.pts)}</b><span>امتیاز گروه</span></div></div></div>
${leader ? `<div class="card mb"><div class="row">${avHTML(leader, 'lg')}<div><b>سرگروه: ${esc(leader.name)} 🏅</b><div class="small muted">برای رفع اشکال به او مراجعه کن</div></div></div></div>` : ''}
<div class="card"><h3 class="mb">👥 اعضا</h3><div class="row">${g.members.map(m => { const s = stuById(st, m); return s ? `<span class="mchip" style="cursor:default;${m === sid ? `border-color:${g.color};background:${tint(g.color, .1)}` : ''}">${avHTML(s, 'sm')}${esc(s.name)}${m === sid ? ' ⭐' : ''}${g.leader === m ? ' 🏅' : ''}</span>` : ''; }).join('')}</div></div>`;
};
V.repPanel = function () { return reporterPanel('rep'); };
V.mayorPanel = function () {
const st = S(), sid = SESS.sid, perf = reporterPerf(st, sid);
const today = st.inspections.find(x => x.by === sid && x.date === todayISO());
const items = { board: '🧽 تخته پاک است', floor: '🧹 کف کلاس تمیز است', bin: '🗑️ سطل تخلیه شده', desks: '🪑 نیمکت‌ها مرتب است' };
return pageHead('🏙️ پنل شهردار کلاس', 'نظافت و ظاهر کلاس با توست', `<span class="badge" style="background:${tint('#0ea5e9', .13)};color:#0ea5e9">⭐ ${fa(perf.score)}</span>`) +
`<div class="grid g2" style="align-items:start"><div>
<div class="card mb"><h3 class="mb">🧹 بازرسی امروز</h3><form data-form="inspect">
${Object.entries(items).map(([k, l]) => `<div class="srow"><span class="sl">${l}</span><span class="switch"><input type="checkbox" name="${k}" ${today ? (today.items[k] ? 'checked' : '') : 'checked'}><i></i></span></div>`).join('')}
<div class="field mt"><label class="lbl">یادداشت</label><input class="input" name="note" value="${esc(today?.note || '')}"></div>
<button class="btn" type="submit">🧹 ${today ? 'به‌روزرسانی' : 'ثبت بازرسی'}</button></form></div>
<div class="card"><h3 class="mb">📮 گزارش تخلف نظافت</h3><form data-form="report" data-kind="cleanliness">
${reportFormFields(st, sid)}
<button class="btn" type="submit">📨 ارسال به معلم</button></form></div></div>
<div>${reporterTrack(sid)}</div></div>`;
};
function reporterPanel(kind) {
const st = S(), sid = SESS.sid, perf = reporterPerf(st, sid), role = ROLES[kind];
return pageHead(`${role.icon} پنل ${role.label}`, 'گزارش‌های تو پس از تأیید معلم به قاضی می‌رود', `<span class="badge" style="background:${tint(role.color, .13)};color:${role.color}">⭐ ${fa(perf.score)}</span>`) +
`<div class="grid g2" style="align-items:start"><div class="card"><h3 class="mb">📮 ثبت گزارش انضباطی</h3><form data-form="report" data-kind="discipline">
${reportFormFields(st, sid)}
<button class="btn" type="submit">📨 ارسال به معلم</button></form>
<div class="divider"></div><div class="row"><span class="chip">ارسال ${fa(perf.sent)}</span><span class="chip" style="color:#16a34a">تأیید ${fa(perf.ok)}</span><span class="chip" style="color:#e11d48">رد ${fa(perf.no)}</span></div></div>
<div>${reporterTrack(sid)}</div></div>`;
}
function reportFormFields(st, sid) {
return `<div class="field"><label class="lbl">دانش‌آموز</label><select class="select" name="target" required><option value="">انتخاب…</option>${st.students.filter(s => s.id !== sid).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
<div class="field"><label class="lbl">عنوان تخلف</label><input class="input" name="title" required placeholder="مثلاً: بی‌نظمی هنگام درس"></div>
<div class="field"><label class="lbl">شرح دقیق مشاهده</label><textarea class="input" name="description" rows="4" required placeholder="دقیق و منصفانه بنویس؛ قاضی بر اساس همین متن بررسی می‌کند."></textarea></div>
<div class="field"><label class="lbl">شدت</label><select class="select" name="severity"><option value="۱">🔴 کم</option><option value="۲">🔴🔴 متوسط</option><option value="۳">🔴🔴🔴 زیاد</option></select></div>`;
}
function reporterTrack(sid) {
const st = S(), mine = st.reports.filter(r => r.by === sid).sort((a, b) => String(b.date).localeCompare(String(a.date)));
return `<div class="card" style="padding:6px 0"><div style="padding:12px 16px"><h3>📜 گزارش‌های من (${fa(mine.length)})</h3></div><div class="hscroll">
${mine.map(r => { const rs = RSTAT[r.status]; return `<div class="arow"><span>${r.type === 'cleanliness' ? '🧹' : '📋'}</span><div style="flex:1"><b class="small">${esc(r.title)}</b><div class="small muted">${esc(stuById(st, r.target)?.name || '')} • ${jLabel(r.date)}</div></div><span class="badge" style="background:${tint(rs.c, .13)};color:${rs.c}">${rs.i} ${rs.l}</span></div>`; }).join('') || empty('📭', 'گزارشی ثبت نکرده‌ای', '')}</div></div>`;
}
V.judgePanel = function () {
const st = S(), sid = SESS.sid, perf = judgePerf(st, sid);
const inbox = st.reports.filter(r => r.status === 'to_judge');
const done = st.reports.filter(r => r.verdict && r.verdict.by === sid);
return pageHead('⚖️ پنل قاضی کلاس', 'بررسی منصفانه و رأی مستدل؛ هر رأی تأییدشده +۳ و هر برگشت −۲ امتیاز', `<span class="badge" style="background:${tint('#8b5cf6', .13)};color:#8b5cf6">🏅 ${fa(perf.score)}</span>`) +
`<div class="grid g4 mb stagger">${[['📥', inbox.length, 'در انتظار رأی', '#8b5cf6'], ['🔨', perf.issued, 'رأی صادرشده', '#1d4ed8'], ['✅', perf.ok, 'تأییدشده', '#16a34a'], ['🎯', perf.acc + '٪', 'دقت آرا', '#f59e0b']].map(([i, v, l, c], k) => `<div class="card stat" style="--i:${k};padding:13px"><span class="si" style="background:${c};width:42px;height:42px;font-size:1.2rem">${i}</span><div><b style="font-size:1.3rem">${fa(v)}</b><span>${l}</span></div></div>`).join('')}</div>
<h3 class="mb">📥 پرونده‌های در انتظار</h3>${inbox.length ? `<div class="grid g2 stagger mb">${inbox.map((r, i) => caseCard(r, i)).join('')}</div>` : `<div class="card mb">${empty('🕊️', 'پرونده‌ای نیست', 'همهٔ پرونده‌ها بررسی شده‌اند.')}</div>`}
<h3 class="mb">📜 آرای من</h3>${done.length ? `<div class="grid g2">${done.map(r => { const rs = RSTAT[r.status]; return `<div class="card ccard" style="--cc:${rs.c}" data-act="caseOpen" data-id="${r.id}"><div class="spread"><div><b class="small">${r.verdict.type === 'acquittal' ? '🕊️' : '🔨'} ${esc(r.title)}</b><div class="small muted">${esc(stuById(st, r.target)?.name || '')} • ${jLabel(r.verdict.date)}</div></div><span class="badge" style="background:${tint(rs.c, .13)};color:${rs.c}">${rs.i} ${rs.l}</span></div></div>`; }).join('')}</div>` : `<div class="card">${empty('📜', 'رأیی صادر نکرده‌ای', '')}</div>`}`;
};
V.leaderPanel = function () {
const st = S(), sid = SESS.sid, gids = leaderGids(st, sid);
const logs = st.leaderLogs.filter(l => l.leader === sid).sort((a, b) => String(b.date).localeCompare(String(a.date)));
return pageHead('🏅 پنل سرگروهی', 'ثبت وضعیت تکالیف اعضا؛ یاد دادن به دیگران امتیاز مدیریتی دارد',
`<span class="badge" style="background:${tint('#f59e0b', .13)};color:#d97706">🏅 ${fa(leaderPts(st, sid))}</span><label class="btn sm soft" style="cursor:pointer">📷 عکس من<input type="file" accept="image/*" class="hidden" data-chg="photo" data-sid="${sid}"></label>`) +
`<div class="grid g2" style="align-items:start"><div>${gids.map(gid => {
const g = st.groups.find(x => x.id === gid), gs = st.aggregates?.groupSummary?.[gid] || groupStats(st, g);
return `<div class="card mb gcard" style="--gc:${g.color}"><div class="spread mb"><b>${esc(g.name)}</b><span class="chip">${fa(g.members.length)} عضو • حضور ${fa(gs.attRate)}٪</span></div>
${g.members.filter(m => m !== sid).map(mid => {
const m = stuById(st, mid), ms = statOf(mid), tl = logs.find(l => l.member === mid && l.date === todayISO());
return `<div class="lm"><div class="row mb">${avHTML(m, 'sm')}<b class="small" style="flex:1">${esc(m.name)}</b>${ms?.cnt ? avgBadge(ms.avg) : ''}<span class="chip">حضور ${fa(ms?.attRate || 0)}٪</span></div>
<form data-form="leaderLog"><input type="hidden" name="gid" value="${g.id}"><input type="hidden" name="member" value="${mid}">
<div class="row" style="gap:8px"><select class="select" name="homework" style="max-width:170px">${Object.entries(HW).map(([k, h]) => `<option value="${k}" ${tl?.homework === k ? 'selected' : ''}>${h.i} ${h.l}</option>`).join('')}</select>
<label class="row small bold" style="gap:6px;cursor:pointer"><span class="switch"><input type="checkbox" name="help" ${tl?.help ? 'checked' : ''}><i></i></span>📚 یاد دادم (+۱)</label></div>
<div class="row" style="gap:8px;margin-top:8px"><input class="input" name="note" style="flex:1" value="${esc(tl?.note || '')}" placeholder="چه ایرادی داشت؟ چه یاد دادی؟"><button class="btn sm" type="submit">${tl ? 'به‌روزرسانی' : 'ثبت'}</button></div></form></div>`;
}).join('')}</div>`;
}).join('')}</div>
<div class="card" style="padding:6px 0"><div style="padding:12px 16px"><h3>📜 گزارش‌های من (${fa(logs.length)})</h3></div><div class="hscroll">
${logs.map(l => { const hw = HW[l.homework]; return `<div class="arow"><div style="flex:1"><b class="small">${esc(stuById(st, l.member)?.name || '—')}</b><div class="small muted">${jLabel(l.date)}${l.note ? ' • ' + esc(l.note) : ''}</div></div><span class="badge" style="background:${tint(hw.c, .12)};color:${hw.c}">${hw.i} ${hw.l}</span><span class="chip">+${fa(l.points)}🏅</span></div>`; }).join('') || empty('📭', 'گزارشی نیست', '')}</div></div></div>`;
};
/* ================= forms ================= */
function jDateSelects(pre) {
const iso = UI.jdate[pre] || todayISO(), j = jOf(iso);
return `<div class="row" style="gap:6px">
<select class="select" data-chg="jdate" data-p="d" data-pre="${pre}" style="flex:1">${Array.from({ length: Jalali.monthLen(j.jy, j.jm) }, (_, i) => `<option value="${fa(i + 1)}" ${j.jd === i + 1 ? 'selected' : ''}>${fa(i + 1)}</option>`).join('')}</select>
<select class="select" data-chg="jdate" data-p="m" data-pre="${pre}" style="flex:2">${JMONTHS.map((m, i) => `<option value="${fa(i + 1)}" ${j.jm === i + 1 ? 'selected' : ''}>${m}</option>`).join('')}</select>
<select class="select" data-chg="jdate" data-p="y" data-pre="${pre}" style="flex:1.4">${[1404, 1405, 1406, 1407].map(y => `<option value="${fa(y)}" ${j.jy === y ? 'selected' : ''}>${fa(y)}</option>`).join('')}</select></div>`;
}
function genCode() { const used = new Set(S().students.map(s => s.code).filter(Boolean)); let c; do { c = String(Math.floor(100000 + Math.random() * 900000)); } while (used.has(c)); return c; }
function stuForm(s) {
const st = S();
return `<form data-form="stu"><input type="hidden" name="id" value="${s?.id || ''}">
<div class="field" style="text-align:center">${avHTML(s || { name: '؟' }, 'lg')}${s ? `<div class="mt"><label class="btn sm ghost" style="cursor:pointer">📷 عکس<input type="file" accept="image/*" class="hidden" data-chg="photo" data-sid="${s.id}"></label></div>` : ''}</div>
<div class="field"><label class="lbl">نام و نام خانوادگی</label><input class="input" name="name" required value="${esc(s?.name || '')}"></div>
<div class="field"><label class="lbl">کد ورود ۶ رقمی</label><div class="row"><input class="input mono" data-fa inputmode="numeric" name="code" required maxlength="6" value="${fa(s?.code || genCode())}" style="flex:1;direction:ltr;text-align:center;letter-spacing:4px"><button type="button" class="btn sm soft" data-act="stuGen">🎲</button></div></div>
<div class="field"><label class="lbl">گروه</label><select class="select" name="group"><option value="">بدون گروه</option>${st.groups.map(g => `<option value="${g.id}" ${s && g.members.includes(s.id) ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></div>
<button class="btn" type="submit" style="width:100%">💾 ${s ? 'ذخیرهٔ ویرایش' : 'افزودن'}</button></form>`;
}
function stuDetail(sid) {
const st = S(), s = stuById(st, sid); if (!s) return;
const b = stats(st, sid), g = groupOf(st, sid), a = aiStudent(st, sid);
const latest = {};
for (const x of [...st.assessments].sort((p, q) => String(p.date).localeCompare(String(q.date)))) for (const sub of x.subjects) { const gr = st.grades?.[x.id]?.[sub]?.[sid]; if (gr != null) latest[sub] = gr; }
const dates = Object.keys(st.attendance).sort().slice(-20);
const disc = st.discipline.filter(r => r.sid === sid).slice(-6).reverse();
openDrawer('👦 ' + s.name, `
<div class="row mb" style="gap:14px">${avHTML(s, 'lg')}<div><b style="font-size:1.1rem">${esc(s.name)}</b><div class="row" style="gap:6px"><span class="chip mono">${fa(s.code)}</span>${g ? `<span class="chip" style="color:${g.color}">${esc(g.name)}</span>` : ''}${myRoles(st, sid).map(r => `<span class="chip" style="color:${ROLES[r].color}">${ROLES[r].icon}</span>`).join('')}</div></div></div>
<div class="row mb" style="gap:8px">${b.cnt ? avgBadge(b.avg) : ''}<span class="chip">حضور ${fa(b.attRate)}٪</span><span class="chip">انضباط ${fa(b.pts)}</span><span class="chip">🏅 ${fa(b.lpts)}</span>${a ? `<span class="badge" style="background:${tint(a.riskLevel.c, .13)};color:${a.riskLevel.c}">${a.riskLevel.i} ریسک ${fa(a.risk)}</span>` : ''}</div>
<div class="row mb"><button type="button" class="btn sm ai" data-act="aiOpen" data-id="${sid}">🧠 تحلیل هوشمند</button><button type="button" class="btn sm" data-act="stuReport" data-id="${sid}">🖨️ کارنامه</button><button type="button" class="btn sm soft" data-act="stuEdit" data-id="${sid}">✏️ ویرایش</button><button type="button" class="btn sm ghost" data-act="stuRegen" data-id="${sid}">🔄 کد جدید</button></div>
<div class="divider"></div><h3 class="mb">📚 آخرین وضعیت دروس</h3>
<div class="row mb">${Object.entries(latest).map(([sub, gr]) => `<span class="chip" style="gap:7px">${esc(sub)} ${gradeBadge(gr)}</span>`).join('') || '<span class="small muted">نمره‌ای نیست.</span>'}</div>
<h3 class="mb">📅 ۲۰ روز اخیر حضور</h3><div class="row mb">${dates.map(d => { const v = st.attendance[d][sid], x = v ? ATT[v] : null; return `<span class="achip" title="${jLabel(d)}" style="background:${x ? tint(x.color, .13) : 'var(--surface2)'};color:${x ? x.color : 'var(--muted)'}">${fa(jOf(d).jd)} ${x ? x.icon : '·'}</span>`; }).join('')}</div>
<h3 class="mb">⭐ رویدادهای انضباطی</h3>${disc.map(r => `<div class="row" style="padding:6px 0;border-bottom:1px dashed var(--line)"><span class="badge" style="background:${tint(r.points > 0 ? '#16a34a' : '#e11d48', .12)};color:${r.points > 0 ? '#16a34a' : '#e11d48'}">${r.points > 0 ? '+' : ''}${fa(r.points)}</span><span class="small" style="flex:1">${esc(r.reason)}</span><span class="small muted">${jShort(r.date)}</span></div>`).join('') || '<p class="small muted">رویدادی نیست.</p>'}`, true);
}
function asmtForm(a) {
const st = S(); UI.jdate.asmt = a?.date || todayISO();
return `<form data-form="asmt"><input type="hidden" name="id" value="${a?.id || ''}">
<div class="field"><label class="lbl">عنوان ارزشیابی</label><input class="input" name="title" required value="${esc(a?.title || '')}" placeholder="مثلاً: پرسش ریاضی فصل ۳"></div>
<div class="field"><label class="lbl">تاریخ (شمسی)</label>${jDateSelects('asmt')}</div>
<div class="field"><label class="lbl">نوع</label><select class="select" name="type">${Object.entries(ATYPE).map(([k, l]) => `<option value="${k}" ${(a?.type || 'oral') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
<div class="field"><label class="lbl">درس‌ها</label><div class="row">${st.subjects.map(sub => `<label class="chip" style="cursor:pointer;gap:6px"><input type="checkbox" class="cb" name="sub" value="${esc(sub)}" ${a?.subjects.includes(sub) ? 'checked' : ''}> ${esc(sub)}</label>`).join('')}</div></div>
<div class="field"><label class="lbl">توضیح</label><input class="input" name="description" value="${esc(a?.description || '')}"></div>
<button class="btn" type="submit" style="width:100%">💾 ${a ? 'ذخیرهٔ ویرایش' : 'ساخت ارزشیابی'}</button></form>`;
}
function pollForm(p, type) {
UI.draftP = p ? clone(p) : { id: '', type: type || 'choice', question: '', options: type === 'yesno' ? [{ id: 'yes', text: 'بله، موافقم' }, { id: 'no', text: 'خیر' }] : [{ id: uid(), text: '' }, { id: uid(), text: '' }, { id: uid(), text: '' }], candidates: [], targetRole: 'judge', showResults: true };
return pollFormBody();
}
function pollFormBody() {
const d = UI.draftP, el = d.type === 'election';
return `<form data-form="poll">
<div class="field"><label class="lbl">نوع</label><select class="select" data-chg="dpType" ${d.id ? 'disabled' : ''}>${Object.entries(PTYPES).map(([k, t]) => `<option value="${k}" ${d.type === k ? 'selected' : ''}>${t.i} ${t.l}</option>`).join('')}</select></div>
<div class="field"><label class="lbl">پرسش</label><input class="input" value="${esc(d.question)}" data-inp="dp" data-f="question" required></div>
${el ? `<div class="field"><label class="lbl">سمت</label><select class="select" data-chg="dpRole">${Object.entries(ROLES).map(([k, r]) => `<option value="${k}" ${d.targetRole === k ? 'selected' : ''}>${r.icon} ${r.label}</option>`).join('')}</select></div>
<div class="field"><label class="lbl">نامزدها (حداقل ۲)</label><div class="row" style="max-height:230px;overflow:auto">${S().students.map(s => `<label class="chip" style="cursor:pointer;gap:6px"><input type="checkbox" class="cb" data-chg="dpCand" value="${s.id}" ${d.candidates.includes(s.id) ? 'checked' : ''}> ${esc(s.name)}</label>`).join('')}</div></div>`
: d.type === 'rating' || d.type === 'yesno' ? '<p class="small muted mb">گزینه‌ها خودکار ساخته می‌شوند.</p>'
: `<div class="field"><label class="lbl">گزینه‌ها</label>${d.options.map((o, i) => `<div class="qbo"><input class="input" value="${esc(o.text)}" data-inp="dpOpt" data-i="${i}" placeholder="گزینهٔ ${fa(i + 1)}">${d.options.length > 2 ? `<button type="button" class="ib sm" data-act="pollOptDel" data-i="${i}">✕</button>` : ''}</div>`).join('')}${d.options.length < 6 ? '<button type="button" class="btn sm ghost" data-act="pollOptAdd">➕ گزینه</button>' : ''}</div>`}
<div class="srow"><span class="sl">نمایش نتایج زنده</span><span class="switch"><input type="checkbox" ${d.showResults ? 'checked' : ''} data-chg="dpBool" data-f="showResults"><i></i></span></div>
<button class="btn mt" type="submit" style="width:100%">💾 ${d.id ? 'ذخیره' : 'ساخت و انتشار برای همه'}</button></form>`;
}
const newQ = () => ({ id: uid(), text: '', type: 'mcq', options: [{ id: uid(), text: '' }, { id: uid(), text: '' }, { id: uid(), text: '' }, { id: uid(), text: '' }], correctOptionId: '' });
function quizForm(q) {
const now = new Date(), s = new Date(now.getTime() + 3600000); s.setMinutes(0, 0, 0);
UI.draftQ = q ? clone(q) : { id: '', title: '', description: '', startAt: s.toISOString(), endAt: new Date(s.getTime() + 3600000).toISOString(), durationMin: 10, negative: false, negRatio: 0.333, resultsVisible: true, questions: [newQ()] };
UI.qCal = jOf(iranISO(new Date(UI.draftQ.startAt)));
return quizFormBody();
}
function jdtField(f, iso, label) {
const d = new Date(iso), j = jOf(iranISO(d)), [h, mi] = iranHM(d);
const sel = (p, vals, cur, flex) => `<select class="select" data-chg="qdt" data-f="${f}" data-p="${p}" style="flex:${flex}">${vals.map(([v, l]) => `<option value="${fa(v)}" ${cur === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
return `<div class="field"><label class="lbl">${label}</label><div class="row" style="gap:5px">
${sel('d', Array.from({ length: Jalali.monthLen(j.jy, j.jm) }, (_, i) => [i + 1, fa(i + 1)]), j.jd, 1)}
${sel('m', JMONTHS.map((m, i) => [i + 1, m]), j.jm, 2)}
${sel('y', [1404, 1405, 1406, 1407].map(y => [y, fa(y)]), j.jy, 1.3)}
${sel('H', Array.from({ length: 24 }, (_, i) => [i, fa(pad(i))]), h, 1)}<span class="small bold">:</span>
${sel('M', [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(i => [i, fa(pad(i))]), Math.round(mi / 5) * 5 % 60, 1)}
</div><div class="small muted mt">${weekDay(iranISO(d))} ${jLabel(iranISO(d))} • ساعت ${fa(pad(h))}:${fa(pad(mi))}</div></div>`;
}
function quizFormBody() {
const d = UI.draftQ, j = UI.qCal || jOf(iranISO(new Date(d.startAt)));
const sd = iranISO(new Date(d.startAt)), ed = iranISO(new Date(d.endAt));
return `<form data-form="quiz">
<div class="field"><label class="lbl">عنوان آزمون</label><input class="input" value="${esc(d.title)}" data-inp="dq" data-f="title" required></div>
<div class="card mb" style="padding:13px;background:var(--surface2)"><h3 class="mb">🗓️ زمان‌بندی با تقویم شمسی</h3>
${jdtField('startAt', d.startAt, '🕐 شروع')}${jdtField('endAt', d.endAt, '🕐 پایان')}
<div class="cnav"><button type="button" class="ib" data-act="qfNav" data-d="-1">→</button><b>${JMONTHS[j.jm - 1]} ${fa(j.jy)}</b><button type="button" class="ib" data-act="qfNav" data-d="1">←</button></div>
<div class="cal">${JWEEK.map(w => `<span class="ch">${w.slice(0, 3)}</span>`).join('')}${monthGrid(j.jy, j.jm).map(iso => {
if (!iso) return '<button type="button" class="cc" disabled></button>';
const isS = iso === sd, isE = iso === ed;
return `<button type="button" class="cc ${isS ? 'sel' : ''} ${iso === todayISO() ? 'today' : ''}" style="${isE && !isS ? `background:${tint('#e11d48', .16)};border-color:${tint('#e11d48', .4)}` : ''}" data-act="qfPick" data-iso="${iso}">${fa(jOf(iso).jd)}${isS ? '<small>شروع</small>' : isE ? '<small>پایان</small>' : ''}</button>`;
}).join('')}</div>
<div class="row mt"><button type="button" class="btn sm ghost" data-act="qfNow">⏱ شروع از همین حالا</button><button type="button" class="btn sm ghost" data-act="qfPlus">➕ پایان = شروع + ۱ ساعت</button></div></div>
<div class="grid g2"><div class="field"><label class="lbl">مدت پاسخ هر نفر (دقیقه)</label><input type="text" inputmode="numeric" data-fa class="input" value="${fa(d.durationMin)}" data-inp="dqNum" data-f="durationMin"></div>
<div class="field"><label class="lbl">توضیح</label><input class="input" value="${esc(d.description || '')}" data-inp="dq" data-f="description"></div></div>
<div class="srow"><div><span class="sl">➖ نمرهٔ منفی</span><span class="ss">هر پاسخ نادرست بخشی از پاسخ درست را حذف می‌کند</span></div><span class="switch"><input type="checkbox" ${d.negative ? 'checked' : ''} data-chg="dqNeg"><i></i></span></div>
${d.negative ? `<div class="field mt"><label class="lbl">ضریب</label><select class="select" data-chg="dqRatio">${[[0.25, '¼'], [0.333, '⅓ (رایج)'], [0.5, '½'], [1, 'کامل']].map(([v, l]) => `<option value="${v}" ${Math.abs(d.negRatio - v) < .01 ? 'selected' : ''}>${l}</option>`).join('')}</select></div>` : ''}
<div class="srow"><span class="sl">نمایش نتیجه پس از ارسال</span><span class="switch"><input type="checkbox" ${d.resultsVisible ? 'checked' : ''} data-chg="dqRes"><i></i></span></div>
<div class="divider"></div><div class="spread mb"><h3>سؤال‌ها (${fa(d.questions.length)})</h3><button type="button" class="btn sm soft" data-act="qqAdd">➕ سؤال</button></div>
${d.questions.map((qq, qi) => `<div class="qb"><div class="spread mb"><b class="small">سؤال ${fa(qi + 1)}</b><div class="row" style="gap:4px"><button type="button" class="ib sm" data-act="qqMove" data-i="${qi}" data-d="-1">↑</button><button type="button" class="ib sm" data-act="qqMove" data-i="${qi}" data-d="1">↓</button>${d.questions.length > 1 ? `<button type="button" class="ib sm" data-act="qqDel" data-i="${qi}">🗑</button>` : ''}</div></div>
<div class="field"><input class="input" value="${esc(qq.text)}" data-inp="dqQ" data-i="${qi}" placeholder="متن سؤال…"></div>
<div class="field"><select class="select" data-chg="dqType" data-i="${qi}"><option value="mcq" ${qq.type === 'mcq' ? 'selected' : ''}>چهارگزینه‌ای</option><option value="tf" ${qq.type === 'tf' ? 'selected' : ''}>درست / غلط</option></select></div>
<label class="lbl">گزینهٔ درست ✅</label>
${qq.options.map((o, oi) => `<div class="qbo"><input type="radio" name="correct_${qq.id}" ${qq.correctOptionId === o.id ? 'checked' : ''} data-chg="dqCorrect" data-i="${qi}" data-oid="${o.id}"><input class="input" value="${esc(o.text)}" data-inp="dqOpt" data-i="${qi}" data-oi="${oi}" placeholder="گزینهٔ ${fa(oi + 1)}" ${qq.type === 'tf' ? 'readonly' : ''}>${qq.type === 'mcq' && qq.options.length > 2 ? `<button type="button" class="ib sm" data-act="qOptDel" data-i="${qi}" data-oi="${oi}">✕</button>` : ''}</div>`).join('')}
${qq.type === 'mcq' && qq.options.length < 6 ? `<button type="button" class="btn sm ghost" data-act="qOptAdd" data-i="${qi}">➕ گزینه</button>` : ''}</div>`).join('')}
<button class="btn" type="submit" style="width:100%">💾 ${d.id ? 'ذخیرهٔ ویرایش' : 'ساخت آزمون زمان‌دار'}</button></form>`;
}
/* ================= A4 sheets ================= */
function sheetHead(title, sub) {
const st = S();
return `<div class="sh"><div class="sht"><span>اداره آموزش و پرورش شهرستان نور</span><span>شماره: ${fa(Math.floor(1000 + Math.random() * 9000))}/د</span><span>تاریخ: ${jShort(todayISO())}</span></div>
<h1>${esc(st.meta.school)}</h1><div class="shs">${esc(title)} — ${esc(st.meta.className)} • سال تحصیلی ${esc(st.meta.year)}${sub ? ' • ' + esc(sub) : ''}</div><div class="seal">مهر رسمی<br>مدرسه</div></div>`;
}
const sheetFoot = () => `<div class="sf"><div>امضای معلم<br><b>${esc(S().meta.teacher)}</b><br>....................</div><div>امضای مدیر مدرسه<br><br>....................</div><div>مهر و امضای دفتر<br><br>....................</div></div>
<div class="sn2"><span>صادرشده توسط سامانهٔ مدیریت کلاس — با مهر مدرسه معتبر است.</span><span>طراحی: کالج مدیا</span></div>`;
function lvlCell(g) {
const st = S(); if (g == null || g === '') return '—';
const l = levelFor(st, g), i = l ? st.levels.indexOf(l) + 1 : 0;
const txt = st.meta.gradingMode === 'numeric' ? faNum(Number(en(g)), Number(en(g)) % 1 ? 1 : 0) : esc(l?.label || '—');
return `<span class="l${i}">${txt}</span>`;
}
function sheetReport(sid) {
const st = S(), s = stuById(st, sid); if (!s) return '';
const b = stats(st, sid), a = aiStudent(st, sid);
const asmts = [...st.assessments].sort((x, y) => String(x.date).localeCompare(String(y.date))).slice(-6);
const rows = st.subjects.map(sub => {
const cells = asmts.map(x => `<td>${lvlCell(x.subjects.includes(sub) ? st.grades?.[x.id]?.[sub]?.[sid] : null)}</td>`).join('');
const v = subjectAvgFor(st, sid, sub);
return `<tr><td class="r"><b>${esc(sub)}</b></td>${cells}<td>${v != null ? lvlCell(st.meta.gradingMode === 'numeric' ? Math.round(v / LMAX(st) * st.meta.numericMax * 2) / 2 : st.levels[levelIdxOfScore(st, v)].key) : '—'}</td></tr>`;
}).join('');
const g = groupOf(st, sid);
const roles = myRoles(st, sid).map(r => ROLES[r].label).join('، ') || (st.groups.some(x => x.leader === sid) ? 'سرگروه' : '—');
const overall = b.cnt ? (st.meta.gradingMode === 'numeric' ? faNum(b.avg / LMAX(st) * st.meta.numericMax) : st.levels[levelIdxOfScore(st, b.avg)].label) : '—';
return `<div class="sheet">${sheetHead('کارنامهٔ تحصیلی')}
<table><tr><th style="width:16%">نام</th><td style="width:30%"><b>${esc(s.name)}</b></td><th style="width:13%">کد</th><td style="width:13%">${fa(s.code || '—')}</td><th style="width:12%">گروه</th><td>${esc(g?.name || '—')}</td></tr></table>
<span class="sec">📚 ارزشیابی دروس (${fa(asmts.length)} ارزشیابی اخیر)</span>
<table><thead><tr><th style="width:20%">درس</th>${asmts.map(x => `<th style="font-size:9.5px">${esc(x.title)}<br>${jShort(x.date)}</th>`).join('')}<th style="width:13%">نتیجه</th></tr></thead><tbody>${rows}</tbody></table>
<span class="sec">📅 حضور و غیاب</span>
<table><tr><th>روزها</th><th>حاضر</th><th>تأخیر</th><th>غیبت</th><th>موجه</th><th>نرخ حضور</th></tr><tr><td>${fa(b.total)}</td><td>${fa(b.present)}</td><td>${fa(b.late)}</td><td>${fa(b.absent)}</td><td>${fa(b.excused)}</td><td><b>${fa(b.attRate)}٪</b></td></tr></table>
<span class="sec">⭐ نتیجهٔ کلی و مسئولیت</span>
<table><tr><th>نتیجهٔ کل</th><th>امتیاز انضباطی</th><th>امتیاز مدیریتی</th><th>مسئولیت</th><th>رتبه در کلاس</th></tr><tr><td><b>${esc(overall)}</b></td><td>${fa(b.pts)}</td><td>${fa(b.lpts)}</td><td>${esc(roles)}</td><td>${a?.rank ? fa(a.rank) + ' از ' + fa(a.total) : '—'}</td></tr></table>
${a ? `<span class="sec">🧠 خلاصهٔ تحلیل هوشمند</span><div class="ai"><b>وضعیت:</b> ${a.riskLevel.l} (شاخص ${fa(a.risk)} از ۱۰۰) • <b>روند:</b> ${a.momentum >= 0 ? '+' : ''}${faNum(a.momentum)} • <b>پیش‌بینی سطح بعد:</b> ${esc(a.predict.label)}
<div class="cols"><div><h4>💪 نقاط قوت</h4>${a.strengths.map(x => `${esc(x.sub)} (${faNum(x.avg)})`).join('<br>')}</div><div><h4>🎯 نقاط ضعف</h4>${a.weaknesses.map(x => `${esc(x.sub)} (${faNum(x.avg)})`).join('<br>')}</div><div><h4>🗺️ توصیه</h4>${esc(a.plans[0]?.text || '—')}</div></div></div>` : ''}
${sheetFoot()}</div>`;
}
function sheetAI(sid) {
const st = S(), s = stuById(st, sid), a = aiStudent(st, sid);
if (!s) return '';
if (!a) return `<div class="sheet">${sheetHead('گزارش تحلیلی', s.name)}<p>دادهٔ کافی برای تحلیل ثبت نشده است.</p>${sheetFoot()}</div>`;
const svg = radar(a.subjects.map(x => ({ label: x.sub, value: x.avg, classValue: x.cavg })), { size: 250, max: LMAX(st) })
.replace(/var\(--acc\)/g, '#0f766e').replace(/var\(--line\)/g, '#bbb').replace(/var\(--muted\)/g, '#555').replace(/var\(--surface\)/g, '#fff');
return `<div class="sheet">${sheetHead('گزارش تحلیل هوشمند کارنامه', s.name)}
<table><tr><th style="width:16%">نام</th><td style="width:26%"><b>${esc(s.name)}</b></td><th style="width:13%">میانگین</th><td>${faNum(a.base.avg)} از ${fa(LMAX(st))}</td><th style="width:11%">رتبه</th><td>${a.rank ? fa(a.rank) + ' از ' + fa(a.total) : '—'}</td><th style="width:11%">حضور</th><td>${fa(a.base.attRate)}٪</td></tr></table>
<div style="display:flex;gap:8px;align-items:flex-start;margin-top:4px"><div style="width:76mm">${svg}</div>
<div style="flex:1;font-size:10.5px;line-height:1.85">
<div class="ai"><b>${a.riskLevel.i} ${a.riskLevel.l}</b> — شاخص ریسک ${fa(a.risk)} از ۱۰۰<br><b>روند:</b> ${a.momentum >= 0 ? 'صعودی' : 'نزولی'} (${a.momentum >= 0 ? '+' : ''}${faNum(a.momentum)}) • <b>نوسان:</b> ${faNum(a.consistency)}<br><b>پیش‌بینی سطح بعد:</b> ${esc(a.predict.label)}</div>
<table style="margin-top:5px"><thead><tr><th>درس</th><th>میانگین</th><th>کلاس</th><th>روند</th></tr></thead><tbody>${a.subjects.map(x => `<tr><td class="r">${esc(x.sub)}</td><td>${faNum(x.avg)}</td><td>${faNum(x.cavg)}</td><td>${x.trend >= 0 ? '+' : ''}${faNum(x.trend)}</td></tr>`).join('')}</tbody></table></div></div>
<span class="sec">🧠 روایت تحلیلی</span><div class="ai">${a.insights.slice(0, 4).map(x => `${x.i} ${esc(x.text)}`).join('<br>')}</div>
<span class="sec">🗺️ برنامهٔ بهبود</span><div class="ai">${a.plans.map((p, i) => `${fa(i + 1)}. <b>${esc(p.sub)}:</b> ${esc(p.text)}`).join('<br>')}</div>
${sheetFoot()}</div>`;
}
function sheetClass() {
const st = S();
const rows = st.students.map((s, i) => {
const b = stats(st, s.id), a = aiStudent(st, s.id), g = groupOf(st, s.id);
const roles = myRoles(st, s.id).map(r => ROLES[r].icon).join('') + (st.groups.some(x => x.leader === s.id) ? '🏅' : '');
return `<tr><td>${fa(i + 1)}</td><td class="r">${esc(s.name)}</td><td>${esc(g?.name || '—')}</td><td>${b.cnt ? esc(st.meta.gradingMode === 'numeric' ? faNum(b.avg / LMAX(st) * st.meta.numericMax) : st.levels[levelIdxOfScore(st, b.avg)].label) : '—'}</td><td>${b.total ? fa(b.attRate) + '٪' : '—'}</td><td>${fa(b.pts)}</td><td>${a ? fa(a.risk) : '—'}</td><td>${roles || '—'}</td></tr>`;
}).join('');
return `<div class="sheet">${sheetHead('گزارش جامع کلاس', fa(st.students.length) + ' دانش‌آموز')}
<table style="font-size:10px"><thead><tr><th style="width:5%">#</th><th style="width:27%">نام</th><th style="width:13%">گروه</th><th style="width:16%">نتیجه</th><th style="width:11%">حضور</th><th style="width:10%">انضباط</th><th style="width:9%">ریسک</th><th style="width:9%">نقش</th></tr></thead><tbody>${rows}</tbody></table>${sheetFoot()}</div>`;
}
function sheetAttendance(jy, jm) {
const st = S(), len = Jalali.monthLen(jy, jm);
const days = Array.from({ length: len }, (_, i) => jToISO(jy, jm, i + 1));
const rows = st.students.map((s, i) => {
let p = 0, t = 0;
const cells = days.map(d => {
const v = st.attendance?.[d]?.[s.id];
if (v === 'present' || v === 'late') { p++; t++; } else if (v) t++;
return `<td style="font-size:8px;padding:2px;${wdIdx(d) >= 5 ? 'background:#f2e7e7' : ''}${v === 'absent' ? ';color:#b91c1c;font-weight:700' : ''}">${v ? ATT[v].sym : ''}</td>`;
}).join('');
return `<tr><td style="font-size:9px;padding:2px 4px" class="r">${fa(i + 1)}. ${esc(s.name)}</td>${cells}<td style="font-size:9px">${t ? fa(Math.round(p / t * 100)) : '—'}</td></tr>`;
}).join('');
return `<div class="sheet">${sheetHead('گزارش حضور و غیاب ماهانه', JMONTHS[jm - 1] + ' ' + fa(jy))}
<table><thead><tr><th style="width:36mm;font-size:9px">دانش‌آموز</th>${days.map(d => `<th style="font-size:7.5px;padding:2px;${wdIdx(d) >= 5 ? 'background:#f2e7e7' : ''}">${fa(jOf(d).jd)}</th>`).join('')}<th style="width:9mm;font-size:8px">٪</th></tr></thead><tbody>${rows}</tbody></table>
<p style="font-size:9.5px">راهنما: ✓ حاضر • ت تأخیر • غ غایب • م موجه • خانهٔ خاکستری: پنج‌شنبه/جمعه</p>${sheetFoot()}</div>`;
}
function sheetCodes() {
const rows = S().students.map((s, i) => `<tr><td>${fa(i + 1)}</td><td class="r">${esc(s.name)}</td><td style="letter-spacing:3px;font-weight:700">${fa(s.code)}</td></tr>`).join('');
return `<div class="sheet">${sheetHead('فهرست محرمانهٔ کدهای ورود', 'ویژهٔ معلم')}
<p style="font-size:11px;color:#b91c1c;font-weight:700">⚠️ محرمانه — کد هر دانش‌آموز را جداگانه به خودش تحویل دهید.</p>
<table><thead><tr><th style="width:8%">#</th><th>نام</th><th style="width:25%">کد</th></tr></thead><tbody>${rows}</tbody></table>${sheetFoot()}</div>`;
}
function printSheet(html) { $('#printArea').innerHTML = html; Sound.play('ok'); setTimeout(() => window.print(), 90); }
function previewSheet(title, html) {
openDrawer(title, `<div class="row mb"><button type="button" class="btn" data-act="printPrev">🖨️ چاپ A4</button><span class="chip">اندازهٔ واقعی برگه</span></div><div class="sheetwrap" id="sheetWrap">${html}</div>`, true);
requestAnimationFrame(() => {
const w = $('#sheetWrap'), sh = w?.querySelector('.sheet'); if (!w || !sh) return;
const scale = Math.min(1, (w.clientWidth - 26) / 794);
sh.style.transform = `scale(${scale})`; sh.style.transformOrigin = 'top right';
sh.style.marginBottom = `-${1123 * (1 - scale)}px`; sh.style.marginLeft = `-${794 * (1 - scale)}px`;
});
}
/* ================= export/import ================= */
function download(name, content, type = 'text/csv') {
const blob = new Blob([content], { type: type + ';charset=utf-8' });
const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function exportKind(kind, ids) {
const rows = csvRows(S(), kind, ids);
download(`${CSV_KINDS[kind].l}-${jShortEn(todayISO()).replace(/\//g, '-')}.csv`, serializeCSV(S(), rows));
toast(`فایل ${CSV_KINDS[kind].l} با ${fa(rows.length - 1)} ردیف دانلود شد`, 'ok');
}
function impTemplate() {
const kind = UI.imp?.kind || 'students', d = jShortEn(todayISO());
const sample = {
students: [['نام', 'کد', 'گروه'], ['علی محمدی', '۱۲۳۴۵۶', 'دانش'], ['رضا کریمی', '۶۵۴۳۲۱', 'البرز']],
attendance: [['تاریخ', 'نام', 'وضعیت'], [d, 'علی محمدی', 'حاضر'], [d, 'رضا کریمی', 'غایب']],
grades: [['ارزشیابی', 'تاریخ', 'درس', 'نام', 'نمره'], ['پرسش ریاضی فصل ۳', d, 'ریاضی', 'علی محمدی', 'خیلی خوب']],
discipline: [['تاریخ', 'نام', 'امتیاز', 'دلیل'], [d, 'علی محمدی', '۲', 'مشارکت فعال در کلاس']],
groups: [['گروه', 'نام', 'سرگروه'], ['دانش', 'علی محمدی', 'بله'], ['البرز', 'رضا کریمی', 'خیر']]
}[kind];
download(`نمونه-${CSV_KINDS[kind].l}.csv`, serializeCSV(S(), sample));
toast('فایل نمونه دانلود شد', 'ok');
}
/* ================= quiz runtime ================= */
const attemptKey = () => 'sh12_attempt_' + (SESS?.sid || '');
async function startQuiz(qid) {
const q = S().quizzes.find(x => x.id === qid); if (!q) return;
if (q.mySubmission) return toast('شما قبلاً شرکت کرده‌اید؛ فقط یک‌بار مجاز است.', 'err');
if (quizStatus(q) !== 'active') return toast('آزمون در بازهٔ زمانی مجاز نیست.', 'err');
confirmDlg({
title: '🚀 شروع آزمون', body: `«${q.title}» — ${fa(q.questions.length)} سؤال در ${fa(q.durationMin)} دقیقه${q.negative ? ' با نمرهٔ منفی' : ''}. زمان‌سنج روی سرور ثبت می‌شود و پاسخ‌ها فقط یک‌بار ارسال می‌شوند.`, okText: 'شروع',
onOk: async () => {
const res = await send('quiz.start', { quizId: qid }, null, { sound: 'ok' });
if (!res) return;
const qq = S().quizzes.find(x => x.id === qid);
const startedAt = res.startedAt || qq.myAttempt?.startedAt || new Date().toISOString();
const saved = LS.get(attemptKey(), null);
const answers = saved && saved.qid === qid ? saved.answers : {};
UI.run = { qid, idx: 0, answers, endAt: Math.min(new Date(qq.endAt).getTime(), new Date(startedAt).getTime() + qq.durationMin * 60000), submitting: false };
LS.set(attemptKey(), { qid, answers });
render();
}
});
}
async function finalizeRun(auto = false) {
const run = UI.run; if (!run || run.submitting) return;
const q = S().quizzes.find(x => x.id === run.qid);
if (!q || q.mySubmission) { UI.run = null; LS.del(attemptKey()); render(true); return; }
const un = q.questions.length - Object.keys(run.answers).length;
if (!auto && un > 0) { confirmDlg({ title: 'ارسال پاسخ‌ها', body: `${fa(un)} سؤال بی‌پاسخ مانده. ارسال نهایی شود؟`, okText: 'ارسال نهایی', onOk: () => finalizeRun(true) }); return; }
run.submitting = true;
const answers = { ...run.answers };
UI.run = null; LS.del(attemptKey());
const res = await send('quiz.submit', { quizId: run.qid, answers }, null, { sound: null });
if (res) { Sound.play(res.score >= 60 ? 'win' : 'pop'); toast(`🎉 نمره: ${fa(res.score)}٪ — ${fa(res.correct)} درست، ${fa(res.wrong)} نادرست`, 'ok', null, 8000); }
else if (res === null && S().quizzes.find(x => x.id === run.qid)?.mySubmission) toast('✅ پاسخ‌ها ثبت شد.', 'ok');
else toast('✅ پاسخ‌های شما ثبت نهایی شد.', 'ok');
render(true);
}
function resumeAttempt() {
const saved = LS.get(attemptKey(), null);
if (!saved || ROLE !== 'student') return;
const q = S().quizzes.find(x => x.id === saved.qid);
if (!q || q.mySubmission) { LS.del(attemptKey()); return; }
if (!q.myAttempt) { LS.del(attemptKey()); return; }
const endAt = Math.min(new Date(q.endAt).getTime(), new Date(q.myAttempt.startedAt).getTime() + q.durationMin * 60000);
if (Date.now() > endAt || q.forceClosed) {
UI.run = { qid: q.id, idx: 0, answers: saved.answers || {}, endAt, submitting: false };
toast('⏰ زمان آزمون تمام شده بود؛ پاسخ‌های ذخیره‌شده ارسال شد.', 'info', null, 7000);
finalizeRun(true); return;
}
UI.run = { qid: q.id, idx: 0, answers: saved.answers || {}, endAt, submitting: false };
UI.section = 'quizzes';
toast('⏱ آزمون ناتمام شما بازیابی شد؛ زمان‌سنج ادامه دارد.', 'info');
}
/* ================= actions ================= */
const ACT = {}, INP = {}, CHG = {}, FORM = {};
ACT.reload = () => location.reload();
ACT.nav = el => setSection(el.dataset.sec);
ACT.menu = () => document.body.classList.toggle('side-open');
ACT.theme = () => { LS.set('sh_theme', document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); applyAppearance(); Sound.play('tap'); };
ACT.sound = () => { Sound.on = !Sound.on; LS.set('sh_sound', Sound.on); applyAppearance(); if (Sound.on) Sound.play('pop'); };
ACT.search = () => {
if (!isT()) { setSection('report'); return; }
promptDlg({
title: '🔍 جستجوی دانش‌آموز', placeholder: 'نام یا کد…', onOk: v => {
const s = S().students.find(x => norm(x.name).includes(norm(v)) || x.code.includes(en(v)));
if (!s) return toast('دانش‌آموزی یافت نشد', 'err');
UI.section = 'students'; UI.stuQ = v; render(); stuDetail(s.id);
}
});
};
ACT.logout = () => {
const go = async () => { UI.run = null; LS.del(attemptKey()); await Net.logout(); SS.del('sh12_sess'); location.reload(); };
if (UI.run) confirmDlg({ title: 'خروج هنگام آزمون', body: 'پاسخ‌ها ارسال نهایی و خارج می‌شوید.', okText: 'ارسال و خروج', onOk: async () => { await finalizeRun(true); go(); } });
else confirmDlg({ title: 'خروج از سامانه', body: 'از حساب خود خارج می‌شوید؟', okText: 'خروج', onOk: go });
};
ACT.loginTab = el => {
UI.loginRole = el.dataset.role;
$$('.ltabs button').forEach(b => b.classList.toggle('on', b === el));
$('#codeLbl').textContent = UI.loginRole === 'teacher' ? 'کد محرمانهٔ مدیریت را وارد کنید' : 'کد اختصاصی ۶ رقمی خود را وارد کنید';
const i = $('#codeInput'); i.value = ''; i.type = 'password'; $('#eyeBtn').textContent = '👁'; i.focus();
$('#loginErr').textContent = ''; Sound.play('tap');
};
ACT.togglePass = () => { const i = $('#codeInput'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; $('#eyeBtn').textContent = show ? '🙈' : '👁'; i.focus(); };
ACT.drawerClose = () => closeDrawer();
ACT.modalClose = () => closeModal();
ACT.modalOk = () => { const cb = MODAL_OK; closeModal(); cb && cb(); };
ACT.attTab = el => { UI.attTab = el.dataset.tab; renderView(); Sound.play('tap'); };
ACT.attPrev = () => { const d = isoToDate(UI.attDate); d.setDate(d.getDate() - 1); UI.attDate = dateToISO(d); renderView(); };
ACT.attNext = () => { const d = isoToDate(UI.attDate); d.setDate(d.getDate() + 1); UI.attDate = dateToISO(d); renderView(); };
ACT.attToday = () => { UI.attDate = todayISO(); renderView(); };
ACT.attCal = el => { UI.attCal = jOf(UI.attDate); openPop(el, `<div style="min-width:290px">${calHTML(UI.attCal, 'pick')}</div>`); };
ACT.calNav = el => {
const j = jShift(UI.attCal || jOf(UI.attDate), +en(el.dataset.d)); UI.attCal = j;
if (el.dataset.mode === 'pick') openPop($('[data-act="attCal"]') || el, `<div style="min-width:290px">${calHTML(j, 'pick')}</div>`);
else renderView();
};
ACT.attPick = el => { UI.attDate = el.dataset.iso; closePop(); if (isT()) UI.attTab = 'reg'; renderView(); Sound.play('tap'); };
ACT.attSet = el => {
const sid = el.dataset.sid, v = el.dataset.v, cur = S().attendance?.[UI.attDate]?.[sid];
const next = cur === v ? null : v;
send('att.set', { date: UI.attDate, sid, status: next }, st => {
const day = (st.attendance[UI.attDate] ||= {});
if (next == null) { delete day[sid]; if (!Object.keys(day).length) delete st.attendance[UI.attDate]; }
else day[sid] = next;
}, { sound: 'tap' });
};
ACT.attAll = () => send('att.allPresent', { date: UI.attDate }, st => { const day = (st.attendance[UI.attDate] ||= {}); st.students.forEach(s => day[s.id] = 'present'); }, { msg: 'همه حاضر ثبت شدند' });
ACT.attClear = () => {
if (!S().attendance?.[UI.attDate]) return toast('این روز ثبتی ندارد', 'info');
confirmDlg({ title: 'پاک کردن روز', body: `حضور ${jLabel(UI.attDate)} پاک شود؟`, okText: 'پاک کن', danger: true, onOk: () => send('att.clear', { date: UI.attDate }, st => { delete st.attendance[UI.attDate]; }, { msg: 'روز پاک شد', undo: true }) });
};
ACT.stuAdd = () => openDrawer('➕ دانش‌آموز جدید', stuForm(null));
ACT.stuEdit = el => openDrawer('✏️ ویرایش', stuForm(stuById(S(), el.dataset.id)));
ACT.stuDetail = el => stuDetail(el.dataset.id);
ACT.stuReport = el => previewSheet('🎓 کارنامهٔ رسمی A4', sheetReport(el.dataset.id));
ACT.printOwn = () => previewSheet('🎓 کارنامهٔ من', sheetReport(SESS.sid));
ACT.aiOpen = el => { UI.aiStu = el.dataset.id; setSection('ai'); };
ACT.aiPick = el => { UI.aiStu = el.dataset.id; renderView(); $('#aiBox')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
ACT.aiPrint = el => previewSheet('🧠 گزارش تحلیلی A4', sheetAI(el.dataset.id));
ACT.stuGen = () => { const i = $('#drawerBody [name="code"]'); if (i) i.value = fa(genCode()); Sound.play('pop'); };
ACT.stuRegen = el => { const id = el.dataset.id; confirmDlg({ title: 'کد جدید', body: 'کد قبلی باطل می‌شود.', okText: 'تولید', onOk: async () => { const r = await send('student.regenCode', { id }, null, { msg: 'کد جدید تولید شد' }); closeDrawer(); if (r?.code) toast('کد جدید: ' + fa(r.code), 'ok', null, 9000); } }); };
ACT.stuDel = el => {
const id = el.dataset.id;
confirmDlg({ title: 'حذف دانش‌آموز', body: `«${stuById(S(), id)?.name}» و همهٔ سوابقش حذف شود؟`, okText: 'حذف', danger: true, onOk: () => { send('student.delete', { id }, st => C.removeStudent(st, id), { msg: 'دانش‌آموز حذف شد', undo: true, sound: 'err' }); closeDrawer(); UI.sel.delete(id); } });
};
ACT.bulkClear = () => { UI.sel.clear(); $('#stuWrap').innerHTML = stuList(); };
ACT.bulkCSV = () => exportKind('students', [...UI.sel]);
ACT.bulkDel = () => {
const ids = [...UI.sel];
confirmDlg({ title: 'حذف گروهی', body: `${fa(ids.length)} دانش‌آموز حذف شوند؟`, okText: 'حذف همه', danger: true, onOk: () => { send('student.bulkDelete', { ids }, st => ids.forEach(id => C.removeStudent(st, id)), { msg: `${fa(ids.length)} نفر حذف شدند`, undo: true, sound: 'err' }); UI.sel.clear(); } });
};
ACT.viewSave = () => promptDlg({ title: '💾 ذخیرهٔ نما', placeholder: 'نام نما', onOk: name => send('view.save', { id: uid(), name, q: UI.stuQ, sort: UI.stuSort, group: UI.stuGroup }, st => st.savedViews.push({ id: uid(), name, q: UI.stuQ, sort: UI.stuSort, group: UI.stuGroup }), { msg: 'نما ذخیره شد' }) });
ACT.asmtNew = () => openDrawer('➕ ارزشیابی جدید', asmtForm(null));
ACT.asmtEdit = el => openDrawer('✏️ ویرایش ارزشیابی', asmtForm(S().assessments.find(x => x.id === el.dataset.id)));
ACT.asmtSel = el => { UI.gradeAid = el.dataset.id; renderView(); Sound.play('tap'); };
ACT.asmtDel = el => {
const id = el.dataset.id;
confirmDlg({ title: 'حذف ارزشیابی', body: 'ارزشیابی و همهٔ نمراتش حذف شود؟', okText: 'حذف', danger: true, onOk: () => send('asmt.delete', { id }, st => { st.assessments = st.assessments.filter(a => a.id !== id); delete st.grades[id]; if (UI.gradeAid === id) UI.gradeAid = ''; }, { msg: 'ارزشیابی حذف شد', undo: true, sound: 'err' }) });
};
ACT.discQuick = el => { const i = $('#discPts'); if (i) i.value = fa(el.dataset.pts); Sound.play('tap'); };
ACT.discDel = el => { const id = el.dataset.id; send('disc.delete', { id }, st => { st.discipline = st.discipline.filter(r => r.id !== id); }, { msg: 'رویداد حذف شد', undo: true, sound: 'err' }); };
ACT.rolesTab = el => { UI.rolesTab = el.dataset.tab; renderView(); };
ACT.caseFilter = el => { UI.caseFilter = el.dataset.f; renderView(); };
ACT.caseOpen = el => caseDrawer(el.dataset.id);
ACT.caseOk = el => { const id = el.dataset.id; send('case.approve', { id }, st => { const r = st.reports.find(x => x.id === id); if (r) { r.status = 'to_judge'; r.teacherNote = 'تأیید معلم در ' + jLabel(todayISO()); } }, { msg: '✅ به پنل قاضی ارسال شد' }); closeDrawer(); };
ACT.caseNo = el => { const id = el.dataset.id; promptDlg({ title: '✖️ دلیل رد گزارش', placeholder: 'دلیل…', onOk: note => { send('case.reject', { id, note }, st => { const r = st.reports.find(x => x.id === id); if (r) { r.status = 'rejected'; r.teacherNote = note; } }, { msg: 'گزارش رد شد', sound: 'err' }); closeDrawer(); } }); };
ACT.caseFinal = el => {
const id = el.dataset.id, r = S().reports.find(x => x.id === id);
confirmDlg({
title: '✅ تأیید نهایی رأی', body: `رأی دربارهٔ «${stuById(S(), r.target)?.name}» قطعی و در پنل او نمایش داده شود؟`, okText: 'تأیید و ابلاغ',
onOk: () => {
send('case.final', { id }, st => {
const rr = st.reports.find(x => x.id === id); if (!rr) return;
rr.status = 'approved'; rr.finalNote = 'ابلاغ در ' + jLabel(todayISO());
if (rr.verdict.type !== 'acquittal' && rr.verdict.points < 0) st.discipline.push({ id: uid(), sid: rr.target, points: rr.verdict.points, reason: 'رأی قاضی: ' + rr.title, date: todayISO(), by: 'court', rid: rr.id });
}, { msg: '🔨 رأی قطعی و ابلاغ شد', sound: 'gavel' });
closeDrawer();
}
});
};
ACT.caseBack = el => { const id = el.dataset.id; promptDlg({ title: '↩️ ایراد رأی', placeholder: 'ایراد چیست؟', onOk: note => { send('case.return', { id, note }, st => { const r = st.reports.find(x => x.id === id); if (r) { r.status = 'to_judge'; r.returns = (r.returns || 0) + 1; r.teacherNote = 'برگشت رأی: ' + note; r.verdict = null; } }, { msg: 'به قاضی برگشت', sound: 'err' }); closeDrawer(); } }); };
ACT.caseDel = el => { const id = el.dataset.id; confirmDlg({ title: 'حذف پرونده', body: 'پرونده حذف شود؟', okText: 'حذف', danger: true, onOk: () => { send('case.delete', { id }, st => { st.reports = st.reports.filter(r => r.id !== id); st.discipline = st.discipline.filter(d => d.rid !== id); }, { msg: 'پرونده حذف شد', undo: true, sound: 'err' }); closeDrawer(); } }); };
ACT.vType = el => { const v = el.dataset.v; $('#vtInp').value = v; $('#vtG').classList.toggle('on', v === 'guilty'); $('#vtA').classList.toggle('on', v === 'acquittal'); $('#vtPts').style.display = v === 'guilty' ? '' : 'none'; };
ACT.roleSuggest = el => { const k = el.dataset.role, sid = el.dataset.sid; send('role.assign', { role: k, sid }, st => { st.roles[k] = sid; st.roles.history.push({ role: k, sid, date: todayISO(), via: 'پیشنهاد هوشمند' }); }, { msg: `${ROLES[k].label} منصوب شد` }); };
ACT.rotate = () => confirmDlg({ title: '🔄 چرخش مسئولیت‌ها', body: 'سمت‌ها بر اساس شایستگی به افراد جدید سپرده می‌شود.', okText: 'چرخش', onOk: () => send('role.rotate', { via: 'چرخش معلم' }, null, { msg: '🔄 سمت‌ها چرخید', undo: true, sound: 'win' }) });
ACT.leaderAuto = () => confirmDlg({ title: '🤖 انتخاب هوشمند سرگروه', body: 'قوی‌ترین عضو هر گروه بر اساس میانگین + حضور + امتیاز انتخاب می‌شود.', okText: 'انتخاب', onOk: () => send('group.autoLeaders', {}, st => st.groups.forEach(g => g.leader = bestOf(st, g.members)), { msg: '🤖 سرگروه‌ها انتخاب شدند', undo: true, sound: 'win' }) });
ACT.grpAdd = () => promptDlg({ title: '➕ گروه جدید', placeholder: 'نام گروه', onOk: name => send('group.add', { id: uid(), name }, st => st.groups.push({ id: uid(), name, color: CPAL[st.groups.length % CPAL.length], leader: null, members: [], createdAt: todayISO() }), { msg: 'گروه ساخته شد' }) });
ACT.grpDel = el => { const id = el.dataset.id; confirmDlg({ title: 'حذف گروه', body: 'اعضا بدون گروه می‌شوند.', okText: 'حذف', danger: true, onOk: () => send('group.delete', { id }, st => { st.groups = st.groups.filter(g => g.id !== id); }, { msg: 'گروه حذف شد', undo: true, sound: 'err' }) }); };
ACT.grpMove = (el, e) => {
const sid = el.dataset.sid;
openPop(el, S().groups.map(g => `<button type="button" class="pi" data-act="grpTo" data-sid="${sid}" data-gid="${g.id}"><span style="width:10px;height:10px;border-radius:4px;background:${g.color}"></span>${esc(g.name)}</button>`).join('') + `<button type="button" class="pi" data-act="grpTo" data-sid="${sid}" data-gid="">📦 بدون گروه</button>`);
e.stopPropagation();
};
ACT.grpTo = el => { closePop(); const { sid, gid } = el.dataset; send('group.move', { sid, gid }, st => C.moveToGroup(st, sid, gid), { msg: 'عضو منتقل شد', sound: 'pop' }); };
ACT.grpOut = el => { const sid = el.dataset.sid; send('group.move', { sid, gid: '' }, st => C.moveToGroup(st, sid, ''), { sound: 'pop' }); };
ACT.pollNew = () => openDrawer('➕ نظرسنجی', pollForm(null, 'choice'));
ACT.pollElect = () => openDrawer('🗳️ انتخابات مسئولیت', pollForm(null, 'election'));
ACT.pollEdit = el => openDrawer('✏️ ویرایش نظرسنجی', pollForm(S().polls.find(x => x.id === el.dataset.id)));
ACT.pollOptAdd = () => { UI.draftP.options.push({ id: uid(), text: '' }); $('#drawerBody').innerHTML = pollFormBody(); };
ACT.pollOptDel = el => { UI.draftP.options.splice(+en(el.dataset.i), 1); $('#drawerBody').innerHTML = pollFormBody(); };
ACT.pollToggle = el => { const id = el.dataset.id; send('poll.toggle', { id }, st => { const p = st.polls.find(x => x.id === id); if (p) p.status = p.status === 'active' ? 'closed' : 'active'; }, { msg: 'وضعیت نظرسنجی تغییر کرد' }); };
ACT.pollRes = el => { const id = el.dataset.id; send('poll.results', { id }, st => { const p = st.polls.find(x => x.id === id); if (p) p.showResults = !p.showResults; }, { msg: 'ذخیره شد' }); };
ACT.pollVotes = el => pollVotesDrawer(el.dataset.id);
ACT.pollCSV = el => {
const st = S(), p = st.polls.find(x => x.id === el.dataset.id);
const rows = [['نام', 'کد', 'رأی'], ...st.students.map(s => [s.name, s.code, p.votes?.[s.id] === undefined ? 'شرکت نکرده' : voteText(st, p, p.votes[s.id])])];
download(`آرا-${p.question.slice(0, 20)}.csv`, serializeCSV(st, rows)); toast('فایل آرا دانلود شد', 'ok');
};
ACT.pollDel = el => { const id = el.dataset.id; confirmDlg({ title: 'حذف نظرسنجی', body: 'همهٔ آرا حذف شود؟', okText: 'حذف', danger: true, onOk: () => send('poll.delete', { id }, st => { st.polls = st.polls.filter(p => p.id !== id); }, { msg: 'حذف شد', undo: true, sound: 'err' }) }); };
ACT.pollVote = el => {
const { pid, oid } = el.dataset;
send('poll.vote', { pollId: pid, optionId: oid }, st => { const p = st.polls.find(x => x.id === pid); if (p) p.myVote = oid; }, { msg: '🗳️ رأی شما ثبت نهایی شد', sound: 'pop' });
};
ACT.pollMulti = el => {
const pid = el.dataset.pid;
const ids = $$(`input[name="mv_${pid}"]:checked`).map(x => x.value);
if (!ids.length) return toast('حداقل یک گزینه انتخاب کنید', 'err');
send('poll.vote', { pollId: pid, optionIds: ids }, st => { const p = st.polls.find(x => x.id === pid); if (p) p.myVote = ids; }, { msg: '☑️ رأی شما ثبت شد', sound: 'pop' });
};
ACT.pollApply = el => {
const id = el.dataset.id, p = S().polls.find(x => x.id === id); if (!p) return;
const { c } = pollCounts(p);
const win = [...(p.candidates || [])].sort((a, b) => (c[b] || 0) - (c[a] || 0))[0];
if (!win) return toast('رأیی ثبت نشده', 'err');
const ws = stuById(S(), win), role = ROLES[p.targetRole];
confirmDlg({ title: '🏛️ انتصاب برنده', body: `«${ws?.name}» با ${fa(c[win] || 0)} رأی ${role?.label} شود؟ پنل ویژه برای او فعال می‌شود.`, okText: 'انتصاب', onOk: () => send('poll.apply', { id }, null, { msg: `🎉 ${ws?.name} ${role?.label} شد`, sound: 'win' }) });
};
ACT.quizNew = () => openDrawer('➕ آزمون زمان‌دار', quizForm(null), true);
ACT.quizEdit = el => openDrawer('✏️ ویرایش آزمون', quizForm(S().quizzes.find(x => x.id === el.dataset.id)), true);
ACT.quizClose = el => { const id = el.dataset.id; confirmDlg({ title: '⏹ پایان فوری', body: 'آزمون برای همه بسته می‌شود.', okText: 'پایان', onOk: () => send('quiz.close', { id }, st => { const q = st.quizzes.find(x => x.id === id); if (q) q.forceClosed = true; }, { msg: 'آزمون پایان یافت' }) }); };
ACT.quizRes = el => { const id = el.dataset.id; send('quiz.results', { id }, st => { const q = st.quizzes.find(x => x.id === id); if (q) q.resultsVisible = !q.resultsVisible; }, { msg: 'ذخیره شد' }); };
ACT.quizResults = el => quizResultsDrawer(el.dataset.id);
ACT.quizCSV = el => {
const st = S(), q = st.quizzes.find(x => x.id === el.dataset.id);
const rows = [['نام', 'کد', 'نمره٪', 'درست', 'نادرست', 'نزده', 'خام'], ...st.students.map(s => { const x = q.submissions?.[s.id]; return [s.name, s.code, x ? fa(x.score) : 'شرکت نکرده', x ? fa(x.correct) : '', x ? fa(x.wrong) : '', x ? fa(x.blank) : '', x ? faNum(x.raw) : '']; })];
download(`نتایج-${q.title.slice(0, 20)}.csv`, serializeCSV(st, rows)); toast('فایل نتایج دانلود شد', 'ok');
};
ACT.quizDel = el => { const id = el.dataset.id; confirmDlg({ title: 'حذف آزمون', body: 'آزمون و پاسخ‌ها حذف شود؟', okText: 'حذف', danger: true, onOk: () => send('quiz.delete', { id }, st => { st.quizzes = st.quizzes.filter(q => q.id !== id); }, { msg: 'حذف شد', undo: true, sound: 'err' }) }); };
ACT.qqAdd = () => { UI.draftQ.questions.push(newQ()); $('#drawerBody').innerHTML = quizFormBody(); };
ACT.qqDel = el => { UI.draftQ.questions.splice(+en(el.dataset.i), 1); $('#drawerBody').innerHTML = quizFormBody(); };
ACT.qqMove = el => { const i = +en(el.dataset.i), d = +en(el.dataset.d), arr = UI.draftQ.questions, j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; $('#drawerBody').innerHTML = quizFormBody(); };
ACT.qOptAdd = el => { UI.draftQ.questions[+en(el.dataset.i)].options.push({ id: uid(), text: '' }); $('#drawerBody').innerHTML = quizFormBody(); };
ACT.qOptDel = el => { const qq = UI.draftQ.questions[+en(el.dataset.i)], oi = +en(el.dataset.oi); if (qq.correctOptionId === qq.options[oi].id) qq.correctOptionId = ''; qq.options.splice(oi, 1); $('#drawerBody').innerHTML = quizFormBody(); };
ACT.qCalNav = el => { UI.qCal = jShift(UI.qCal || jOf(todayISO()), +en(el.dataset.d)); renderView(); };
ACT.qDayPick = el => { UI.quizDay = UI.quizDay === el.dataset.iso ? '' : el.dataset.iso; renderView(); };
ACT.qDayClear = () => { UI.quizDay = ''; renderView(); };
ACT.qfNav = el => { UI.qCal = jShift(UI.qCal, +en(el.dataset.d)); $('#drawerBody').innerHTML = quizFormBody(); };
ACT.qfPick = el => {
const iso = el.dataset.iso, d = new Date(UI.draftQ.startAt), [h, mi] = iranHM(d);
const nd = isoToDate(iso); const start = new Date(Date.UTC(nd.getFullYear(), nd.getMonth(), nd.getDate(), h - 3, mi - 30));
UI.draftQ.startAt = start.toISOString();
if (new Date(UI.draftQ.endAt) <= start) UI.draftQ.endAt = new Date(start.getTime() + 3600000).toISOString();
$('#drawerBody').innerHTML = quizFormBody(); Sound.play('tap');
};
ACT.qfNow = () => { const n = new Date(); UI.draftQ.startAt = n.toISOString(); UI.draftQ.endAt = new Date(n.getTime() + 3600000).toISOString(); UI.qCal = jOf(todayISO()); $('#drawerBody').innerHTML = quizFormBody(); };
ACT.qfPlus = () => { UI.draftQ.endAt = new Date(new Date(UI.draftQ.startAt).getTime() + 3600000).toISOString(); $('#drawerBody').innerHTML = quizFormBody(); };
ACT.quizStart = el => startQuiz(el.dataset.id);
ACT.quizOpt = el => { UI.run.answers[el.dataset.qid] = el.dataset.oid; LS.set(attemptKey(), { qid: UI.run.qid, answers: UI.run.answers }); renderView(); Sound.play('tap'); };
ACT.quizClr = el => { delete UI.run.answers[el.dataset.qid]; LS.set(attemptKey(), { qid: UI.run.qid, answers: UI.run.answers }); renderView(); };
ACT.quizPrev = () => { if (UI.run.idx > 0) { UI.run.idx--; renderView(); } };
ACT.quizNext = () => { const q = S().quizzes.find(x => x.id === UI.run.qid); if (UI.run.idx < q.questions.length - 1) { UI.run.idx++; renderView(); } };
ACT.quizJump = el => { UI.run.idx = +en(el.dataset.i); renderView(); };
ACT.quizSubmit = () => finalizeRun(false);
ACT.newsPin = el => { const id = el.dataset.id; send('news.pin', { id }, st => { const n = st.news.find(x => x.id === id); if (n) n.pinned = !n.pinned; }, { sound: 'pop' }); };
ACT.newsEdit = el => { const n = S().news.find(x => x.id === el.dataset.id); UI.editNews = n.id; UI.newsDraft = clone(n); renderView(); $('#newsTitle')?.focus(); };
ACT.newsCancel = () => { UI.editNews = null; UI.newsDraft = null; renderView(); };
ACT.newsDel = el => { const id = el.dataset.id; send('news.delete', { id }, st => { st.news = st.news.filter(n => n.id !== id); }, { msg: 'خبر حذف شد', undo: true, sound: 'err' }); };
ACT.repStuPrev = () => previewSheet('🎓 کارنامهٔ A4', sheetReport($('#repStu').value));
ACT.repStuPrint = () => printSheet(sheetReport($('#repStu').value));
ACT.repAiPrev = () => previewSheet('🧠 گزارش تحلیلی A4', sheetAI($('#repAi').value));
ACT.repAiPrint = () => printSheet(sheetAI($('#repAi').value));
ACT.repClassPrev = () => previewSheet('📋 گزارش جامع کلاس', sheetClass());
ACT.repClassPrint = () => printSheet(sheetClass());
ACT.repAttPrev = () => { const j = UI.repMonth || jOf(todayISO()); previewSheet('📅 حضور ماهانه', sheetAttendance(j.jy, j.jm)); };
ACT.repAttPrint = () => { const j = UI.repMonth || jOf(todayISO()); printSheet(sheetAttendance(j.jy, j.jm)); };
ACT.codesPrint = () => confirmDlg({ title: '🔑 چاپ محرمانه', body: 'این برگه کد همهٔ دانش‌آموزان را دارد.', okText: 'چاپ', onOk: () => printSheet(sheetCodes()) });
ACT.printPrev = () => { const sh = $('#sheetWrap .sheet'); if (sh) { const c = sh.cloneNode(true); c.removeAttribute('style'); printSheet(c.outerHTML); } };
ACT.csvExport = el => exportKind(el.dataset.kind);
ACT.impTpl = () => impTemplate();
ACT.impParse = () => {
const text = $('#impText').value.trim();
if (!text) return toast('محتوای CSV خالی است', 'err');
const rows = parseCSV(text);
if (rows.length < 2) return toast('حداقل یک ردیف داده لازم است', 'err');
const kind = UI.imp?.kind || $('[data-chg="impKind"]').value;
const headers = rows[0].map(h => norm(h));
UI.imp = { kind, text, headers, rows: rows.slice(1), map: autoMap(kind, headers), parsed: true, valid: null };
$('#impPrev').innerHTML = impPreview();
toast('فایل خوانده شد؛ ستون‌ها را بررسی کنید', 'info');
};
ACT.impCheck = () => {
const im = UI.imp;
im.valid = normalizeImport(S(), im.kind, im.rows, im.map, $('#impCreate')?.checked !== false);
$('#impPrev').innerHTML = impPreview();
toast(`${fa(im.valid.ok.length)} ردیف معتبر، ${fa(im.valid.err.length)} خطا`, im.valid.err.length ? 'info' : 'ok');
};
ACT.impApply = () => {
const im = UI.imp; if (!im?.valid?.ok.length) return;
const create = $('#impCreate')?.checked !== false;
confirmDlg({
title: '📥 اعمال ورود داده', body: `${fa(im.valid.ok.length)} ردیف روی سرور ثبت و برای همه نمایش داده شود؟`, okText: 'اعمال',
onOk: async () => {
const r = await send('data.import', { kind: im.kind, rows: im.rows, map: im.map, create }, null, { undo: true, sound: 'win' });
if (r) { toast(`📥 ${fa(r.applied)} ردیف وارد شد${r.skipped ? ` • ${fa(r.skipped)} ردیف نادیده` : ''}`, 'ok'); UI.imp = null; renderView(); }
}
});
};
ACT.auditFix = el => {
let f; try { f = JSON.parse(el.dataset.fix); } catch { return; }
if (f.type === 'asmt.addSubject') confirmDlg({ title: 'اصلاح درس ارزشیابی', body: `درس «${f.subject}» افزوده شود؟`, okText: 'افزودن', onOk: () => send('asmt.addSubject', { id: f.id, subject: f.subject }, st => { const a = st.assessments.find(x => x.id === f.id); if (a && !a.subjects.includes(f.subject)) a.subjects.push(f.subject); ((st.grades[f.id] ||= {})[f.subject] ||= {}); }, { msg: 'درس افزوده شد', undo: true }) });
if (f.type === 'asmt.dropSubject') confirmDlg({ title: 'حذف درس خالی', body: `درس «${f.subject}» از این ارزشیابی حذف شود؟`, okText: 'حذف', danger: true, onOk: () => send('asmt.dropSubject', { id: f.id, subject: f.subject }, st => { const a = st.assessments.find(x => x.id === f.id); if (a) a.subjects = a.subjects.filter(s => s !== f.subject); if (st.grades[f.id]) delete st.grades[f.id][f.subject]; }, { msg: 'درس خالی حذف شد', undo: true }) });
};
ACT.setAccent = el => { const v = el.dataset.v; send('settings.patch', { path: 'meta.appearance.accent', value: v }, st => { st.meta.appearance.accent = v; }, { sound: 'pop' }); applyAppearance(); $$('.sw').forEach(s => s.classList.toggle('on', s === el)); };
ACT.setTheme = el => { const v = el.dataset.v; LS.del('sh_theme'); send('settings.patch', { path: 'meta.appearance.theme', value: v }, st => { st.meta.appearance.theme = v; }, { sound: 'tap' }); applyAppearance(); };
ACT.setDensity = el => { const v = el.dataset.v; send('settings.patch', { path: 'meta.appearance.density', value: v }, st => { st.meta.appearance.density = v; }, { sound: 'tap' }); applyAppearance(); };
ACT.gradeMode = el => {
const mode = el.dataset.mode; if (S().meta.gradingMode === mode) return;
confirmDlg({ title: 'تغییر شیوهٔ ارزشیابی', body: 'نمرات موجود به شیوهٔ جدید تبدیل شوند؟ (قابل بازگردانی)', okText: 'تبدیل', onOk: () => send('grading.mode', { mode }, null, { msg: 'شیوهٔ ارزشیابی تغییر کرد', undo: true }) });
};
ACT.subjAdd = () => { const i = $('#newSubj'), v = i.value.trim(); if (!v) return; if (S().subjects.includes(v)) return toast('این درس هست', 'info'); send('subject.add', { name: v }, st => st.subjects.push(v), { msg: 'درس افزوده شد', sound: 'pop' }); i.value = ''; };
ACT.subjDel = el => { const i = +en(el.dataset.i); send('subject.delete', { index: i }, st => { const name = st.subjects[i]; st.subjects.splice(i, 1); st.assessments.forEach(a => a.subjects = a.subjects.filter(s => s !== name)); for (const aid in st.grades) delete st.grades[aid][name]; }, { msg: 'درس حذف شد', undo: true, sound: 'err' }); };
ACT.subjMove = el => { const i = +en(el.dataset.i), d = +en(el.dataset.d), j = i + d; if (j < 0 || j >= S().subjects.length) return; send('subject.move', { from: i, to: j }, st => { const [x] = st.subjects.splice(i, 1); st.subjects.splice(j, 0, x); }, { sound: 'tap' }); };
ACT.tcReveal = () => { const el = $('#tcShow'); el.textContent = el.textContent === '••••••' ? fa(S().meta.teacherCode) : '••••••'; };
ACT.regenCodes = () => confirmDlg({ title: '🔄 کدهای جدید', body: 'کد همهٔ دانش‌آموزان عوض و کدهای قبلی باطل می‌شود.', okText: 'تولید', danger: true, onOk: () => send('codes.regenerate', {}, null, { msg: 'کدهای جدید تولید شد — برگهٔ محرمانه را چاپ کنید', undo: true }) });
ACT.exportJSON = () => { download(`پشتیبان-کلاس-${jShortEn(todayISO()).replace(/\//g, '-')}.json`, JSON.stringify(S(), null, 1), 'application/json'); toast('پشتیبان دانلود شد', 'ok'); };
ACT.resetReal = () => confirmDlg({ title: '♻️ بازنشانی', body: 'همهٔ داده‌های سرور با داده‌های واقعی کلاس جایگزین می‌شود.', okText: 'بازنشانی', danger: true, onOk: () => send('data.reset', {}, null, { msg: 'داده‌های واقعی بارگذاری شد', undo: true }) });
/* ---- inputs ---- */
INP.stuQ = el => { UI.stuQ = el.value; $('#stuWrap').innerHTML = stuList(); };
INP.gradeQ = el => {
UI.gradeQ = el.value;
const w = $('#gradeWrap'), sc = w.querySelector('.gwrap');
const t = sc?.scrollTop || 0, l = sc?.scrollLeft || 0;
w.innerHTML = gradeGrid();
const n = w.querySelector('.gwrap'); if (n) { n.scrollTop = t; n.scrollLeft = l; }
};
INP.discQ = el => { UI.discQ = el.value; renderView(); };
INP.model = el => { const p = el.dataset.path, v = el.value; st_setPath(ST, p, v); $('#topSchool').textContent = ST.meta.school; renderSidebar(); debounceSetting(p, v); };
INP.levelField = el => { const i = +en(el.dataset.i), f = el.dataset.f; ST.levels[i][f] = el.value; debounceLevel(i, f, el.value); };
INP.fontScale = el => { const v = +el.value; ST.meta.appearance.fontScale = v; applyAppearance(); const l = $('#fsVal'); if (l) l.textContent = fa(Math.round(v * 100)) + '٪'; debounceSetting('meta.appearance.fontScale', v); };
INP.dp = el => { UI.draftP[el.dataset.f] = el.value; };
INP.dpOpt = el => { UI.draftP.options[+en(el.dataset.i)].text = el.value; };
INP.dq = el => { UI.draftQ[el.dataset.f] = el.value; };
INP.dqNum = el => { UI.draftQ[el.dataset.f] = clamp(num(el.value) || 10, 1, 180); };
INP.dqQ = el => { UI.draftQ.questions[+en(el.dataset.i)].text = el.value; };
INP.dqOpt = el => { UI.draftQ.questions[+en(el.dataset.i)].options[+en(el.dataset.oi)].text = el.value; };
function st_setPath(o, p, v) { const k = p.split('.'); let t = o; for (let i = 0; i < k.length - 1; i++) { t[k[i]] = t[k[i]] || {}; t = t[k[i]]; } t[k[k.length - 1]] = v; }
const settingTimers = {};
function debounceSetting(path, value) {
clearTimeout(settingTimers[path]);
settingTimers[path] = setTimeout(() => send('settings.patch', { path, value }, null, { sound: null }), 600);
}
function debounceLevel(i, f, value) {
const k = i + f;
clearTimeout(settingTimers[k]);
settingTimers[k] = setTimeout(() => send('level.patch', { index: i, field: f, value }, null, { sound: null }), 600);
}
/* ---- changes ---- */
CHG.stuSort = el => { UI.stuSort = el.value; $('#stuWrap').innerHTML = stuList(); };
CHG.stuGroup = el => { UI.stuGroup = el.value; $('#stuWrap').innerHTML = stuList(); };
CHG.stuSel = el => { el.checked ? UI.sel.add(el.dataset.id) : UI.sel.delete(el.dataset.id); $('#stuWrap').innerHTML = stuList(); };
CHG.stuSelAll = el => { const l = stuFiltered(); if (el.checked) l.forEach(s => UI.sel.add(s.id)); else UI.sel.clear(); $('#stuWrap').innerHTML = stuList(); };
CHG.bulkGroup = el => { const gid = el.value; if (!gid) return; const ids = [...UI.sel]; send('student.bulkGroup', { ids, gid }, st => ids.forEach(sid => C.moveToGroup(st, sid, gid === 'none' ? '' : gid)), { msg: `${fa(ids.length)} عضو منتقل شدند` }); UI.sel.clear(); };
CHG.viewApply = el => { const v = S().savedViews.find(x => x.id === el.value); if (!v) return; UI.stuQ = v.q; UI.stuSort = v.sort; UI.stuGroup = v.group; renderView(); toast('نما اعمال شد: ' + v.name, 'ok'); };
CHG.attStu = el => { UI.attStu = el.value; $('#attBody').innerHTML = attStuReport(); };
CHG.grade = el => {
const { aid, sub, sid } = el.dataset;
let v = el.value.trim();
if (S().meta.gradingMode === 'numeric') { if (!v) v = null; else { const n = num(v); v = Number.isFinite(n) ? clamp(n, S().meta.numericMin || 0, S().meta.numericMax) : null; } }
send('grade.set', { aid, sub, sid, value: v === '' ? null : v }, st => {
const col = ((st.grades[aid] ||= {})[sub] ||= {});
if (v == null || v === '') delete col[sid]; else col[sid] = v;
}, { sound: 'tap' });
};
CHG.fillCol = el => {
const sub = el.dataset.sub, v = el.value; if (!v) return;
const aid = UI.gradeAid;
send('grade.fill', { aid, sub, value: v }, st => {
const col = ((st.grades[aid] ||= {})[sub] ||= {});
if (v === '__clear') st.students.forEach(s => delete col[s.id]);
else if (st.meta.gradingMode === 'numeric') st.students.forEach(s => col[s.id] = C.levelMid(st, v));
else st.students.forEach(s => col[s.id] = v);
}, { msg: 'ستون پر شد', undo: true });
};
CHG.discFilter = el => { UI.discFilter = el.value; renderView(); };
CHG.grpName = el => { const id = el.dataset.id, name = el.value.trim() || 'گروه'; send('group.update', { id, name }, st => { const g = st.groups.find(x => x.id === id); if (g) g.name = name; }, { sound: null }); };
CHG.grpColor = el => { const id = el.dataset.id, color = el.value; send('group.update', { id, color }, st => { const g = st.groups.find(x => x.id === id); if (g) g.color = color; }, { sound: 'pop' }); };
CHG.leaderSel = el => { const gid = el.dataset.gid, sid = el.value; send('group.setLeader', { gid, sid }, st => { const g = st.groups.find(x => x.id === gid); if (g) g.leader = sid || null; }, { msg: sid ? '🏅 سرگروه منصوب شد' : 'سرگروه برداشته شد' }); };
CHG.photo = el => {
const sid = el.dataset.sid, f = el.files?.[0]; el.value = '';
if (!f) return;
if (f.size > 4e6) return toast('حجم عکس باید کمتر از ۴ مگابایت باشد', 'err');
const rd = new FileReader();
rd.onload = () => {
const img = new Image();
img.onload = () => {
const cv = document.createElement('canvas'), sz = 112; cv.width = sz; cv.height = sz;
const ctx = cv.getContext('2d'), sc = Math.max(sz / img.width, sz / img.height);
ctx.drawImage(img, (sz - img.width * sc) / 2, (sz - img.height * sc) / 2, img.width * sc, img.height * sc);
const url = cv.toDataURL('image/jpeg', .82);
send('student.photo', { id: sid, avatar: url }, st => { const s = stuById(st, sid); if (s) s.avatar = url; }, { msg: '📷 عکس ذخیره شد' });
};
img.src = rd.result;
};
rd.readAsDataURL(f);
};
CHG.modelNum = el => { const v = num(el.value); if (Number.isFinite(v)) send('settings.patch', { path: el.dataset.path, value: v }, st => st_setPath(st, el.dataset.path, v), { sound: null }); };
CHG.levelField = el => { const i = +en(el.dataset.i), f = el.dataset.f, v = el.value; send('level.patch', { index: i, field: f, value: v }, st => { st.levels[i][f] = v; }, { sound: null }); };
CHG.setBool = el => { const p = el.dataset.path, v = el.checked; send('settings.patch', { path: p, value: v }, st => st_setPath(st, p, v), { sound: 'tap' }); applyAppearance(); };
CHG.setFont = el => { const v = el.value; send('settings.patch', { path: 'meta.appearance.font', value: v }, st => { st.meta.appearance.font = v; }, { msg: 'قلم برای همه تغییر کرد' }); applyAppearance(); };
CHG.visibility = el => { const k = el.dataset.k, v = el.checked; send('settings.patch', { path: 'studentVisibility.' + k, value: v }, st => { st.studentVisibility[k] = v; }, { msg: 'دسترسی ذخیره شد' }); };
CHG.soundSet = el => { Sound.on = el.checked; LS.set('sh_sound', Sound.on); applyAppearance(); };
CHG.roleAssign = el => { const k = el.dataset.role, sid = el.value; send('role.assign', { role: k, sid }, st => { st.roles[k] = sid || null; if (sid) st.roles.history.push({ role: k, sid, date: todayISO(), via: 'انتصاب معلم' }); }, { msg: sid ? `${ROLES[k].label} منصوب شد` : 'سمت خالی شد' }); };
CHG.rotAuto = el => { const v = el.checked; send('role.settings', { autoRotate: v }, st => { st.roles.autoRotate = v; }, { msg: 'ذخیره شد' }); };
CHG.termWeeks = el => { const v = clamp(num(el.value) || 4, 1, 12); send('role.settings', { termWeeks: v }, st => { st.roles.termWeeks = v; }, { msg: 'طول دوره ذخیره شد' }); };
CHG.repMonth = el => { const j = UI.repMonth || jOf(todayISO()); UI.repMonth = { jy: j.jy, jm: num(el.value), jd: 1 }; };
CHG.repYear = el => { const j = UI.repMonth || jOf(todayISO()); UI.repMonth = { jy: num(el.value), jm: j.jm, jd: 1 }; };
CHG.aiSel = el => { UI.aiStu = el.value; renderView(); };
CHG.csvOpt = el => { const k = el.dataset.k, v = el.value; send('settings.patch', { path: 'meta.csv.' + k, value: v }, st => { st.meta.csv[k] = v; }, { msg: 'تنظیم خروجی ذخیره شد' }); };
CHG.csvBool = el => { const k = el.dataset.k, v = el.checked; send('settings.patch', { path: 'meta.csv.' + k, value: v }, st => { st.meta.csv[k] = v; }, { sound: null }); };
CHG.impKind = el => { UI.imp = { kind: el.value, text: UI.imp?.text || $('#impText')?.value || '' }; $('#impPrev').innerHTML = ''; };
CHG.impFile = async el => {
const f = el.files?.[0]; el.value = ''; if (!f) return;
const text = await f.text();
$('#impText').value = text;
UI.imp = { kind: UI.imp?.kind || $('[data-chg="impKind"]').value, text };
ACT.impParse();
};
CHG.impMap = el => { UI.imp.map[el.dataset.f] = el.value === '' ? '' : +el.value; UI.imp.valid = null; };
CHG.jdate = el => {
const pre = el.dataset.pre, cur = jOf(UI.jdate[pre] || todayISO()), p = el.dataset.p, v = num(el.value);
if (p === 'd') cur.jd = v; if (p === 'm') cur.jm = v; if (p === 'y') cur.jy = v;
cur.jd = Math.min(cur.jd, Jalali.monthLen(cur.jy, cur.jm));
UI.jdate[pre] = jToISO(cur.jy, cur.jm, cur.jd);
const holder = el.closest('.field') || el.closest('.row')?.parentElement;
if (holder) { const tmp = document.createElement('div'); tmp.innerHTML = jDateSelects(pre); const old = holder.querySelector('.row'); if (old) old.replaceWith(tmp.querySelector('.row')); }
};
CHG.qdt = el => {
const f = el.dataset.f, p = el.dataset.p, v = num(el.value);
const d = new Date(UI.draftQ[f]); let [h, mi] = iranHM(d); const j = jOf(iranISO(d));
if (p === 'H') h = v; else if (p === 'M') mi = v;
else { if (p === 'd') j.jd = v; if (p === 'm') j.jm = v; if (p === 'y') j.jy = v; j.jd = Math.min(j.jd, Jalali.monthLen(j.jy, j.jm)); }
const g = Jalali.toG(j.jy, j.jm, j.jd);
UI.draftQ[f] = new Date(Date.UTC(g.gy, g.gm - 1, g.gd, h - 3, mi - 30)).toISOString();
UI.qCal = jOf(iranISO(new Date(UI.draftQ.startAt)));
$('#drawerBody').innerHTML = quizFormBody();
};
CHG.dpType = el => {
const d = UI.draftP; d.type = el.value;
if (el.value === 'yesno') d.options = [{ id: 'yes', text: 'بله، موافقم' }, { id: 'no', text: 'خیر' }];
else if (el.value !== 'election' && (!d.options.length || d.options[0]?.id === 'yes')) d.options = [{ id: uid(), text: '' }, { id: uid(), text: '' }, { id: uid(), text: '' }];
$('#drawerBody').innerHTML = pollFormBody();
};
CHG.dpRole = el => { UI.draftP.targetRole = el.value; };
CHG.dpCand = el => { const d = UI.draftP, id = el.value; if (el.checked) { if (!d.candidates.includes(id)) d.candidates.push(id); } else d.candidates = d.candidates.filter(x => x !== id); };
CHG.dpBool = el => { UI.draftP[el.dataset.f] = el.checked; };
CHG.dqNeg = el => { UI.draftQ.negative = el.checked; $('#drawerBody').innerHTML = quizFormBody(); };
CHG.dqRatio = el => { UI.draftQ.negRatio = +el.value; };
CHG.dqRes = el => { UI.draftQ.resultsVisible = el.checked; };
CHG.dqType = el => {
const qq = UI.draftQ.questions[+en(el.dataset.i)];
qq.type = el.value; qq.correctOptionId = '';
qq.options = el.value === 'tf' ? [{ id: uid(), text: 'درست' }, { id: uid(), text: 'غلط' }] : [{ id: uid(), text: '' }, { id: uid(), text: '' }, { id: uid(), text: '' }, { id: uid(), text: '' }];
$('#drawerBody').innerHTML = quizFormBody();
};
CHG.dqCorrect = el => { UI.draftQ.questions[+en(el.dataset.i)].correctOptionId = el.dataset.oid; };
CHG.importJSON = async el => {
const f = el.files?.[0]; el.value = ''; if (!f) return;
try {
const data = JSON.parse(await f.text());
if (!data || !Array.isArray(data.students)) throw new Error('ساختار نامعتبر');
confirmDlg({ title: '📥 بازیابی روی سرور', body: `${fa(data.students.length)} دانش‌آموز جایگزین دادهٔ فعلی شود؟`, okText: 'بازیابی', danger: true, onOk: () => send('data.replace', { state: data }, null, { msg: 'پشتیبان بازیابی شد', undo: true }) });
} catch (e) { toast('فایل نامعتبر: ' + e.message, 'err'); }
};
/* ---- forms ---- */
FORM.login = async () => {
const lock = LS.get('sh_lock', { n: 0, until: 0 });
if (lock.until > Date.now()) return;
const code = en($('#codeInput').value).trim(), err = $('#loginErr');
err.textContent = '';
if (!code) { err.textContent = 'لطفاً کد ورود را وارد کنید'; return; }
const btn = $('#loginBtn'); btn.disabled = true; btn.textContent = '⏳ در حال بررسی…';
try {
const r = await Net.login(code);
LS.set('sh_lock', { n: 0, until: 0 });
const sess = { token: r.token, role: r.role, sid: r.sid, name: r.name, exp: r.exp || Date.now() + 432e5 };
SS.set('sh12_sess', sess);
Sound.play('ok');
await enterApp(sess);
} catch (e) {
const l = LS.get('sh_lock', { n: 0, until: 0 }); l.n++;
if (l.n >= 5) { l.until = Date.now() + 30000; l.n = 0; err.textContent = 'تلاش بیش از حد؛ ۳۰ ثانیه صبر کنید'; }
else err.textContent = e.message || 'ورود ناموفق بود';
LS.set('sh_lock', l);
const card = $('#loginCard'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
Sound.play('err');
} finally { btn.disabled = false; btn.textContent = '🔓 ورود به سامانه'; }
};
FORM.stu = form => {
const fd = new FormData(form), id = fd.get('id'), name = String(fd.get('name')).trim(), code = en(String(fd.get('code'))).trim(), gid = fd.get('group');
if (!/^\d{6}$/.test(code)) return toast('کد باید ۶ رقم باشد', 'err');
if (S().students.some(s => s.code === code && s.id !== id)) return toast('این کد تکراری است', 'err');
if (id) send('student.update', { id, name, code, groupId: gid }, st => { const s = stuById(st, id); if (s) { s.name = name; s.code = code; C.moveToGroup(st, id, gid); } }, { msg: 'ویرایش ذخیره شد' });
else { const nid = uid(); send('student.add', { id: nid, name, code, groupId: gid }, st => { st.students.push({ id: nid, name, code, avatar: null }); if (gid) C.moveToGroup(st, nid, gid); }, { msg: 'دانش‌آموز افزوده شد' }); }
closeDrawer();
};
FORM.asmt = form => {
const fd = new FormData(form), id = fd.get('id'), subs = fd.getAll('sub');
if (!subs.length) return toast('حداقل یک درس انتخاب کنید', 'err');
const payload = { title: String(fd.get('title')).trim(), date: UI.jdate.asmt || todayISO(), type: fd.get('type'), subjects: subs, description: String(fd.get('description') || '').trim() };
if (id) send('asmt.update', { id, ...payload }, st => { const a = st.assessments.find(x => x.id === id); if (a) Object.assign(a, payload); }, { msg: 'ارزشیابی ویرایش شد' });
else { const nid = uid(); send('asmt.add', { id: nid, ...payload }, st => { st.assessments.push({ id: nid, ...payload, createdAt: todayISO() }); st.grades[nid] = {}; subs.forEach(s => st.grades[nid][s] = {}); UI.gradeAid = nid; }, { msg: '✅ ارزشیابی ساخته شد' }); }
closeDrawer();
};
FORM.disc = form => {
const fd = new FormData(form), sid = fd.get('sid'), pts = clamp(num(fd.get('points')) || 0, -10, 10), reason = String(fd.get('reason')).trim();
if (!sid || !reason || !pts) return toast('همهٔ فیلدها را کامل کنید', 'err');
const date = UI.jdate.disc || todayISO(), id = uid();
send('disc.add', { id, sid, date, points: pts, reason }, st => st.discipline.push({ id, sid, date, points: pts, reason, by: 'teacher' }), { msg: 'رویداد ثبت شد' });
form.reset(); const p = $('#discPts'); if (p) p.value = '۱';
};
FORM.report = form => {
const fd = new FormData(form), kind = form.dataset.kind;
const target = fd.get('target');
if (!target) return toast('دانش‌آموز را انتخاب کنید', 'err');
const payload = { id: uid(), kind, target, title: String(fd.get('title')).trim(), description: String(fd.get('description')).trim(), severity: num(fd.get('severity')) || 1 };
send('report.create', payload, null, { msg: kind === 'cleanliness' ? '🧹 گزارش نظافت به معلم ارسال شد' : '📨 گزارش به معلم ارسال شد' });
form.reset();
};
FORM.inspect = form => {
const fd = new FormData(form);
const items = { board: fd.get('board') === 'on', floor: fd.get('floor') === 'on', bin: fd.get('bin') === 'on', desks: fd.get('desks') === 'on' };
const note = String(fd.get('note') || '').trim();
send('inspect.save', { items, note }, null, { msg: '🧹 بازرسی امروز ثبت شد' });
};
FORM.verdict = form => {
const fd = new FormData(form), rid = fd.get('rid'), vtype = fd.get('vtype'), text = String(fd.get('text')).trim();
if (!text) return toast('متن رأی الزامی است', 'err');
const points = vtype === 'acquittal' ? 0 : clamp(num(fd.get('points')) || 0, -5, 0);
send('verdict.submit', { rid, vtype, points, text }, null, { msg: '🔨 رأی ثبت و به معلم ارسال شد', sound: 'gavel' });
closeDrawer();
};
FORM.leaderLog = form => {
const fd = new FormData(form);
send('leaderLog.save', { gid: fd.get('gid'), member: fd.get('member'), homework: fd.get('homework'), help: fd.get('help') === 'on', note: String(fd.get('note') || '').trim() }, null, { msg: '📨 گزارش ثبت شد (+🏅 امتیاز مدیریتی)' });
};
FORM.poll = () => {
const d = UI.draftP; d.question = d.question.trim();
if (!d.question) return toast('پرسش را بنویسید', 'err');
if (d.type === 'election') { if (d.candidates.length < 2) return toast('حداقل ۲ نامزد لازم است', 'err'); }
else if (d.type !== 'rating') { d.options = d.options.filter(o => o.text.trim()); if (d.options.length < 2) return toast('حداقل ۲ گزینه لازم است', 'err'); }
if (d.id) send('poll.update', { id: d.id, question: d.question, options: d.options, showResults: d.showResults }, null, { msg: 'نظرسنجی ویرایش شد' });
else send('poll.create', { id: uid(), type: d.type, question: d.question, options: d.options, candidates: d.candidates, targetRole: d.targetRole, showResults: d.showResults }, null, { msg: 'نظرسنجی برای همه منتشر شد' });
closeDrawer();
};
FORM.quiz = () => {
const d = UI.draftQ; d.title = d.title.trim();
if (!d.title) return toast('عنوان لازم است', 'err');
if (new Date(d.endAt) <= new Date(d.startAt)) return toast('پایان باید بعد از شروع باشد', 'err');
for (const qq of d.questions) {
if (!qq.text.trim()) return toast('متن همهٔ سؤال‌ها را بنویسید', 'err');
qq.options = qq.options.filter(o => o.text.trim());
if (qq.options.length < 2) return toast('هر سؤال حداقل ۲ گزینه می‌خواهد', 'err');
if (!qq.options.some(o => o.id === qq.correctOptionId)) return toast('گزینهٔ درست همهٔ سؤال‌ها را مشخص کنید ✅', 'err');
}
const quiz = { id: d.id || uid(), title: d.title, description: d.description, startAt: d.startAt, endAt: d.endAt, durationMin: d.durationMin, negative: d.negative, negRatio: d.negRatio, resultsVisible: d.resultsVisible, questions: d.questions };
if (d.id) send('quiz.update', { id: d.id, quiz }, null, { msg: 'آزمون ویرایش شد' });
else send('quiz.create', { quiz }, null, { msg: '⏱️ آزمون زمان‌دار برای همه منتشر شد' });
closeDrawer();
};
FORM.news = form => {
const fd = new FormData(form);
const data = { title: String(fd.get('title')).trim(), body: String(fd.get('body')).trim(), pinned: fd.get('pinned') === 'on' };
if (UI.editNews) { const id = UI.editNews; send('news.update', { id, ...data }, st => { const n = st.news.find(x => x.id === id); if (n) Object.assign(n, data); }, { msg: 'خبر ویرایش شد' }); UI.editNews = null; UI.newsDraft = null; }
else { const id = uid(); send('news.add', { id, ...data }, st => st.news.push({ id, ...data, date: todayISO() }), { msg: 'خبر برای همه منتشر شد' }); }
};
FORM.code = form => {
const code = en(String(new FormData(form).get('code'))).trim();
if (!/^\d{4,12}$/.test(code)) return toast('کد باید ۴ تا ۱۲ رقم باشد', 'err');
send('teacherCode.set', { code }, st => { st.meta.teacherCode = code; }, { msg: 'کد مدیریت تغییر کرد' });
form.reset();
};
/* ================= events ================= */
function faCaret(el) {
const before = el.value, after = fa(before);
if (before === after) return;
let pos = null; try { pos = el.selectionStart; } catch {}
el.value = after;
if (pos != null) { try { el.setSelectionRange(pos, pos); } catch {} }
}
document.addEventListener('input', e => {
const el = e.target;
if (el.matches?.('input[data-fa],textarea[data-fa]')) faCaret(el);
const h = el.closest?.('[data-inp]');
if (h) { const fn = INP[h.dataset.inp]; fn && fn(h, e); }
});
document.addEventListener('click', e => {
const pop = $('#pop');
if (!pop.classList.contains('hidden') && !e.target.closest('#pop') && !e.target.closest('[data-pop]')) closePop();
const el = e.target.closest('[data-act]');
if (!el) return;
const fn = ACT[el.dataset.act];
if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('change', e => { const el = e.target.closest('[data-chg]'); if (!el) return; const fn = CHG[el.dataset.chg]; fn && fn(el, e); });
document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault(); const fn = FORM[f.dataset.form]; fn && fn(f, e); });
document.addEventListener('keydown', e => {
if (e.key === 'Escape') {
if (!$('#pop').classList.contains('hidden')) closePop();
else if (!$('#modalWrap').classList.contains('hidden')) closeModal();
else if (!$('#drawerWrap').classList.contains('hidden')) closeDrawer();
}
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && SESS) { e.preventDefault(); ACT.search(); }
if (e.key === 'PrintScreen' && SESS && S()?.antiScreenshot) { shieldShow(); setTimeout(shieldHide, 1400); }
});
document.addEventListener('dragstart', e => { const el = e.target.closest('[data-drag]'); if (!el) return; el.classList.add('dragging'); e.dataTransfer.setData('text/plain', el.dataset.drag); e.dataTransfer.effectAllowed = 'move'; });
document.addEventListener('dragend', () => { $$('.dragging').forEach(x => x.classList.remove('dragging')); $$('.hint').forEach(x => x.classList.remove('hint')); });
document.addEventListener('dragover', e => { const z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); z.classList.add('hint'); });
document.addEventListener('dragleave', e => { const z = e.target.closest('[data-drop]'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('hint'); });
document.addEventListener('drop', e => {
const z = e.target.closest('[data-drop]'); if (!z) return;
e.preventDefault(); z.classList.remove('hint');
let p; try { p = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
if (p.t === 'm' && z.dataset.drop === 'g') { const gid = z.dataset.gid; send('group.move', { sid: p.sid, gid }, st => C.moveToGroup(st, p.sid, gid), { sound: 'pop' }); }
if (p.t === 's' && z.dataset.drop === 's') {
const from = p.i, to = +z.dataset.i; if (from === to) return;
send('subject.move', { from, to }, st => { const [x] = st.subjects.splice(from, 1); st.subjects.splice(to, 0, x); }, { sound: 'tap' });
}
});
const shieldShow = () => { if (SESS && S()?.antiScreenshot) $('#shield').classList.remove('hidden'); };
const shieldHide = () => $('#shield').classList.add('hidden');
document.addEventListener('visibilitychange', () => { if (document.hidden) shieldShow(); else { shieldHide(); if (SESS) pull(); } });
window.addEventListener('focus', () => { if (SESS) pull(); });
window.addEventListener('online', () => { Net.online = true; if (SESS) pull(true); });
window.addEventListener('offline', () => { Net.online = false; syncStatus('err', 'آفلاین'); });
window.addEventListener('afterprint', () => { $('#printArea').innerHTML = ''; });
/* ================= ticker / sync / fx ================= */
let ticker = null, poller = null;
function startTicker() {
clearInterval(ticker);
ticker = setInterval(() => {
const n = new Date(), [h, mi] = iranHM(n);
const c = $('#clock'); if (c) c.textContent = fa(pad(h)) + ':' + fa(pad(mi)) + ':' + fa(pad(n.getSeconds()));
const d = $('#dateChip'); if (d) d.textContent = `${weekDay(todayISO())} ${jLabel(todayISO())}`;
const lock = LS.get('sh_lock', { n: 0, until: 0 }), lb = $('#loginBtn');
if (lb && !$('#login').classList.contains('hidden')) {
if (lock.until > Date.now()) { lb.disabled = true; lb.textContent = `🔒 قفل موقت — ${fa(Math.ceil((lock.until - Date.now()) / 1000))} ثانیه`; }
else if (lb.disabled && lb.textContent.includes('قفل')) { lb.disabled = false; lb.textContent = '🔓 ورود به سامانه'; }
}
let rerender = false;
$$('[data-cd]').forEach(el => {
const diff = new Date(el.dataset.cd).getTime() - Date.now();
if (diff <= 0) { if (!el.dataset.done) { el.dataset.done = '1'; rerender = true; } }
else el.textContent = fmtDur(diff);
});
if (rerender && SESS && UI.section === 'quizzes' && !UI.run) pull(true);
if (UI.run) {
const rem = UI.run.endAt - Date.now(), el = $('#qTimer');
if (el) { el.textContent = fmtDur(rem); el.classList.toggle('low', rem < 60000); }
if (rem <= 0) { toast('⏰ زمان تمام شد؛ پاسخ‌ها خودکار ارسال شد', 'info'); finalizeRun(true); }
}
}, 1000);
}
function startPoller() {
clearInterval(poller);
poller = setInterval(() => {
if (!SESS || document.hidden || UI.pending) return;
const focused = document.hasFocus();
const every = focused ? 5000 : 20000;
if (Date.now() - UI.lastSync >= every) pull();
}, 2500);
}
let fxRAF = null;
function startFX() {
stopFX();
const cv = $('#fx'); if (!cv) return;
if (S()?.meta?.appearance?.anim === false || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const ctx = cv.getContext('2d');
let W = 0, H = 0;
const resize = () => { const r = cv.parentElement.getBoundingClientRect(); W = cv.width = Math.max(1, r.width); H = cv.height = Math.max(1, r.height); };
resize(); window.addEventListener('resize', resize);
const P = Array.from({ length: 44 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.2 + .6, s: Math.random() * .5 + .15, o: Math.random() * .5 + .15, ph: Math.random() * 6.28 }));
const loop = t => {
if ($('#login').classList.contains('hidden')) { fxRAF = null; return; }
ctx.clearRect(0, 0, W, H);
for (const p of P) {
p.y -= p.s; p.x += Math.sin(t / 1600 + p.ph) * .3;
if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28);
ctx.fillStyle = `rgba(255,255,255,${p.o * (.6 + .4 * Math.sin(t / 900 + p.ph))})`; ctx.fill();
}
fxRAF = requestAnimationFrame(loop);
};
fxRAF = requestAnimationFrame(loop);
}
function stopFX() { if (fxRAF) { cancelAnimationFrame(fxRAF); fxRAF = null; } }
/* ================= boot ================= */
async function enterApp(sess) {
SESS = sess; ROLE = sess.role;
$('#bootMsg').textContent = 'در حال دریافت دادهٔ کلاس…';
const r = await Net.state(null);
ST = r.state; Net.rev = r.revision; UI.lastSync = Date.now(); Net.online = true;
UI.section = isT() ? 'dash' : 'report';
UI.sel.clear(); UI.run = null; UI.gradeAid = ''; UI.stuQ = ''; UI.gradeQ = ''; UI.imp = null; UI.attCal = null;
const dates = Object.keys(ST.attendance || {}).sort();
UI.attDate = dates.includes(todayISO()) ? todayISO() : (dates[dates.length - 1] || todayISO());
$('#login').classList.add('hidden'); $('#app').classList.remove('hidden');
stopFX(); applyAppearance();
if (!isT()) resumeAttempt();
render(false); startTicker(); startPoller();
syncStatus('', Net.mode === 'server' ? 'همگام با سرور' : 'نمایشی همگام');
toast(`خوش آمدید، ${sess.name} 🌟`, 'ok');
}
function brandStats(st) {
$('#brandSchool').textContent = st.meta.school;
$('#loginSub').textContent = `${st.meta.className} • سال تحصیلی ${st.meta.year}`;
$('#brandStats').innerHTML = [
`👦 ${fa(st.students.length)} دانش‌آموز`, `📝 ${fa(st.assessments.length)} ارزشیابی`,
`📅 ${fa(Object.keys(st.attendance || {}).length)} روز حضور`, `⭐ ${fa(st.discipline.length)} رویداد انضباطی`,
`🧩 ${fa(st.groups.length)} گروه`
].map(x => `<span>${x}</span>`).join('');
}
function showLogin(pub) {
$('#app').classList.add('hidden'); $('#login').classList.remove('hidden');
const st = Net.mode === 'demo' ? Net.demoState() : null;
if (st) { ST = st; brandStats(st); }
else if (pub) {
$('#brandSchool').textContent = pub.school; $('#loginSub').textContent = `${pub.className} • سال تحصیلی ${pub.year}`;
$('#brandStats').innerHTML = [`👦 ${fa(pub.students)} دانش‌آموز`, `📝 ${fa(pub.assessments)} ارزشیابی`, `📅 ${fa(pub.attendanceDays)} روز حضور`, `⭐ ${fa(pub.discipline)} رویداد انضباطی`, `🧩 ${fa(pub.groups)} گروه`].map(x => `<span>${x}</span>`).join('');
}
/* 🔒 امنیت: هیچ کدی هرگز در صفحهٔ ورود نمایش داده نمی‌شود */
$('#modeBox').innerHTML = Net.mode === 'server'
? '🟢 <b>حالت سرور:</b> داده‌ها روی Supabase نگهداری می‌شود؛ هر ثبت معلم فوراً برای همهٔ دانش‌آموزان نمایش داده می‌شود.'
: '🟡 <b>حالت نمایشی:</b> سرور در دسترس نیست؛ دادهٔ نمونه روی همین دستگاه است و تب‌ها با هم همگام می‌شوند. 🔒 ورود معلم فقط با اتصال سرور ممکن است.';
applyAppearance();
setTimeout(() => $('#codeInput')?.focus(), 300);
startFX(); startTicker();
const bp = $('#brand');
if (bp && matchMedia('(pointer:fine)').matches && !bp.dataset.par) {
bp.dataset.par = '1';
bp.addEventListener('mousemove', e => {
const r = bp.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
$$('.fc', bp).forEach((c, i) => c.style.transform = `translate(${x * (14 + i * 8)}px,${y * (10 + i * 6)}px)`);
});
}
}
async function boot() {
try {
const probe = await Net.probe();
Net.mode = probe.mode;
if (Net.mode === 'demo') {
ST = Net.demoState();
try { Net.chan = new BroadcastChannel('sh12'); Net.chan.onmessage = () => { if (SESS) pull(); }; } catch {}
window.addEventListener('storage', e => { if (e.key === Net.revKey && SESS) pull(); });
}
const saved = SS.get('sh12_sess', null);
if (saved && saved.exp > Date.now()) {
try { await enterApp(saved); }
catch (e) { SS.del('sh12_sess'); SESS = null; ROLE = null; showLogin(probe.pub); }
} else { SS.del('sh12_sess'); showLogin(probe.pub); }
} catch (e) {
console.error(e);
Net.mode = 'demo'; ST = Net.demoState(); showLogin();
}
$('#boot').classList.add('hidden');
}
boot();
