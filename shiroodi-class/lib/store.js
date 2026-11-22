/* lib/store.js — مقدارگذاری اولیه، مهاجرت ماژول‌ها و اعمال فرمان با تلاش مجدد */
import '../core.js';
import '../homework-core.js';
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
  if (!row.data || row.data.schema !== C.SCHEMA) {
    const st = C.normalize(row.data);
    const rev = await db.casStore(st, row.revision);
    if (rev) return { data: st, revision: rev };
    row = await db.readStore();
    if (!row) throw new Error('خواندن دیتابیس ناموفق بود.');
  }
  if (typeof C.hwEnsure === 'function' && C.hwEnsure(row.data)) {
    const rev = await db.casStore(row.data, row.revision);
    if (rev) return { data: row.data, revision: rev };
    const again = await db.readStore();
    if (again) return again;
  }
  return row;
}

function repairCommand(cmd, draft) {
  const c = Object.assign({}, cmd);
  if (typeof c.type === 'string' && c.type.indexOf('hw.') !== 0) {
    if (POLL_TYPES.includes(c.type)) {
      c.subType = c.type;
      c.type = 'poll.create';
    } else if (ASMT_TYPES.includes(c.type)) {
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
    if (fixed.subType) fixed.type = fixed.type;
    const out = C.applyCommand(draft, fixed, session);
    const rev = await db.casStore(out.state, row.revision);
    if (rev) return { revision: rev, state: out.state, result: out.result };
  }
  const e = new Error('سرور در حال ثبت تغییر دیگری بود؛ دوباره تلاش کنید.');
  e.status = 409; e.code = 'conflict';
  throw e;
}
