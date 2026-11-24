/* growth.js — رابط کاربری رشد و انگیزه */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.GR_STREAKS || typeof navItems !== 'function') return;

const SK = C.GR_STREAKS, QK = C.GR_QK, RAR = C.GR_RARITY, MOODS = C.GR_MOODS;
const grXp = C.grXp, grLevel = C.grLevel, grRank = C.grRank, grStreaks = C.grStreaks;
const grQuestsFor = C.grQuestsFor, grProgress = C.grProgress, grClaimOf = C.grClaimOf;
const grSpins = C.grSpins, grFreezeCount = C.grFreezeCount, grVouchers = C.grVouchers;
const grWeekKey = C.grWeekKey, grShift = C.grShift, grLastDays = C.grLastDays;

/* ================= style ================= */
const CSS = `
.gr{--flame:#f97316;--flame2:#fbbf24;--gold:#d97706;--grape:#7c3aed;--teal:#0d9488;--lapis:#1d4ed8;--rose:#e11d48;--leaf:#65a30d;--sky:#0ea5e9;--paper:#fdf6e8;--ink2:#2b2418;--rule:#e6d9bd}
[data-theme=dark] .gr{--paper:#141d33;--ink2:#e9eef7;--rule:#26334f}
.gr-hero{position:relative;overflow:hidden;border-radius:24px;padding:24px 26px;margin-bottom:18px;border:1.5px solid color-mix(in srgb,var(--flame) 30%,var(--line));
background:radial-gradient(120% 140% at 90% -10%,color-mix(in srgb,var(--flame2) 34%,transparent),transparent 55%),radial-gradient(90% 120% at 6% 110%,color-mix(in srgb,var(--grape) 22%,transparent),transparent 60%),linear-gradient(135deg,color-mix(in srgb,var(--flame) 14%,var(--paper)),color-mix(in srgb,var(--teal) 12%,var(--paper)));box-shadow:var(--shadow)}
.gr-hero::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.45;background-image:radial-gradient(circle,color-mix(in srgb,var(--flame2) 55%,transparent) 0 2px,transparent 3px);background-size:30px 30px;animation:grTw 5s ease-in-out infinite alternate}
@keyframes grTw{from{opacity:.22}to{opacity:.55}}
.gr-hero>*{position:relative;z-index:2}
.gr-hero h1{font-family:var(--display);font-weight:400;font-size:2rem;line-height:1.3;color:var(--ink2)}
.gr-hero p{color:var(--muted);font-size:.88rem;max-width:620px}
.gr-quick{display:flex;gap:9px;flex-wrap:wrap;margin-top:13px}
.gr-quick .q{display:inline-flex;align-items:center;gap:7px;background:color-mix(in srgb,var(--surface) 84%,transparent);border:1px solid var(--line);border-radius:13px;padding:7px 13px;font-size:.8rem;font-weight:800;backdrop-filter:blur(6px)}
.gr-quick .q b{font-family:var(--display);font-size:1.15rem;font-weight:400}
.gr-lvl{display:flex;align-items:center;gap:15px;background:linear-gradient(135deg,#5b21b6,#7c3aed 45%,#0ea5e9);color:#fff;border-radius:20px;padding:16px 20px;min-width:262px;box-shadow:0 18px 40px -18px rgba(91,33,182,.7);position:relative;overflow:hidden}
.gr-lvl::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.13) 0 2px,transparent 2px 14px)}
.gr-lvl .orb{width:60px;height:60px;border-radius:50%;background:radial-gradient(circle at 34% 30%,#e9d5ff,#7c3aed 62%,#4c1d95);border:3px solid #e9d5ff;display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:1.5rem;flex:none;box-shadow:0 6px 16px -6px rgba(0,0,0,.5)}
.gr-lvl b{font-family:var(--display);font-size:1.5rem;font-weight:400;display:block;line-height:1.2}
.gr-lvl span{font-size:.76rem;opacity:.94;font-weight:700}
.gr-xpbar{height:9px;border-radius:99px;background:rgba(255,255,255,.28);overflow:hidden;margin-top:7px}
.gr-xpbar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#fde68a,#fbbf24);transition:width .6s}
.gr-toolbar{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
.gr-toolbar .input,.gr-toolbar .select{width:auto}
.gr-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.gr-card{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:17px;padding:15px 16px;box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s;overflow:hidden;display:flex;flex-direction:column}
.gr-card::before{content:'';position:absolute;top:0;bottom:0;right:0;width:5px;background:var(--kc,var(--lapis))}
.gr-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg)}
.gr-card>*{position:relative;z-index:2}
.gr-card.done{border-color:color-mix(in srgb,var(--leaf) 45%,var(--line));background:color-mix(in srgb,var(--leaf) 6%,var(--surface))}
.gr-ico{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.35rem;flex:none;background:color-mix(in srgb,var(--kc) 15%,var(--surface));border:1.5px solid color-mix(in srgb,var(--kc) 30%,transparent)}
.gr-name{font-weight:800;font-size:.93rem;line-height:1.55}
.gr-pill{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:800;padding:3px 10px;border-radius:99px;background:color-mix(in srgb,var(--pc) 13%,var(--surface));color:var(--pc);border:1px solid color-mix(in srgb,var(--pc) 32%,transparent)}
.gr-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.gr-prog{height:10px;border-radius:99px;background:var(--surface2);border:1px solid var(--line);overflow:hidden;margin-top:10px}
.gr-prog i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--kc),color-mix(in srgb,var(--kc) 55%,#fff));transition:width .5s}
.gr-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;border-top:1px dashed var(--line);padding-top:10px;margin-top:auto}
.gr-note{font-size:.78rem;color:var(--muted);background:var(--surface2);border:1px dashed var(--line);border-radius:11px;padding:8px 10px;margin-top:9px;line-height:1.8}
.gr-row{display:flex;align-items:center;gap:11px;padding:11px 13px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.gr-row:last-child{border-bottom:none}
.gr-row .n{font-weight:700;font-size:.87rem;flex:1;min-width:150px}
.gr-scroll{max-height:62vh;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--flame) var(--surface2)}
.gr-scroll::-webkit-scrollbar{width:11px;height:11px}
.gr-scroll::-webkit-scrollbar-track{background:color-mix(in srgb,var(--rule) 55%,var(--surface2));border-radius:99px}
.gr-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--flame),var(--grape));border-radius:99px;border:3px solid var(--surface2)}
/* streak */
.gr-sk{display:grid;gap:13px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.gr-flame{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px;text-align:center;overflow:hidden;box-shadow:var(--shadow);transition:transform .2s}
.gr-flame:hover{transform:translateY(-3px)}
.gr-flame.hot{border-color:color-mix(in srgb,var(--sc) 50%,var(--line));background:linear-gradient(180deg,color-mix(in srgb,var(--sc) 10%,var(--surface)),var(--surface))}
.gr-flame .em{font-size:2.4rem;line-height:1;display:block;filter:drop-shadow(0 4px 10px color-mix(in srgb,var(--sc) 55%,transparent))}
.gr-flame.hot .em{animation:grFlick 1.6s ease-in-out infinite}
@keyframes grFlick{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.12) rotate(3deg)}}
.gr-flame .num{font-family:var(--display);font-size:2.5rem;line-height:1.1;color:var(--sc)}
.gr-flame .lbl{font-weight:800;font-size:.86rem}
.gr-flame .best{font-size:.72rem;color:var(--muted);margin-top:4px}
.gr-dots{display:flex;gap:3px;justify-content:center;margin-top:9px;flex-wrap:wrap}
.gr-dots i{width:11px;height:11px;border-radius:4px;background:var(--surface2);border:1px solid var(--line)}
.gr-dots i.on{background:var(--sc);border-color:transparent}
.gr-dots i.fz{background:var(--sky);border-color:transparent}
/* box */
.gr-box{position:relative;border-radius:22px;padding:22px;text-align:center;overflow:hidden;border:1.5px solid color-mix(in srgb,var(--gold) 35%,var(--line));
background:radial-gradient(110% 130% at 50% -10%,color-mix(in srgb,var(--flame2) 32%,transparent),transparent 60%),linear-gradient(135deg,color-mix(in srgb,var(--gold) 14%,var(--paper)),color-mix(in srgb,var(--grape) 12%,var(--paper)))}
.gr-reel{width:132px;height:132px;margin:0 auto 14px;border-radius:26px;background:var(--surface);border:3px solid color-mix(in srgb,var(--gold) 45%,var(--line));display:flex;align-items:center;justify-content:center;font-size:3.6rem;box-shadow:0 14px 34px -14px rgba(0,0,0,.4),inset 0 -6px 14px rgba(0,0,0,.07);position:relative;overflow:hidden}
.gr-reel.spin{animation:grShake .12s linear infinite}
@keyframes grShake{0%{transform:translateY(-2px) rotate(-1deg)}50%{transform:translateY(2px) rotate(1deg)}100%{transform:translateY(-2px) rotate(-1deg)}}
.gr-reel.win{animation:grPop .6s cubic-bezier(.2,.9,.2,1)}
@keyframes grPop{0%{transform:scale(.7)}55%{transform:scale(1.14)}100%{transform:scale(1)}}
.gr-prize{border-radius:16px;padding:14px;margin-top:12px;border:2px solid var(--rc);background:color-mix(in srgb,var(--rc) 10%,var(--surface));position:relative;overflow:hidden}
.gr-prize.legend{box-shadow:0 0 0 3px color-mix(in srgb,var(--rc) 25%,transparent),0 14px 34px -14px var(--rc)}
.gr-prize .shine{position:absolute;inset:0;background:linear-gradient(115deg,transparent 42%,rgba(255,255,255,.4) 50%,transparent 58%);transform:translateX(-120%);animation:grShine 2.6s ease-in-out infinite}
@keyframes grShine{0%,65%{transform:translateX(-120%)}88%{transform:translateX(120%)}100%{transform:translateX(120%)}}
.gr-conf{position:fixed;z-index:140;pointer-events:none;width:9px;height:14px;border-radius:2px}
/* mood */
.gr-moods{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.gr-mood{border:2px solid var(--line);background:var(--overlay);border-radius:16px;padding:11px 14px;min-width:74px;transition:all .18s;display:flex;flex-direction:column;align-items:center;gap:4px}
.gr-mood span{font-size:1.7rem;line-height:1}
.gr-mood small{font-size:.7rem;font-weight:800;color:var(--muted)}
.gr-mood:hover{transform:translateY(-3px);border-color:var(--mc)}
.gr-mood.on{border-color:transparent;background:linear-gradient(135deg,var(--mc),color-mix(in srgb,var(--mc) 60%,#000));color:#fff}
.gr-mood.on small{color:#fff}
.gr-heat{display:grid;gap:3px;overflow-x:auto;padding-bottom:6px}
.gr-heat .hc{aspect-ratio:1;min-width:17px;border-radius:5px;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:.66rem}
.gr-heat .hh{font-size:.6rem;color:var(--muted);font-weight:800;text-align:center}
.gr-heat .hn{font-size:.72rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:5px}
.gr-chips{display:flex;gap:7px;flex-wrap:wrap}
.gr-chip{border:1.5px solid var(--line);background:var(--overlay);border-radius:99px;padding:7px 14px;font-size:.8rem;font-weight:800;color:var(--muted);transition:all .16s}
.gr-chip:hover{transform:translateY(-1px);border-color:var(--cc,var(--flame))}
.gr-chip.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,var(--cc,var(--flame)),color-mix(in srgb,var(--cc,var(--flame)) 60%,#000))}
.gr-step{display:inline-flex;align-items:center;border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:var(--overlay)}
.gr-step button{border:none;background:var(--surface2);width:34px;height:36px;font-size:1.05rem;font-weight:800;color:var(--ink)}
.gr-step b{min-width:46px;text-align:center;font-family:var(--display);font-size:1.1rem;font-weight:400}
.gr-flag{display:flex;gap:10px;padding:10px 12px;border-radius:13px;background:color-mix(in srgb,var(--rose) 7%,var(--surface));border:1px solid color-mix(in srgb,var(--rose) 32%,var(--line));margin-bottom:8px;font-size:.84rem}
@media (max-width:960px){
.gr-hero{padding:18px 16px}.gr-hero h1{font-size:1.5rem}
.gr-lvl{min-width:0;width:100%}
.gr-toolbar .input,.gr-toolbar .select{width:100%}
.gr-grid{grid-template-columns:1fr}
.gr-sk{grid-template-columns:repeat(2,1fr)}
.gr-row .n{min-width:100%;order:-1}
}
@media (max-width:420px){.gr-sk{grid-template-columns:1fr}.gr-mood{min-width:62px;padding:9px 10px}}
`;
const st0 = document.createElement('style'); st0.id = 'grStyles'; st0.textContent = CSS; document.head.appendChild(st0);

/* ================= state ================= */
const R = {
  tab: 'today', q: '', kind: 'all', scope: 'all',
  tTab: 'over', tq: '', tkind: 'all',
  bTab: 'pairs',bsub: '', myBox: null, spinning: false,
  mood: 3, energy: 3, draft: null, buddyDraft: null, goalDraft: null, imp: null
};
const gr = () => (S() && S().growth) || { settings: C.grSettingsDefault(), quests: [], claims: [], boxes: [], spins: {}, freezes: {}, vouchers: {}, buddies: [], helps: [], checkins: [], goals: [], ledger: [], milestones: [], acts: [], marks: [] };
const sid = () => (SESS && SESS.sid) || '';
const today = () => todayISO();
const myXP = () => grXp(S(), sid());
const myLvl = () => grLevel(myXP());
const mySK = () => grStreaks(S(), sid());
const mySpin = () => grSpins(S(), sid());
const myFreeze = () => grFreezeCount(S(), sid());
const myVoucher = () => grVouchers(S(), sid());
const checkinToday = () => (gr().checkins || []).find(c => c.sid === sid() && c.date === today());
const goalWeek = () => (gr().goals || []).find(x => x.sid === sid() && x.week === grWeekKey(today()));
const buddyName = id => { const s = stuById(S(), id); return s ? s.name : '—'; };
const pill = (t, c, i) => `<span class="gr-pill" style="--pc:${c}">${i || ''} ${esc(t)}</span>`;
const moodOf = n => MOODS[clamp(n, 1, 5) - 1];

function confetti(x, y, n) {
  const cols = ['#f59e0b', '#e11d48', '#7c3aed', '#0d9488', '#1d4ed8', '#65a30d', '#fbbf24'];
  for (let i = 0; i < (n || 26); i++) {
    const el = document.createElement('div'); el.className = 'gr-conf';
    el.style.background = cols[i % cols.length]; el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.appendChild(el);
    const a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 150;
    el.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 120}px)) rotate(${540 + Math.random() * 540}deg)`, opacity: 0 }],
      { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => el.remove();
  }
}
function levelCard() {
  const l = myLvl();
  return `<div class="gr-lvl"><span class="orb">${fa(l.level)}</span>
    <div style="flex:1;position:relative;z-index:2"><span>${esc(grRank(l.level))} • سطح ${fa(l.level)}</span>
      <b>${fa(l.xp)} تجربه</b>
      <div class="gr-xpbar"><i style="width:${l.pct}%"></i></div>
      <span>${fa(l.into)} از ${fa(l.need)} تا سطح بعد</span></div></div>`;
}

/* ================= student: today ================= */
function questCard(q, i) {
  const st = S(), p = grProgress(st, q, sid(), today()), cl = grClaimOf(st, q.id, sid(), today());
  const done = p >= q.n, k = QK[q.kind] || QK.manual, pct = clamp(p / q.n * 100, 0, 100);
  return `<div class="gr-card ${cl && cl.status === 'approved' ? 'done' : ''}" style="--kc:${k.c};--i:${i}">
    <div class="row" style="align-items:flex-start;gap:10px"><span class="gr-ico">${q.icon || k.i}</span>
      <div style="flex:1;min-width:0"><div class="gr-name">${esc(q.title)}</div>
        <div class="gr-meta">${pill(k.l, k.c)}${q.auto ? '<span class="chip">🔄 روزانه</span>' : `<span class="chip">🗓️ ${jShort(q.from)} تا ${jShort(q.to)}</span>`}${q.points ? `<span class="chip" style="color:#d97706">🪙 ${fa(q.points)}</span>` : ''}${q.xp ? `<span class="chip" style="color:#7c3aed">⚡ ${fa(q.xp)}</span>` : ''}</div></div>
      ${cl ? pill(cl.status === 'approved' ? 'گرفته شد' : cl.status === 'pending' ? 'در انتظار' : 'رد شد', cl.status === 'approved' ? '#16a34a' : cl.status === 'pending' ? '#f59e0b' : '#e11d48', cl.status === 'approved' ? '✅' : cl.status === 'pending' ? '⏳' : '✖️') : ''}</div>
    <div class="gr-prog"><i style="width:${pct}%"></i></div>
    <div class="gr-foot"><span class="small bold" style="color:${k.c}">${fa(Math.min(p, q.n))} از ${fa(q.n)}</span>
      ${cl ? (cl.status === 'approved' ? '<span class="chip" style="color:#16a34a">🎉 پاداش دریافت شد</span>' : cl.status === 'pending' ? '<span class="chip">👨‍🏫 منتظر معلم</span>' : '<span class="chip">—</span>')
        : `<button type="button" class="btn ${done ? 'ok' : 'ghost'} sm" data-act="grClaim" data-id="${q.id}" ${done ? '' : 'disabled'}>${done ? '🎁 دریافت پاداش' : `🔒 ${fa(q.n - p)} مورد مانده`}</button>`}</div></div>`;
}
function streakCard(kind, s, i) {
  const m = SK[kind], hot = s.cur > 0, fz = C.grFreezeUsed(S(), sid());
  const dots = Array.from({ length: 7 }, (_, k) => `<i class="${k < Math.min(s.cur, 7) ? 'on' : ''}"></i>`).join('');
  return `<div class="gr-flame ${hot ? 'hot' : ''}" style="--sc:${m.c};--i:${i}">
    <span class="em">${hot ? '🔥' : m.i}</span>
    <div class="num">${fa(s.cur)}</div><div class="lbl">${m.l} پیاپی</div>
    <div class="gr-dots">${dots}</div>
    <div class="best">🏆 رکورد: ${fa(s.best)} روز</div>
    <div class="small muted" style="margin-top:5px">${m.d}</div></div>`;
}
function todayTab() {
  const st = S(), qs = grQuestsFor(st, sid(), today()), ci = checkinToday(), gl = goalWeek();
  const sk = mySK(), spin = mySpin();
  const ready = qs.filter(q => grProgress(st, q, sid(), today()) >= q.n && !grClaimOf(st, q.id, sid(), today())).length;
  return `${ready ? `<div class="card mb" style="border-color:var(--leaf);background:color-mix(in srgb,var(--leaf) 7%,var(--surface))"><div class="spread"><b class="small">🎁 ${fa(ready)} پاداش آمادهٔ دریافت داری!</b><button type="button" class="btn ok sm" data-act="grClaimAll">دریافت همه</button></div></div>` : ''}
  <div class="grid g2 mb" style="align-items:start">
    <div class="card"><div class="spread mb"><h3>🎯 چالش‌های امروز</h3><span class="chip acc">${fa(qs.length)} چالش</span></div>
      ${qs.length ? `<div class="gr-grid" style="grid-template-columns:1fr">${qs.map((q, i) => questCard(q, i)).join('')}</div>` : empty('🎯', 'چالشی نیست', 'معلم به‌زودی چالش تازه می‌گذارد.')}</div>
    <div>
      <div class="card mb"><div class="spread mb"><h3>🪞 آینهٔ امروز</h3>${ci ? pill('ثبت شد', '#16a34a', '✅') : pill('ثبت نشده', '#f59e0b', '⏳')}</div>
        ${ci ? `<div class="row mb"><span style="font-size:2rem">${moodOf(ci.mood).e}</span><div><b class="small">حال: ${esc(moodOf(ci.mood).l)}</b><div class="small muted">انرژی: ${'⚡'.repeat(ci.energy)}</div></div></div>
          ${ci.learned ? `<div class="gr-note">📚 ${esc(ci.learned)}</div>` : ''}${ci.hard ? `<div class="gr-note">🧗 ${esc(ci.hard)}</div>` : ''}${ci.grateful ? `<div class="gr-note">🙏 ${esc(ci.grateful)}</div>` : ''}
          <button type="button" class="btn soft sm mt" data-act="grCheckin">✏️ ویرایش</button>`
        : `<p class="small muted mb">حالت چطور است؟ یک دقیقه وقت بگذار و برای خودت بنویس.</p><button type="button" class="btn" data-act="grCheckin">🪞 ثبت احوال‌پرسی امروز</button>`}</div>
      <div class="card mb"><div class="spread mb"><h3>🎯 هدف این هفته</h3>${gl && gl.review ? pill('بازبینی شد', '#16a34a', '✅') : gl ? pill('در جریان', '#1d4ed8', '🔄') : pill('تعیین نشده', '#f59e0b', '⏳')}</div>
        ${gl ? `<div class="gr-note">${esc(gl.text)}${gl.metric ? ` • سنجه: ${esc(gl.metric)}` : ''}</div>
          ${gl.teacherNote ? `<div class="gr-note">👨‍🏫 ${esc(gl.teacherNote)}</div>` : ''}
          <div class="row mt"><button type="button" class="btn soft sm" data-act="grGoal">✏️ ویرایش</button>${!gl.review ? `<button type="button" class="btn ok sm" data-act="grGoalDone" data-id="${gl.id}">✅ محقق شد</button>` : ''}</div>`
        : `<p class="small muted mb">یک هدف کوچک و مشخص برای این هفته بنویس.</p><button type="button" class="btn" data-act="grGoal">🎯 تعیین هدف هفته</button>`}</div>
      <div class="card"><div class="spread mb"><h3>🎰 جعبهٔ شانس</h3><span class="chip acc">${fa(spin)} چرخش</span></div>
        <p class="small muted mb">با تکلیف، چالش و آزمون چرخش بگیر و جایزهٔ شانسی ببر!</p>
        <button type="button" class="btn ${spin > 0 ? 'warn' : 'ghost'}" data-act="grGoBox" ${spin > 0 ? '' : 'disabled'}>${spin > 0 ? '🎰 باز کردن جعبه' : '🔒 چرخش نداری'}</button></div>
    </div></div>
  <h3 class="mb">🔥 زنجیره‌های من</h3>
  <div class="gr-sk stagger mb">${Object.keys(SK).map((k, i) => streakCard(k, sk[k], i)).join('')}</div>
  <div class="card"><div class="spread"><div class="row"><span class="chip">🧊 فریز: ${fa(myFreeze())}</span><span class="chip">🎴 معافیت: ${fa(myVoucher())}</span></div>
    <div class="row"><button type="button" class="btn soft sm" data-act="grFreezeBuy">🧊 خرید فریز (${fa(gr().settings.freezeCost)} امتیاز)</button>
      <button type="button" class="btn ghost sm" data-act="grFreezeUse">🛡️ استفاده روی یک روز</button></div></div></div>`;
}
function boxTab() {
  const boxes = (gr().boxes || []).slice().reverse().slice(0, 20), spin = mySpin();
  const p = R.myBox;
  return `<div class="grid g2" style="align-items:start">
    <div class="gr-box"><h3 style="font-family:var(--display);font-weight:400;font-size:1.4rem">🎰 جعبهٔ شانس کلاس</h3>
      <p class="small muted mb">هر چرخش یک جایزهٔ شانسی دارد — از معمولی تا افسانه‌ای!</p>
      <div class="gr-reel ${R.spinning ? 'spin' : p ? 'win' : ''}" id="grReel">${R.spinning ? '🎲' : p ? p.i : '🎁'}</div>
      ${p && !R.spinning ? `<div class="gr-prize ${p.r}" style="--rc:${RAR[p.r].c}"><span class="shine"></span>
        <div style="position:relative;z-index:2"><b style="font-size:1.05rem">${p.i} ${esc(p.l)}</b>
        <div class="row mt" style="justify-content:center">${pill(RAR[p.r].l, RAR[p.r].c, '✨')}</div></div></div>` : ''}
      <div class="row mt" style="justify-content:center"><span class="chip acc">🎰 ${fa(spin)} چرخش</span></div>
      <button type="button" class="btn lg warn mt" style="width:100%" data-act="grSpin" ${spin > 0 && !R.spinning ? '' : 'disabled'}>${R.spinning ? '⏳ در حال چرخش…' : spin > 0 ? '🎰 بچرخان!' : '🔒 چرخش نداری'}</button>
      <p class="small muted mt">چرخش از: تکلیف تأییدشده • چالش • آزمون • زنجیرهٔ ۵ روز به بالا</p></div>
    <div class="card" style="padding:5px 0"><div style="padding:12px 15px" class="spread"><h3>📜 جایزه‌های من</h3><span class="chip">${fa(boxes.length)}</span></div>
      <div class="gr-scroll">${boxes.length ? boxes.map(b => `<div class="gr-row"><span class="gr-ico" style="--kc:${RAR[b.prize.r].c}">${b.prize.i}</span>
        <div class="n">${esc(b.prize.l)}<div class="small muted">${jShort(iranISO(new Date(b.at)))}</div></div>${pill(RAR[b.prize.r].l, RAR[b.prize.r].c)}</div>`).join('') : empty('🎁', 'جعبه‌ای باز نکرده‌ای', '')}</div></div></div>`;
}
function buddyTab() {
  const st = S(), bs = C.grBuddyOf(st, sid()), helps = (gr().helps || []).slice().reverse();
  const asMentor = bs.filter(b => b.mentor === sid()), asMentee = bs.filter(b => b.mentee === sid());
  return `<div class="grid g2 mb" style="align-items:start">
    <div class="card"><h3 class="mb">🤝 من راهنما هستم (${fa(asMentor.length)})</h3>
      ${asMentor.length ? asMentor.map(b => { const e = C.grBuddyEffect(st, b); return `<div class="gr-card mb" style="--kc:#0d9488"><div class="row">${avHTML(stuById(st, b.mentee), 'sm')}<div style="flex:1"><b class="small">${esc(buddyName(b.mentee))}</b><div class="small muted">درس: ${esc(b.subject)}</div></div></div>
        ${e ? `<div class="gr-note">📈 اثر کمک: ${faNum(e.before)} ← ${faNum(e.after)} (${e.delta >= 0 ? '+' : ''}${faNum(e.delta)})</div>` : ''}
        <button type="button" class="btn sm mt" data-act="grHelpLog" data-id="${b.id}">📝 ثبت کمک امروز</button></div>`; }).join('') : empty('🤝', 'هم‌یاری نداری', 'معلم برایت هم‌یار تعیین می‌کند.')}</div>
    <div class="card"><h3 class="mb">🌱 راهنمای من (${fa(asMentee.length)})</h3>
      ${asMentee.length ? asMentee.map(b => `<div class="gr-card mb" style="--kc:#1d4ed8"><div class="row">${avHTML(stuById(st, b.mentor), 'sm')}<div style="flex:1"><b class="small">${esc(buddyName(b.mentor))}</b><div class="small muted">درس: ${esc(b.subject)}</div></div></div></div>`).join('') : empty('🌱', 'راهنمایی نداری', '')}
      <div class="divider"></div><h3 class="mb">✅ کمک‌هایی که باید تأیید کنی</h3>
      ${(gr().helps || []).filter(h => h.sid === sid() && !h.confirmed && h.status === 'pending').map(h => `<div class="gr-row"><div class="n">${esc(buddyName(h.by))} — ${esc(h.topic)}<div class="small muted">${jShort(h.date)} • ${fa(h.minutes)} دقیقه</div></div>
        <button type="button" class="btn ok sm" data-act="grHelpConfirm" data-id="${h.id}">✅ تأیید می‌کنم</button></div>`).join('') || '<p class="small muted">موردی نیست.</p>'}</div></div>
  <div class="card" style="padding:5px 0"><div style="padding:12px 15px"><h3>📜 دفتر کمک‌ها</h3></div><div class="gr-scroll">
    ${helps.length ? helps.map(h => `<div class="gr-row"><span class="gr-ico" style="--kc:${h.status === 'approved' ? '#16a34a' : h.status === 'rejected' ? '#e11d48' : '#f59e0b'}">${h.by === sid() ? '🤝' : '🌱'}</span>
      <div class="n">${esc(h.topic)}<div class="small muted">${h.by === sid() ? 'به ' + esc(buddyName(h.sid)) : 'از ' + esc(buddyName(h.by))} • ${jShort(h.date)}${h.note ? ' • ' + esc(h.note) : ''}</div></div>
      ${pill(h.status === 'approved' ? 'تأیید' : h.status === 'rejected' ? 'رد' : 'در انتظار', h.status === 'approved' ? '#16a34a' : h.status === 'rejected' ? '#e11d48' : '#f59e0b')}
      ${h.confirmed ? '<span class="chip" style="color:#16a34a">✅ هم‌یار تأیید کرد</span>' : ''}</div>`).join('') : empty('📭', 'ثبتی نیست', '')}</div></div>`;
}
function mirrorTab() {
  const cs = (gr().checkins || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const gs = (gr().goals || []).slice().sort((a, b) => b.week.localeCompare(a.week));
  const days = grLastDays(14), map = {}; cs.forEach(c => map[c.date] = c);
  const avg = cs.length ? mean(cs.slice(0, 14).map(c => c.mood)) : 0;
  return `<div class="grid g2 mb" style="align-items:start">
    <div class="card"><div class="spread mb"><h3>📈 حال من در ۱۴ روز</h3>${cs.length ? pill('میانگین ' + faNum(avg), moodOf(Math.round(avg)).c, moodOf(Math.round(avg)).e) : ''}</div>
      <div class="gr-heat" style="grid-template-columns:repeat(14,1fr)">${days.map(d => { const c = map[d]; const m = c ? moodOf(c.mood) : null; return `<span class="hc" style="${m ? `background:${tint(m.c, .2)};border-color:${tint(m.c, .45)}` : ''}" title="${jLabel(d)}${c ? ' — ' + m.l : ''}">${m ? m.e : '·'}</span>`; }).join('')}</div>
      <div class="row mt" style="justify-content:center">${days.map(d => `<span class="hh" style="flex:1;font-size:.58rem">${fa(jOf(d).jd)}</span>`).join('')}</div>
      <div class="divider"></div><button type="button" class="btn" data-act="grCheckin">🪞 ثبت / ویرایش امروز</button></div>
    <div class="card"><h3 class="mb">🎯 هدف‌های هفته‌های من</h3>
      ${gs.length ? gs.map(g2 => `<div class="gr-card mb" style="--kc:${g2.review ? (g2.review.status === 'done' ? '#16a34a' : '#f59e0b') : '#1d4ed8'}">
        <div class="spread"><b class="small">${esc(g2.text)}</b>${g2.review ? pill(g2.review.status === 'done' ? 'محقق شد' : g2.review.status === 'partial' ? 'نیمه‌کاره' : 'نشد', g2.review.status === 'done' ? '#16a34a' : '#f59e0b') : pill('در جریان', '#1d4ed8')}</div>
        <div class="small muted mt">هفتهٔ ${jShort(g2.week)}${g2.metric ? ' • ' + esc(g2.metric) : ''}</div>
        ${g2.teacherNote ? `<div class="gr-note">👨‍🏫 ${esc(g2.teacherNote)}</div>` : ''}
        ${!g2.review ? `<div class="row mt"><button type="button" class="btn ok sm" data-act="grGoalDone" data-id="${g2.id}">✅ شد</button><button type="button" class="btn warn sm" data-act="grGoalPart" data-id="${g2.id}">🌗 نیمه</button><button type="button" class="btn ghost sm" data-act="grGoalMiss" data-id="${g2.id}">✖️ نشد</button></div>` : ''}</div>`).join('') : empty('🎯', 'هدفی ثبت نشده', '')}</div></div>
  <div class="card" style="padding:5px 0"><div style="padding:12px 15px"><h3>📜 دفترچهٔ آینه (${fa(cs.length)})</h3></div><div class="gr-scroll">
    ${cs.map(c => `<div class="gr-row"><span style="font-size:1.5rem">${moodOf(c.mood).e}</span>
      <div class="n"><b class="small">${jLabel(c.date)}</b>
        ${c.learned ? `<div class="small muted">📚 ${esc(c.learned)}</div>` : ''}
        ${c.hard ? `<div class="small muted">🧗 ${esc(c.hard)}</div>` : ''}
        ${c.grateful ? `<div class="small muted">🙏 ${esc(c.grateful)}</div>` : ''}</div>
      <span class="chip">${'⚡'.repeat(c.energy)}</span></div>`).join('') || empty('🪞', 'ثبتی نیست', '')}</div></div>`;
}
function studentView() {
  const l = myLvl(), sk = mySK(), spin = mySpin();
  const tabs = [['today', '🎯 امروز'], ['box', '🎰 جعبه شانس', spin], ['streak', '🔥 زنجیره‌ها'], ['buddy', '🤝 هم‌یار'], ['mirror', '🪞 آینه من']];
  const body = R.tab === 'box' ? boxTab() : R.tab === 'streak' ? `<div class="gr-sk stagger mb">${Object.keys(SK).map((k, i) => streakCard(k, sk[k], i)).join('')}</div>
      <div class="card"><div class="spread"><div class="row"><span class="chip">🧊 فریز: ${fa(myFreeze())}</span><span class="chip">🎴 معافیت: ${fa(myVoucher())}</span></div>
      <div class="row"><button type="button" class="btn soft sm" data-act="grFreezeBuy">🧊 خرید فریز</button><button type="button" class="btn ghost sm" data-act="grFreezeUse">🛡️ استفاده</button></div></div>
      <p class="small muted mt">فریز یک روز غیبت را می‌پوشاند تا زنجیره‌ات نشکند. جایزهٔ کمیاب جعبه هم می‌تواند فریز بدهد.</p></div>`
    : R.tab === 'buddy' ? buddyTab() : R.tab === 'mirror' ? mirrorTab() : todayTab();
  return `<div class="gr">
    <div class="gr-hero"><div class="spread"><div>
      <h1>🌱 رشد من</h1><p>هر روز یک قدم کوچک؛ زنجیره بساز، چالش ببر، جایزه بگیر و رشد خودت را ببین.</p>
      <div class="gr-quick"><span class="q">🔥 <b>${fa(sk.att.cur)}</b> حضور</span><span class="q">📚 <b>${fa(sk.hw.cur)}</b> تکلیف</span><span class="q">🛡️ <b>${fa(sk.clean.cur)}</b> انضباط</span><span class="q">🪞 <b>${fa(sk.mirror.cur)}</b> آینه</span><span class="q">🎰 <b>${fa(spin)}</b> چرخش</span></div></div>
      ${levelCard()}</div></div>
    <div class="tabs">${tabs.map(([k, l2, n]) => `<button type="button" class="${R.tab === k ? 'on' : ''}" data-act="grTab" data-tab="${k}">${l2}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="grBody">${body}</div></div>`;
}

/* ================= teacher ================= */
function tOver() {
  const st = S(), cl = C.grClass(st);
  const pendQ = (gr().claims || []).filter(c => c.status === 'pending').length;
  const pendH = (gr().helps || []).filter(h => h.status === 'pending').length;
  const avgMood = cl.moods.filter(x => x != null);
  return `<div class="grid g4 stagger mb">
    <div class="card stat" style="--i:0"><span class="si" style="background:linear-gradient(135deg,#f97316,#fbbf24)">🔥</span><div><b>${fa(cl.per.reduce((a, p) => a + p.streaks.att.cur, 0))}</b><span>مجموع زنجیرهٔ حضور</span></div></div>
    <div class="card stat" style="--i:1"><span class="si" style="background:linear-gradient(135deg,#16a34a,#65a30d)">🎯</span><div><b>${fa(cl.approved.length)}</b><span>چالش انجام‌شده</span></div></div>
    <div class="card stat" style="--i:2"><span class="si" style="background:linear-gradient(135deg,#7c3aed,#0ea5e9)">🎰</span><div><b>${fa(cl.boxes.length)}</b><span>جعبهٔ باز شده</span></div></div>
    <div class="card stat" style="--i:3"><span class="si" style="background:linear-gradient(135deg,#e11d48,#f97316)">🚩</span><div><b>${fa(cl.flags.length)}</b><span>پرچم پیگیری</span></div></div></div>
  ${pendQ || pendH ? `<div class="card mb" style="border-color:var(--acc)"><div class="spread"><b class="small">📥 ${fa(pendQ)} چالش و ${fa(pendH)} کمک در انتظار تأیید</b>
    <div class="row">${pendQ ? `<button type="button" class="btn sm soft" data-act="grTTab" data-tab="quests">بررسی چالش‌ها</button>` : ''}${pendH ? `<button type="button" class="btn sm soft" data-act="grTTab" data-tab="buddy">بررسی کمک‌ها</button>` : ''}</div></div></div>` : ''}
  <div class="grid g2 mb">
    <div class="card"><div class="spread mb"><h3>📈 حال کلاس (۱۴ روز)</h3>${avgMood.length ? pill('میانگین ' + faNum(mean(avgMood)), moodOf(Math.round(mean(avgMood))).c, moodOf(Math.round(mean(avgMood))).e) : ''}</div>
      ${lineChart(cl.moods.map(v => v == null ? 0 : v / 5 * 100), cl.days.map(d => fa(jOf(d).jd)), { color: 'var(--grape)' })}
      <p class="small muted mt">🔒 حال دانش‌آموزان فقط برای معلم دیده می‌شود.</p></div>
    <div class="card"><h3 class="mb">🚩 پرچم‌های خصوصی</h3>
      ${cl.flags.length ? cl.flags.map(f => `<div class="gr-flag"><span>${f.kind === 'mood' ? '💙' : '🔥'}</span><div style="flex:1"><b class="small">${esc(f.name)}</b><div class="small muted">${esc(f.text)}</div></div>
        <button type="button" class="btn ghost sm" data-act="grStuSheet" data-id="${f.sid}">🖨️</button></div>`).join('') : empty('🌿', 'پرچمی نیست', 'همه در مسیرند.')}</div></div>
  <div class="grid g2">
    <div class="card"><h3 class="mb">⚡ بیشترین تجربه</h3>${cl.topXp.map((p, i) => `<div class="gr-row" style="padding:8px 0"><span style="width:22px">${['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅'][i]}</span>${avHTML(p, 'sm')}<span class="n">${esc(p.name)}</span><span class="chip" style="color:#7c3aed">سطح ${fa(p.level)}</span><span class="chip">⚡ ${fa(p.xp)}</span></div>`).join('')}</div>
    <div class="card"><h3 class="mb">🔥 بلندترین زنجیره‌ها</h3>${cl.topStreak.map(p => `<div class="gr-row" style="padding:8px 0">${avHTML(p, 'sm')}<span class="n">${esc(p.name)}</span>
      ${Object.keys(SK).map(k => `<span class="chip" style="color:${SK[k].c}">${SK[k].i} ${fa(p.streaks[k].cur)}</span>`).join('')}</div>`).join('')}</div></div>`;
}
function tQuests() {
  const st = S(), qs = gr().quests || [], cl = gr().claims || [];
  let list = qs.slice();
  const q = norm(R.tq); if (q) list = list.filter(x => norm(x.title).includes(q));
  if (R.tkind !== 'all') list = list.filter(x => x.kind === R.tkind);
  const pend = cl.filter(c => c.status === 'pending');
  return `<div class="card mb"><div class="gr-toolbar">
    <input class="input" style="max-width:210px" placeholder="🔍 جستجوی چالش…" value="${esc(R.tq)}" data-inp="grTQ">
    <select class="select" style="max-width:180px" data-chg="grTKind"><option value="all">همهٔ انواع</option>${Object.entries(QK).map(([k, v]) => `<option value="${k}" ${R.tkind === k ? 'selected' : ''}>${v.i} ${v.l}</option>`).join('')}</select>
    <button type="button" class="btn sm" data-act="grQNew">➕ چالش جدید</button>
    <button type="button" class="btn sm ai" data-act="grSync">🔄 ارزیابی زنجیره‌ها</button>
    <button type="button" class="btn sm soft" data-act="grCsv" data-kind="quests">📤 CSV</button></div></div>
  ${pend.length ? `<div class="card mb" style="padding:5px 0"><div style="padding:11px 15px" class="spread"><h3>📥 در انتظار تأیید (${fa(pend.length)})</h3><button type="button" class="btn ok sm" data-act="grQApproveAll">✅ تأیید همه</button></div>
    <div class="gr-scroll">${pend.map(c => `<div class="gr-row">${avHTML(stuById(st, c.sid), 'sm')}<div class="n"><b>${esc(buddyName(c.sid))}</b> — ${c.icon} ${esc(c.title)}<div class="small muted">${jShort(c.date)}</div></div>
      <span class="chip" style="color:#d97706">🪙 ${fa(c.points)}</span><span class="chip" style="color:#7c3aed">⚡ ${fa(c.xp)}</span>
      <button type="button" class="btn ok sm" data-act="grQOk" data-id="${c.id}">✅</button><button type="button" class="btn warn sm" data-act="grQNo" data-id="${c.id}">✖️</button></div>`).join('')}</div></div>` : ''}
  <div class="gr-grid stagger">${list.map((x, i) => { const k = QK[x.kind] || QK.manual; const done = cl.filter(c => c.qid === x.id && c.status === 'approved').length; return `<div class="gr-card" style="--kc:${k.c};--i:${i}">
    <div class="row" style="align-items:flex-start;gap:10px"><span class="gr-ico">${x.icon || k.i}</span><div style="flex:1"><div class="gr-name">${esc(x.title)}</div>
      <div class="gr-meta">${pill(k.l, k.c)}<span class="chip">${x.scope === 'all' ? '👥 کل کلاس' : x.scope === 'group' ? '🧩 ' + esc(((st.groups || []).find(g2 => g2.id === x.targetId) || {}).name || '') : '👦 ' + esc(buddyName(x.targetId))}</span>
      <span class="chip">🎯 ${fa(x.n)} بار</span><span class="chip" style="color:#d97706">🪙 ${fa(x.points)}</span><span class="chip" style="color:#7c3aed">⚡ ${fa(x.xp)}</span>${x.active === false ? pill('خاموش', '#7b7261') : pill('فعال', '#16a34a')}</div></div></div>
    <div class="small muted mt">🗓️ ${jShort(x.from)} تا ${jShort(x.to)}${x.daily ? ' • روزانه' : ''}</div>
    <div class="gr-foot"><span class="chip acc">✅ ${fa(done)} انجام</span><div class="row" style="gap:4px">
      <button type="button" class="ib sm" data-act="grQEdit" data-id="${x.id}">✏️</button>
      <button type="button" class="ib sm" data-act="grQToggle" data-id="${x.id}">${x.active === false ? '🟢' : '⚪'}</button>
      <button type="button" class="ib sm" data-act="grQDel" data-id="${x.id}">🗑</button></div></div></div>`; }).join('') || empty('🎯', 'چالشی نیست', 'چالش تازه بساز.')}</div>
  <div class="card mt"><h3 class="mb">🔄 چالش‌های خودکار امروز</h3><div class="gr-grid">${C.grAutoQuests(today()).map((x, i) => questCardTeacher(x, i)).join('')}</div>
    <p class="small muted mt">این سه چالش هر روز خودکار عوض می‌شوند و برای همهٔ کلاس یکسان‌اند.</p></div>`;
}
function questCardTeacher(q, i) {
  const k = QK[q.kind] || QK.manual;
  return `<div class="gr-card" style="--kc:${k.c};--i:${i}"><div class="row" style="gap:10px"><span class="gr-ico">${q.icon}</span>
    <div style="flex:1"><div class="gr-name">${esc(q.title)}</div><div class="gr-meta">${pill(k.l, k.c)}<span class="chip">🪙 ${fa(q.points)}</span><span class="chip">⚡ ${fa(q.xp)}</span></div></div></div></div>`;
}
function tStreak() {
  const cl = C.grClass(S());
  let per = cl.per.slice();
  const q = norm(R.tq); if (q) per = per.filter(p => norm(p.name).includes(q));
  const rows = per.sort((a, b) => b.streaks.att.cur - a.streaks.att.cur).map(p => `<tr>
    <td><div class="row" style="gap:7px;flex-wrap:nowrap">${avHTML(p, 'sm')}<b class="small">${esc(p.name)}</b></div></td>
    ${Object.keys(SK).map(k => `<td><b style="color:${SK[k].c}">${fa(p.streaks[k].cur)}</b><span class="small muted"> / ${fa(p.streaks[k].best)}</span></td>`).join('')}
    <td><span class="chip" style="color:#7c3aed">سطح ${fa(p.level)}</span></td><td class="small">⚡ ${fa(p.xp)}</td>
    <td class="small">🧊 ${fa(p.freeze)} • 🎰 ${fa(p.spins)} • 🎴 ${fa(p.voucher)}</td>
    <td><div class="row" style="gap:4px;flex-wrap:nowrap"><button type="button" class="ib sm" data-act="grFreezeGrant" data-id="${p.id}" title="اعطای فریز">🧊</button><button type="button" class="ib sm" data-act="grSpinGrant" data-id="${p.id}" title="اعطای چرخش">🎰</button><button type="button" class="ib sm" data-act="grStuSheet" data-id="${p.id}">🖨️</button></div></td></tr>`).join('');
  return `<div class="card mb"><div class="gr-toolbar"><input class="input" style="max-width:220px" placeholder="🔍 نام دانش‌آموز…" value="${esc(R.tq)}" data-inp="grTQ">
    <button type="button" class="btn sm soft" data-act="grCsv" data-kind="streaks">📤 CSV</button>
    <button type="button" class="btn sm soft" data-act="grClassSheet">🖨️ برگهٔ کلاس A4</button>
    <button type="button" class="btn sm ai" data-act="grSync">🔄 ارزیابی و پاداش زنجیره‌ها</button></div></div>
    <div class="tw"><table class="tbl"><thead><tr><th>دانش‌آموز</th>${Object.keys(SK).map(k => `<th>${SK[k].i} ${SK[k].l}</th>`).join('')}<th>سطح</th><th>تجربه</th><th>دارایی</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="small muted mt">عدد اول = زنجیرهٔ فعلی، عدد دوم = رکورد. پاداش زنجیره‌ها خودکار در ۳/۵/۷/۱۰/۱۴/۲۱/۳۰ روز داده می‌شود.</p>`;
}
function tBuddy() {
  const st = S(), bs = gr().buddies || [], hs = gr().helps || [];
  const pend = hs.filter(h => h.status === 'pending');
  return `<div class="card mb"><div class="gr-toolbar">
    <select class="select" style="max-width:180px" id="grBSub">${(st.subjects || []).map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select>
    <button type="button" class="btn sm ai" data-act="grBAuto">🤖 جفت‌سازی هوشمند</button>
    <button type="button" class="btn sm" data-act="grBNew">➕ جفت دستی</button>
    <button type="button" class="btn sm soft" data-act="grCsv" data-kind="buddies">📤 CSV</button></div>
    <p class="small muted mt">جفت‌سازی هوشمند: قوی‌ترین با ضعیف‌ترین در همان درس. اثر کمک بر نمرهٔ هم‌یار خودکار سنجیده می‌شود.</p></div>
  ${pend.length ? `<div class="card mb" style="padding:5px 0"><div style="padding:11px 15px" class="spread"><h3>📥 کمک‌های در انتظار (${fa(pend.length)})</h3><button type="button" class="btn ok sm" data-act="grHApproveAll">✅ تأیید همه</button></div>
    <div class="gr-scroll">${pend.map(h => `<div class="gr-row">${avHTML(stuById(st, h.by), 'sm')}<div class="n"><b>${esc(buddyName(h.by))}</b> → ${esc(buddyName(h.sid))}
      <div class="small muted">${esc(h.topic)} • ${fa(h.minutes)} دقیقه • ${jShort(h.date)}${h.note ? ' • ' + esc(h.note) : ''}</div></div>
      ${h.confirmed ? '<span class="chip" style="color:#16a34a">✅ هم‌یار تأیید کرد</span>' : '<span class="chip" style="color:#f59e0b">⏳ تأیید هم‌یار نشده</span>'}
      <button type="button" class="btn ok sm" data-act="grHOk" data-id="${h.id}">✅</button><button type="button" class="btn warn sm" data-act="grHNo" data-id="${h.id}">✖️</button></div>`).join('')}</div></div>` : ''}
  <div class="gr-grid stagger">${bs.map((b, i) => { const e = C.grBuddyEffect(st, b); const n = hs.filter(h => h.bid === b.id && h.status === 'approved').length; return `<div class="gr-card" style="--kc:${b.active === false ? '#7b7261' : '#0d9488'};--i:${i}">
    <div class="row"><span class="gr-ico">🤝</span><div style="flex:1"><b class="small">${esc(buddyName(b.mentor))} → ${esc(buddyName(b.mentee))}</b>
      <div class="gr-meta"><span class="chip">${esc(b.subject)}</span><span class="chip acc">${fa(n)} کمک</span>${b.active === false ? pill('خاموش', '#7b7261') : pill('فعال', '#16a34a')}</div></div></div>
    ${e ? `<div class="gr-note">📈 نمرهٔ هم‌یار: ${faNum(e.before)} ← ${faNum(e.after)} <b style="color:${e.delta >= 0 ? '#16a34a' : '#e11d48'}">(${e.delta >= 0 ? '+' : ''}${faNum(e.delta)})</b></div>` : '<div class="gr-note">📈 برای اثرسنجی، نمرهٔ قبل و بعد لازم است.</div>'}
    <div class="gr-foot"><span class="small muted">${jShort(iranISO(new Date(b.createdAt)))}</span><div class="row" style="gap:4px">
      <button type="button" class="ib sm" data-act="grBToggle" data-id="${b.id}">${b.active === false ? '🟢' : '⚪'}</button>
      <button type="button" class="ib sm" data-act="grBDel" data-id="${b.id}">🗑</button></div></div></div>`; }).join('') || empty('🤝', 'جفتی نیست', 'با یک دکمه جفت‌سازی کن.')}</div>`;
}
function tBox() {
  const cl = C.grClass(S()), boxes = cl.boxes.slice().reverse().slice(0, 60);
  return `<div class="grid g2 mb" style="align-items:start">
    <div class="card"><div class="spread mb"><h3>✨ توزیع کمیابی</h3><span class="chip">${fa(cl.boxes.length)} جعبه</span></div>
      ${donut(Object.keys(RAR).map(k => ({ label: RAR[k].l, color: RAR[k].c, value: cl.rarityCount[k] || 0 })), { center: fa(cl.boxes.length), sub: 'جایزه' })}
      <div class="legend mt">${Object.keys(RAR).map(k => `<div class="li"><span class="dot" style="background:${RAR[k].c}"></span>${RAR[k].l}<b style="margin-inline-start:auto">${fa(cl.rarityCount[k] || 0)}</b></div>`).join('')}</div></div>
    <div class="card"><h3 class="mb">🎁 پاداش‌های ویژه</h3>
      <div class="row mb"><button type="button" class="btn warn" data-act="grMystery">🎲 پاداش شانس به یک نفر</button><button type="button" class="btn ok" data-act="grGift">🎉 هدیه به کل کلاس</button></div>
      <div class="divider"></div><h3 class="mb">🎴 کارت‌های معافیت</h3>
      ${cl.per.filter(p => p.voucher > 0).map(p => `<div class="gr-row" style="padding:8px 0">${avHTML(p, 'sm')}<span class="n">${esc(p.name)}</span><span class="chip">🎴 ${fa(p.voucher)}</span>
        <button type="button" class="btn soft sm" data-act="grVoucherUse" data-id="${p.id}">استفاده شد</button></div>`).join('') || '<p class="small muted">کارتی در دست نیست.</p>'}
      <div class="divider"></div><button type="button" class="btn soft sm" data-act="grCsv" data-kind="boxes">📤 CSV جعبه‌ها</button></div></div>
  <div class="card" style="padding:5px 0"><div style="padding:12px 15px"><h3>📜 دفتر جعبه‌ها</h3></div><div class="gr-scroll">
    ${boxes.map(b => `<div class="gr-row"><span class="gr-ico" style="--kc:${RAR[b.prize.r].c}">${b.prize.i}</span>${avHTML(stuById(S(), b.sid), 'sm')}
      <div class="n">${esc(buddyName(b.sid))} — ${esc(b.prize.l)}<div class="small muted">${jShort(iranISO(new Date(b.at)))}</div></div>${pill(RAR[b.prize.r].l, RAR[b.prize.r].c)}</div>`).join('') || empty('🎰', 'جعبه‌ای باز نشده', '')}</div></div>`;
}
function tMirror() {
  const st = S(), cl = C.grClass(S()), days = grLastDays(14);
  const map = {}; cl.checkins.forEach(c => map[c.sid + '|' + c.date] = c);
  const heat = `<div class="gr-heat" style="grid-template-columns:132px repeat(14,minmax(18px,1fr))">
    <span class="hh" style="text-align:right">دانش‌آموز</span>${days.map(d => `<span class="hh">${fa(jOf(d).jd)}</span>`).join('')}
    ${(st.students || []).map(s => `<span class="hn">${esc(s.name)}</span>` + days.map(d => { const c = map[s.id + '|' + d]; const m = c ? moodOf(c.mood) : null;
      return `<span class="hc" style="${m ? `background:${tint(m.c, .22)};border-color:${tint(m.c, .45)}` : ''}" title="${esc(s.name)} • ${jLabel(d)}${c ? ' — ' + m.l : ''}">${m ? m.e : '·'}</span>`; }).join('')).join('')}</div>`;
  const goals = cl.goals.slice().sort((a, b) => b.week.localeCompare(a.week)).slice(0, 40);
  return `<div class="card mb"><div class="spread mb"><h3>🔥 نقشهٔ حرارتی حال کلاس</h3>
    <div class="row">${MOODS.map(m => `<span class="chip" style="color:${m.c}">${m.e} ${m.l}</span>`).join('')}</div></div>
    ${heat}<p class="small muted mt">🔒 این نقشه فقط برای معلم است و در پنل هیچ دانش‌آموز دیگری دیده نمی‌شود.</p></div>
  <div class="card mb"><div class="spread mb"><h3>🚩 پرچم‌های پیگیری</h3><span class="chip" style="color:#e11d48">${fa(cl.flags.length)}</span></div>
    ${cl.flags.length ? cl.flags.map(f => `<div class="gr-flag"><span>${f.kind === 'mood' ? '💙' : '🔥'}</span><div style="flex:1"><b class="small">${esc(f.name)}</b><div class="small muted">${esc(f.text)}</div></div>
      <button type="button" class="btn soft sm" data-act="grBonusTo" data-id="${f.sid}">🎁 پاداش حمایتی</button></div>`).join('') : empty('🌿', 'پرچمی نیست', '')}</div>
  <div class="card" style="padding:5px 0"><div style="padding:12px 15px" class="spread"><h3>🎯 هدف‌های هفته (${fa(goals.length)})</h3><button type="button" class="btn soft sm" data-act="grCsv" data-kind="mirror">📤 CSV</button></div>
    <div class="gr-scroll">${goals.map(g2 => `<div class="gr-row">${avHTML(stuById(st, g2.sid), 'sm')}<div class="n"><b>${esc(buddyName(g2.sid))}</b> — ${esc(g2.text)}
      <div class="small muted">هفتهٔ ${jShort(g2.week)}${g2.metric ? ' • ' + esc(g2.metric) : ''}${g2.teacherNote ? ' • 👨‍🏫 ' + esc(g2.teacherNote) : ''}</div></div>
      ${g2.review ? pill(g2.review.status === 'done' ? 'محقق شد' : g2.review.status === 'partial' ? 'نیمه' : 'نشد', g2.review.status === 'done' ? '#16a34a' : '#f59e0b') : pill('در جریان', '#1d4ed8')}
      <button type="button" class="btn ghost sm" data-act="grGoalNote" data-id="${g2.id}">💬 یادداشت</button></div>`).join('') || empty('🎯', 'هدفی ثبت نشده', '')}</div></div>`;
}
function tAcc() {
  const st = S(), log = C.grAccLog(st), s = gr().settings.acc;
  const per = (st.students || []).map(x => { const l = log.filter(y => y.leader === x.id); return { s: x, plus: l.filter(y => y.points > 0).reduce((a, y) => a + y.points, 0), minus: l.filter(y => y.points < 0).reduce((a, y) => a + y.points, 0), n: l.length }; }).filter(x => x.n).sort((a, b) => (a.minus - b.minus));
  return `<div class="card mb"><h3 class="mb">⚖️ قواعد پاسخگویی</h3>
    <div class="srow"><div><span class="sl">فعال باشد</span><span class="ss">کسر و پاداش امتیاز مدیریتی خودکار</span></div><span class="switch"><input type="checkbox" ${s.enabled ? 'checked' : ''} data-chg="grAcc" data-k="enabled"><i></i></span></div>
    <div class="grid g2 mt">
      ${[['judgeReturn', '↩️ برگشت رأی به قاضی', '#e11d48'], ['reportReject', '✖️ رد گزارش نماینده/شهردار', '#e11d48'], ['verdictApproved', '✅ رأی تأییدشده (پاداش)', '#16a34a'], ['reportApproved', '📨 گزارش تأییدشده (پاداش)', '#16a34a']].map(([k, l, c]) =>
        `<div class="srow"><span class="sl" style="color:${c}">${l}</span><div class="gr-step"><button type="button" data-act="grAccStep" data-k="${k}" data-d="-1">−</button><b id="grAcc_${k}">${fa(s[k])}</b><button type="button" data-act="grAccStep" data-k="${k}" data-d="1">+</button></div></div>`).join('')}
    </div>
    <p class="small muted mt"> امتیاز مدیریتی همان چیزی است که در «🏅 امتیاز مدیریتی»، کیف پول فروشگاه و نشان «یار مهربان» دیده می‌شود. کسر، واقعی و قابل خرج نیست.</p></div>
  <div class="grid g2 mb">
    <div class="card"><h3 class="mb">📊 تراز پاسخگویی</h3>${per.length ? per.map(x => `<div class="gr-row" style="padding:8px 0">${avHTML(x.s, 'sm')}<span class="n">${esc(x.s.name)}</span>
      <span class="chip" style="color:#16a34a">+${fa(x.plus)}</span><span class="chip" style="color:#e11d48">${fa(x.minus)}</span>
      <b class="small" style="color:${x.plus + x.minus >= 0 ? '#16a34a' : '#e11d48'}">${fa(x.plus + x.minus)}</b></div>`).join('') : empty('🕊️', 'رکوردی نیست', '')}</div>
    <div class="card"><h3 class="mb">🎁 اعطای دستی</h3><button type="button" class="btn ai" data-act="grBonus">🎁 تجربه / امتیاز مدیریتی دستی</button>
      <p class="small muted mt">می‌توانی امتیاز مدیریتی را دستی هم کم یا زیاد کنی (مثلاً برای جبران یک تصمیم).</p></div></div>
  <div class="card" style="padding:5px 0"><div style="padding:12px 15px" class="spread"><h3>📜 دفتر پاسخگویی</h3><button type="button" class="btn soft sm" data-act="grCsv" data-kind="acc">📤 CSV</button></div>
    <div class="gr-scroll">${log.map(l => `<div class="gr-row">${avHTML(stuById(st, l.leader), 'sm')}<div class="n">${esc(buddyName(l.leader))}<div class="small muted">${esc(l.note)} • ${jShort(l.date)}</div></div>
      <span class="badge" style="background:${tint(l.points > 0 ? '#16a34a' : '#e11d48', .13)};color:${l.points > 0 ? '#16a34a' : '#e11d48'}">${l.points > 0 ? '+' : ''}${fa(l.points)} 🏅</span></div>`).join('') || empty('📭', 'رکوردی نیست', '')}</div></div>`;
}
function tSettings() {
  const s = gr().settings;
  const sw = (k, l, sub) => `<div class="srow"><div><span class="sl">${l}</span>${sub ? `<span class="ss">${sub}</span>` : ''}</div><span class="switch"><input type="checkbox" ${s[k] ? 'checked' : ''} data-chg="grSet" data-k="${k}"><i></i></span></div>`;
  const step = (k, l, v) => `<div class="srow"><span class="sl">${l}</span><div class="gr-step"><button type="button" data-act="grStep" data-k="${k}" data-d="-1">−</button><b id="grS_${k}">${fa(v)}</b><button type="button" data-act="grStep" data-k="${k}" data-d="1">+</button></div></div>`;
  return `<div class="grid g2" style="align-items:start">
    <div class="card"><h3 class="mb">⚙️ عمومی</h3>
      ${sw('enabled', '🌱 بخش رشد فعال باشد')}${sw('questsAuto', '🔄 چالش خودکار روزانه', 'هر روز سه چالش تازه برای همه')}${sw('questAutoApprove', '✅ پاداش چالش خودکار', 'بدون نیاز به تأیید معلم')}${sw('checkinEnabled', '🪞 آینه و احوال‌پرسی')}${sw('boxEnabled', '🎰 جعبهٔ شانس')}${sw('buddyEnabled', '🤝 هم‌یار')}
      ${step('freezeCost', '🧊 قیمت استریک فریز', s.freezeCost)}${step('streakReward', '🔥 امتیاز هر رکورد زنجیره', s.streakReward)}
      <div class="srow"><div><span class="sl">✨ شانس جایزه‌های کمیاب</span><span class="ss" id="grLuckVal">${fa(s.boxRareBoost)}٪</span></div><input type="range" min="20" max="250" step="10" value="${s.boxRareBoost}" data-inp="grLuck" style="max-width:170px"></div></div>
    <div class="card"><h3 class="mb">🤝 قواعد هم‌یار</h3>
      ${sw('buddyNeedConfirm', '✅ تأیید هم‌یار لازم است')}${sw('buddyNeedTeacher', '👨‍🏫 تأیید معلم لازم است')}
      ${step('buddyDailyCap', '📅 سقف ثبت کمک در روز', s.buddyDailyCap)}${step('buddyFalse', '✖️ کسر امتیاز ثبت نامعتبر', s.buddyFalse)}
      <div class="divider"></div><h3 class="mb">⚡ تجربهٔ هر فعالیت</h3>
      ${[['hw', '📚 تکلیف تأییدشده'], ['quiz', '🧠 آزمون'], ['vote', '🗳️ نظرسنجی'], ['checkin', '🪞 احوال‌پرسی'], ['help', '🤝 کمک']].map(([k, l]) => `<div class="srow"><span class="sl">${l}</span><div class="gr-step"><button type="button" data-act="grXpStep" data-k="${k}" data-d="-5">−</button><b id="grX_${k}">${fa(s.xp[k])}</b><button type="button" data-act="grXpStep" data-k="${k}" data-d="5">+</button></div></div>`).join('')}</div>
    <div class="card"><h3 class="mb">🔄 داده و خروجی</h3><div class="row">
      ${[['quests', 'چالش‌ها'], ['streaks', 'زنجیره‌ها'], ['boxes', 'جعبه‌ها'], ['buddies', 'هم‌یار'], ['mirror', 'آینه'], ['acc', 'پاسخگویی']].map(([k, l]) => `<button type="button" class="btn soft sm" data-act="grCsv" data-kind="${k}">📤 ${l}</button>`).join('')}</div>
      <div class="divider"></div><div class="row"><button type="button" class="btn soft" data-act="grClassSheet">🖨️ برگهٔ رشد کلاس A4</button></div></div></div>`;
}
function teacherView() {
  const cl = C.grClass(S());
  const pend = (gr().claims || []).filter(c => c.status === 'pending').length + (gr().helps || []).filter(h => h.status === 'pending').length;
  const tabs = [['over', '🏠 داشبورد'], ['quests', '🎯 چالش‌ها', pend], ['streak', '🔥 زنجیره‌ها'], ['buddy', '🤝 هم‌یار'], ['box', '🎰 جعبه'], ['mirror', '🪞 آینه'], ['acc', '⚖️ پاسخگویی'], ['set', '⚙️ تنظیمات']];
  const body = R.tTab === 'quests' ? tQuests() : R.tTab === 'streak' ? tStreak() : R.tTab === 'buddy' ? tBuddy() : R.tTab === 'box' ? tBox() : R.tTab === 'mirror' ? tMirror() : R.tTab === 'acc' ? tAcc() : R.tTab === 'set' ? tSettings() : tOver();
  return `<div class="gr"><div class="gr-hero"><div class="spread"><div>
    <h1>🌱 رشد و انگیزهٔ کلاس</h1><p>زنجیره، چالش روزانه، جعبهٔ شانس، هم‌یار و آینهٔ خودشناسی — با پاسخگویی واقعی مسئولان کلاس.</p>
    <div class="gr-quick"><span class="q">🎯 <b>${fa(cl.approved.length)}</b> چالش</span><span class="q">🎰 <b>${fa(cl.boxes.length)}</b> جعبه</span><span class="q">🤝 <b>${fa(cl.helps.length)}</b> کمک</span><span class="q">🪞 <b>${fa(cl.checkins.length)}</b> آینه</span><span class="q">⚖️ <b>${fa(cl.acc.length)}</b> پاسخگویی</span></div></div>
    <div class="row"><button type="button" class="btn ai" data-act="grSync">🔄 ارزیابی و پاداش</button><button type="button" class="btn warn" data-act="grMystery">🎲 پاداش شانس</button><button type="button" class="btn soft" data-act="grClassSheet">🖨️ A4</button></div></div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${R.tTab === k ? 'on' : ''}" data-act="grTTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="grBody">${body}</div></div>`;
}

/* ================= drawers ================= */
function questForm(q) {
  const st = S(), d = R.draft = q ? clone(q) : { id: '', title: '', kind: 'hw_done', n: 1, points: 3, xp: 20, icon: '📚', scope: 'all', targetId: '', from: today(), to: grShift(today(), 6), daily: false, active: true };
  UI.jdate.grfrom = d.from; UI.jdate.grto = d.to;
  return `<form data-form="grQuest" class="gr">
    <div class="field"><label class="lbl">عنوان چالش</label><input class="input" name="title" required value="${esc(d.title)}" placeholder="مثلاً: این هفته سه تکلیف را کامل کن"></div>
    <div class="grid g2"><div class="field"><label class="lbl">نوع (سنجهٔ خودکار)</label><select class="select" data-chg="grQF" data-f="kind">${Object.entries(QK).map(([k, v]) => `<option value="${k}" ${d.kind === k ? 'selected' : ''}>${v.i} ${v.l}</option>`).join('')}</select></div>
      <div class="field"><label class="lbl">تعداد لازم</label><div class="gr-step"><button type="button" data-act="grQN" data-f="n" data-d="-1">−</button><b id="grQ_n">${fa(d.n)}</b><button type="button" data-act="grQN" data-f="n" data-d="1">+</button></div></div></div>
    <div class="grid g2"><div class="field"><label class="lbl">امتیاز</label><div class="gr-step"><button type="button" data-act="grQN" data-f="points" data-d="-1">−</button><b id="grQ_points">${fa(d.points)}</b><button type="button" data-act="grQN" data-f="points" data-d="1">+</button></div></div>
      <div class="field"><label class="lbl">تجربه</label><div class="gr-step"><button type="button" data-act="grQN" data-f="xp" data-d="-5">−</button><b id="grQ_xp">${fa(d.xp)}</b><button type="button" data-act="grQN" data-f="xp" data-d="5">+</button></div></div></div>
    <div class="field"><label class="lbl">برای چه کسانی</label><select class="select" data-chg="grQScope"><option value="all" ${d.scope === 'all' ? 'selected' : ''}>👥 کل کلاس</option><option value="group" ${d.scope === 'group' ? 'selected' : ''}>🧩 یک گروه</option><option value="student" ${d.scope === 'student' ? 'selected' : ''}>👦 یک دانش‌آموز</option></select></div>
    <div class="field" id="grQTarget" style="${d.scope === 'all' ? 'display:none' : ''}"><label class="lbl">مخاطب</label><select class="select" data-chg="grQF" data-f="targetId">
      ${d.scope === 'group' ? (st.groups || []).map(g2 => `<option value="${g2.id}" ${d.targetId === g2.id ? 'selected' : ''}>${esc(g2.name)}</option>`).join('') : (st.students || []).map(s => `<option value="${s.id}" ${d.targetId === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
    <div class="card mb" style="padding:13px;background:var(--surface2)"><h3 class="mb">🗓️ بازه (شمسی)</h3>
      <div class="field"><label class="lbl">از</label>${jDateSelectsG('grfrom')}</div>
      <div class="field" style="margin-bottom:0"><label class="lbl">تا</label>${jDateSelectsG('grto')}</div></div>
    <div class="srow"><span class="sl">🔄 روزانه باشد</span><span class="switch"><input type="checkbox" ${d.daily ? 'checked' : ''} data-chg="grQB" data-f="daily"><i></i></span></div>
    <div class="srow"><span class="sl">🟢 فعال باشد</span><span class="switch"><input type="checkbox" ${d.active !== false ? 'checked' : ''} data-chg="grQB" data-f="active"><i></i></span></div>
    <button class="btn mt" type="submit" style="width:100%">💾 ${q ? 'ذخیرهٔ ویرایش' : 'ساخت چالش'}</button></form>`;
}
function jDateSelectsG(pre) {
  const j = jOf(UI.jdate[pre] || today());
  return `<div class="row" style="gap:6px">
    <select class="select" data-chg="jdate" data-p="d" data-pre="${pre}" style="flex:1">${Array.from({ length: Jalali.monthLen(j.jy, j.jm) }, (_, i) => `<option value="${fa(i + 1)}" ${j.jd === i + 1 ? 'selected' : ''}>${fa(i + 1)}</option>`).join('')}</select>
    <select class="select" data-chg="jdate" data-p="m" data-pre="${pre}" style="flex:2">${JMONTHS.map((m, i) => `<option value="${fa(i + 1)}" ${j.jm === i + 1 ? 'selected' : ''}>${m}</option>`).join('')}</select>
    <select class="select" data-chg="jdate" data-p="y" data-pre="${pre}" style="flex:1.4">${[1404, 1405, 1406, 1407].map(y => `<option value="${fa(y)}" ${j.jy === y ? 'selected' : ''}>${fa(y)}</option>`).join('')}</select></div>`;
}
function checkinForm() {
  const c = checkinToday();
  R.mood = c ? c.mood : 3; R.energy = c ? c.energy : 3;
  return `<form data-form="grCheckin" class="gr"><h3 class="mb">🪞 آینهٔ امروز — ${jLabel(today())}</h3>
    <div class="field"><label class="lbl">امروز حالت چطور است؟</label><div class="gr-moods" id="grMoods">
      ${MOODS.map(m => `<button type="button" class="gr-mood ${R.mood === m.n ? 'on' : ''}" style="--mc:${m.c}" data-act="grMood" data-v="${m.n}"><span>${m.e}</span><small>${m.l}</small></button>`).join('')}</div></div>
    <div class="field"><label class="lbl">انرژی‌ام چقدر است؟</label><div class="gr-moods" id="grEnergy">
      ${[1, 2, 3, 4, 5].map(n => `<button type="button" class="gr-mood ${R.energy === n ? 'on' : ''}" style="--mc:#f59e0b" data-act="grEnergy" data-v="${n}"><span>${'⚡'.repeat(n)}</span><small>${fa(n)}</small></button>`).join('')}</div></div>
    <div class="field"><label class="lbl">📚 امروز چه چیزی یاد گرفتم؟</label><textarea class="input" name="learned" rows="2" placeholder="یک جمله کافی است…">${esc(c ? c.learned : '')}</textarea></div>
    <div class="field"><label class="lbl">🧗 چه چیزی برایم سخت بود؟</label><textarea class="input" name="hard" rows="2" placeholder=" Honest باش؛ این نوشته فقط برای خودت و معلم است.">${esc(c ? c.hard : '')}</textarea></div>
    <div class="field"><label class="lbl">🙏 بابت چه چیزی سپاسگزارم؟</label><input class="input" name="grateful" value="${esc(c ? c.grateful : '')}" placeholder="مثلاً: کمک دوستم"></div>
    <div class="ins info" style="display:flex;gap:10px;padding:10px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-size:.82rem"><span>🔒</span><span>این نوشته فقط برای خودت و معلم دیده می‌شود؛ هیچ هم‌کلاسی آن را نمی‌بیند.</span></div>
    <button class="btn mt" type="submit" style="width:100%">💾 ${c ? 'به‌روزرسانی' : 'ثبت احوال‌پرسی'}</button></form>`;
}
function goalForm() {
  const g2 = goalWeek();
  return `<form data-form="grGoal" class="gr"><h3 class="mb">🎯 هدف هفتهٔ ${jShort(grWeekKey(today()))}</h3>
    <div class="field"><label class="lbl">هدف من</label><input class="input" name="text" required value="${esc(g2 ? g2.text : '')}" placeholder="مثلاً: هر روز ۱۰ دقیقه روخوانی کنم"></div>
    <div class="grid g2"><div class="field"><label class="lbl">سنجه (اختیاری)</label><input class="input" name="metric" value="${esc(g2 ? g2.metric : '')}" placeholder="مثلاً: تعداد روز"></div>
      <div class="field"><label class="lbl">عدد هدف</label><input class="input" data-fa inputmode="numeric" name="target" value="${fa(g2 ? g2.target : 5)}"></div></div>
    <button class="btn" type="submit" style="width:100%">💾 ${g2 ? 'به‌روزرسانی هدف' : 'ثبت هدف'}</button></form>`;
}
function helpForm(b) {
  R.buddyDraft = { bid: b.id };
  return `<form data-form="grHelp" class="gr"><div class="row mb">${avHTML(stuById(S(), b.mentee), 'sm')}<div><b class="small">کمک به ${esc(buddyName(b.mentee))}</b><div class="small muted">درس: ${esc(b.subject)}</div></div></div>
    <div class="field"><label class="lbl">موضوع کمک</label><input class="input" name="topic" required placeholder="مثلاً: تمرین کسرهای مساوی"></div>
    <div class="field"><label class="lbl">چند دقیقه؟</label><div class="row" style="gap:6px">${[5, 10, 15, 20, 30].map(n => `<button type="button" class="btn sm soft" data-act="grMin" data-v="${n}">${fa(n)}</button>`).join('')}<input class="input" data-fa inputmode="numeric" name="minutes" id="grMin" value="۱۰" style="width:80px"></div></div>
    <div class="field"><label class="lbl">چه کار کردی؟</label><textarea class="input" name="note" rows="3" placeholder="چه چیزی یاد دادی؟ چه ایرادی داشت؟"></textarea></div>
    <div class="gr-note">پس از ثبت، هم‌یارت باید تأیید کند${gr().settings.buddyNeedTeacher ? ' و معلم هم بررسی می‌کند' : ''}. ثبت درست = امتیاز مدیریتی + تجربه + یک چرخش جعبه.</div>
    <button class="btn mt" type="submit" style="width:100%">📨 ثبت کمک</button></form>`;
}
function buddyForm() {
  const st = S();
  return `<form data-form="grBuddy" class="gr"><h3 class="mb">🤝 جفت هم‌یار</h3>
    <div class="field"><label class="lbl">راهنما (قوی‌تر)</label><select class="select" name="mentor" required><option value="">انتخاب…</option>${(st.students || []).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl">هم‌یار (نیازمند کمک)</label><select class="select" name="mentee" required><option value="">انتخاب…</option>${(st.students || []).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl">درس</label><select class="select" name="subject">${(st.subjects || []).map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl">یادداشت</label><input class="input" name="note" placeholder="اختیاری"></div>
    <button class="btn" type="submit" style="width:100%">💾 ساخت جفت</button></form>`;
}
function bonusForm(preSid) {
  const st = S();
  return `<form data-form="grBonus" class="gr"><h3 class="mb">🎁 اعطای دستی</h3>
    <div class="field"><label class="lbl">دانش‌آموز</label><select class="select" name="sid" required>${(st.students || []).map(s => `<option value="${s.id}" ${preSid === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
    <div class="grid g2"><div class="field"><label class="lbl">تجربه (XP)</label><input class="input" data-fa inputmode="numeric" name="xp" value="۲۰"></div>
      <div class="field"><label class="lbl">امتیاز مدیریتی (منفی = کسر)</label><input class="input" data-fa name="mgmt" value="۰"></div></div>
    <div class="field"><label class="lbl">دلیل</label><input class="input" name="reason" required placeholder="مثلاً: تلاش فوق‌العاده این هفته"></div>
    <button class="btn ai" type="submit" style="width:100%">🎁 اعطا</button></form>`;
}

/* ================= A4 ================= */
function stuSheet(id) {
  const st = S(), s = stuById(st, id); if (!s) return '';
  const sk = grStreaks(st, id), xp = grXp(st, id), l = grLevel(xp);
  const cl = (gr().claims || []).filter(c => c.sid === id && c.status === 'approved').slice(-12);
  const cs = (gr().checkins || []).filter(c => c.sid === id).slice(-10).reverse();
  const gs = (gr().goals || []).filter(x => x.sid === id).slice(-5).reverse();
  const bs = C.grBuddyOf(st, id);
  const acc = C.grAccLog(st, id);
  return `<div class="sheet">${sheetHead('برگهٔ رشد و انگیزه', s.name)}
    <table><tr><th style="width:16%">نام</th><td style="width:30%"><b>${esc(s.name)}</b></td><th style="width:12%">سطح</th><td>${fa(l.level)} — ${esc(grRank(l.level))}</td><th style="width:12%">تجربه</th><td>${fa(xp)}</td></tr></table>
    <span class="sec">🔥 زنجیره‌ها</span>
    <table><tr>${Object.keys(SK).map(k => `<th>${SK[k].i} ${SK[k].l}</th>`).join('')}<th>🧊 فریز</th><th>🎰 چرخش</th></tr>
      <tr>${Object.keys(SK).map(k => `<td><b>${fa(sk[k].cur)}</b> <small>(رکورد ${fa(sk[k].best)})</small></td>`).join('')}<td>${fa(grFreezeCount(st, id))}</td><td>${fa(grSpins(st, id))}</td></tr></table>
    <span class="sec">🎯 چالش‌های انجام‌شده</span>
    <table><thead><tr><th style="width:8%">#</th><th>چالش</th><th style="width:16%">تاریخ</th><th style="width:12%">امتیاز</th><th style="width:12%">تجربه</th></tr></thead>
      <tbody>${cl.length ? cl.map((c, i) => `<tr><td>${fa(i + 1)}</td><td class="r">${esc(c.title)}</td><td>${jShort(c.date)}</td><td>${fa(c.points)}</td><td>${fa(c.xp)}</td></tr>`).join('') : '<tr><td colspan="5">موردی ثبت نشده</td></tr>'}</tbody></table>
    ${bs.length ? `<span class="sec">🤝 هم‌یار</span><table><thead><tr><th>نقش</th><th>هم‌کلاسی</th><th>درس</th></tr></thead><tbody>${bs.map(b => `<tr><td>${b.mentor === id ? 'راهنما' : 'هم‌یار'}</td><td class="r">${esc(buddyName(b.mentor === id ? b.mentee : b.mentor))}</td><td>${esc(b.subject)}</td></tr>`).join('')}</tbody></table>` : ''}
    ${gs.length ? `<span class="sec">🎯 هدف‌های هفتگی</span><table><thead><tr><th style="width:16%">هفته</th><th>هدف</th><th style="width:18%">نتیجه</th></tr></thead><tbody>${gs.map(x => `<tr><td>${jShort(x.week)}</td><td class="r">${esc(x.text)}</td><td>${x.review ? (x.review.status === 'done' ? 'محقق شد' : x.review.status === 'partial' ? 'نیمه‌کاره' : 'محقق نشد') : 'در جریان'}</td></tr>`).join('')}</tbody></table>` : ''}
    ${cs.length ? `<span class="sec">🪞 آینهٔ خودشناسی (محرمانه)</span><table><thead><tr><th style="width:16%">تاریخ</th><th style="width:10%">حال</th><th>یاد گرفتم / سخت بود</th></tr></thead><tbody>${cs.map(c => `<tr><td>${jShort(c.date)}</td><td>${moodOf(c.mood).e}</td><td class="r" style="font-size:9.5px">${esc((c.learned || '') + (c.hard ? ' | ' + c.hard : ''))}</td></tr>`).join('')}</tbody></table>` : ''}
    ${acc.length ? `<span class="sec">⚖️ پاسخگویی مدیریتی</span><table><thead><tr><th style="width:16%">تاریخ</th><th>رویداد</th><th style="width:14%">امتیاز</th></tr></thead><tbody>${acc.slice(0, 8).map(a => `<tr><td>${jShort(a.date)}</td><td class="r">${esc(a.note)}</td><td>${a.points > 0 ? '+' : ''}${fa(a.points)}</td></tr>`).join('')}</tbody></table>` : ''}
    ${sheetFoot()}</div>`;
}
function classSheet() {
  const st = S(), cl = C.grClass(st);
  const rows = cl.per.map((p, i) => `<tr><td>${fa(i + 1)}</td><td class="r">${esc(p.name)}</td><td>${fa(p.level)}</td><td>${fa(p.xp)}</td>
    ${Object.keys(SK).map(k => `<td>${fa(p.streaks[k].cur)}</td>`).join('')}<td>${fa(p.spins)}</td><td>${fa(p.freeze)}</td></tr>`).join('');
  return `<div class="sheet">${sheetHead('برگهٔ رشد و انگیزهٔ کلاس', fa(cl.per.length) + ' دانش‌آموز')}
    <table style="font-size:10px"><thead><tr><th style="width:5%">#</th><th style="width:26%">نام</th><th style="width:8%">سطح</th><th style="width:10%">تجربه</th>
      ${Object.keys(SK).map(k => `<th style="width:9%">${SK[k].i}</th>`).join('')}<th style="width:8%">🎰</th><th style="width:8%">🧊</th></tr></thead><tbody>${rows}</tbody></table>
    <p style="font-size:9.5px">${Object.keys(SK).map(k => `${SK[k].i} ${SK[k].l}`).join(' • ')} — عدد = زنجیرهٔ فعلی</p>
    <span class="sec">📊 خلاصه</span>
    <table><tr><th>چالش انجام‌شده</th><th>جعبهٔ باز شده</th><th>کمک تأییدشده</th><th>احوال‌پرسی</th><th>رویداد پاسخگویی</th></tr>
      <tr><td>${fa(cl.approved.length)}</td><td>${fa(cl.boxes.length)}</td><td>${fa(cl.helps.length)}</td><td>${fa(cl.checkins.length)}</td><td>${fa(cl.acc.length)}</td></tr></table>
    ${sheetFoot()}</div>`;
}

/* ================= CSV ================= */
function csv(kind) {
  const st = S(), g2 = gr(); let rows;
  if (kind === 'quests') { rows = [['عنوان', 'نوع', 'تعداد', 'امتیاز', 'تجربه', 'مخاطب', 'از', 'تا', 'روزانه', 'فعال']]; (g2.quests || []).forEach(q => rows.push([q.title, (QK[q.kind] || {}).l || q.kind, q.n, q.points, q.xp, q.scope === 'all' ? 'کل کلاس' : q.scope === 'group' ? 'گروه' : 'دانش‌آموز', q.from, q.to, q.daily ? 'بله' : 'خیر', q.active === false ? 'خیر' : 'بله'])); }
  else if (kind === 'streaks') { rows = [['نام', 'کد', 'سطح', 'تجربه'].concat(Object.keys(SK).map(k => SK[k].l + ' فعلی'), Object.keys(SK).map(k => SK[k].l + ' رکورد'), ['فریز', 'چرخش', 'معافیت'])]; C.grClass(st).per.forEach(p => { const s = stuById(st, p.id); rows.push([p.name, s ? s.code || '' : '', p.level, p.xp].concat(Object.keys(SK).map(k => p.streaks[k].cur), Object.keys(SK).map(k => p.streaks[k].best), [p.freeze, p.spins, p.voucher])); }); }
  else if (kind === 'boxes') { rows = [['نام', 'جایزه', 'کمیابی', 'تاریخ']]; (g2.boxes || []).forEach(b => rows.push([buddyName(b.sid), b.prize.l, RAR[b.prize.r].l, jShort(iranISO(new Date(b.at)))])); }
  else if (kind === 'buddies') { rows = [['راهنما', 'هم‌یار', 'درس', 'کمک تأییدشده', 'اثر']]; (g2.buddies || []).forEach(b => { const e = C.grBuddyEffect(st, b); rows.push([buddyName(b.mentor), buddyName(b.mentee), b.subject, (g2.helps || []).filter(h => h.bid === b.id && h.status === 'approved').length, e ? faNum(e.delta) : '—']); }); }
  else if (kind === 'mirror') { rows = [['نام', 'تاریخ', 'حال', 'انرژی', 'یاد گرفتم', 'سخت بود', 'سپاس']]; (g2.checkins || []).forEach(c => rows.push([buddyName(c.sid), c.date, moodOf(c.mood).l, c.energy, c.learned, c.hard, c.grateful])); }
  else { rows = [['نام', 'تاریخ', 'رویداد', 'امتیاز مدیریتی']]; C.grAccLog(st).forEach(a => rows.push([buddyName(a.leader), a.date, a.note, a.points])); }
  download(`رشد-${kind}-${C.jShortEn(today()).replace(/\//g, '-')}.csv`, serializeCSV(st, rows));
  toast(`فایل با ${fa(rows.length - 1)} ردیف دانلود شد`, 'ok');
}

/* ================= integration ================= */
const baseNav = navItems, baseRV = renderView, baseSB = renderSidebar, baseRender = render;
navItems = function () {
  const items = baseNav();
  const key = isT() ? 'growth' : 'myGrowth', label = isT() ? 'رشد و انگیزه' : 'رشد من';
  const at = items.findIndex(x => x[0] === (isT() ? 'dash' : 'report'));
  const e = [key, '🌱', label];
  if (at > -1) items.splice(at + 1, 0, e); else items.unshift(e);
  return items;
};
renderView = function () {
  if (UI.section !== 'growth' && UI.section !== 'myGrowth') return baseRV();
  const v = document.getElementById('view');
  try { if (S().scope !== 'student') C.grEnsure(S()); v.innerHTML = `<div class="ve">${isT() ? teacherView() : studentView()}</div>`; }
  catch (e) { console.error('growth view', e); v.innerHTML = `<div class="card">${empty('🛠️', 'خطا در نمایش رشد', 'صفحه را دوباره بارگذاری کنید.', '<button type="button" class="btn" data-act="reload">بارگذاری مجدد</button>')}</div>`; }
};
renderSidebar = function () {
  baseSB();
  if (!S() || !SESS) return;
  const key = isT() ? 'growth' : 'myGrowth';
  const btn = document.querySelector(`.nav[data-sec="${key}"]`); if (!btn) return;
  const n = isT() ? (gr().claims || []).filter(c => c.status === 'pending').length + (gr().helps || []).filter(h => h.status === 'pending').length
    : grQuestsFor(S(), sid(), today()).filter(q => grProgress(S(), q, sid(), today()) >= q.n && !grClaimOf(S(), q.id, sid(), today())).length;
  if (n && !btn.querySelector('.nb')) { const b = document.createElement('span'); b.className = 'nb'; b.textContent = fa(n); btn.appendChild(b); }
};
render = function (keep) { baseRender(keep); fixMobileNav(); };
function fixMobileNav() {
  const nav = document.getElementById('xnav'); if (!nav || !SESS) return;
  const items = isT() ? [['dash', '🏠', 'خانه'], ['homework', '📚', 'تکالیف'], ['growth', '🌱', 'رشد'], ['shop', '🛒', 'فروشگاه'], ['notifs', '🔔', 'اعلان']]
    : [['report', '🎓', 'کارنامه'], ['myHomework', '📚', 'تکالیف'], ['myGrowth', '🌱', 'رشد'], ['shop', '🛒', 'فروشگاه'], ['notifs', '🔔', 'اعلان']];
  const unread = nav.querySelector('[data-xnav="notifs"] .b');
  const badge = unread ? unread.outerHTML : '';
  nav.innerHTML = items.map(([k, i, l]) => `<button type="button" data-xnav="${k}" class="${UI.section === k ? 'on' : ''}"><span class="i">${i}</span>${l}${k === 'notifs' ? badge : ''}</button>`).join('') + `<button type="button" data-xnav="more"><span class="i">☰</span>بیشتر</button>`;
  nav.querySelectorAll('[data-xnav]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.xnav;
    if (k === 'more') { document.body.classList.add('side-open'); return; }
    if (k === 'notifs') { if (ACT.xNotifs) ACT.xNotifs(); return; }
    setSection(k);
  }));
}
/* hide growth/accountability ledger rows from serگروه UI (they are not homework) */
['groups', 'leaderPanel'].forEach(k => {
  const base = V[k]; if (typeof base !== 'function') return;
  V[k] = function () {
    const st = S(); if (!st || !Array.isArray(st.leaderLogs)) return base.apply(this, arguments);
    const all = st.leaderLogs;
    st.leaderLogs = all.filter(l => !l.gkind);
    try { return base.apply(this, arguments); } finally { st.leaderLogs = all; }
  };
});

/* ================= actions ================= */
ACT.grTab = el => { R.tab = el.dataset.tab; renderView(); Sound.play('tap'); };
ACT.grTTab = el => { R.tTab = el.dataset.tab; if (UI.section !== 'growth') setSection('growth'); else renderView(); Sound.play('tap'); };
ACT.grGoBox = () => { R.tab = 'box'; renderView(); };
ACT.grClaim = el => {
  const id = el.dataset.id, rect = el.getBoundingClientRect();
  send('gr.quest.claim', { id: uid(), qid: id, date: today() }, null, { sound: null }).then(r => {
    if (!r) return;
    confetti(rect.left + rect.width / 2, rect.top, 22); Sound.play('win');
    toast(r.approved ? `🎉 پاداش گرفتی: ${fa(r.points)} امتیاز + ${fa(r.xp)} تجربه + ۱ چرخش` : '📨 درخواست پاداش به معلم ارسال شد', 'ok', null, 7000);
  });
};
ACT.grClaimAll = () => {
  const st = S(), qs = grQuestsFor(st, sid(), today()).filter(q => grProgress(st, q, sid(), today()) >= q.n && !grClaimOf(st, q.id, sid(), today()));
  if (!qs.length) return toast('پاداش آماده‌ای نیست', 'info');
  confirmDlg({ title: '🎁 دریافت همه', body: `${fa(qs.length)} پاداش دریافت شود؟`, okText: 'دریافت', onOk: async () => {
    let pts = 0, xp = 0, n = 0;
    for (const q of qs) { const r = await send('gr.quest.claim', { id: uid(), qid: q.id, date: today() }, null, { sound: null }); if (r) { n++; pts += r.points || 0; xp += r.xp || 0; } }
    if (n) { confetti(innerWidth / 2, innerHeight / 2, 34); Sound.play('win'); toast(`🎉 ${fa(n)} پاداش • ${fa(pts)} امتیاز • ${fa(xp)} تجربه`, 'ok', null, 8000); }
  } });
};
ACT.grSpin = () => {
  if (R.spinning) return;
  R.spinning = true; R.myBox = null; renderView();
  const reel = document.getElementById('grReel');
  const icons = C.GR_PRIZES.map(p => p.i);
  let k = 0;
  const iv = setInterval(() => { k++; if (reel) reel.textContent = icons[k % icons.length]; }, 90);
  send('gr.box.open', { source: 'manual' }, null, { sound: null }).then(r => {
    setTimeout(() => {
      clearInterval(iv); R.spinning = false;
      if (r && r.prize) {
        R.myBox = r.prize; renderView();
        const el = document.getElementById('grReel');
        if (el) { const b = el.getBoundingClientRect(); confetti(b.left + b.width / 2, b.top + b.height / 2, r.prize.r === 'legend' ? 46 : r.prize.r === 'epic' ? 30 : 18); }
        Sound.play(r.prize.r === 'legend' || r.prize.r === 'epic' ? 'win' : 'pop');
        toast(`${r.prize.i} ${r.prize.l} — ${RAR[r.prize.r].l}!`, 'ok', null, 7000);
      } else renderView();
    }, 900);
  }).catch(() => { clearInterval(iv); R.spinning = false; renderView(); });
};
ACT.grFreezeBuy = () => confirmDlg({ title: '🧊 خرید استریک فریز', body: `${fa(gr().settings.freezeCost)} امتیاز از کیف پول کم می‌شود.`, okText: 'خرید', onOk: () => send('gr.freeze.buy', {}, null, { msg: '🧊 یک فریز خریدی', sound: 'pop' }) });
ACT.grFreezeUse = () => promptDlg({ title: '🛡️ فریز کردن یک روز', placeholder: 'تاریخ شمسی مثلاً ۱۴۰۵/۰۹/۰۳', value: C.jShortEn(today()), onOk: v => { const d = C.parseDateAny(v); if (!d) return toast('تاریخ نامعتبر', 'err'); send('gr.freeze.use', { date: d }, null, { msg: '🛡️ آن روز فریز شد', sound: 'ok' }); } });
ACT.grFreezeGrant = el => send('gr.freeze.grant', { sid: el.dataset.id, n: 1 }, null, { msg: '🧊 یک فریز اعطا شد' });
ACT.grSpinGrant = el => send('gr.box.grant', { sid: el.dataset.id, n: 1 }, null, { msg: '🎰 یک چرخش اعطا شد' });
ACT.grCheckin = () => openDrawer('🪞 آینهٔ امروز', checkinForm());
ACT.grMood = el => { R.mood = Number(en(el.dataset.v)); document.querySelectorAll('#grMoods .gr-mood').forEach(b => b.classList.toggle('on', b === el)); Sound.play('tap'); };
ACT.grEnergy = el => { R.energy = Number(en(el.dataset.v)); document.querySelectorAll('#grEnergy .gr-mood').forEach(b => b.classList.toggle('on', b === el)); Sound.play('tap'); };
ACT.grGoal = () => openDrawer('🎯 هدف هفته', goalForm());
ACT.grGoalDone = el => send('gr.goal.review', { id: el.dataset.id, status: 'done' }, null, { msg: '🎉 آفرین! هدفت محقق شد', sound: 'win' });
ACT.grGoalPart = el => send('gr.goal.review', { id: el.dataset.id, status: 'partial' }, null, { msg: '🌗 نیمه‌کاره ثبت شد' });
ACT.grGoalMiss = el => send('gr.goal.review', { id: el.dataset.id, status: 'missed' }, null, { msg: 'ثبت شد؛ هفتهٔ بعد دوباره تلاش کن' });
ACT.grGoalNote = el => promptDlg({ title: '💬 یادداشت معلم', placeholder: 'بازخورد کوتاه…', onOk: note => send('gr.goal.comment', { id: el.dataset.id, note }, null, { msg: 'یادداشت ثبت شد' }) });
ACT.grHelpLog = el => { const b = (gr().buddies || []).find(x => x.id === el.dataset.id); if (b) openDrawer('🤝 ثبت کمک', helpForm(b)); };
ACT.grMin = el => { const i = document.getElementById('grMin'); if (i) i.value = fa(el.dataset.v); Sound.play('tap'); };
ACT.grHelpConfirm = el => send('gr.buddy.confirm', { id: el.dataset.id }, null, { msg: '✅ تأیید کردی؛ هم‌یارت امتیاز می‌گیرد', sound: 'ok' });
ACT.grHOk = el => send('gr.buddy.review', { id: el.dataset.id, verdict: 'approved' }, null, { msg: '✅ کمک تأیید شد • امتیاز مدیریتی داده شد', sound: 'gavel' });
ACT.grHNo = el => promptDlg({ title: '✖️ رد ثبت کمک', placeholder: 'دلیل…', onOk: note => send('gr.buddy.review', { id: el.dataset.id, verdict: 'rejected', note }, null, { msg: 'رد شد و امتیاز کسر شد', sound: 'err' }) });
ACT.grHApproveAll = () => { const ids = (gr().helps || []).filter(h => h.status === 'pending').map(h => h.id); if (!ids.length) return toast('موردی نیست', 'info'); confirmDlg({ title: '✅ تأیید همه', body: `${fa(ids.length)} کمک تأیید شود؟`, okText: 'تأیید', onOk: () => send('gr.buddy.bulkReview', { ids, verdict: 'approved' }, null, { msg: '✅ همه تأیید شد', sound: 'win' }) }); };
ACT.grQNew = () => openDrawer('➕ چالش جدید', questForm(null), true);
ACT.grQEdit = el => { const q = (gr().quests || []).find(x => x.id === el.dataset.id); if (q) openDrawer('✏️ ویرایش چالش', questForm(q), true); };
ACT.grQToggle = el => send('gr.quest.toggle', { id: el.dataset.id }, null, { sound: 'pop' });
ACT.grQDel = el => { const id = el.dataset.id; confirmDlg({ title: 'حذف چالش', body: 'چالش و درخواست‌هایش حذف شود؟', okText: 'حذف', danger: true, onOk: () => send('gr.quest.delete', { id }, null, { msg: 'چالش حذف شد', undo: true, sound: 'err' }) }); };
ACT.grQN = el => { if (!R.draft) return; const f = el.dataset.f, d = Number(en(el.dataset.d)); R.draft[f] = clamp((R.draft[f] || 0) + d, f === 'n' ? 1 : 0, f === 'n' ? 50 : f === 'points' ? 30 : 300); const b = document.getElementById('grQ_' + f); if (b) b.textContent = fa(R.draft[f]); Sound.play('tap'); };
ACT.grQOk = el => send('gr.quest.review', { id: el.dataset.id, verdict: 'approved' }, null, { msg: '✅ پاداش داده شد', sound: 'gavel' });
ACT.grQNo = el => promptDlg({ title: '✖️ رد درخواست', placeholder: 'دلیل…', onOk: note => send('gr.quest.review', { id: el.dataset.id, verdict: 'rejected', note }, null, { msg: 'رد شد', sound: 'err' }) });
ACT.grQApproveAll = () => { const ids = (gr().claims || []).filter(c => c.status === 'pending').map(c => c.id); if (!ids.length) return toast('موردی نیست', 'info'); confirmDlg({ title: '✅ تأیید همه', body: `${fa(ids.length)} پاداش داده شود؟`, okText: 'تأیید', onOk: () => send('gr.quest.bulkReview', { ids, verdict: 'approved' }, null, { msg: '✅ همه تأیید شد', sound: 'win' }) }); };
ACT.grSync = () => send('gr.sync', {}, null, { sound: null }).then(r => { if (r) { if (r.added) { confetti(innerWidth / 2, innerHeight / 2, 26); Sound.play('win'); toast(`🔥 ${fa(r.added)} رکورد تازه پاداش گرفت`, 'ok', null, 7000); } else toast('همهٔ پاداش‌های زنجیره قبلاً داده شده ✅', 'info'); } });
ACT.grBAuto = () => { const sub = (document.getElementById('grBSub') || {}).value; confirmDlg({ title: '🤖 جفت‌سازی هوشمند', body: `در درس «${sub}» قوی‌ترین با ضعیف‌ترین جفت می‌شوند.`, okText: 'اجرا', onOk: () => send('gr.buddy.auto', { subject: sub }, null, { sound: null }).then(r => { if (r) { Sound.play('win'); toast(`🤝 ${fa(r.pairs)} جفت ساخته شد`, 'ok'); } }) }); };
ACT.grBNew = () => openDrawer('🤝 جفت دستی', buddyForm());
ACT.grBToggle = el => send('gr.buddy.toggle', { id: el.dataset.id }, null, { sound: 'pop' });
ACT.grBDel = el => { const id = el.dataset.id; confirmDlg({ title: 'حذف جفت', body: 'جفت و ثبت‌های کمکش حذف شود؟', okText: 'حذف', danger: true, onOk: () => send('gr.buddy.delete', { id }, null, { msg: 'حذف شد', undo: true, sound: 'err' }) }); };
ACT.grMystery = () => confirmDlg({ title: '🎲 پاداش شانس', body: 'یک دانش‌آموز تصادفی ۵ امتیاز + ۱۵ تجربه می‌گیرد.', okText: 'بچرخان', onOk: () => send('gr.box.mystery', { points: 5 }, null, { sound: null }).then(r => { if (r) { confetti(innerWidth / 2, innerHeight / 2, 30); Sound.play('win'); toast(`🎉 ${r.name} برندهٔ ${fa(r.points)} امتیاز شد!`, 'ok', null, 8000); } }) });
ACT.grGift = () => promptDlg({ title: '🎉 هدیه به کل کلاس', placeholder: 'امتیاز هر نفر', value: '۲', onOk: v => send('gr.box.classGift', { points: num(v) || 2 }, null, { sound: null }).then(r => { if (r) { confetti(innerWidth / 2, innerHeight / 2, 40); Sound.play('win'); toast(`🎉 به ${fa(r.n)} نفر ${fa(r.points)} امتیاز داده شد`, 'ok', null, 8000); } }) });
ACT.grVoucherUse = el => promptDlg({ title: '🎴 استفاده از کارت معافیت', placeholder: 'کدام تکلیف؟', onOk: note => send('gr.voucher.use', { sid: el.dataset.id, note }, null, { msg: '🎴 کارت استفاده شد' }) });
ACT.grBonus = () => openDrawer('🎁 اعطای دستی', bonusForm());
ACT.grBonusTo = el => openDrawer('🎁 پاداش حمایتی', bonusForm(el.dataset.id));
ACT.grAccStep = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const s = gr().settings.acc; s[k] = clamp((s[k] || 0) + d, 0, 20); const b = document.getElementById('grAcc_' + k); if (b) b.textContent = fa(s[k]); clearTimeout(R.accT); R.accT = setTimeout(() => send('gr.settings', { patch: { acc: { [k]: s[k] } } }, null, { sound: null }), 500); };
ACT.grStep = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const s = gr().settings; s[k] = clamp((s[k] || 0) + d, 0, 60); const b = document.getElementById('grS_' + k); if (b) b.textContent = fa(s[k]); clearTimeout(R.setT); R.setT = setTimeout(() => send('gr.settings', { patch: { [k]: s[k] } }, null, { sound: null }), 500); };
ACT.grXpStep = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const s = gr().settings.xp; s[k] = clamp((s[k] || 0) + d, 0, 200); const b = document.getElementById('grX_' + k); if (b) b.textContent = fa(s[k]); clearTimeout(R.xpT); R.xpT = setTimeout(() => send('gr.settings', { patch: { xp: { [k]: s[k] } } }, null, { sound: null }), 500); };
ACT.grCsv = el => csv(el.dataset.kind);
ACT.grStuSheet = el => previewSheet('🖨️ برگهٔ رشد دانش‌آموز (A4)', stuSheet(el.dataset.id));
ACT.grClassSheet = () => previewSheet('🖨️ برگهٔ رشد کلاس (A4)', classSheet());

/* ================= inputs / changes / forms ================= */
INP.grTQ = el => { R.tq = el.value; const b = document.getElementById('grBody'); if (b) { b.innerHTML = R.tTab === 'streak' ? tStreak() : tQuests(); const i = document.querySelector('[data-inp="grTQ"]'); if (i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) {} } } };
INP.grLuck = el => { const v = clamp(Number(en(el.value)) || 100, 20, 250); gr().settings.boxRareBoost = v; const l = document.getElementById('grLuckVal'); if (l) l.textContent = fa(v) + '٪'; clearTimeout(R.luckT); R.luckT = setTimeout(() => send('gr.settings', { patch: { boxRareBoost: v } }, null, { sound: null }), 550); };
CHG.grTKind = el => { R.tkind = el.value; const b = document.getElementById('grBody'); if (b) b.innerHTML = tQuests(); };
CHG.grSet = el => { const k = el.dataset.k, v = el.checked; send('gr.settings', { patch: { [k]: v } }, st => { st.growth.settings[k] = v; }, { msg: 'ذخیره شد' }); };
CHG.grAcc = el => { const k = el.dataset.k, v = el.checked; send('gr.settings', { patch: { acc: { [k]: v } } }, st => { st.growth.settings.acc[k] = v; }, { msg: 'ذخیره شد' }); };
CHG.grQF = el => { if (R.draft) R.draft[el.dataset.f] = el.value; };
CHG.grQB = el => { if (R.draft) R.draft[el.dataset.f] = el.checked; };
CHG.grQScope = el => {
  if (!R.draft) return;
  R.draft.scope = el.value; R.draft.targetId = '';
  const box = document.getElementById('grQTarget'); if (!box) return;
  box.style.display = el.value === 'all' ? 'none' : '';
  const sel = box.querySelector('select');
  sel.innerHTML = el.value === 'group' ? (S().groups || []).map(g2 => `<option value="${g2.id}">${esc(g2.name)}</option>`).join('') : (S().students || []).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  R.draft.targetId = sel.value;
};
FORM.grQuest = form => {
  const d = R.draft; if (!d) return;
  const fd = new FormData(form);
  const data = { title: String(fd.get('title') || '').trim(), kind: d.kind, n: d.n, points: d.points, xp: d.xp, icon: (QK[d.kind] || {}).i || '🎯', scope: d.scope, targetId: d.targetId, from: UI.jdate.grfrom || today(), to: UI.jdate.grto || today(), daily: d.daily, active: d.active !== false };
  if (!data.title) return toast('عنوان را بنویس', 'err');
  if (data.scope !== 'all' && !data.targetId) return toast('مخاطب را انتخاب کن', 'err');
  if (d.id) send('gr.quest.update', { id: d.id, data }, null, { msg: 'چالش ویرایش شد' });
  else send('gr.quest.create', { id: uid(), data }, null, { msg: '🎯 چالش ساخته شد' });
  R.draft = null; closeDrawer();
};
FORM.grCheckin = form => {
  const fd = new FormData(form);
  send('gr.checkin.save', { mood: R.mood, energy: R.energy, learned: String(fd.get('learned') || ''), hard: String(fd.get('hard') || ''), grateful: String(fd.get('grateful') || '') }, null, { sound: null })
    .then(r => { if (r) { Sound.play('win'); toast(r.first ? '🪞 ثبت شد • ۱ امتیاز + تجربه گرفتی' : '🪞 به‌روزرسانی شد', 'ok'); } });
  closeDrawer();
};
FORM.grGoal = form => {
  const fd = new FormData(form);
  const text = String(fd.get('text') || '').trim(); if (!text) return toast('هدف را بنویس', 'err');
  send('gr.goal.save', { text, metric: String(fd.get('metric') || ''), target: num(fd.get('target')) || 1 }, null, { msg: '🎯 هدف هفته ثبت شد' });
  closeDrawer();
};
FORM.grHelp = form => {
  const d = R.buddyDraft; if (!d) return;
  const fd = new FormData(form);
  const topic = String(fd.get('topic') || '').trim(); if (!topic) return toast('موضوع را بنویس', 'err');
  send('gr.buddy.log', { id: uid(), bid: d.bid, topic, minutes: num(fd.get('minutes')) || 10, note: String(fd.get('note') || '') }, null, { msg: '📨 ثبت شد؛ هم‌یارت باید تأیید کند' });
  R.buddyDraft = null; closeDrawer();
};
FORM.grBuddy = form => {
  const fd = new FormData(form);
  const mentor = fd.get('mentor'), mentee = fd.get('mentee');
  if (!mentor || !mentee || mentor === mentee) return toast('دو نفر متفاوت انتخاب کن', 'err');
  send('gr.buddy.create', { id: uid(), mentor, mentee, subject: fd.get('subject'), note: String(fd.get('note') || '') }, null, { msg: '🤝 جفت ساخته شد' });
  closeDrawer();
};
FORM.grBonus = form => {
  const fd = new FormData(form);
  const sidv = fd.get('sid'), reason = String(fd.get('reason') || '').trim();
  if (!sidv || !reason) return toast('دانش‌آموز و دلیل لازم است', 'err');
  send('gr.bonus', { sid: sidv, xp: num(fd.get('xp')) || 0, mgmt: num(fd.get('mgmt')) || 0, reason }, null, { sound: null })
    .then(r => { if (r) { confetti(innerWidth / 2, innerHeight / 2, 16); Sound.play('win'); toast('🎁 اعطا شد', 'ok'); } });
  closeDrawer();
};

if (S() && SESS) { render(true); }
})();
