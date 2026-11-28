/* skills.js — رابط کاربری درخت مهارت‌ها و غول‌های مرحله */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.SK_NODES || typeof navItems !== 'function') return;
const fa = C.fa, faNum = C.faNum, jShort = C.jShort, isoToDate = C.isoToDate, todayISO = C.todayISO;
const DOM = C.SK_DOMAINS, NODES = C.SK_NODES, BM = C.SK_BOSS_METRICS;
const SK = { tab: 'tree' };
const skv = () => S().skills || { domains: DOM, nodes: NODES, bosses: [], rows: [], xp: {}, claimed: [] };
const snd = k => { try { Sound.play(k); } catch (e) {} };

const CSS = `.sk-branches{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.sk-branch{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:14px;box-shadow:var(--shadow);overflow:hidden}
.sk-branch::before{content:'';position:absolute;top:0;bottom:0;right:0;width:5px;background:var(--bc)}
.sk-bhead{display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:.86rem;margin-bottom:10px}
.sk-bhead b{font-family:var(--display);font-size:1.05rem;color:var(--bc)}
.sk-node{position:relative;display:flex;gap:10px;align-items:center;padding:9px 8px;border-radius:14px;margin-top:8px;background:var(--surface2);border:1.5px solid var(--line)}
.sk-node+.sk-node::before{content:'';position:absolute;top:-9px;right:26px;width:3px;height:9px;background:var(--line)}
.sk-node.done{border-color:color-mix(in srgb,var(--bc) 55%,var(--line));background:color-mix(in srgb,var(--bc) 10%,var(--surface2))}
.sk-node.ready{border-color:#f59e0b;background:color-mix(in srgb,#f59e0b 12%,var(--surface2));animation:skPulse 1.6s infinite}
@keyframes skPulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.5)}50%{box-shadow:0 0 0 8px rgba(245,158,11,0)}}
.sk-dot{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;font-size:1.25rem;background:var(--surface);border:1.5px solid var(--line);flex:none}
.sk-node.done .sk-dot{background:var(--bc);border-color:var(--bc)}
.sk-nt{flex:1;min-width:0}.sk-nt b{display:block;font-size:.82rem}.sk-nt small{font-size:.68rem;color:var(--muted)}
.sk-bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden;margin-top:4px}.sk-bar i{display:block;height:100%;background:var(--bc)}
.sk-boss{position:relative;background:linear-gradient(150deg,#3b0764,#7c2d12 60%,#450a0a);color:#fff;border-radius:22px;padding:18px;overflow:hidden;box-shadow:0 22px 50px -24px rgba(69,10,10,.8)}
.sk-boss::before{content:'';position:absolute;inset:0;background:radial-gradient(80% 90% at 90% -10%,rgba(251,191,36,.35),transparent 60%);pointer-events:none}
.sk-boss>*{position:relative;z-index:2}
.sk-boss.defeated{filter:saturate(.5)}.sk-boss.escaped{filter:grayscale(.8);opacity:.8}
.sk-boss .ico{font-size:2.6rem;filter:drop-shadow(0 6px 14px rgba(0,0,0,.5));animation:skFloat 3.4s ease-in-out infinite}
@keyframes skFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.sk-hp{height:16px;border-radius:99px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.25);overflow:hidden;position:relative;margin:10px 0 6px}
.sk-hp i{display:block;height:100%;background:linear-gradient(90deg,#ef4444,#f97316);transition:width .7s}
.sk-hp span{position:absolute;inset:0;display:grid;place-items:center;font-size:.68rem;font-weight:800;text-shadow:0 1px 3px rgba(0,0,0,.7)}
.sk-stamp{position:absolute;left:14px;top:12px;transform:rotate(-10deg);border:3px double currentColor;border-radius:10px;padding:3px 12px;font-family:var(--display);font-size:1rem;opacity:.9;z-index:3}
.sk-chipw{display:flex;gap:6px;flex-wrap:wrap}
.sk-chipw .chip{background:rgba(255,255,255,.16);color:#fff;border-color:rgba(255,255,255,.3)}
@media (max-width:700px){.sk-branches{grid-template-columns:1fr}}`;
if (!document.getElementById('skStyles')) { const s = document.createElement('style'); s.id = 'skStyles'; s.textContent = CSS; document.head.appendChild(s); }

function rwChips(rw, light) {
  const out = [];
  if (rw.points) out.push('🪙 ' + fa(rw.points));
  if (rw.xp) out.push('⚡ ' + fa(rw.xp));
  if (rw.spin) out.push('🎰 ' + fa(rw.spin));
  if (rw.freeze) out.push('🧊 ' + fa(rw.freeze));
  if (rw.voucher) out.push('🎴 ' + fa(rw.voucher));
  return out.map(x => '<span class="chip' + (light ? '' : '') + '">' + x + '</span>').join('');
}
function branchHTML(dom, xp, claimed) {
  const D = DOM[dom], list = NODES[dom] || [];
  const nodes = list.map(n => {
    const done = (claimed || []).indexOf(n.id) > -1;
    const ready = !done && (xp || 0) >= n.need;
    const pct = done || ready ? 100 : Math.round((xp || 0) / n.need * 100);
    return '<div class="sk-node ' + (done ? 'done' : ready ? 'ready' : '') + '">' +
      '<span class="sk-dot">' + (done ? '✅' : n.i) + '</span>' +
      '<div class="sk-nt"><b>' + esc(n.t) + '</b><small>' + fa(n.need) + ' XP • جایزه: ' + esc(Object.keys(n.rw || {}).length ? '' : '—') + '</small>' +
      (done || ready ? '' : '<div class="sk-bar"><i style="width:' + pct + '%"></i></div>') + '</div>' +
      (done ? '<span class="chip" style="color:' + D.c + '">گرفته شد</span>'
        : ready ? '<button type="button" class="btn sm gold" data-act="skClaim" data-dom="' + dom + '" data-id="' + n.id + '">🎁 بگیر</button>'
        : '<span class="chip">' + fa(pct) + '٪</span>') +
      '</div>';
  }).join('');
  return '<div class="sk-branch" style="--bc:' + D.c + '"><div class="sk-bhead"><span>' + D.i + ' ' + esc(D.l) + '</span><b>' + fa(xp || 0) + ' XP</b></div>' +
    '<p class="small muted" style="margin-bottom:4px">' + esc(D.d) + '</p>' + nodes + '</div>';
}
function bossCard(b, teacher) {
  const m = BM[b.metric] || { l: b.metric, i: '🐉', hint: '' };
  const left = Math.ceil((isoToDate(b.to) - isoToDate(todayISO())) / 864e5);
  const pct = Math.round(b.remain / b.target * 100);
  const stamp = b.status === 'defeated' ? '<span class="sk-stamp" style="color:#86efac">💀 شکست خورد!</span>' : b.status === 'escaped' ? '<span class="sk-stamp" style="color:#fca5a5">🌫 فرار کرد…</span>' : '';
  return '<div class="sk-boss ' + (b.status !== 'active' ? b.status : '') + '">' + stamp +
    '<div class="spread"><div class="row" style="gap:12px"><span class="ico">' + (b.icon || '🐉') + '</span>' +
    '<div><b style="font-size:1.1rem">' + esc(b.title) + '</b><div style="font-size:.72rem;opacity:.85">' + jShort(b.from) + ' تا ' + jShort(b.to) + (b.status === 'active' ? ' • ' + fa(Math.max(0, left)) + ' روز مانده' : '') + '</div></div></div>' +
    '<div class="sk-chipw">' + rwChips(b.reward || {}, true) + '</div></div>' +
    (b.flavor ? '<p style="font-size:.8rem;opacity:.9;margin-top:8px;line-height:1.9">' + esc(b.flavor) + '</p>' : '') +
    '<div class="sk-hp"><i style="width:' + pct + '%"></i><span>جان غول: ' + fa(b.remain) + ' از ' + fa(b.target) + '</span></div>' +
    '<div class="sk-chipw"><span class="chip">' + m.i + ' ' + esc(m.l) + ': ' + fa(b.p) + ' ضربه</span><span class="chip">⚔️ ' + fa(b.target - b.p >= 0 ? b.target - b.p : 0) + ' ضربه تا شکست</span></div>' +
    (b.status === 'active' ? '<p style="font-size:.72rem;opacity:.85;margin-top:8px">💡 ' + esc(m.hint || '') + ' — این یک نبرد گروهی است؛ هر کس سهم خودش را می‌زند.</p>' : '') +
    (teacher ? '<div class="row mt" style="gap:6px">' + (b.status !== 'active' ? '<button type="button" class="btn sm ghost" data-act="skBossDel" data-id="' + b.id + '">🗑 حذف</button>' : '<span class="chip">در جریان…</span>') + '</div>' : '') +
    '</div>';
}
function stuView() {
  const v = skv(), xp = v.xp || {}, claimed = v.claimed || [];
  const total = (xp.acad||0)+(xp.social||0)+(xp.disc||0)+(xp.crea||0);
  const active = (v.bosses || []).filter(b => b.status === 'active');
  const past = (v.bosses || []).filter(b => b.status !== 'active').slice(-3).reverse();
  return '<div class="gr"><div class="gr-hero"><div class="spread"><div><h1>🌳 درخت مهارت من</h1>' +
    '<p>هر کاری که در سامانه می‌کنی در یک شاخه جوانه می‌زند؛ گره‌ها را که باز کردی جایزهٔ واقعی می‌گیری.</p>' +
    '<div class="gr-quick"><span class="q">⚡ <b>' + fa(total) + '</b> XP کل</span><span class="q">🎁 <b>' + fa(claimed.length) + '</b> گره گرفته‌شده</span><span class="q">🐉 <b>' + fa(active.length) + '</b> غول فعال</span></div></div></div></div>' +
    '<div class="sk-branches mb">' + Object.keys(DOM).map(d => branchHTML(d, xp[d], claimed)).join('') + '</div>' +
    '<h3 class="mb">🐉 غول‌های مرحله (نبرد گروهی کلاس)</h3>' +
    (active.length ? '<div class="grid g2" style="gap:12px;align-items:start">' + active.map(b => bossCard(b, false)).join('') + '</div>' : '<div class="card">' + empty('🕊️', 'غولی فعال نیست', 'با شکست غول قبلی، کلاس نفس راحتی کشید!') + '</div>') +
    (past.length ? '<h3 class="mb mt">📜 نبردهای گذشته</h3><div class="grid g2" style="gap:12px;align-items:start">' + past.map(b => bossCard(b, false)).join('') + '</div>' : '') +
    '</div>';
}
function tView() {
  const v = skv();
  const tab = SK.tab;
  const tabs = [['tree', '🌳 درخت کلاس'], ['boss', '🐉 غول‌ها', (v.bosses || []).filter(b => b.status === 'active').length]];
  let body = '';
  if (tab === 'tree') {
    body = '<div class="mk-box"><div class="spread mb"><b>⚡ XP شاخه‌ها برای هر دانش‌آموز</b><span class="chip">XP از پاداش‌های بخش رشد به‌صورت خودکار جمع می‌شود</span></div>' +
      '<div class="tw"><table class="tbl"><thead><tr><th>دانش‌آموز</th><th>📚 دانش</th><th>🤝 همکاری</th><th>🎯 انضباط</th><th>🧠 خلاقیت</th><th>کل</th><th>گره‌ها</th><th>اعطا</th></tr></thead><tbody>' +
      (v.rows || []).map(r => '<tr><td><div class="row" style="gap:8px;flex-wrap:nowrap">' + avHTML(r, 'sm') + '<b class="small">' + esc(r.name) + '</b></div></td>' +
        '<td>' + fa(r.acad) + ' <button type="button" class="ib sm" data-act="skGrant" data-sid="' + r.id + '" data-dom="acad" title="اعطای XP دانش">+</button></td>' +
        '<td>' + fa(r.social) + ' <button type="button" class="ib sm" data-act="skGrant" data-sid="' + r.id + '" data-dom="social" title="اعطای XP همکاری">+</button></td>' +
        '<td>' + fa(r.disc) + ' <button type="button" class="ib sm" data-act="skGrant" data-sid="' + r.id + '" data-dom="disc" title="اعطای XP انضباط">+</button></td>' +
        '<td>' + fa(r.crea) + ' <button type="button" class="ib sm" data-act="skGrant" data-sid="' + r.id + '" data-dom="crea" title="اعطای XP خلاقیت">+</button></td>' +
        '<td><b>' + fa(r.total) + '</b></td><td>' + fa(r.nodes) + ' 🎁</td><td></td></tr>').join('') +
      '</tbody></table></div></div>';
  } else {
    body = '<div class="grid g2" style="gap:12px;align-items:start">' + ((v.bosses || []).slice().reverse().map(b => bossCard(b, true)).join('') || '<div class="card">' + empty('🐉', 'غولی نیست', 'اولین غول ماه را بساز.') + '</div>') + '</div>' +
      '<div class="row mt"><button type="button" class="btn" data-act="skBossNew">➕ غول جدید</button></div>';
  }
  return '<div class="gr"><div class="gr-hero"><div class="spread"><div><h1>🌳🐉 درخت مهارت و غول‌ها</h1>' +
    '<p>XP هر دانش‌آموز در چهار شاخه جمع می‌شود؛ غول‌ها هدف مشترک کل کلاس‌اند و با شکستشان به همه پاداش می‌رسد.</p>' +
    '<div class="gr-quick"><span class="q">🐉 <b>' + fa((v.bosses || []).filter(b => b.status === 'active').length) + '</b> غول فعال</span><span class="q">💀 <b>' + fa((v.bosses || []).filter(b => b.status === 'defeated').length) + '</b> شکست‌خورده</span></div></div>' +
    '<div class="row"><button type="button" class="btn" data-act="skBossNew">➕ غول جدید</button></div></div></div>' +
    '<div class="tabs">' + tabs.map(([k, l, n]) => '<button type="button" class="' + (tab === k ? 'on' : '') + '" data-act="skTab" data-tab="' + k + '">' + l + (n ? ' (' + fa(n) + ')' : '') + '</button>').join('') + '</div>' +
    '<div id="skBody">' + body + '</div></div>';
}
function bossForm() {
  const t = todayISO(), j = C.jOf(t);
  UI.jdate.skfrom = t;
  UI.jdate.skto = C.jToISO(j.jy, j.jm, C.Jalali.monthLen(j.jy, j.jm));
  return '<form data-form="skBoss" class="gr">' +
    '<div class="field"><label class="lbl">نام غول</label><input class="input" name="title" required placeholder="مثلاً: غولِ بی‌نظمیِ آبان"></div>' +
    '<div class="grid g2"><div class="field"><label class="lbl">آیکن</label><input class="input" name="icon" maxlength="4" value="🐉"></div>' +
    '<div class="field"><label class="lbl">جان غول (تعداد ضربه)</label><input class="input" data-fa inputmode="numeric" name="target" value="۱۰۰" required></div></div>' +
    '<div class="field"><label class="lbl">با چه کاری ضربه می‌خورد؟</label><select class="select" name="metric">' + Object.keys(BM).map(k => '<option value="' + k + '">' + BM[k].i + ' ' + esc(BM[k].l) + '</option>').join('') + '</select></div>' +
    '<div class="field"><label class="lbl">داستان غول (برای بچه‌ها)</label><textarea class="input" name="flavor" rows="2" placeholder="این غول با هر … قوی‌تر می‌شود؛ تنها راه شکستش …"></textarea></div>' +
    '<div class="card mb" style="padding:13px;background:var(--surface2)"><h3 class="mb">🗓️ بازهٔ نبرد (شمسی)</h3>' +
    '<div class="field"><label class="lbl">از</label>' + jDateSelects('skfrom') + '</div>' +
    '<div class="field" style="margin-bottom:0"><label class="lbl">تا</label>' + jDateSelects('skto') + '</div></div>' +
    '<div class="grid g4"><div class="field"><label class="lbl">🪙 امتیاز</label><input class="input" data-fa name="rp" value="۴"></div>' +
    '<div class="field"><label class="lbl">⚡ XP</label><input class="input" data-fa name="rx" value="۴۰"></div>' +
    '<div class="field"><label class="lbl">🎰 چرخش</label><input class="input" data-fa name="rs" value="۱"></div>' +
    '<div class="field"><label class="lbl">🧊 فریز</label><input class="input" data-fa name="rf" value="۰"></div></div>' +
    '<button class="btn" type="submit" style="width:100%">🐉 آزاد کردن غول!</button></form>';
}

const baseNav = navItems, baseRV = renderView;
navItems = function () {
  const items = baseNav();
  const e = ['skills', '🌳', isT() ? 'درخت مهارت و غول‌ها' : 'درخت مهارت من'];
  const at = items.findIndex(x => x[0] === 'growth' || x[0] === 'shop');
  if (at > -1) items.splice(at + 1, 0, e); else items.push(e);
  return items;
};
renderView = function () {
  if (UI.section !== 'skills') return baseRV();
  try { document.getElementById('view').innerHTML = '<div class="ve">' + (isT() ? tView() : stuView()) + '</div>'; }
  catch (e) { console.error('skills', e); document.getElementById('view').innerHTML = '<div class="card">' + empty('🛠️', 'خطا در نمایش درخت مهارت', '', '<button type="button" class="btn" data-act="reload">بارگذاری مجدد</button>') + '</div>'; }
};
ACT.skTab = el => { SK.tab = el.dataset.tab; renderView(); snd('tap'); };
ACT.skClaim = el => {
  send('sk.node.claim', { domain: el.dataset.dom, nodeId: el.dataset.id }, null, { sound: null })
    .then(r => { if (r) { snd('win'); toast('🎁 گرهٔ مهارت باز شد! جایزه‌ات اضافه شد', 'ok', null, 7000); renderView(); } })
    .catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
};
ACT.skGrant = el => {
  const sid = el.dataset.sid, dom = el.dataset.dom, s = stuById(S(), sid);
  promptDlg({ title: '⚡ اعطای XP ' + DOM[dom].l + ' به ' + (s ? s.name : ''), placeholder: 'مقدار XP', value: '۱۰', onOk: v => {
    send('sk.grant', { sid, domain: dom, xp: num(v) || 10 }, null, { sound: null }).then(r => { if (r) { snd('pop'); toast('⚡ ' + fa(r.amt) + ' XP به شاخهٔ ' + DOM[dom].l + ' اضافه شد', 'ok'); renderView(); } });
  } });
};
ACT.skBossNew = () => openDrawer('🐉 غول جدید', bossForm(), true);
ACT.skBossDel = el => confirmDlg({ title: 'حذف غول', body: 'غول و سابقهٔ نبردش حذف شود؟', okText: 'حذف', danger: true, onOk: () => send('sk.boss.delete', { id: el.dataset.id }, null, { msg: 'غول حذف شد', undo: true, sound: 'err' }).then(renderView) });
FORM.skBoss = form => {
  const fd = new FormData(form);
  send('sk.boss.create', {
    title: String(fd.get('title') || ''), icon: String(fd.get('icon') || '🐉'), flavor: String(fd.get('flavor') || ''),
    metric: fd.get('metric'), target: num(fd.get('target')) || 100,
    from: UI.jdate.skfrom || todayISO(), to: UI.jdate.skto || todayISO(),
    rp: num(fd.get('rp')), rx: num(fd.get('rx')), rs: num(fd.get('rs')), rf: num(fd.get('rf'))
  }, null, { sound: null }).then(r => { if (r) { snd('gavel'); toast('🐉 غول آزاد شد! کلاس باید با هم شکستش بدهند', 'ok', null, 8000); closeDrawer(); renderView(); } });
};
if (S() && SESS) render(true);
})();
