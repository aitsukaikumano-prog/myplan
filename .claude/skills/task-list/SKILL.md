---
name: task-list
description: タスクツリーを表示する（フィルタリング・集計付き）
argument-hint: "[フィルタ: open/completed/all]"
---

# タスク一覧表示スキル

issues.yamlを読み込んで、タスクツリーを見やすく表示する。
引数でフィルタリング可能（デフォルト: open）。

## 引数
- `$ARGUMENTS` が空 or `open` → 未完了タスクのみ表示
- `$ARGUMENTS` が `completed` → 完了タスクのみ表示
- `$ARGUMENTS` が `all` → 全タスク表示
- `$ARGUMENTS` が戦略番号（例: `1` `2` `3`）→ 該当戦略のみ表示

## 手順

1. **issues.yaml を読み込む**
   - `github_sim3/issues.yaml` を読み込む

2. **フィルタリング**
   - 引数に基づいてタスクをフィルタリングする

3. **ツリー形式で表示**
   - 以下の形式で表示する:
     ```
     ## 戦略1: {タイトル}

     ### A: {カテゴリタイトル}
       📋 1-A-01: {Issueタイトル}
         ✅ 1-A-01-1: {タスクタイトル} (completed)
         🔵 1-A-01-2: {タスクタイトル} (open)
         🟡 1-A-01-3: {タスクタイトル} (in-progress)
     ```
   - ステータスに応じたアイコン:
     - `completed` → ✅
     - `open` → 🔵
     - `in-progress` → 🟡

4. **集計を表示**
   - 最後に集計を表示する:
     ```
     ---
     📊 集計: 完了 X / 進行中 Y / 未着手 Z / 合計 N
     📈 進捗率: XX%
     ```
