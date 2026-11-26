/* api/health.js — تشخیص زندهٔ سرور: کدام ماژول‌ها سالم‌اند، دیتابیس وصل است یا نه */
import { ready, manifest, ensureStore } from '../lib/store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const out = { ok: false, at: new Date().toISOString(), node: process.version, db: false, revision: null, schema: null, modules: manifest };
  try {
    const C = await ready();
    out.core = true;
    out.schemaConst = C.SCHEMA;
    out.commands = {
      homework: typeof C.hwEnsure === 'function',
      extras: typeof C.ensureExtras === 'function',
      growth: typeof C.grEnsure === 'function',
      tickets: typeof C.tkEnsure === 'function',
      market: typeof C.ecEnsure === 'function',
      marketExt: typeof C.mktEnsure === 'function',
      insco: typeof C.icoEnsure === 'function'
    };
    try {
      const row = await ensureStore();
      out.db = true;
      out.revision = row.revision;
      out.schema = row.data && row.data.schema;
      out.students = (row.data && row.data.students || []).length;
    } catch (e) {
      out.dbError = String((e && e.message) || e).slice(0, 200);
    }
    out.ok = !!(out.core && out.db);
  } catch (e) {
    out.fatal = String((e && e.message) || e).slice(0, 200);
  }
  res.status(200).json(out);
}
