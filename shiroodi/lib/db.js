import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function getState() {
  const { data, error } = await supabase.from('class_store').select('data').eq('id', 'main').maybeSingle();
  if (error) throw error;
  return data?.data || null;
}

export async function setState(state) {
  const { error } = await supabase.from('class_store').upsert({
    id: 'main',
    data: state,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}

export async function getSession(token) {
  if (!token) return null;
  const { data, error } = await supabase.from('sessions').select('data, exp').eq('token', token).maybeSingle();
  if (error || !data) return null;
  if (new Date(data.exp) < new Date()) {
    await supabase.from('sessions').delete().eq('token', token);
    return null;
  }
  return data.data;
}

export async function createSession(token, data, expiresAt) {
  const { error } = await supabase.from('sessions').insert({
    token,
    data,
    exp: expiresAt.toISOString()
  });
  if (error) throw error;
}

export function getDefaultState() {
  const STUDENT_CODES = ['482915','739164','158372','627408','913547','284761','506293','841026','375194','692830','157849','430572','908316','263985','719604','385027','648913','527491','870365','146728','932584','415960','763241','298106','581493','627048','394815','850271'];
  const DEFAULT_NAMES = ['محمد حسام بازیار','عرشیا توکلی','امیرحسین جبارزاده','ارشیا جعفری','سید محمدطاها حسینی','سید مهدی حسینی','کیارش رنجبر','محمدیاسین رنجبر','مهدیار رنجبر','محمدرضا شالی کار','محمدطاها عبدی','مهراد عبدی','مهرسام عبدی','علیرضا فیاضی','امیرحسام قلی پور','محمدرایان کاظمی','حسام کاویان پور','علی اکبر کاویان پور','عرفان محرمی','یاسین محمدی','آرسن محمدی فرد','فرهام محمدیان','سید امیرعباس مرتضوی','سید علی اصغر مرتضوی','سید یاسین مرتضوی','علی اصغر مرتضوی','سهیل گودرزی','محمدطاها رحمانی'];
  const uid = () => Math.random().toString(36).slice(2,9);
  const today = new Date().toISOString().slice(0,10);

  return {
    meta: { school: 'دبستان شهید شیرودی عباس‌آباد', className: 'پایه پنجم', teacher: 'محمدباقر کالجی', year: '۱۴۰۴-۱۴۰۵', gradingMode: 'descriptive', numericMax: 20, numericMin: 0, numericThresholds: { excellent: 17, good: 14, acceptable: 10 } },
    levels: [
      { key: 'excellent', label: 'خیلی خوب', icon: '🌟', color: '#16a34a' },
      { key: 'good', label: 'خوب', icon: '✅', color: '#2563eb' },
      { key: 'acceptable', label: 'قابل قبول', icon: '👍', color: '#f59e0b' },
      { key: 'needs_effort', label: 'نیاز به تلاش', icon: '💪', color: '#ef4444' }
    ],
    subjects: ['ریاضی','علوم تجربی','فارسی','مطالعات اجتماعی','هدیه‌های آسمانی','قرآن','تربیت بدنی','هنر'],
    students: DEFAULT_NAMES.map((name, i) => ({ id: uid(), name, code: STUDENT_CODES[i] || String(Math.floor(100000+Math.random()*900000)) })),
    assessments: [], grades: {}, attendance: {}, discipline: [], groups: [], polls: [], quizzes: [],
    news: [{ id: uid(), title: 'به سامانه مدیریت کلاس خوش آمدید 🌟', body: 'دانش‌آموزان عزیز با کد اختصاصی خود وارد شوند.', date: today, pinned: true }],
    studentVisibility: { grades: true, analysis: true, group: true, discipline: true, news: true, polls: true, quizzes: true },
    antiScreenshot: true
  };
}