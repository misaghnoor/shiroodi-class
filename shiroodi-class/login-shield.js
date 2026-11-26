/* login-shield.js — سپر امنیتی صفحهٔ ورود: هیچ کدی هرگز نمایش داده نمی‌شود */
(function () {
'use strict';

/* ۱) کادر حالتِ پایین صفحهٔ ورود برای همیشه محو می‌شود */
const css = document.createElement('style');
css.id = 'loginShieldCss';
css.textContent = '#modeBox,.modebox{display:none!important;visibility:hidden!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}';
document.head.appendChild(css);

/* ۲) اگر هر متنی در صفحهٔ ورود خواست کد را لو بدهد، اعدادش پاک می‌شود */
const KEY_RE = /کد\s*(معلم|مدیریت|ورود\s*معلم)|رمز\s*(معلم|مدیریت)|teacher\s*code/i;
const NUM_RE = /([0-9]{4,}|[۰-۹]{4,})/g;

function scrubLogin() {
  const login = document.getElementById('login');
  if (!login) return;
  const mb = document.getElementById('modeBox');
  if (mb) { if (mb.innerHTML.trim()) mb.innerHTML = ''; mb.style.display = 'none'; }
  login.querySelectorAll('div,p,span,b,small,strong').forEach(el => {
    if (el.children.length) return;
    const t = el.textContent || '';
    if (KEY_RE.test(t) && NUM_RE.test(t)) el.textContent = t.replace(NUM_RE, '••••');
    NUM_RE.lastIndex = 0;
  });
}

/* ۳) نگهبان دائمی: هر تغییری در صفحهٔ ورود، بلافاصله پاک‌سازی می‌شود */
let queued = false;
function queueScrub() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; scrubLogin(); });
}
if (typeof MutationObserver !== 'undefined') {
  const mo = new MutationObserver(queueScrub);
  const start = () => mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
}
scrubLogin();
document.addEventListener('DOMContentLoaded', scrubLogin);
window.addEventListener('load', scrubLogin);
})();
