# AGENTS.md

## 專案

BB Better Layout 的官方網站：落地頁、使用手冊、更新日誌、隱私權政策。用 VitePress 建置，部署在 GitHub Pages。讀者是評估要不要安裝、或已安裝需要查手冊的一般使用者，不是開發者——用詞要口語，避免術語堆疊。

## 技術棧與指令

- VitePress ^1.5.0，Node 20+
- `npm run docs:dev` — 本地開發伺服器
- `npm run docs:build` — build 到 `docs/.vitepress/dist`
- `npm run docs:preview` — 本地預覽 build 結果
- 不要手動部署。push 到 `main` 會觸發 `.github/workflows/deploy.yml` 自動 build 並上架 GitHub Pages，不需要也不應該手動跑其他部署指令。

## 目錄

- `docs/` 是站台根目錄，不是 repo 根目錄
- `docs/.vitepress/config.js` — nav、sidebar、SEO head、sitemap 設定
- `docs/public/` — 靜態資源，一律用絕對路徑引用（`/xxx.png`），不要用相對路徑
- `docs/index.md` 用 `layout: home` frontmatter，是 hero + features 版型，跟其他文件頁邏輯不同，不要套用一般 sidebar 邏輯去改它
- 其他 `.md` 是一般文件頁，側邊欄由 config.js 的 `sidebar` 手動決定，不是自動掃資料夾產生

## 內容規範

站台文案語言：English 。這是行銷/手冊頁，句子要短，假設讀者在手機上用零碎時間讀，不是坐著讀技術文件。

每頁 frontmatter 都要自己寫 `title`/`description`，不要只依賴全站預設值——這會變成 Google 搜尋摘要跟社群分享卡片的文字：

```md
---
title: 快速開始
description: 一句話講清楚這頁在教什麼
---
```

## 這幾個地方要一起改，不要只改一處

Extension ID / Chrome Web Store 連結目前會出現在：

- `docs/.vitepress/config.js`（nav 的「安裝」連結）
- `docs/index.md`（hero 的 CTA 按鈕）
- `docs/guide/getting-started.md`
- `README.md`

## Changelog 慣例

`docs/changelog.md` 新版本在上面，每個版本一個 `##` 標題：

```md
## v1.1.0 - 2026-09-15
- 新增：xxx
- 修正：xxx
```

條目寫給使用者看，不是寫給開發者看——說「修好切換分頁時設定跑掉的問題」，不要照搬 commit message 或內部術語。只有在明確被告知有新版本上架時才加條目，不要自己對照 git log 生成，這個 repo 跟 extension 本身的版本號是分開管理的。

## 

## SEO

- 每頁都要有自己的 og:image（1200x630），不要全站共用一張跟內容無關的圖
- 網域確定後在 config.js 開啟 sitemap：

```js
export default {
  sitemap: { hostname: 'https://bb.dukehsu.com' },
  lastUpdated: true // 讓 sitemap 帶 <lastmod>
}
```

- 內容語言若不是英文，記得同步設定 config.js 的 `lang`（VitePress 預設是 `en-US`；中文內容建議設成 `zh-Hant`），不然 `<html lang>` 跟實際內容語言對不上，傷 SEO 也傷螢幕閱讀器體驗

## 美化 / 視覺設計

不要照抄 VitePress 官網的預設藍配色，也不要落入現在 AI 生成設計最常見的三種樣板：暖米白配襯線字加陶土橘、近黑底配單一螢光色、或報紙式細線分欄版型。配色跟字體要從這個 extension 實際在做的事去發想，不是套公版。

透過 `docs/.vitepress/theme/` 客製，不要整個丟掉 default theme 重刻：

```js
// docs/.vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './style.css'
export default DefaultTheme
/* docs/.vitepress/theme/style.css */
:root {
  --vp-c-brand-1: #yourcolor;
  --vp-c-brand-2: #yourcolor;
}
```

首頁截圖/GIF 上傳前先壓縮，優先用 webp 或 mp4 取代大型 GIF。這是落地頁，首屏載入速度直接影響有沒有人願意往下滑。

## 完成前先跑這些

這個站沒有獨立的測試框架，`npm run docs:build` 本身就是主要的檢查手段，不要另外裝 Vitest/Jest 之類的框架，除非有明確要求：

- VitePress 預設會在有失效的內部連結時讓 build 失敗（`ignoreDeadLinks` 預設 `false`），這是故意的——不要為了讓 build 過而把它設成 `true` 蓋掉真正的問題
- build 過不代表外部連結沒壞——VitePress 只檢查站內連結，改到 Chrome Web Store、GitHub 這類外部連結要自己點一次確認
- 動到 hero、nav 或版面的改動，跑 `npm run docs:preview` 用手機寬度（375px 上下）肉眼看過一次再算做完



## 沒被要求就不要動

- `.github/workflows/deploy.yml` — 部署流程
- `docs/public/CNAME` — 網域綁定
- `docs/privacy.md` — Chrome Web Store 上架強制要求要有效存在，不要刪除或讓它變成 404

## Commit 慣例

Conventional Commits：`feat:`、`fix:`、`docs:`、`style:`、`chore:`