---
paths:
  - "mazda-sync-app/**"
---

# Reactアプリ規則

## 技術スタック
- Vite + React + TypeScript
- Tailwind CSS
- GitHub Pages でデプロイ

## コーディング規則
- コンポーネントは関数コンポーネント + hooks を使用
- TypeScriptの型は明示的に定義する
- Tailwind CSSでスタイリング（外部CSSファイルは最小限に）
- ファイル名はPascalCase（コンポーネント）、camelCase（ユーティリティ）

## ビルド・デプロイ
- `npm run dev` — 開発サーバー起動
- `npm run build` — プロダクションビルド
- ビルド成果物は `dist/` に出力
