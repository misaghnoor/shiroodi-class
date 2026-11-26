/* lib/store.js — بیمهٔ کلاس وصل شد؛ اگر فایلش نبود سرور نمی‌خوابد */
import '../core.js';
import '../homework-core.js';
import '../extras-core.js';
import '../growth-core.js';
import '../tickets-core.js';
import '../market-core.js';
import '../market-ext-core.js';
import * as db from './db.js';
try { await import('../insco-core.js'); } catch (e) { /* ماژول اختیاری */ }

const C = globalThis.ClassCore;
const ENSURES = ['hwEnsure', 'ensureExtras', 'grEnsure', 'tkEnsure', 'ecEnsure', 'mktEnsure'];
function runEnsures(st) { for (const fn of ENSURES) { try { if (typeof C[fn] === 'function') C[fn](st); } catch (e) {} } }

const POLL_TYPES = ['choice', 'multi', 'yesno', 'rating', 'election'];
const ASMT_TYPES = ['oral', 'written', 'performance', 'homework'];
const OWN = ['hw.', 'shop.', 'badge.', 'gr.', 'tk.', 'econ.', 'mkt.', 'ico.'];

export async function ensureStore() {
  let row = await db.readStore();
  if (!row) {
    await db.insertStore(C.buildSeed());
    row = await db.readStore();
    if (!row) { const e = new Error('راه‌اندازی دیتابیس ناموفق بود.'); e.status = 500; throw e; }
  }
  let st = row.data, rev = row.revision, dirty = false;

  if (!st || st.schema !== C.SCHEMA) { st = C.normalize(st); st._mig = C.SCHEMA; dirty = true; }
  if (st._mig !== C.SCHEMA) { runEnsures(st); st._mig = C.SCHEMA; dirty = true; }
  if (!st.insCo && typeof C.icoEnsure === 'function') { try { C.icoEnsure(st); dirty = true; } catch (e) {} }
  if (typeof C.icoCollect === 'function') { try { if (C.icoCollect(st)) dirty = true; } catch (e) {} }

  if (dirty) {
    const nr = await db.casStore(st, rev);
    if (nr) return { data: st, revision: nr };
    row = await db.readStore(); st = row.data; rev = row.revision;
  }
  return { data: st, revision: rev };
}

function repair(cmd, draft) {
  const c = Object.assign({}, cmd);
  if (typeof c.type === 'string' && !OWN.some(p => c.type.indexOf(p) === 0)) {
    if (POLL_TYPES.includes(c.type)) { c.subType = c.type; c.type = 'poll.create'; }
    else if (ASMT_TYPES.includes(c.type)) { c.subType = c.type; c.type = (draft.assessments || []).some(a => a.id === c.id) ? 'asmt.update' : 'asmt.add'; }
  }
  return c;
}
function friendly(e) {
  if (e && typeof e.status === 'number') return e;
  const raw = String((e && e.message) || e || '');
  const unknown = /unknown|ناشناخته/i.test(raw);
  const err = new Error(unknown ? 'این بخش روی سرور فعال نیست (فایل ماژولش نصب نشده).' : 'سرور نتوانست این تغییر را پردازش کند؛ دوباره تلاش کن.');
  err.status = unknown ? 400 : 500;
  return err;
}
export async function mutateStore(cmd, session) {
  for (let i = 0; i < 6; i++) {
    const row = await ensureStore();
    const draft = C.clone(row.data);
    let out;
    try { out = C.applyCommand(draft, repair(cmd, draft), session); } catch (e) { throw friendly(e); }
    const rev = await db.casStore(out.state, row.revision);
    if (rev) return { revision: rev, state: out.state, result: out.result };
  }
  const e = new Error('سرور در حال ثبت تغییر دیگری بود؛ دوباره تلاش کنید.'); e.status = 409; throw e;
}
