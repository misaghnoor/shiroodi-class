/* lib/store.js — مقدارگذاری اولیه و اعمال فرمان با تلاش مجدد */
import '../core.js';
import * as db from './db.js';

const C = globalThis.ClassCore;

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
    return await db.readStore();
  }
  return row;
}

export async function mutateStore(cmd, session) {
  for (let i = 0; i < 6; i++) {
    const row = await ensureStore();
    const draft = C.clone(row.data);
    const out = C.applyCommand(draft, cmd, session);
    const rev = await db.casStore(out.state, row.revision);
    if (rev) return { revision: rev, state: out.state, result: out.result };
  }
  const e = new Error('سرور در حال ثبت تغییر دیگری بود؛ دوباره تلاش کنید.');
  e.status = 409; e.code = 'conflict';
  throw e;
}