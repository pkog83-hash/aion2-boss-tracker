-- 🔍 快速檢查腳本：驗證 Supabase 資料庫設定

-- 1️⃣ 檢查資料表是否存在
SELECT
    '✅ 資料表存在' as status,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'boss_tracker_data'
UNION ALL
SELECT
    '❌ 資料表不存在' as status,
    'boss_tracker_data' as table_name,
    'N/A' as table_type
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'boss_tracker_data'
);

-- 2️⃣ 檢查唯一約束是否存在
SELECT
    '✅ 唯一約束已設定' as status,
    tc.constraint_name,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_name = 'boss_tracker_data'
GROUP BY tc.constraint_name
UNION ALL
SELECT
    '❌ 唯一約束不存在' as status,
    'N/A' as constraint_name,
    'group_name, boss_name' as columns
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'UNIQUE'
      AND table_name = 'boss_tracker_data'
);

-- 3️⃣ 檢查索引是否存在
SELECT
    '📊 索引狀態' as category,
    indexname as index_name,
    tablename as table_name
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'boss_tracker_data'
ORDER BY indexname;

-- 4️⃣ 檢查資料表權限
SELECT
    '🔐 權限狀態' as category,
    grantee,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'boss_tracker_data'
GROUP BY grantee;

-- 5️⃣ 檢查 Row Level Security 狀態
SELECT
    CASE
        WHEN relrowsecurity THEN '⚠️ RLS 已啟用 (應該停用)'
        ELSE '✅ RLS 已停用'
    END as status,
    relname as table_name
FROM pg_class
WHERE relname = 'boss_tracker_data'
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 6️⃣ 統計現有資料
SELECT
    '📈 資料統計' as category,
    COUNT(*) as total_records,
    COUNT(DISTINCT group_name) as total_groups,
    COUNT(DISTINCT boss_name) as total_bosses,
    COUNT(CASE WHEN last_killed IS NOT NULL THEN 1 END) as bosses_with_kill_time
FROM public.boss_tracker_data;

-- 7️⃣ 最近更新的記錄 (最多 5 筆)
SELECT
    '🕒 最近更新' as category,
    group_name,
    boss_name,
    last_killed,
    updated_at
FROM public.boss_tracker_data
ORDER BY updated_at DESC
LIMIT 5;
