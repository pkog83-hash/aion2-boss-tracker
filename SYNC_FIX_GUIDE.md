# 🔧 雲端同步衝突修復指南

## 問題說明
之前的同步機制使用「先刪除再插入」策略,容易造成以下問題:
1. 多個裝置同時操作時資料互相覆蓋
2. 刪除和插入之間有時間間隙,其他用戶可能讀取到空資料
3. 網路延遲時可能造成資料遺失

## 解決方案

### 1️⃣ **UPSERT 策略**
- **改變**: 從 `DELETE + INSERT` 改為 `UPSERT`
- **優點**:
  - 原子操作,不會有中間狀態
  - 自動處理插入/更新,避免資料衝突
  - 使用 `group_name,boss_name` 作為唯一鍵

```typescript
// 舊方法 (有問題)
await supabase.from(table).delete().eq('group_name', group)
await supabase.from(table).insert(records)

// 新方法 (安全)
await supabase.from(table).upsert(records, {
  onConflict: 'group_name,boss_name',
  ignoreDuplicates: false
})
```

### 2️⃣ **樂觀鎖定 (Optimistic Locking)**
- **改變**: 添加 `syncLock` 機制
- **優點**:
  - 防止同一裝置多次並發同步
  - 自動排隊處理同步請求
  - 避免重複寫入

```typescript
private syncLock: Promise<boolean> | null = null

async syncToCloud(data) {
  if (this.syncLock) {
    await this.syncLock  // 等待前一次同步完成
  }
  this.syncLock = this.performSync(data)
  // ...
}
```

### 3️⃣ **詳細日誌**
- 新增 console.log 追蹤同步狀態
- 可在瀏覽器 F12 Console 查看同步情況

## 資料庫要求

⚠️ **重要**: Supabase 資料表需要設定唯一索引

```sql
-- 確保有此唯一約束
ALTER TABLE boss_tracker_data
ADD CONSTRAINT boss_tracker_data_group_boss_unique
UNIQUE (group_name, boss_name);
```

如果資料庫沒有此約束,需要先建立才能使用 UPSERT。

## 測試方法

### 單一裝置測試
1. 開啟瀏覽器 F12 → Console
2. 記錄一個 Boss 擊殺時間
3. 觀察 Console 是否出現: `✅ Synced X bosses to cloud for group: XXX`
4. 重新整理頁面,確認時間沒有被重置

### 多裝置測試
1. 在兩個不同瀏覽器/裝置開啟同一個群組
2. 裝置 A: 記錄 Boss A 的時間
3. 裝置 B: 同時記錄 Boss B 的時間
4. 兩邊重新整理,確認兩筆記錄都存在

### 並發測試
1. 快速連續點擊多個 Boss 的「記錄」按鈕
2. 觀察 Console 是否出現 "Sync already in progress, waiting..."
3. 確認所有記錄都成功儲存

## 預期效果

### ✅ 改進後
- 多裝置同時更新不會互相覆蓋
- 更新是原子操作,不會有中間狀態
- 同一裝置的並發請求會自動排隊
- 資料遺失機率大幅降低

### ⚠️ 仍需注意
- 網路斷線時仍會使用 localStorage 備份
- 兩個裝置同時更新同一個 Boss 時,後寫入的會覆蓋先寫入的 (正常行為)
- 如果 Supabase 權限設定錯誤,仍可能同步失敗

## 故障排除

### 如果出現 "Upsert error"
1. 檢查 Supabase 是否有 `group_name,boss_name` 唯一約束
2. 檢查資料表權限設定 (RLS)
3. 查看完整錯誤訊息

### 如果資料仍被重置
1. 檢查 localStorage: F12 → Application → Local Storage
2. 檢查是否有多個視窗同時開啟相同群組
3. 檢查網路連線狀態
4. 查看 Console 是否有其他錯誤訊息

## 檔案變更清單
- `src/services/bossDataService.ts` - 主要修改檔案

## 相關連結
- [Supabase Upsert 文檔](https://supabase.com/docs/reference/javascript/upsert)
- [樂觀鎖定模式](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)
