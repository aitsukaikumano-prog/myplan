# Anthropic Claude Cowork 最新情報まとめ

作成日: 2026-02-10
タスク: 1-C-03-1

---

## 1. Coworkとは

2026年1月12日にAnthropicがリサーチプレビューとして発表したエージェント型AIツール。
従来のチャット型の質問応答ではなく、ユーザーのPC上のファイルに直接アクセスし、複雑なタスクを自律的に計画・実行する「デジタル同僚」。

> 「会話のやり取りというより、同僚にメッセージを残す感覚に近い」— Anthropic公式

---

## 2. 基本機能

| 機能カテゴリ | できること |
|---|---|
| **ファイル操作** | 指定フォルダ内のファイル読取・編集・作成・整理・リネーム |
| **ドキュメント作成** | レポート草稿、メモからの文書生成、プレゼン資料作成 |
| **データ抽出** | レシート・名刺のスクリーンショットからスプレッドシート作成 |
| **リサーチ統合** | 複数ソースからの情報収集・統合・要約 |
| **ブラウザ操作** | Chrome拡張「Claude in Chrome」と連携しWeb操作も可能 |
| **マルチステップ実行** | タスクを受けると自動で計画→段階的に実行→進捗報告 |
| **並列サブタスク** | 複数のサブタスクを並列で実行可能 |
| **外部ツール連携** | MCP経由でCRM、プロジェクト管理ツール等と接続 |

---

## 3. 利用条件

| プラン | 月額 | 備考 |
|---|---|---|
| **Pro** | $20/月（約3,000円） | 2026/1/16から利用可能。利用制限に早く到達する可能性あり |
| **Max 5x** | $100/月 | 5時間あたり約225メッセージ以上 |
| **Max 20x** | $200/月 | 5時間あたり約900メッセージ以上 |
| **Team / Enterprise** | 要問合せ | 利用可能 |

- **macOSのみ対応**（Claude Desktopアプリ経由）
- Windowsは今後対応予定だが時期未定
- 5時間ごとに使用量リセット
- Coworkはトークン消費が大きいため、Proプランでは上限に達しやすい

### $50無料クレジット
2/4までに契約済みのPro/Maxユーザーは、2/16までに申請で$50クレジット取得可能。

---

## 4. Skills & Commands の仕組み

### Skills（スキル）— Claudeが自動で使う知識

- ドメイン専門知識・ベストプラクティス・ワークフロー手順をエンコード
- **Claudeが会話のトピックから自動判断して適用**（ユーザーが選ぶ必要なし）
- 複数スキルの同時発火も可能
- `skills/` フォルダ内の `SKILL.md` ファイルに自然言語で記述

### Commands（コマンド）— ユーザーが手動で起動するアクション

- `/プラグイン名:コマンド名` で呼び出す（例: `/sales:call-prep`）
- `commands/` フォルダ内のMarkdownファイルで定義
- `$ARGUMENTS` プレースホルダーでユーザー入力を動的に受け取れる

| 項目 | Skills | Commands |
|---|---|---|
| 起動方式 | Claudeが自動判断 | ユーザーが `/` で明示的に実行 |
| 用途 | バックグラウンドで専門知識を適用 | 特定タスクを即座に開始 |

---

## 5. プラグイン一覧（公式11種）

すべてオープンソースで GitHub `anthropics/knowledge-work-plugins` で公開。

| # | プラグイン | 対象 | 概要 | 主なコマンド例 |
|---|-----------|------|------|--------------|
| 1 | **Productivity** | 全般 | タスク・カレンダー・日常ワークフロー管理 | Slack/Notion/Asana等と連携 |
| 2 | **Sales** | 営業 | 見込み客リサーチ、商談準備、パイプライン管理 | `/sales:call-prep` `/sales:forecast` |
| 3 | **Marketing** | マーケ | コンテンツ作成、キャンペーン計画、ブランドボイス統一 | — |
| 4 | **Legal** | 法務 | 契約書レビュー（条項別フラグ）、NDAトリアージ | `/legal:review-contract` `/legal:triage-nda` |
| 5 | **Finance** | 財務 | 仕訳、勘定照合、財務諸表、差異分析、監査 | `/finance:reconciliation` |
| 6 | **Support** | CS | チケットトリアージ、回答ドラフト、ナレッジベース化 | — |
| 7 | **Product** | PM | 仕様書作成、ロードマップ、ユーザーリサーチ統合 | `/product-management:write-spec` |
| 8 | **Data Analysis** | データ | SQL作成、統計分析、ダッシュボード構築 | `/data:write-query` |
| 9 | **Enterprise Search** | 全般 | メール・チャット・ドキュメント横断検索 | 引用付き統合 |
| 10 | **Bio-Research** | 生命科学 | PubMed/bioRxiv等との接続で初期R&D加速 | — |
| 11 | **Plugin Management** | 管理 | 新規プラグイン作成・カスタマイズ（メタプラグイン） | 自然言語で自動生成 |

### プラグインの構成要素

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # メタデータ（必須）
├── .mcp.json               # 外部ツール接続設定
├── commands/               # スラッシュコマンド定義
├── agents/                 # サブエージェント定義
├── skills/                 # スキル定義
└── README.md
```

すべてMarkdown + JSONで構成。**コーディング不要**。

### カスタムプラグインの作り方

1. Plugin Managementプラグインを使い、自然言語で「こういうプラグインが欲しい」と説明
2. 自動生成される
3. 必要に応じてMarkdownファイルを手動編集

---

## 6. みんなの活用事例（note/zenn記事）

### 事例1: ファイル整理
- 700個以上の無秩序なファイルを**約1分で7カテゴリに自動分類**
- 53枚の画像を「YYYY-MM-DD_連番.png」にリネーム＋600pxリサイズ
- 出典: babushkai(zenn), lnest_knowledge(zenn)

### 事例2: メール50通の一括処理
- 優先度で分類 → 返信ドラフトまで自動作成
- ChatGPTは1通ずつだがCoworkは一括処理が可能
- 出典: ぬるぽん(note)

### 事例3: 名刺情報の抽出
- 名刺画像フォルダを共有 → 名前・会社名・連絡先をドキュメント化
- 出典: lnest_knowledge(zenn)

### 事例4: 議事録の自動作成
- 音声ファイルから要約 → フォーマット整形 → アクションアイテム抽出
- 出典: ぬるぽん(note)

### 事例5: 領収書 → 経費リスト作成
- 領収書画像を読み取り → Excel/Sheetsで経費リスト自動作成
- 出典: HIBARI(zenn)

### 事例6: PDF操作
- PDFフォームへの情報入力、PDFからのデータ抽出・変換
- 出典: HIBARI(zenn)

### 事例7: 月60時間の削減
- 毎朝30分の指示出しで、以前2〜3時間かかっていた作業を完了
- 浮いた時間で副業開始 → 月収12万円以上
- 出典: ぬるぽん(note)

### 事例8: ブラウザ操作の連携
- Chrome拡張「Claude in Chrome」と組み合わせてWeb操作も自動化
- Gmail, Google Drive, Slackとの連携
- 出典: HIBARI(zenn), lnest_knowledge(zenn)

---

## 7. 町民会館スタッフに刺さりそうな活用パターン

施設予約管理・問い合わせ対応をしている町民会館スタッフに特に響く事例：

| 活用パターン | 具体的なイメージ | デモでの見せ方 |
|---|---|---|
| **問い合わせメール一括処理** | 予約確認・キャンセル・空き状況確認を自動分類＋定型返信作成 | 「50通のメールが30秒で分類される」を見せる |
| **利用実績の自動集計** | 施設利用料の領収書 → 月次の利用実績一覧をExcel自動作成 | レシート画像 → 表に変換のデモ |
| **ファイル整理** | 過去の予約台帳・利用報告書を年度別・イベント別に自動整理 | ダウンロードフォルダ整理のデモ |
| **チラシ・お知らせ文の作成** | イベント告知文を「○○イベントの告知文を作って」で30秒作成 | 実際に作って見せる |
| **議事録の自動作成** | 運営会議の録音 → 議事録＋アクションアイテム抽出 | 音声ファイルからの変換デモ |
| **行政申請書類のPDF入力** | 施設利用報告・補助金申請等のPDFフォームに自動入力 | PDFフォーム入力のデモ |

### 訴求ポイント

1. **プログラミング知識ゼロでOK** — 日本語で指示するだけ
2. **月額約3,000円** — 事務員1時間分の人件費以下
3. **並行作業が可能** — Coworkが作業中に窓口対応に集中できる
4. **月60時間削減の実績あり** — 毎朝30分の指示で2〜3時間分の作業を代行

---

## 参考リンク

### 公式情報
- [Getting started with Cowork | Claude Help Center](https://support.claude.com/en/articles/13345190-getting-started-with-cowork)
- [Introducing Cowork | Claude](https://claude.com/blog/cowork-research-preview)
- [Customize Cowork with plugins | Claude](https://claude.com/blog/cowork-plugins)
- [Skills explained | Claude](https://claude.com/blog/skills-explained)
- [Plugins for Claude Code and Cowork | Anthropic](https://claude.com/plugins)
- [GitHub - anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)

### 日本語記事（note/zenn）
- [Claude Coworkを使ってみた（HIBARI）](https://zenn.dev/hibari_inc/articles/use-claude-cowork)
- [Claude Coworkが全てを変える（babushkai）](https://zenn.dev/babushkai/articles/2026-01-23-claude-cowork-revolution)
- [Coworkを試してみた（lnest_knowledge）](https://zenn.dev/lnest_knowledge/articles/0b763e2ccf1bd8)
- [月60時間を生み出す5つの活用テンプレート（ぬるぽん）](https://note.com/pocketstudio/n/na80f336e2e55)
- [Coworkプラグインで業務標準化（SecondWave）](https://note.com/startup_now0708/n/n1b2ab89f2a4a)
- [Coworkとは？料金・使い方・活用事例（ヒロ）](https://note.com/hiro_seki/n/n08dd0e93c66c)

### 海外記事
- [Anthropic brings agentic plug-ins to Cowork | TechCrunch](https://techcrunch.com/2026/01/30/anthropic-brings-agentic-plugins-to-cowork/)
- [Anthropic Gets a Viral Moment With Cowork | Bloomberg](https://www.bloomberg.com/news/newsletters/2026-01-15/anthropic-gets-a-viral-moment-with-cowork-tool-built-mostly-by-ai)
- [Anthropic opens up Cowork to $20 subscribers | Engadget](https://www.engadget.com/ai/anthropic-opens-up-its-claude-cowork-feature-to-anyone-with-a-20-subscription-194000021.html)
