// lib/db.js
import { createClient } from '@supabase/supabase-js';

let client = null;
function sb() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error('متغیرهای SUPABASE_URL و SUPABASE_SERVICE_KEY تنظیم نشده‌اند.');
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

export async function getState() {
  const { data, error } = await sb().from('class_store').select('data').eq('id', 'main').maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

export async function setState(state) {
  const { error } = await sb().from('class_store').upsert({
    id: 'main',
    data: state,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}

export async function getSession(token) {
  if (!token) return null;
  const { data, error } = await sb().from('sessions').select('data, exp').eq('token', token).maybeSingle();
  if (error || !data) return null;
  if (new Date(data.exp).getTime() < Date.now()) {
    await sb().from('sessions').delete().eq('token', token);
    return null;
  }
  return data.data;
}

export async function createSession(token, data, expiresAt) {
  const { error } = await sb().from('sessions').insert({ token, data, exp: expiresAt.toISOString() });
  if (error) throw error;
}

export async function deleteSession(token) {
  if (!token) return;
  await sb().from('sessions').delete().eq('token', token);
}

export async function purgeExpiredSessions() {
  await sb().from('sessions').delete().lt('exp', new Date().toISOString());
}
