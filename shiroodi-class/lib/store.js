/* lib/store.js — بارگذاری ایمن ماژول‌ها؛ نبودِ هیچ فایلی هرگز سرور را از کار نمی‌اندازد */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as db from './db.js';

const HERE = dirname(fileURLToPath(import.meta.url));

const LOADERS = [
  { name: 'core',      file: 'core.js',            required: true,  load: () => import('../core.js') },
  { name: 'homework',  file: 'homework-core.js',   required: false, load: () => import('../homework-core.js') },
  { name: 'extras',    file: 'extras-core.js',     required: false, load: () => import('../extras-core.js') },
  { name: 'growth',    file: 'growth-core.js',     required: false, load: () => import('../growth-core.js') },
  { name: 'tickets',   file: 'tickets-core.js',    required: false, load: () => import('../tickets-core.js') },
  { name: 'market',    file: 'market-core.js',     required: false, load: () => import('../market-core.js') },
  { name: 'marketExt', file: 'market-ext-core.js', required: false, load: () => import('../market-ext-core.js') },
  { name: 'insco',     file: 'insco-core.js',      required: false, load: () => import('../insco-core.js') }
];

export const manifest = { loaded: [], missing: [], errors: [], at: null, booted: false };
let bootPromise = null;

async function boot() {
  for (const m of LOADERS) {
    const path = join(HERE, '..', m.file);
    if (!existsSync(path)) {
      (m.required ? manifest.errors : manifest.missing).push({ name: m.name, file: m.file, message: 'فایل در مخزن نیست' });
      continue;
    }
    try { await m.load(); manifest.loaded.push(m.name); }
    catch (e) {
      const info = { name: m.name, file: m.file, message: String((e && e.message) || e).slice(0, 200) };
      (m.required ? manifest.errors : manifest.missing).push(info);
    }
  }
  manifest.at = new Date().toISOString();
  manifest.booted = true;
  const C = globalThis.ClassCore;
  if (!C || typeof C.applyCommand !== 'function' || typeof C.buildSeed !== 'function') {
    const e = new Error('هستهٔ سامانه (core.js) سالم بارگذاری نشد.');
    e.status = 500; e.code = 'core_missing';
    throw e;
  }
  return C;
}

export function ready() {
  if (!bootPromise) bootPromise = boot().catch(err => { bootPromise = null; throw err; });
  return bootPromise;
}

const ENSURES = ['hwEnsure', 'ensureExtras', 'grEnsure', 'tkEnsure', 'ecEnsure', 'mktEnsure', 'icoEnsure'];
function runEnsures(st) {
  const C = globalThis.ClassCore;
  for (const fn of ENSURES) {
    try { if (typeof C[fn] === 'function') C[fn](st); } catch (e) { /* یک ماژول خراب، بقیه را نمی‌خواباند */ }
  }
}

const POLL_TYPES = ['choice', 'multi', 'yesno', 'rating', 'election'];
const ASMT_TYPES = ['oral', 'written', 'performance', 'homework'];
const OWN = ['hw.', 'shop.', 'badge.', 'gr.', 'tk.', 'econ.', 'mkt.', 'ico.'];

export async function ensureStore() {
  const C = await ready();
  let row = await db.readStore();
  if (!row) {
    await db.insertStore(C.buildSeed());
    row = await db.readStore();
    if (!row) { const e = new Error('راه‌اندازی دیتابیس ناموفق بود.'); e.status = 500; e.code = 'db_init'; throw e; }
  }
  let st = row.data, rev = row.revision;

  if (!st || st.schema !== C.SCHEMA) {
    st = C.normalize(st);
    runEnsures(st);
    st._mig = C.SCHEMA;
    const nr = await db.casStore(st, rev);
    if (nr) return { data: st, revision: nr };
    row = await db.readStore(); st = row.data; rev = row.revision;
  }

  if (st._mig !== C.SCHEMA) {
    runEnsures(st);
    st._mig = C.SCHEMA;
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
    else if (ASMT_TYPES.includes(c.type)) {
      c.subType = c.type;
      c.type = (draft.assessments || []).some(a => a.id === c.id) ? 'asmt.update' : 'asmt.add';
    }
  }
  return c;
}

function normalizeError(e, cmd) {
  if (e && typeof e.status === 'number') return e;
  const raw = String((e && e.message) || e || '');
  const err = new Error(
    /unknown|ناشناخته/i.test(raw)
      ? 'این بخش روی سرور فعال نیست؛ فایل ماژولش در مخزن نصب نشده است.'
      : 'سرور نتوانست این تغییر را پردازش کند.'
  );
  err.status = /unknown|ناشناخته/i.test(raw) ? 400 : 500;
  err.code = /unknown|ناشناخته/i.test(raw) ? 'unknown_command' : 'module_error';
  err.detail = raw.slice(0, 200);
  err.command = cmd && cmd.type;
  return err;
}

export async function mutateStore(cmd, session) {
  const C = await ready();
  for (let i = 0; i < 6; i++) {
    const row = await ensureStore();
    const draft = C.clone(row.data);
    let out;
    try { out = C.applyCommand(draft, repair(cmd, draft), session); }
    catch (e) { throw normalizeError(e, cmd); }
    const rev = await db.casStore(out.state, row.revision);
    if (rev) return { revision: rev, state: out.state, result: out.result };
  }
  const e = new Error('سرور در حال ثبت تغییر دیگری بود؛ دوباره تلاش کنید.');
  e.status = 409; e.code = 'conflict';
  throw e;
}
