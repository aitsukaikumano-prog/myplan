---
paths:
  - "github_sim3/**"
---

# タスク管理ルール

## データ構造
- `github_sim3/issues.yaml` - ツリー構造 + ステータス管理（軽量）
- `github_sim3/tasks/{id}.md` - タスク詳細（Markdown + Frontmatter）
- `github_sim3/docs/` - 成果物ファイル

## タスクID命名規則
- ツリー構造に従う: `{戦略}-{カテゴリ}-{Issue}-{連番}`
- 例: `1-A-01-1`, `2-B-02-3`

## タスク作成ワークフロー
1. ツリー表示を見て追加場所を確認
2. `issues.yaml` にタスク追加（id, title, status）
3. `tasks/{id}.md` を作成（詳細情報）
4. `tasks/index.yaml` にファイル名を追加

## 更新ルール
| 操作 | 更新対象 |
|------|----------|
| タスク追加 | issues.yaml + tasks/{id}.md + tasks/index.yaml |
| ステータス変更 | issues.yaml のみ |
| 詳細・成果物追加 | tasks/{id}.md のみ |

## タスク完了チェックリスト

タスクを完了にする際は、以下を**すべて**実行すること：

1. **完了条件の確認**
   - `tasks/{id}.md` の `successCriteria` をすべて満たしているか確認

2. **ファイル更新**（3箇所）
   - [ ] `issues.yaml` の `status` を `"completed"` に変更
   - [ ] `tasks/{id}.md` に `completedDate: "YYYY-MM-DD"` を追加
   - [ ] `tasks/{id}.md` のメモに完了記録を追記

3. **コミット・プッシュ**
   - [ ] `git add` → `git commit` → `git push origin main`

4. **UI確認**
   - [ ] ブラウザをリロード（Cmd+Shift+R）
   - [ ] タスク検索画面で「完了」バッジが表示されることを確認
   - [ ] ツリー表示で完了ボタンON時にキラキラ表示されることを確認

## タスク詳細ファイルの形式
```markdown
---
successCriteria:
  - "完了条件1"
  - "完了条件2"
completedDate: "2026-01-13"
outputs:
  - file: "docs/xxx.md"
    title: "成果物タイトル"
    summary: "成果物のサマリ"
---

## 詳細説明

タスクの詳細説明をここに記載。

## メモ

作業メモをここに記載。
```
