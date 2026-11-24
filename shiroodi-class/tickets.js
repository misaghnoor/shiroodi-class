/* tickets.js — رابط کاربری تیکت‌ها و پیام‌ها */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.TK_PRI || typeof navItems !== 'function') return;

const PRI = C.TK_PRI, STA = C.TK_STATUS, CH = C.TK_CH;
const tkParts = C.tkParts, tkLast = C.tkLast;

const CSS = `
.tk-card{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px 16px;box-shadow:var(--shadow);cursor:pointer;transition:transform .18s,box-shadow .18s,border-color .18s;overflow:hidden}
.tk-card::before{content:'';position:absolute;top:0;bottom:0;right:0;width:5px;background:var(--pc)}
.tk-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:color-mix(in srgb,var(--pc) 40%,var(--line))}
.tk-card.unread{border-color:color-mix(in srgb,var(--pc) 45%,var(--line));background:color-mix(in srgb,var(--pc) 6%,var(--surface))}
.tk-sub{font-weight:800;font-size:.93rem;line-height:1.55}
.tk-prev{font-size:.79rem;color:var(--muted);line-height:1.8;margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.tk-pill{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:800;padding:3px 10px;border-radius:99px;background:color-mix(in srgb,var(--pc2) 13%,var(--surface));color:var(--pc2);border:1px solid color-mix(in srgb,var(--pc2) 32%,transparent)}
.tk-ud{width:10px;height:10px;border-radius:50%;background:var(--pc);flex:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--pc) 22%,transparent)}
.tk-msg{display:flex;gap:10px;margin-bottom:12px}
.tk-msg.mine{flex-direction:row-reverse}
.tk-bub{max-width:78%;border-radius:16px;padding:11px 14px;font-size:.86rem;line-height:1.9;border:1px solid var(--line);background:var(--surface2)}
.tk-msg.mine .tk-bub{background:color-mix(in srgb,var(--acc) 10%,var(--surface));border-color:color-mix(in srgb,var(--acc) 30%,var(--line))}
.tk-who{font-size:.7rem;font-weight:800;color:var(--muted);margin-bottom:3px}
.tk-list{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}
@media (max-width:700px){.tk-list{grid-template-columns:1fr}.tk-bub{max-width:88%}}
`;
const stl = document.createElement('style'); stl.id = 'tkStyles'; stl.textContent = CSS; document.head.appendChild(stl);

const T = { q: '', ch: 'all', pri: 'all', st: 'all', sort: 'new', thread: null };
const tk = () => S().tickets || { items: [], settings: {} };
const meKey = () => (isT() ? 'teacher' : SESS.sid);
const myItems = () => (tk().items || []).filter(t => tkParts(S(), t).includes(meKey()));
const isUnread = t => { const l = tkLast(t); return l.by !== meKey() && l.at > ((t.reads || {})[meKey()] || ''); };
const nameOf = by => by === 'teacher' ? (S().meta.teacher || 'معلم') : (stuById(S(), by) || {}).name || '—';
const counterpart = t => t.channel === 'group' ? ('👥 ' + (((S().groups || []).find(g => g.id === t.target) || {}).name || 'گروه')) : (t.from === 'teacher' ? (isT() ? '👦 ' + nameOf(t.target) : '👨‍🏫 ' + nameOf('teacher')) : (isT() ? '👦 ' + nameOf(t.target) : '👨‍🏫 ' + nameOf('teacher')));
function rel(at) {
  const m = Math.floor((Date.now() - new Date(at).getTime()) / 60000);
  if (m < 1) return 'همین الآن'; if (m < 60) return fa(m) + ' دقیقه پیش';
  const h = Math.floor(m / 60); if (h < 24) return fa(h) + ' ساعت پیش';
  return jShort(iranISO(new Date(at)));
}
function sorted() {
  let list = myItems().slice();
  const q = norm(T.q); if (q) list = list.filter(t => norm(t.subject).includes(q) || norm(t.body).includes(q) || (t.replies || []).some(r => norm(r.body).includes(q)));
  if (T.ch !== 'all') list = list.filter(t => t.channel === T.ch);
  if (T.pri !== 'all') list = list.filter(t => t.priority === T.pri);
  if (T.st !== 'all') list = list.filter(t => t.status === T.st);
  const w = t => (PRI[t.priority] || PRI.normal).w;
  if (T.sort === 'pri') list.sort((a, b) => w(b) - w(a) || tkLast(b).at.localeCompare(tkLast(a).at));
  else if (T.sort === 'unread') list = list.filter(isUnread).sort((a, b) => tkLast(b).at.localeCompare(tkLast(a).at));
  else list.sort((a, b) => tkLast(b).at.localeCompare(tkLast(a).at));
  return list;
}
function card(t, i) {
  const ch = CH[t.channel] || CH.private, pr = PRI[t.priority] || PRI.normal, st = STA[t.status] || STA.open, l = tkLast(t);
  const un = isUnread(t);
  const lastBody = t.replies && t.replies.length ? t.replies[t.replies.length - 1].body : t.body;
  return `<div class="tk-card ${un ? 'unread' : ''}" style="--pc:${pr.c};--i:${i}" data-act="tkOpen" data-id="${t.id}">
    <div class="spread" style="align-items:flex-start"><div class="row" style="gap:9px;align-items:flex-start">
      <span class="gr-ico" style="--kc:${ch.c};width:42px;height:42px;font-size:1.25rem">${ch.i}</span>
      <div style="min-width:0"><div class="tk-sub">${esc(t.subject)}</div>
        <div class="small muted">${counterpart(t)} • آخرین پیام: ${esc(nameOf(l.by))} • ${rel(l.at)}</div></div></div>
      ${un ? '<span class="tk-ud"></span>' : ''}</div>
    <div class="tk-prev">${esc(lastBody)}</div>
    <div class="row mt" style="gap:6px;margin-top:9px">
      <span class="tk-pill" style="--pc2:${pr.c}">${pr.i} ${pr.l}</span>
      <span class="tk-pill" style="--pc2:${st.c}">${st.i} ${st.l}</span>
      <span class="tk-pill" style="--pc2:${ch.c}">${ch.i} ${ch.l}</span>
      <span class="chip">💬 ${fa((t.replies || []).length + 1)}</span></div></div>`;
}
function toolbar() {
  return `<div class="card mb"><div class="row" style="gap:9px;flex-wrap:wrap">
    <input class="input" style="max-width:220px" placeholder="🔍 جست‌وجو در پیام‌ها…" value="${esc(T.q)}" data-inp="tkQ">
    <select class="select" style="max-width:160px" data-chg="tkCh"><option value="all">همهٔ کانال‌ها</option><option value="private" ${T.ch === 'private' ? 'selected' : ''}>🔐 خصوصی</option><option value="group" ${T.ch === 'group' ? 'selected' : ''}>👥 گروهی</option></select>
    <select class="select" style="max-width:150px" data-chg="tkPri"><option value="all">همهٔ درجه‌ها</option>${Object.entries(PRI).map(([k, v]) => `<option value="${k}" ${T.pri === k ? 'selected' : ''}>${v.i} ${v.l}</option>`).join('')}</select>
    <select class="select" style="max-width:160px" data-chg="tkSt"><option value="all">همهٔ وضعیت‌ها</option>${Object.entries(STA).map(([k, v]) => `<option value="${k}" ${T.st === k ? 'selected' : ''}>${v.i} ${v.l}</option>`).join('')}</select>
    <select class="select" style="max-width:160px" data-chg="tkSort">${[['new', '🕐 تازه‌ترین'], ['pri', '🔴 مهم‌ترین'], ['unread', '🔵 خوانده‌نشده‌ها']].map(([v, l]) => `<option value="${v}" ${T.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <button type="button" class="btn sm soft" data-act="tkReadAll">✓ خواندم همه</button>
    ${isT() ? '<button type="button" class="btn sm ghost" data-act="tkCsv">📤 CSV</button>' : ''}
    <button type="button" class="btn sm" data-act="tkNew">✍️ پیام جدید</button></div></div>`;
}
function viewHTML() {
  const list = sorted(), un = myItems().filter(isUnread).length;
  const urg = myItems().filter(t => t.status !== 'closed' && (t.priority === 'urgent' || t.priority === 'high')).length;
  return `<div class="gr">
    <div class="gr-hero" style="border-color:color-mix(in srgb,#7c3aed 30%,var(--line))"><div class="spread"><div>
      <h1>🎫 تیکت‌ها و پیام‌ها</h1>
      <p>${isT() ? 'گفت‌وگوی خصوصی با هر دانش‌آموز، یا گفت‌وگوی گروهی با هر گروه — با درجهٔ اهمیت و پیگیری وضعیت.' : 'پیام خصوصی به معلم، یا گفت‌وگو با اعضای گروه خودت — با درجهٔ اهمیت.'}</p>
      <div class="gr-quick"><span class="q">📬 <b>${fa(myItems().filter(t => t.status !== 'closed').length)}</b> باز</span>
        <span class="q">🔵 <b>${fa(un)}</b> خوانده‌نشده</span>
        <span class="q">🔴 <b>${fa(urg)}</b> مهم/فوری</span>
        <span class="q">💬 <b>${fa(myItems().length)}</b> کل گفت‌وگوها</span></div></div>
      <div class="row"><button type="button" class="btn" data-act="tkNew">✍️ پیام جدید</button></div></div></div>
    ${toolbar()}
    ${list.length ? `<div class="tk-list stagger">${list.map((t, i) => card(t, i)).join('')}</div>` : `<div class="card">${empty('🎫', 'پیامی نیست', T.sort === 'unread' ? 'همه را خوانده‌ای. آفرین!' : 'اولین گفت‌وگو را شروع کن.', '<button type="button" class="btn" data-act="tkNew">✍️ پیام جدید</button>')}</div>`}
    ${isT() ? `<div class="card mt"><div class="spread"><div><b class="small">⚙️ قواعد ارسال</b><div class="small muted">دانش‌آموزان بتوانند به معلم / به گروه خودشان پیام بدهند</div></div>
      <div class="row"><span class="switch"><input type="checkbox" ${tk().settings.studentToTeacher !== false ? 'checked' : ''} data-chg="tkSet" data-k="studentToTeacher"><i></i></span>
      <span class="switch"><input type="checkbox" ${tk().settings.studentToGroup !== false ? 'checked' : ''} data-chg="tkSet" data-k="studentToGroup"><i></i></span></div></div></div>` : ''}</div>`;
}
function threadHTML(t) {
  const ch = CH[t.channel] || CH.private, pr = PRI[t.priority] || PRI.normal, st = STA[t.status] || STA.open;
  const ps = tkParts(S(), t);
  const msgs = [{ by: t.from, body: t.body, at: t.createdAt }].concat(t.replies || []);
  return `<div>
    <div class="row mb" style="gap:8px"><span class="tk-pill" style="--pc2:${pr.c}">${pr.i} ${pr.l}</span><span class="tk-pill" style="--pc2:${st.c}">${st.i} ${st.l}</span><span class="tk-pill" style="--pc2:${ch.c}">${ch.i} ${ch.l}</span></div>
    <div class="row mb" style="gap:6px">${ps.map(p => p === 'teacher' ? `<span class="chip">👨‍🏫 ${esc(S().meta.teacher)}</span>` : `<span class="chip">${avHTML(stuById(S(), p), 'sm')} ${esc(nameOf(p))}</span>`).join('')}</div>
    <div class="divider"></div>
    ${msgs.map(m => `<div class="tk-msg ${m.by === meKey() ? 'mine' : ''}">${avHTML(m.by === 'teacher' ? { name: S().meta.teacher } : stuById(S(), m.by), 'sm')}
      <div class="tk-bub"><div class="tk-who">${esc(nameOf(m.by))} • ${rel(m.at)}</div>${esc(m.body)}</div></div>`).join('')}
    ${t.status === 'closed' ? `<div class="ins warn" style="display:flex;gap:9px;padding:10px 12px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-size:.82rem"><span>🔒</span><span>این تیکت بسته شده است.</span></div>` :
      `<form data-form="tkReply"><input type="hidden" name="id" value="${t.id}">
       <div class="field"><textarea class="input" name="body" rows="3" required placeholder="پاسخ تو…"></textarea></div>
       <button class="btn" type="submit" style="width:100%">📨 ارسال پاسخ</button></form>`}
    <div class="divider"></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">
      ${t.status !== 'closed' ? `<button type="button" class="btn sm ghost" data-act="tkClose" data-id="${t.id}">🔒 بستن</button>` : `<button type="button" class="btn sm soft" data-act="tkReopen" data-id="${t.id}">📬 بازکردن</button>`}
      ${(isT() || t.from === meKey()) ? `<select class="select" style="max-width:150px" data-chg="tkPriSel" data-id="${t.id}">${Object.entries(PRI).map(([k, v]) => `<option value="${k}" ${t.priority === k ? 'selected' : ''}>${v.i} درجه: ${v.l}</option>`).join('')}</select>` : ''}
      ${isT() ? `<button type="button" class="btn sm danger" data-act="tkDel" data-id="${t.id}">🗑 حذف</button>` : ''}
    </div></div>`;
}
function composeHTML() {
  const st = S(), s = tk().settings;
  const canPriv = isT() || s.studentToTeacher !== false;
  const myGroups = isT() ? (st.groups || []) : (st.groups || []).filter(g => (g.members || []).includes(SESS.sid));
  const canGroup = (isT() || s.studentToGroup !== false) && myGroups.length > 0;
  return `<form data-form="tkNew" class="gr">
    <div class="field"><label class="lbl">کانال پیام</label><div class="seg" id="tkChSeg">
      ${canPriv ? `<button type="button" class="on" data-act="tkChPick" data-v="private">🔐 خصوصی</button>` : ''}
      ${canGroup ? `<button type="button" class="${canPriv ? '' : 'on'}" data-act="tkChPick" data-v="group">👥 گروهی</button>` : ''}</div>
      <input type="hidden" name="channel" id="tkChVal" value="${canPriv ? 'private' : 'group'}"></div>
    <div class="field" id="tkTargetBox"><label class="lbl">گیرنده</label><select class="select" name="target" id="tkTargetSel">
      ${canPriv ? (isT() ? `<option value="">انتخاب دانش‌آموز…</option>${(st.students || []).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}` : `<option value="teacher">👨‍🏫 ${esc(st.meta.teacher)} (معلم)</option>`) : ''}
    </select></div>
    <div class="field"><label class="lbl">درجهٔ اهمیت</label><div class="seg" id="tkPriSeg">
      ${Object.entries(PRI).map(([k, v], i) => `<button type="button" class="${k === 'normal' ? 'on' : ''}" data-act="tkPriPick" data-v="${k}">${v.i} ${v.l}</button>`).join('')}</div>
      <input type="hidden" name="priority" id="tkPriVal" value="normal"></div>
    <div class="field"><label class="lbl">موضوع</label><input class="input" name="subject" required maxlength="90" placeholder="مثلاً: دربارهٔ تکلیف ریاضی"></div>
    <div class="field"><label class="lbl">متن پیام</label><textarea class="input" name="body" rows="4" required maxlength="2000" placeholder="پیامت را کامل و محترمانه بنویس…"></textarea></div>
    <button class="btn" type="submit" style="width:100%">📨 ارسال پیام</button></form>`;
}
function openThread(id) {
  const t = myItems().find(x => x.id === id); if (!t) return;
  T.thread = id;
  openDrawer('🎫 ' + t.subject, threadHTML(t), false);
  if (isUnread(t)) send('tk.read', { id }, st => { const q = st.tickets.items.find(x => x.id === id); if (q) { q.reads = q.reads || {}; q.reads[meKey()] = new Date().toISOString(); } }, { sound: null });
}
function refreshThread() {
  if (!T.thread) return;
  const w = document.getElementById('drawerWrap');
  if (!w || w.classList.contains('hidden')) return;
  const t = myItems().find(x => x.id === T.thread);
  if (t && String(document.getElementById('drawerTitle').textContent).indexOf('🎫') === 0) document.getElementById('drawerBody').innerHTML = threadHTML(t);
}

/* ---------- integration ---------- */
const baseNav = navItems, baseRV = renderView, baseSB = renderSidebar, baseRender = render;
navItems = function () {
  const items = baseNav();
  const e = ['tickets', '🎫', isT() ? 'تیکت‌ها و پیام‌ها' : 'پیام‌های من'];
  const at = items.findIndex(x => x[0] === (isT() ? 'news' : 'myCourt'));
  if (at > -1) items.splice(at + 1, 0, e); else items.push(e);
  return items;
};
renderView = function () {
  if (UI.section !== 'tickets') return baseRV();
  const v = document.getElementById('view');
  try { C.tkEnsure(S()); v.innerHTML = `<div class="ve">${viewHTML()}</div>`; }
  catch (e) { console.error('tickets view', e); v.innerHTML = `<div class="card">${empty('🛠️', 'خطا در نمایش پیام‌ها', 'صفحه را دوباره بارگذاری کنید.', '<button type="button" class="btn" data-act="reload">بارگذاری مجدد</button>')}</div>`; }
};
renderSidebar = function () {
  baseSB();
  if (!S() || !SESS || !S().tickets) return;
  const n = C.tkUnread(S(), meKey());
  const btn = document.querySelector('.nav[data-sec="tickets"]');
  if (btn && n > 0 && !btn.querySelector('.nb')) { const b = document.createElement('span'); b.className = 'nb'; b.textContent = fa(n); btn.appendChild(b); }
};
const seenKey = () => 'sh14_tkseen_' + (SESS ? (SESS.role + '_' + (SESS.sid || 't')) : 'x');
function loadSeen() { try { return JSON.parse(localStorage.getItem(seenKey()) || '{}'); } catch (e) { return {}; } }
function saveSeen(o) { try { localStorage.setItem(seenKey(), JSON.stringify(o)); } catch (e) {} }
function checkNew() {
  if (!S() || !SESS || !S().tickets) return;
  const seen = loadSeen(), key = meKey(); let changed = false;
  for (const t of myItems()) {
    const msgs = [{ by: t.from, at: t.createdAt }].concat(t.replies || []);
    const fresh = msgs.filter(m => m.by !== key && m.at > (seen[t.id] || ''));
    const l = tkLast(t);
    if (fresh.length && !document.hidden) {
      Sound.play('pop');
      toast(`🎫 پیام تازه (${(PRI[t.priority] || PRI.normal).l}): ${t.subject}`, 'info', { label: 'دیدن', cb: () => { setSection('tickets'); setTimeout(() => openThread(t.id), 60); } }, 8000);
    }
    const nv = l.at > (seen[t.id] || '') ? l.at : seen[t.id];
    if (nv !== seen[t.id]) { seen[t.id] = nv; changed = true; }
  }
  if (changed) saveSeen(seen);
}
render = function (keep) { baseRender(keep); checkNew(); };

/* ---------- actions ---------- */
ACT.tkNew = () => openDrawer('✍️ پیام جدید', composeHTML());
ACT.tkOpen = el => openThread(el.dataset.id);
ACT.tkChPick = el => {
  document.querySelectorAll('#tkChSeg button').forEach(b => b.classList.toggle('on', b === el));
  document.getElementById('tkChVal').value = el.dataset.v;
  const box = document.getElementById('tkTargetBox'), sel = document.getElementById('tkTargetSel');
  if (el.dataset.v === 'group') {
    const gs = isT() ? S().groups : (S().groups || []).filter(g => (g.members || []).includes(SESS.sid));
    box.style.display = ''; sel.innerHTML = gs.map(g => `<option value="${g.id}">👥 ${esc(g.name)}</option>`).join('');
  } else {
    if (isT()) { box.style.display = ''; sel.innerHTML = `<option value="">انتخاب دانش‌آموز…</option>` + (S().students || []).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join(''); }
    else { box.style.display = 'none'; sel.innerHTML = `<option value="teacher">👨‍🏫 معلم</option>`; }
  }
};
ACT.tkPriPick = el => { document.querySelectorAll('#tkPriSeg button').forEach(b => b.classList.toggle('on', b === el)); document.getElementById('tkPriVal').value = el.dataset.v; Sound.play('tap'); };
ACT.tkReadAll = () => send('tk.readAll', {}, st => { const k = meKey(); C.tkVisible(st, k).forEach(t => { t.reads = t.reads || {}; t.reads[k] = new Date().toISOString(); }); }, { msg: '✓ همه خوانده شد' });
ACT.tkClose = el => send('tk.status', { id: el.dataset.id, status: 'closed' }, st => { const t = st.tickets.items.find(x => x.id === el.dataset.id); if (t) t.status = 'closed'; }, { msg: '🔒 تیکت بسته شد' }).then(refreshThread);
ACT.tkReopen = el => send('tk.status', { id: el.dataset.id, status: 'open' }, st => { const t = st.tickets.items.find(x => x.id === el.dataset.id); if (t) t.status = 'open'; }, { msg: '📬 تیکت باز شد' }).then(refreshThread);
ACT.tkDel = el => { const id = el.dataset.id; confirmDlg({ title: 'حذف تیکت', body: 'کل گفت‌وگو برای همه حذف شود؟', okText: 'حذف', danger: true, onOk: () => { send('tk.delete', { id }, st => { st.tickets.items = st.tickets.items.filter(x => x.id !== id); }, { msg: 'تیکت حذف شد', undo: true, sound: 'err' }); closeDrawer(); T.thread = null; } }); };
ACT.tkCsv = () => {
  const st = S();
  const rows = [['تاریخ', 'کانال', 'نویسنده', 'گیرنده', 'درجه', 'موضوع', 'وضعیت', 'تعداد پاسخ']];
  (st.tickets.items || []).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)).forEach(t => {
    rows.push([jShort(iranISO(new Date(t.createdAt))), (CH[t.channel] || {}).l || t.channel, nameOf(t.from),
      t.channel === 'group' ? (((st.groups || []).find(g => g.id === t.target) || {}).name || '') : nameOf(t.target),
      (PRI[t.priority] || {}).l || '', t.subject, (STA[t.status] || {}).l || '', (t.replies || []).length]);
  });
  download(`تیکت‌ها-${C.jShortEn(todayISO()).replace(/\//g, '-')}.csv`, serializeCSV(st, rows));
  toast('فایل تیکت‌ها دانلود شد', 'ok');
};
INP.tkQ = el => { T.q = el.value; renderView(); const i = document.querySelector('[data-inp="tkQ"]'); if (i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) {} } };
CHG.tkCh = el => { T.ch = el.value; renderView(); };
CHG.tkPri = el => { T.pri = el.value; renderView(); };
CHG.tkSt = el => { T.st = el.value; renderView(); };
CHG.tkSort = el => { T.sort = el.value; renderView(); };
CHG.tkPriSel = el => { const id = el.dataset.id, v = el.value; send('tk.priority', { id, priority: v }, st => { const t = st.tickets.items.find(x => x.id === id); if (t) t.priority = v; }, { msg: 'درجهٔ اهمیت عوض شد', sound: 'pop' }).then(refreshThread); };
CHG.tkSet = el => { const k = el.dataset.k, v = el.checked; send('tk.settings', { patch: { [k]: v } }, st => { st.tickets.settings[k] = v; }, { msg: 'قاعده ذخیره شد' }); };
FORM.tkNew = form => {
  const fd = new FormData(form);
  const channel = fd.get('channel'), target = fd.get('target') || (channel === 'private' && !isT() ? SESS.sid : '');
  const subject = String(fd.get('subject') || '').trim(), body = String(fd.get('body') || '').trim();
  if (!subject || !body) return toast('موضوع و متن را کامل کن', 'err');
  if (channel === 'private' && isT() && !target) return toast('دانش‌آموز را انتخاب کن', 'err');
  send('tk.create', { id: uid(), channel, target: channel === 'private' && !isT() ? SESS.sid : target, priority: fd.get('priority'), subject, body }, null, { sound: null })
    .then(r => { if (r) { Sound.play('ok'); toast('📨 پیام فرستاده شد', 'ok'); } });
  closeDrawer();
};
FORM.tkReply = form => {
  const fd = new FormData(form), id = fd.get('id'), body = String(fd.get('body') || '').trim();
  if (!body) return toast('متن پاسخ خالی است', 'err');
  send('tk.reply', { id, body }, st => { const t = st.tickets.items.find(x => x.id === id); if (t) { t.replies.push({ id: uid(), by: meKey(), body, at: new Date().toISOString() }); if (t.status === 'open') t.status = 'answered'; t.reads = t.reads || {}; t.reads[meKey()] = new Date().toISOString(); } }, { sound: null })
    .then(r => { if (r !== null && r !== undefined) { Sound.play('pop'); } });
  setTimeout(refreshThread, 350);
};
if (S() && SESS) render(true);
})();
