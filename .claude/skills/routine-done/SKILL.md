---
name: routine-done
description: ルーティーンを完了記録する（routine-logs.yaml更新）
argument-hint: "[ルーティンID...]"
---

# ルーティーン完了スキル

指定されたルーティーンの今日の完了記録を `github_sim3/routine-logs.yaml` に追加する。
ルーティンIDは `$ARGUMENTS` で渡される（例: `/routine-done R-01 R-02`）。

## 手順

1. **引数の解析**
   - `$ARGUMENTS` をスペース区切りでルーティンIDリストとして解析する
   - 引数が空の場合、`github_sim3/routines.yaml` を読み込み、全ルーティン一覧を表示して「どれを完了にしますか？」と聞く

2. **ルーティンIDの検証**
   - `github_sim3/routines.yaml` を読み込む
   - 指定された各IDが存在するか確認する
   - 存在しないIDがあればエラーを報告して終了する

3. **重複チェック**
   - `github_sim3/routine-logs.yaml` を読み込む
   - 今日の日付（YYYY-MM-DD形式）で既に完了記録がある場合、そのIDをスキップしてユーザーに通知する

4. **ログ更新**
   - `github_sim3/routine-logs.yaml` の各ルーティンIDのセクションに今日の日付エントリを追加する:
     ```yaml
     R-XX:
       "YYYY-MM-DD":
         completed: true
     ```
   - 該当ルーティンIDのセクションがまだ存在しない場合は新規作成する

5. **結果報告**
   - 更新したルーティンを一覧表示する
   - 「ダッシュボードをリロードすれば反映されます」と伝える
   - **Git操作は行わない**（`/commit-push` で別途まとめてコミットしてもらう）
