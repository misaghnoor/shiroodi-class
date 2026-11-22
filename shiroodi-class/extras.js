/* extras.js — فروشگاه امتیاز، نشان‌ها و مرکز اعلان (رابط کاربری) */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.SHOP_CATS || typeof navItems !== 'function') return;

const CATS = C.SHOP_CATS, ORDER = C.ORDER, TIERS = C.TIERS, BADGES = C.BADGES, BMAP = C.BADGE_MAP;
const wallet = C.wallet, badgeProgress = C.badgeProgress, rewardActive = C.rewardActive;

/* ================= style ================= */
const CSS = `
.x{--gold:#d97706;--gold2:#fbbf24;--coin:#f59e0b;--mag:#e11d48;--teal:#0d9488;--lapis:#1d4ed8;--grape:#7c3aed;--leaf:#65a30d;--ink2:#2b2418;--paper:#fdf6e8;--rule:#e6d9bd}
[data-theme=dark] .x{--paper:#141d33;--ink2:#e9eef7;--rule:#26334f}
.x-hero{position:relative;overflow:hidden;border-radius:24px;padding:26px 28px;margin-bottom:18px;border:1.5px solid color-mix(in srgb,var(--gold) 32%,var(--line));
background:radial-gradient(120% 140% at 88% -10%,color-mix(in srgb,var(--gold2) 34%,transparent),transparent 55%),radial-gradient(90% 120% at 8% 110%,color-mix(in srgb,var(--mag) 22%,transparent),transparent 60%),linear-gradient(135deg,color-mix(in srgb,var(--gold) 16%,var(--paper)),color-mix(in srgb,var(--teal) 12%,var(--paper)));box-shadow:var(--shadow)}
.x-hero::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.5;
background-image:radial-gradient(circle at 12% 30%,color-mix(in srgb,var(--gold2) 55%,transparent) 0 3px,transparent 4px),radial-gradient(circle at 78% 62%,color-mix(in srgb,var(--mag) 40%,transparent) 0 2.5px,transparent 3.5px),radial-gradient(circle at 42% 82%,color-mix(in srgb,var(--teal) 45%,transparent) 0 2px,transparent 3px),radial-gradient(circle at 62% 18%,color-mix(in srgb,var(--grape) 40%,transparent) 0 2px,transparent 3px);background-size:220px 220px;animation:xDrift 24s linear infinite}
@keyframes xDrift{to{background-position:220px 0,-220px 0,220px 0,-220px 0}}
.x-hero::after{content:'';position:absolute;left:-40px;bottom:-70px;width:220px;height:220px;border-radius:50%;pointer-events:none;
background:radial-gradient(circle,color-mix(in srgb,var(--gold2) 45%,transparent),transparent 65%);filter:blur(10px)}
.x-hero>*{position:relative;z-index:2}
.x-hero h1{font-family:var(--display);font-weight:400;font-size:2.05rem;line-height:1.3;color:var(--ink2)}
.x-hero p{color:var(--muted);font-size:.88rem;max-width:620px}
.x-quick{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
.x-quick .q{display:inline-flex;align-items:center;gap:7px;background:color-mix(in srgb,var(--surface) 84%,transparent);border:1px solid var(--line);border-radius:13px;padding:7px 13px;font-size:.8rem;font-weight:800;backdrop-filter:blur(6px)}
.x-quick .q b{font-family:var(--display);font-size:1.15rem;font-weight:400}
.x-wallet{position:relative;display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,#b45309,#d97706 45%,#f59e0b);color:#fff;border-radius:20px;padding:18px 22px;box-shadow:0 18px 40px -18px rgba(180,83,9,.7);overflow:hidden;min-width:250px}
.x-wallet::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.14) 0 2px,transparent 2px 14px);pointer-events:none}
.x-wallet::after{content:'';position:absolute;right:-30px;top:-40px;width:130px;height:130px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.4),transparent 65%)}
.x-wallet .coin{width:62px;height:62px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fde68a,#f59e0b 60%,#b45309);border:3px solid #fde68a;display:flex;align-items:center;justify-content:center;font-size:1.7rem;box-shadow:0 6px 16px -6px rgba(0,0,0,.5),inset 0 -4px 8px rgba(0,0,0,.25);flex:none;animation:xCoin 4s ease-in-out infinite}
@keyframes xCoin{0%,100%{transform:rotateY(0)}50%{transform:rotateY(180deg)}}
.x-wallet b{font-family:var(--display);font-size:2.4rem;font-weight:400;line-height:1;display:block;text-shadow:0 2px 8px rgba(0,0,0,.3)}
.x-wallet span{font-size:.78rem;opacity:.92;font-weight:700}
.x-wallet .mini{display:flex;gap:10px;margin-top:6px;font-size:.72rem;font-weight:700;opacity:.95}
.x-toolbar{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
.x-toolbar .input,.x-toolbar .select{width:auto}
.x-grid{display:grid;gap:15px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.x-card{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s,border-color .2s;overflow:hidden;display:flex;flex-direction:column}
.x-card::before{content:'';position:absolute;top:-34px;left:-34px;width:110px;height:110px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--kc) 26%,transparent),transparent 70%);pointer-events:none}
.x-card::after{content:'';position:absolute;right:-7px;top:50%;width:14px;height:14px;border-radius:50%;background:var(--bg);border:1px solid var(--line);transform:translateY(-50%);box-shadow:inset 2px 0 3px rgba(0,0,0,.08)}
.x-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:color-mix(in srgb,var(--kc) 45%,var(--line))}
.x-card.sel{border-color:var(--kc);box-shadow:0 0 0 2.5px color-mix(in srgb,var(--kc) 26%,transparent)}
.x-card.dragging{opacity:.45;transform:rotate(-1.5deg) scale(.98)}
.x-card.hint{border-style:dashed;border-color:var(--kc);transform:scale(1.02)}
.x-card.off{opacity:.62;filter:saturate(.55)}
.x-card>*{position:relative;z-index:2}
.x-icon{width:56px;height:56px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-size:1.75rem;flex:none;background:color-mix(in srgb,var(--kc) 15%,var(--surface));border:1.5px solid color-mix(in srgb,var(--kc) 32%,transparent);box-shadow:0 6px 14px -8px var(--kc)}
.x-name{font-weight:800;font-size:.95rem;line-height:1.55;color:var(--ink)}
.x-cost{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#b45309,#f59e0b);color:#fff;border-radius:99px;padding:5px 13px;font-weight:800;font-size:.86rem;box-shadow:0 6px 14px -7px #b45309}
.x-cost .c{width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fde68a,#f59e0b 65%,#b45309);border:1.5px solid #fde68a;display:inline-block}
.x-pill{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:800;padding:3px 10px;border-radius:99px;background:color-mix(in srgb,var(--pc) 13%,var(--surface));color:var(--pc);border:1px solid color-mix(in srgb,var(--pc) 32%,transparent)}
.x-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
.x-desc{font-size:.79rem;color:var(--muted);line-height:1.85;margin-top:9px;background:var(--surface2);border:1px dashed var(--line);border-radius:11px;padding:8px 10px}
.x-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;border-top:1px dashed var(--line);padding-top:10px;margin-top:auto}
.x-stock{font-size:.74rem;font-weight:800;color:var(--muted)}
.x-stock.low{color:#e11d48}
.x-grip{cursor:grab;color:var(--muted);font-size:1rem;padding:2px 5px;border-radius:7px;user-select:none}
.x-grip:hover{background:var(--surface2);color:var(--ink)}
.x-buy{width:100%;margin-top:11px}
.x-buy:disabled{background:var(--surface2);color:var(--muted);box-shadow:none;border:1px dashed var(--line);filter:none}
.x-row{display:flex;align-items:center;gap:11px;padding:11px 13px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.x-row:last-child{border-bottom:none}
.x-row .n{font-weight:700;font-size:.87rem;flex:1;min-width:150px}
.x-scroll{max-height:62vh;overflow:auto}
.x-scroll::-webkit-scrollbar{width:11px;height:11px}
.x-scroll::-webkit-scrollbar-track{background:color-mix(in srgb,var(--rule) 55%,var(--surface2));border-radius:99px}
.x-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--gold),var(--mag));border-radius:99px;border:3px solid var(--surface2)}
.x-scroll::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,var(--mag),var(--grape))}
.x-scroll{scrollbar-width:thin;scrollbar-color:var(--gold) var(--surface2)}
.x-chips{display:flex;gap:7px;flex-wrap:wrap}
.x-chip{border:1.5px solid var(--line);background:var(--overlay);border-radius:99px;padding:7px 14px;font-size:.8rem;font-weight:800;color:var(--muted);transition:all .16s;display:inline-flex;align-items:center;gap:6px}
.x-chip:hover{transform:translateY(-1px);border-color:var(--cc,var(--gold))}
.x-chip.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,var(--cc,var(--gold)),color-mix(in srgb,var(--cc,var(--gold)) 60%,#000))}
.x-stepper{display:inline-flex;align-items:center;border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:var(--overlay)}
.x-stepper button{border:none;background:var(--surface2);width:36px;height:38px;font-size:1.1rem;font-weight:800;color:var(--ink)}
.x-stepper button:hover{background:color-mix(in srgb,var(--gold) 18%,var(--surface))}
.x-stepper b{min-width:52px;text-align:center;font-family:var(--display);font-size:1.15rem;font-weight:400}
.x-icons{display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:6px}
.x-icons button{border:1.5px solid var(--line);background:var(--overlay);border-radius:12px;height:44px;font-size:1.3rem;transition:all .15s}
.x-icons button:hover{transform:scale(1.08);border-color:var(--gold)}
.x-icons button.on{border-color:var(--gold);background:color-mix(in srgb,var(--gold) 16%,var(--surface));box-shadow:0 0 0 2px color-mix(in srgb,var(--gold) 30%,transparent)}
.x-coinburst{position:fixed;z-index:140;pointer-events:none;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fde68a,#f59e0b 62%,#b45309);border:2px solid #fde68a;box-shadow:0 3px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:.6rem}
.x-stamp{position:fixed;z-index:140;pointer-events:none;width:138px;height:138px;border-radius:50%;border:5px double var(--sc,#16a34a);color:var(--sc,#16a34a);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--display);font-size:1.05rem;background:color-mix(in srgb,var(--sc,#16a34a) 9%,#fff);transform:translate(-50%,-50%) rotate(-14deg) scale(2.4);opacity:0;animation:xStamp .9s cubic-bezier(.2,.9,.2,1) forwards;text-align:center;line-height:1.35}
[data-theme=dark] .x-stamp{background:color-mix(in srgb,var(--sc,#16a34a) 16%,#0b1120)}
@keyframes xStamp{0%{opacity:0;transform:translate(-50%,-50%) rotate(-30deg) scale(2.5)}28%{opacity:1;transform:translate(-50%,-50%) rotate(-12deg) scale(.94)}44%{transform:translate(-50%,-50%) rotate(-12deg) scale(1.07)}72%{opacity:1;transform:translate(-50%,-50%) rotate(-12deg) scale(1)}100%{opacity:0;transform:translate(-50%,-58%) rotate(-12deg) scale(1.02)}}
/* badges */
.x-bhero{position:relative;overflow:hidden;border-radius:24px;padding:26px 28px;margin-bottom:18px;border:1.5px solid color-mix(in srgb,var(--grape) 30%,var(--line));
background:radial-gradient(110% 130% at 12% -10%,color-mix(in srgb,var(--grape) 30%,transparent),transparent 55%),radial-gradient(90% 120% at 92% 110%,color-mix(in srgb,var(--gold2) 30%,transparent),transparent 60%),linear-gradient(135deg,color-mix(in srgb,var(--grape) 14%,var(--paper)),color-mix(in srgb,var(--lapis) 12%,var(--paper)));box-shadow:var(--shadow)}
.x-bhero::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.45;background-image:radial-gradient(circle,color-mix(in srgb,var(--gold2) 60%,transparent) 0 1.6px,transparent 2.4px);background-size:34px 34px;animation:xTwinkle 6s ease-in-out infinite alternate}
@keyframes xTwinkle{from{opacity:.25}to{opacity:.6}}
.x-bhero>*{position:relative;z-index:2}
.x-bhero h1{font-family:var(--display);font-weight:400;font-size:2.05rem;color:var(--ink2)}
.x-case{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(158px,1fr))}
.x-medal{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px 12px 13px;text-align:center;box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s;cursor:pointer;overflow:hidden}
.x-medal:hover{transform:translateY(-4px) scale(1.02);box-shadow:var(--shadow-lg)}
.x-medal.locked{filter:grayscale(.85);opacity:.72}
.x-medal.locked:hover{filter:grayscale(.4);opacity:.9}
.x-medal .ribbon{position:absolute;top:0;left:50%;transform:translateX(-50%);width:44px;height:16px;background:linear-gradient(180deg,var(--tc),color-mix(in srgb,var(--tc) 60%,#000));clip-path:polygon(0 0,100% 0,100% 100%,50% 72%,0 100%);opacity:.9}
.x-medal svg{display:block;margin:8px auto 6px}
.x-medal .nm{font-weight:800;font-size:.83rem;line-height:1.5}
.x-medal .tier{font-size:.68rem;font-weight:800;color:var(--tc);margin-top:3px}
.x-medal .when{font-size:.68rem;color:var(--muted);margin-top:4px}
.x-medal .lock{position:absolute;top:9px;left:9px;font-size:.95rem}
.x-medal .shine{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.35) 50%,transparent 60%);transform:translateX(-120%);animation:xShine 4.5s ease-in-out infinite}
@keyframes xShine{0%,70%{transform:translateX(-120%)}85%{transform:translateX(120%)}100%{transform:translateX(120%)}}
.x-prog{height:7px;border-radius:99px;background:var(--surface2);border:1px solid var(--line);overflow:hidden;margin-top:8px}
.x-prog i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--tc),color-mix(in srgb,var(--tc) 55%,#fff));transition:width .5s}
.x-matrix{overflow:auto;border:1px solid var(--line);border-radius:16px;background:var(--surface);max-height:66vh}
.x-matrix table{border-collapse:separate;border-spacing:0;width:100%;font-size:.8rem}
.x-matrix th{background:var(--surface2);padding:9px 6px;font-size:.95rem;position:sticky;top:0;z-index:3;border-bottom:1px solid var(--line);text-align:center}
.x-matrix th:first-child{text-align:right;right:0;z-index:4;min-width:160px;font-size:.78rem}
.x-matrix td{padding:6px;border-bottom:1px solid var(--line);text-align:center}
.x-matrix td:first-child{position:sticky;right:0;background:var(--surface);text-align:right;font-weight:700;z-index:2;border-left:1px solid var(--line);font-size:.8rem;white-space:nowrap}
.x-matrix tr:hover td{background:color-mix(in srgb,var(--grape) 5%,var(--surface))}
.x-dot{width:26px;height:26px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;font-size:.85rem;border:1px solid var(--line)}
.x-dot.on{background:color-mix(in srgb,var(--tc) 20%,var(--surface));border-color:color-mix(in srgb,var(--tc) 45%,transparent)}
.x-dot.off{background:var(--surface2);color:var(--muted);font-size:.62rem;font-weight:800}
/* notifications */
.x-bell{position:relative}
.x-bell .cnt{position:absolute;top:-5px;left:-5px;min-width:19px;height:19px;border-radius:99px;background:linear-gradient(135deg,#e11d48,#f97316);color:#fff;font-size:.64rem;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 5px;border:2px solid var(--surface);box-shadow:0 3px 8px -3px #e11d48}
.x-bell.ring{animation:xRing 1.6s ease-in-out infinite}
@keyframes xRing{0%,86%,100%{transform:rotate(0)}88%{transform:rotate(14deg)}90%{transform:rotate(-12deg)}92%{transform:rotate(9deg)}94%{transform:rotate(-6deg)}96%{transform:rotate(3deg)}}
.x-nhead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.x-nfilters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.x-nf{border:1.5px solid var(--line);background:var(--overlay);border-radius:99px;padding:6px 12px;font-size:.76rem;font-weight:800;color:var(--muted)}
.x-nf.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,var(--nc,#1d4ed8),color-mix(in srgb,var(--nc,#1d4ed8) 60%,#000))}
.x-notif{display:flex;gap:12px;padding:12px 13px;border-radius:15px;border:1px solid var(--line);background:var(--surface);margin-bottom:9px;cursor:pointer;transition:all .18s;position:relative;overflow:hidden}
.x-notif::before{content:'';position:absolute;right:0;top:0;bottom:0;width:4px;background:var(--nc)}
.x-notif:hover{transform:translateX(-3px);border-color:color-mix(in srgb,var(--nc) 45%,var(--line));box-shadow:var(--shadow)}
.x-notif.unread{background:color-mix(in srgb,var(--nc) 7%,var(--surface));border-color:color-mix(in srgb,var(--nc) 32%,var(--line))}
.x-notif .ni{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex:none;background:color-mix(in srgb,var(--nc) 15%,var(--surface));border:1px solid color-mix(in srgb,var(--nc) 30%,transparent)}
.x-notif .nt{font-weight:800;font-size:.87rem;line-height:1.55}
.x-notif .nb{font-size:.78rem;color:var(--muted);line-height:1.75;margin-top:2px}
.x-notif .nw{font-size:.68rem;color:var(--muted);margin-top:5px;font-weight:700}
.x-notif .ud{width:9px;height:9px;border-radius:50%;background:var(--nc);flex:none;margin-top:6px;box-shadow:0 0 0 3px color-mix(in srgb,var(--nc) 22%,transparent)}
.x-ngroup{font-size:.72rem;font-weight:800;color:var(--muted);margin:14px 2px 7px;display:flex;align-items:center;gap:8px}
.x-ngroup::after{content:'';flex:1;height:1px;background:var(--line)}
/* mobile nav */
#xnav{position:fixed;bottom:0;right:0;left:0;z-index:57;display:none;align-items:stretch;gap:2px;padding:6px 6px calc(6px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--surface) 92%,transparent);backdrop-filter:blur(16px);border-top:1px solid var(--line);box-shadow:0 -8px 24px -14px rgba(0,0,0,.35)}
#xnav button{flex:1;border:none;background:transparent;border-radius:13px;padding:7px 2px 5px;display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--muted);font-size:.62rem;font-weight:800;position:relative;min-height:50px;transition:all .16s}
#xnav button .i{font-size:1.22rem;line-height:1}
#xnav button.on{color:var(--acc);background:color-mix(in srgb,var(--acc) 11%,var(--surface))}
#xnav button .b{position:absolute;top:3px;right:calc(50% - 20px);min-width:16px;height:16px;border-radius:99px;background:#e11d48;color:#fff;font-size:.58rem;display:flex;align-items:center;justify-content:center;padding:0 4px;border:1.5px solid var(--surface)}
@media (max-width:960px){
#xnav{display:flex}
#main{padding-bottom:calc(92px + env(safe-area-inset-bottom))!important}
#toasts{bottom:calc(84px + env(safe-area-inset-bottom))}
.x-hero,.x-bhero{padding:18px 16px}
.x-hero h1,.x-bhero h1{font-size:1.5rem}
.x-wallet{min-width:0;width:100%}
.x-wallet b{font-size:2rem}
.x-toolbar .input,.x-toolbar .select{width:100%}
.x-grid{grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.x-case{grid-template-columns:repeat(auto-fill,minmax(136px,1fr))}
.x-row .n{min-width:100%;order:-1}
#dateChip,#clock{display:none}
}
@media (max-width:520px){
.x-grid{grid-template-columns:1fr}
.x-case{grid-template-columns:repeat(2,1fr)}
.x-hero .spread{flex-direction:column;align-items:stretch}
.x-quick .q{flex:1;justify-content:center}
}
@media (min-width:961px){#xnav{display:none!important}}
body.x-drawer #xnav{opacity:0;pointer-events:none;transform:translateY(100%);transition:all .25s}
`;
const styleEl = document.createElement('style');
styleEl.id = 'xStyles'; styleEl.textContent = CSS;
document.head.appendChild(styleEl);

/* ================= state ================= */
const X = {
  shopTab: 'requests', q: '', cat: 'all', status: 'all', sort: 'order', mode: 'cards', sel: new Set(),
  ledgerQ: '', ledgerStatus: 'all', ledgerStu: 'all',
  myTab: 'store', myCat: 'all', myQ: '',
  badgeTab: 'case', bq: '', btier: 'all', bstu: 'all',
  nFilter: 'all', nOpen: false,
  draft: null, buyDraft: null, imp: null, seen: null, firstRun: false, lastIds: []
};
const shop = () => (S() && S().shop) || { rewards: [], purchases: [], settings: { enabled: true, requireApproval: true }, savedViews: [] };
const badges = () => (S() && S().badges) || { awarded: [], settings: { autoAward: true }, progress: {} };
const mySid = () => (SESS && SESS.sid) || '';
const myWallet = () => wallet(S(), mySid());
const myPurchases = () => (shop().purchases || []).filter(p => isT() || p.sid === mySid());
const rewardById = id => (shop().rewards || []).find(r => r.id === id);
const orderedRewards = () => (shop().rewards || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
const tierOf = b => TIERS[b.tier] || TIERS.bronze;
const catOf = r => CATS[r.cat] || CATS.gift;
const isLocked = (r) => !rewardActive(S(), r) || r.stock === 0;

/* ================= tiny helpers ================= */
function pill(text, color, icon) { return `<span class="x-pill" style="--pc:${color}">${icon || ''} ${esc(text)}</span>`; }
function coin(n) { return `<span class="x-cost"><span class="c"></span>${fa(n)}</span>`; }
function relTime(at) {
  const d = Date.now() - new Date(at).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'همین الآن';
  if (m < 60) return fa(m) + ' دقیقه پیش';
  const h = Math.floor(m / 60);
  if (h < 24) return fa(h) + ' ساعت پیش';
  const dd = Math.floor(h / 24);
  if (dd < 7) return fa(dd) + ' روز پیش';
  return jShort(iranISO(new Date(at)));
}
function dayGroup(at) {
  const d = iranISO(new Date(at)), t = todayISO();
  if (d === t) return 'امروز';
  const y = isoToDate(t); y.setDate(y.getDate() - 1);
  if (d === dateToISO(y)) return 'دیروز';
  return jLabel(d);
}
function medalSVG(b, size, locked) {
  const t = tierOf(b), id = 'm' + b.key + size + (locked ? 'l' : '');
  const c1 = locked ? '#9aa0a6' : t.c2, c2 = locked ? '#6b7280' : t.c, ring = locked ? '#5b6270' : t.ring;
  const pts = [];
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3; pts.push((size / 2 + Math.cos(a) * (size / 2 - 4)).toFixed(1) + ',' + (size / 2 + Math.sin(a) * (size / 2 - 4)).toFixed(1)); }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <polygon points="${pts.join(' ')}" fill="url(#${id})" stroke="${ring}" stroke-width="2.5"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 12}" fill="rgba(255,255,255,.22)" stroke="${ring}" stroke-width="1.2"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="${size * .42}">${b.icon}</text></svg>`;
}
function coinBurst(x, y, n) {
  for (let i = 0; i < (n || 12); i++) {
    const el = document.createElement('div');
    el.className = 'x-coinburst'; el.textContent = '★';
    el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.appendChild(el);
    const a = (Math.PI * 2 * i) / (n || 12) + Math.random() * .5;
    const dist = 60 + Math.random() * 90;
    el.animate([
      { transform: 'translate(-50%,-50%) scale(.6) rotate(0)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist - 40}px)) scale(1.1) rotate(${180 + Math.random() * 360}deg)`, opacity: 0 }
    ], { duration: 750 + Math.random() * 350, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => el.remove();
  }
}
function stamp(text, color) {
  const el = document.createElement('div');
  el.className = 'x-stamp'; el.style.setProperty('--sc', color || '#16a34a');
  el.innerHTML = `<span style="font-size:1.6rem">🎖️</span><span>${esc(text)}</span>`;
  el.style.left = (innerWidth / 2) + 'px'; el.style.top = (innerHeight / 2) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}
const lsKey = () => 'sh13_seen_' + (SESS ? (SESS.role + '_' + (SESS.sid || 't')) : 'x');
function loadSeen() {
  if (X.seen) return X.seen;
  try { const v = JSON.parse(localStorage.getItem(lsKey()) || 'null'); X.seen = new Set(Array.isArray(v) ? v : []); X.firstRun = !v; }
  catch (e) { X.seen = new Set(); X.firstRun = true; }
  return X.seen;
}
function saveSeen() { try { localStorage.setItem(lsKey(), JSON.stringify([...X.seen].slice(-400))); } catch (e) {} }

/* ================= notifications ================= */
const NT = {
  news: { i: '📢', c: '#0d9488', l: 'اخبار' },
  hw: { i: '📚', c: '#1d4ed8', l: 'تکلیف' },
  poll: { i: '🗳️', c: '#7c3aed', l: 'نظرسنجی' },
  quiz: { i: '🧠', c: '#0ea5e9', l: 'آزمون' },
  court: { i: '⚖️', c: '#8b5cf6', l: 'دادگاه' },
  shop: { i: '🛒', c: '#d97706', l: 'فروشگاه' },
  badge: { i: '🏅', c: '#65a30d', l: 'نشان' },
  grade: { i: '📝', c: '#f59e0b', l: 'نمره' },
  report: { i: '📨', c: '#e11d48', l: 'گزارش' }
};
function buildNotifs() {
  const st = S(); if (!st || !SESS) return [];
  const out = [];
  const push = (type, id, at, title, body, sec) => { const m = NT[type] || NT.news; out.push({ id: type + ':' + id, type, icon: m.i, color: m.c, at, title, body, sec }); };
  const tIso = d => { const x = isoToDate(d); return new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate(), 9)).toISOString(); };
  (st.news || []).forEach(n => push('news', n.id + (n.pinned ? 'p' : ''), tIso(n.date), n.title, (n.body || '').slice(0, 90), 'news'));
  if (isT()) {
    (shop().purchases || []).filter(p => p.status === 'pending').forEach(p => { const s = stuById(st, p.sid); push('shop', p.id, p.at, 'درخواست خرید تازه', `${s ? s.name : ''} — ${p.icon} ${p.name} (${fa(p.cost)} امتیاز)`, 'shop'); });
    const hw = st.homework;
    if (hw && hw.assignments) hw.assignments.forEach(a => {
      if (a.status !== 'published') return;
      const subs = (hw.subs && hw.subs[a.id]) || {};
      let wait = 0; for (const sid in subs) { const s = subs[sid]; if (s && !s.teacherReview) wait++; }
      if (wait) push('hw', a.id + ':' + wait, a.createdAt ? tIso(a.createdAt) : tIso(a.assignedAt), `${fa(wait)} تکلیف در انتظار بررسی`, a.title, 'homework');
    });
    (st.reports || []).filter(r => r.status === 'pending_teacher').forEach(r => { const b = stuById(st, r.by); push('report', r.id, tIso(r.date), 'گزارش تازه از ' + (b ? b.name : ''), r.title, 'roles'); });
    (st.reports || []).filter(r => r.status === 'pending_final').forEach(r => { const t = stuById(st, r.target); push('court', r.id + 'f', r.verdict ? r.verdict.at : tIso(r.date), 'رأی قاضی در انتظار تأیید', `دربارهٔ ${t ? t.name : ''} — ${r.title}`, 'roles'); });
    (st.quizzes || []).forEach(q => { const n = Object.keys(q.submissions || {}).length; if (n) push('quiz', q.id + ':' + n, q.startAt, `${fa(n)} پاسخ در آزمون`, q.title, 'quizzes'); });
    (shop().rewards || []).filter(r => r.active !== false && r.stock >= 0 && r.stock <= 1).forEach(r => push('shop', 'stock' + r.id + r.stock, r.createdAt ? tIso(r.createdAt) : new Date().toISOString(), r.stock === 0 ? 'موجودی تمام شد' : 'موجودی رو به پایان', `${r.icon} ${r.name} — ${fa(r.stock)} عدد`, 'shop'));
    (st.polls || []).filter(p => p.status === 'active').forEach(p => { const n = Object.keys(p.votes || {}).length; push('poll', p.id + ':' + n, p.createdAt ? tIso(p.createdAt) : new Date().toISOString(), `${fa(n)} رأی ثبت شد`, p.question, 'polls'); });
  } else {
    const sid = mySid();
    const hw = st.homework;
    if (hw && hw.assignments) hw.assignments.filter(a => a.status === 'published' && C.hwTargets(st, a, sid)).forEach(a => {
      const sub = hw.subs && hw.subs[a.id] && hw.subs[a.id][sid];
      const due = C.hwPhase(a) === 'overdue' ? '🔥 مهلت گذشته' : C.hwPhase(a) === 'today' ? '⏰ مهلت امروز' : '🗓️ مهلت ' + jShort(a.dueAt);
      push('hw', a.id + (sub ? ':' + sub.at : ''), a.createdAt ? tIso(a.createdAt) : tIso(a.assignedAt), sub ? (sub.teacherReview ? (sub.teacherReview.verdict === 'approved' ? '🎖️ تکلیفت تأیید شد' : '🔁 بازنویسی خواسته شد') : '📥 تکلیفت ثبت شد') : 'تکلیف تازه', `${a.title} — ${due}`, 'myHomework');
    });
    (st.polls || []).filter(p => p.status === 'active').forEach(p => { const v = p.myVote; push('poll', p.id + (v != null ? 'v' : ''), p.createdAt ? tIso(p.createdAt) : new Date().toISOString(), v != null ? 'رأی تو ثبت شد' : 'نظرسنجی فعال', p.question, 'polls'); });
    (st.quizzes || []).forEach(q => { const s = quizStatus(q); if (s === 'active' || s === 'scheduled') push('quiz', q.id + s, q.startAt, s === 'active' ? '🟢 آزمون در حال برگزاری' : '⏳ آزمون زمان‌بندی شد', `${q.title} — ${dtLabel(q.startAt)}`, 'quizzes'); });
    (st.reports || []).filter(r => r.target === sid && r.status === 'approved' && r.verdict).forEach(r => push('court', r.id, r.verdict.at || tIso(r.date), r.verdict.type === 'acquittal' ? '🕊️ رأی برائت صادر شد' : '⚖️ رأی دادگاه کلاس', r.title, 'myCourt'));
    myPurchases().forEach(p => push('shop', p.id + p.status, p.review ? p.review.at : p.at, p.status === 'approved' ? '✅ خریدت تأیید شد' : p.status === 'rejected' ? '✖️ خریدت رد شد' : p.status === 'pending' ? '⏳ درخواست خرید ثبت شد' : '↩️ خرید لغو شد', `${p.icon} ${p.name}${p.review && p.review.note ? ' — ' + p.review.note : ''}`, 'shop'));
    (badges().awarded || []).forEach(a => { const b = BMAP[a.key]; if (b) push('badge', a.id, a.at, '🏅 نشان تازه گرفتی!', b.name + ' — ' + b.desc, 'badges'); });
    const latest = {};
    (st.assessments || []).forEach(a => { (a.subjects || []).forEach(sub => { const g = st.grades?.[a.id]?.[sub]?.[sid]; if (g != null && (!latest[sub] || a.date > latest[sub].date)) latest[sub] = { a, g }; }); });
    Object.keys(latest).slice(0, 6).forEach(sub => { const { a, g } = latest[sub]; push('grade', a.id + sub, tIso(a.date), 'نمرهٔ تازه: ' + sub, `${a.title} — ${levelFor(st, g) ? levelFor(st, g).label : g}`, 'report'); });
  }
  out.sort((a, b) => new Date(b.at) - new Date(a.at));
  return out.slice(0, 80);
}
function unreadCount() { const seen = loadSeen(); return buildNotifs().filter(n => !seen.has(n.id)).length; }
function detectNew() {
  if (!SESS) return;
  const items = buildNotifs(), seen = loadSeen();
  if (X.firstRun) { items.forEach(n => seen.add(n.id)); saveSeen(); X.firstRun = false; X.lastIds = items.map(n => n.id); return; }
  const fresh = items.filter(n => !seen.has(n.id) && !X.lastIds.includes(n.id));
  X.lastIds = items.map(n => n.id);
  if (fresh.length && !document.hidden) {
    fresh.slice(0, 2).forEach(n => toast(`${n.icon} ${n.title}`, 'info', { label: 'دیدن', cb: () => openNotifs() }, 6000));
    if (fresh.length > 2) toast(`و ${fa(fresh.length - 2)} اعلان دیگر…`, 'info', { label: 'مرکز اعلان', cb: () => openNotifs() }, 6000);
    Sound.play('sync');
  }
}
function markAllRead() { const seen = loadSeen(); buildNotifs().forEach(n => seen.add(n.id)); saveSeen(); updateBell(); }
function updateBell() {
  const b = document.getElementById('xBell'); if (!b) return;
  const n = unreadCount();
  const c = b.querySelector('.cnt');
  if (n > 0) { if (c) c.textContent = fa(n > 99 ? '۹۹+' : n); else { const s = document.createElement('span'); s.className = 'cnt'; s.textContent = fa(n); b.appendChild(s); } b.classList.add('ring'); }
  else { if (c) c.remove(); b.classList.remove('ring'); }
  const mb = document.querySelector('#xnav [data-xnav="notifs"] .b');
  if (mb) { if (n) { mb.textContent = fa(n); mb.style.display = ''; } else mb.style.display = 'none'; }
}
function openNotifs() {
  X.nOpen = true;
  document.body.classList.add('x-drawer');
  openDrawer('🔔 مرکز اعلان‌ها', notifHTML(), false);
}
function notifHTML() {
  const items = buildNotifs(), seen = loadSeen();
  const unread = items.filter(n => !seen.has(n.id)).length;
  const filters = [['all', 'همه', '#1d4ed8'], ['unread', `خوانده‌نشده (${fa(unread)})`, '#e11d48']].concat(Object.entries(NT).map(([k, v]) => [k, v.i + ' ' + v.l, v.c]));
  let list = items;
  if (X.nFilter === 'unread') list = list.filter(n => !seen.has(n.id));
  else if (X.nFilter !== 'all') list = list.filter(n => n.type === X.nFilter);
  let html = `<div class="x">
    <div class="x-nhead"><div class="row"><span class="chip acc">🔔 ${fa(items.length)} اعلان</span>${unread ? `<span class="chip" style="color:#e11d48">${fa(unread)} خوانده‌نشده</span>` : '<span class="chip">همه خوانده شده ✅</span>'}</div>
      <button type="button" class="btn sm soft" data-act="xReadAll">✓ خواندم همه</button></div>
    <div class="x-nfilters">${filters.map(([k, l, c]) => `<button type="button" class="x-nf ${X.nFilter === k ? 'on' : ''}" style="--nc:${c}" data-act="xNFilter" data-f="${k}">${l}</button>`).join('')}</div>
    <div class="x-scroll" style="max-height:none">`;
  if (!list.length) html += empty('🕊️', 'اعلانی نیست', X.nFilter === 'unread' ? 'همهٔ اعلان‌ها را خوانده‌ای.' : 'فعلاً خبر تازه‌ای نیست.');
  else {
    let lastGroup = '';
    list.forEach(n => {
      const g = dayGroup(n.at);
      if (g !== lastGroup) { html += `<div class="x-ngroup">${g}</div>`; lastGroup = g; }
      const un = !seen.has(n.id);
      html += `<div class="x-notif ${un ? 'unread' : ''}" style="--nc:${n.color}" data-act="xNOpen" data-id="${esc(n.id)}" data-sec="${n.sec}">
        <span class="ni">${n.icon}</span>
        <div style="flex:1;min-width:0"><div class="nt">${esc(n.title)}</div><div class="nb">${esc(n.body || '')}</div><div class="nw">🕐 ${relTime(n.at)}</div></div>
        ${un ? '<span class="ud"></span>' : ''}</div>`;
    });
  }
  return html + '</div></div>';
}

/* ================= shop: teacher ================= */
function shopFiltered() {
  let list = orderedRewards();
  const q = norm(X.q);
  if (q) list = list.filter(r => norm(r.name).includes(q) || norm(r.desc).includes(q));
  if (X.cat !== 'all') list = list.filter(r => r.cat === X.cat);
  if (X.status !== 'all') list = list.filter(r => X.status === 'active' ? rewardActive(S(), r) && r.stock !== 0 : X.status === 'off' ? r.active === false : X.status === 'out' ? r.stock === 0 : true);
  const s = {
    order: (a, b) => (a.order || 0) - (b.order || 0),
    cost: (a, b) => a.cost - b.cost,
    costD: (a, b) => b.cost - a.cost,
    name: (a, b) => a.name.localeCompare(b.name, 'fa'),
    stock: (a, b) => (a.stock < 0 ? 999 : a.stock) - (b.stock < 0 ? 999 : b.stock),
    sold: (a, b) => soldCount(b.id) - soldCount(a.id)
  };
  return list.sort(s[X.sort] || s.order);
}
const soldCount = rid => (shop().purchases || []).filter(p => p.rewardId === rid && p.status === 'approved').length;
function rewardCard(r, i, student) {
  const cat = catOf(r), active = rewardActive(S(), r), out = r.stock === 0;
  const w = student ? myWallet() : null;
  const afford = student ? w.balance >= r.cost : true;
  const mine = student ? myPurchases().filter(p => p.rewardId === r.id && (p.status === 'approved' || p.status === 'pending')).length : 0;
  const perBlocked = student && r.per > 0 && mine >= r.per;
  const sel = X.sel.has(r.id);
  return `<div class="x-card ${sel ? 'sel' : ''} ${(!active || out) && !student ? 'off' : ''}" style="--kc:${cat.c};--i:${i}" ${!student ? `data-xdrag="${r.id}" data-xdrop="${r.id}"` : ''}>
    <div class="row" style="align-items:flex-start;gap:10px">
      ${!student ? `<input type="checkbox" class="cb" data-chg="xSel" data-id="${r.id}" ${sel ? 'checked' : ''}>` : ''}
      <span class="x-icon">${r.icon}</span>
      <div style="flex:1;min-width:0"><div class="x-name">${esc(r.name)}</div>
        <div class="x-meta"><span class="x-pill" style="--pc:${cat.c}">${cat.i} ${cat.l}</span>
          ${!student ? (active ? pill('فعال', '#16a34a', '🟢') : pill('غیرفعال', '#7b7261', '⚪')) : ''}
          ${r.per > 0 ? `<span class="chip">سقف ${fa(r.per)} بار</span>` : ''}
          ${r.startAt || r.endAt ? `<span class="chip">🗓️ ${r.startAt ? jShort(r.startAt) : '…'} تا ${r.endAt ? jShort(r.endAt) : '…'}</span>` : ''}</div></div>
      ${coin(r.cost)}
    </div>
    ${r.desc ? `<div class="x-desc">${esc(r.desc)}</div>` : ''}
    <div class="x-foot">
      <span class="x-stock ${r.stock >= 0 && r.stock <= 1 ? 'low' : ''}">${r.stock < 0 ? '♾️ نامحدود' : out ? '🚫 تمام شد' : `📦 ${fa(r.stock)} موجود`}${!student ? ` • ${fa(soldCount(r.id))} فروش` : ''}</span>
      ${!student ? `<div class="row" style="gap:4px;flex-wrap:nowrap"><span class="x-grip" title="کشیدن برای ترتیب">⠿</span>
        <button type="button" class="ib sm" data-act="xEdit" data-id="${r.id}">✏️</button>
        <button type="button" class="ib sm" data-act="xToggle" data-id="${r.id}">${r.active === false ? '🟢' : '⚪'}</button>
        <button type="button" class="ib sm" data-act="xDel" data-id="${r.id}">🗑</button></div>` : ''}
    </div>
    ${student ? `<button type="button" class="btn x-buy ${afford && active && !out && !perBlocked ? '' : 'ghost'}" data-act="xBuy" data-id="${r.id}" ${afford && active && !out && !perBlocked ? '' : 'disabled'}>
      ${perBlocked ? '🔒 سقف خرید پر شد' : out ? '🚫 تمام شد' : !active ? '⏸️ در دسترس نیست' : !afford ? `🪙 ${fa(r.cost - w.balance)} امتیاز کم داری` : `🛒 خرید با ${fa(r.cost)} امتیاز`}</button>` : ''}
  </div>`;
}
function shopToolbar() {
  const sv = shop().savedViews || [];
  return `<div class="card mb"><div class="x-toolbar">
    <input class="input" style="max-width:210px" placeholder="🔍 جستجوی جایزه…" value="${esc(X.q)}" data-inp="xQ">
    <select class="select" style="max-width:160px" data-chg="xCat"><option value="all">همهٔ دسته‌ها</option>${Object.entries(CATS).map(([k, v]) => `<option value="${k}" ${X.cat === k ? 'selected' : ''}>${v.i} ${v.l}</option>`).join('')}</select>
    <select class="select" style="max-width:150px" data-chg="xStatus">${[['all', 'همه'], ['active', '🟢 فعال'], ['off', '⚪ غیرفعال'], ['out', '🚫 تمام‌شده']].map(([v, l]) => `<option value="${v}" ${X.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <select class="select" style="max-width:170px" data-chg="xSort">${[['order', 'ترتیب دستی'], ['cost', 'ارزان‌ترین'], ['costD', 'گران‌ترین'], ['sold', 'پرفروش‌ترین'], ['stock', 'کم‌موجودترین'], ['name', 'بر اساس نام']].map(([v, l]) => `<option value="${v}" ${X.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <div class="seg"><button type="button" class="${X.mode === 'cards' ? 'on' : ''}" data-act="xMode" data-v="cards">🗂 کارت</button><button type="button" class="${X.mode === 'table' ? 'on' : ''}" data-act="xMode" data-v="table">📋 جدول</button></div>
    <select class="select" style="max-width:170px" data-chg="xViewApply"><option value="">📁 نماهای ذخیره‌شده…</option>${sv.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('')}</select>
    <button type="button" class="btn sm ghost" data-act="xViewSave">💾 ذخیرهٔ نما</button>
  </div></div>`;
}
function shopListBody() {
  const list = shopFiltered();
  const bulk = X.sel.size ? `<div class="card mb" style="border-color:var(--acc)"><div class="row"><b class="small">${fa(X.sel.size)} جایزه انتخاب شده</b>
    <button type="button" class="btn sm soft" data-act="xBulkOn">🟢 فعال</button><button type="button" class="btn sm soft" data-act="xBulkOff">⚪ غیرفعال</button>
    <button type="button" class="btn sm danger" data-act="xBulkDel">🗑 حذف</button><button type="button" class="btn sm ghost" data-act="xSelClear">✕ لغو</button></div></div>` : '';
  if (!list.length) return bulk + `<div class="card">${empty('🛒', 'جایزه‌ای با این فیلتر نیست', 'فیلتر را عوض کن یا جایزهٔ تازه بساز.', '<button type="button" class="btn" data-act="xNew">➕ جایزهٔ جدید</button>')}</div>`;
  if (X.mode === 'table') {
    const rows = list.map(r => { const cat = catOf(r); return `<tr>
      <td><input type="checkbox" class="cb" data-chg="xSel" data-id="${r.id}" ${X.sel.has(r.id) ? 'checked' : ''}></td>
      <td><div class="row" style="gap:8px;flex-wrap:nowrap"><span style="font-size:1.2rem">${r.icon}</span><b class="small">${esc(r.name)}</b></div></td>
      <td>${pill(cat.l, cat.c, cat.i)}</td><td>${coin(r.cost)}</td>
      <td class="small">${r.stock < 0 ? '♾️' : fa(r.stock)}</td><td class="small">${fa(soldCount(r.id))}</td>
      <td>${rewardActive(S(), r) && r.stock !== 0 ? pill('فعال', '#16a34a', '🟢') : pill('غیرفعال', '#7b7261', '⚪')}</td>
      <td><div class="row" style="gap:4px;flex-wrap:nowrap"><button type="button" class="ib sm" data-act="xEdit" data-id="${r.id}">✏️</button><button type="button" class="ib sm" data-act="xDel" data-id="${r.id}">🗑</button></div></td></tr>`; }).join('');
    return bulk + `<div class="tw"><table class="tbl"><thead><tr><th><input type="checkbox" class="cb" data-chg="xSelAll" ${list.every(r => X.sel.has(r.id)) ? 'checked' : ''}></th><th>جایزه</th><th>دسته</th><th>قیمت</th><th>موجودی</th><th>فروش</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  return bulk + `<div class="x-grid stagger">${list.map((r, i) => rewardCard(r, i, false)).join('')}</div>`;
}
function requestsBody() {
  const st = S();
  const pend = (shop().purchases || []).filter(p => p.status === 'pending').sort((a, b) => new Date(a.at) - new Date(b.at));
  const done = (shop().purchases || []).filter(p => p.status !== 'pending').sort((a, b) => new Date(b.review ? b.review.at : b.at) - new Date(a.review ? a.review.at : a.at)).slice(0, 25);
  const head = `<div class="card mb"><div class="spread"><div class="row"><span class="chip acc">⏳ ${fa(pend.length)} درخواست در انتظار</span><span class="chip">💰 ${fa(pend.reduce((a, p) => a + p.cost, 0))} امتیاز در صف</span></div>
    ${pend.length ? `<button type="button" class="btn ok sm" data-act="xApproveAll">✅ تأیید همه (${fa(pend.length)})</button>` : ''}</div></div>`;
  if (!pend.length && !done.length) return head + `<div class="card">${empty('🕊️', 'درخواستی نیست', 'وقتی دانش‌آموزی خرید کند، اینجا می‌آید.')}</div>`;
  const row = (p, actionable) => {
    const s = stuById(st, p.sid), o = ORDER[p.status] || ORDER.pending, w = wallet(st, p.sid);
    return `<div class="x-row">${avHTML(s, 'sm')}
      <div class="n"><b>${esc(s ? s.name : '—')}</b><div class="small muted">${p.icon} ${esc(p.name)} • ${relTime(p.at)}${p.note ? ` • 💬 ${esc(p.note)}` : ''}</div>
        ${p.review && p.review.note ? `<div class="small muted" style="margin-top:3px">📝 ${esc(p.review.note)}</div>` : ''}</div>
      ${coin(p.cost)}<span class="chip" title="موجودی کیف پول">🪙 ${fa(w.balance)}</span>${pill(o.l, o.c, o.i)}
      ${actionable ? `<div class="row" style="gap:4px;flex-wrap:nowrap">
        <button type="button" class="btn ok sm" data-act="xApprove" data-id="${p.id}">✅ تأیید</button>
        <button type="button" class="btn warn sm" data-act="xReject" data-id="${p.id}">✖️ رد</button></div>`
        : p.status === 'approved' ? `<button type="button" class="btn ghost sm" data-act="xRefund" data-id="${p.id}">↩️ بازگردانی</button>` : ''}</div>`;
  };
  return head + (pend.length ? `<div class="card mb" style="padding:5px 0"><div style="padding:10px 14px" class="spread"><h3>⏳ در انتظار تأیید</h3></div><div class="x-scroll">${pend.map(p => row(p, true)).join('')}</div></div>` : '') +
    (done.length ? `<div class="card" style="padding:5px 0"><div style="padding:10px 14px"><h3>📜 تاریخچهٔ اخیر</h3></div><div class="x-scroll">${done.map(p => row(p, false)).join('')}</div></div>` : '');
}
function ledgerBody() {
  const st = S();
  let list = (shop().purchases || []).slice().sort((a, b) => new Date(b.at) - new Date(a.at));
  if (X.ledgerStatus !== 'all') list = list.filter(p => p.status === X.ledgerStatus);
  if (X.ledgerStu !== 'all') list = list.filter(p => p.sid === X.ledgerStu);
  const q = norm(X.ledgerQ);
  if (q) list = list.filter(p => norm(p.name).includes(q) || norm((stuById(st, p.sid) || {}).name || '').includes(q));
  const rows = list.map(p => { const s = stuById(st, p.sid), o = ORDER[p.status] || ORDER.pending; return `<tr>
    <td><div class="row" style="gap:7px;flex-wrap:nowrap">${avHTML(s, 'sm')}<b class="small">${esc(s ? s.name : '—')}</b></div></td>
    <td class="small">${p.icon} ${esc(p.name)}</td><td>${coin(p.cost)}</td><td>${pill(o.l, o.c, o.i)}</td>
    <td class="small mono">${jShort(iranISO(new Date(p.at)))}</td><td class="small">${esc(p.review && p.review.note || '—')}</td>
    <td>${p.status === 'approved' ? `<button type="button" class="btn ghost sm" data-act="xRefund" data-id="${p.id}">↩️</button>` : p.status === 'pending' ? `<button type="button" class="btn warn sm" data-act="xReject" data-id="${p.id}">✖️</button>` : '—'}</td></tr>`; }).join('');
  return `<div class="card mb"><div class="x-toolbar">
    <input class="input" style="max-width:200px" placeholder="🔍 نام یا جایزه…" value="${esc(X.ledgerQ)}" data-inp="xLQ">
    <select class="select" style="max-width:160px" data-chg="xLStatus"><option value="all">همهٔ وضعیت‌ها</option>${Object.entries(ORDER).map(([k, v]) => `<option value="${k}" ${X.ledgerStatus === k ? 'selected' : ''}>${v.i} ${v.l}</option>`).join('')}</select>
    <select class="select" style="max-width:190px" data-chg="xLStu"><option value="all">همهٔ دانش‌آموزان</option>${(st.students || []).map(s => `<option value="${s.id}" ${X.ledgerStu === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
    <button type="button" class="btn sm soft" data-act="xCsv" data-kind="orders">📤 CSV</button>
    <button type="button" class="btn sm ai" data-act="xBonus">🎁 پاداش ویژه</button></div></div>
    <div class="tw"><table class="tbl"><thead><tr><th>دانش‌آموز</th><th>جایزه</th><th>قیمت</th><th>وضعیت</th><th>تاریخ</th><th>یادداشت</th><th></th></tr></thead><tbody>${rows || `<tr><td colspan="7">${empty('📭', 'رکوردی نیست', '')}</td></tr>`}</tbody></table></div>`;
}
function shopAnalysisBody() {
  const st = S(), ps = (shop().purchases || []).filter(p => p.status === 'approved');
  const byReward = {}; ps.forEach(p => { byReward[p.rewardId] = byReward[p.rewardId] || { name: p.name, icon: p.icon, n: 0, cost: 0 }; byReward[p.rewardId].n++; byReward[p.rewardId].cost += p.cost; });
  const top = Object.values(byReward).sort((a, b) => b.n - a.n).slice(0, 8);
  const byStu = {}; ps.forEach(p => { byStu[p.sid] = byStu[p.sid] || { sid: p.sid, n: 0, cost: 0 }; byStu[p.sid].n++; byStu[p.sid].cost += p.cost; });
  const spenders = Object.values(byStu).sort((a, b) => b.cost - a.cost).slice(0, 8);
  const byCat = {}; ps.forEach(p => { const r = rewardById(p.rewardId); const c = r ? r.cat : 'gift'; byCat[c] = (byCat[c] || 0) + p.cost; });
  const wallets = (st.students || []).map(s => ({ s, w: wallet(st, s.id) })).sort((a, b) => b.w.balance - a.w.balance);
  const totalEarned = wallets.reduce((a, x) => a + x.w.earned, 0), totalSpent = wallets.reduce((a, x) => a + x.w.spent, 0);
  return `<div class="grid g4 stagger mb">
    <div class="card stat" style="--i:0"><span class="si" style="background:linear-gradient(135deg,#b45309,#f59e0b)">🪙</span><div><b>${fa(totalEarned)}</b><span>امتیاز کسب‌شدهٔ کلاس</span></div></div>
    <div class="card stat" style="--i:1"><span class="si" style="background:linear-gradient(135deg,#0d9488,#65a30d)">🛒</span><div><b>${fa(totalSpent)}</b><span>امتیاز خرج‌شده</span></div></div>
    <div class="card stat" style="--i:2"><span class="si" style="background:linear-gradient(135deg,#7c3aed,#e11d48)">📦</span><div><b>${fa(ps.length)}</b><span>خرید تأییدشده</span></div></div>
    <div class="card stat" style="--i:3"><span class="si" style="background:linear-gradient(135deg,#1d4ed8,#0ea5e9)">💰</span><div><b>${fa(totalEarned - totalSpent)}</b><span>موجودی کل کلاس</span></div></div></div>
  <div class="grid g2 mb">
    <div class="card"><div class="spread mb"><h3>🏆 محبوب‌ترین جایزه‌ها</h3><span class="chip">تعداد فروش</span></div>
      ${top.length ? bars(top.map((t, i) => ({ label: t.icon + ' ' + t.name, value: t.n, color: C.CPAL[i % 8] })), { max: Math.max(1, ...top.map(t => t.n)), fmt: v => fa(v) + ' بار' }) : empty('🛒', 'فروشی ثبت نشده', '')}</div>
    <div class="card"><div class="spread mb"><h3>🎨 سهم دسته‌ها</h3><span class="chip">امتیاز خرج‌شده</span></div>
      ${donut(Object.entries(byCat).map(([k, v]) => ({ label: CATS[k].l, color: CATS[k].c, value: v })), { center: fa(totalSpent), sub: 'امتیاز' })}
      <div class="legend mt">${Object.entries(byCat).map(([k, v]) => `<div class="li"><span class="dot" style="background:${CATS[k].c}"></span>${CATS[k].i} ${CATS[k].l}<b style="margin-inline-start:auto">${fa(v)}</b></div>`).join('') || '<span class="small muted">داده‌ای نیست</span>'}</div></div>
  </div>
  <div class="grid g2">
    <div class="card"><h3 class="mb">💸 بیشترین خریدها</h3>${spenders.length ? spenders.map((x, i) => { const s = stuById(st, x.sid); return `<div class="x-row" style="padding:8px 0"><span style="width:22px">${['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅'][i]}</span>${avHTML(s, 'sm')}<span class="n">${esc(s ? s.name : '')}</span><span class="chip">${fa(x.n)} خرید</span>${coin(x.cost)}</div>`; }).join('') : empty('🌱', 'خریدی نیست', '')}</div>
    <div class="card"><h3 class="mb">🪙 ثروتمندترین کیف پول‌ها</h3>${wallets.slice(0, 8).map((x, i) => `<div class="x-row" style="padding:8px 0">${avHTML(x.s, 'sm')}<span class="n">${esc(x.s.name)}</span><span class="chip" style="color:#16a34a">+${fa(x.w.earned)}</span><span class="chip" style="color:#e11d48">−${fa(x.w.spent)}</span>${coin(x.w.balance)}</div>`).join('')}</div>
  </div>`;
}
function shopSettingsBody() {
  const s = shop().settings || {};
  return `<div class="grid g2" style="align-items:start">
    <div class="card"><h3 class="mb">⚙️ قواعد فروشگاه</h3>
      <div class="srow"><div><span class="sl">🛒 فروشگاه باز باشد</span><span class="ss">دانش‌آموزان بتوانند خرید کنند</span></div><span class="switch"><input type="checkbox" ${s.enabled !== false ? 'checked' : ''} data-chg="xSet" data-k="enabled"><i></i></span></div>
      <div class="srow"><div><span class="sl">✅ هر خرید نیاز به تأیید معلم دارد</span><span class="ss">اگر خاموش باشد، خریدها خودکار تأیید و امتیاز کم می‌شود</span></div><span class="switch"><input type="checkbox" ${s.requireApproval !== false ? 'checked' : ''} data-chg="xSet" data-k="requireApproval"><i></i></span></div>
      <div class="divider"></div>
      <p class="small muted">🪙 <b>فرمول کیف پول:</b> امتیازهای مثبت انضباطی + امتیاز مدیریتی سرگروه − خریدهای تأییدشده − درخواست‌های در انتظار. با رد یا لغو درخواست، امتیاز آزاد می‌شود.</p></div>
    <div class="card"><h3 class="mb">🔄 داده و خروجی</h3>
      <div class="row mb"><button type="button" class="btn soft" data-act="xCsv" data-kind="rewards">📤 CSV جایزه‌ها</button>
        <button type="button" class="btn soft" data-act="xCsv" data-kind="orders">📤 CSV خریدها</button>
        <button type="button" class="btn soft" data-act="xCsv" data-kind="wallets">📤 CSV کیف پول‌ها</button></div>
      <div class="row mb"><button type="button" class="btn ghost" data-act="xImport">📥 ورود CSV جایزه‌ها</button><button type="button" class="btn ghost" data-act="xTpl">📄 نمونه</button></div>
      <div class="divider"></div>
      <button type="button" class="btn soft" data-act="xShopSheet">🖨️ برگهٔ فروشگاه (A4)</button></div></div>`;
}
function teacherShop() {
  const st = S(), sh = shop();
  const pend = (sh.purchases || []).filter(p => p.status === 'pending').length;
  const approved = (sh.purchases || []).filter(p => p.status === 'approved');
  const totalSpent = approved.reduce((a, p) => a + p.cost, 0);
  const tabs = [['requests', '📥 درخواست‌ها', pend], ['rewards', '🎁 جایزه‌ها', (sh.rewards || []).length], ['ledger', '📜 دفتر خرید', 0], ['analysis', '📊 تحلیل', 0], ['settings', '⚙️ قواعد', 0]];
  return `<div class="x">
    <div class="x-hero"><div class="spread"><div>
      <h1>🛒 فروشگاه امتیاز کلاس</h1>
      <p>بچه‌ها امتیازهای انضباطی و مدیریتی‌شان را خرج جایزه می‌کنند؛ هر خرید با تأیید تو قطعی می‌شود و امتیاز از کیف پول کم می‌شود.</p>
      <div class="x-quick"><span class="q">🎁 <b>${fa((sh.rewards || []).length)}</b> جایزه</span><span class="q">⏳ <b>${fa(pend)}</b> در انتظار</span><span class="q">✅ <b>${fa(approved.length)}</b> خرید</span><span class="q">🪙 <b>${fa(totalSpent)}</b> امتیاز خرج‌شده</span></div></div>
      <div class="row"><button type="button" class="btn" data-act="xNew">➕ جایزهٔ جدید</button><button type="button" class="btn ai" data-act="xBonus">🎁 پاداش ویژه</button><button type="button" class="btn soft" data-act="xShopSheet">🖨️ A4</button></div>
    </div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${X.shopTab === k ? 'on' : ''}" data-act="xShopTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="xBody">${X.shopTab === 'requests' ? requestsBody() : X.shopTab === 'rewards' ? shopToolbar() + '<div id="xList">' + shopListBody() + '</div>' : X.shopTab === 'ledger' ? ledgerBody() : X.shopTab === 'analysis' ? shopAnalysisBody() : shopSettingsBody()}</div></div>`;
}

/* ================= shop: student ================= */
function studentShop() {
  const st = S(), w = myWallet(), sh = shop();
  const mine = myPurchases().slice().sort((a, b) => new Date(b.at) - new Date(a.at));
  const pend = mine.filter(p => p.status === 'pending').length;
  let list = orderedRewards().filter(r => rewardActive(st, r));
  if (X.myCat !== 'all') list = list.filter(r => r.cat === X.myCat);
  const q = norm(X.myQ); if (q) list = list.filter(r => norm(r.name).includes(q));
  const nextGoal = orderedRewards().filter(r => rewardActive(st, r) && r.cost > w.balance).sort((a, b) => a.cost - b.cost)[0];
  const tabs = [['store', '🏪 ویترین', list.length], ['orders', '🧾 خریدهای من', mine.length]];
  const ordersHTML = mine.length ? `<div class="card" style="padding:5px 0"><div class="x-scroll">${mine.map(p => { const o = ORDER[p.status] || ORDER.pending; return `<div class="x-row"><span class="x-icon" style="--kc:${(CATS[(rewardById(p.rewardId) || {}).cat] || CATS.gift).c};width:44px;height:44px;font-size:1.3rem">${p.icon}</span>
    <div class="n">${esc(p.name)}<div class="small muted">${relTime(p.at)}${p.note ? ` • 💬 ${esc(p.note)}` : ''}</div>${p.review && p.review.note ? `<div class="small muted">📝 ${esc(p.review.note)}</div>` : ''}</div>
    ${coin(p.cost)}${pill(o.l, o.c, o.i)}${p.status === 'pending' ? `<button type="button" class="btn ghost sm" data-act="xCancel" data-id="${p.id}">↩️ لغو</button>` : ''}</div>`; }).join('')}</div></div>` : `<div class="card">${empty('🧾', 'هنوز خریدی نکرده‌ای', 'از ویترین یک جایزه انتخاب کن!')}</div>`;
  return `<div class="x">
    <div class="x-hero"><div class="spread"><div>
      <h1>🛒 فروشگاه امتیاز</h1>
      <p>هر کار خوب = امتیاز 🪙 — امتیازهایت را جمع کن و جایزه بگیر!</p>
      <div class="x-quick"><span class="q">🎁 <b>${fa(list.length)}</b> جایزه در دسترس</span><span class="q">⏳ <b>${fa(pend)}</b> در انتظار تأیید</span><span class="q">✅ <b>${fa(mine.filter(p => p.status === 'approved').length)}</b> خرید موفق</span></div>
      ${nextGoal ? `<div class="mt" style="max-width:340px"><div class="spread small bold"><span>🎯 هدف بعدی: ${nextGoal.icon} ${esc(nextGoal.name)}</span><span>${fa(w.balance)}/${fa(nextGoal.cost)}</span></div><div class="x-prog" style="--tc:#d97706"><i style="width:${clamp(w.balance / nextGoal.cost * 100, 0, 100)}%"></i></div><div class="small muted mt">${fa(nextGoal.cost - w.balance)} امتیاز دیگر لازم داری 💪</div></div>` : '<div class="mt small bold" style="color:#16a34a">👑 همهٔ جایزه‌ها را می‌توانی بخری!</div>'}</div>
      <div class="x-wallet"><span class="coin">🪙</span><div><span>موجودی کیف پول من</span><b>${fa(w.balance)}</b><div class="mini"><span>+${fa(w.earned)} کسب</span><span>−${fa(w.spent)} خرج</span>${w.reserved ? `<span>⏳ ${fa(w.reserved)} رزرو</span>` : ''}</div></div></div>
    </div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${X.myTab === k ? 'on' : ''}" data-act="xMyTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="xBody">${X.myTab === 'orders' ? ordersHTML : `<div class="card mb"><div class="x-toolbar">
      <input class="input" style="max-width:220px" placeholder="🔍 جستجوی جایزه…" value="${esc(X.myQ)}" data-inp="xMyQ">
      <div class="x-chips"><button type="button" class="x-chip ${X.myCat === 'all' ? 'on' : ''}" style="--cc:#d97706" data-act="xMyCat" data-v="all">✨ همه</button>${Object.entries(CATS).map(([k, v]) => `<button type="button" class="x-chip ${X.myCat === k ? 'on' : ''}" style="--cc:${v.c}" data-act="xMyCat" data-v="${k}">${v.i} ${v.l}</button>`).join('')}</div></div></div>
      ${list.length ? `<div class="x-grid stagger">${list.map((r, i) => rewardCard(r, i, true)).join('')}</div>` : `<div class="card">${empty('🏪', 'جایزه‌ای نیست', 'معلم به‌زودی جایزه‌های تازه می‌گذارد.')}</div>`}</div>`}</div>`;
}

/* ================= badges ================= */
function badgeCard(b, earned, prog, when, i) {
  const t = tierOf(b);
  const pct = prog ? clamp(prog.cur / prog.target * 100, 0, 100) : 0;
  return `<div class="x-medal ${earned ? '' : 'locked'}" style="--tc:${t.c};--i:${i}" data-act="xBadgeOpen" data-key="${b.key}">
    ${earned ? '<span class="shine"></span>' : '<span class="lock">🔒</span>'}
    <span class="ribbon"></span>${medalSVG(b, 74, !earned)}
    <div class="nm">${esc(b.name)}</div><div class="tier">${t.l === 'طلا' ? '🥇' : t.l === 'نقره' ? '🥈' : '🥉'} ${t.l}</div>
    ${earned ? `<div class="when">✅ ${when ? jShort(iranISO(new Date(when))) : 'گرفته شد'}</div>` : `<div class="x-prog"><i style="width:${pct}%"></i></div><div class="when">${prog ? esc(prog.hint) : ''}</div>`}</div>`;
}
function studentBadges() {
  const st = S(), sid = mySid(), bd = badges();
  const mine = bd.awarded || [], prog = bd.progress || badgeProgress(st, sid);
  const earnedKeys = new Set(mine.map(a => a.key));
  const list = BADGES.filter(b => X.btier === 'all' || b.tier === X.btier);
  const q = norm(X.bq); const fl = q ? list.filter(b => norm(b.name).includes(q) || norm(b.desc).includes(q)) : list;
  const gold = mine.filter(a => (BMAP[a.key] || {}).tier === 'gold').length;
  const recent = mine.slice().sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 3);
  return `<div class="x">
    <div class="x-bhero"><div class="spread"><div>
      <h1>🏅 گنجینهٔ نشان‌های من</h1>
      <p>با تلاش، نظم و کمک به دیگران نشان بگیر؛ هر نشان یک افتخار واقعی است.</p>
      <div class="x-quick"><span class="q">🏅 <b>${fa(mine.length)}</b> نشان از ${fa(BADGES.length)}</span><span class="q">🥇 <b>${fa(gold)}</b> طلا</span><span class="q">🎯 <b>${fa(Math.round(mine.length / BADGES.length * 100))}٪</b> گنجینه</span></div>
      ${recent.length ? `<div class="row mt">${recent.map(a => { const b = BMAP[a.key]; return b ? `<span class="chip" style="color:${tierOf(b).c}">${b.icon} ${esc(b.name)}</span>` : ''; }).join('')}</div>` : ''}</div>
      <div style="text-align:center">${ring(mine.length / BADGES.length * 100, '#7c3aed', 104)}<div class="small bold mt">پیشرفت گنجینه</div></div>
    </div></div>
    <div class="card mb"><div class="x-toolbar">
      <input class="input" style="max-width:220px" placeholder="🔍 جستجوی نشان…" value="${esc(X.bq)}" data-inp="xBQ">
      <div class="x-chips"><button type="button" class="x-chip ${X.btier === 'all' ? 'on' : ''}" style="--cc:#7c3aed" data-act="xBTier" data-v="all">✨ همه</button>${Object.entries(TIERS).map(([k, v]) => `<button type="button" class="x-chip ${X.btier === k ? 'on' : ''}" style="--cc:${v.c}" data-act="xBTier" data-v="${k}">${k === 'gold' ? '🥇' : k === 'silver' ? '🥈' : '🥉'} ${v.l}</button>`).join('')}</div>
      <button type="button" class="btn sm soft" data-act="xMyBadgeSheet">🖨️ برگهٔ نشان‌ها</button></div></div>
    <div class="x-case stagger">${fl.map((b, i) => { const a = mine.find(x => x.key === b.key); return badgeCard(b, !!a, prog[b.key], a ? a.at : null, i); }).join('')}</div></div>`;
}
function teacherBadges() {
  const st = S(), bd = badges();
  const aw = bd.awarded || [];
  const tabs = [['matrix', '🗂 ماتریس کلاس', 0], ['feed', '📜 نشان‌های اخیر', aw.length], ['settings', '⚙️ قواعد', 0]];
  const q = norm(X.bq);
  let studs = st.students || [];
  if (q) studs = studs.filter(s => norm(s.name).includes(q));
  const cols = BADGES.filter(b => X.btier === 'all' || b.tier === X.btier);
  const matrix = `<div class="x-matrix"><table><thead><tr><th>دانش‌آموز</th>${cols.map(b => `<th title="${esc(b.name)}">${b.icon}</th>`).join('')}<th style="font-size:.75rem">جمع</th></tr></thead><tbody>
    ${studs.map(s => { const mine = aw.filter(a => a.sid === s.id); const keys = new Set(mine.map(a => a.key)); const prog = badgeProgress(st, s.id);
      return `<tr><td>${avHTML(s, 'sm')} ${esc(s.name)}</td>${cols.map(b => { const on = keys.has(b.key); const p = prog[b.key]; const t = tierOf(b);
        return `<td><span class="x-dot ${on ? 'on' : 'off'}" style="--tc:${t.c}" title="${esc(b.name)}: ${on ? 'گرفته شد' : (p ? p.hint : '')}">${on ? b.icon : p ? fa(Math.round(clamp(p.cur / p.target, 0, 1) * 100)) + '٪' : '—'}</span></td>`; }).join('')}<td><b class="small">${fa(mine.length)}</b></td></tr>`; }).join('')}
  </tbody></table></div>`;
  const feed = aw.slice().sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 60);
  const feedHTML = feed.length ? `<div class="card" style="padding:5px 0"><div class="x-scroll">${feed.map(a => { const b = BMAP[a.key], s = stuById(st, a.sid); if (!b) return ''; const t = tierOf(b);
    return `<div class="x-row"><span class="x-dot on" style="--tc:${t.c};width:38px;height:38px;font-size:1.15rem">${b.icon}</span>${avHTML(s, 'sm')}
      <div class="n"><b>${esc(s ? s.name : '')}</b> — ${esc(b.name)}<div class="small muted">${a.by === 'manual' ? '🎁 دستی' : '🤖 خودکار'} • ${relTime(a.at)}${a.note ? ` • ${esc(a.note)}` : ''}</div></div>
      ${pill(t.l, t.c)}<button type="button" class="btn ghost sm" data-act="xBRevoke" data-sid="${a.sid}" data-key="${a.key}">🗑</button></div>`; }).join('')}</div></div>` : `<div class="card">${empty('🏅', 'نشانی داده نشده', 'دکمهٔ «ارزیابی و اعطا» را بزن.')}</div>`;
  const settings = `<div class="grid g2" style="align-items:start"><div class="card"><h3 class="mb">⚙️ قواعد نشان‌ها</h3>
    <div class="srow"><div><span class="sl">🤖 اعطای خودکار</span><span class="ss">هر بار که داده تغییر کند، نشان‌های استحقاقی خودکار داده می‌شوند</span></div><span class="switch"><input type="checkbox" ${bd.settings.autoAward !== false ? 'checked' : ''} data-chg="xBSet" data-k="autoAward"><i></i></span></div>
    <div class="divider"></div><div class="row"><button type="button" class="btn ai" data-act="xBSync">🤖 ارزیابی و اعطای الآن</button><button type="button" class="btn soft" data-act="xBManual">🎁 اعطای دستی</button></div>
    <p class="small muted mt">نشان‌ها بر پایهٔ دادهٔ واقعی (حضور، نمرات، تکالیف، آزمون، انضباط، مدیریت و خرید) محاسبه می‌شوند؛ با تغییر داده، نشان‌های تازه خودکار ظاهر می‌شوند.</p></div>
    <div class="card"><h3 class="mb">📤 خروجی</h3><div class="row"><button type="button" class="btn soft" data-act="xBcsv">📤 CSV نشان‌ها</button><button type="button" class="btn soft" data-act="xBClassSheet">🖨️ برگهٔ نشان‌های کلاس (A4)</button></div>
    <div class="divider"></div><div class="legend">${BADGES.map(b => { const t = tierOf(b); return `<div class="li"><span class="dot" style="background:${t.c}"></span>${b.icon} ${esc(b.name)} <span class="small muted" style="margin-inline-start:auto">${esc(b.desc)}</span></div>`; }).join('')}</div></div></div>`;
  const byTier = { gold: 0, silver: 0, bronze: 0 }; aw.forEach(a => { const b = BMAP[a.key]; if (b) byTier[b.tier]++; });
  const coverage = studs.length ? Math.round(aw.filter(a => studs.some(s => s.id === a.sid)).length / (studs.length * BADGES.length) * 100) : 0;
  return `<div class="x">
    <div class="x-bhero"><div class="spread"><div>
      <h1>🏅 نشان‌های خودکار کلاس</h1>
      <p>سیستم خودش استحقاق هر دانش‌آموز را می‌سنجد و نشان می‌دهد؛ تو هم می‌توانی دستی اعطا کنی.</p>
      <div class="x-quick"><span class="q">🏅 <b>${fa(aw.length)}</b> نشان داده‌شده</span><span class="q">🥇 <b>${fa(byTier.gold)}</b> طلا</span><span class="q">🥈 <b>${fa(byTier.silver)}</b> نقره</span><span class="q">🥉 <b>${fa(byTier.bronze)}</b> برنز</span><span class="q">📊 <b>${fa(coverage)}٪</b> پوشش</span></div></div>
      <div class="row"><button type="button" class="btn ai" data-act="xBSync">🤖 ارزیابی و اعطا</button><button type="button" class="btn soft" data-act="xBManual">🎁 اعطای دستی</button></div>
    </div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${X.badgeTab === k ? 'on' : ''}" data-act="xBTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div class="card mb"><div class="x-toolbar"><input class="input" style="max-width:220px" placeholder="🔍 نام دانش‌آموز یا نشان…" value="${esc(X.bq)}" data-inp="xBQ">
      <div class="x-chips"><button type="button" class="x-chip ${X.btier === 'all' ? 'on' : ''}" style="--cc:#7c3aed" data-act="xBTier" data-v="all">✨ همه</button>${Object.entries(TIERS).map(([k, v]) => `<button type="button" class="x-chip ${X.btier === k ? 'on' : ''}" style="--cc:${v.c}" data-act="xBTier" data-v="${k}">${k === 'gold' ? '🥇' : k === 'silver' ? '🥈' : '🥉'} ${v.l}</button>`).join('')}</div></div></div>
    <div id="xBody">${X.badgeTab === 'matrix' ? matrix : X.badgeTab === 'feed' ? feedHTML : settings}</div></div>`;
}

/* ================= drawers ================= */
function rewardForm(r) {
  const d = X.draft = r ? clone(r) : { id: '', name: '', icon: '🎁', cat: 'gift', desc: '', cost: 10, stock: 3, per: 1, active: true, startAt: '', endAt: '' };
  UI.jdate.xstart = d.startAt || todayISO(); UI.jdate.xend = d.endAt || todayISO();
  return `<form data-form="xReward" class="x">
    <div class="field"><label class="lbl">نام جایزه</label><input class="input" name="name" required value="${esc(d.name)}" placeholder="مثلاً: انتخاب جای نشستن (یک هفته)"></div>
    <div class="field"><label class="lbl">نماد</label><div class="x-icons" id="xIcons">${C.SHOP_ICONS.map(ic => `<button type="button" class="${d.icon === ic ? 'on' : ''}" data-act="xIcon" data-v="${ic}">${ic}</button>`).join('')}</div></div>
    <div class="grid g2"><div class="field"><label class="lbl">دسته</label><select class="select" data-chg="xF" data-f="cat">${Object.entries(CATS).map(([k, v]) => `<option value="${k}" ${d.cat === k ? 'selected' : ''}>${v.i} ${v.l}</option>`).join('')}</select></div>
      <div class="field"><label class="lbl">قیمت (امتیاز)</label><div class="x-stepper"><button type="button" data-act="xCost" data-d="-1">−</button><b id="xCostVal">${fa(d.cost)}</b><button type="button" data-act="xCost" data-d="1">+</button></div></div></div>
    <div class="grid g2"><div class="field"><label class="lbl">موجودی (−۱ = نامحدود)</label><div class="x-stepper"><button type="button" data-act="xStock" data-d="-1">−</button><b id="xStockVal">${d.stock < 0 ? '♾️' : fa(d.stock)}</b><button type="button" data-act="xStock" data-d="1">+</button></div></div>
      <div class="field"><label class="lbl">سقف خرید هر نفر (۰ = بی‌نهایت)</label><div class="x-stepper"><button type="button" data-act="xPer" data-d="-1">−</button><b id="xPerVal">${d.per === 0 ? '∞' : fa(d.per)}</b><button type="button" data-act="xPer" data-d="1">+</button></div></div></div>
    <div class="field"><label class="lbl">توضیح برای دانش‌آموز</label><textarea class="input" name="desc" rows="3">${esc(d.desc)}</textarea></div>
    <div class="card mb" style="padding:13px;background:var(--surface2)"><h3 class="mb">🗓️ بازهٔ در دسترس بودن (اختیاری)</h3>
      <div class="field"><label class="lbl">از تاریخ</label>${jDateSelects('xstart')}</div>
      <div class="field" style="margin-bottom:0"><label class="lbl">تا تاریخ</label>${jDateSelects('xend')}</div>
      <div class="row mt"><button type="button" class="btn ghost sm" data-act="xClearDates">♾️ همیشه در دسترس</button></div></div>
    <div class="srow"><span class="sl">🟢 فعال باشد</span><span class="switch"><input type="checkbox" ${d.active !== false ? 'checked' : ''} data-chg="xFB" data-f="active"><i></i></span></div>
    <button class="btn mt" type="submit" style="width:100%">💾 ${r ? 'ذخیرهٔ ویرایش' : 'ساخت جایزه'}</button></form>`;
}
function buyDrawer(r) {
  const w = myWallet(), after = w.balance - r.cost;
  X.buyDraft = { id: r.id };
  return `<div class="x"><div class="row mb" style="gap:12px"><span class="x-icon" style="--kc:${catOf(r).c}">${r.icon}</span>
    <div style="flex:1"><b style="font-size:1.05rem">${esc(r.name)}</b><div class="x-meta">${pill(catOf(r).l, catOf(r).c, catOf(r).i)}${coin(r.cost)}</div></div></div>
    ${r.desc ? `<div class="x-desc mb">${esc(r.desc)}</div>` : ''}
    <div class="card mb" style="padding:13px"><div class="spread small bold"><span>🪙 موجودی الآن</span><span>${fa(w.balance)}</span></div>
      <div class="spread small bold mt" style="color:#e11d48"><span>− قیمت جایزه</span><span>${fa(r.cost)}</span></div>
      <div class="divider"></div><div class="spread bold" style="color:#16a34a"><span>✅ موجودی پس از خرید</span><span>${fa(Math.max(0, after))}</span></div></div>
    <div class="field"><label class="lbl">یادداشت برای معلم (اختیاری)</label><textarea class="input" id="xBuyNote" rows="2" placeholder="مثلاً: برای هفتهٔ بعد می‌خواهم…"></textarea></div>
    <div class="ins warn"><span class="ii">⏳</span><span>درخواستت ثبت می‌شود و پس از تأیید معلم، جایزه مال تو می‌شود؛ تا آن موقع امتیاز رزرو می‌ماند.</span></div>
    <button type="button" class="btn lg" style="width:100%" data-act="xBuyConfirm" data-id="${r.id}">🛒 ثبت درخواست خرید</button></div>`;
}
function badgeDrawer(key) {
  const st = S(), b = BMAP[key]; if (!b) return;
  const t = tierOf(b), sid = mySid();
  const mine = (badges().awarded || []).find(a => a.key === key && (isT() ? true : a.sid === sid));
  const prog = isT() ? null : (badges().progress || badgeProgress(st, sid))[key];
  const holders = isT() ? (badges().awarded || []).filter(a => a.key === key).map(a => stuById(st, a.sid)).filter(Boolean) : [];
  return `<div class="x" style="text-align:center">
    <div style="--tc:${t.c}">${medalSVG(b, 120, !mine)}</div>
    <h2 style="font-size:1.3rem">${b.icon} ${esc(b.name)}</h2>
    <div class="row" style="justify-content:center">${pill(t.l, t.c, t.l === 'طلا' ? '🥇' : t.l === 'نقره' ? '🥈' : '🥉')}<span class="chip">${esc(b.cat)}</span></div>
    <div class="x-desc mt" style="text-align:right">${esc(b.desc)}</div>
    ${mine ? `<div class="ins good mt"><span class="ii">🎉</span><span>${isT() ? 'این نشان به دانش‌آموز داده شده است.' : 'این نشان را در ' + jLabel(iranISO(new Date(mine.at))) + ' گرفتی!'}</span></div>`
      : prog ? `<div class="mt"><div class="spread small bold"><span>پیشرفت تو</span><span>${esc(prog.hint)}</span></div><div class="x-prog" style="--tc:${t.c}"><i style="width:${clamp(prog.cur / prog.target * 100, 0, 100)}%"></i></div></div>` : ''}
    ${isT() && holders.length ? `<div class="divider"></div><h3 class="mb">🏅 دارندگان (${fa(holders.length)})</h3><div class="row" style="justify-content:center">${holders.map(s => `<span class="chip">${avHTML(s, 'sm')} ${esc(s.name)}</span>`).join('')}</div>` : ''}
    ${isT() ? `<div class="divider"></div><button type="button" class="btn ai" data-act="xBManualFor" data-key="${key}">🎁 اعطای دستی این نشان</button>` : ''}</div>`;
}
function bonusDrawer() {
  const st = S();
  return `<form data-form="xBonus" class="x"><h3 class="mb">🎁 پاداش ویژهٔ معلم</h3>
    <div class="field"><label class="lbl">دانش‌آموز</label><select class="select" name="sid" required><option value="">انتخاب…</option>${(st.students || []).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl">امتیاز</label><div class="row" style="gap:6px">${[1, 2, 3, 5, 10].map(p => `<button type="button" class="btn sm soft" data-act="xBonusPts" data-v="${p}">+${fa(p)}</button>`).join('')}<input class="input" data-fa inputmode="numeric" name="points" id="xBonusPts" value="۲" style="width:80px"></div></div>
    <div class="field"><label class="lbl">دلیل</label><input class="input" name="reason" placeholder="مثلاً: کمک به دوستش در ریاضی" required></div>
    <button class="btn" type="submit" style="width:100%">🎁 اعطای پاداش</button></form>`;
}
function manualBadgeDrawer(preKey) {
  const st = S();
  return `<form data-form="xBManual" class="x"><h3 class="mb">🎁 اعطای دستی نشان</h3>
    <div class="field"><label class="lbl">دانش‌آموز</label><select class="select" name="sid" required><option value="">انتخاب…</option>${(st.students || []).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl">نشان</label><select class="select" name="key" required>${BADGES.map(b => `<option value="${b.key}" ${preKey === b.key ? 'selected' : ''}>${b.icon} ${esc(b.name)} (${tierOf(b).l})</option>`).join('')}</select></div>
    <div class="field"><label class="lbl">یادداشت (اختیاری)</label><input class="input" name="note" placeholder="مثلاً: تلاش فوق‌العاده این هفته"></div>
    <button class="btn ai" type="submit" style="width:100%">🏅 اعطای نشان</button></form>`;
}
function importDrawer() {
  const im = X.imp = X.imp || { text: '', headers: [], rows: [], map: {}, parsed: false };
  const F = [['name', 'نام جایزه', 1], ['cost', 'قیمت', 1], ['cat', 'دسته', 0], ['icon', 'نماد', 0], ['stock', 'موجودی', 0], ['per', 'سقف هر نفر', 0], ['desc', 'توضیح', 0]];
  return `<div class="x"><div class="row mb"><label class="btn soft" style="cursor:pointer">📂 انتخاب فایل CSV<input type="file" accept=".csv,.txt,text/csv" class="hidden" data-chg="xImpFile"></label><button type="button" class="btn ghost" data-act="xTpl">📄 نمونه</button></div>
    <div class="field"><label class="lbl">یا محتوای CSV را بچسبان</label><textarea class="input" id="xImpText" rows="5">${esc(im.text)}</textarea></div>
    <button type="button" class="btn" data-act="xImpParse">🔍 بررسی و تطبیق</button>
    <div id="xImpPrev" class="mt">${im.parsed ? `<div class="divider"></div>${F.map(([k, l, req]) => `<div class="cmap"><span class="small bold">${l}${req ? ' *' : ''}</span><select class="select" data-chg="xImpMap" data-f="${k}"><option value="">— نادیده —</option>${im.headers.map((h, i) => `<option value="${i}" ${im.map[k] === i ? 'selected' : ''}>${esc(h || 'ستون ' + (i + 1))}</option>`).join('')}</select></div>`).join('')}
      <button class="btn ok mt" data-act="xImpApply">📥 اعمال ${fa(im.rows.length)} ردیف</button>` : ''}</div></div>`;
}

/* ================= A4 ================= */
function shopSheet() {
  const st = S(), sh = shop();
  const rows = orderedRewards().map((r, i) => `<tr><td>${fa(i + 1)}</td><td class="r">${r.icon} ${esc(r.name)}</td><td>${esc(catOf(r).l)}</td><td>${fa(r.cost)}</td><td>${r.stock < 0 ? '∞' : fa(r.stock)}</td><td>${fa(soldCount(r.id))}</td><td>${rewardActive(st, r) && r.stock !== 0 ? 'فعال' : 'غیرفعال'}</td></tr>`).join('');
  const wallets = (st.students || []).map(s => ({ s, w: wallet(st, s.id) }));
  const wRows = wallets.map((x, i) => `<tr><td>${fa(i + 1)}</td><td class="r">${esc(x.s.name)}</td><td>${fa(x.w.earned)}</td><td>${fa(x.w.spent)}</td><td><b>${fa(x.w.balance)}</b></td></tr>`).join('');
  return `<div class="sheet">${sheetHead('فهرست فروشگاه امتیاز و کیف پول کلاس')}
    <span class="sec">🎁 جایزه‌ها</span>
    <table><thead><tr><th style="width:5%">#</th><th style="width:34%">جایزه</th><th style="width:15%">دسته</th><th style="width:10%">قیمت</th><th style="width:10%">موجودی</th><th style="width:10%">فروش</th><th style="width:16%">وضعیت</th></tr></thead><tbody>${rows}</tbody></table>
    <span class="sec">🪙 کیف پول دانش‌آموزان</span>
    <table><thead><tr><th style="width:6%">#</th><th style="width:44%">نام</th><th style="width:16%">کسب‌شده</th><th style="width:16%">خرج‌شده</th><th style="width:18%">موجودی</th></tr></thead><tbody>${wRows}</tbody></table>
    ${sheetFoot()}</div>`;
}
function badgesSheet(all) {
  const st = S(), bd = badges();
  const studs = all ? (st.students || []) : [stuById(st, mySid())].filter(Boolean);
  const rows = studs.map((s, i) => {
    const mine = (bd.awarded || []).filter(a => a.sid === s.id);
    const keys = new Set(mine.map(a => a.key));
    return `<tr><td>${fa(i + 1)}</td><td class="r">${esc(s.name)}</td>${BADGES.map(b => `<td style="color:${keys.has(b.key) ? '#15803d' : '#bbb'};font-weight:700">${keys.has(b.key) ? '✓' : '—'}</td>`).join('')}<td><b>${fa(mine.length)}</b></td></tr>`;
  }).join('');
  return `<div class="sheet">${sheetHead(all ? 'برگهٔ نشان‌های کلاس' : 'برگهٔ نشان‌های من', all ? fa(studs.length) + ' دانش‌آموز' : (studs[0] ? studs[0].name : ''))}
    <table style="font-size:9px"><thead><tr><th style="width:5%">#</th><th style="width:22%">نام</th>${BADGES.map(b => `<th style="font-size:9px" title="${esc(b.name)}">${b.icon}</th>`).join('')}<th style="width:8%">جمع</th></tr></thead><tbody>${rows}</tbody></table>
    <p style="font-size:9.5px">${BADGES.map(b => `${b.icon} ${esc(b.name)}`).join(' • ')}</p>
    ${sheetFoot()}</div>`;
}

/* ================= CSV ================= */
function csvExport(kind) {
  const st = S(), sh = shop();
  let rows;
  if (kind === 'rewards') {
    rows = [['نام', 'نماد', 'دسته', 'قیمت', 'موجودی', 'سقف هر نفر', 'فعال', 'از تاریخ', 'تا تاریخ', 'توضیح']];
    orderedRewards().forEach(r => rows.push([r.name, r.icon, catOf(r).l, r.cost, r.stock < 0 ? 'نامحدود' : r.stock, r.per || 'بی‌نهایت', r.active === false ? 'خیر' : 'بله', r.startAt || '', r.endAt || '', r.desc]));
  } else if (kind === 'orders') {
    rows = [['دانش‌آموز', 'کد', 'جایزه', 'قیمت', 'وضعیت', 'تاریخ', 'یادداشت دانش‌آموز', 'یادداشت معلم']];
    (sh.purchases || []).slice().sort((a, b) => new Date(b.at) - new Date(a.at)).forEach(p => { const s = stuById(st, p.sid); rows.push([s ? s.name : '', s ? s.code || '' : '', p.name, p.cost, (ORDER[p.status] || {}).l || p.status, jShort(iranISO(new Date(p.at))), p.note || '', p.review ? p.review.note || '' : '']); });
  } else {
    rows = [['نام', 'کد', 'گروه', 'کسب‌شده', 'خرج‌شده', 'رزرو', 'موجودی']];
    (st.students || []).forEach(s => { const w = wallet(st, s.id), g = groupOf(st, s.id); rows.push([s.name, s.code || '', g ? g.name : '', w.earned, w.spent, w.reserved, w.balance]); });
  }
  download(`فروشگاه-${kind}-${C.jShortEn(todayISO()).replace(/\//g, '-')}.csv`, serializeCSV(st, rows));
  toast(`فایل با ${fa(rows.length - 1)} ردیف دانلود شد`, 'ok');
}
function badgeCsv() {
  const st = S(), bd = badges();
  const rows = [['نام', 'کد', 'نشان', 'رده', 'تاریخ', 'نحوهٔ اعطا', 'یادداشت']];
  (bd.awarded || []).slice().sort((a, b) => new Date(b.at) - new Date(a.at)).forEach(a => { const s = stuById(st, a.sid), b = BMAP[a.key]; rows.push([s ? s.name : '', s ? s.code || '' : '', b ? b.name : a.key, b ? tierOf(b).l : '', jShort(iranISO(new Date(a.at))), a.by === 'manual' ? 'دستی' : 'خودکار', a.note || '']); });
  download(`نشان‌ها-${C.jShortEn(todayISO()).replace(/\//g, '-')}.csv`, serializeCSV(st, rows));
  toast('فایل نشان‌ها دانلود شد', 'ok');
}
function template() {
  const rows = [['نام', 'قیمت', 'دسته', 'نماد', 'موجودی', 'سقف هر نفر', 'توضیح'], ['انتخاب جای نشستن', '۱۲', 'امتیاز ویژه', '🪑', '۲', '۱', 'یک هفته جای نشستن دلخواه'], ['ده دقیقه بازی کلاسی', '۲۵', 'سرگرمی', '🎮', '۱', '۱', 'با تأیید معلم']];
  download('نمونه-جایزه‌ها.csv', serializeCSV(S(), rows));
  toast('فایل نمونه دانلود شد', 'ok');
}

/* ================= render integration ================= */
const baseNav = navItems, baseRenderView = renderView, baseRender = render, baseSidebar = renderSidebar;
navItems = function () {
  const items = baseNav();
  const at = items.findIndex(x => x[0] === (isT() ? 'discipline' : 'myCourt'));
  const entries = isT() ? [['shop', '🛒', 'فروشگاه امتیاز'], ['badges', '🏅', 'نشان‌ها']] : [['shop', '🛒', 'فروشگاه'], ['badges', '🏅', 'نشان‌های من']];
  if (at > -1) items.splice(at + 1, 0, ...entries); else items.push(...entries);
  return items;
};
renderView = function () {
  if (UI.section !== 'shop' && UI.section !== 'badges') return baseRenderView();
  const v = document.getElementById('view');
  try {
    C.ensureExtras(S());
    v.innerHTML = `<div class="ve">${UI.section === 'shop' ? (isT() ? teacherShop() : studentShop()) : (isT() ? teacherBadges() : studentBadges())}</div>`;
  } catch (e) {
    console.error('extras view', e);
    v.innerHTML = `<div class="card">${empty('🛠️', 'خطا در نمایش', 'صفحه را دوباره بارگذاری کنید.', '<button type="button" class="btn" data-act="reload">بارگذاری مجدد</button>')}</div>`;
  }
};
renderSidebar = function () {
  baseSidebar();
  const st = S(); if (!st || !SESS) return;
  const pend = (shop().purchases || []).filter(p => p.status === 'pending' && (isT() || p.sid === mySid())).length;
  const btn = document.querySelector('.nav[data-sec="shop"]');
  if (btn && pend && !btn.querySelector('.nb')) { const b = document.createElement('span'); b.className = 'nb'; b.textContent = fa(pend); btn.appendChild(b); }
};
function injectChrome() {
  const tb = document.getElementById('topbar');
  if (tb && !document.getElementById('xBell')) {
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'xBell'; b.className = 'ib x-bell'; b.title = 'مرکز اعلان‌ها'; b.setAttribute('data-act', 'xNotifs'); b.innerHTML = '🔔';
    const anchor = document.getElementById('soundBtn');
    tb.insertBefore(b, anchor || tb.querySelector('.tsp'));
  }
  let nav = document.getElementById('xnav');
  if (!nav) {
    nav = document.createElement('nav'); nav.id = 'xnav';
    document.body.appendChild(nav);
  }
  const items = isT()
    ? [['dash', '🏠', 'خانه'], ['homework', '📚', 'تکالیف'], ['shop', '🛒', 'فروشگاه'], ['badges', '🏅', 'نشان'], ['notifs', '🔔', 'اعلان']]
    : [['report', '🎓', 'کارنامه'], ['myHomework', '📚', 'تکالیف'], ['shop', '🛒', 'فروشگاه'], ['badges', '🏅', 'نشان'], ['notifs', '🔔', 'اعلان']];
  nav.innerHTML = items.map(([k, i, l]) => `<button type="button" data-xnav="${k}" class="${UI.section === k ? 'on' : ''}"><span class="i">${i}</span>${l}${k === 'notifs' ? '<span class="b" style="display:none"></span>' : ''}</button>`).join('') +
    `<button type="button" data-xnav="more"><span class="i">☰</span>بیشتر</button>`;
  nav.querySelectorAll('[data-xnav]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.xnav;
    if (k === 'more') { document.body.classList.add('side-open'); return; }
    if (k === 'notifs') { openNotifs(); return; }
    setSection(k);
  }));
}
render = function (keep) {
  baseRender(keep);
  if (!S() || !SESS) return;
  injectChrome();
  updateBell();
  detectNew();
};
const baseCloseDrawer = closeDrawer;
closeDrawer = function () { baseCloseDrawer(); document.body.classList.remove('x-drawer'); X.nOpen = false; };

/* ================= actions ================= */
ACT.xNotifs = () => openNotifs();
ACT.xNFilter = el => { X.nFilter = el.dataset.f; const b = document.getElementById('drawerBody'); if (b) b.innerHTML = notifHTML(); };
ACT.xReadAll = () => { markAllRead(); const b = document.getElementById('drawerBody'); if (b && X.nOpen) b.innerHTML = notifHTML(); toast('همهٔ اعلان‌ها خوانده شد', 'ok'); };
ACT.xNOpen = el => {
  const seen = loadSeen(); seen.add(el.dataset.id); saveSeen(); updateBell();
  closeDrawer();
  const sec = el.dataset.sec;
  if (sec) setSection(sec);
};
ACT.xShopTab = el => { X.shopTab = el.dataset.tab; renderView(); Sound.play('tap'); };
ACT.xMyTab = el => { X.myTab = el.dataset.tab; renderView(); Sound.play('tap'); };
ACT.xMyCat = el => { X.myCat = el.dataset.v; renderView(); Sound.play('tap'); };
ACT.xMode = el => { X.mode = el.dataset.v; renderView(); Sound.play('tap'); };
ACT.xNew = () => openDrawer('➕ جایزهٔ جدید', rewardForm(null), true);
ACT.xEdit = el => { const r = rewardById(el.dataset.id); if (r) openDrawer('✏️ ویرایش جایزه', rewardForm(r), true); };
ACT.xToggle = el => {
  const id = el.dataset.id;
  send('shop.reward.toggle', { id }, st => { const r = st.shop.rewards.find(x => x.id === id); if (r) r.active = r.active === false ? true : false; }, { sound: 'pop' });
};
ACT.xDel = el => {
  const id = el.dataset.id, r = rewardById(id);
  confirmDlg({ title: 'حذف جایزه', body: `«${r ? r.name : ''}» حذف شود؟`, okText: 'حذف', danger: true, onOk: () => {
    send('shop.reward.delete', { id }, st => { st.shop.rewards = st.shop.rewards.filter(x => x.id !== id); }, { msg: 'جایزه حذف شد', undo: true, sound: 'err' });
    X.sel.delete(id);
  } });
};
ACT.xSelClear = () => { X.sel.clear(); const l = document.getElementById('xList'); if (l) l.innerHTML = shopListBody(); };
ACT.xBulkOn = () => { const ids = [...X.sel]; send('shop.reward.bulkToggle', { ids, active: true }, st => ids.forEach(id => { const r = st.shop.rewards.find(x => x.id === id); if (r) r.active = true; }), { msg: `${fa(ids.length)} جایزه فعال شد` }); X.sel.clear(); };
ACT.xBulkOff = () => { const ids = [...X.sel]; send('shop.reward.bulkToggle', { ids, active: false }, st => ids.forEach(id => { const r = st.shop.rewards.find(x => x.id === id); if (r) r.active = false; }), { msg: `${fa(ids.length)} جایزه غیرفعال شد` }); X.sel.clear(); };
ACT.xBulkDel = () => {
  const ids = [...X.sel];
  confirmDlg({ title: 'حذف گروهی', body: `${fa(ids.length)} جایزه حذف شود؟`, okText: 'حذف همه', danger: true, onOk: () => {
    send('shop.reward.bulkDelete', { ids }, st => { st.shop.rewards = st.shop.rewards.filter(r => !ids.includes(r.id)); }, { msg: `${fa(ids.length)} جایزه حذف شد`, undo: true, sound: 'err' });
    X.sel.clear();
  } });
};
ACT.xViewSave = () => promptDlg({ title: '💾 ذخیرهٔ نما', placeholder: 'مثلاً: جایزه‌های ارزان فعال', onOk: name => send('shop.viewSave', { name, q: X.q, cat: X.cat, status: X.status, sort: X.sort }, st => st.shop.savedViews.push({ id: uid(), name, q: X.q, cat: X.cat, status: X.status, sort: X.sort }), { msg: 'نما ذخیره شد' }) });
ACT.xIcon = el => { if (!X.draft) return; X.draft.icon = el.dataset.v; document.querySelectorAll('#xIcons button').forEach(b => b.classList.toggle('on', b === el)); Sound.play('tap'); };
ACT.xCost = el => { if (!X.draft) return; X.draft.cost = clamp(X.draft.cost + Number(en(el.dataset.d)), 1, 200); const b = document.getElementById('xCostVal'); if (b) b.textContent = fa(X.draft.cost); Sound.play('tap'); };
ACT.xStock = el => { if (!X.draft) return; X.draft.stock = clamp(X.draft.stock + Number(en(el.dataset.d)), -1, 999); const b = document.getElementById('xStockVal'); if (b) b.textContent = X.draft.stock < 0 ? '♾️' : fa(X.draft.stock); Sound.play('tap'); };
ACT.xPer = el => { if (!X.draft) return; X.draft.per = clamp(X.draft.per + Number(en(el.dataset.d)), 0, 20); const b = document.getElementById('xPerVal'); if (b) b.textContent = X.draft.per === 0 ? '∞' : fa(X.draft.per); Sound.play('tap'); };
ACT.xClearDates = () => { if (!X.draft) return; X.draft.startAt = ''; X.draft.endAt = ''; toast('جایزه همیشه در دسترس خواهد بود', 'info'); };
ACT.xBuy = el => { const r = rewardById(el.dataset.id); if (r) openDrawer('🛒 خرید جایزه', buyDrawer(r)); };
ACT.xBuyConfirm = el => {
  const id = el.dataset.id, r = rewardById(id); if (!r) return;
  const note = (document.getElementById('xBuyNote') || {}).value || '';
  const rect = el.getBoundingClientRect();
  coinBurst(rect.left + rect.width / 2, rect.top, 14);
  const pid = uid();
  send('shop.buy', { id: pid, rewardId: id, note }, st => {
    st.shop.purchases.push({ id: pid, sid: mySid(), rewardId: id, name: r.name, icon: r.icon, cost: r.cost, at: new Date().toISOString(), status: st.shop.settings.requireApproval === false ? 'approved' : 'pending', note, review: null });
  }, { sound: null }).then(res => {
    if (res) { Sound.play('win'); toast(`🛒 درخواست «${r.name}» ثبت شد${res.balance != null ? ` • موجودی: ${fa(res.balance)}` : ''}`, 'ok', null, 7000); }
  });
  closeDrawer();
};
ACT.xCancel = el => {
  const id = el.dataset.id;
  confirmDlg({ title: 'لغو درخواست', body: 'درخواست خرید لغو و امتیاز آزاد شود؟', okText: 'لغو کن', onOk: () => send('shop.cancel', { id }, st => { const p = st.shop.purchases.find(x => x.id === id); if (p) { p.status = 'canceled'; p.review = { verdict: 'canceled', note: 'لغو توسط دانش‌آموز', at: new Date().toISOString(), by: 'student' }; } }, { msg: 'درخواست لغو شد', sound: 'pop' }) });
};
ACT.xApprove = el => {
  const id = el.dataset.id, p = (shop().purchases || []).find(x => x.id === id); if (!p) return;
  const rect = el.getBoundingClientRect();
  send('shop.review', { id, verdict: 'approved' }, st => {
    const q = st.shop.purchases.find(x => x.id === id); if (!q) return;
    const r = st.shop.rewards.find(x => x.id === q.rewardId);
    if (r && r.stock > 0) r.stock--;
    q.status = 'approved'; q.review = { verdict: 'approved', note: '', at: new Date().toISOString(), by: 'teacher' };
    st.discipline.push({ id: uid(), sid: q.sid, date: todayISO(), points: -q.cost, reason: 'خرید از فروشگاه: ' + q.name, by: 'shop', oid: q.id });
  }, { sound: null }).then(res => { if (res) { coinBurst(rect.left + rect.width / 2, rect.top, 10); Sound.play('gavel'); stamp('تأیید شد', '#16a34a'); toast(`✅ خرید تأیید شد • ${fa(p.cost)} امتیاز کم شد`, 'ok'); } });
};
ACT.xReject = el => {
  const id = el.dataset.id;
  promptDlg({ title: '✖️ رد درخواست', placeholder: 'دلیل رد (برای دانش‌آموز نمایش داده می‌شود)', onOk: note => {
    send('shop.review', { id, verdict: 'rejected', note }, st => { const p = st.shop.purchases.find(x => x.id === id); if (p) { p.status = 'rejected'; p.review = { verdict: 'rejected', note, at: new Date().toISOString(), by: 'teacher' }; } }, { msg: 'درخواست رد شد و امتیاز آزاد شد', sound: 'err' });
  } });
};
ACT.xApproveAll = () => {
  const pend = (shop().purchases || []).filter(p => p.status === 'pending');
  if (!pend.length) return toast('درخواستی نیست', 'info');
  confirmDlg({ title: '✅ تأیید همه', body: `${fa(pend.length)} درخواست (${fa(pend.reduce((a, p) => a + p.cost, 0))} امتیاز) تأیید شود؟`, okText: 'تأیید همه', onOk: () => {
    send('shop.bulkReview', { ids: pend.map(p => p.id), verdict: 'approved' }, null, { sound: null }).then(res => { if (res) { coinBurst(innerWidth / 2, innerHeight / 2, 22); Sound.play('win'); stamp(fa(res.reviewed) + ' تأیید', '#16a34a'); toast(`✅ ${fa(res.reviewed)} خرید تأیید شد • ${fa(res.cost)} امتیاز`, 'ok', null, 7000); } });
  } });
};
ACT.xRefund = el => {
  const id = el.dataset.id, p = (shop().purchases || []).find(x => x.id === id);
  confirmDlg({ title: '↩️ بازگردانی خرید', body: `«${p ? p.name : ''}» لغو و ${fa(p ? p.cost : 0)} امتیاز به دانش‌آموز برگردد؟`, okText: 'بازگردان', onOk: () => send('shop.refund', { id }, null, { msg: 'امتیاز بازگردانده شد', sound: 'pop' }) });
};
ACT.xBonus = () => openDrawer('🎁 پاداش ویژه', bonusDrawer());
ACT.xBonusPts = el => { const i = document.getElementById('xBonusPts'); if (i) i.value = fa(el.dataset.v); Sound.play('tap'); };
ACT.xSet = el => { const k = el.dataset.k, v = el.checked; send('shop.settings', { patch: { [k]: v } }, st => { st.shop.settings[k] = v; }, { msg: 'قاعده ذخیره شد' }); };
ACT.xCsv = el => csvExport(el.dataset.kind);
ACT.xTpl = () => template();
ACT.xImport = () => { X.imp = { text: '', headers: [], rows: [], map: {}, parsed: false }; openDrawer('📥 ورود CSV جایزه‌ها', importDrawer(), true); };
ACT.xImpParse = () => {
  const text = (document.getElementById('xImpText') || {}).value || '';
  if (!text.trim()) return toast('محتوای CSV خالی است', 'err');
  const rows = parseCSV(text); if (rows.length < 2) return toast('حداقل یک ردیف لازم است', 'err');
  const im = X.imp; im.text = text; im.headers = rows[0].map(x => norm(x)); im.rows = rows.slice(1); im.parsed = true;
  const syn = { name: ['نام', 'جایزه'], cost: ['قیمت', 'امتیاز'], cat: ['دسته'], icon: ['نماد'], stock: ['موجودی'], per: ['سقف'], desc: ['توضیح'] };
  im.map = {}; Object.keys(syn).forEach(k => { const i = im.headers.findIndex(h => syn[k].some(s => norm(h).includes(norm(s)))); if (i > -1) im.map[k] = i; });
  document.getElementById('drawerBody').innerHTML = importDrawer();
  toast('فایل خوانده شد', 'info');
};
ACT.xImpApply = () => {
  const im = X.imp; if (!im || !im.rows.length) return;
  confirmDlg({ title: '📥 اعمال ورود', body: `${fa(im.rows.length)} جایزه ساخته شود؟`, okText: 'اعمال', onOk: () => {
    send('shop.import', { rows: im.rows, map: im.map }, null, { undo: true, sound: 'win' }).then(r => { if (r) { toast(`📥 ${fa(r.applied)} جایزه ساخته شد`, 'ok'); X.imp = null; closeDrawer(); } });
  } });
};
ACT.xShopSheet = () => previewSheet('🖨️ برگهٔ فروشگاه (A4)', shopSheet());
/* badges */
ACT.xBTab = el => { X.badgeTab = el.dataset.tab; renderView(); Sound.play('tap'); };
ACT.xBTier = el => { X.btier = el.dataset.v; renderView(); Sound.play('tap'); };
ACT.xBadgeOpen = el => badgeDrawer(el.dataset.key) && openDrawer('🏅 ' + (BMAP[el.dataset.key] || {}).name, badgeDrawer(el.dataset.key));
ACT.xBSync = () => {
  send('badge.sync', { force: true }, null, { sound: null }).then(r => {
    if (!r) return;
    if (r.added) { coinBurst(innerWidth / 2, innerHeight / 2, 18); Sound.play('win'); stamp(fa(r.added) + ' نشان', '#7c3aed'); toast(`🏅 ${fa(r.added)} نشان تازه اعطا شد!`, 'ok', null, 8000); }
    else toast('همهٔ نشان‌های استحقاقی قبلاً داده شده‌اند ✅', 'info');
  });
};
ACT.xBManual = () => openDrawer('🎁 اعطای دستی نشان', manualBadgeDrawer());
ACT.xBManualFor = el => openDrawer('🎁 اعطای دستی نشان', manualBadgeDrawer(el.dataset.key));
ACT.xBRevoke = el => {
  const { sid, key } = el.dataset; const b = BMAP[key], s = stuById(S(), sid);
  confirmDlg({ title: 'پس گرفتن نشان', body: `نشان «${b ? b.name : ''}» از ${s ? s.name : ''} پس گرفته شود؟`, okText: 'پس بگیر', danger: true, onOk: () => send('badge.revoke', { sid, key }, st => { st.badges.awarded = st.badges.awarded.filter(a => !(a.sid === sid && a.key === key)); }, { msg: 'نشان پس گرفته شد', undo: true, sound: 'err' }) });
};
ACT.xBSet = el => { const k = el.dataset.k, v = el.checked; send('badge.settings', { patch: { [k]: v } }, st => { st.badges.settings[k] = v; }, { msg: 'قاعده ذخیره شد' }); };
ACT.xBcsv = () => badgeCsv();
ACT.xBClassSheet = () => previewSheet('🖨️ برگهٔ نشان‌های کلاس (A4)', badgesSheet(true));
ACT.xMyBadgeSheet = () => previewSheet('🖨️ برگهٔ نشان‌های من (A4)', badgesSheet(false));

/* ================= inputs / changes ================= */
INP.xQ = el => { X.q = el.value; const l = document.getElementById('xList'); if (l) l.innerHTML = shopListBody(); };
INP.xMyQ = el => { X.myQ = el.value; renderView(); const i = document.querySelector('[data-inp="xMyQ"]'); if (i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) {} } };
INP.xLQ = el => { X.ledgerQ = el.value; const b = document.getElementById('xBody'); if (b) b.innerHTML = ledgerBody(); };
INP.xBQ = el => { X.bq = el.value; renderView(); const i = document.querySelector('[data-inp="xBQ"]'); if (i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) {} } };
CHG.xCat = el => { X.cat = el.value; const l = document.getElementById('xList'); if (l) l.innerHTML = shopListBody(); };
CHG.xStatus = el => { X.status = el.value; const l = document.getElementById('xList'); if (l) l.innerHTML = shopListBody(); };
CHG.xSort = el => { X.sort = el.value; const l = document.getElementById('xList'); if (l) l.innerHTML = shopListBody(); };
CHG.xSel = el => { el.checked ? X.sel.add(el.dataset.id) : X.sel.delete(el.dataset.id); const l = document.getElementById('xList'); if (l) l.innerHTML = shopListBody(); };
CHG.xSelAll = el => { const l = shopFiltered(); if (el.checked) l.forEach(r => X.sel.add(r.id)); else X.sel.clear(); const b = document.getElementById('xList'); if (b) b.innerHTML = shopListBody(); };
CHG.xViewApply = el => { const v = (shop().savedViews || []).find(x => x.id === el.value); if (!v) return; X.q = v.q || ''; X.cat = v.cat || 'all'; X.status = v.status || 'all'; X.sort = v.sort || 'order'; renderView(); toast('نما اعمال شد: ' + v.name, 'ok'); };
CHG.xLStatus = el => { X.ledgerStatus = el.value; const b = document.getElementById('xBody'); if (b) b.innerHTML = ledgerBody(); };
CHG.xLStu = el => { X.ledgerStu = el.value; const b = document.getElementById('xBody'); if (b) b.innerHTML = ledgerBody(); };
CHG.xF = el => { if (X.draft) X.draft[el.dataset.f] = el.value; };
CHG.xFB = el => { if (X.draft) X.draft[el.dataset.f] = el.checked; };
CHG.xImpFile = async el => { const f = el.files && el.files[0]; el.value = ''; if (!f) return; const t = await f.text(); X.imp = X.imp || {}; X.imp.text = t; const ta = document.getElementById('xImpText'); if (ta) ta.value = t; ACT.xImpParse(); };
CHG.xImpMap = el => { if (X.imp) X.imp.map[el.dataset.f] = el.value === '' ? '' : Number(el.value); };

/* ================= forms ================= */
FORM.xReward = form => {
  const d = X.draft; if (!d) return;
  const fd = new FormData(form);
  const data = {
    name: String(fd.get('name') || '').trim(), icon: d.icon, cat: d.cat, desc: String(fd.get('desc') || '').trim(),
    cost: d.cost, stock: d.stock, per: d.per, active: d.active !== false,
    startAt: d.startAt === '' ? '' : (UI.jdate.xstart || ''), endAt: d.endAt === '' ? '' : (UI.jdate.xend || '')
  };
  if (!data.name) return toast('نام جایزه را بنویس', 'err');
  if (d.id) send('shop.reward.update', { id: d.id, data }, st => { const r = st.shop.rewards.find(x => x.id === d.id); if (r) Object.assign(r, data); }, { msg: 'جایزه ویرایش شد' });
  else { const id = uid(); send('shop.reward.create', { id, data }, st => { const order = st.shop.rewards.reduce((m, r) => Math.max(m, r.order || 0), 0) + 1; st.shop.rewards.push(Object.assign({ id, order, createdAt: todayISO() }, data)); }, { msg: '🎁 جایزه ساخته شد' }); }
  X.draft = null; closeDrawer();
};
FORM.xBonus = form => {
  const fd = new FormData(form), sid = fd.get('sid'), pts = clamp(num(fd.get('points')) || 0, 1, 50), reason = String(fd.get('reason') || '').trim();
  if (!sid || !reason) return toast('دانش‌آموز و دلیل را کامل کن', 'err');
  send('shop.bonus', { sid, points: pts, reason }, st => st.discipline.push({ id: uid(), sid, date: todayISO(), points: pts, reason: '🎁 ' + reason, by: 'bonus' }), { sound: null }).then(r => { if (r) { coinBurst(innerWidth / 2, innerHeight / 2, 12); Sound.play('win'); toast(`🎁 ${fa(pts)} امتیاز پاداش داده شد`, 'ok'); } });
  closeDrawer();
};
FORM.xBManual = form => {
  const fd = new FormData(form), sid = fd.get('sid'), key = fd.get('key'), note = String(fd.get('note') || '').trim();
  if (!sid || !key) return toast('دانش‌آموز و نشان را انتخاب کن', 'err');
  send('badge.award', { sid, key, note }, st => st.badges.awarded.push({ id: uid(), sid, key, at: new Date().toISOString(), by: 'manual', note }), { sound: null }).then(r => { if (r) { Sound.play('win'); stamp('نشان اعطا شد', '#7c3aed'); toast(`🏅 نشان «${(BMAP[key] || {}).name}» اعطا شد`, 'ok'); } });
  closeDrawer();
};

/* ================= drag reorder ================= */
let dragId = null;
document.addEventListener('dragstart', e => {
  const card = e.target.closest && e.target.closest('[data-xdrag]');
  if (!card) return;
  dragId = card.dataset.xdrag; card.classList.add('dragging');
  try { e.dataTransfer.setData('text/plain', 'x:' + dragId); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
});
document.addEventListener('dragend', () => { dragId = null; document.querySelectorAll('.x-card.dragging,.x-card.hint').forEach(x => x.classList.remove('dragging', 'hint')); });
document.addEventListener('dragover', e => {
  if (!dragId) return;
  const z = e.target.closest && e.target.closest('[data-xdrop]');
  if (!z) return;
  e.preventDefault();
  document.querySelectorAll('.x-card.hint').forEach(x => { if (x !== z) x.classList.remove('hint'); });
  z.classList.add('hint');
});
document.addEventListener('drop', e => {
  if (!dragId) return;
  const z = e.target.closest && e.target.closest('[data-xdrop]');
  if (!z) return;
  e.preventDefault(); e.stopPropagation();
  const target = z.dataset.xdrop, src = dragId; dragId = null;
  document.querySelectorAll('.x-card.hint').forEach(x => x.classList.remove('hint'));
  if (!target || target === src) return;
  const all = orderedRewards();
  const from = all.findIndex(r => r.id === src), to = all.findIndex(r => r.id === target);
  if (from < 0 || to < 0) return;
  X.sort = 'order';
  send('shop.reward.reorder', { from, to }, st => {
    const arr = st.shop.rewards.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    const [x] = arr.splice(from, 1); arr.splice(to, 0, x);
    arr.forEach((r, i) => { r.order = i + 1; });
  }, { sound: 'pop' });
}, true);

/* ================= boot ================= */
const baseEnter = enterApp;
enterApp = async function (sess) {
  X.seen = null; X.firstRun = false; X.lastIds = [];
  await baseEnter(sess);
  loadSeen();
  detectNew();
  updateBell();
};
if (S() && SESS) { injectChrome(); loadSeen(); updateBell(); render(true); }
})();
