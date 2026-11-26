/* exam-relax.js — آزمون بدون استرس: ذخیرهٔ خودکار، شروع نامحدود، پایان دستی */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || typeof navItems !== 'function') return;

const fa = C.fa, jShort = C.jShort, iranISO = C.iranISO;
const draftKey = (qid, sid) => 'sh14_exd_' + qid + '_' + sid;

const CSS = `
.ex-calm{position:sticky;top:0;z-index:30;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:10px 14px;border-radius:14px;margin-bottom:14px;display:flex;align-items:center;gap:12px;font-size:.86rem;font-weight:700;box-shadow:0 10px 24px -12px rgba(16,185,129,.6)}
.ex-calm .i{font-size:1.4rem;flex:none;animation:exBreathe 4s ease-in-out infinite}
@keyframes exBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
.ex-calm .t{flex:1;line-height:1.7}
.ex-calm .t small{display:block;font-size:.72rem;opacity:.9;font-weight:600}
.ex-saved{font-size:.74rem;color:#059669;font-weight:800;display:inline-flex;align-items:center;gap:4px;opacity:0;transition:opacity .3s}
.ex-saved.on{opacity:1}
.ex-draft-banner{background:color-mix(in srgb,#059669 12%,var(--surface));border:1.5px solid color-mix(in srgb,#059669 40%,var(--line));border-radius:14px;padding:12px 14px;margin-bottom:12px}
[data-theme=dark] .ex-calm{background:linear-gradient(135deg,#047857,#065f46)}
`;
if (!document.getElementById('exStyles')) { const s = document.createElement('style'); s.id = 'exStyles'; s.textContent = CSS; document.head.appendChild(s); }

/* ---------- یادآور نفس ---------- */
let breathIv = null;
function startBreath() {
  if (breathIv) return;
  breathIv = setInterval(() => {
    const el = document.querySelector('.ex-calm .t');
    if (!el) return;
    const msgs = [
      { m: '🌬️ یک نفس عمیق بکش… دم… بازدم…', s: 'هیچ‌کس قرار نیست تو را قضاوت کند — فقط کاری که بلدی را بنویس.' },
      { m: '💧 یک جرعه آب بخور', s: 'آب به تمرکز مغز کمک می‌کند.' },
      { m: '🧘 شانه‌هایت را شل کن', s: 'شانه‌های بالا = استرس؛ شل کن و راحت بنشین.' },
      { m: '👀 یک لحظه از صفحه نگاه کن بیرون', s: '۲۰ ثانیه به دورترین شیء نگاه کن، چشم‌ها استراحت می‌کنند.' }
    ];
    const x = msgs[Math.floor(Math.random() * msgs.length)];
    el.innerHTML = '<b>' + x.m + '</b><small>' + x.s + '</small>';
    Sound.play('pop');
    setTimeout(() => {
      if (el) el.innerHTML = '<b>💚 آزمون در حال ذخیرهٔ خودکار است</b><small>هر پاسخی که بنویسی همان لحظه ثبت می‌شود — بدون عجله.</small>';
    }, 8000);
  }, 10 * 60 * 1000);
}
function stopBreath() { if (breathIv) { clearInterval(breathIv); breathIv = null; } }

/* ---------- ذخیرهٔ خودکار پاسخ ---------- */
function saveDraft(qid, sid, data) {
  try { localStorage.setItem(draftKey(qid, sid), JSON.stringify({ data, at: Date.now() })); } catch (e) {}
}
function loadDraft(qid, sid) {
  try { const raw = localStorage.getItem(draftKey(qid, sid)); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function clearDraft(qid, sid) {
  try { localStorage.removeItem(draftKey(qid, sid)); } catch (e) {}
}

/* ---------- hook روی پاسخ دادن ---------- */
const baseRV = renderView;
renderView = function () {
  baseRV();
  setTimeout(() => {
    try {
      if (!S() || !SESS || isT()) return;
      if (UI.section !== 'quiz') return;
      /* تزریق نوار آرامش بالای صفحه */
      const view = document.getElementById('view');
      if (!view || view.querySelector('.ex-calm')) return;
      const calm = document.createElement('div');
      calm.className = 'ex-calm';
      calm.innerHTML = '<span class="i">💚</span><div class="t"><b>آزمون در حال ذخیرهٔ خودکار است</b><small>هر پاسخی که بنویسی همان لحظه ثبت می‌شود — بدون عجله، بدون استرس.</small></div><span class="ex-saved" id="exSaved">✓ ذخیره شد</span>';
      view.insertBefore(calm, view.firstChild);
      startBreath();

      /* ذخیرهٔ خودکار روی هر تغییر input */
      const inputs = view.querySelectorAll('input[name],textarea[name],select[name]');
      const qid = (view.querySelector('[data-quiz-id]') || {}).dataset.quizId || UI.quizId || '';
      if (!qid) return;
      const sid = SESS.sid;
      const draft = loadDraft(qid, sid);
      if (draft && draft.data) {
        /* بازیابی draft */
        Object.keys(draft.data).forEach(k => {
          const el = view.querySelector('[name="' + k + '"]');
          if (!el) return;
          if (el.type === 'checkbox' || el.type === 'radio') {
            if (Array.isArray(draft.data[k])) el.checked = draft.data[k].includes(el.value);
            else el.checked = draft.data[k] === el.value || draft.data[k] === true;
          } else el.value = draft.data[k] || '';
        });
        const banner = document.createElement('div');
        banner.className = 'ex-draft-banner';
        banner.innerHTML = '💚 پاسخ‌های قبلی‌ات بازیابی شد — از همان‌جا ادامه بده که رها کرده بودی. <span class="small muted">(' + jShort(iranISO(new Date(draft.at))) + ')</span>';
        view.insertBefore(banner, calm.nextSibling);
        Sound.play('ok');
      }

      function collect() {
        const out = {};
        view.querySelectorAll('input[name],textarea[name],select[name]').forEach(el => {
          if (el.type === 'checkbox') {
            out[el.name] = out[el.name] || [];
            if (el.checked) out[el.name].push(el.value);
          } else if (el.type === 'radio') {
            if (el.checked) out[el.name] = el.value;
          } else out[el.name] = el.value;
        });
        return out;
      }
      let saveT = null;
      function save() {
        clearTimeout(saveT);
        saveT = setTimeout(() => {
          saveDraft(qid, sid, collect());
          const ind = document.getElementById('exSaved');
          if (ind) { ind.classList.add('on'); setTimeout(() => ind.classList.remove('on'), 1200); }
        }, 250);
      }
      inputs.forEach(el => {
        el.addEventListener('input', save);
        el.addEventListener('change', save);
      });
    } catch (e) { console.error('exam-relax inject', e); }
  }, 180);
};

/* ---------- پاک کردن draft بعد از ثبت موفق ---------- */
const baseSend = window.send;
if (baseSend) {
  window.send = function (type, cmd, patch, opts) {
    return baseSend(type, cmd, patch, opts).then(r => {
      if (type === 'quiz.submit' && r) {
        const qid = cmd && cmd.quizId;
        if (qid && SESS) clearDraft(qid, SESS.sid);
        stopBreath();
      }
      return r;
    });
  };
}

/* ---------- خروج از بخش آزمون = توقف یادآور ---------- */
const baseSetSection = window.setSection;
if (baseSetSection) {
  window.setSection = function (s) {
    if (s !== 'quiz') stopBreath();
    return baseSetSection(s);
  };
}

/* ---------- پاک‌کردن draft هنگام logout ---------- */
window.addEventListener('beforeunload', () => { /* draft بماند تا بعداً ادامه دهد */ });
})();
