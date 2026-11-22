/* homework.js — رابط کاربری ماژول تکالیف */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.HK || typeof navItems !== 'function') return;

const HK = C.HK, HS = C.HS, HR = C.HR, HP = C.HP;
const hwDueTs = C.hwDueTs, hwPhase = C.hwPhase, hwAudience = C.hwAudience, hwTargets = C.hwTargets,
      hwSubOf = C.hwSubOf, hwReviewKey = C.hwReviewKey, hwOrdered = C.hwOrdered, hwStats = C.hwStats,
      hwAStats = C.hwAStats, hwClass = C.hwClass;

/* ================= style ================= */
const CSS = `
.hw{--paper:#fdf7ea;--ink2:#2b2418;--rule:#dfd3ba;--margin:#e8918c;
--hok:#16a34a;--hwarn:#f59e0b;--hbad:#e11d48;--hinfo:#1d4ed8;--hlead:#65a30d;--hproj:#0d9488;--hpurple:#7c3aed;--hsun:#f97316}
[data-theme=dark] .hw{--paper:#141d33;--ink2:#e9eef7;--rule:#26334f;--margin:#7f3b46}
.hw-hero{position:relative;overflow:hidden;border-radius:22px;padding:24px 26px;margin-bottom:18px;
background:linear-gradient(135deg,color-mix(in srgb,var(--hinfo) 14%,var(--paper)),color-mix(in srgb,var(--hsun) 12%,var(--paper)) 48%,color-mix(in srgb,var(--hpurple) 14%,var(--paper)));
border:1.5px solid color-mix(in srgb,var(--hinfo) 26%,var(--line));box-shadow:var(--shadow)}
.hw-hero::before{content:'';position:absolute;inset:0;pointer-events:none;
background:repeating-linear-gradient(to bottom,transparent 0 27px,color-mix(in srgb,var(--rule) 75%,transparent) 27px 28px);opacity:.75}
.hw-hero::after{content:'';position:absolute;top:0;bottom:0;right:52px;width:2px;background:color-mix(in srgb,var(--margin) 80%,transparent);pointer-events:none}
.hw-hero>*{position:relative;z-index:2}
.hw-hero h1{font-family:var(--display);font-weight:400;font-size:2rem;line-height:1.3;color:var(--ink2)}
.hw-hero p{color:var(--muted);font-size:.88rem;max-width:640px}
.hw-tape{position:absolute;top:-10px;left:34px;width:104px;height:30px;transform:rotate(-6deg);
background:linear-gradient(135deg,color-mix(in srgb,var(--hwarn) 55%,#fff),color-mix(in srgb,var(--hsun) 45%,#fff));
opacity:.6;border-radius:3px;box-shadow:0 4px 12px -6px rgba(0,0,0,.5);z-index:3}
.hw-quick{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
.hw-quick .q{display:inline-flex;align-items:center;gap:7px;background:color-mix(in srgb,var(--surface) 82%,transparent);
border:1px solid var(--line);border-radius:13px;padding:7px 13px;font-size:.8rem;font-weight:800;backdrop-filter:blur(6px)}
.hw-quick .q b{font-family:var(--display);font-size:1.15rem;font-weight:400}
.hw-toolbar{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
.hw-toolbar .input,.hw-toolbar .select{width:auto}
.hw-grid{display:grid;gap:15px;grid-template-columns:repeat(auto-fill,minmax(330px,1fr))}
.hw-card{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:17px;padding:15px 16px 14px 16px;
box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s,border-color .2s;overflow:hidden}
.hw-card::before{content:'';position:absolute;top:0;bottom:0;right:0;width:5px;background:var(--kc,var(--hinfo))}
.hw-card::after{content:'';position:absolute;inset:auto 0 0 0;height:38px;pointer-events:none;
background:repeating-linear-gradient(to bottom,transparent 0 12px,color-mix(in srgb,var(--rule) 60%,transparent) 12px 13px);opacity:.5}
.hw-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:color-mix(in srgb,var(--kc) 40%,var(--line))}
.hw-card.dragging{opacity:.45;transform:rotate(-1.4deg) scale(.98)}
.hw-card.sel{border-color:var(--kc);box-shadow:0 0 0 2.5px color-mix(in srgb,var(--kc) 26%,transparent)}
.hw-card>*{position:relative;z-index:2}
.hw-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:9px}
.hw-kind{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex:none;
background:color-mix(in srgb,var(--kc) 15%,var(--surface));border:1px solid color-mix(in srgb,var(--kc) 30%,transparent)}
.hw-title{font-weight:800;font-size:.96rem;line-height:1.55;color:var(--ink)}
.hw-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:5px}
.hw-pill{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:800;padding:3px 10px;border-radius:99px;
background:color-mix(in srgb,var(--pc) 13%,var(--surface));color:var(--pc);border:1px solid color-mix(in srgb,var(--pc) 32%,transparent)}
.hw-ring{position:relative;width:62px;height:62px;flex:none}
.hw-ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:1.05rem;font-weight:400}
.hw-counts{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 9px}
.hw-cnt{font-size:.72rem;font-weight:800;padding:3px 9px;border-radius:9px;background:var(--surface2);border:1px solid var(--line);color:var(--muted)}
.hw-cnt.ok{background:color-mix(in srgb,var(--hok) 12%,var(--surface));color:var(--hok);border-color:color-mix(in srgb,var(--hok) 30%,transparent)}
.hw-cnt.wait{background:color-mix(in srgb,var(--hinfo) 12%,var(--surface));color:var(--hinfo);border-color:color-mix(in srgb,var(--hinfo) 30%,transparent)}
.hw-cnt.bad{background:color-mix(in srgb,var(--hbad) 12%,var(--surface));color:var(--hbad);border-color:color-mix(in srgb,var(--hbad) 30%,transparent)}
.hw-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;
border-top:1px dashed var(--line);padding-top:9px;margin-top:4px}
.hw-cd{font-variant-numeric:tabular-nums;font-weight:800;font-size:.78rem;color:var(--pc,var(--muted))}
.hw-grip{cursor:grab;color:var(--muted);font-size:1rem;padding:2px 5px;border-radius:7px;user-select:none}
.hw-grip:hover{background:var(--surface2);color:var(--ink)}
.hw-card.hint{border-color:var(--kc);border-style:dashed;transform:scale(1.015)}
.hw-heat{display:grid;gap:3px;overflow-x:auto;padding-bottom:6px}
.hw-heat .hc{width:100%;aspect-ratio:1;min-width:15px;border-radius:5px;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:800}
.hw-heat .hh{font-size:.62rem;color:var(--muted);font-weight:800;text-align:center;white-space:nowrap}
.hw-heat .hn{font-size:.7rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:5px}
.hw-l0{background:var(--surface2);color:var(--muted)}
.hw-l1{background:color-mix(in srgb,var(--hbad) 22%,var(--surface));color:var(--hbad)}
.hw-l2{background:color-mix(in srgb,var(--hwarn) 26%,var(--surface));color:#a15c00}
.hw-l3{background:color-mix(in srgb,var(--hlead) 26%,var(--surface));color:#3f6212}
.hw-l4{background:color-mix(in srgb,var(--hok) 34%,var(--surface));color:#14532d}
[data-theme=dark] .hw-heat .hw-l2{color:#fcd34d}[data-theme=dark] .hw-heat .hw-l3{color:#bef264}[data-theme=dark] .hw-heat .hw-l4{color:#86efac}
.hw-row{display:flex;align-items:center;gap:11px;padding:10px 13px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.hw-row:last-child{border-bottom:none}
.hw-row .n{font-weight:700;font-size:.87rem;flex:1;min-width:140px}
.hw-note{font-size:.78rem;color:var(--muted);background:var(--surface2);border:1px dashed var(--line);border-radius:10px;padding:7px 10px;margin-top:6px;line-height:1.8}
.hw-thumb{width:46px;height:46px;border-radius:11px;object-fit:cover;border:1.5px solid var(--line);cursor:zoom-in;flex:none;transition:transform .18s}
.hw-thumb:hover{transform:scale(1.09);border-color:var(--hinfo)}
.hw-proofbig{width:100%;max-height:62vh;object-fit:contain;border-radius:14px;background:var(--surface2)}
.hw-drop{border:2px dashed var(--line);border-radius:15px;padding:16px;text-align:center;transition:all .2s;background:var(--overlay)}
.hw-drop:hover{border-color:var(--hinfo);background:color-mix(in srgb,var(--hinfo) 6%,var(--surface))}
.hw-seg{display:flex;gap:7px;flex-wrap:wrap}
.hw-seg button{flex:1;min-width:104px;border:2px solid var(--line);background:var(--overlay);border-radius:14px;padding:12px 10px;
font-weight:800;font-size:.86rem;color:var(--muted);transition:all .18s;display:flex;flex-direction:column;align-items:center;gap:4px}
.hw-seg button span{font-size:1.35rem}
.hw-seg button:hover{transform:translateY(-2px)}
.hw-seg button.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,var(--sc),color-mix(in srgb,var(--sc) 62%,#000))}
.hw-stamp{position:fixed;z-index:130;pointer-events:none;width:132px;height:132px;border-radius:50%;
border:5px double var(--hok);color:var(--hok);display:flex;flex-direction:column;align-items:center;justify-content:center;
font-family:var(--display);font-size:1.15rem;background:color-mix(in srgb,var(--hok) 9%,#fff);
transform:translate(-50%,-50%) rotate(-16deg) scale(2.4);opacity:0;animation:hwStamp .85s cubic-bezier(.2,.9,.2,1) forwards;text-align:center;line-height:1.35}
[data-theme=dark] .hw-stamp{background:color-mix(in srgb,var(--hok) 16%,#0b1120)}
@keyframes hwStamp{0%{opacity:0;transform:translate(-50%,-50%) rotate(-30deg) scale(2.5)}
28%{opacity:1;transform:translate(-50%,-50%) rotate(-14deg) scale(.94)}
42%{transform:translate(-50%,-50%) rotate(-14deg) scale(1.06)}
72%{opacity:1;transform:translate(-50%,-50%) rotate(-14deg) scale(1)}
100%{opacity:0;transform:translate(-50%,-58%) rotate(-14deg) scale(1.02)}}
.hw-scroll{max-height:62vh;overflow:auto}
.hw-scroll::-webkit-scrollbar{width:11px;height:11px}
.hw-scroll::-webkit-scrollbar-track{background:color-mix(in srgb,var(--rule) 55%,var(--surface2));border-radius:99px}
.hw-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--hinfo),var(--hsun));border-radius:99px;border:3px solid var(--surface2)}
.hw-scroll::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,var(--hsun),var(--hbad))}
.hw-scroll{scrollbar-width:thin;scrollbar-color:var(--hinfo) var(--surface2)}
.hw-mini{display:flex;gap:5px;flex-wrap:wrap}
.hw-mini .m{font-size:.68rem;font-weight:800;padding:2px 7px;border-radius:7px;background:var(--surface2);border:1px solid var(--line)}
.hw-empty{padding:34px 18px}
.hw-stepper{display:inline-flex;align-items:center;gap:0;border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:var(--overlay)}
.hw-stepper button{border:none;background:var(--surface2);width:34px;height:36px;font-size:1.05rem;font-weight:800;color:var(--ink)}
.hw-stepper button:hover{background:color-mix(in srgb,var(--hinfo) 16%,var(--surface))}
.hw-stepper b{min-width:46px;text-align:center;font-family:var(--display);font-size:1.1rem;font-weight:400}
.hw-legend{display:flex;gap:9px;flex-wrap:wrap;font-size:.72rem;font-weight:700;color:var(--muted);align-items:center}
.hw-legend i{width:14px;height:14px;border-radius:5px;display:inline-block;border:1px solid var(--line);vertical-align:-3px;margin-left:4px}
@media (max-width:640px){
.hw-hero{padding:18px 16px}.hw-hero h1{font-size:1.5rem}.hw-hero::after{right:30px}
.hw-grid{grid-template-columns:1fr}.hw-toolbar .input,.hw-toolbar .select{width:100%}
.hw-seg button{min-width:88px;padding:10px 6px;font-size:.78rem}
.hw-row .n{min-width:100%;order:-1}
}`;
const styleEl = document.createElement('style');
styleEl.id = 'hwStyles'; styleEl.textContent = CSS;
document.head.appendChild(styleEl);

/* ================= local state ================= */
const H = {
  tab: 'list', q: '', subject: 'all', phase: 'all', group: 'all', sort: 'due', mode: 'cards',
  sel: new Set(), aid: '', myTab: 'active', draft: null, subDraft: null, imp: null,
  revQ: '', revAid: 'all', proofFor: null
};
const hw = () => (S() && S().homework) || { assignments: [], subs: {}, settings: C.hwSettingsDefault(), savedViews: [], lead: [] };
const now = () => Date.now();
const kindOf = a => HK[a.kind] || HK.written;
const phaseOf = a => HP[hwPhase(a, now())] || HP.upcoming;
const subFor = (aid, sid) => { const h = hw(); return (h.subs[aid] && h.subs[aid][sid]) || null; };
const myLead = () => { const h = hw(); return Array.isArray(h.lead) ? h.lead : leaderGids(S(), SESS.sid); };
const isLeader = () => !isT() && myLead().length > 0;
const canCheck = sid => { const g = groupOf(S(), SESS.sid); return isLeader() && g && (g.members || []).includes(sid) && sid !== SESS.sid; };

function ring(pct, color, size) {
  size = size || 62;
  const r = (size - 9) / 2, c = 2 * Math.PI * r, dash = clamp(pct, 0, 100) / 100 * c;
  return `<div class="hw-ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="7"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"
   stroke-dasharray="${dash.toFixed(1)} ${(c - dash).toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})" style="transition:stroke-dasharray .6s"/></svg><b style="color:${color}">${fa(Math.round(pct))}</b></div>`;
}
function pill(text, color, icon) { return `<span class="hw-pill" style="--pc:${color}">${icon || ''} ${esc(text)}</span>`; }
function cdText(a) {
  const ph = hwPhase(a, now());
  if (ph === 'closed') return 'بسته شده';
  const diff = hwDueTs(a) - now();
  if (diff <= 0) return 'مهلت گذشته';
  return fmtDur(diff);
}
function stamp(text) {
  const el = document.createElement('div');
  el.className = 'hw-stamp'; el.innerHTML = `🎖️<span>${esc(text)}</span>`;
  el.style.left = (innerWidth / 2) + 'px'; el.style.top = (innerHeight / 2) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/* ================= teacher: list ================= */
function filtered() {
  const st = S(), h = hw();
  let list = hwOrdered(st).slice();
  const q = norm(H.q);
  if (q) list = list.filter(a => norm(a.title).includes(q) || norm(a.subject).includes(q) || norm(a.description).includes(q));
  if (H.subject !== 'all') list = list.filter(a => a.subject === H.subject);
  if (H.group !== 'all') list = list.filter(a => (H.group === 'none' ? a.target === 'all' : a.target === H.group));
  if (H.phase !== 'all') list = list.filter(a => (H.phase === 'draft' ? a.status === 'draft' : hwPhase(a, now()) === H.phase));
  const s = {
    due: (a, b) => hwDueTs(a) - hwDueTs(b),
    new: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
    rate: (a, b) => hwAStats(st, a, now()).rate - hwAStats(st, b, now()).rate,
    wait: (a, b) => hwAStats(st, b, now()).waiting - hwAStats(st, a, now()).waiting,
    subject: (a, b) => String(a.subject).localeCompare(String(b.subject), 'fa'),
    order: (a, b) => (a.order || 0) - (b.order || 0)
  };
  return list.sort(s[H.sort] || s.order);
}
function cardHTML(a, i) {
  const st = S(), k = kindOf(a), ph = phaseOf(a), s = hwAStats(st, a, now());
  const g = a.target !== 'all' ? (st.groups || []).find(x => x.id === a.target) : null;
  const sel = H.sel.has(a.id);
  return `<div class="hw-card ${sel ? 'sel' : ''}" style="--kc:${k.c};--i:${i}" data-hwdrag="${a.id}" data-hwdrop="${a.id}">
    <div class="hw-top">
      <input type="checkbox" class="cb" data-chg="hwSel" data-id="${a.id}" ${sel ? 'checked' : ''} title="انتخاب">
      <span class="hw-kind">${k.i}</span>
      <div style="flex:1;min-width:0">
        <div class="hw-title">${esc(a.title)}</div>
        <div class="hw-meta">
          <span class="chip">${esc(a.subject)}</span>
          <span class="chip" style="color:${k.c}">${k.l}</span>
          ${g ? `<span class="chip" style="color:${g.color}">${esc(g.name)}</span>` : ''}
          ${a.status === 'draft' ? pill('پیش‌نویس', '#7b7261', '📝') : pill(ph.l, ph.c, ph.i)}
          ${a.requireProof ? '<span class="chip" style="color:#0ea5e9">📷 عکس</span>' : ''}
        </div>
      </div>
      ${ring(s.rate, s.rate >= 80 ? '#16a34a' : s.rate >= 50 ? '#f59e0b' : '#e11d48')}
    </div>
    <div class="hw-counts">
      <span class="hw-cnt ok">✅ ${fa(s.done)} کامل</span>
      ${s.partial ? `<span class="hw-cnt">🌗 ${fa(s.partial)} ناقص</span>` : ''}
      ${s.cant ? `<span class="hw-cnt bad">❌ ${fa(s.cant)} نتوانست</span>` : ''}
      <span class="hw-cnt">⏳ ${fa(s.missing)} ثبت‌نشده</span>
      ${s.waiting ? `<span class="hw-cnt wait">📥 ${fa(s.waiting)} بررسی</span>` : ''}
      ${s.approved ? `<span class="hw-cnt ok">🎖️ ${fa(s.approved)}</span>` : ''}
      <span class="hw-cnt">👥 ${fa(s.total)}</span>
    </div>
    <div class="hw-foot">
      <span class="hw-cd" style="--pc:${ph.c}">🗓️ ${jShort(a.dueAt)} • ${fa(a.dueTime)} — <b data-hwcd="${a.id}">${cdText(a)}</b></span>
      <div class="row" style="gap:5px;flex-wrap:nowrap">
        <span class="hw-grip" title="کشیدن برای ترتیب">⠿</span>
        <button type="button" class="ib sm" data-act="hwOpen" data-id="${a.id}" title="جزئیات و بررسی">📂</button>
        <button type="button" class="ib sm" data-act="hwEdit" data-id="${a.id}" title="ویرایش">✏️</button>
        <button type="button" class="ib sm" data-act="hwToggle" data-id="${a.id}" title="${a.status === 'closed' ? 'بازکردن' : 'بستن'}">${a.status === 'closed' ? '🔓' : '🔒'}</button>
        <button type="button" class="ib sm" data-act="hwDel" data-id="${a.id}" title="حذف">🗑</button>
      </div>
    </div></div>`;
}
function tableHTML(list) {
  const st = S();
  const rows = list.map((a, i) => {
    const k = kindOf(a), ph = phaseOf(a), s = hwAStats(st, a, now());
    return `<tr>
      <td><input type="checkbox" class="cb" data-chg="hwSel" data-id="${a.id}" ${H.sel.has(a.id) ? 'checked' : ''}></td>
      <td><div class="row" style="gap:8px;flex-wrap:nowrap"><span style="font-size:1.1rem">${k.i}</span>
        <button type="button" class="bold small" style="border:none;background:none;color:var(--ink);text-align:right" data-act="hwOpen" data-id="${a.id}">${esc(a.title)}</button></div></td>
      <td><span class="chip">${esc(a.subject)}</span></td>
      <td class="small mono">${jShort(a.dueAt)} • ${fa(a.dueTime)}</td>
      <td>${pill(ph.l, ph.c, ph.i)}</td>
      <td><div class="progress" style="min-width:70px"><i style="width:${s.rate}%"></i></div></td>
      <td class="small bold" style="color:${s.rate >= 80 ? '#16a34a' : s.rate >= 50 ? '#d97706' : '#e11d48'}">${fa(s.rate)}٪</td>
      <td class="small">${fa(s.done)}/${fa(s.total)}</td>
      <td>${s.waiting ? `<span class="chip acc">📥 ${fa(s.waiting)}</span>` : '<span class="chip">—</span>'}</td>
      <td><div class="row" style="gap:4px;flex-wrap:nowrap">
        <button type="button" class="ib sm" data-act="hwOpen" data-id="${a.id}">📂</button>
        <button type="button" class="ib sm" data-act="hwEdit" data-id="${a.id}">✏️</button>
        <button type="button" class="ib sm" data-act="hwDel" data-id="${a.id}">🗑</button></div></td></tr>`;
  }).join('');
  return `<div class="tw"><table class="tbl"><thead><tr>
    <th><input type="checkbox" class="cb" data-chg="hwSelAll" ${list.length && list.every(a => H.sel.has(a.id)) ? 'checked' : ''}></th>
    <th>تکلیف</th><th>درس</th><th>مهلت</th><th>وضعیت</th><th>پیشرفت</th><th>نرخ</th><th>انجام</th><th>بررسی</th><th>عملیات</th>
  </tr></thead><tbody>${rows}</tbody></table></div>`;
}
function listBody() {
  const st = S(), h = hw(), list = filtered();
  const bulk = H.sel.size ? `<div class="card mb" style="border-color:var(--acc)"><div class="row">
    <b class="small">${fa(H.sel.size)} تکلیف انتخاب شده</b>
    <button type="button" class="btn sm soft" data-act="hwBulkClose">🔒 بستن</button>
    <button type="button" class="btn sm soft" data-act="hwBulkOpen">🔓 بازکردن</button>
    <button type="button" class="btn sm danger" data-act="hwBulkDel">🗑 حذف</button>
    <button type="button" class="btn sm ghost" data-act="hwSelClear">✕ لغو</button></div></div>` : '';
  if (!list.length) return bulk + `<div class="card hw-empty">${empty('📚', 'تکلیفی با این فیلتر نیست', 'فیلتر را عوض کن یا تکلیف تازه بساز.', '<button type="button" class="btn" data-act="hwNew">➕ تکلیف جدید</button>')}</div>`;
  return bulk + (H.mode === 'table' ? tableHTML(list) : `<div class="hw-grid stagger">${list.map((a, i) => cardHTML(a, i)).join('')}</div>`);
}
function toolbar() {
  const st = S(), h = hw();
  return `<div class="card mb"><div class="hw-toolbar">
    <input class="input" style="max-width:220px" placeholder="🔍 جستجوی تکلیف…" value="${esc(H.q)}" data-inp="hwQ">
    <select class="select" style="max-width:160px" data-chg="hwSubject"><option value="all">همهٔ درس‌ها</option>${(st.subjects || []).map(s => `<option value="${esc(s)}" ${H.subject === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
    <select class="select" style="max-width:150px" data-chg="hwPhase">${[['all', 'همهٔ وضعیت‌ها'], ['overdue', '🔥 عقب‌افتاده'], ['today', '⏰ امروز'], ['upcoming', '🗓️ پیش رو'], ['closed', '🔒 بسته'], ['draft', '📝 پیش‌نویس']].map(([v, l]) => `<option value="${v}" ${H.phase === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <select class="select" style="max-width:150px" data-chg="hwGroup"><option value="all">همهٔ مخاطب‌ها</option><option value="none" ${H.group === 'none' ? 'selected' : ''}>کل کلاس</option>${(st.groups || []).map(g => `<option value="${g.id}" ${H.group === g.id ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select>
    <select class="select" style="max-width:160px" data-chg="hwSort">${[['order', 'ترتیب دستی'], ['due', 'نزدیک‌ترین مهلت'], ['new', 'تازه‌ترین'], ['rate', 'بیشترین انجام'], ['wait', 'بیشترین بررسی'], ['subject', 'بر اساس درس']].map(([v, l]) => `<option value="${v}" ${H.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <div class="seg"><button type="button" class="${H.mode === 'cards' ? 'on' : ''}" data-act="hwMode" data-v="cards">🗂 کارت</button><button type="button" class="${H.mode === 'table' ? 'on' : ''}" data-act="hwMode" data-v="table">📋 جدول</button></div>
    <select class="select" style="max-width:170px" data-chg="hwViewApply"><option value="">📁 نماهای ذخیره‌شده…</option>${(h.savedViews || []).map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('')}</select>
    <button type="button" class="btn sm ghost" data-act="hwViewSave">💾 ذخیرهٔ نما</button>
  </div></div>`;
}

/* ================= teacher: review inbox ================= */
function inboxBody() {
  const st = S(), cls = hwClass(st, now());
  let items = cls.inbox;
  if (H.revAid !== 'all') items = items.filter(x => x.a.id === H.revAid);
  const q = norm(H.revQ);
  if (q) items = items.filter(x => norm(x.stu.name).includes(q) || norm(x.a.title).includes(q));
  const head = `<div class="card mb"><div class="hw-toolbar">
    <input class="input" style="max-width:220px" placeholder="🔍 نام دانش‌آموز یا تکلیف…" value="${esc(H.revQ)}" data-inp="hwRevQ">
    <select class="select" style="max-width:250px" data-chg="hwRevAid"><option value="all">همهٔ تکلیف‌ها</option>${cls.list.map(a => `<option value="${a.id}" ${H.revAid === a.id ? 'selected' : ''}>${esc(a.title)}</option>`).join('')}</select>
    <span class="chip acc">📥 ${fa(items.length)} مورد</span>
    ${items.length ? `<button type="button" class="btn ok sm" data-act="hwApproveAll">🎖️ تأیید همهٔ ${fa(items.length)} مورد</button>` : ''}
  </div></div>`;
  if (!items.length) return head + `<div class="card hw-empty">${empty('🕊️', 'صندوق بررسی خالی است', 'هرچه دانش‌آموزان ثبت کنند اینجا می‌آید.')}</div>`;
  const rows = items.map((x, i) => {
    const s = HS[x.sub.status] || HS.done, rk = HR[x.rk] || HR.waiting, k = kindOf(x.a);
    return `<div class="hw-row" style="--i:${i}">
      ${avHTML(x.stu, 'sm')}
      <div class="n"><b>${esc(x.stu.name)}</b>
        <div class="small muted">${k.i} ${esc(x.a.title)} • ${jShort(C.iranISO(new Date(x.sub.at)))}${x.sub.late ? ' • <span style="color:#e11d48">دیرکرد</span>' : ''}</div>
        ${x.sub.note ? `<div class="hw-note">💬 ${esc(x.sub.note)}</div>` : ''}
        ${x.sub.leaderCheck ? `<div class="small muted mt" style="margin-top:5px">🏅 سرگروه ${esc(stuById(st, x.sub.leaderCheck.by) ? stuById(st, x.sub.leaderCheck.by).name : '')}: ${esc(x.sub.leaderCheck.note || (x.sub.leaderCheck.verdict === 'approved' ? 'تأیید کرد' : 'اصلاح خواست'))}</div>` : ''}
      </div>
      ${x.sub.proof ? `<img class="hw-thumb" src="${x.sub.proof}" alt="عکس تکلیف" data-act="hwProof" data-aid="${x.a.id}" data-sid="${x.stu.id}">` : ''}
      ${pill(s.l, s.c, s.i)} ${pill(rk.l, rk.c, rk.i)}
      <div class="row" style="gap:5px;flex-wrap:nowrap">
        <button type="button" class="btn ok sm" data-act="hwApprove" data-aid="${x.a.id}" data-sid="${x.stu.id}">🎖️ تأیید</button>
        <button type="button" class="btn warn sm" data-act="hwRedo" data-aid="${x.a.id}" data-sid="${x.stu.id}">🔁 بازنویسی</button>
      </div></div>`;
  }).join('');
  return head + `<div class="card" style="padding:5px 0"><div class="hw-scroll">${rows}</div></div>`;
}

/* ================= teacher: analysis ================= */
function analysisBody() {
  const st = S(), cls = hwClass(st, now());
  const list = cls.list.slice(0, 8);
  const cols = list.length;
  const heat = cols ? `<div class="hw-heat" style="grid-template-columns:132px repeat(${cols},minmax(20px,1fr)) 52px">
    <span class="hh" style="text-align:right">دانش‌آموز</span>
    ${list.map(a => `<span class="hh" title="${esc(a.title)}">${kindOf(a).i}</span>`).join('')}<span class="hh">نرخ</span>
    ${(st.students || []).map(s => {
      const ms = hwStats(st, s.id, now());
      const cells = list.map(a => {
        const sub = subFor(a.id, s.id);
        let lvl = 0, txt = '·', title = 'ثبت نشده';
        if (sub) {
          const rk = hwReviewKey(sub);
          lvl = sub.status === 'done' ? (rk === 'approved' ? 4 : 3) : sub.status === 'partial' ? 2 : 1;
          txt = (HS[sub.status] || HS.done).short; title = (HS[sub.status] || HS.done).l + ' — ' + (HR[rk] || HR.waiting).l;
        }
        return `<span class="hc hw-l${lvl}" title="${esc(s.name)} • ${esc(a.title)}: ${esc(title)}">${txt}</span>`;
      }).join('');
      return `<span class="hn" title="${esc(s.name)}">${esc(s.name)}</span>${cells}<span class="hh" style="color:${ms.rate >= 80 ? '#16a34a' : ms.rate >= 50 ? '#d97706' : '#e11d48'}">${fa(ms.rate)}٪</span>`;
    }).join('')}</div>` : '';
  return `<div class="grid g4 stagger mb">
    <div class="card stat" style="--i:0"><span class="si" style="background:linear-gradient(135deg,#1d4ed8,#0ea5e9)">📚</span><div><b>${fa(cls.activeCount)}</b><span>تکلیف فعال</span></div></div>
    <div class="card stat" style="--i:1"><span class="si" style="background:linear-gradient(135deg,#16a34a,#65a30d)">✅</span><div><b>${fa(cls.rate)}٪</b><span>نرخ انجام کلاس</span></div></div>
    <div class="card stat" style="--i:2"><span class="si" style="background:linear-gradient(135deg,#f59e0b,#f97316)">📥</span><div><b>${fa(cls.waiting)}</b><span>در انتظار بررسی</span></div></div>
    <div class="card stat" style="--i:3"><span class="si" style="background:linear-gradient(135deg,#e11d48,#7c3aed)">🔥</span><div><b>${fa(cls.overdue)}</b><span>تکلیف عقب‌افتاده</span></div></div>
  </div>
  <div class="grid g2 mb">
    <div class="card"><div class="spread mb"><h3>📊 نرخ انجام هر درس</h3><span class="chip">۰ تا ۱۰۰٪</span></div>
      ${bars(cls.subjects.map((x, i) => ({ label: x.sub, value: x.rate, color: C.CPAL[i % 8] })), { fmt: v => fa(Math.round(v)) + '٪' })}</div>
    <div class="card"><div class="spread mb"><h3>📈 روند انجام روزانه</h3><span class="chip">${fa(cls.trend.length)} روز</span></div>
      ${lineChart(cls.trend, cls.trendLabels)}</div>
  </div>
  <div class="card mb"><div class="spread mb"><h3>🔥 نقشهٔ حرارتی تکالیف</h3>
    <div class="hw-legend"><span><i class="hw-l0"></i>ثبت‌نشده</span><span><i class="hw-l1"></i>نتوانست</span><span><i class="hw-l2"></i>ناقص</span><span><i class="hw-l3"></i>انجام</span><span><i class="hw-l4"></i>تأیید</span></div></div>
    ${cols ? heat : empty('📚', 'تکلیفی نیست', 'اولین تکلیف را بساز.')}</div>
  <div class="grid g2">
    <div class="card"><h3 class="mb">🚨 نیازمند پیگیری</h3>
      ${cls.atRisk.length ? cls.atRisk.slice(0, 8).map(s => `<div class="hw-row" style="padding:8px 0">${avHTML(s, 'sm')}
        <span class="n">${esc(s.name)}</span>
        <span class="chip" style="color:#e11d48">🔥 ${fa(s.overdue)} عقب‌افتاده</span>
        <span class="badge" style="background:${tint('#e11d48', .12)};color:#e11d48">${fa(s.rate)}٪</span>
        <button type="button" class="ib sm" data-act="hwStuSheet" data-id="${s.id}" title="کارنامهٔ تکلیف">🖨️</button></div>`).join('') : empty('🌿', 'همه در مسیرند', 'هیچ دانش‌آموزی عقب نمانده است.')}
    </div>
    <div class="card"><h3 class="mb">🏆 منظم‌ترین‌ها</h3>
      ${cls.top.length ? cls.top.map((s, i) => `<div class="hw-row" style="padding:8px 0"><span style="width:22px">${['🥇', '🥈', '🥉', '🏅', '🏅', '🏅'][i]}</span>${avHTML(s, 'sm')}
        <span class="n">${esc(s.name)}</span><span class="chip">🎖️ ${fa(s.pts)} امتیاز</span>
        <span class="badge" style="background:${tint('#16a34a', .12)};color:#16a34a">${fa(s.rate)}٪</span></div>`).join('') : empty('🌱', 'داده‌ای نیست', '')}
    </div>
  </div>`;
}

/* ================= teacher: settings ================= */
function settingsBody() {
  const s = hw().settings || C.hwSettingsDefault();
  return `<div class="grid g2" style="align-items:start">
    <div class="card"><h3 class="mb">⚙️ قواعد تکلیف</h3>
      <div class="srow"><div><span class="sl">🏅 بررسی توسط سرگروه</span><span class="ss">سرگروه پیش از معلم، تکلیف اعضای گروهش را می‌بیند و امتیاز مدیریتی می‌گیرد</span></div>
        <span class="switch"><input type="checkbox" ${s.leaderApproval ? 'checked' : ''} data-chg="hwSet" data-k="leaderApproval"><i></i></span></div>
      <div class="srow"><div><span class="sl">⏰ اجازهٔ ثبت پس از مهلت</span><span class="ss">تکلیف دیرکرد پذیرفته می‌شود ولی کسر امتیاز دارد</span></div>
        <span class="switch"><input type="checkbox" ${s.allowLate ? 'checked' : ''} data-chg="hwSet" data-k="allowLate"><i></i></span></div>
      <div class="srow"><div><span class="sl">🔔 یادآور مهلت امروز</span><span class="ss">در پنل دانش‌آموز برجسته شود</span></div>
        <span class="switch"><input type="checkbox" ${s.remind ? 'checked' : ''} data-chg="hwSet" data-k="remind"><i></i></span></div>
      <div class="srow"><div><span class="sl">📷 عکس پیش‌فرض</span><span class="ss">تکلیف‌های تازه به‌صورت پیش‌فرض عکس بخواهند</span></div>
        <span class="switch"><input type="checkbox" ${s.proof ? 'checked' : ''} data-chg="hwSet" data-k="proof"><i></i></span></div>
      <div class="srow"><div><span class="sl">➖ کسر امتیاز دیرکرد</span><span class="ss" id="hwPenVal">${fa(s.latePenalty)}٪</span></div>
        <input type="range" min="0" max="90" step="5" value="${s.latePenalty}" data-inp="hwPen" style="max-width:170px"></div>
    </div>
    <div class="card"><h3 class="mb">🔄 داده و خروجی</h3>
      <div class="row mb"><button type="button" class="btn soft" data-act="hwCsv" data-kind="assignments">📤 CSV تکالیف</button>
        <button type="button" class="btn soft" data-act="hwCsv" data-kind="subs">📤 CSV ثبت‌ها</button>
        <button type="button" class="btn soft" data-act="hwCsv" data-kind="analysis">📤 CSV تحلیل</button></div>
      <div class="row mb"><button type="button" class="btn ghost" data-act="hwImport">📥 ورود CSV</button>
        <button type="button" class="btn ghost" data-act="hwTpl" data-kind="assignments">📄 نمونهٔ تکالیف</button>
        <button type="button" class="btn ghost" data-act="hwTpl" data-kind="subs">📄 نمونهٔ ثبت‌ها</button></div>
      <div class="divider"></div>
      <div class="row"><button type="button" class="btn soft" data-act="hwClassSheet">🖨️ برگهٔ پیگیری کلاس (A4)</button></div>
      <p class="small muted mt">امتیاز هر تکلیف پس از تأیید نهایی، به امتیاز انضباطی دانش‌آموز اضافه می‌شود و در کارنامه و تحلیل هوشمند دیده می‌شود.</p>
    </div></div>`;
}

/* ================= teacher view ================= */
function teacherView() {
  const st = S(), cls = hwClass(st, now()), h = hw();
  const tabs = [['list', '📚 تکلیف‌ها', cls.list.length], ['inbox', '📥 صندوق بررسی', cls.waiting], ['analysis', '📊 تحلیل', 0], ['settings', '⚙️ قواعد', 0]];
  return `<div class="hw">
    <div class="hw-hero"><span class="hw-tape"></span>
      <div class="spread"><div>
        <h1>📚 دفتر تکالیف کلاس</h1>
        <p>تکلیف بده، دانش‌آموز ثبت می‌کند، سرگروه بررسی می‌کند، تو تأیید نهایی می‌دهی و امتیاز خودش می‌نشیند.</p>
        <div class="hw-quick">
          <span class="q">📚 <b>${fa(cls.activeCount)}</b> فعال</span>
          <span class="q">✅ <b>${fa(cls.rate)}٪</b> انجام کلاس</span>
          <span class="q">📥 <b>${fa(cls.waiting)}</b> در انتظار تو</span>
          <span class="q">🎖️ <b>${fa(cls.pts)}</b> امتیاز داده‌شده</span>
          <span class="q">🔥 <b>${fa(cls.overdue)}</b> عقب‌افتاده</span>
        </div></div>
        <div class="row"><button type="button" class="btn" data-act="hwNew">➕ تکلیف جدید</button>
          <button type="button" class="btn soft" data-act="hwClassSheet">🖨️ برگهٔ A4</button></div>
      </div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${H.tab === k ? 'on' : ''}" data-act="hwTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="hwBody">${H.tab === 'list' ? toolbar() + '<div id="hwList">' + listBody() + '</div>' : H.tab === 'inbox' ? inboxBody() : H.tab === 'analysis' ? analysisBody() : settingsBody()}</div>
  </div>`;
}

/* ================= student view ================= */
function myList() {
  const st = S(), h = hw(), sid = SESS.sid;
  let list = (h.assignments || []).slice();
  const t = H.myTab;
  list = list.filter(a => {
    const sub = subFor(a.id, sid), ph = hwPhase(a, now()), rk = hwReviewKey(sub);
    if (t === 'active') return a.status === 'published' && (!sub || rk === 'redo');
    if (t === 'overdue') return ph === 'overdue' && (!sub || rk === 'redo');
    if (t === 'today') return ph === 'today';
    if (t === 'done') return !!sub && rk !== 'redo';
    if (t === 'approved') return rk === 'approved';
    return true;
  });
  return list.sort((a, b) => hwDueTs(a) - hwDueTs(b));
}
function myCard(a, i) {
  const st = S(), sid = SESS.sid, k = kindOf(a), ph = phaseOf(a);
  const sub = subFor(a.id, sid), rk = hwReviewKey(sub), rv = HR[rk] || HR.none;
  const s = sub ? (HS[sub.status] || HS.done) : null;
  const g = a.target !== 'all' ? (st.groups || []).find(x => x.id === a.target) : null;
  const locked = sub && sub.teacherReview && sub.teacherReview.verdict === 'approved';
  return `<div class="hw-card" style="--kc:${k.c};--i:${i}">
    <div class="hw-top"><span class="hw-kind">${k.i}</span>
      <div style="flex:1;min-width:0"><div class="hw-title">${esc(a.title)}</div>
        <div class="hw-meta"><span class="chip">${esc(a.subject)}</span><span class="chip" style="color:${k.c}">${k.l}</span>
          ${g ? `<span class="chip" style="color:${g.color}">${esc(g.name)}</span>` : ''}
          ${pill(ph.l, ph.c, ph.i)}<span class="chip">🎖️ ${fa(a.points)} امتیاز</span>
          ${a.requireProof ? '<span class="chip" style="color:#0ea5e9">📷 عکس لازم</span>' : ''}</div></div>
      ${sub ? pill(s.l, s.c, s.i) : pill('ثبت نشده', '#7b7261', '⏳')}</div>
    ${a.description ? `<div class="hw-note">📝 ${esc(a.description)}</div>` : ''}
    ${sub ? `<div class="row mt" style="gap:6px;margin-top:8px">${pill(rv.l, rv.c, rv.i)}${sub.late ? pill('دیرکرد', '#e11d48', '⏰') : ''}${sub.points ? `<span class="chip" style="color:#16a34a">🎖️ +${fa(sub.points)}</span>` : ''}
      ${sub.proof ? `<img class="hw-thumb" src="${sub.proof}" alt="عکس تکلیف من" data-act="hwProof" data-aid="${a.id}" data-sid="${sid}">` : ''}</div>` : ''}
    ${sub && sub.note ? `<div class="hw-note">💬 ${esc(sub.note)}</div>` : ''}
    ${sub && sub.leaderCheck ? `<div class="hw-note">🏅 سرگروه: ${esc(sub.leaderCheck.note || (sub.leaderCheck.verdict === 'approved' ? 'تأیید کرد' : 'اصلاح خواست'))}</div>` : ''}
    ${sub && sub.teacherReview && sub.teacherReview.note ? `<div class="hw-note">👨‍🏫 معلم: ${esc(sub.teacherReview.note)}</div>` : ''}
    <div class="hw-foot">
      <span class="hw-cd" style="--pc:${ph.c}">🗓️ ${jShort(a.dueAt)} • ${fa(a.dueTime)} — <b data-hwcd="${a.id}">${cdText(a)}</b></span>
      <div class="row" style="gap:5px;flex-wrap:nowrap">
        ${locked ? '<span class="chip" style="color:#16a34a">🔒 تأیید نهایی</span>' : `<button type="button" class="btn ${sub ? 'soft' : ''} sm" data-act="hwSubmit" data-id="${a.id}">${sub ? '✏️ ویرایش ثبت' : '📤 ثبت تکلیف'}</button>`}
        ${sub && !sub.teacherReview ? `<button type="button" class="ib sm" data-act="hwWithdraw" data-id="${a.id}" title="حذف ثبت">🗑</button>` : ''}
      </div></div></div>`;
}
function leaderBody() {
  const st = S(), h = hw(), sid = SESS.sid, g = groupOf(st, sid);
  if (!g) return `<div class="card hw-empty">${empty('🧩', 'گروهی نداری', '')}</div>`;
  const members = (g.members || []).filter(m => m !== sid).map(m => stuById(st, m)).filter(Boolean);
  const list = (h.assignments || []).filter(a => a.status === 'published');
  if (!list.length) return `<div class="card hw-empty">${empty('📚', 'تکلیف فعالی نیست', '')}</div>`;
  return `<div class="card mb"><div class="row"><span class="av" style="background:${g.color}">🏅</span>
    <div><b>سرگروه ${esc(g.name)}</b><div class="small muted">تکلیف اعضا را ببین و تأیید کن؛ هر بررسی +۱ امتیاز مدیریتی</div></div>
    <span class="chip acc">🏅 ${fa(leaderPts(st, sid))} امتیاز مدیریتی</span></div></div>
  ${list.map(a => {
    const k = kindOf(a);
    return `<div class="card mb" style="border-right:5px solid ${k.c}">
      <div class="spread mb"><b class="small">${k.i} ${esc(a.title)}</b><span class="chip">${jShort(a.dueAt)}</span></div>
      ${members.map(m => {
        const sub = subFor(a.id, m.id), rk = hwReviewKey(sub), rv = HR[rk] || HR.none;
        const checked = sub && sub.leaderCheck && sub.leaderCheck.by === sid;
        const locked = sub && sub.teacherReview;
        return `<div class="hw-row">${avHTML(m, 'sm')}<div class="n">${esc(m.name)}
          ${sub && sub.note ? `<div class="small muted">💬 ${esc(sub.note)}</div>` : ''}</div>
          ${sub && sub.proof ? `<img class="hw-thumb" src="${sub.proof}" alt="" data-act="hwProof" data-aid="${a.id}" data-sid="${m.id}">` : ''}
          ${sub ? pill((HS[sub.status] || HS.done).l, (HS[sub.status] || HS.done).c, (HS[sub.status] || HS.done).i) : pill('ثبت نشده', '#7b7261', '⏳')}
          ${sub ? pill(rv.l, rv.c, rv.i) : ''}
          ${!sub ? '<span class="chip">—</span>' : locked ? '<span class="chip">👨‍🏫 بررسی شده</span>' : checked ? '<span class="chip" style="color:#65a30d">✅ نظر تو ثبت شد</span>' : `<div class="row" style="gap:4px;flex-wrap:nowrap">
            <button type="button" class="btn ok sm" data-act="hwLeadOk" data-aid="${a.id}" data-sid="${m.id}">🏅 تأیید</button>
            <button type="button" class="btn warn sm" data-act="hwLeadFix" data-aid="${a.id}" data-sid="${m.id}">↩️ اصلاح</button></div>`}
        </div>`;
      }).join('')}</div>`;
  }).join('')}`;
}
function studentView() {
  const st = S(), sid = SESS.sid, ms = hwStats(st, sid, now()), h = hw();
  const tabs = [['active', '📌 انجام‌نشده', ms.pending], ['overdue', '🔥 عقب‌افتاده', ms.overdue], ['today', '⏰ امروز', ms.today], ['done', '✅ ثبت‌شده', ms.submitted], ['approved', '🎖️ تأییدشده', ms.approved], ['all', 'همه', ms.total]];
  const list = myList();
  const body = H.myTab === 'leader' ? leaderBody()
    : (list.length ? `<div class="hw-grid stagger">${list.map((a, i) => myCard(a, i)).join('')}</div>`
      : `<div class="card hw-empty">${empty('🌿', 'اینجا خالی است', H.myTab === 'active' ? 'همهٔ تکلیف‌هایت را ثبت کرده‌ای. آفرین!' : 'موردی با این فیلتر نیست.')}</div>`);
  return `<div class="hw">
    <div class="hw-hero"><span class="hw-tape"></span>
      <div class="spread"><div><h1>📚 تکالیف من</h1>
        <p>${ms.overdue ? `${fa(ms.overdue)} تکلیف عقب‌افتاده داری — اول آن‌ها را کامل کن.` : ms.pending ? `${fa(ms.pending)} تکلیف در انتظار توست.` : 'همهٔ تکلیف‌هایت ثبت شده. عالی! 🎉'}</p>
        <div class="hw-quick">
          <span class="q">📚 <b>${fa(ms.total)}</b> تکلیف</span>
          <span class="q">✅ <b>${fa(ms.done)}</b> کامل</span>
          <span class="q">🎖️ <b>${fa(ms.pts)}</b> امتیاز</span>
          <span class="q">🔥 <b>${fa(ms.overdue)}</b> عقب‌افتاده</span>
          ${isLeader() ? `<span class="q">🏅 <b>${fa(leaderPts(st, sid))}</b> مدیریتی</span>` : ''}
        </div></div>
        ${ring(ms.rate, ms.rate >= 80 ? '#16a34a' : ms.rate >= 50 ? '#f59e0b' : '#e11d48', 96)}
      </div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${H.myTab === k ? 'on' : ''}" data-act="hwMyTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}
      ${isLeader() ? `<button type="button" class="${H.myTab === 'leader' ? 'on' : ''}" data-act="hwMyTab" data-tab="leader">🏅 گروه من</button>` : ''}</div>
    <div id="hwBody">${body}</div></div>`;
}

/* ================= drawers ================= */
function formHTML(a) {
  const st = S(), s = hw().settings || C.hwSettingsDefault();
  const d = H.draft = a ? clone(a) : {
    id: '', title: '', subject: (st.subjects || [])[0] || '', kind: 'written', description: '',
    assignedAt: todayISO(), dueAt: todayISO(), dueTime: '20:00', points: 3, target: 'all',
    requireProof: !!s.proof, allowLate: s.allowLate !== false, status: 'published'
  };
  UI.jdate.hwdue = d.dueAt; UI.jdate.hwassign = d.assignedAt;
  const tm = String(d.dueTime || '20:00').split(':');
  return `<form data-form="hwForm">
    <div class="field"><label class="lbl">عنوان تکلیف</label><input class="input" name="title" required value="${esc(d.title)}" placeholder="مثلاً: تمرین کسرهای مساوی — صفحهٔ ۳۴"></div>
    <div class="grid g2">
      <div class="field"><label class="lbl">درس</label><select class="select" data-chg="hwF" data-f="subject">${(st.subjects || []).map(x => `<option value="${esc(x)}" ${d.subject === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
      <div class="field"><label class="lbl">نوع تکلیف</label><select class="select" data-chg="hwF" data-f="kind">${Object.entries(HK).map(([k, v]) => `<option value="${k}" ${d.kind === k ? 'selected' : ''}>${v.i} ${v.l}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label class="lbl">توضیح برای دانش‌آموز</label><textarea class="input" name="description" rows="3" placeholder="دقیقاً چه کاری، چند سؤال، از کدام صفحه…">${esc(d.description)}</textarea></div>
    <div class="card mb" style="padding:13px;background:var(--surface2)">
      <h3 class="mb">🗓️ مهلت تحویل (شمسی)</h3>
      <div class="field">${jDateSelects('hwdue')}</div>
      <div class="field"><label class="lbl">ساعت</label><div class="row" style="gap:6px">
        <select class="select" data-chg="hwFTime" data-p="H" style="flex:1">${Array.from({ length: 24 }, (_, i) => `<option value="${fa(i)}" ${Number(tm[0]) === i ? 'selected' : ''}>${fa(pad(i))}</option>`).join('')}</select>
        <span class="bold">:</span>
        <select class="select" data-chg="hwFTime" data-p="M" style="flex:1">${[0, 10, 15, 20, 30, 40, 45, 50, 59].map(i => `<option value="${fa(i)}" ${Number(tm[1]) === i ? 'selected' : ''}>${fa(pad(i))}</option>`).join('')}</select>
      </div></div>
      <div class="field" style="margin-bottom:0"><label class="lbl">تاریخ دادن تکلیف</label>${jDateSelects('hwassign')}</div>
    </div>
    <div class="grid g2">
      <div class="field"><label class="lbl">امتیاز تکلیف</label><div class="hw-stepper">
        <button type="button" data-act="hwPts" data-d="-1">−</button><b id="hwPtsVal">${fa(d.points)}</b><button type="button" data-act="hwPts" data-d="1">+</button></div></div>
      <div class="field"><label class="lbl">برای چه کسانی</label><select class="select" data-chg="hwF" data-f="target">
        <option value="all" ${d.target === 'all' ? 'selected' : ''}>👥 کل کلاس</option>
        ${(st.groups || []).map(g => `<option value="${g.id}" ${d.target === g.id ? 'selected' : ''}>🧩 ${esc(g.name)}</option>`).join('')}</select></div>
    </div>
    <div class="srow"><div><span class="sl">📷 عکس دفتر لازم است</span><span class="ss">دانش‌آموز برای «انجام دادم» باید عکس بفرستد</span></div>
      <span class="switch"><input type="checkbox" ${d.requireProof ? 'checked' : ''} data-chg="hwFB" data-f="requireProof"><i></i></span></div>
    <div class="srow"><div><span class="sl">⏰ ثبت پس از مهلت مجاز</span><span class="ss">با کسر امتیاز دیرکرد</span></div>
      <span class="switch"><input type="checkbox" ${d.allowLate ? 'checked' : ''} data-chg="hwFB" data-f="allowLate"><i></i></span></div>
    <div class="field mt"><label class="lbl">وضعیت انتشار</label><div class="seg">
      ${[['published', '📢 منتشر شود'], ['draft', '📝 پیش‌نویس'], ['closed', '🔒 بسته']].map(([v, l]) => `<button type="button" class="${d.status === v ? 'on' : ''}" data-act="hwFStatus" data-v="${v}">${l}</button>`).join('')}</div></div>
    <button class="btn mt" type="submit" style="width:100%">💾 ${a ? 'ذخیرهٔ ویرایش' : 'ساخت و ارسال به کلاس'}</button></form>`;
}
function detailHTML(a) {
  const st = S(), s = hwAStats(st, a, now()), k = kindOf(a), ph = phaseOf(a);
  const aud = hwAudience(st, a);
  const rows = aud.map(m => {
    const sub = subFor(a.id, m.id), rk = hwReviewKey(sub), rv = HR[rk] || HR.none;
    const ss = sub ? (HS[sub.status] || HS.done) : null;
    const g = groupOf(st, m.id), leader = g ? stuById(st, g.leader) : null;
    return `<div class="hw-row">${avHTML(m, 'sm')}
      <div class="n">${esc(m.name)}${leader && leader.id !== m.id ? `<div class="small muted">🏅 ${esc(leader.name)}</div>` : ''}
        ${sub && sub.note ? `<div class="hw-note">💬 ${esc(sub.note)}</div>` : ''}
        ${sub && sub.leaderCheck ? `<div class="small muted" style="margin-top:4px">🏅 ${esc(stuById(st, sub.leaderCheck.by) ? stuById(st, sub.leaderCheck.by).name : '')}: ${esc(sub.leaderCheck.note || rv.l)}</div>` : ''}
        ${sub && sub.teacherReview && sub.teacherReview.note ? `<div class="small muted" style="margin-top:4px">👨‍🏫 ${esc(sub.teacherReview.note)}</div>` : ''}</div>
      ${sub && sub.proof ? `<img class="hw-thumb" src="${sub.proof}" alt="" data-act="hwProof" data-aid="${a.id}" data-sid="${m.id}">` : ''}
      ${sub ? pill(ss.l, ss.c, ss.i) : pill('ثبت نشده', '#7b7261', '⏳')}
      ${sub ? pill(rv.l, rv.c, rv.i) : ''}
      ${sub && sub.late ? pill('دیرکرد', '#e11d48', '⏰') : ''}
      ${sub && sub.points ? `<span class="chip" style="color:#16a34a">🎖️ ${fa(sub.points)}</span>` : ''}
      ${sub ? `<div class="row" style="gap:4px;flex-wrap:nowrap">
        <button type="button" class="btn ok sm" data-act="hwApprove" data-aid="${a.id}" data-sid="${m.id}">🎖️</button>
        <button type="button" class="btn warn sm" data-act="hwRedo" data-aid="${a.id}" data-sid="${m.id}">🔁</button></div>` : '<span class="chip">—</span>'}
    </div>`;
  }).join('');
  return `<div class="hw">
    <div class="row mb" style="gap:12px"><span class="hw-kind" style="--kc:${k.c}">${k.i}</span>
      <div style="flex:1"><b style="font-size:1.05rem">${esc(a.title)}</b>
        <div class="hw-meta"><span class="chip">${esc(a.subject)}</span><span class="chip" style="color:${k.c}">${k.l}</span>${pill(ph.l, ph.c, ph.i)}<span class="chip">🎖️ ${fa(a.points)} امتیاز</span></div></div>
      ${ring(s.rate, s.rate >= 80 ? '#16a34a' : s.rate >= 50 ? '#f59e0b' : '#e11d48', 72)}</div>
    ${a.description ? `<div class="hw-note mb">📝 ${esc(a.description)}</div>` : ''}
    <div class="hw-counts mb"><span class="hw-cnt ok">✅ ${fa(s.done)}</span><span class="hw-cnt">🌗 ${fa(s.partial)}</span>
      <span class="hw-cnt bad">❌ ${fa(s.cant)}</span><span class="hw-cnt">⏳ ${fa(s.missing)}</span>
      <span class="hw-cnt wait">📥 ${fa(s.waiting)}</span><span class="hw-cnt ok">🎖️ ${fa(s.approved)}</span><span class="hw-cnt">👥 ${fa(s.total)}</span></div>
    <div class="row mb"><button type="button" class="btn sm" data-act="hwEdit" data-id="${a.id}">✏️ ویرایش</button>
      ${s.waiting ? `<button type="button" class="btn ok sm" data-act="hwApproveAid" data-id="${a.id}">🎖️ تأیید همهٔ ${fa(s.waiting)} مورد</button>` : ''}
      <button type="button" class="btn soft sm" data-act="hwCsvOne" data-id="${a.id}">📤 CSV</button>
      <button type="button" class="btn soft sm" data-act="hwOneSheet" data-id="${a.id}">🖨️ برگهٔ A4</button>
      <button type="button" class="btn ghost sm" data-act="hwToggle" data-id="${a.id}">${a.status === 'closed' ? '🔓 بازکردن' : '🔒 بستن'}</button></div>
    <div class="card" style="padding:5px 0"><div class="hw-scroll">${rows || empty('👥', 'مخاطبی نیست', '')}</div></div></div>`;
}
function submitHTML(a) {
  const sid = SESS.sid, prev = subFor(a.id, sid), k = kindOf(a), ph = phaseOf(a);
  const d = H.subDraft = { aid: a.id, status: prev ? prev.status : 'done', note: prev ? prev.note : '', proof: prev ? prev.proof : null };
  const late = hwPhase(a, now()) === 'overdue';
  return `<div class="hw"><form data-form="hwSubmit">
    <div class="row mb" style="gap:11px"><span class="hw-kind" style="--kc:${k.c}">${k.i}</span>
      <div style="flex:1"><b>${esc(a.title)}</b><div class="hw-meta"><span class="chip">${esc(a.subject)}</span>${pill(ph.l, ph.c, ph.i)}<span class="chip">🎖️ ${fa(a.points)} امتیاز</span></div></div></div>
    ${a.description ? `<div class="hw-note mb">📝 ${esc(a.description)}</div>` : ''}
    ${late ? `<div class="ins warn mb"><span class="ii">⏰</span><span>مهلت گذشته است؛ ثبت تو با کسر امتیاز دیرکرد پذیرفته می‌شود.</span></div>` : ''}
    <div class="field"><label class="lbl">وضعیت تکلیف من</label><div class="hw-seg">
      ${Object.entries(HS).map(([key, v]) => `<button type="button" class="${d.status === key ? 'on' : ''}" style="--sc:${v.c}" data-act="hwSubStatus" data-v="${key}"><span>${v.i}</span>${v.l}</button>`).join('')}</div></div>
    <div class="field"><label class="lbl">یادداشت برای معلم (اختیاری)</label>
      <textarea class="input" name="note" rows="3" placeholder="کدام قسمت سخت بود؟ چه کمکی می‌خواهی؟">${esc(d.note)}</textarea></div>
    <div class="field"><label class="lbl">عکس دفتر ${a.requireProof ? '(لازم)' : '(اختیاری)'}</label>
      <div id="hwProofBox">${d.proof ? `<div class="row"><img class="hw-thumb" style="width:88px;height:88px" src="${d.proof}" alt=""><button type="button" class="btn ghost sm" data-act="hwProofDel">🗑 حذف عکس</button></div>`
        : `<label class="hw-drop" style="display:block;cursor:pointer"><div style="font-size:1.9rem">📷</div><div class="small bold">برای انتخاب عکس دفتر بزن</div><div class="small muted">خودکار کوچک می‌شود</div><input type="file" accept="image/*" class="hidden" data-chg="hwProofPick"></label>`}</div></div>
    <button class="btn" type="submit" style="width:100%">📤 ${prev ? 'به‌روزرسانی ثبت' : 'ثبت و ارسال به سرگروه و معلم'}</button>
  </form></div>`;
}
function importHTML() {
  const im = H.imp = H.imp || { kind: 'assignments', text: '', headers: [], rows: [], map: {}, parsed: false, valid: null };
  const F = im.kind === 'assignments'
    ? [['title', 'عنوان', 1], ['subject', 'درس', 1], ['dueAt', 'مهلت', 1], ['dueTime', 'ساعت', 0], ['points', 'امتیاز', 0], ['kind', 'نوع', 0], ['description', 'توضیح', 0]]
    : [['title', 'عنوان تکلیف', 1], ['name', 'نام دانش‌آموز', 1], ['code', 'کد', 0], ['status', 'وضعیت', 1], ['note', 'یادداشت', 0]];
  return `<div class="hw">
    <div class="field"><label class="lbl">نوع ورود</label><select class="select" data-chg="hwImpKind">
      <option value="assignments" ${im.kind === 'assignments' ? 'selected' : ''}>📚 ساخت تکلیف‌ها</option>
      <option value="subs" ${im.kind === 'subs' ? 'selected' : ''}>📥 ثبت وضعیت دانش‌آموزان</option></select></div>
    <div class="row mb"><label class="btn soft" style="cursor:pointer">📂 انتخاب فایل CSV<input type="file" accept=".csv,.txt,text/csv" class="hidden" data-chg="hwImpFile"></label>
      <button type="button" class="btn ghost" data-act="hwTpl" data-kind="${im.kind}">📄 دانلود نمونه</button></div>
    <div class="field"><label class="lbl">یا محتوای CSV را بچسبان</label><textarea class="input" id="hwImpText" rows="5">${esc(im.text)}</textarea></div>
    <button type="button" class="btn" data-act="hwImpParse">🔍 بررسی و تطبیق ستون‌ها</button>
    <div id="hwImpPrev" class="mt">${im.parsed ? impPrevHTML(F) : ''}</div></div>`;
}
function impPrevHTML(F) {
  const im = H.imp;
  return `<div class="divider"></div><h3 class="mb">🔗 تطبیق ستون‌ها</h3>
    ${F.map(([k, l, req]) => `<div class="cmap"><span class="small bold">${l}${req ? ' *' : ''}</span>
      <select class="select" data-chg="hwImpMap" data-f="${k}"><option value="">— نادیده —</option>${im.headers.map((h, i) => `<option value="${i}" ${im.map[k] === i ? 'selected' : ''}>${esc(h || 'ستون ' + (i + 1))}</option>`).join('')}</select></div>`).join('')}
    <div class="tw mt" style="max-height:220px"><table class="tbl" style="min-width:400px"><thead><tr>${im.headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${im.rows.slice(0, 6).map(r => `<tr>${im.headers.map((_, i) => `<td class="small">${esc(r[i] == null ? '' : r[i])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <button class="btn ok mt" data-act="hwImpApply">📥 اعمال ${fa(im.rows.length)} ردیف روی سرور</button>`;
}

/* ================= A4 sheets ================= */
function classSheet() {
  const st = S(), cls = hwClass(st, now()), list = cls.list.slice(0, 8);
  const rows = (st.students || []).map((s, i) => {
    const ms = hwStats(st, s.id, now());
    const cells = list.map(a => {
      const sub = subFor(a.id, s.id);
      if (!sub) return '<td>—</td>';
      const rk = hwReviewKey(sub);
      const sym = sub.status === 'done' ? (rk === 'approved' ? '✓✓' : '✓') : sub.status === 'partial' ? 'ن' : 'خ';
      const col = sub.status === 'done' ? '#15803d' : sub.status === 'partial' ? '#b45309' : '#b91c1c';
      return `<td style="color:${col};font-weight:700">${sym}</td>`;
    }).join('');
    return `<tr><td style="font-size:9.5px" class="r">${fa(i + 1)}. ${esc(s.name)}</td>${cells}<td>${fa(ms.rate)}٪</td><td>${fa(ms.pts)}</td></tr>`;
  }).join('');
  return `<div class="sheet">${sheetHead('برگهٔ پیگیری تکالیف', fa(list.length) + ' تکلیف اخیر')}
    <table><thead><tr><th style="width:34mm;font-size:9.5px">دانش‌آموز</th>
      ${list.map(a => `<th style="font-size:8.5px">${esc(a.title.slice(0, 22))}<br>${jShort(a.dueAt)}</th>`).join('')}
      <th style="width:12mm;font-size:9px">نرخ</th><th style="width:12mm;font-size:9px">امتیاز</th></tr></thead><tbody>${rows}</tbody></table>
    <p style="font-size:10px">راهنما: ✓ انجام‌شده • ✓✓ تأیید نهایی معلم • ن ناقص • خ نتوانستم • — ثبت‌نشده</p>
    <span class="sec">📊 خلاصهٔ کلاس</span>
    <table><tr><th>تکلیف فعال</th><th>نرخ انجام</th><th>تأییدشده</th><th>در انتظار بررسی</th><th>عقب‌افتاده</th><th>امتیاز داده‌شده</th></tr>
      <tr><td>${fa(cls.activeCount)}</td><td><b>${fa(cls.rate)}٪</b></td><td>${fa(cls.approved)}</td><td>${fa(cls.waiting)}</td><td>${fa(cls.overdue)}</td><td>${fa(cls.pts)}</td></tr></table>
    ${sheetFoot()}</div>`;
}
function oneSheet(aid) {
  const st = S(), a = (hw().assignments || []).find(x => x.id === aid); if (!a) return '';
  const s = hwAStats(st, a, now()), aud = hwAudience(st, a);
  const rows = aud.map((m, i) => {
    const sub = subFor(a.id, m.id), rk = hwReviewKey(sub);
    return `<tr><td>${fa(i + 1)}</td><td class="r">${esc(m.name)}</td>
      <td>${sub ? esc((HS[sub.status] || HS.done).l) : 'ثبت نشده'}</td>
      <td>${sub ? esc((HR[rk] || HR.none).l) : '—'}</td>
      <td>${sub && sub.late ? 'بله' : 'خیر'}</td><td>${sub ? fa(sub.points || 0) : '—'}</td>
      <td class="r" style="font-size:9.5px">${sub ? esc((sub.note || '').slice(0, 40)) : ''}</td></tr>`;
  }).join('');
  return `<div class="sheet">${sheetHead('برگهٔ تکلیف', a.subject)}
    <table><tr><th style="width:16%">عنوان</th><td colspan="3" class="r"><b>${esc(a.title)}</b></td><th style="width:12%">مهلت</th><td>${jShort(a.dueAt)} • ${fa(a.dueTime)}</td><th style="width:12%">امتیاز</th><td>${fa(a.points)}</td></tr></table>
    ${a.description ? `<div class="ai">📝 ${esc(a.description)}</div>` : ''}
    <table><thead><tr><th style="width:5%">#</th><th style="width:26%">نام</th><th style="width:15%">وضعیت</th><th style="width:17%">بررسی</th><th style="width:10%">دیرکرد</th><th style="width:9%">امتیاز</th><th>یادداشت</th></tr></thead><tbody>${rows}</tbody></table>
    <table><tr><th>مخاطب</th><th>کامل</th><th>ناقص</th><th>نتوانست</th><th>ثبت‌نشده</th><th>نرخ انجام</th></tr>
      <tr><td>${fa(s.total)}</td><td>${fa(s.done)}</td><td>${fa(s.partial)}</td><td>${fa(s.cant)}</td><td>${fa(s.missing)}</td><td><b>${fa(s.rate)}٪</b></td></tr></table>
    ${sheetFoot()}</div>`;
}
function stuSheet(sid) {
  const st = S(), s = stuById(st, sid); if (!s) return '';
  const ms = hwStats(st, sid, now()), h = hw();
  const rows = (h.assignments || []).filter(a => hwTargets(st, a, sid)).slice(0, 16).map((a, i) => {
    const sub = subFor(a.id, sid), rk = hwReviewKey(sub);
    return `<tr><td>${fa(i + 1)}</td><td class="r">${esc(a.title)}</td><td>${esc(a.subject)}</td><td>${jShort(a.dueAt)}</td>
      <td>${sub ? esc((HS[sub.status] || HS.done).l) : 'ثبت نشده'}</td><td>${sub ? esc((HR[rk] || HR.none).l) : '—'}</td><td>${sub ? fa(sub.points || 0) : '—'}</td></tr>`;
  }).join('');
  return `<div class="sheet">${sheetHead('کارنامهٔ تکلیف', s.name)}
    <table><tr><th style="width:16%">نام</th><td style="width:30%"><b>${esc(s.name)}</b></td><th style="width:14%">نرخ انجام</th><td><b>${fa(ms.rate)}٪</b></td><th style="width:14%">امتیاز تکلیف</th><td>${fa(ms.pts)}</td></tr></table>
    <table><thead><tr><th style="width:5%">#</th><th style="width:32%">تکلیف</th><th style="width:15%">درس</th><th style="width:12%">مهلت</th><th style="width:14%">وضعیت</th><th style="width:14%">بررسی</th><th style="width:8%">امتیاز</th></tr></thead><tbody>${rows}</tbody></table>
    <span class="sec">📊 جمع‌بندی</span>
    <table><tr><th>کل تکلیف</th><th>کامل</th><th>ناقص</th><th>نتوانست</th><th>ثبت‌نشده</th><th>عقب‌افتاده</th><th>تأیید نهایی</th></tr>
      <tr><td>${fa(ms.total)}</td><td>${fa(ms.done)}</td><td>${fa(ms.partial)}</td><td>${fa(ms.cant)}</td><td>${fa(ms.pending)}</td><td>${fa(ms.overdue)}</td><td>${fa(ms.approved)}</td></tr></table>
    <div class="ai">${ms.rate >= 85 ? '🌟 نظم تکلیف عالی است؛ همین روند ادامه یابد.' : ms.rate >= 60 ? '👍 وضعیت قابل قبول است؛ برای رسیدن به سطح عالی، تکلیف‌های ناقص کامل شود.' : '🎯 نیازمند پیگیری روزانه است؛ پیشنهاد: دفتر پیگیری تکلیف و بررسی هر شب توسط ولی.'}</div>
    ${sheetFoot()}</div>`;
}

/* ================= CSV ================= */
function csvExport(kind, onlyAid) {
  const st = S(), h = hw();
  let rows;
  if (kind === 'assignments') {
    rows = [['عنوان', 'درس', 'نوع', 'تاریخ دادن', 'مهلت', 'ساعت', 'امتیاز', 'مخاطب', 'عکس لازم', 'وضعیت', 'توضیح']];
    hwOrdered(st).forEach(a => rows.push([a.title, a.subject, (HK[a.kind] || HK.written).l, a.assignedAt, a.dueAt, a.dueTime, a.points, a.target === 'all' ? 'کل کلاس' : ((st.groups || []).find(g => g.id === a.target) || {}).name || '', a.requireProof ? 'بله' : 'خیر', a.status === 'published' ? 'منتشر' : a.status === 'draft' ? 'پیش‌نویس' : 'بسته', a.description]));
  } else if (kind === 'subs') {
    rows = [['عنوان تکلیف', 'درس', 'نام', 'کد', 'وضعیت', 'بررسی', 'دیرکرد', 'امتیاز', 'تاریخ ثبت', 'یادداشت']];
    hwOrdered(st).forEach(a => {
      if (onlyAid && a.id !== onlyAid) return;
      hwAudience(st, a).forEach(m => {
        const sub = subFor(a.id, m.id);
        rows.push([a.title, a.subject, m.name, m.code || '', sub ? (HS[sub.status] || HS.done).l : 'ثبت نشده', sub ? (HR[hwReviewKey(sub)] || HR.none).l : '—', sub && sub.late ? 'بله' : 'خیر', sub ? sub.points || 0 : '', sub ? C.iranISO(new Date(sub.at)) : '', sub ? sub.note : '']);
      });
    });
  } else {
    rows = [['نام', 'کد', 'گروه', 'کل تکلیف', 'کامل', 'ناقص', 'نتوانست', 'ثبت‌نشده', 'عقب‌افتاده', 'تأییدشده', 'نرخ انجام٪', 'امتیاز تکلیف']];
    (st.students || []).forEach(s => {
      const m = hwStats(st, s.id, now()), g = groupOf(st, s.id);
      rows.push([s.name, s.code || '', g ? g.name : '', m.total, m.done, m.partial, m.cant, m.pending, m.overdue, m.approved, m.rate, m.pts]);
    });
  }
  download(`تکالیف-${kind}-${C.jShortEn(todayISO()).replace(/\//g, '-')}.csv`, serializeCSV(st, rows));
  toast(`فایل با ${fa(rows.length - 1)} ردیف دانلود شد`, 'ok');
}
function template(kind) {
  const st = S(), d = todayISO();
  const rows = kind === 'assignments'
    ? [['عنوان', 'درس', 'مهلت', 'ساعت', 'امتیاز', 'نوع', 'توضیح'], ['تمرین صفحهٔ ۳۵', (st.subjects || [])[0] || 'ریاضی', C.jShortEn(d), '۲۰:۰۰', '۳', 'تمرینی', 'تمرین‌های ۱ تا ۵']]
    : [['عنوان تکلیف', 'نام', 'کد', 'وضعیت', 'یادداشت'], [(hw().assignments[0] || {}).title || 'تمرین صفحهٔ ۳۵', (st.students[0] || {}).name || '', (st.students[0] || {}).code || '', 'انجام دادم', 'کامل نوشتم']];
  download(`نمونه-${kind === 'assignments' ? 'تکالیف' : 'ثبت‌ها'}.csv`, serializeCSV(st, rows));
  toast('فایل نمونه دانلود شد', 'ok');
}

/* ================= render integration ================= */
const baseNav = navItems, baseRenderView = renderView, baseSidebar = renderSidebar;
navItems = function () {
  const items = baseNav();
  const key = isT() ? 'homework' : 'myHomework';
  const label = isT() ? 'تکالیف' : 'تکالیف من';
  const at = items.findIndex(x => x[0] === (isT() ? 'grades' : 'ai'));
  const entry = [key, '📚', label];
  if (at > -1) items.splice(at + 1, 0, entry); else items.unshift(entry);
  return items;
};
renderSidebar = function () {
  baseSidebar();
  const st = S(); if (!st) return;
  const key = isT() ? 'homework' : 'myHomework';
  const btn = document.querySelector(`.nav[data-sec="${key}"]`);
  if (!btn) return;
  const n = isT() ? hwClass(st, now()).waiting : hwStats(st, SESS.sid, now()).pending;
  if (n > 0 && !btn.querySelector('.nb')) {
    const b = document.createElement('span'); b.className = 'nb'; b.textContent = fa(n);
    btn.appendChild(b);
  }
};
renderView = function () {
  if (UI.section !== 'homework' && UI.section !== 'myHomework') return baseRenderView();
  const v = document.getElementById('view');
  try {
    C.hwEnsure(S());
    v.innerHTML = `<div class="ve">${isT() ? teacherView() : studentView()}</div>`;
  } catch (e) {
    console.error('homework view', e);
    v.innerHTML = `<div class="card">${empty('🛠️', 'خطا در نمایش تکالیف', 'صفحه را دوباره بارگذاری کنید.', '<button type="button" class="btn" data-act="reload">بارگذاری مجدد</button>')}</div>`;
  }
};
function repaintList() { const el = document.getElementById('hwList'); if (el) el.innerHTML = listBody(); }
function openDetail(id) {
  const a = (hw().assignments || []).find(x => x.id === id);
  if (!a) return toast('تکلیف یافت نشد', 'err');
  H.aid = id; openDrawer('📂 ' + a.title, detailHTML(a), true);
}
function refreshDetail() {
  if (!H.aid) return;
  const w = document.getElementById('drawerWrap');
  if (!w || w.classList.contains('hidden')) return;
  const a = (hw().assignments || []).find(x => x.id === H.aid);
  if (a && document.getElementById('drawerTitle').textContent.indexOf('📂') === 0) {
    document.getElementById('drawerBody').innerHTML = detailHTML(a);
  }
}

/* ================= actions ================= */
ACT.hwTab = el => { H.tab = el.dataset.tab; renderView(); Sound.play('tap'); };
ACT.hwMyTab = el => { H.myTab = el.dataset.tab; renderView(); Sound.play('tap'); };
ACT.hwMode = el => { H.mode = el.dataset.v; renderView(); Sound.play('tap'); };
ACT.hwNew = () => openDrawer('➕ تکلیف جدید', formHTML(null), true);
ACT.hwEdit = el => { const a = (hw().assignments || []).find(x => x.id === el.dataset.id); if (a) openDrawer('✏️ ویرایش تکلیف', formHTML(a), true); };
ACT.hwOpen = el => openDetail(el.dataset.id);
ACT.hwToggle = el => {
  const id = el.dataset.id, a = (hw().assignments || []).find(x => x.id === id); if (!a) return;
  const next = a.status === 'closed' ? 'published' : 'closed';
  send('hw.status', { id, status: next }, st => { const t = st.homework.assignments.find(x => x.id === id); if (t) t.status = next; }, { msg: next === 'closed' ? '🔒 تکلیف بسته شد' : '🔓 تکلیف باز شد' });
  refreshDetail();
};
ACT.hwDel = el => {
  const id = el.dataset.id, a = (hw().assignments || []).find(x => x.id === id);
  confirmDlg({ title: 'حذف تکلیف', body: `«${a ? a.title : ''}» و همهٔ ثبت‌ها و امتیازهایش حذف شود؟`, okText: 'حذف', danger: true, onOk: () => {
    send('hw.delete', { id }, st => {
      st.homework.assignments = st.homework.assignments.filter(x => x.id !== id);
      delete st.homework.subs[id];
      st.discipline = (st.discipline || []).filter(d => d.hwid !== id);
    }, { msg: 'تکلیف حذف شد', undo: true, sound: 'err' });
    closeDrawer(); H.sel.delete(id);
  } });
};
ACT.hwSelClear = () => { H.sel.clear(); repaintList(); };
ACT.hwBulkDel = () => {
  const ids = [...H.sel];
  confirmDlg({ title: 'حذف گروهی', body: `${fa(ids.length)} تکلیف با همهٔ ثبت‌ها و امتیازها حذف شود؟`, okText: 'حذف همه', danger: true, onOk: () => {
    send('hw.bulkDelete', { ids }, st => {
      st.homework.assignments = st.homework.assignments.filter(a => !ids.includes(a.id));
      ids.forEach(i => delete st.homework.subs[i]);
      st.discipline = (st.discipline || []).filter(d => !ids.includes(d.hwid));
    }, { msg: `${fa(ids.length)} تکلیف حذف شد`, undo: true, sound: 'err' });
    H.sel.clear();
  } });
};
ACT.hwBulkClose = () => {
  const ids = [...H.sel];
  ids.forEach(id => send('hw.status', { id, status: 'closed' }, st => { const a = st.homework.assignments.find(x => x.id === id); if (a) a.status = 'closed'; }, { sound: null }));
  toast(`${fa(ids.length)} تکلیف بسته شد`, 'ok'); H.sel.clear();
};
ACT.hwBulkOpen = () => {
  const ids = [...H.sel];
  ids.forEach(id => send('hw.status', { id, status: 'published' }, st => { const a = st.homework.assignments.find(x => x.id === id); if (a) a.status = 'published'; }, { sound: null }));
  toast(`${fa(ids.length)} تکلیف باز شد`, 'ok'); H.sel.clear();
};
ACT.hwViewSave = () => promptDlg({ title: '💾 ذخیرهٔ نمای فیلترها', placeholder: 'مثلاً: ریاضیِ عقب‌افتاده', onOk: name => {
  send('hw.viewSave', { name, q: H.q, subject: H.subject, phase: H.phase, group: H.group, sort: H.sort }, st => {
    st.homework.savedViews.push({ id: uid(), name, q: H.q, subject: H.subject, phase: H.phase, group: H.group, sort: H.sort });
  }, { msg: 'نما ذخیره شد' });
} });
ACT.hwPts = el => {
  if (!H.draft) return;
  H.draft.points = clamp((H.draft.points || 0) + Number(en(el.dataset.d)), 0, 20);
  const b = document.getElementById('hwPtsVal'); if (b) b.textContent = fa(H.draft.points);
  Sound.play('tap');
};
ACT.hwFStatus = el => {
  if (!H.draft) return;
  H.draft.status = el.dataset.v;
  el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el));
  Sound.play('tap');
};
ACT.hwSubStatus = el => {
  if (!H.subDraft) return;
  H.subDraft.status = el.dataset.v;
  el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el));
  Sound.play('tap');
};
ACT.hwProofDel = () => {
  if (!H.subDraft) return;
  H.subDraft.proof = null;
  const box = document.getElementById('hwProofBox');
  if (box) box.innerHTML = `<label class="hw-drop" style="display:block;cursor:pointer"><div style="font-size:1.9rem">📷</div><div class="small bold">برای انتخاب عکس دفتر بزن</div><div class="small muted">خودکار کوچک می‌شود</div><input type="file" accept="image/*" class="hidden" data-chg="hwProofPick"></label>`;
};
ACT.hwProof = el => {
  const sub = subFor(el.dataset.aid, el.dataset.sid);
  if (!sub || !sub.proof) return;
  const stu = stuById(S(), el.dataset.sid);
  openModal(`<h3>📷 عکس تکلیف${stu ? ' — ' + esc(stu.name) : ''}</h3><img class="hw-proofbig" src="${sub.proof}" alt="عکس تکلیف">
    <div class="row mt" style="justify-content:flex-end">${isT() ? `<button type="button" class="btn ghost" data-act="hwProofClear" data-aid="${el.dataset.aid}" data-sid="${el.dataset.sid}">🗑 حذف عکس</button>` : ''}
    <button type="button" class="btn" data-act="modalClose">بستن</button></div>`);
};
ACT.hwProofClear = el => {
  const { aid, sid } = el.dataset;
  send('hw.clearProof', { aid, sid }, st => { const s = st.homework.subs[aid] && st.homework.subs[aid][sid]; if (s) s.proof = null; }, { msg: 'عکس حذف شد' });
  closeModal(); refreshDetail();
};
ACT.hwApprove = el => {
  const { aid, sid } = el.dataset;
  const a = (hw().assignments || []).find(x => x.id === aid);
  const sub = subFor(aid, sid);
  const pts = a && sub ? Math.round(a.points * (sub.status === 'partial' ? .5 : sub.status === 'cant' ? 0 : 1) * (sub.late ? (1 - (hw().settings.latePenalty || 0) / 100) : 1)) : 0;
  send('hw.review', { aid, sid, verdict: 'approved' }, st => {
    const s = st.homework.subs[aid] && st.homework.subs[aid][sid]; if (!s) return;
    s.teacherReview = { verdict: 'approved', note: '', at: new Date().toISOString(), points: pts };
    const prev = s.points || 0; s.points = pts;
    if (pts - prev) st.discipline.push({ id: uid(), sid, date: todayISO(), points: pts - prev, reason: 'تکلیف: ' + (a ? a.title : ''), by: 'homework', hwid: aid });
  }, { sound: null }).then(r => { if (r) { stamp('تأیید شد'); Sound.play('gavel'); toast(`🎖️ تأیید شد${pts ? ` • +${fa(pts)} امتیاز` : ''}`, 'ok'); refreshDetail(); } });
};
ACT.hwRedo = el => {
  const { aid, sid } = el.dataset;
  promptDlg({ title: '🔁 درخواست بازنویسی', placeholder: 'چه چیزی باید اصلاح شود؟', onOk: note => {
    send('hw.review', { aid, sid, verdict: 'redo', note }, st => {
      const s = st.homework.subs[aid] && st.homework.subs[aid][sid]; if (!s) return;
      const prev = s.points || 0;
      s.teacherReview = { verdict: 'redo', note, at: new Date().toISOString(), points: 0 }; s.points = 0;
      if (prev) st.discipline.push({ id: uid(), sid, date: todayISO(), points: -prev, reason: 'بازنویسی تکلیف', by: 'homework', hwid: aid });
    }, { msg: '🔁 برای بازنویسی برگشت', sound: 'err' }).then(refreshDetail);
  } });
};
ACT.hwApproveAid = el => {
  const id = el.dataset.id, a = (hw().assignments || []).find(x => x.id === id); if (!a) return;
  const sids = hwAudience(S(), a).filter(m => { const s = subFor(id, m.id); return s && ['waiting', 'leader_ok', 'leader_fix'].includes(hwReviewKey(s)); }).map(m => m.id);
  if (!sids.length) return toast('موردی برای بررسی نیست', 'info');
  confirmDlg({ title: '🎖️ تأیید گروهی', body: `${fa(sids.length)} ثبت برای «${a.title}» تأیید و امتیاز داده شود؟`, okText: 'تأیید همه', onOk: () => {
    send('hw.bulkReview', { aid: id, sids, verdict: 'approved' }, null, { sound: null })
      .then(r => { if (r) { stamp(fa(r.reviewed) + ' تأیید'); Sound.play('win'); toast(`🎖️ ${fa(r.reviewed)} ثبت تأیید شد • ${fa(r.points)} امتیاز`, 'ok', null, 7000); refreshDetail(); } });
  } });
};
ACT.hwApproveAll = () => {
  const cls = hwClass(S(), now());
  let items = cls.inbox;
  if (H.revAid !== 'all') items = items.filter(x => x.a.id === H.revAid);
  const q = norm(H.revQ);
  if (q) items = items.filter(x => norm(x.stu.name).includes(q) || norm(x.a.title).includes(q));
  if (!items.length) return toast('موردی نیست', 'info');
  const byA = {};
  items.forEach(x => { (byA[x.a.id] = byA[x.a.id] || []).push(x.stu.id); });
  confirmDlg({ title: '🎖️ تأیید همهٔ صندوق', body: `${fa(items.length)} ثبت در ${fa(Object.keys(byA).length)} تکلیف تأیید شود؟`, okText: 'تأیید همه', onOk: async () => {
    let total = 0, pts = 0;
    for (const aid in byA) {
      const r = await send('hw.bulkReview', { aid, sids: byA[aid], verdict: 'approved' }, null, { sound: null });
      if (r) { total += r.reviewed; pts += r.points; }
    }
    stamp(fa(total) + ' تأیید'); Sound.play('win');
    toast(`🎖️ ${fa(total)} ثبت تأیید شد • ${fa(pts)} امتیاز`, 'ok', null, 8000);
  } });
};
ACT.hwSubmit = el => {
  const a = (hw().assignments || []).find(x => x.id === el.dataset.id);
  if (!a) return;
  if (hwPhase(a, now()) === 'overdue' && !a.allowLate) return toast('مهلت این تکلیف تمام شده است', 'err');
  openDrawer('📤 ثبت تکلیف', submitHTML(a));
};
ACT.hwWithdraw = el => {
  const id = el.dataset.id;
  confirmDlg({ title: 'حذف ثبت', body: 'ثبت تکلیف تو حذف شود؟', okText: 'حذف', danger: true, onOk: () => {
    send('hw.withdraw', { aid: id }, st => { if (st.homework.subs[id]) delete st.homework.subs[id][SESS.sid]; }, { msg: 'ثبت حذف شد', sound: 'err' });
  } });
};
ACT.hwLeadOk = el => {
  const { aid, sid } = el.dataset;
  send('hw.leaderCheck', { aid, sid, verdict: 'approved', note: 'دفترش را دیدم، کامل بود.' }, null, { sound: null })
    .then(r => { if (r) { Sound.play('pop'); toast(r.earned ? '🏅 تأیید ثبت شد • +۱ امتیاز مدیریتی' : '🏅 نظر تو ثبت شد', 'ok'); } });
};
ACT.hwLeadFix = el => {
  const { aid, sid } = el.dataset;
  promptDlg({ title: '↩️ درخواست اصلاح', placeholder: 'چه چیزی ناقص است؟', onOk: note => {
    send('hw.leaderCheck', { aid, sid, verdict: 'fix', note }, null, { sound: null })
      .then(r => { if (r) { Sound.play('tap'); toast(r.earned ? '↩️ اصلاح خواسته شد • +۱ امتیاز مدیریتی' : '↩️ نظر تو ثبت شد', 'ok'); } });
  } });
};
ACT.hwCsv = el => csvExport(el.dataset.kind);
ACT.hwCsvOne = el => csvExport('subs', el.dataset.id);
ACT.hwTpl = el => template(el.dataset.kind);
ACT.hwImport = () => { H.imp = { kind: 'assignments', text: '', headers: [], rows: [], map: {}, parsed: false }; openDrawer('📥 ورود CSV تکالیف', importHTML(), true); };
ACT.hwImpParse = () => {
  const text = (document.getElementById('hwImpText') || {}).value || '';
  if (!text.trim()) return toast('محتوای CSV خالی است', 'err');
  const rows = parseCSV(text);
  if (rows.length < 2) return toast('حداقل یک ردیف داده لازم است', 'err');
  const im = H.imp;
  im.text = text; im.headers = rows[0].map(x => norm(x)); im.rows = rows.slice(1); im.parsed = true;
  const syn = im.kind === 'assignments'
    ? { title: ['عنوان', 'تکلیف'], subject: ['درس'], dueAt: ['مهلت', 'تاریخ'], dueTime: ['ساعت'], points: ['امتیاز'], kind: ['نوع'], description: ['توضیح'] }
    : { title: ['عنوان تکلیف', 'تکلیف', 'عنوان'], name: ['نام'], code: ['کد'], status: ['وضعیت'], note: ['یادداشت'] };
  im.map = {};
  Object.keys(syn).forEach(k => { const i = im.headers.findIndex(h => syn[k].some(s => norm(h).includes(norm(s)))); if (i > -1) im.map[k] = i; });
  const F = im.kind === 'assignments'
    ? [['title', 'عنوان', 1], ['subject', 'درس', 1], ['dueAt', 'مهلت', 1], ['dueTime', 'ساعت', 0], ['points', 'امتیاز', 0], ['kind', 'نوع', 0], ['description', 'توضیح', 0]]
    : [['title', 'عنوان تکلیف', 1], ['name', 'نام دانش‌آموز', 1], ['code', 'کد', 0], ['status', 'وضعیت', 1], ['note', 'یادداشت', 0]];
  const box = document.getElementById('hwImpPrev'); if (box) box.innerHTML = impPrevHTML(F);
  toast('فایل خوانده شد؛ ستون‌ها را بررسی کن', 'info');
};
ACT.hwImpApply = () => {
  const im = H.imp; if (!im || !im.rows.length) return;
  confirmDlg({ title: '📥 اعمال ورود', body: `${fa(im.rows.length)} ردیف روی سرور ثبت شود؟`, okText: 'اعمال', onOk: () => {
    send('hw.import', { kind: im.kind, rows: im.rows, map: im.map }, null, { undo: true, sound: 'win' })
      .then(r => { if (r) { toast(`📥 ${fa(r.applied)} ردیف وارد شد${r.skipped ? ` • ${fa(r.skipped)} ردیف نادیده` : ''}`, 'ok', null, 7000); H.imp = null; closeDrawer(); } });
  } });
};
ACT.hwClassSheet = () => previewSheet('🖨️ برگهٔ پیگیری تکالیف (A4)', classSheet());
ACT.hwOneSheet = el => previewSheet('🖨️ برگهٔ تکلیف (A4)', oneSheet(el.dataset.id));
ACT.hwStuSheet = el => previewSheet('🖨️ کارنامهٔ تکلیف (A4)', stuSheet(el.dataset.id));

/* ================= inputs / changes ================= */
INP.hwQ = el => { H.q = el.value; repaintList(); };
INP.hwRevQ = el => { H.revQ = el.value; const b = document.getElementById('hwBody'); if (b) b.innerHTML = inboxBody(); };
INP.hwPen = el => {
  const v = clamp(Number(en(el.value)) || 0, 0, 90);
  const l = document.getElementById('hwPenVal'); if (l) l.textContent = fa(v) + '٪';
  clearTimeout(H.penT);
  H.penT = setTimeout(() => send('hw.settings', { patch: { latePenalty: v } }, st => { st.homework.settings.latePenalty = v; }, { sound: null }), 550);
};
CHG.hwSubject = el => { H.subject = el.value; repaintList(); };
CHG.hwPhase = el => { H.phase = el.value; repaintList(); };
CHG.hwGroup = el => { H.group = el.value; repaintList(); };
CHG.hwSort = el => { H.sort = el.value; repaintList(); };
CHG.hwSel = el => { el.checked ? H.sel.add(el.dataset.id) : H.sel.delete(el.dataset.id); repaintList(); };
CHG.hwSelAll = el => { const l = filtered(); if (el.checked) l.forEach(a => H.sel.add(a.id)); else H.sel.clear(); repaintList(); };
CHG.hwRevAid = el => { H.revAid = el.value; const b = document.getElementById('hwBody'); if (b) b.innerHTML = inboxBody(); };
CHG.hwViewApply = el => {
  const v = (hw().savedViews || []).find(x => x.id === el.value); if (!v) return;
  H.q = v.q || ''; H.subject = v.subject || 'all'; H.phase = v.phase || 'all'; H.group = v.group || 'all'; H.sort = v.sort || 'order';
  renderView(); toast('نما اعمال شد: ' + v.name, 'ok');
};
CHG.hwSet = el => {
  const k = el.dataset.k, v = el.checked;
  send('hw.settings', { patch: { [k]: v } }, st => { st.homework.settings[k] = v; }, { msg: 'قاعده ذخیره شد' });
};
CHG.hwF = el => { if (H.draft) H.draft[el.dataset.f] = el.value; };
CHG.hwFB = el => { if (H.draft) H.draft[el.dataset.f] = el.checked; };
CHG.hwFTime = el => {
  if (!H.draft) return;
  const p = String(H.draft.dueTime || '20:00').split(':');
  const v = pad(Number(en(el.value)) || 0);
  H.draft.dueTime = el.dataset.p === 'H' ? v + ':' + p[1] : p[0] + ':' + v;
};
CHG.hwProofPick = el => {
  const f = el.files && el.files[0]; el.value = '';
  if (!f || !H.subDraft) return;
  if (f.size > 6e6) return toast('عکس باید کمتر از ۶ مگابایت باشد', 'err');
  const rd = new FileReader();
  rd.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 620, sc = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      let url = cv.toDataURL('image/jpeg', .68);
      if (url.length > 128000) url = cv.toDataURL('image/jpeg', .48);
      H.subDraft.proof = url;
      const box = document.getElementById('hwProofBox');
      if (box) box.innerHTML = `<div class="row"><img class="hw-thumb" style="width:88px;height:88px" src="${url}" alt=""><button type="button" class="btn ghost sm" data-act="hwProofDel">🗑 حذف عکس</button></div>`;
      Sound.play('pop');
    };
    img.onerror = () => toast('عکس خوانده نشد', 'err');
    img.src = rd.result;
  };
  rd.readAsDataURL(f);
};
CHG.hwImpKind = el => { H.imp = { kind: el.value, text: (document.getElementById('hwImpText') || {}).value || '', headers: [], rows: [], map: {}, parsed: false }; document.getElementById('drawerBody').innerHTML = importHTML(); };
CHG.hwImpFile = async el => {
  const f = el.files && el.files[0]; el.value = ''; if (!f) return;
  const text = await f.text();
  H.imp = H.imp || { kind: 'assignments' };
  H.imp.text = text;
  const ta = document.getElementById('hwImpText'); if (ta) ta.value = text;
  ACT.hwImpParse();
};
CHG.hwImpMap = el => { if (H.imp) H.imp.map[el.dataset.f] = el.value === '' ? '' : Number(el.value); };

/* ================= forms ================= */
FORM.hwForm = form => {
  const d = H.draft; if (!d) return;
  const fd = new FormData(form);
  const data = {
    title: String(fd.get('title') || '').trim(),
    subject: d.subject, kind: d.kind,
    description: String(fd.get('description') || '').trim(),
    assignedAt: UI.jdate.hwassign || todayISO(),
    dueAt: UI.jdate.hwdue || todayISO(),
    dueTime: d.dueTime, points: d.points, target: d.target,
    requireProof: d.requireProof, allowLate: d.allowLate, status: d.status
  };
  if (!data.title) return toast('عنوان تکلیف را بنویس', 'err');
  if (C.hwDueTs({ dueAt: data.dueAt, dueTime: data.dueTime }) < C.hwDueTs({ dueAt: data.assignedAt, dueTime: '00:00' }))
    return toast('مهلت نمی‌تواند پیش از تاریخ دادن تکلیف باشد', 'err');
  if (d.id) send('hw.update', { id: d.id, data }, st => { const a = st.homework.assignments.find(x => x.id === d.id); if (a) Object.assign(a, data); }, { msg: 'تکلیف ویرایش شد' });
  else {
    const id = uid();
    send('hw.create', { id, data }, st => {
      const order = st.homework.assignments.reduce((m, a) => Math.max(m, a.order || 0), 0) + 1;
      st.homework.assignments.push(Object.assign({ id, order, createdAt: todayISO() }, data));
      st.homework.subs[id] = {};
    }, { msg: data.status === 'published' ? '📢 تکلیف برای کلاس ارسال شد' : '📝 پیش‌نویس ذخیره شد' });
  }
  H.draft = null; closeDrawer();
};
FORM.hwSubmit = form => {
  const d = H.subDraft; if (!d) return;
  const note = String(new FormData(form).get('note') || '').trim();
  const a = (hw().assignments || []).find(x => x.id === d.aid);
  if (a && a.requireProof && d.status === 'done' && !d.proof) return toast('این تکلیف عکس دفتر می‌خواهد', 'err');
  send('hw.submit', { aid: d.aid, status: d.status, note, proof: d.proof }, st => {
    st.homework.subs[d.aid] = st.homework.subs[d.aid] || {};
    const prev = st.homework.subs[d.aid][SESS.sid];
    st.homework.subs[d.aid][SESS.sid] = {
      status: d.status, at: new Date().toISOString(), note, proof: d.proof,
      points: prev ? prev.points || 0 : 0, late: hwPhase(a || { dueAt: todayISO(), dueTime: '23:59', status: 'published' }, now()) === 'overdue',
      leaderCheck: null, teacherReview: null
    };
  }, { sound: null }).then(r => {
    if (r) {
      Sound.play(d.status === 'done' ? 'win' : 'pop');
      toast(d.status === 'done' ? '🎉 آفرین! تکلیفت ثبت شد' : '📤 ثبت شد؛ معلم می‌بیند', 'ok');
      const ms = hwStats(S(), SESS.sid, now());
      if (ms.total && ms.pending === 0) { stamp('همه انجام شد'); Sound.play('win'); }
    }
  });
  H.subDraft = null; closeDrawer();
};

/* ================= drag reorder ================= */
let dragId = null;
document.addEventListener('dragstart', e => {
  const card = e.target.closest && e.target.closest('[data-hwdrag]');
  if (!card) return;
  dragId = card.dataset.hwdrag;
  card.classList.add('dragging');
  try { e.dataTransfer.setData('text/plain', 'hw:' + dragId); e.dataTransfer.effectAllowed = 'move'; } catch (_) {}
});
document.addEventListener('dragend', () => {
  dragId = null;
  document.querySelectorAll('.hw-card.dragging').forEach(x => x.classList.remove('dragging'));
  document.querySelectorAll('.hw-card.hint').forEach(x => x.classList.remove('hint'));
});
document.addEventListener('dragover', e => {
  if (!dragId) return;
  const z = e.target.closest && e.target.closest('[data-hwdrop]');
  if (!z) return;
  e.preventDefault();
  document.querySelectorAll('.hw-card.hint').forEach(x => { if (x !== z) x.classList.remove('hint'); });
  z.classList.add('hint');
});
document.addEventListener('drop', e => {
  if (!dragId) return;
  const z = e.target.closest && e.target.closest('[data-hwdrop]');
  if (!z) return;
  e.preventDefault(); e.stopPropagation();
  const target = z.dataset.hwdrop, src = dragId;
  dragId = null;
  document.querySelectorAll('.hw-card.hint').forEach(x => x.classList.remove('hint'));
  if (!target || target === src) return;
  const list = filtered();
  const from = list.findIndex(a => a.id === src), to = list.findIndex(a => a.id === target);
  if (from < 0 || to < 0) return;
  H.sort = 'order';
  send('hw.reorder', { from, to }, st => {
    const arr = st.homework.assignments.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    const [x] = arr.splice(from, 1); arr.splice(to, 0, x);
    arr.forEach((a, i) => { a.order = i + 1; });
  }, { sound: 'pop' });
}, true);

/* ================= live countdown ================= */
setInterval(() => {
  if (!S() || !SESS) return;
  const nodes = document.querySelectorAll('[data-hwcd]');
  if (!nodes.length) return;
  const map = {};
  (hw().assignments || []).forEach(a => { map[a.id] = a; });
  let expired = false;
  nodes.forEach(n => {
    const a = map[n.dataset.hwcd]; if (!a) return;
    const before = hwPhase(a, now() - 1100), after = hwPhase(a, now());
    n.textContent = cdText(a);
    if (before !== after) expired = true;
  });
  if (expired && (UI.section === 'homework' || UI.section === 'myHomework')) renderView();
}, 1000);

/* ================= boot hook ================= */
const baseRender = render;
render = function (keep) {
  if (S() && SESS && (UI.section === 'homework' || UI.section === 'myHomework')) C.hwEnsure(S());
  baseRender(keep);
};
if (S() && SESS) render(true);
})();
