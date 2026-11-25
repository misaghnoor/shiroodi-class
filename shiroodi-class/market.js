/* market.js — بورس دانش، بیمه، اهداف همکاری (نسخهٔ فشرده و امن) */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.EC_METRICS || typeof navItems !== 'function') return;

const MET = C.EC_METRICS, price = C.ecPrice, chg = C.ecChange, INS = C.EC_INS_STATUS;
const M = { tab: 'market', asset: '', qty: 1, ins: { assetId: '', qty: 1, days: 5, ratio: 75 } };
const ec = () => S().econ || { assets: [], missions: [], policies: [], fund: {}, settings: {} };
const myAsset = () => { const a = ec().assets || []; return a.find(x => x.id === M.asset) || a[0]; };
const pill = (t, c, i) => `<span class="gr-pill" style="--pc:${c}">${i || ''} ${esc(t)}</span>`;

/* ---------- استایل مینیمال ---------- */
const CSS = `.mk-box{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow);min-width:0}
.mk-price{font-family:var(--display);font-size:2.4rem;font-weight:400;line-height:1.1}
.mk-up{color:#16a34a;font-weight:800}.mk-down{color:#e11d48;font-weight:800}
.mk-step{display:inline-flex;align-items:center;border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:var(--overlay)}
.mk-step button{border:none;background:var(--surface2);width:36px;height:38px;font-size:1.05rem;font-weight:800;color:var(--ink)}
.mk-step b{min-width:50px;text-align:center;font-family:var(--display);font-size:1.15rem;font-weight:400}
.mk-chip{border:1.5px solid var(--line);background:var(--overlay);border-radius:14px;padding:8px 13px;font-size:.82rem;font-weight:800;color:var(--muted);display:inline-flex;align-items:center;gap:7px;transition:all .16s}
.mk-chip.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,var(--ac,var(--gold)),color-mix(in srgb,var(--ac,var(--gold)) 60%,#000))}
.mk-pol{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:15px;box-shadow:var(--shadow);overflow:hidden}
.mk-pol::before{content:'';position:absolute;top:0;bottom:0;right:0;width:5px;background:var(--sc,#0ea5e9)}
.mk-quote{border:1.5px solid color-mix(in srgb,#0ea5e9 40%,var(--line));background:color-mix(in srgb,#0ea5e9 7%,var(--surface));border-radius:16px;padding:14px}
.mk-quote .qr{display:flex;justify-content:space-between;gap:10px;font-size:.82rem;padding:4px 0;border-bottom:1px dashed var(--line)}
.mk-fund{background:linear-gradient(135deg,#0369a1,#0ea5e9 55%,#38bdf8);color:#fff;border-radius:20px;padding:18px;position:relative;overflow:hidden}
.mk-fund b{font-family:var(--display);font-weight:400}
.mk-bar{height:12px;border-radius:99px;background:var(--surface2);border:1px solid var(--line);overflow:hidden;margin-top:10px}
.mk-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--mc),color-mix(in srgb,var(--mc) 55%,#fff))}
.mk-rank{display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px dashed var(--line)}
.mk-rank .bar{flex:1;height:10px;border-radius:99px;background:var(--surface2);overflow:hidden}
.mk-rank .bar i{display:block;height:100%;border-radius:99px}
.mk-mission{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow);overflow:hidden}
.mk-mission::before{content:'';position:absolute;top:0;bottom:0;right:0;width:5px;background:var(--mc,#1d4ed8)}
@media (max-width:960px){.mk .grid.g2,.mk-grid2{grid-template-columns:1fr !important}}
@media (max-width:760px){.mk-box{padding:13px}.mk-price{font-size:1.8rem}.mk-box [dir=ltr]{max-width:100%;overflow-x:auto}}`;
const stl = document.createElement('style'); stl.id = 'mkStyles3'; if (!document.getElementById('mkStyles3')) document.head.appendChild(stl); stl.textContent = CSS;

/* ---------- نمودار کندلی ساده ---------- */
function candleChart(series) {
  const s = (series || []).slice(-40);
  if (!s.length) return '<p class="small muted">هنوز کندلی نیست.</p>';
  const w = 660, h = 250, p = 36, pb = 50;
  let mn = Infinity, mx = -Infinity;
  s.forEach(x => { mn = Math.min(mn, x.l); mx = Math.max(mx, x.h); });
  const pad = (mx - mn) * 0.12 || 5; mn -= pad; mx += pad;
  const X = i => p + (w - 2 * p) * (s.length === 1 ? .5 : i / (s.length - 1));
  const Y = v => h - pb - (h - p - pb) * ((v - mn) / (mx - mn));
  const bw = Math.max(3, Math.min(14, (w - 2 * p) / s.length * 0.62));
  let grid = '';
  [0, .25, .5, .75, 1].forEach(k => { const v = mn + (mx - mn) * k; grid += `<line x1="${p}" x2="${w - p}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-dasharray="4 5"/><text x="${p - 6}" y="${Y(v) + 4}" font-size="10" fill="var(--muted)" text-anchor="end">${faNum(v, 0)}</text>`; });
  const candles = s.map((x, i) => {
    const up = x.c >= x.o, col = up ? '#16a34a' : '#e11d48', cx = X(i);
    return `<g><line x1="${cx}" x2="${cx}" y1="${Y(x.h)}" y2="${Y(x.l)}" stroke="${col}" stroke-width="1.6"/>
      <rect x="${cx - bw / 2}" y="${Y(Math.max(x.o, x.c))}" width="${bw}" height="${Math.max(2, Math.abs(Y(x.o) - Y(x.c)))}" fill="${col}" rx="1.5"><title>${jShort(x.d)}: O=${faNum(x.o)} H=${faNum(x.h)} L=${faNum(x.l)} C=${faNum(x.c)}</title></rect></g>`;
  }).join('');
  const last = s[s.length - 1];
  return `<div dir="ltr" style="overflow-x:auto"><svg viewBox="0 0 ${w} ${h}" style="width:100%;min-width:320px;height:auto">${grid}${candles}
    <line x1="${p}" x2="${w - p}" y1="${Y(last.c)}" y2="${Y(last.c)}" stroke="var(--acc)" stroke-dasharray="6 4" stroke-width="1.2"/>
    <text x="${w - p}" y="${Y(last.c) - 5}" font-size="10.5" font-weight="800" fill="var(--acc)" text-anchor="end">${faNum(last.c)}</text></svg></div>`;
}

/* ---------- تب بورس ---------- */
function marketTab() {
  const st = S(), e = ec(), a = myAsset();
  if (!a) return `<div class="mk-box">${empty('📈', 'سهامی تعریف نشده', 'معلم از تب قواعد سهام جدید بسازد.')}</div>`;
  const p = price(a), ch = chg(a), pf = isT() ? null : C.ecPortfolio(st, SESS.sid);
  const my = pf ? (pf.items.find(x => x.id === a.id) || null) : null;
  const w = isT() ? null : (e.wallet != null ? e.wallet : C.ecWallet(st, SESS.sid).balance);
  const fee = e.settings.tradeFee || 0;
  const est = Math.round(M.qty * p * (1 + fee / 100));
  return `<div class="mk-chips mb">${(e.assets || []).filter(x => !x.paused).map(x => { const c2 = chg(x); return `<button type="button" class="mk-chip ${x.id === a.id ? 'on' : ''}" style="--ac:${x.color}" data-act="mkPick" data-id="${x.id}">${x.icon} ${esc(x.symbol)} <span>${faNum(price(x), 0)}</span> <span class="${c2 >= 0 ? 'mk-up' : 'mk-down'}">${c2 >= 0 ? '▲' : '▼'}${faNum(Math.abs(c2), 1)}٪</span></button>`; }).join('')}</div>
  <div class="grid g2 mk-grid2" style="align-items:start">
    <div class="mk-box"><div class="spread mb"><div class="row" style="gap:10px"><span class="gr-ico" style="--kc:${a.color}">${a.icon}</span>
      <div><b style="font-size:1.05rem">${esc(a.name)}</b><div class="small muted">${a.subject === '@help' ? 'سنجه: همکاری کلاس' : 'سنجه: درس ' + esc(a.subject)}</div></div></div>
      <div style="text-align:left"><div class="mk-price" style="color:${a.color}">${faNum(p)}</div><div class="${ch >= 0 ? 'mk-up' : 'mk-down'}">${ch >= 0 ? '▲' : '▼'} ${faNum(Math.abs(ch), 1)}٪ نسبت به دیروز</div></div></div>
      ${candleChart(a.series)}</div>
    <div>${!isT() ? `<div class="mk-box mb"><div class="spread"><div><span class="small muted">کیف پول</span><div class="mk-price" style="font-size:1.8rem;color:var(--gold)">🪙 ${fa(w || 0)}</div></div>
        <div style="text-align:left"><span class="small muted">ارزش سهام</span><div class="mk-price" style="font-size:1.8rem;color:${a.color}">${fa(pf ? pf.value : 0)}</div></div></div>
        <div class="divider"></div>
        <div class="row"><span class="small bold">تعداد</span><span class="mk-step"><button type="button" data-act="mkQty" data-d="-1">−</button><b id="mkQty">${fa(M.qty)}</b><button type="button" data-act="mkQty" data-d="1">+</button></span></div>
        <div class="row mt"><span class="chip">قیمت: ${faNum(p)}</span><span class="chip">هزینه: ${fa(est)}</span></div>
        <div class="row mt"><button type="button" class="btn ok" style="flex:1" data-act="mkBuy" data-id="${a.id}">📈 خرید</button>
          <button type="button" class="btn danger" style="flex:1" data-act="mkSell" data-id="${a.id}" ${my ? '' : 'disabled'}>📉 فروش</button></div>
        ${my ? `<div class="gr-note mt">دارم: ${fa(my.qty)} • سود: <b class="${my.pnl >= 0 ? 'mk-up' : 'mk-down'}">${my.pnl >= 0 ? '+' : ''}${fa(my.pnl)}</b></div>
        <button type="button" class="btn soft sm mt" data-act="mkGoIns" data-id="${a.id}">🛡️ بیمهٔ این سهم</button>` : ''}</div>` : `<div class="mk-box"><button type="button" class="btn sm soft" data-act="mkRoll">🔄 به‌روزرسانی بازار و بیمه‌ها</button></div>`}</div></div>`;
}

/* ---------- تب بیمه ---------- */
function insTab() {
  const st = S(), e = ec();
  if (!isT()) {
    const pf = C.ecPortfolio(st, SESS.sid);
    const insurable = pf.items.filter(x => C.ecFreeQty(st, SESS.sid, x.id) > 0);
    if (!M.ins.assetId || !insurable.some(x => x.id === M.ins.assetId)) M.ins.assetId = insurable[0] ? insurable[0].id : '';
    const a = (e.assets || []).find(x => x.id === M.ins.assetId);
    const fq = a ? C.ecFreeQty(st, SESS.sid, a.id) : 0;
    M.ins.qty = clamp(M.ins.qty, 1, Math.max(1, fq));
    const q = a && fq > 0 ? C.ecQuote(st, { sid: SESS.sid, assetId: a.id, qty: M.ins.qty, days: M.ins.days, ratio: M.ins.ratio }) : null;
    const mine = (e.policies || []).filter(p => p.sid === SESS.sid).slice().reverse();
    return `<div class="grid g2 mk-grid2" style="align-items:start">
      <div class="mk-box"><b class="small mb" style="display:block">🛡️ بیمه‌نامهٔ جدید</b>
        ${insurable.length ? `<div class="field"><label class="lbl">کدام سهم؟</label><select class="select" data-chg="mkInsAsset">${insurable.map(x => `<option value="${x.id}" ${x.id === M.ins.assetId ? 'selected' : ''}>${x.icon} ${esc(x.name)} — ${fa(C.ecFreeQty(st, SESS.sid, x.id))} آزاد</option>`).join('')}</select></div>
        <div class="field"><label class="lbl">تعداد</label><span class="mk-step"><button type="button" data-act="mkInsQty" data-d="-1">−</button><b id="mkInsQty">${fa(M.ins.qty)}</b><button type="button" data-act="mkInsQty" data-d="1">+</button></span></div>
        <div class="field"><label class="lbl">روز پوشش</label><div class="seg">${[3, 5, 7, 10].map(d => `<button type="button" class="${M.ins.days === d ? 'on' : ''}" data-act="mkInsDays" data-v="${d}">${fa(d)}</button>`).join('')}</div></div>
        <div class="field"><label class="lbl">درصد پوشش</label><div class="seg">${[50, 75, 100].map(r => `<button type="button" class="${M.ins.ratio === r ? 'on' : ''}" data-act="mkInsRatio" data-v="${r}">${fa(r)}٪</button>`).join('')}</div></div>
        ${q ? `<div class="mk-quote mt">
          <div class="qr"><span>ارزش تحت پوشش</span><b>${fa(q.value)} 🪙</b></div>
          <div class="qr"><span>نوسان سهم</span><b>${faNum(q.vol * 100, 1)}٪</b></div>
          <div class="qr"><span>خسارت انتظاررفته</span><b>${fa(q.expLoss)} 🪙</b></div>
          <div class="qr"><span>سقف خسارت</span><b>${fa(q.cap)} 🪙</b></div>
          <div class="qr"><span style="font-weight:800">حق بیمه</span><b style="font-size:1.2rem;color:#0ea5e9">${fa(q.premium)} 🪙</b></div>
          ${q.ok ? '' : `<div class="qr"><span style="color:#e11d48">⚠️ ${esc(q.reason)}</span></div>`}
        </div>
        <button type="button" class="btn mt" style="width:100%;background:linear-gradient(135deg,#0369a1,#0ea5e9)" data-act="mkInsBuy" ${q && q.ok ? '' : 'disabled'}>🛡️ خرید بیمه با ${fa(q.premium)} سکه</button>` : ''}` : empty('📭', 'سهمی برای بیمه نداری', 'اول سهم بخر.')}</div>
      <div class="mk-box"><b class="small mb" style="display:block">📜 بیمه‌نامه‌های من</b>
        ${mine.length ? mine.slice(0, 6).map(p => { const a2 = (e.assets || []).find(x => x.id === p.assetId); const stt = INS[p.status] || INS.active; const cur = a2 ? price(a2) : p.strike;
          return `<div class="mk-pol" style="--sc:${stt.c}"><div class="row" style="gap:9px"><span class="gr-ico" style="--kc:${stt.c}">${a2 ? a2.icon : '🛡️'}</span>
          <div style="flex:1"><b class="small">${a2 ? esc(a2.name) : ''}</b><div class="small muted">${fa(p.qty)} سهم • ${fa(p.ratio)}٪ • ${fa(p.days)} روز</div></div>
          ${pill(stt.l, stt.c, stt.i)}</div>
          <div class="row mt"><span class="chip">پایه ${faNum(p.strike)}</span><span class="chip">الآن ${faNum(cur)}</span><span class="chip">سقف ${fa(p.cap || 0)}</span></div>
          ${p.status === 'active' ? `<button type="button" class="btn ghost sm mt" data-act="mkInsCancel" data-id="${p.id}">↩️ فسخ</button>` : ''}</div>`; }).join('') : empty('🛡️', 'بیمه‌نامه‌ای نداری', '')}</div></div>`;
  }
  /* نمای معلم */
  const f = e.fund || { balance: 0, premiums: 0, payouts: 0 };
  const exp = C.ecExposure(st);
  const pols = (e.policies || []).slice().reverse().slice(0, 15);
  return `<div class="grid g2 mk-grid2 mb" style="align-items:start">
    <div class="mk-fund"><b style="font-size:.85rem">🏦 صندوق بیمه</b><br><b style="font-size:2.2rem">${fa(f.balance || 0)} 🪙</b>
      <div class="row mt" style="gap:6px;font-size:.8rem"><span>دریافتی: <b>${fa(f.premiums || 0)}</b></span><span>پرداختی: <b>${fa(f.payouts || 0)}</b></span><span>تعهد: <b>${fa(exp)}</b></span></div>
      <button type="button" class="btn sm mt" style="background:rgba(255,255,255,.25)" data-act="mkInsSettle">⚙️ تصفیهٔ دستی</button></div>
    <div class="mk-box"><b class="small mb" style="display:block">⚙️ قواعد بیمه</b>
      <div class="srow"><span>🛡️ فعال</span><span class="switch"><input type="checkbox" ${(e.settings.ins || {}).enabled !== false ? 'checked' : ''} data-chg="mkInsSet" data-k="enabled"><i></i></span></div>
      <div class="srow"><span>حاشیهٔ امنیت (٪)</span><span class="mk-step"><button type="button" data-act="mkInsStep" data-k="loading" data-d="-5">−</button><b id="mkIS_loading">${fa((e.settings.ins || {}).loading || 30)}</b><button type="button" data-act="mkInsStep" data-k="loading" data-d="5">+</button></span></div>
      <div class="srow"><span>سقف افت (٪)</span><span class="mk-step"><button type="button" data-act="mkInsStep" data-k="cap" data-d="-5">−</button><b id="mkIS_cap">${fa((e.settings.ins || {}).cap || 35)}</b><button type="button" data-act="mkInsStep" data-k="cap" data-d="5">+</button></span></div>
      <p class="small muted mt">حق بیمه = خسارت انتظاررفته × (۱ + حاشیه) + کارمزد.</p></div></div>
  <div class="mk-box"><b class="small mb" style="display:block">📜 همهٔ بیمه‌نامه‌ها</b>
    ${pols.length ? pols.map(p => { const a2 = (e.assets || []).find(x => x.id === p.assetId); const stt = INS[p.status] || INS.active; const stu = stuById(st, p.sid);
      return `<div class="mk-pol" style="--sc:${stt.c}"><div class="row"><span class="gr-ico" style="--kc:${stt.c}">${a2 ? a2.icon : '🛡️'}</span>
        <div style="flex:1"><b class="small">${esc(stu ? stu.name : '')} — ${a2 ? esc(a2.name) : ''}</b><div class="small muted">${fa(p.qty)} سهم • ${fa(p.ratio)}٪ • ${fa(p.days)} روز</div></div>${pill(stt.l, stt.c)}</div>
        ${p.status === 'settled' ? `<div class="gr-note mt">خسارت: <b>${fa(p.payout || 0)}</b> سکه</div>` : ''}</div>`; }).join('') : empty('🛡️', 'بیمه‌نامه‌ای نیست', '')}</div>`;
}

/* ---------- اهداف همکاری ---------- */
function missionCard(m, i) {
  const st = S(), M2 = MET[m.metric] || MET.hw_rate;
  const today = todayISO(), left = Math.ceil((isoToDate(m.to) - isoToDate(today)) / 864e5);
  let body = '';
  if (m.scope === 'battle') {
    const ranks = (st.groups || []).map(g => ({ g, v: C.ecMissionValue(st, m, g.id) })).sort((a, b) => b.v - a.v);
    const mx = Math.max(1, ...ranks.map(r => r.v));
    body = ranks.map((r, k) => `<div class="mk-rank"><span style="width:22px">${['🥇', '🥈', '🥉', '🏅', '🏅', '🏅'][k]}</span><b class="small" style="width:60px">${esc(r.g.name)}</b><div class="bar"><i style="width:${r.v / mx * 100}%;background:${r.g.color}"></i></div><b class="small" style="color:${r.g.color}">${fa(r.v)}</b></div>`).join('');
  } else {
    const v = C.ecMissionValue(st, m, m.scope === 'group' ? m.groupId : null);
    const pct = clamp(v / Math.max(1, m.target) * 100, 0, 100);
    body = `<div class="spread small bold mt"><span>${fa(v)}${M2.unit}</span><span>هدف ${fa(m.target)}${M2.unit}</span></div><div class="mk-bar" style="--mc:${pct >= 100 ? '#16a34a' : '#1d4ed8'}"><i style="width:${pct}%"></i></div>`;
  }
  const rs = m.status === 'settled' ? '🏁 پایان' : left < 0 ? '⏳ انتظار تسویه' : `⏳ ${fa(left)} روز`;
  return `<div class="mk-mission" style="--mc:${m.scope === 'battle' ? '#d97706' : '#1d4ed8'};--i:${i}">
    <div class="spread"><div class="row"><span class="gr-ico" style="--kc:${m.scope === 'battle' ? '#d97706' : '#1d4ed8'}">${M2.i}</span>
      <div><b class="small">${esc(m.title)}</b><div class="small muted">${m.scope === 'battle' ? '🏆 نبرد' : m.scope === 'group' ? '🧩 گروهی' : '👥 کل کلاس'} • ${jShort(m.from)} تا ${jShort(m.to)}</div></div></div>${pill(rs, m.status === 'settled' ? '#16a34a' : '#1d4ed8')}</div>
    ${m.desc ? `<div class="gr-note">${esc(m.desc)}</div>` : ''}${body}
    <div class="row mt"><span class="chip">🪙 ${fa((m.reward || {}).points || 0)}</span><span class="chip">⚡ ${fa((m.reward || {}).xp || 0)}</span></div>
    ${isT() && m.status === 'active' && left < 0 ? `<button type="button" class="btn ok sm mt" data-act="mkSettle" data-id="${m.id}">🏁 تسویه</button>` : ''}</div>`;
}
function missionsTab() {
  const list = (ec().missions || []).slice().sort((a, b) => (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1));
  return `<div class="grid g2 mk-grid2 stagger">${list.map((m, i) => missionCard(m, i)).join('') || empty('🎯', 'ماموریتی نیست', '')}</div>
  ${isT() ? `<div class="row mt"><button type="button" class="btn" data-act="mkMNew">➕ ماموریت جدید</button></div>` : ''}`;
}

/* ---------- رتبه‌بندی و قواعد ---------- */
function boardTab() {
  const b = C.ecBoard(S());
  const rows = b.map((x, i) => `<tr><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : fa(i + 1)}</td><td><b class="small">${esc(x.name)}</b></td><td>🪙 ${fa(x.cash)}</td><td>📈 ${fa(x.value)}</td><td><b>${fa(x.total)}</b></td><td class="${x.pnl >= 0 ? 'mk-up' : 'mk-down'}">${x.pnl >= 0 ? '+' : ''}${fa(x.pnl)}</td></tr>`).join('');
  return `<div class="mk-box"><b class="small mb" style="display:block">🏆 رتبه‌بندی دارایی کلاس</b>
    <div class="tw"><table class="tbl"><thead><tr><th>#</th><th>نام</th><th>نقد</th><th>سهام</th><th>کل</th><th>سود/زیان</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
function setTab() {
  const s = ec().settings;
  const step = (k, v, l) => `<div class="srow"><span>${l}</span><span class="mk-step"><button type="button" data-act="mkStep" data-k="${k}" data-d="-1">−</button><b id="mkS_${k}">${fa(v)}</b><button type="button" data-act="mkStep" data-k="${k}" data-d="1">+</button></span></div>`;
  const sw = (k, on, l) => `<div class="srow"><span>${l}</span><span class="switch"><input type="checkbox" ${on ? 'checked' : ''} data-chg="mkSet" data-k="${k}"><i></i></span></div>`;
  return `<div class="grid g2 mk-grid2" style="align-items:start">
    <div class="mk-box"><b class="small mb" style="display:block">⚙️ بورس</b>
      ${sw('marketEnabled', s.marketEnabled !== false, '📈 بورس باز باشد')}
      ${sw('edu', s.edu !== false, '📚 کارت‌های آموزشی')}
      ${sw('leaderboard', s.leaderboard !== false, '🏆 نمایش رتبه‌بندی')}
      ${step('tradeFee', s.tradeFee || 0, '💱 کارمزد (٪)')}
      ${step('maxTradeQty', s.maxTradeQty || 15, '📦 سقف سهم در معامله')}
      ${step('dailyTrades', s.dailyTrades || 5, '📅 سقف معامله در روز')}</div>
    <div class="mk-box"><b class="small mb" style="display:block">🏦 سهام کلاس</b>
      ${(ec().assets || []).map(a => `<div class="row"><span class="gr-ico" style="--kc:${a.color};width:34px;height:34px">${a.icon}</span><b class="small" style="flex:1">${esc(a.name)}</b><span class="chip">${faNum(price(a))}</span>
        <button type="button" class="ib sm" data-act="mkPause" data-id="${a.id}">${a.paused ? '🟢' : '⏸️'}</button></div>`).join('')}
      <button type="button" class="btn sm soft mt" data-act="mkANew">➕ سهام جدید</button></div></div>`;
}

/* ---------- نمای اصلی ---------- */
function viewHTML() {
  const e = ec(), pf = isT() ? null : C.ecPortfolio(S(), SESS.sid);
  const activeM = (e.missions || []).filter(m => m.status === 'active').length;
  const myPol = (e.policies || []).filter(p => p.status === 'active').length;
  const tabs = isT() ? [['market', '📈 بورس'], ['ins', '🛡️ بیمه', myPol], ['missions', '🎯 اهداف', activeM], ['board', '🏆 رتبه'], ['set', '⚙️ قواعد']]
    : [['market', '📈 بورس'], ['ins', '🛡️ بیمه', myPol], ['missions', '🎯 اهداف', activeM], ['board', '🏆 رتبه']];
  return `<div class="gr">
    <div class="gr-hero"><div class="spread"><div><h1>📈 بورس دانش، بیمه و اهداف</h1>
      <div class="gr-quick"><span class="q">🏦 <b>${fa((e.assets || []).filter(a => !a.paused).length)}</b> سهام</span><span class="q">🛡️ <b>${fa(myPol)}</b> بیمه</span><span class="q">🎯 <b>${fa(activeM)}</b> ماموریت</span>
      ${!isT() ? `<span class="q">🪙 <b>${fa(pf.cash)}</b> نقد</span><span class="q">💼 <b>${fa(pf.total)}</b> دارایی</span>` : ''}</div></div>
      ${isT() ? `<div class="row"><button type="button" class="btn" data-act="mkMNew">➕ ماموریت</button><button type="button" class="btn soft" data-act="mkRoll">🔄 به‌روز</button></div>` : ''}</div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${M.tab === k ? 'on' : ''}" data-act="mkTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="mkBody">${M.tab === 'ins' ? insTab() : M.tab === 'missions' ? missionsTab() : M.tab === 'board' ? boardTab() : M.tab === 'set' ? setTab() : marketTab()}</div></div>`;
}

/* ---------- فرم‌های کشو ---------- */
function missionForm() {
  const st = S(), today = todayISO();
  UI.jdate.mkfrom = today; UI.jdate.mkto = C.ecSchoolAdd(today, 6);
  return `<form data-form="mkMission" class="gr">
    <div class="field"><label class="lbl">نوع</label><div class="seg" id="mkScopeSeg">
      <button type="button" class="on" data-act="mkScope" data-v="class">👥 کلاس</button>
      <button type="button" data-act="mkScope" data-v="group">🧩 گروه</button>
      <button type="button" data-act="mkScope" data-v="battle">🏆 نبرد</button></div>
      <input type="hidden" id="mkScopeVal" value="class"></div>
    <div class="field" id="mkGroupBox" style="display:none"><label class="lbl">گروه</label><select class="select" id="mkGroupSel">${(st.groups || []).map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl">عنوان</label><input class="input" id="mkTitle" required></div>
    <div class="grid g2"><div class="field"><label class="lbl">سنجه</label><select class="select" id="mkMetric">${Object.entries(MET).map(([k, v]) => `<option value="${k}">${v.i} ${v.l}</option>`).join('')}</select></div>
      <div class="field"><label class="lbl">هدف</label><input class="input" data-fa inputmode="numeric" id="mkTarget" value="۹۰"></div></div>
    <div class="card mb" style="padding:13px;background:var(--surface2)"><h3 class="mb">🗓️ بازه</h3>
      <div class="field">${jDateSelects('mkfrom')}</div><div class="field">${jDateSelects('mkto')}</div></div>
    <div class="grid g3"><div class="field"><label class="lbl">🪙 امتیاز</label><input class="input" data-fa id="mkRP" value="۳"></div>
      <div class="field"><label class="lbl">⚡ تجربه</label><input class="input" data-fa id="mkRX" value="۲۵"></div>
      <div class="field"><label class="lbl">🎰 چرخش</label><input class="input" data-fa id="mkRS" value="۱"></div></div>
    <button class="btn" type="submit" style="width:100%">💾 ساخت</button></form>`;
}
function assetForm() {
  const st = S();
  return `<form data-form="mkAsset"><div class="field"><label class="lbl">نام سهام</label><input class="input" id="mkAName" required></div>
    <div class="grid g2"><div class="field"><label class="lbl">نماد</label><input class="input" id="mkASym" maxlength="8"></div>
      <div class="field"><label class="lbl">آیکن</label><input class="input" id="mkAIcon" value="📊"></div></div>
    <div class="field"><label class="lbl">سنجه</label><select class="select" id="mkASub">${(st.subjects || []).map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}<option value="@help">🤝 همکاری</option></select></div>
    <button class="btn" type="submit" style="width:100%">💾 ساخت</button></form>`;
}

/* ---------- یکپارچه‌سازی ---------- */
const baseNav = navItems, baseRV = renderView;
navItems = function () {
  const items = baseNav();
  const e = ['econ', '📈', isT() ? 'بورس و بیمه' : 'بورس من'];
  const at = items.findIndex(x => x[0] === 'shop');
  if (at > -1) items.splice(at + 1, 0, e); else items.push(e);
  return items;
};
renderView = function () {
  if (UI.section !== 'econ') return baseRV();
  try { C.ecEnsure(S()); document.getElementById('view').innerHTML = `<div class="ve">${viewHTML()}</div>`; }
  catch (e) { console.error('econ', e); }
};

/* ---------- اقدام‌ها ---------- */
ACT.mkTab = el => { M.tab = el.dataset.tab; renderView(); Sound.play('tap'); };
ACT.mkPick = el => { M.asset = el.dataset.id; M.qty = 1; renderView(); Sound.play('tap'); };
ACT.mkQty = el => { M.qty = clamp(M.qty + Number(en(el.dataset.d)), 1, ec().settings.maxTradeQty || 15); const b = document.getElementById('mkQty'); if (b) b.textContent = fa(M.qty); Sound.play('tap'); };
ACT.mkGoIns = el => { M.ins.assetId = el.dataset.id; M.ins.qty = 1; M.tab = 'ins'; renderView(); };
ACT.mkBuy = el => {
  const a = (ec().assets || []).find(x => x.id === el.dataset.id); if (!a) return;
  const cost = Math.round(M.qty * price(a) * (1 + (ec().settings.tradeFee || 0) / 100));
  confirmDlg({ title: '📈 خرید', body: `${fa(M.qty)} سهم «${a.name}» به قیمت ${fa(cost)} سکه؟`, okText: 'خرید کن', onOk: () => send('econ.trade', { assetId: el.dataset.id, side: 'buy', qty: M.qty }, null, { sound: null }).then(r => { if (r) { Sound.play('pop'); toast(`📈 ${fa(M.qty)} سهم خریدی`, 'ok'); } }) });
};
ACT.mkSell = el => {
  const a = (ec().assets || []).find(x => x.id === el.dataset.id); if (!a) return;
  const h = (S().econ.holdings || {})[SESS.sid]; const my = h && h[el.dataset.id]; const q = Math.min(M.qty, my ? my.qty : 0);
  if (!q) return toast('سهمی نداری', 'err');
  confirmDlg({ title: '📉 فروش', body: `${fa(q)} سهم «${a.name}»؟`, okText: 'بفروش', onOk: () => send('econ.trade', { assetId: el.dataset.id, side: 'sell', qty: q }, null, { sound: null }).then(r => { if (r) toast(`💰 فروش انجام شد`, 'ok'); }) });
};
ACT.mkRoll = () => send('econ.roll', {}, null, { msg: '🔄 بازار به‌روز شد' });
ACT.mkPause = el => send('econ.asset.pause', { id: el.dataset.id }, st => { const a = st.econ.assets.find(x => x.id === el.dataset.id); if (a) a.paused = !a.paused; }, { sound: 'pop' });
ACT.mkANew = () => openDrawer('➕ سهام', assetForm());
ACT.mkMNew = () => openDrawer('➕ ماموریت', missionForm(), true);
ACT.mkScope = el => {
  document.querySelectorAll('#mkScopeSeg button').forEach(b => b.classList.toggle('on', b === el));
  document.getElementById('mkScopeVal').value = el.dataset.v;
  document.getElementById('mkGroupBox').style.display = el.dataset.v === 'group' ? '' : 'none';
};
ACT.mkSettle = el => confirmDlg({ title: '🏁 تسویه', body: 'پاداش به برندگان داده می‌شود.', okText: 'تسویه کن', onOk: () => send('econ.mission.settle', { id: el.dataset.id }, null, { sound: null }).then(r => { if (r) toast(r.ok === false ? '✖️ ناموفق' : '🏆 تسویه شد', 'ok', null, 7000); }) });
ACT.mkStep = el => {
  const k = el.dataset.k, d = Number(en(el.dataset.d)) || 1, s = ec().settings;
  s[k] = clamp((s[k] || 0) + d, 0, k === 'tradeFee' ? 20 : k === 'maxTradeQty' ? 50 : 20);
  const b = document.getElementById('mkS_' + k); if (b) b.textContent = fa(s[k]);
  clearTimeout(M.stT); M.stT = setTimeout(() => send('econ.settings', { patch: { [k]: s[k] } }, st => { st.econ.settings[k] = s[k]; }, { sound: null }), 500);
};
CHG.mkSet = el => { const k = el.dataset.k, v = el.checked; send('econ.settings', { patch: { [k]: v } }, st => { st.econ.settings[k] = v; }, { msg: 'قاعده ذخیره شد' }); };
CHG.mkInsAsset = el => { M.ins.assetId = el.value; M.ins.qty = 1; renderView(); };
ACT.mkInsQty = el => { const fq = C.ecFreeQty(S(), SESS.sid, M.ins.assetId); M.ins.qty = clamp(M.ins.qty + Number(en(el.dataset.d)), 1, Math.max(1, fq)); const b = document.getElementById('mkInsQty'); if (b) b.textContent = fa(M.ins.qty); };
ACT.mkInsDays = el => { M.ins.days = Number(en(el.dataset.v)); renderView(); };
ACT.mkInsRatio = el => { M.ins.ratio = Number(en(el.dataset.v)); renderView(); };
ACT.mkInsBuy = () => {
  const q = C.ecQuote(S(), { sid: SESS.sid, assetId: M.ins.assetId, qty: M.ins.qty, days: M.ins.days, ratio: M.ins.ratio });
  if (!q || !q.ok) return toast(q ? q.reason : 'خطا', 'err');
  const a = (ec().assets || []).find(x => x.id === M.ins.assetId);
  confirmDlg({ title: '🛡️ خرید بیمه', body: `حق بیمه: ${fa(q.premium)} سکه • سقف خسارت: ${fa(q.cap)} سکه`, okText: 'بیمه کن', onOk: () => send('econ.insure', { id: uid(), assetId: M.ins.assetId, qty: M.ins.qty, days: M.ins.days, ratio: M.ins.ratio }, null, { sound: null }).then(r => { if (r) { Sound.play('win'); toast(`🛡️ بیمه فعال شد`, 'ok', null, 7000); } }) });
};
ACT.mkInsCancel = el => confirmDlg({ title: '↩️ فسخ', body: '۴۰٪ حق بیمه برمی‌گردد.', okText: 'فسخ', onOk: () => send('econ.insCancel', { id: el.dataset.id }, null, { sound: null }).then(r => { if (r) toast(`↩️ فسخ • ${fa(r.refund)} برگشت`, 'ok'); }) });
ACT.mkInsSettle = () => send('econ.insSettle', {}, null, { sound: null }).then(r => { if (r) toast(`⚙️ ${fa(r.settled)} بیمه‌نامه بررسی شد`, 'ok'); });
ACT.mkInsStep = el => {
  const k = el.dataset.k, d = Number(en(el.dataset.d)) || 1, ins = (ec().settings || {}).ins || {};
  ins[k] = clamp((ins[k] == null ? 0 : ins[k]) + d, 0, k === 'loading' ? 100 : k === 'cap' ? 80 : 20);
  const b = document.getElementById('mkIS_' + k); if (b) b.textContent = fa(ins[k]);
  clearTimeout(M.isT); M.isT = setTimeout(() => send('econ.insSettings', { patch: { [k]: ins[k] } }, st => { st.econ.settings.ins[k] = ins[k]; }, { sound: null }), 500);
};
CHG.mkInsSet = el => { const k = el.dataset.k, v = el.checked; send('econ.insSettings', { patch: { [k]: v } }, st => { st.econ.settings.ins[k] = v; }, { msg: 'قاعده ذخیره شد' }); };
FORM.mkMission = () => {
  const title = (document.getElementById('mkTitle').value || '').trim();
  if (!title) return toast('عنوان را بنویس', 'err');
  send('econ.mission.create', { id: uid(), title, scope: document.getElementById('mkScopeVal').value, groupId: document.getElementById('mkGroupSel') ? document.getElementById('mkGroupSel').value : '', metric: document.getElementById('mkMetric').value, target: num(document.getElementById('mkTarget').value) || 0, from: UI.jdate.mkfrom || todayISO(), to: UI.jdate.mkto || todayISO(), reward: { points: num(document.getElementById('mkRP').value) || 0, xp: num(document.getElementById('mkRX').value) || 0, spin: num(document.getElementById('mkRS').value) || 0 } }, null, { msg: '🎯 ماموریت ساخته شد' });
  closeDrawer();
};
FORM.mkAsset = () => {
  const name = (document.getElementById('mkAName').value || '').trim();
  if (!name) return toast('نام را بنویس', 'err');
  send('econ.asset.add', { id: uid(), name, symbol: (document.getElementById('mkASym').value || 'NEW').toUpperCase(), icon: document.getElementById('mkAIcon').value || '📊', subject: document.getElementById('mkASub').value, color: C.CPAL[Math.floor(Math.random() * 8)] }, null, { msg: '🏦 سهام ساخته شد' });
  closeDrawer();
};
if (S() && SESS) render(true);
})();
