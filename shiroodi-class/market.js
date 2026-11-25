/* market.js — بورس دانش، بیمهٔ سهام و اهداف همکاری */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.EC_METRICS || typeof navItems !== 'function') return;

const MET = C.EC_METRICS, price = C.ecPrice, chg = C.ecChange, INS = C.EC_INS_STATUS;

const CSS = `
.mk{--up:#16a34a;--down:#e11d48;--gold:#d97706;--shield:#0ea5e9;--ink2:#2b2418;--paper:#fdf6e8}
[data-theme=dark] .mk{--paper:#141d33;--ink2:#e9eef7}
.mk-hero{position:relative;overflow:hidden;border-radius:24px;padding:24px 26px;margin-bottom:18px;border:1.5px solid color-mix(in srgb,var(--gold) 30%,var(--line));
background:radial-gradient(120% 140% at 88% -10%,color-mix(in srgb,var(--gold) 26%,transparent),transparent 55%),radial-gradient(90% 120% at 8% 110%,color-mix(in srgb,#1d4ed8 20%,transparent),transparent 60%),linear-gradient(135deg,color-mix(in srgb,var(--gold) 12%,var(--paper)),color-mix(in srgb,#1d4ed8 10%,var(--paper)));box-shadow:var(--shadow)}
.mk-hero::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.35;
background-image:linear-gradient(transparent 95%,color-mix(in srgb,var(--gold) 40%,transparent) 95%),linear-gradient(90deg,transparent 95%,color-mix(in srgb,var(--gold) 25%,transparent) 95%);background-size:26px 26px}
.mk-hero>*{position:relative;z-index:2}
.mk-hero h1{font-family:var(--display);font-weight:400;font-size:2rem;color:var(--ink2)}
.mk-quick{display:flex;gap:9px;flex-wrap:wrap;margin-top:13px}
.mk-quick .q{display:inline-flex;align-items:center;gap:7px;background:color-mix(in srgb,var(--surface) 84%,transparent);border:1px solid var(--line);border-radius:13px;padding:7px 13px;font-size:.8rem;font-weight:800}
.mk-quick .q b{font-family:var(--display);font-size:1.15rem;font-weight:400}
.mk-chips{display:flex;gap:8px;flex-wrap:wrap}
.mk-chip{border:1.5px solid var(--line);background:var(--overlay);border-radius:14px;padding:8px 13px;font-size:.82rem;font-weight:800;color:var(--muted);display:inline-flex;align-items:center;gap:7px;transition:all .16s}
.mk-chip:hover{transform:translateY(-2px);border-color:var(--ac,var(--gold))}
.mk-chip.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,var(--ac,var(--gold)),color-mix(in srgb,var(--ac,var(--gold)) 60%,#000))}
.mk-chip .pr{font-variant-numeric:tabular-nums;opacity:.9}
.mk-chip .up{color:#86efac}.mk-chip .dn{color:#fca5a5}
.mk-price{font-family:var(--display);font-size:2.6rem;font-weight:400;line-height:1.1}
.mk-up{color:var(--up);font-weight:800}.mk-down{color:var(--down);font-weight:800}
.mk-box{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow);min-width:0}
.mk-step{display:inline-flex;align-items:center;border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:var(--overlay)}
.mk-step button{border:none;background:var(--surface2);width:38px;height:40px;font-size:1.1rem;font-weight:800;color:var(--ink)}
.mk-step button:hover{background:color-mix(in srgb,var(--gold) 16%,var(--surface))}
.mk-step b{min-width:52px;text-align:center;font-family:var(--display);font-size:1.2rem;font-weight:400}
.mk-pill{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:800;padding:3px 10px;border-radius:99px;background:color-mix(in srgb,var(--pc) 13%,var(--surface));color:var(--pc);border:1px solid color-mix(in srgb,var(--pc) 32%,transparent)}
.mk-mission{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow);overflow:hidden}
.mk-mission::before{content:'';position:absolute;top:0;bottom:0;right:0;width:5px;background:var(--mc,#1d4ed8)}
.mk-mission.won{border-color:color-mix(in srgb,var(--up) 45%,var(--line));background:color-mix(in srgb,var(--up) 6%,var(--surface))}
.mk-mission.lost{opacity:.75;filter:saturate(.6)}
.mk-bar{height:12px;border-radius:99px;background:var(--surface2);border:1px solid var(--line);overflow:hidden;position:relative;margin-top:10px}
.mk-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--mc),color-mix(in srgb,var(--mc) 55%,#fff));transition:width .6s}
.mk-bar .tgt{position:absolute;top:-3px;bottom:-3px;width:3px;background:var(--ink2);opacity:.6;border-radius:2px}
.mk-rank{display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px dashed var(--line)}
.mk-rank:last-child{border:none}
.mk-rank .bar{flex:1;height:10px;border-radius:99px;background:var(--surface2);overflow:hidden}
.mk-rank .bar i{display:block;height:100%;border-radius:99px}
.mk-edu{border:1.5px dashed color-mix(in srgb,var(--gold) 45%,var(--line));background:color-mix(in srgb,var(--gold) 6%,var(--surface));border-radius:16px;padding:14px}
.mk-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.mk-row:last-child{border:none}
.mk-scroll{max-height:56vh;overflow:auto;scrollbar-width:thin}
.mk-pol{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:15px 16px;box-shadow:var(--shadow);overflow:hidden}
.mk-pol::before{content:'';position:absolute;top:0;bottom:0;right:0;width:5px;background:var(--sc,var(--shield))}
.mk-pol .stamp{position:absolute;left:10px;top:8px;transform:rotate(-9deg);font-family:var(--display);font-size:.95rem;color:var(--sc);border:2.5px double var(--sc);border-radius:8px;padding:2px 10px;opacity:.85}
.mk-quote{border:1.5px solid color-mix(in srgb,var(--shield) 40%,var(--line));background:color-mix(in srgb,var(--shield) 7%,var(--surface));border-radius:16px;padding:14px}
.mk-quote .qr{display:flex;justify-content:space-between;gap:10px;font-size:.82rem;padding:4px 0;border-bottom:1px dashed color-mix(in srgb,var(--shield) 30%,var(--line))}
.mk-quote .qr:last-child{border:none}
.mk-fund{background:linear-gradient(135deg,#0369a1,#0ea5e9 55%,#38bdf8);color:#fff;border-radius:20px;padding:18px 20px;position:relative;overflow:hidden;box-shadow:0 18px 40px -18px rgba(3,105,161,.7)}
.mk-fund::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.12) 0 2px,transparent 2px 14px)}
.mk-fund>*{position:relative;z-index:2}
.mk-fund b{font-family:var(--display);font-weight:400}
@media (max-width:960px){.mk .grid.g2,.mk-grid2{grid-template-columns:1fr !important;gap:12px}}
@media (max-width:760px){
.mk-hero{padding:16px 14px}.mk-hero .spread{flex-direction:column;align-items:stretch}.mk-hero h1{font-size:1.4rem}.mk-hero p{font-size:.82rem}
.mk-quick .q{padding:6px 10px;font-size:.74rem}.mk-quick .q b{font-size:1rem}
.mk-price{font-size:1.9rem}.mk-chip{padding:7px 10px;font-size:.76rem}
.mk-box{padding:13px 12px}.mk-box svg{min-width:320px !important}
.mk-box [dir="ltr"]{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
.mk-step button{width:34px;height:36px}.mk-step b{min-width:44px;font-size:1.05rem}
.mk-row{padding:8px 6px;gap:8px}.mk-edu{padding:12px 10px}.mk-edu p{font-size:.76rem}
.mk-mission{padding:13px 12px}.mk-rank b{font-size:.76rem}
.mk-pol .stamp{position:static;display:inline-block;transform:rotate(-3deg);margin-bottom:6px}
#mkBody .row .btn{white-space:normal;flex:1 1 46%;min-width:0;font-size:.8rem}
.mk .tw{max-width:100%}
}
@media (max-width:420px){.mk-chips{gap:6px}.mk-chip{font-size:.7rem;padding:6px 8px}.mk-price{font-size:1.6rem}.mk-box svg{min-width:280px !important}#mkBody .row .btn{flex:1 1 100%}}
`;
const stl = document.createElement('style'); stl.id = 'mkStyles2'; if (!document.getElementById('mkStyles2')) document.head.appendChild(stl);

const M = { tab: 'market', asset: '', qty: 1, mScope: 'class', ins: { assetId: '', qty: 1, days: 5, ratio: 75 } };
const ec = () => S().econ || { assets: [], missions: [], policies: [], fund: {}, settings: {} };
const myAsset = () => { const a = ec().assets || []; return a.find(x => x.id === M.asset) || a[0]; };
const pill = (t, c, i) => `<span class="mk-pill" style="--pc:${c}">${i || ''} ${esc(t)}</span>`;
const daysLeft = p => { const t = todayISO(); if (t > p.endAt) return 0; return schoolLen(t, p.endAt); };
function schoolLen(a, b) { let n = 0, d = isoToDate(a); const e = isoToDate(b); while (d <= e) { if (C.wdIdx(dateToISO(d)) <= 4) n++; d.setDate(d.getDate() + 1); } return n; }

/* ---------- candlestick ---------- */
function candleChart(series) {
  const s = (series || []).slice(-40);
  if (!s.length) return empty('📈', 'هنوز کندلی نیست', 'با گذشت روزهای مدرسه، کندل‌ها ساخته می‌شوند.');
  const w = 680, h = 270, p = 36, pb = 50;
  let mn = Infinity, mx = -Infinity;
  s.forEach(x => { mn = Math.min(mn, x.l); mx = Math.max(mx, x.h); });
  const pad = (mx - mn) * 0.12 || 5; mn -= pad; mx += pad;
  const X = i => p + (w - 2 * p) * (s.length === 1 ? .5 : i / (s.length - 1));
  const Y = v => h - pb - (h - p - pb) * ((v - mn) / (mx - mn));
  const bw = Math.max(3, Math.min(14, (w - 2 * p) / s.length * 0.62));
  let grid = '';
  [0, .25, .5, .75, 1].forEach(k => { const v = mn + (mx - mn) * k; grid += `<line x1="${p}" x2="${w - p}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-dasharray="${k === 0 ? '0' : '4 5'}"/><text x="${p - 6}" y="${Y(v) + 4}" font-size="10" fill="var(--muted)" text-anchor="end">${faNum(v, 0)}</text>`; });
  const maxV = Math.max(1, ...s.map(x => x.v || 1));
  const vols = s.map((x, i) => { const vh = (x.v || 0) / maxV * (pb - 20); return `<rect x="${X(i) - bw / 2}" y="${h - 18 - vh}" width="${bw}" height="${Math.max(1.5, vh)}" fill="${x.c >= x.o ? '#16a34a44' : '#e11d4844'}"/>`; }).join('');
  const candles = s.map((x, i) => {
    const up = x.c >= x.o, col = up ? '#16a34a' : '#e11d48', cx = X(i);
    return `<g><line x1="${cx}" x2="${cx}" y1="${Y(x.h)}" y2="${Y(x.l)}" stroke="${col}" stroke-width="1.6"/>
      <rect x="${cx - bw / 2}" y="${Y(Math.max(x.o, x.c))}" width="${bw}" height="${Math.max(2, Math.abs(Y(x.o) - Y(x.c)))}" fill="${col}" rx="1.5"><title>${jShort(x.d)} — باز ${faNum(x.o)} • بسته ${faNum(x.c)} • سقف ${faNum(x.h)} • کف ${faNum(x.l)} • حجم ${fa(x.v)}${x.reason ? '\n' + x.reason : ''}</title></rect></g>`;
  }).join('');
  const last = s[s.length - 1];
  const labs = [0, Math.floor(s.length / 2), s.length - 1].map(i => `<text x="${X(i)}" y="${h - 4}" font-size="10" fill="var(--muted)" text-anchor="middle">${jShort(s[i].d)}</text>`).join('');
  return `<div dir="ltr" style="overflow-x:auto"><svg viewBox="0 0 ${w} ${h}" style="width:100%;min-width:320px;height:auto;display:block">${grid}${vols}${candles}
    <line x1="${p}" x2="${w - p}" y1="${Y(last.c)}" y2="${Y(last.c)}" stroke="var(--acc)" stroke-dasharray="6 4" stroke-width="1.2"/>
    <text x="${w - p}" y="${Y(last.c) - 5}" font-size="10.5" font-weight="800" fill="var(--acc)" text-anchor="end">${faNum(last.c)}</text>${labs}</svg></div>`;
}
function eduCard() {
  return `<div class="mk-edu"><div class="spread mb"><b class="small">📚 کندل یعنی چه؟</b><span class="chip">ویژهٔ کلاس</span></div>
  <div dir="ltr" style="text-align:center"><svg viewBox="0 0 300 120" style="max-width:300px;width:100%">
    <line x1="80" y1="10" x2="80" y2="110" stroke="#16a34a" stroke-width="2"/><rect x="66" y="35" width="28" height="45" fill="#16a34a" rx="3"/>
    <line x1="210" y1="10" x2="210" y2="110" stroke="#e11d48" stroke-width="2"/><rect x="196" y="30" width="28" height="50" fill="#e11d48" rx="3"/>
    <text x="100" y="20" font-size="10" fill="#16a34a" text-anchor="start">سقف (بیشترین قیمت روز)</text>
    <text x="100" y="45" font-size="10" fill="#16a34a">بدنه: باز→بسته (سبز یعنی بالا رفت)</text>
    <text x="100" y="80" font-size="10" fill="#16a34a">کف (کمترین قیمت روز)</text>
    <text x="180" y="105" font-size="10" fill="#e11d48" text-anchor="end">قرمز یعنی بسته پایین‌تر از باز است</text>
  </svg></div>
  <p class="small muted" style="line-height:2">قیمت هر سهم از <b>کار واقعی کلاس</b> ساخته می‌شود: روزی که نمرات یا تکالیف آن درس خوب باشد، سهم بالا می‌رود. معامله‌گر خوب صبر می‌کند، همهٔ سکه‌اش را یک‌جا نمی‌خرد و دلیل هر معامله را می‌نویسد.</p></div>`;
}
function insEduCard() {
  return `<div class="mk-edu" style="border-color:color-mix(in srgb,var(--shield) 45%,var(--line));background:color-mix(in srgb,var(--shield) 6%,var(--surface))">
  <div class="spread mb"><b class="small">🛡️ بیمه یعنی چه؟ (سواد مالی در یک کارت)</b><span class="chip" style="color:var(--shield)">ویژهٔ کلاس</span></div>
  <p class="small muted" style="line-height:2">
  <b>بیمه‌نامه:</b> قولی است که می‌گوید «اگر قیمت سهمم پایین آمد، ضررم جبران شود».<br>
  <b>حق بیمه:</b> پولی که امروز می‌دهی تا آن قول را بگیری — هرچه سهم <b>پرنوسان‌تر</b> یا پوشش <b>طولانی‌تر</b> باشد، گران‌تر است.<br>
  <b>خسارت:</b> اگر تا پایان پوشش قیمت افت کرد، به اندازهٔ افت × درصد پوشش سکه برمی‌گردد (تا سقف مشخص).<br>
  <b>نکتهٔ طلایی:</b> اگر قیمت بالا برود، حق بیمه سوخت می‌شود — دقیقاً مثل بیمهٔ واقعی خانه و ماشین! بیمه برای <b>آرامش</b> است، نه سود.<br>
  <b>چرا حق بیمه این عدد شد؟</b> سیستم نوسان واقعی همان سهم را از کندل‌ها می‌خواند و «میانگین ضرر احتمالی» را حساب می‌کند، بعد یک حاشیهٔ امنیت اضافه می‌کند تا صندوق بیمهٔ کلاس ورشکست نشود.</p></div>`;
}

/* ---------- market tab ---------- */
function marketTab() {
  const st = S(), e = ec(), a = myAsset();
  if (!a) return `<div class="mk-box">${empty('📈', 'سهامی تعریف نشده', 'معلم از تب قواعد سهام جدید بسازد.')}</div>`;
  const p = price(a), ch = chg(a), last = (a.series || [])[a.series.length - 1];
  const pf = isT() ? null : C.ecPortfolio(st, SESS.sid);
  const my = pf ? (pf.items.find(x => x.id === a.id) || null) : null;
  const w = isT() ? null : (S().econ.wallet != null ? S().econ.wallet : C.ecWallet(st, SESS.sid).balance);
  const fee = e.settings.tradeFee || 0;
  const est = Math.round(M.qty * p * (1 + fee / 100));
  const insQ = !isT() && my ? C.ecActivePolicies(st, SESS.sid).filter(x => x.assetId === a.id).reduce((s2, x) => s2 + x.qty, 0) : 0;
  return `<div class="mk-chips mb">${(e.assets || []).filter(x => !x.paused).map(x => { const c2 = chg(x); return `<button type="button" class="mk-chip ${x.id === a.id ? 'on' : ''}" style="--ac:${x.color}" data-act="mkPick" data-id="${x.id}">${x.icon} ${esc(x.symbol)} <span class="pr">${faNum(price(x), 0)}</span> <span class="${c2 >= 0 ? 'up' : 'dn'}">${c2 >= 0 ? '▲' : '▼'}${faNum(Math.abs(c2), 1)}٪</span></button>`; }).join('')}</div>
  <div class="grid g2 mk-grid2" style="align-items:start">
    <div class="mk-box"><div class="spread mb"><div class="row" style="gap:10px"><span class="gr-ico" style="--kc:${a.color}">${a.icon}</span>
      <div><b style="font-size:1.05rem">${esc(a.name)}</b><div class="small muted">${a.subject === '@help' ? 'سنجه: همکاری و احوال‌پرسی کلاس' : 'سنجه: عملکرد کلاس در درس ' + esc(a.subject)}</div></div></div>
      <div style="text-align:left"><div class="mk-price" style="color:${a.color}">${faNum(p)}</div><div class="${ch >= 0 ? 'mk-up' : 'mk-down'}" style="font-size:.85rem">${ch >= 0 ? '▲' : '▼'} ${faNum(Math.abs(ch), 1)}٪ نسبت به دیروز</div></div></div>
      ${candleChart(a.series)}
      ${last ? `<div class="row mt" style="gap:6px">${pill(last.reason || '➖ روز معمولی', '#7b7261')}<span class="chip">حجم امروز: ${fa(last.v)}</span><span class="chip">نوسان روزانه: ${faNum(C.ecVol(a).vol * 100, 1)}٪</span></div>` : ''}</div>
    <div>
      ${!isT() ? `<div class="mk-box mb"><div class="spread"><div><span class="small muted">کیف پول من</span><div class="mk-price" style="font-size:1.8rem;color:var(--gold)">🪙 ${fa(w || 0)}</div></div>
        <div style="text-align:left"><span class="small muted">ارزش سهام من</span><div class="mk-price" style="font-size:1.8rem;color:${a.color}">${fa(pf ? pf.value : 0)}</div></div></div>
        <div class="row mt" style="gap:6px"><span class="chip">سود/زیان: <b class="${(pf && pf.pnl) >= 0 ? 'mk-up' : 'mk-down'}">${pf && pf.pnl >= 0 ? '+' : ''}${fa(pf ? pf.pnl : 0)}</b></span><span class="chip">دارایی کل: ${fa(pf ? pf.total : 0)}</span></div>
        <div class="divider"></div>
        <div class="row" style="gap:10px"><span class="small bold">تعداد سهم</span><span class="mk-step"><button type="button" data-act="mkQty" data-d="-1">−</button><b id="mkQty">${fa(M.qty)}</b><button type="button" data-act="mkQty" data-d="1">+</button></span></div>
        <div class="row mt" style="gap:6px"><span class="chip">قیمت هر سهم: ${faNum(p)}</span><span class="chip">کارمزد: ${fa(fee)}٪</span><span class="chip acc">هزینهٔ تقریبی: ${fa(est)}</span></div>
        <div class="row mt"><button type="button" class="btn ok" style="flex:1" data-act="mkBuy" data-id="${a.id}">📈 خرید ${fa(M.qty)} سهم</button>
          <button type="button" class="btn danger" style="flex:1" data-act="mkSell" data-id="${a.id}" ${my && my.qty ? '' : 'disabled'}>📉 فروش ${fa(my ? Math.min(M.qty, my.qty) : 0)} سهم</button></div>
        ${my ? `<div class="gr-note mt">دارایی: ${fa(my.qty)} سهم ${insQ ? `• 🛡️ ${fa(insQ)} سهم زیر پوشش بیمه` : ''} • میانگین خرید ${faNum(my.qty ? my.cost / my.qty : 0)} • سود: <b class="${my.pnl >= 0 ? 'mk-up' : 'mk-down'}">${my.pnl >= 0 ? '+' : ''}${fa(my.pnl)}</b></div>
        ${C.ecFreeQty(st, SESS.sid, a.id) > 0 ? `<button type="button" class="btn soft sm mt" data-act="mkGoIns" data-id="${a.id}">🛡️ بیمهٔ این سهم</button>` : ''}` : '<p class="small muted mt">هنوز از این سهم نداری؛ با خرید کوچک شروع کن.</p>'}
        <p class="small muted mt">⚠️ سقف هر معامله ${fa(e.settings.maxTradeQty)} سهم و روزانه ${fa(e.settings.dailyTrades)} معامله.</p></div>`
      : `<div class="mk-box mb"><div class="spread mb"><b class="small">👨‍🏫 نمای معلم</b><button type="button" class="btn sm soft" data-act="mkRoll">🔄 به‌روزرسانی بازار و تصفیهٔ بیمه‌ها</button></div>
        <p class="small muted">قیمت هر سهم هر روز مدرسه از میانگین نمرات/تکالیف همان درس + کمی نوسان ساخته می‌شود. بیمه‌نامه‌های منقضی خودکار تصفیه می‌شوند.</p>
        <div class="divider"></div><b class="small">معامله‌های اخیر کلاس</b>
        <div class="mk-scroll mt">${(e.trades || []).slice(-14).reverse().map(t => `<div class="mk-row"><span class="chip">${t.side === 'buy' ? '📈' : '📉'} ${t.side === 'buy' ? 'خرید' : 'فروش'}</span><b class="small">${esc((stuById(st, t.sid) || {}).name || ''}</b><span class="small muted">${fa(t.qty)} × ${esc(t.symbol)} @ ${faNum(t.price)}</span><span class="chip">${fa(t.value)} 🪙</span><span class="small muted">${jShort(iranISO(new Date(t.at)))}</span></div>`).join('') || '<p class="small muted">معامله‌ای ثبت نشده.</p>'}</div></div>`}
      ${e.settings.edu !== false ? eduCard() : ''}
    </div></div>
  ${!isT() && pf && pf.items.length ? `<div class="mk-box mt"><b class="small mb" style="display:block">💼 سبد سهام من</b>
    ${pf.items.map(x => { const iq = C.ecActivePolicies(st, SESS.sid).filter(pp => pp.assetId === x.id).reduce((s2, pp) => s2 + pp.qty, 0); return `<div class="mk-row"><span class="gr-ico" style="--kc:${x.color};width:36px;height:36px;font-size:1.05rem">${x.icon}</span><b class="small" style="flex:1">${esc(x.name)}</b><span class="chip">${fa(x.qty)} سهم</span>${iq ? `<span class="chip" style="color:var(--shield)">🛡️ ${fa(iq)}</span>` : ''}<span class="chip">ارزش ${fa(x.value)}</span><span class="chip" style="color:${x.pnl >= 0 ? 'var(--up)' : 'var(--down)'}">${x.pnl >= 0 ? '+' : ''}${fa(x.pnl)}</span></div>`; }).join('')}</div>` : ''}`;
}

/* ---------- insurance tab ---------- */
function policyCard(p, i, teacher) {
  const st = S(), a = (ec().assets || []).find(x => x.id === p.assetId);
  const cur = a ? price(a) : p.strike, stt = INS[p.status] || INS.active;
  const drop = Math.max(0, p.strike - cur);
  const proj = p.status === 'active' ? Math.min(Math.round(drop * p.qty * p.ratio / 100), p.cap || 0) : (p.payout || 0);
  const left = p.status === 'active' ? daysLeft(p) : 0;
  return `<div class="mk-pol" style="--sc:${stt.c};--i:${i}">
    ${p.status !== 'active' ? `<span class="stamp">${stt.i} ${stt.l}</span>` : ''}
    <div class="spread" style="align-items:flex-start"><div class="row" style="gap:9px">
      <span class="gr-ico" style="--kc:${stt.c}">${a ? a.icon : '🛡️'}</span>
      <div><b class="small">${a ? esc(a.name) : esc(p.symbol || '')}</b>
        <div class="small muted">${fa(p.qty)} سهم • پوشش ${fa(p.ratio)}٪ • ${fa(p.days)} روز مدرسه${teacher ? ' • ' + esc((stuById(st, p.sid) || {}).name || '') : ''}</div></div></div>
      ${p.status === 'active' ? pill(left + ' روز مانده', left <= 1 ? '#f59e0b' : '#16a34a', '⏳') : ''}</div>
    <div class="row mt" style="gap:6px;flex-wrap:wrap">
      <span class="chip">قیمت پایه: ${faNum(p.strike)}</span>
      <span class="chip">قیمت الآن: ${faNum(cur)}</span>
      <span class="chip ${cur < p.strike ? 'mk-down' : 'mk-up'}" style="color:${cur < p.strike ? 'var(--down)' : 'var(--up)'}">${cur < p.strike ? '▼ افت ' + faNum(p.strike - cur) : '▲ رشد ' + faNum(cur - p.strike)}</span>
      <span class="chip">حق بیمه: ${fa(p.premium)} 🪙</span>
      <span class="chip">سقف خسارت: ${fa(p.cap || 0)}</span></div>
    <div class="gr-note mt">${p.status === 'active'
      ? (drop > 0 ? `اگر امروز تصفیه شود: <b class="mk-down">${fa(proj)} سکه خسارت</b> می‌گیری.` : `قیمت بالا یا ثابت است؛ الان خسارتی در کار نیست — بیمه فقط <b>محافظ</b> است.`)
      : p.status === 'settled' ? `خسارت پرداخت‌شده: <b class="mk-up">${fa(p.payout || 0)} سکه</b> • قیمت پایان: ${faNum(p.endPrice || 0)}`
      : p.status === 'expired' ? `بدون خسارت تمام شد 🍀 — قیمت پایان ${faNum(p.endPrice || 0)} بود (بالاتر یا برابر پایه).`
      : `فسخ شد • ارزش برگشتی: ${fa(p.refund || 0)} سکه`}</div>
    ${p.status === 'active' ? `<div class="row mt"><button type="button" class="btn ghost sm" data-act="mkInsCancel" data-id="${p.id}">↩️ فسخ (۴۰٪ برگشت)</button></div>` : ''}</div>`;
}
function insTab() {
  const st = S(), e = ec(), ins = (e.settings || {}).ins || {};
  if (ins.enabled === false && !isT()) return `<div class="mk-box">${empty('🛡️', 'بیمه موقتاً بسته است', 'معلم آن را از تب قواعد غیرفعال کرده.')}</div>`;
  if (!isT()) {
    const pf = C.ecPortfolio(st, SESS.sid);
    const insurable = pf.items.filter(x => C.ecFreeQty(st, SESS.sid, x.id) > 0);
    if (!M.ins.assetId || !insurable.some(x => x.id === M.ins.assetId)) M.ins.assetId = insurable[0] ? insurable[0].id : '';
    const a = (e.assets || []).find(x => x.id === M.ins.assetId);
    const fq = a ? C.ecFreeQty(st, SESS.sid, a.id) : 0;
    M.ins.qty = clamp(M.ins.qty, 1, Math.max(1, fq));
    const q = a && fq > 0 ? C.ecQuote(st, { sid: SESS.sid, assetId: a.id, qty: M.ins.qty, days: M.ins.days, ratio: M.ins.ratio }) : null;
    const mine = (e.policies || []).slice().reverse();
    return `<div class="grid g2 mk-grid2" style="align-items:start">
      <div class="mk-box"><div class="spread mb"><b>🛡️ بیمه‌نامهٔ جدید</b><span class="chip" style="color:var(--shield)">🪙 ${fa(e.wallet != null ? e.wallet : pf.cash)} موجود</span></div>
        ${insurable.length ? `
        <div class="field"><label class="lbl">کدام سهم را بیمه کنم؟</label><select class="select" data-chg="mkInsAsset">${insurable.map(x => `<option value="${x.id}" ${x.id === M.ins.assetId ? 'selected' : ''}>${x.icon} ${esc(x.name)} — ${fa(C.ecFreeQty(st, SESS.sid, x.id))} سهم آزاد</option>`).join('')}</select></div>
        <div class="field"><label class="lbl">تعداد سهم</label><span class="mk-step"><button type="button" data-act="mkInsQty" data-d="-1">−</button><b id="mkInsQty">${fa(M.ins.qty)}</b><button type="button" data-act="mkInsQty" data-d="1">+</button></span> <span class="small muted">از ${fa(fq)} سهم آزاد</span></div>
        <div class="field"><label class="lbl">مدت پوشش (روز مدرسه)</label><div class="seg">${[3, 5, 7, 10].filter(d => d <= (ins.maxDays || 10)).map(d => `<button type="button" class="${M.ins.days === d ? 'on' : ''}" data-act="mkInsDays" data-v="${d}">${fa(d)} روز</button>`).join('')}</div></div>
        <div class="field"><label class="lbl">درصد پوشش ضرر</label><div class="seg">${[50, 75, 100].map(r => `<button type="button" class="${M.ins.ratio === r ? 'on' : ''}" data-act="mkInsRatio" data-v="${r}">${fa(r)}٪</button>`).join('')}</div></div>
        ${q ? `<div class="mk-quote mt">
          <div class="qr"><span>ارزش سهام زیر پوشش</span><b>${fa(q.value)} 🪙</b></div>
          <div class="qr"><span>نوسان روزانهٔ سهم (ریسک)</span><b>${faNum(q.vol * 100, 1)}٪</b></div>
          <div class="qr"><span>روند اخیر سهم</span><b class="${q.drift >= 0 ? 'mk-up' : 'mk-down'}">${q.drift >= 0 ? '▲' : '▼'} ${faNum(Math.abs(q.drift) * 100, 1)}٪ روزانه</b></div>
          <div class="qr"><span>خسارت انتظاررفته (محاسبهٔ ریسک)</span><b>${fa(q.expLoss)} 🪙</b></div>
          <div class="qr"><span>حاشیهٔ امنیت صندوق (${fa(q.loading)}٪)</span><b>+${fa(Math.max(0, Math.ceil(q.expLoss * q.loading / 100)))} 🪙</b></div>
          <div class="qr"><span>سقف خسارت این بیمه‌نامه</span><b>${fa(q.cap)} 🪙</b></div>
          <div class="qr"><span style="font-weight:800">حق بیمهٔ شما</span><b style="font-family:var(--display);font-size:1.3rem;color:var(--shield)">${fa(q.premium)} 🪙</b></div>
          ${q.ok ? '' : `<div class="qr"><span style="color:var(--down);font-weight:800">⚠️ ${esc(q.reason)}</span></div>`}
        </div>
        <button type="button" class="btn mt" style="width:100%;background:linear-gradient(135deg,#0369a1,#0ea5e9)" data-act="mkInsBuy" ${q.ok ? '' : 'disabled'}>🛡️ خرید بیمه‌نامه به قیمت ${fa(q.premium)} سکه</button>` : ''}`
        : empty('📭', 'سهم بیمه‌نشده نداری', 'اول از تب بورس سهم بخر، بعد آن را بیمه کن.')}
      </div>
      <div>
        <div class="mk-box mb"><div class="spread mb"><b>📜 بیمه‌نامه‌های من</b><span class="chip">${fa(mine.length)}</span></div>
          ${mine.length ? `<div class="grid" style="gap:12px">${mine.slice(0, 8).map((p, i) => policyCard(p, i, false)).join('')}</div>` : empty('🛡️', 'بیمه‌نامه‌ای نداری', 'با یک بیمهٔ کوچک شروع کن.')}</div>
        ${insEduCard()}</div></div>`;
  }
  /* teacher */
  const f = e.fund || { balance: 0, premiums: 0, payouts: 0 };
  const exp = e.exposure != null ? e.exposure : C.ecExposure(st);
  const loss = f.premiums ? Math.round(f.payouts / f.premiums * 100) : 0;
  const pols = (e.policies || []).slice().reverse();
  return `<div class="grid g2 mk-grid2 mb" style="align-items:start">
    <div class="mk-fund"><div class="spread"><div><span style="font-size:.8rem;opacity:.9">🏦 صندوق بیمهٔ کلاس</span><br><b style="font-size:2.2rem">${fa(f.balance || 0)} 🪙</b></div>
      <div style="text-align:left;font-size:.8rem;line-height:2"><span>دریافتی حق بیمه: <b>${fa(f.premiums || 0)}</b></span><br><span>پرداخت خسارت: <b>${fa(f.payouts || 0)}</b></span><br><span>نسبت خسارت: <b>${fa(loss)}٪</b></span></div></div>
      <div class="row mt" style="gap:6px"><span class="chip" style="background:rgba(255,255,255,.2);color:#fff;border-color:rgba(255,255,255,.3)">تعهد فعال: ${fa(exp)}</span><span class="chip" style="background:rgba(255,255,255,.2);color:#fff;border-color:rgba(255,255,255,.3)">توانگری: ${exp ? faNum((f.balance || 0) / exp * 100, 0) + '٪' : '—'}</span>
      <button type="button" class="btn sm" style="background:rgba(255,255,255,.25)" data-act="mkInsSettle">⚙️ تصفیهٔ دستی بیمه‌ها</button></div></div>
    <div class="mk-box"><b class="small mb" style="display:block">⚙️ قواعد قیمت‌گذاری بیمه</b>
      <div class="srow"><div><span class="s-lbl">🛡️ بیمه فعال باشد</span></div><span class="switch"><input type="checkbox" ${ins.enabled !== false ? 'checked' : ''} data-chg="mkInsSet" data-k="enabled"><i></i></span></div>
      <div class="srow"><span class="s-lbl">حاشیهٔ امنیت (٪)</span><span class="mk-step"><button type="button" data-act="mkInsStep" data-k="loading" data-d="-5">−</button><b id="mkIS_loading">${fa(ins.loading == null ? 30 : ins.loading)}</b><button type="button" data-act="mkInsStep" data-k="loading" data-d="5">+</button></span></div>
      <div class="srow"><span class="s-lbl">سقف افت پوششی (٪)</span><span class="mk-step"><button type="button" data-act="mkInsStep" data-k="cap" data-d="-5">−</button><b id="mkIS_cap">${fa(ins.cap == null ? 35 : ins.cap)}</b><button type="button" data-act="mkInsStep" data-k="cap" data-d="5">+</button></span></div>
      <div class="srow"><span class="s-lbl">کارمزد ثابت (سکه)</span><span class="mk-step"><button type="button" data-act="mkInsStep" data-k="fee" data-d="-1">−</button><b id="mkIS_fee">${fa(ins.fee == null ? 1 : ins.fee)}</b><button type="button" data-act="mkInsStep" data-k="fee" data-d="1">+</button></span></div>
      <div class="srow"><span class="s-lbl">بیشینهٔ روز پوشش</span><span class="mk-step"><button type="button" data-act="mkInsStep" data-k="maxDays" data-d="-1">−</button><b id="mkIS_maxDays">${fa(ins.maxDays == null ? 10 : ins.maxDays)}</b><button type="button" data-act="mkInsStep" data-k="maxDays" data-d="1">+</button></span></div>
      <div class="srow"><span class="s-lbl">سقف بیمه‌نامهٔ فعال هر نفر</span><span class="mk-step"><button type="button" data-act="mkInsStep" data-k="maxPolicies" data-d="-1">−</button><b id="mkIS_maxPolicies">${fa(ins.maxPolicies == null ? 3 : ins.maxPolicies)}</b><button type="button" data-act="mkInsStep" data-k="maxPolicies" data-d="1">+</button></span></div>
      <p class="small muted mt">حق بیمه = خسارت انتظاررفته × (۱ + حاشیه) + کارمزد. نوسان هر سهم از کندل‌های واقعی‌اش خوانده می‌شود.</p></div></div>
  <div class="mk-box"><div class="spread mb"><b>📜 همهٔ بیمه‌نامه‌ها</b><button type="button" class="btn sm soft" data-act="mkCsv" data-kind="ins">📤 CSV</button></div>
    ${pols.length ? `<div class="grid g2 mk-grid2" style="gap:12px">${pols.slice(0, 20).map((p, i) => policyCard(p, i, true)).join('')}</div>` : empty('🛡️', 'بیمه‌نامه‌ای نیست', 'دانش‌آموزان از تب بیمه خرید می‌کنند.')}</div>`;
}

/* ---------- missions / board / settings tabs ---------- */
function missionCard(m, i) {
  const st = S(), M2 = MET[m.metric] || MET.hw_rate;
  const today = todayISO(), left = Math.ceil((isoToDate(m.to) - isoToDate(today)) / 864e5);
  let body = '';
  if (m.scope === 'battle') {
    const ranks = (st.groups || []).map(g => ({ g, v: C.ecMissionValue(st, m, g.id) })).sort((a, b) => b.v - a.v);
    const mx = Math.max(1, ...ranks.map(r => r.v));
    body = ranks.map((r, k) => `<div class="mk-rank"><span style="width:22px">${['🥇', '🥈', '🥉', '🏅', '🏅', '🏅'][k]}</span><b class="small" style="width:70px">${esc(r.g.name)}</b><div class="bar"><i style="width:${r.v / mx * 100}%;background:${r.g.color}"></i></div><b class="small" style="color:${r.g.color}">${fa(r.v)}${M2.unit}</b></div>`).join('');
  } else {
    const v = C.ecMissionValue(st, m, m.scope === 'group' ? m.groupId : null);
    const pct = clamp(v / Math.max(1, m.target) * 100, 0, 100);
    body = `<div class="spread small bold mt"><span>پیشرفت: ${fa(v)}${M2.unit}</span><span>هدف: ${fa(m.target)}${M2.unit}</span></div><div class="mk-bar" style="--mc:${pct >= 100 ? '#16a34a' : '#1d4ed8'}"><i style="width:${pct}%"></i><span class="tgt" style="right:100%"></span></div>`;
  }
  const rs = m.status === 'settled' ? (m.scope !== 'battle' ? (m.result && m.result.ok ? '🏆 موفق' : '✖️ ناموفق') : '🏁 پایان‌یافته') : left < 0 ? '⏳ در انتظار تسویه' : `⏳ ${fa(left)} روز مانده`;
  return `<div class="mk-mission ${m.status === 'settled' && m.result && m.result.ok === false ? 'lost' : m.status === 'settled' ? 'won' : ''}" style="--mc:${m.scope === 'battle' ? '#d97706' : m.scope === 'group' ? '#7c3aed' : '#1d4ed8'};--i:${i}">
    <div class="spread"><div class="row" style="gap:9px"><span class="gr-ico" style="--kc:${m.scope === 'battle' ? '#d97706' : '#1d4ed8'}">${M2.i}</span>
      <div><b class="small">${esc(m.title)}</b><div class="small muted">${m.scope === 'battle' ? '🏆 نبرد گروه‌ها' : m.scope === 'group' ? '🧩 ماموریت گروهی' : '👥 ماموریت کل کلاس'} • ${jShort(m.from)} تا ${jShort(m.to)}</div></div></div>
      ${pill(rs, m.status === 'settled' ? (m.result && m.result.ok === false ? '#e11d48' : '#16a34a') : left <= 1 ? '#f59e0b' : '#1d4ed8')}</div>
    ${m.desc ? `<div class="gr-note">${esc(m.desc)}</div>` : ''}
    ${body}
    <div class="row mt" style="gap:6px"><span class="chip" style="color:#d97706">🪙 ${fa((m.reward || {}).points || 0)}</span><span class="chip" style="color:#7c3aed">⚡ ${fa((m.reward || {}).xp || 0)}</span>${(m.reward || {}).spin ? `<span class="chip" style="color:#e11d48">🎰 ${fa(m.reward.spin)}</span>` : ''}
      <span class="small muted">پاداش ${m.scope === 'battle' ? 'گروه برنده' : m.scope === 'group' ? 'اعضای گروه' : 'همهٔ کلاس'}</span></div>
    ${isT() && m.status === 'active' && left < 0 ? `<div class="row mt"><button type="button" class="btn ok sm" data-act="mkSettle" data-id="${m.id}">🏁 تسویه و پاداش</button></div>` : ''}
    ${isT() && m.status === 'active' ? `<div class="row mt"><button type="button" class="btn ghost sm" data-act="mkMDel" data-id="${m.id}">🗑 حذف</button></div>` : ''}</div>`;
}
function missionsTab() {
  const list = (ec().missions || []).slice().sort((a, b) => (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1) || String(b.from).localeCompare(String(a.from)));
  return `<div class="grid g2 mk-grid2 stagger">${list.map((m, i) => missionCard(m, i)).join('') || `<div class="mk-box" style="grid-column:1/-1">${empty('🎯', 'ماموریتی نیست', isT() ? 'اولین ماموریت مشترک کلاس را بساز.' : 'به‌زودی ماموریت تازه می‌آید.', isT() ? '<button type="button" class="btn" data-act="mkMNew">➕ ماموریت جدید</button>' : '')}</div>`}</div>
  ${isT() ? `<div class="row mt"><button type="button" class="btn" data-act="mkMNew">➕ ماموریت / نبرد جدید</button></div>` : ''}`;
}
function boardTab() {
  const st = S(), b = C.ecBoard(st);
  const rows = b.map((x, i) => `<tr><td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : fa(i + 1)}</td>
    <td><div class="row" style="gap:8px;flex-wrap:nowrap">${avHTML(x, 'sm')}<b class="small">${esc(x.name)}</b>${x.id === SESS.sid ? '<span class="chip acc">من</span>' : ''}</div></td>
    <td>🪙 ${fa(x.cash)}</td><td>📈 ${fa(x.value)}</td><td><b>${fa(x.total)}</b></td>
    <td style="color:${x.pnl >= 0 ? 'var(--up)' : 'var(--down)'}">${x.pnl >= 0 ? '+' : ''}${fa(x.pnl)}</td></tr>`).join('');
  return `<div class="mk-box"><div class="spread mb"><b>🏆 رتبه‌بندی دارایی کلاس (سکه + سهام)</b><span class="chip">ارزش‌ها لحظه‌ای است</span></div>
    <div class="tw"><table class="tbl"><thead><tr><th>#</th><th>دانش‌آموز</th><th>نقد</th><th>سهام</th><th>کل</th><th>سود/زیان</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="small muted mt">💡 گفت‌وگوی کلاسی: چرا تنوع سبد ریسک را کم می‌کند؟ بیمه چه نقشی دارد؟</p></div>`;
}
function setTab() {
  const s = ec().settings;
  const step = (k, v, l) => `<div class="srow"><span class="s-lbl">${l}</span><span class="mk-step"><button type="button" data-act="mkStep" data-k="${k}" data-d="-1">−</button><b id="mkS_${k}">${fa(v)}</b><button type="button" data-act="mkStep" data-k="${k}" data-d="1">+</button></span></div>`;
  const sw = (k, on, l, sub) => `<div class="srow"><div><span class="s-lbl">${l}</span>${sub ? `<span class="s-sub">${sub}</span>` : ''}</div><span class="switch"><input type="checkbox" ${on ? 'checked' : ''} data-chg="mkSet" data-k="${k}"><i></i></span></div>`;
  return `<div class="grid g2 mk-grid2" style="align-items:start">
    <div class="mk-box"><h3 class="mb">⚙️ قواعد بورس</h3>
      ${sw('marketEnabled', s.marketEnabled !== false, '📈 بورس باز باشد')}
      ${sw('edu', s.edu !== false, '📚 کارت‌های آموزشی کندل و بیمه')}
      ${sw('leaderboard', s.leaderboard !== false, '🏆 نمایش رتبه‌بندی به دانش‌آموزان')}
      ${step('tradeFee', s.tradeFee || 0, '💱 کارمزد هر معامله (٪)')}
      ${step('maxTradeQty', s.maxTradeQty || 15, '📦 سقف سهم در هر معامله')}
      ${step('dailyTrades', s.dailyTrades || 5, '📅 سقف معامله در روز')}
      <p class="small muted mt">قواعد بیمه در تب «🛡️ بیمه» (نمای معلم) تنظیم می‌شود.</p></div>
    <div class="mk-box"><h3 class="mb">🎯 قواعد اهداف همکاری</h3>
      ${sw('missionsEnabled', s.missionsEnabled !== false, '🎯 ماموریت‌ها فعال باشند')}
      <div class="divider"></div><h3 class="mb">🏦 سهام کلاس</h3>
      ${(ec().assets || []).map(a => `<div class="mk-row"><span class="gr-ico" style="--kc:${a.color};width:34px;height:34px;font-size:1rem">${a.icon}</span><b class="small" style="flex:1">${esc(a.name)}</b><span class="chip">${faNum(price(a))}</span><span class="chip">نوسان ${faNum(C.ecVol(a).vol * 100, 1)}٪</span>
        <button type="button" class="ib sm" data-act="mkPause" data-id="${a.id}">${a.paused ? '🟢' : '⏸️'}</button></div>`).join('')}
      <button type="button" class="btn sm soft mt" data-act="mkANew">➕ سهام جدید</button></div></div>`;
}

/* ---------- view ---------- */
function viewHTML() {
  const st = S(), e = ec(), pf = isT() ? null : C.ecPortfolio(st, SESS.sid);
  const activeM = (e.missions || []).filter(m => m.status === 'active').length;
  const myPol = isT() ? (e.policies || []).filter(p => p.status === 'active').length : (e.policies || []).filter(p => p.status === 'active').length;
  const tabs = isT() ? [['market', '📈 بورس دانش'], ['ins', '🛡️ بیمه', myPol], ['missions', '🎯 اهداف همکاری', activeM], ['board', '🏆 رتبه‌بندی'], ['set', '⚙️ قواعد']]
    : [['market', '📈 بورس من'], ['ins', '🛡️ بیمه', myPol], ['missions', '🎯 اهداف کلاس', activeM], ['board', '🏆 رتبه‌بندی']];
  return `<div class="mk">
    <div class="mk-hero"><div class="spread"><div>
      <h1>📈 بورس دانش، بیمه و اهداف همکاری</h1>
      <p>${isT() ? 'قیمت سهام از عملکرد واقعی کلاس ساخته می‌شود؛ دانش‌آموزان می‌توانند سهم بخرند، بیمه کنند و در ماموریت‌های مشترک برنده شوند.' : 'سکه‌هایت را به سهام درس‌ها تبدیل کن و اگر نگران افت قیمت هستی، با حق بیمهٔ منصفانه آن را بیمه کن!'}</p>
      <div class="mk-quick"><span class="q">🏦 <b>${fa((e.assets || []).filter(a => !a.paused).length)}</b> سهام</span>
        <span class="q">🛡️ <b>${fa(myPol)}</b> بیمهٔ فعال</span>
        <span class="q">🎯 <b>${fa(activeM)}</b> ماموریت</span>
        ${!isT() ? `<span class="q">🪙 <b>${fa(pf.cash)}</b> نقد</span><span class="q">💼 <b>${fa(pf.total)}</b> دارایی</span>` : ''}</div></div>
      ${isT() ? `<div class="row"><button type="button" class="btn" data-act="mkMNew">➕ ماموریت</button><button type="button" class="btn soft" data-act="mkRoll">🔄 به‌روزرسانی بازار</button></div>` : ''}
    </div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${M.tab === k ? 'on' : ''}" data-act="mkTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="mkBody">${M.tab === 'ins' ? insTab() : M.tab === 'missions' ? missionsTab() : M.tab === 'board' ? boardTab() : M.tab === 'set' ? setTab() : marketTab()}</div></div>`;
}

/* ---------- drawers ---------- */
function missionForm() {
  const st = S(), today = todayISO();
  UI.jdate.mkfrom = today; UI.jdate.mkto = C.ecSchoolAdd(today, 6);
  return `<form data-form="mkMission" class="mk">
    <div class="field"><label class="lbl">نوع</label><div class="seg" id="mkScopeSeg">
      <button type="button" class="on" data-act="mkScope" data-v="class">👥 ماموریت کلاس</button>
      <button type="button" data-act="mkScope" data-v="group">🧩 ماموریت گروه</button>
      <button type="button" data-act="mkScope" data-v="battle">🏆 نبرد گروه‌ها</button></div>
      <input type="hidden" id="mkScopeVal" value="class"></div>
    <div class="field" id="mkGroupBox" style="display:none"><label class="lbl">گروه</label><select class="select" id="mkGroupSel">${(st.groups || []).map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl">عنوان</label><input class="input" id="mkTitle" required placeholder="مثلاً: ماموریت کلاس: حضور این هفته بالای ۹۵٪"></div>
    <div class="field"><label class="lbl">توضیح برای بچه‌ها</label><textarea class="input" id="mkDesc" rows="2" placeholder="چطور می‌بریم؟ چه چیزی شمرده می‌شود؟"></textarea></div>
    <div class="grid g2"><div class="field"><label class="lbl">سنجهٔ پیشرفت</label><select class="select" id="mkMetric">${Object.entries(MET).map(([k, v]) => `<option value="${k}">${v.i} ${v.l}</option>`).join('')}</select></div>
      <div class="field"><label class="lbl">هدف (عدد)</label><input class="input" data-fa inputmode="numeric" id="mkTarget" value="۹۰"></div></div>
    <div class="card mb" style="padding:13px;background:var(--surface2)"><h3 class="mb">🗓️ بازه (شمسی)</h3>
      <div class="field"><label class="lbl">از</label>${jDateSelects('mkfrom')}</div>
      <div class="field" style="margin-bottom:0"><label class="lbl">تا</label>${jDateSelects('mkto')}</div></div>
    <div class="grid g3"><div class="field"><label class="lbl">🪙 امتیاز</label><input class="input" data-fa inputmode="numeric" id="mkRP" value="۳"></div>
      <div class="field"><label class="lbl">⚡ تجربه</label><input class="input" data-fa inputmode="numeric" id="mkRX" value="۲۵"></div>
      <div class="field"><label class="lbl">🎰 چرخش</label><input class="input" data-fa inputmode="numeric" id="mkRS" value="۱"></div></div>
    <button class="btn" type="submit" style="width:100%">💾 ساخت ماموریت</button></form>`;
}
function assetForm() {
  const st = S();
  return `<form data-form="mkAsset" class="mk">
    <div class="field"><label class="lbl">نام سهام</label><input class="input" id="mkAName" required placeholder="مثلاً: سهام قرآن"></div>
    <div class="grid g2"><div class="field"><label class="lbl">نماد</label><input class="input" id="mkASym" maxlength="8" placeholder="QRAN"></div>
      <div class="field"><label class="lbl">آیکن</label><input class="input" id="mkAIcon" maxlength="4" value="📊"></div></div>
    <div class="field"><label class="lbl">سنجه از کدام درس؟</label><select class="select" id="mkASub">${(st.subjects || []).map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}<option value="@help">🤝 همکاری و احوال‌پرسی</option></select></div>
    <button class="btn" type="submit" style="width:100%">💾 ساخت سهام</button></form>`;
}

/* ---------- integration ---------- */
const baseNav = navItems, baseRV = renderView;
navItems = function () {
  const items = baseNav();
  const e = ['econ', '📈', isT() ? 'بورس، بیمه و اهداف' : 'بورس و بیمه من'];
  const at = items.findIndex(x => x[0] === 'shop');
  if (at > -1) items.splice(at + 1, 0, e); else items.push(e);
  return items;
};
renderView = function () {
  if (UI.section !== 'econ') return baseRV();
  const v = document.getElementById('view');
  try { C.ecEnsure(S()); v.innerHTML = `<div class="ve">${viewHTML()}</div>`; }
  catch (e) { console.error('econ view', e); v.innerHTML = `<div class="card">${empty('🛠️', 'خطا در نمایش بورس', 'صفحه را دوباره بارگذاری کنید.', '<button type="button" class="btn" data-act="reload">بارگذاری مجدد</button>')}</div>`; }
};

/* ---------- actions ---------- */
ACT.mkTab = el => { M.tab = el.dataset.tab; renderView(); Sound.play('tap'); };
ACT.mkPick = el => { M.asset = el.dataset.id; M.qty = 1; renderView(); Sound.play('tap'); };
ACT.mkQty = el => { M.qty = clamp(M.qty + Number(en(el.dataset.d)), 1, ec().settings.maxTradeQty || 15); const b = document.getElementById('mkQty'); if (b) b.textContent = fa(M.qty); Sound.play('tap'); };
ACT.mkGoIns = el => { M.ins.assetId = el.dataset.id; M.ins.qty = 1; M.tab = 'ins'; renderView(); Sound.play('tap'); };
ACT.mkBuy = el => {
  const id = el.dataset.id, a = (ec().assets || []).find(x => x.id === id); if (!a) return;
  const cost = Math.round(M.qty * price(a) * (1 + (ec().settings.tradeFee || 0) / 100));
  confirmDlg({ title: '📈 خرید سهم', body: `${fa(M.qty)} سهم «${a.name}» به قیمت تقریبی ${fa(cost)} سکه. اگر قیمت پایین بیاید ضرر می‌کنی؛ می‌توانی بیمه‌اش هم بکنی.`, okText: 'خرید کن', onOk: () => {
    send('econ.trade', { assetId: id, side: 'buy', qty: M.qty }, null, { sound: null }).then(r => { if (r) { Sound.play('pop'); toast(`📈 ${fa(M.qty)} سهم ${a.symbol} خریدی • ${fa(r.cost)} سکه`, 'ok'); } });
  } });
};
ACT.mkSell = el => {
  const id = el.dataset.id, a = (ec().assets || []).find(x => x.id === id); if (!a) return;
  const h = (S().econ.holdings || {})[SESS.sid]; const my = h && h[id];
  const q = Math.min(M.qty, my ? my.qty : 0);
  if (!q) return toast('سهمی نداری', 'err');
  const val = Math.round(q * price(a) * (1 - (ec().settings.tradeFee || 0) / 100));
  confirmDlg({ title: '📉 فروش سهم', body: `${fa(q)} سهم «${a.name}» به تقریب ${fa(val)} سکه. سهم‌های زیر پوشش بیمه قابل فروش نیستند.`, okText: 'بفروش', onOk: () => {
    send('econ.trade', { assetId: id, side: 'sell', qty: q }, null, { sound: null }).then(r => { if (r) { Sound.play('pop'); toast(`💰 فروش انجام شد • ${fa(r.proceeds)} سکه برگشت`, 'ok'); } });
  } });
};
ACT.mkRoll = () => send('econ.roll', {}, null, { sound: null }).then(r => { if (r) toast('🔄 بازار به‌روز و بیمه‌های منقضی تصفیه شد', 'ok'); });
ACT.mkPause = el => send('econ.asset.pause', { id: el.dataset.id }, st => { const a = st.econ.assets.find(x => x.id === el.dataset.id); if (a) a.paused = !a.paused; }, { sound: 'pop' });
ACT.mkANew = () => openDrawer('➕ سهام جدید', assetForm());
ACT.mkMNew = () => openDrawer('➕ ماموریت / نبرد', missionForm(), true);
ACT.mkScope = el => {
  M.mScope = el.dataset.v;
  document.querySelectorAll('#mkScopeSeg button').forEach(b => b.classList.toggle('on', b === el));
  document.getElementById('mkScopeVal').value = el.dataset.v;
  document.getElementById('mkGroupBox').style.display = el.dataset.v === 'group' ? '' : 'none';
  Sound.play('tap');
};
ACT.mkMDel = el => { const id = el.dataset.id; confirmDlg({ title: 'حذف ماموریت', body: 'ماموریت و نتایجش حذف شود؟', okText: 'حذف', danger: true, onOk: () => send('econ.mission.delete', { id }, st => { st.econ.missions = st.econ.missions.filter(m => m.id !== id); }, { msg: 'حذف شد', undo: true, sound: 'err' }) }); };
ACT.mkSettle = el => { const id = el.dataset.id; confirmDlg({ title: '🏁 تسویهٔ ماموریت', body: 'پیشرفت محاسبه و پاداش به برندگان داده می‌شود.', okText: 'تسویه کن', onOk: () => send('econ.mission.settle', { id }, null, { sound: null }).then(r => { if (r) { Sound.play('win'); toast(r.ok === false ? '✖️ ماموریت محقق نشد' : '🏆 ماموریت تسویه و پاداش داده شد', 'ok', null, 7000); } }) }); };
ACT.mkStep = el => {
  const k = el.dataset.k, d = Number(en(el.dataset.d)) || 1, s = ec().settings;
  s[k] = clamp((s[k] || 0) + d, k === 'tradeFee' ? 0 : 1, k === 'tradeFee' ? 20 : k === 'maxTradeQty' ? 50 : 20);
  const b = document.getElementById('mkS_' + k); if (b) b.textContent = fa(s[k]);
  clearTimeout(M.stT); M.stT = setTimeout(() => send('econ.settings', { patch: { [k]: s[k] } }, st => { st.econ.settings[k] = s[k]; }, { sound: null }), 500);
};
/* insurance actions */
ACT.mkInsAsset = null;
CHG.mkInsAsset = el => { M.ins.assetId = el.value; M.ins.qty = 1; renderView(); Sound.play('tap'); };
ACT.mkInsQty = el => { const fq = C.ecFreeQty(S(), SESS.sid, M.ins.assetId); M.ins.qty = clamp(M.ins.qty + Number(en(el.dataset.d)), 1, Math.max(1, fq)); const b = document.getElementById('mkInsQty'); if (b) b.textContent = fa(M.ins.qty); else renderView(); Sound.play('tap'); };
ACT.mkInsDays = el => { M.ins.days = Number(en(el.dataset.v)); renderView(); Sound.play('tap'); };
ACT.mkInsRatio = el => { M.ins.ratio = Number(en(el.dataset.v)); renderView(); Sound.play('tap'); };
ACT.mkInsBuy = el => {
  const q = C.ecQuote(S(), { sid: SESS.sid, assetId: M.ins.assetId, qty: M.ins.qty, days: M.ins.days, ratio: M.ins.ratio });
  if (!q || !q.ok) return toast(q ? q.reason : 'شرایط برقرار نیست', 'err');
  const a = (ec().assets || []).find(x => x.id === M.ins.assetId);
  confirmDlg({ title: '🛡️ خرید بیمه‌نامه', body: `${fa(q.qty || M.ins.qty)} سهم «${a ? a.name : ''}» به مدت ${fa(M.ins.days)} روز با پوشش ${fa(M.ins.ratio)}٪ ضرر.\nحق بیمه: ${fa(q.premium)} سکه • سقف خسارت: ${fa(q.cap)} سکه.\nاگر قیمت بالا برود، حق بیمه برنمی‌گردد — این قانون بیمه است.`, okText: 'بیمه کن', onOk: () => {
    send('econ.insure', { id: uid(), assetId: M.ins.assetId, qty: M.ins.qty, days: M.ins.days, ratio: M.ins.ratio }, null, { sound: null }).then(r => { if (r) { Sound.play('win'); toast(`🛡️ بیمه‌نامه فعال شد • ${fa(r.premium)} سکه حق بیمه`, 'ok', null, 7000); } });
  } });
};
ACT.mkInsCancel = el => { const id = el.dataset.id; confirmDlg({ title: '↩️ فسخ بیمه‌نامه', body: '۴۰٪ حق بیمه برمی‌گردد و پوشش از بین می‌رود.', okText: 'فسخ کن', onOk: () => send('econ.insCancel', { id }, null, { sound: null }).then(r => { if (r) toast(`↩️ فسخ شد • ${fa(r.refund)} سکه برگشت`, 'ok'); }) }); };
ACT.mkInsSettle = () => send('econ.insSettle', {}, null, { sound: null }).then(r => { if (r) toast(`⚙️ ${fa(r.settled)} بیمه‌نامه بررسی/تصفیه شد`, 'ok'); });
ACT.mkInsStep = el => {
  const k = el.dataset.k, d = Number(en(el.dataset.d)) || 1, ins = (ec().settings || {}).ins || {};
  ins[k] = clamp((ins[k] == null ? 0 : ins[k]) + d, 0, k === 'loading' ? 100 : k === 'cap' ? 80 : k === 'fee' ? 10 : k === 'maxDays' ? 20 : 10);
  const b = document.getElementById('mkIS_' + k); if (b) b.textContent = fa(ins[k]);
  clearTimeout(M.isT2); M.isT2 = setTimeout(() => send('econ.insSettings', { patch: { [k]: ins[k] } }, st => { st.econ.settings.ins[k] = ins[k]; }, { sound: null }), 500);
};
CHG.mkInsSet = el => { const k = el.dataset.k, v = el.checked; send('econ.insSettings', { patch: { [k]: v } }, st => { st.econ.settings.ins[k] = v; }, { msg: 'قاعدهٔ بیمه ذخیره شد' }); };
CHG.mkSet = el => { const k = el.dataset.k, v = el.checked; send('econ.settings', { patch: { [k]: v } }, st => { st.econ.settings[k] = v; }, { msg: 'قاعده ذخیره شد' }); };
/* csv with insurance */
const baseCsvKind = ACT.mkCsv;
ACT.mkCsv = el => {
  const kind = el.dataset.kind;
  if (kind !== 'ins') { csvGeneric(kind); return; }
  const st = S();
  const rows = [['دانش‌آموز', 'سهام', 'تعداد', 'پوشش٪', 'روز', 'قیمت پایه', 'حق بیمه', 'سقف خسارت', 'شروع', 'پایان', 'وضعیت', 'خسارت']];
  (st.econ.policies || []).forEach(p => rows.push([(stuById(st, p.sid) || {}).name || '', p.symbol || '', p.qty, p.ratio, p.days, faNum(p.strike), p.premium, p.cap || 0, jShort(p.startAt), jShort(p.endAt), (INS[p.status] || {}).l || p.status, p.payout || 0]));
  download(`بیمه-${C.jShortEn(todayISO()).replace(/\//g, '-')}.csv`, serializeCSV(st, rows));
  toast('فایل بیمه‌نامه‌ها دانلود شد', 'ok');
};
function csvGeneric(kind) {
  const st = S(); let rows;
  if (kind === 'quests' || kind === 'missions') { rows = [['عنوان', 'نوع', 'سنجه', 'هدف', 'از', 'تا', 'وضعیت']]; (st.econ.missions || []).forEach(m => rows.push([m.title, m.scope, (MET[m.metric] || {}).l || m.metric, m.target, m.from, m.to, m.status])); }
  else if (kind === 'streaks' || kind === 'board') { rows = [['نام', 'نقد', 'ارزش سهام', 'دارایی کل', 'سود/زیان']]; C.ecBoard(st).forEach(b => rows.push([b.name, b.cash, b.value, b.total, b.pnl])); }
  else { rows = [['نام', 'تاریخ', 'نوع', 'تعداد', 'قیمت', 'ارزش']]; (st.econ.trades || []).forEach(t => rows.push([(stuById(st, t.sid) || {}).name || '', jShort(iranISO(new Date(t.at))), t.side === 'buy' ? 'خرید' : 'فروش', t.qty, faNum(t.price), t.value])); }
  download(`بورس-${kind}-${C.jShortEn(todayISO()).replace(/\//g, '-')}.csv`, serializeCSV(st, rows));
  toast('فایل دانلود شد', 'ok');
}
FORM.mkMission = () => {
  const title = (document.getElementById('mkTitle').value || '').trim();
  if (!title) return toast('عنوان را بنویس', 'err');
  const scope = document.getElementById('mkScopeVal').value;
  const data = { title, desc: (document.getElementById('mkDesc').value || '').trim(), scope, groupId: scope === 'group' ? document.getElementById('mkGroupSel').value : '', metric: document.getElementById('mkMetric').value, target: num(document.getElementById('mkTarget').value) || 0, from: UI.jdate.mkfrom || todayISO(), to: UI.jdate.mkto || todayISO(), reward: { points: num(document.getElementById('mkRP').value) || 0, xp: num(document.getElementById('mkRX').value) || 0, spin: num(document.getElementById('mkRS').value) || 0 } };
  send('econ.mission.create', { id: uid(), ...data }, null, { msg: '🎯 ماموریت برای کلاس منتشر شد' });
  closeDrawer();
};
FORM.mkAsset = () => {
  const name = (document.getElementById('mkAName').value || '').trim();
  if (!name) return toast('نام سهام را بنویس', 'err');
  send('econ.asset.add', { id: uid(), name, symbol: (document.getElementById('mkASym').value || 'NEW').toUpperCase(), icon: document.getElementById('mkAIcon').value || '📊', subject: document.getElementById('mkASub').value, color: C.CPAL[Math.floor(Math.random() * 8)] }, null, { msg: '🏦 سهام جدید ساخته شد' });
  closeDrawer();
};
if (S() && SESS) render(true);
})();
