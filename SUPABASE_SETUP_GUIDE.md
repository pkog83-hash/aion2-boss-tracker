# 📘 Supabase 資料庫設定完整指南

## 方法一: 圖形化介面設定 (推薦新手)

### 步驟 1: 登入 Supabase
1. 前往 https://supabase.com/dashboard
2. 使用你的帳號登入
3. 選擇專案: `wjtwzsmipmzyguljjteh`

### 步驟 2: 開啟 SQL Editor
1. 在左側選單找到 **SQL Editor** 🔧
2. 點擊 **New Query** 建立新查詢

### 步驟 3: 檢查資料表是否存在
複製並執行以下 SQL:

```sql
-- 檢查資料表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'boss_tracker_data';
```

#### 結果判斷:
- **有結果** → 資料表已存在,跳到步驟 4
- **無結果** → 資料表不存在,執行步驟 3.1

### 步驟 3.1: 建立資料表(如果不存在)
複製專案中的 `init-boss-tracker-db.sql` 內容,在 SQL Editor 中執行:

```sql
CREATE TABLE IF NOT EXISTS public.boss_tracker_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_name TEXT NOT NULL,
    boss_name TEXT NOT NULL,
    respawn_minutes INTEGER NOT NULL,
    last_killed TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_name, boss_name)
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_boss_tracker_data_group_name
    ON public.boss_tracker_data(group_name);

CREATE INDEX IF NOT EXISTS idx_boss_tracker_data_boss_name
    ON public.boss_tracker_data(boss_name);

-- 授予權限
ALTER TABLE public.boss_tracker_data DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.boss_tracker_data TO authenticated;
GRANT ALL ON public.boss_tracker_data TO anon;
```

### 步驟 4: 檢查唯一約束是否存在
執行以下 SQL 檢查:

```sql
-- 檢查唯一約束
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_name = 'boss_tracker_data'
ORDER BY kcu.ordinal_position;
```

#### 預期結果:
```
constraint_name                          | table_name         | column_name
-----------------------------------------|--------------------|--------------
boss_tracker_data_group_name_boss_name_key | boss_tracker_data  | group_name
boss_tracker_data_group_name_boss_name_key | boss_tracker_data  | boss_name
```

### 步驟 5: 如果約束不存在,手動建立

```sql
-- 建立唯一約束
ALTER TABLE public.boss_tracker_data
ADD CONSTRAINT boss_tracker_data_group_boss_unique
UNIQUE (group_name, boss_name);
```

### 步驟 6: 驗證設定
執行以下測試:

```sql
-- 測試插入資料
INSERT INTO public.boss_tracker_data
    (group_name, boss_name, respawn_minutes, last_killed, updated_at)
VALUES
    ('測試群組', '測試BOSS', 120, NOW(), NOW())
ON CONFLICT (group_name, boss_name)
DO UPDATE SET
    updated_at = NOW();

-- 查詢資料
SELECT * FROM public.boss_tracker_data
WHERE group_name = '測試群組';

-- 清理測試資料
DELETE FROM public.boss_tracker_data
WHERE group_name = '測試群組';
```

如果以上都沒報錯,表示設定成功! ✅

---

## 方法二: 使用 CLI 工具設定 (進階)

### 前置需求
```bash
# 安裝 Supabase CLI
npm install -g supabase
```

### 步驟 1: 連線到專案
```bash
# 設定專案連線
supabase link --project-ref wjtwzsmipmzyguljjteh
```

### 步驟 2: 執行 SQL 檔案
```bash
# 在專案目錄執行
cd "C:\Users\Admin\軟體專案\天2M王表"

# 執行初始化 SQL
supabase db push --include-all

# 或使用 psql 執行
psql -h wjtwzsmipmzyguljjteh.supabase.co -U postgres -d postgres -f init-boss-tracker-db.sql
```

---

## 方法三: 直接在 Table Editor 建立 (最簡單)

### 步驟 1: 開啟 Table Editor
1. Supabase Dashboard → 左側選單 **Table Editor**
2. 點擊 **New Table** (如果表不存在)

### 步驟 2: 設定資料表結構
- **Table name**: `boss_tracker_data`
- **Enable Row Level Security**: 取消勾選

### 步驟 3: 新增欄位

| Name             | Type                      | Default Value        | Nullable | Unique |
|------------------|---------------------------|----------------------|----------|--------|
| id               | uuid                      | gen_random_uuid()    | ❌       | ✅     |
| group_name       | text                      | -                    | ❌       | ❌     |
| boss_name        | text                      | -                    | ❌       | ❌     |
| respawn_minutes  | int4                      | -                    | ❌       | ❌     |
| last_killed      | timestamptz               | -                    | ✅       | ❌     |
| created_at       | timestamptz               | now()                | ❌       | ❌     |
| updated_at       | timestamptz               | now()                | ❌       | ❌     |

### 步驟 4: 設定唯一約束
1. 在 Table Editor 中找到 `boss_tracker_data` 表
2. 點擊右上角 **⚙️ Settings**
3. 找到 **Constraints** 區塊
4. 點擊 **Add Constraint**
5. 選擇 **Unique**
6. 選擇欄位: `group_name` 和 `boss_name`
7. 約束名稱: `boss_tracker_data_group_boss_unique`
8. 點擊 **Save**

---

## 驗證設定是否成功

### 在應用程式中測試
1. 開啟應用程式: http://localhost:8080/
2. 選擇任一群組
3. 記錄一個 Boss 擊殺時間
4. 開啟 F12 → Console
5. 看到訊息: `✅ Synced X bosses to cloud for group: XXX`
6. 重新整理頁面,確認時間沒有被重置

### 常見錯誤排除

#### 錯誤: "duplicate key value violates unique constraint"
✅ **正常!** 這表示唯一約束已生效

#### 錯誤: "null value in column violates not-null constraint"
❌ 檢查是否所有必填欄位都有值

#### 錯誤: "permission denied for table boss_tracker_data"
❌ 執行權限設定 SQL:
```sql
ALTER TABLE public.boss_tracker_data DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.boss_tracker_data TO anon;
```

#### 沒有錯誤但資料沒同步
1. 檢查 `.env` 或環境變數是否正確設定
2. 檢查 Console 是否有錯誤訊息
3. 確認網路連線正常

---

## 快速確認清單

- [ ] Supabase 專案已建立
- [ ] `boss_tracker_data` 資料表已建立
- [ ] 唯一約束 `UNIQUE(group_name, boss_name)` 已設定
- [ ] Row Level Security 已停用
- [ ] `anon` 角色有讀寫權限
- [ ] `.env.production` 中的 URL 和 Key 正確
- [ ] 應用程式可以成功同步資料

全部打勾就代表設定完成! 🎉

---

## 需要協助?

如果遇到問題:
1. 查看瀏覽器 Console (F12) 的錯誤訊息
2. 查看 Supabase Dashboard → Logs
3. 參考 `SYNC_FIX_GUIDE.md` 了解同步機制
