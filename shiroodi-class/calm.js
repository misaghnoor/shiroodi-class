/* calm.js — ضد پرش: همگام‌سازی بی‌سر و صدا + رندر فقط وقتی کاربر آزاد است */
(function () {
'use strict';
if (typeof pull !== 'function' || typeof render !== 'function') return;

let lastActivity = 0, deferred = null, pollRender = false, lastPoll = 0;

function mark() { lastActivity = Date.now(); }
['pointerdown', 'keydown', 'input', 'change', 'wheel', 'touchstart'].forEach(ev =>
  document.addEventListener(ev, mark, { passive: true, capture: true }));

function busy() {
  if (document.hidden) return true;
  const a = document.activeElement;
  if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName || '')) return true;
  const dw = document.getElementById('drawerWrap');
  if (dw && dw.classList.contains('open')) return true;
  const mw = document.getElementById('modalWrap');
  if (mw && mw.classList.contains('open')) return true;
  if (typeof UI !== 'undefined' && UI && UI.run) return true;
  if (Date.now() - lastActivity < 2000) return true;
  return false;
}

/* رندرهای ناشی از همگام‌سازی: اگر کاربر مشغول تایپ/کشو/آزمون است، نگه‌شان دار */
const baseRender = render;
render = function (keep) {
  if (pollRender && busy()) { if (deferred === null) deferred = keep; return; }
  baseRender(keep);
};
setInterval(() => {
  if (deferred !== null && !busy() && !pollRender) { const k = deferred; deferred = null; baseRender(k); }
}, 1200);

/* همگام‌سازی: حداکثر هر ۱۵ ثانیه، بی‌سر و صدا */
const basePull = pull;
pull = async function (force) {
  const now = Date.now();
  if (!force && now - lastPoll < 15000) return undefined;
  lastPoll = now;
  pollRender = true;
  try { return await basePull(force); }
  finally { setTimeout(() => { pollRender = false; }, 80); }
};
setInterval(() => {
  if (typeof SESS === 'undefined' || !SESS) return;
  if (document.hidden) return;
  if (typeof UI !== 'undefined' && UI && UI.pending) return;
  if (busy()) return;
  pull(false).catch(() => {});
}, 20000);

/* برگشت به تب / وصل شدن اینترنت → فوراً همگام شو */
document.addEventListener('visibilitychange', () => { if (!document.hidden && typeof SESS !== 'undefined' && SESS) pull(true).catch(() => {}); });
window.addEventListener('focus', () => { if (typeof SESS !== 'undefined' && SESS) pull(true).catch(() => {}); });
window.addEventListener('online', () => { if (typeof SESS !== 'undefined' && SESS) pull(true).catch(() => {}); });
})();
