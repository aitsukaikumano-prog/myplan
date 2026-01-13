import { StrategyNode, Project, TASK_STATUS } from '../types';

// ブランド価値向上プロジェクトのデータ
export const STRATEGY_DATA_BRAND: StrategyNode = {
  id: 'root',
  title: 'マツダのブランド価値を向上させる',
  icon: 'fas fa-star',
  children: [
    {
      id: '2.1',
      title: '2.1 顧客体験（CX）の統合的向上',
      icon: 'fas fa-heart',
      children: [
        {
          id: '2.1-A',
          title: 'A. 次世代店舗体験（マツダWay店舗）の標準化',
          icon: 'fas fa-store',
          children: [
            {
              id: '2.1-A1',
              title: 'A-1. MyMazdaアプリ連携による顧客データ活用',
              icon: 'fas fa-mobile-alt',
              issues: [
                {
                  id: '2.1-A1-01',
                  title: 'MyMazdaデータとCRMの統合基盤構築',
                  tasks: [
                    { title: '車載コネクティッドユニットから取得可能なデータ項目の全リストアップ', status: TASK_STATUS.COMPLETED, deliverable: { type: 'file', url: 'github_sim2/output/2.1_A1_01_connected_data_list.xlsx', description: '40項目のデータ一覧（カテゴリ別）' } },
                    { title: '取得データをCRMへ自動連携するためのAPI仕様案作成', status: TASK_STATUS.COMPLETED },
                    { title: 'プライバシーポリシー改定案の法務部レビュー依頼' },
                    { title: 'パイロット店舗でのデータ連携テスト実施' }
                  ]
                },
                {
                  id: '2.1-A1-02',
                  title: 'ドライブログを活用した顧客体験設計',
                  tasks: [
                    { title: '走行データから抽出可能な顧客インサイトの洗い出し' },
                    { title: '顧客セグメント別のパーソナライズ提案シナリオ作成' },
                    { title: 'セールストーク用のダッシュボードUI設計' }
                  ]
                }
              ]
            },
            {
              id: '2.1-A2',
              title: 'A-2. 店舗体験の品質管理と改善',
              icon: 'fas fa-clipboard-check',
              issues: [
                {
                  id: '2.1-A2-01',
                  title: 'CX監査スコアカードの設計・導入',
                  tasks: [
                    { title: '既存顧客満足度調査の分析と課題抽出' },
                    { title: '評価指標（KPI）の定義と測定方法の確立' },
                    { title: 'スコアカードテンプレートの作成' },
                    { title: 'パイロット店舗での試験運用' }
                  ]
                },
                {
                  id: '2.1-A2-02',
                  title: 'ブランド・ストーリーテリング動画制作',
                  tasks: [
                    { title: '開発主査や匠のインタビューから、接客で使える「キラーフレーズ」の抽出', status: TASK_STATUS.COMPLETED },
                    { title: '車種ごとの「語るべき物語」（例：魂動デザインの光の移ろい）の台本化', status: TASK_STATUS.COMPLETED },
                    { title: '動画コンテンツの撮影・編集' },
                    { title: '店舗スタッフ向け研修プログラムの開発' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '2.2',
      title: '2.2 リセールバリューの維持・向上',
      icon: 'fas fa-chart-line',
      children: [
        {
          id: '2.2-B',
          title: 'B. 中古車市場でのブランド価値維持',
          icon: 'fas fa-car',
          children: [
            {
              id: '2.2-B1',
              title: 'B-1. リセールバリュー監視システム',
              icon: 'fas fa-search-dollar',
              issues: [
                {
                  id: '2.2-B1-01',
                  title: 'リセールバリュー監視ダッシュボード構築',
                  tasks: [
                    { title: '主要中古車サイトからのデータ収集システム構築' },
                    { title: '競合比較分析レポートの自動生成機能' },
                    { title: 'アラート機能（急落検知）の実装' }
                  ]
                }
              ]
            },
            {
              id: '2.2-B2',
              title: 'B-2. CPO（認定中古車）プログラム強化',
              icon: 'fas fa-award',
              issues: [
                {
                  id: '2.2-B2-01',
                  title: 'マツダCPOプレミアム戦略の策定',
                  tasks: [
                    { title: 'CPO認定基準の見直しと厳格化案' },
                    { title: '延長保証プログラムの設計' },
                    { title: 'CPO専用マーケティング施策の立案' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '2.3',
      title: '2.3 ファンベース・マーケティング',
      icon: 'fas fa-users',
      children: [
        {
          id: '2.3-C',
          title: 'C. コミュニティ形成とエンゲージメント',
          icon: 'fas fa-comments',
          children: [
            {
              id: '2.3-C1',
              title: 'C-1. ファンコミュニティ統合',
              icon: 'fas fa-user-friends',
              issues: [
                {
                  id: '2.3-C1-01',
                  title: 'MyMazda × ファンコミュニティ連携',
                  tasks: [
                    { title: '既存ファンコミュニティの調査・マッピング' },
                    { title: 'コミュニティ機能のMyMazdaアプリ統合設計' },
                    { title: 'イベント管理・ポイントシステムの要件定義' }
                  ]
                }
              ]
            },
            {
              id: '2.3-C2',
              title: 'C-2. 体験価値の言語化',
              icon: 'fas fa-quote-right',
              issues: [
                {
                  id: '2.3-C2-01',
                  title: '人馬一体体験プログラムの開発',
                  tasks: [
                    { title: 'マツダ独自の運転体験価値の言語化' },
                    { title: '体験型イベントのコンテンツ開発' },
                    { title: '参加者フィードバック収集・分析システム' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// マツダ救済プロジェクトのデータ
export const STRATEGY_DATA_RESCUE: StrategyNode = {
  id: 'root',
  title: 'マツダからAIコンサル案件を獲得する',
  icon: 'fas fa-rocket',
  children: [
    {
      id: '1',
      title: '1. 基盤構築（月1-2）',
      icon: 'fas fa-hammer',
      children: [
        {
          id: '1-A',
          title: 'A. 自己ブランディング確立',
          icon: 'fas fa-id-card',
          issues: [
            {
              id: '1-A-01',
              title: '提供価値の明確化',
              tasks: [
                { title: '自分のスキル棚卸し（Web/AI/業務改善）' },
                { title: '製造業の一般的な課題リサーチ' },
                { title: '仮説としてのサービス案3つ作成' }
              ]
            },
            {
              id: '1-A-02',
              title: '営業ツール整備',
              tasks: [
                { title: '屋号決定・名刺デザイン・印刷' },
                { title: 'ポートフォリオWebサイト作成' },
                { title: '1分エレベーターピッチ作成' }
              ]
            }
          ]
        },
        {
          id: '1-B',
          title: 'B. ターゲット企業リサーチ',
          icon: 'fas fa-search',
          issues: [
            {
              id: '1-B-01',
              title: 'マツダサプライヤー調査',
              tasks: [
                { title: 'マツダTier1サプライヤーリスト作成（上位20社）' },
                { title: '各社のAI/DX取り組み状況調査' },
                { title: 'アプローチ優先順位付け（規模・課題・接点可能性）' }
              ]
            },
            {
              id: '1-B-02',
              title: '広島製造業コミュニティ調査',
              tasks: [
                { title: '製造業向けセミナー・イベント一覧作成' },
                { title: '商工会議所・産業支援機関のリストアップ' },
                { title: '参加すべきイベント3つ決定' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '2',
      title: '2. 実績構築（月2-6）',
      icon: 'fas fa-trophy',
      children: [
        {
          id: '2-A',
          title: 'A. サプライヤーへのアプローチ',
          icon: 'fas fa-handshake',
          issues: [
            {
              id: '2-A-01',
              title: 'アプローチ活動',
              tasks: [
                { title: 'イベント・セミナーへの参加（月2回以上）' },
                { title: '飛び込み営業リスト消化（週5社）' },
                { title: 'LinkedInでの製造業関係者とのつながり構築' }
              ]
            },
            {
              id: '2-A-02',
              title: '無料診断・相談の提供',
              tasks: [
                { title: '無料AI活用診断サービスの設計' },
                { title: '診断レポートテンプレート作成' },
                { title: '無料診断5社実施' }
              ]
            }
          ]
        },
        {
          id: '2-B',
          title: 'B. 初期案件獲得・実行',
          icon: 'fas fa-tasks',
          issues: [
            {
              id: '2-B-01',
              title: '有償案件獲得',
              tasks: [
                { title: '有償案件1社目獲得' },
                { title: '案件実行・成果創出' },
                { title: '有償案件2社目獲得' }
              ]
            },
            {
              id: '2-B-02',
              title: '成果のドキュメント化',
              tasks: [
                { title: 'ケーススタディ作成（Before/After/数値成果）' },
                { title: '顧客の声（推薦文）取得' },
                { title: 'ポートフォリオサイト更新' }
              ]
            }
          ]
        },
        {
          id: '2-C',
          title: 'C. マツダへの布石',
          icon: 'fas fa-chess',
          issues: [
            {
              id: '2-C-01',
              title: 'サプライヤー経由のルート開拓',
              tasks: [
                { title: 'サプライヤー担当者にマツダとの接点をヒアリング' },
                { title: '紹介可能なキーパーソンの特定' },
                { title: 'マツダ関係者との接点イベント調査' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '3',
      title: '3. マツダアプローチ（月6-10）',
      icon: 'fas fa-bullseye',
      children: [
        {
          id: '3-A',
          title: 'A. キーパーソン特定・接点づくり',
          icon: 'fas fa-user-tie',
          issues: [
            {
              id: '3-A-01',
              title: '意思決定者へのアクセス',
              tasks: [
                { title: 'サプライヤー経由の紹介依頼' },
                { title: 'マツダ向け提案書作成（実績ベース）' },
                { title: '初回面談獲得' }
              ]
            }
          ]
        },
        {
          id: '3-B',
          title: 'B. 提案・契約獲得',
          icon: 'fas fa-file-signature',
          issues: [
            {
              id: '3-B-01',
              title: 'パイロット案件獲得',
              tasks: [
                { title: 'スモールスタート案件の提案' },
                { title: 'パイロット実施・成果創出' },
                { title: '本格契約への拡大提案' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// プロジェクト定義
export const PROJECTS: Record<string, Project> = {
  brand: {
    id: 'brand',
    name: 'ブランド価値向上',
    icon: 'fas fa-gem',
    data: STRATEGY_DATA_BRAND
  },
  rescue: {
    id: 'rescue',
    name: 'マツダ救済',
    icon: 'fas fa-rocket',
    data: STRATEGY_DATA_RESCUE
  }
};
