/* auth-guard.js — ورود معلم فقط از مسیر سرور؛ مسیر نمایشی برای همیشه بسته */
(function () {
'use strict';
if (window.__AUTH_GUARD__) return; window.__AUTH_GUARD__ = true;
function role() { var b = document.querySelector('.ltabs button.on'); return b ? b.dataset.role : 'student'; }
function noServer() {
  try { if (typeof Net !== 'undefined' && Net && Net.mode && Net.mode !== 'server') return true; } catch (e) {}
  return !navigator.onLine;
}
function err(m) {
  var el = document.getElementById('loginErr');
  if (el) { el.textContent = m; el.style.display = 'block'; }
  else { try { toast(m, 'err'); } catch (e) {} }
}
document.addEventListener('submit', function (e) {
  var f = e.target && e.target.closest ? e.target.closest('form[data-form="login"]') : null;
  if (!f) return;
  if (role() !== 'teacher') return;
  if (noServer()) {
    e.preventDefault(); e.stopImmediatePropagation();
    err('🔒 ورود معلم فقط با اتصال سرور ممکن است. اینترنت را وصل کن و دوباره بزن.');
  }
}, true);
})();
