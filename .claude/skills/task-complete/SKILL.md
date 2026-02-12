---
name: task-complete
description: タスクを完了状態にする（成果物登録 + 3ファイル更新 + commit + push）
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

3. **成果物の登録（必須）**

   完了するタスクには必ず `outputsSummary` と `outputs` を登録する。
   既にfrontmatterに記載済みの場合はこのステップをスキップする。

   #### 3-1. outputsSummary（成果物サマリー）— 必須
   - タスクで何を達成したかの構造化サマリー
   - ユーザーに「このタスクの成果を要約してください」とヒアリングする
   - ヒアリング内容をもとに、以下の形式で `outputsSummary` を作成する:
     ```yaml
     outputsSummary: |
       【{成果物の概要タイトル}】
       ■ {カテゴリ1}
       {箇条書きで内容}
       ■ {カテゴリ2}
       {箇条書きで内容}
     ```
   - **参考（1-C-03-1の例）**:
     ```yaml
     outputsSummary: |
       【Cowork最新情報レポート（198行・7セクション構成）】
       ■ 基本機能（8項目）
       ファイル操作、ドキュメント作成、データ抽出...
       ■ 活用事例（8件）
       ① ファイル整理（700個を1分で7カテゴリに分類）...
     ```

   #### 3-2. outputs（成果物ファイル）— 必須確認
   - ユーザーに「成果物ファイルはありますか？（ドキュメント、画像、動画、コード等）」と確認する
   - **ファイルがある場合**: 各ファイルを以下の形式で登録する:
     ```yaml
     outputs:
       - file: "docs/{ファイル名}"
         title: "{成果物タイトル}"
         summary: "{1行で概要}"
     ```
   - **ファイルがない場合**: ユーザーが「ファイル成果物なし」と明言した場合のみ `outputs: []` を許可する
   - 成果物ファイルが `github_sim3/docs/` 配下に存在しない場合は、ファイル配置もこのステップで行う

4. **issues.yaml の更新**
   - `github_sim3/issues.yaml` を読み込む
   - 該当タスクID（`$ARGUMENTS`）の `status` を `"completed"` に変更する
   - 該当タスクIDが見つからない場合はエラーを報告して終了する

5. **tasks/{id}.md の更新**
   - frontmatterに以下を追加/更新:
     - `completedDate: "YYYY-MM-DD"`（今日の日付）
     - `outputsSummary: |`（手順3で作成したサマリー）
     - `outputs:`（手順3で確認した成果物リスト）
   - `## メモ` セクションに以下を追記:
     ```
     ### YYYY-MM-DD 完了
     - /task-complete で完了処理実行
     ```

6. **Git操作**
   - `git add github_sim3/issues.yaml github_sim3/tasks/$ARGUMENTS.md`
   - 成果物ファイルがある場合はそれも `git add` する
   - コミットメッセージはHEREDOC形式で:
     ```bash
     git commit -m "$(cat <<'EOF'
     feat: $ARGUMENTS {タスクタイトル} 完了（{成果物の簡潔な説明}）

     Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
     EOF
     )"
     ```
   - `git push origin main`

7. **UI確認の案内**
   - ユーザーに「ブラウザをリロード（Cmd+Shift+R）して完了バッジとキラキラ表示を確認してください」と伝える
