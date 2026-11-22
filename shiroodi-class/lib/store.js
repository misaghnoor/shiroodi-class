/* lib/store.js — بارگذاری ماژول‌ها، مهاجرت یک‌باره و اعمال فرمان */
import '../core.js';
import '../homework-core.js';
import '../extras-core.js';
import * as db from './db.js';

const C = globalThis.ClassCore;

const POLL_TYPES = ['choice', 'multi', 'yesno', 'rating', 'election'];
const ASMT_TYPES = ['oral', 'written', 'performance', 'homework'];

export async function ensureStore() {
  let row = await db.readStore();
  if (!row) {
    await db.insertStore(C.buildSeed());
    row = await db.readStore();
    if (!row) throw new Error('راه‌اندازی دیتابیس ناموفق بود.');
  }
  let st = row.data, rev = row.revision;

  if (!st || st.schema !== C.SCHEMA) {
    st = C.normalize(st);
    st._mig = C.SCHEMA;
    const nr = await db.casStore(st, rev);
    if (nr) return { data: st, revision: nr };
    row = await db.readStore(); st = row.data; rev = row.revision;
  }

  // مهاجرت ماژول‌ها فقط «یک بار» — کلید رفع پرش‌های صفحه
  if (st._mig !== C.SCHEMA) {
    if (typeof C.hwEnsure === 'function') C.hwEnsure(st);
    if (typeof C.ensureExtras === 'function') C.ensureExtras(st);
    st._mig = C.SCHEMA;
    const nr = await db.casStore(st, rev);
    if (nr) return { data: st, revision: nr };
    row = await db.readStore(); st = row.data; rev = row.revision;
  }
  return { data: st, revision: rev };
}

function repairCommand(cmd, draft) {
  const c = Object.assign({}, cmd);
  if (typeof c.type === 'string' &&
      c.type.indexOf('hw.') !== 0 && c.type.indexOf('shop.') !== 0 && c.type.indexOf('badge.') !== 0) {
    if (POLL_TYPES.includes(c.type)) { c.subType = c.type; c.type = 'poll.create'; }
    else if (ASMT_TYPES.includes(c.type)) {
      c.subType = c.type;
      c.type = (draft.assessments || []).some(a => a.id === c.id) ? 'asmt.update' : 'asmt.add';
    }
  }
  return c;
}

export async function mutateStore(cmd, session) {
  for (let i = 0; i < 6; i++) {
    const row = await ensureStore();
    const draft = C.clone(row.data);
    const fixed = repairCommand(cmd, draft);
    const out = C.applyCommand(draft, fixed, session);
    const rev = await db.casStore(out.state, row.revision);
    if (rev) return { revision: rev, state: out.state, result: out.result };
  }
  const e = new Error('سرور در حال ثبت تغییر دیگری بود؛ دوباره تلاش کنید.');
  e.status = 409; e.code = 'conflict';
  throw e;
}
