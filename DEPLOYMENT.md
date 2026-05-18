# 部署說明

這個專案是 Vite + React 靜態網站。部署時只需要 build 出 `dist/`。

## 本機 build

```bash
npm install
npm run build
```

輸出資料夾：

```text
dist/
```

## Vercel

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

本專案已提供 `vercel.json`。

## Netlify

- Build Command: `npm run build`
- Publish Directory: `dist`

本專案已提供 `netlify.toml`。

## 一般靜態主機

把 `dist/` 內的檔案上傳到網站根目錄即可。

## GitHub Pages

本專案已提供 `.github/workflows/deploy-pages.yml`，會在 push 到 `main` 時自動：

1. 安裝依賴
2. 執行 `npm run build`
3. 上傳 `dist/`
4. 部署到 GitHub Pages

到 GitHub repo 的 `Settings -> Pages`，把 `Build and deployment -> Source` 設成 `GitHub Actions`。

注意：本專案的 `vite.config.js` 使用 `base: "./"`，適合部署到 GitHub Pages 的 repo 子路徑，例如 `https://username.github.io/repo-name/`。
