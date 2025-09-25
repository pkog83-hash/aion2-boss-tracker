# 🚀 部署指南

## 部署到 Vercel（推薦）

### 步驟 1: Fork 或 Clone 倉庫
```bash
git clone https://github.com/pkog83-hash/web-buddy-deploy.git
cd web-buddy-deploy
```

### 步驟 2: 設定環境變數
在 Vercel 專案設定中添加以下環境變數：

```
VITE_SUPABASE_URL=https://wjtwzsmipmzyguljjteh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdHd6c21pcG16eWd1bGpqdGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODMyNjksImV4cCI6MjA3MzI1OTI2OX0.t90BPQh870v2ix8Mw8ypRd4DOf6ayAM3GJvSNyJYoGg
```

### 步驟 3: 一鍵部署到 Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pkog83-hash/web-buddy-deploy)

---

## 部署到 Netlify

### 步驟 1: 使用 Netlify CLI
```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 建構專案
npm run build

# 部署
netlify deploy --prod --dir=dist
```

### 步驟 2: 設定環境變數
在 Netlify 控制台設定相同的環境變數

---

## 部署到 GitHub Pages

### 步驟 1: 修改 vite.config.ts
```typescript
export default defineConfig({
  base: '/web-buddy-deploy/', // 你的倉庫名稱
  // ... 其他設定
})
```

### 步驟 2: 建構並部署
```bash
npm run build
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

---

## 重要配置資訊

### Supabase 資料庫配置
專案已配置好的 Supabase 資料庫：
- **URL**: `https://wjtwzsmipmzyguljjteh.supabase.co`
- **Table**: `boss_tracker_data`
- **功能**: 跨裝置同步王的擊殺時間

### 資料庫初始化
如需建立新的 Supabase 專案，執行 `init-boss-tracker-db.sql` 中的 SQL

### 本地測試
```bash
# 複製環境變數
cp .env.example .env

# 填入配置（使用上面提供的值）
# 編輯 .env 檔案

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

---

## 功能特色
✅ 雲端同步已配置完成
✅ 包含薩拉克斯等全部 BOSS
✅ 跨裝置資料同步
✅ 本地備援機制