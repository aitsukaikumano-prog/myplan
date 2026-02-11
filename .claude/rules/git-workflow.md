---
paths:
  - "**"
---

# Git操作ルール

## 基本原則
- **ユーザーから明示的な指示があるまで、`git add`、`git commit`、`git push` などのGitHub関連の操作は一切行わないこと。**

## リモート設定
- このリポジトリのリモートは `origin` のみ
- `git push origin main` で https://github.com/aitsukaikumano-prog/myplan.git に更新

## コミットメッセージ規則
- prefixを付ける: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- 日本語で簡潔に内容を記述
- 例: `feat: 1-A-01-1 スキル棚卸し完了`
