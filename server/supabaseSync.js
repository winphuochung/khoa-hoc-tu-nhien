import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://cclporgmzhtaskzuydzv.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbHBvcmdtemh0YXNrenV5ZHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzQ5MDYxNCwiZXhwIjoyMTA5MDY2NjE0fQ.slYv3oM1NuqkKVABJ38WhUTZBNOnHLnMXleqvUmX9f0';

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET_NAME = 'khtn_database';
const OBJECT_NAME = 'khtn_dynamic_db.json';

let bucketEnsured = false;
async function ensureBucket() {
  if (bucketEnsured) return;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = Array.isArray(buckets) && buckets.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, { public: false });
    }
    bucketEnsured = true;
  } catch (err) {
    // Non-fatal if already exists or permission
    bucketEnsured = true;
  }
}

/**
 * Tải dữ liệu động mới nhất từ Supabase Cloud Storage (bỏ qua CDN cache)
 */
export async function pullFromSupabase() {
  try {
    await ensureBucket();
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${OBJECT_NAME}?t=${Date.now()}`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
    if (!res.ok) {
      return null;
    }
    const parsed = await res.json();
    console.log(
      '[Supabase] Tải thành công dữ liệu đám mây (Exams:',
      parsed.exams?.length || 0,
      ', Users:',
      parsed.users?.length || 0,
      ')'
    );
    return parsed;
  } catch (err) {
    console.warn('[Supabase] Không thể kéo dữ liệu từ Supabase (dùng cache local):', err?.message || err);
    return null;
  }
}

let pushTimeout = null;
let isPushing = false;
let pendingPushData = null;

/**
 * Đồng bộ dữ liệu động lên Supabase Cloud Storage
 */
export function pushToSupabase(dbCache, immediate = false) {
  if (!dbCache) return;

  const dynamicPayload = {
    schoolConfig: dbCache.schoolConfig,
    users: dbCache.users,
    sessions: dbCache.sessions,
    exams: dbCache.exams,
    submissions: dbCache.submissions,
    studentProgress: dbCache.studentProgress,
    customQuestions: (dbCache.questions || []).filter(
      (q) => String(q.id).startsWith('q-custom-') || String(q.id).startsWith('q-bulk-')
    ),
    syncedAt: new Date().toISOString(),
  };

  pendingPushData = dynamicPayload;

  const executePush = async () => {
    if (isPushing || !pendingPushData) return;
    isPushing = true;
    const payloadToSend = pendingPushData;
    pendingPushData = null;

    try {
      await ensureBucket();
      const jsonStr = JSON.stringify(payloadToSend);
      const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).upload(OBJECT_NAME, jsonStr, {
        contentType: 'application/json',
        upsert: true,
      });
      if (error) {
        console.warn('[Supabase] Lỗi đồng bộ đám mây:', error.message);
      } else {
        console.log('[Supabase] Đã đồng bộ lên đám mây thành công lúc', new Date().toLocaleTimeString('vi-VN'));
      }
    } catch (err) {
      console.warn('[Supabase] Lỗi kết nối Supabase:', err?.message || err);
    } finally {
      isPushing = false;
      if (pendingPushData) {
        // If another save came in while pushing, schedule it
        setTimeout(executePush, 500);
      }
    }
  };

  if (immediate) {
    if (pushTimeout) clearTimeout(pushTimeout);
    executePush();
  } else {
    if (pushTimeout) clearTimeout(pushTimeout);
    pushTimeout = setTimeout(executePush, 1000);
  }
}
