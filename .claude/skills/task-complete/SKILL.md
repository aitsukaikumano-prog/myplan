---
name: task-complete
description: タスクを完了状態にする（3ファイル更新 + commit + push）
argument-hint: "[タスクID]"
---

# タスク完了スキル

指定されたタスクを完了状態にし、必要なファイル更新とGit操作を行う。
タスクIDは `$ARGUMENTS` で渡される（例: `/task-complete 1-A-01-1`）。

> **注意**: このスキルの呼び出し自体がユーザーのGit操作への明示的同意とみなす。
> git-workflowルールとの矛盾はない。

## 手順

1. **引数の検証**
   - `$ARGUMENTS` が空の場合、ユーザーにタスクIDの入力を求めて終了する
   - タスクIDの形式（`{数字}-{英字}-{数字2桁}-{数字}`）を確認する

2. **完了条件の確認**
   - `github_sim3/tasks/$ARGUMENTS.md` を読み込む
   - ファイルが存在しない場合はエラーを報告して終了する
   - `successCriteria` の各項目が満たされているか確認する
   - 満たされていない項目がある場合はユーザーに報告し、処理を中断する

3. **issues.yaml の更新**
   - `github_sim3/issues.yaml` を読み込む
   - 該当タスクID（`$ARGUMENTS`）の `status` を `"completed"` に変更する
   - 該当タスクIDが見つからない場合はエラーを報告して終了する

4. **tasks/{id}.md の更新**
   - frontmatterに `completedDate: "YYYY-MM-DD"` を追加（今日の日付）
   - `## メモ` セクションに以下を追記:
     ```
     ### YYYY-MM-DD 完了
     - /task-complete で完了処理実行
     ```

5. **Git操作**
   - `git add github_sim3/issues.yaml github_sim3/tasks/$ARGUMENTS.md`
   - コミットメッセージはHEREDOC形式で:
     ```bash
     git commit -m "$(cat <<'EOF'
     feat: $ARGUMENTS 完了

     Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
     EOF
     )"
     ```
   - `git push origin main`

6. **UI確認の案内**
   - ユーザーに「ブラウザをリロード（Cmd+Shift+R）して完了バッジとキラキラ表示を確認してください」と伝える
