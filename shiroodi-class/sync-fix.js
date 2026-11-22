/* sync-fix.js — همگام‌سازی بی‌سر و صدا: صفحه فقط وقتی چیزی عوض شده نو می‌شود */
(function () {
'use strict';
if (typeof startPoller !== 'function' || typeof pull !== 'function') return;

let timer = null;

async function silentCheck() {
  if (typeof SESS === 'undefined' || !SESS) return;   // هنوز وارد نشده
  if (document.hidden) return;                        // تب در پس‌زمینه است
  if (typeof UI !== 'undefined' && UI.pending) return; // در حال ثبت تغییر است
  try {
    const rev = (typeof Net !== 'undefined' && Net.rev != null) ? Net.rev : '';
    const res = await fetch('/api/state?rev=' + encodeURIComponent(rev), {
      headers: { Authorization: 'Bearer ' + SESS.token }
    });
    if (!res.ok) {
      if (res.status !== 401 && typeof syncStatus === 'function') syncStatus('err', 'قطع');
      return;
    }
    const j = await res.json();
    if (typeof UI !== 'undefined') UI.lastSync = Date.now();
    if (typeof Net !== 'undefined') Net.online = true;
    if (j && j.changed === true) {
      await pull(true);   // ← فقط و فقط وقتی واقعاً چیزی عوض شده
    }
    // وگرنه: هیچ کاری نمی‌کنیم. نه پرشی، نه بازسازی‌ای.
  } catch (e) {
    if (typeof Net !== 'undefined') Net.online = false;
    if (typeof syncStatus === 'function') syncStatus('err', 'قطع');
  }
}

startPoller = function () {
  clearInterval(timer);
  timer = setInterval(silentCheck, 20000);  // هر ۲۰ ثانیه، بی‌سر و صدا
  setTimeout(silentCheck, 4000);
};
})();
