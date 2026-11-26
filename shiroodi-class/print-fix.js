/* print-fix.js — سربرگ چاپ: شماره بالای تاریخ، هر دو در گوشهٔ چپ • شمارهٔ ثابت در پیش‌نمایش و چاپ */
(function () {
'use strict';

function docNo() {
  const C = globalThis.ClassCore || {};
  const iso = String(C.todayISO ? C.todayISO() : new Date().toISOString().slice(0, 10));
  let h = 2166136261;
  for (let i = 0; i < iso.length; i++) { h ^= iso.charCodeAt(i); h = Math.imul(h, 16777619); }
  return 1000 + ((h >>> 0) % 9000);
}

function build(title, sub) {
  const C = globalThis.ClassCore || {};
  const fa = C.fa || (n => String(n));
  const jShort = C.jShort || (x => String(x));
  const todayISO = C.todayISO || (() => new Date().toISOString().slice(0, 10));
  const esc = C.esc || (x => String(x == null ? '' : x));
  const st = (typeof S === 'function' && S()) ? S() : null;
  const m = (st && st.meta) || {};
  return `<div class="sh"><div class="sht" style="display:flex;flex-direction:row;direction:rtl;align-items:flex-start;justify-content:space-between;gap:12px">
<span style="font-weight:700">اداره آموزش و پرورش شهرستان نور</span>
<span style="display:block;text-align:left;line-height:1.75;white-space:nowrap;font-weight:600">
<span style="display:block">شماره: ${fa(docNo())}/د</span>
<span style="display:block">تاریخ: ${jShort(todayISO())}</span>
</span>
</div>
<h1>${esc(m.school || '')}</h1><div class="shs">${esc(title)} — ${esc(m.className || '')} • سال تحصیلی ${esc(m.year || '')}${sub ? ' • ' + esc(sub) : ''}</div><div class="seal">مهر رسمی<br>مدرسه</div></div>`;
}

function install() {
  try { if (typeof sheetHead === 'undefined') return false; } catch (e) { return false; }
  window.sheetHead = build;
  return true;
}

if (!install()) {
  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('load', install);
}
})();
