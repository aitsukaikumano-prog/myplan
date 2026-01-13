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
      id: '3.1',
      title: '3.1 提案準備',
      icon: 'fas fa-file-alt',
      children: [
        {
          id: '3.1-A',
          title: 'A. マツダの課題分析',
          icon: 'fas fa-search',
          issues: [
            {
              id: '3.1-A1-01',
              title: 'マツダ財務・業績分析',
              tasks: [
                { title: '最新決算資料の収集・分析' },
                { title: '過去5年間の業績推移まとめ' },
                { title: '主要KPIの抽出と課題リスト作成' }
              ]
            },
            {
              id: '3.1-A1-02',
              title: '競合比較分析',
              tasks: [
                { title: '競合他社のAI活用状況調査' },
                { title: '比較分析レポート作成' }
              ]
            }
          ]
        },
        {
          id: '3.1-B',
          title: 'B. AI活用提案書作成',
          icon: 'fas fa-lightbulb',
          issues: [
            {
              id: '3.1-B1-01',
              title: '業務効率化AI提案',
              tasks: [
                { title: '業務プロセス改善余地の洗い出し' },
                { title: 'AI導入による効果試算' },
                { title: '提案書ドラフト作成' }
              ]
            }
          ]
        },
        {
          id: '3.1-C',
          title: 'C. 実績・ポートフォリオ整備',
          icon: 'fas fa-briefcase',
          issues: [
            {
              id: '3.1-C1-01',
              title: 'ポートフォリオ作成',
              tasks: [
                { title: '過去案件の実績整理' },
                { title: 'マツダ向けデモ・サンプル作成' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '3.2',
      title: '3.2 アプローチ・関係構築',
      icon: 'fas fa-handshake',
      children: [
        {
          id: '3.2-A',
          title: 'A. キーパーソン特定',
          icon: 'fas fa-user-tie',
          issues: [
            {
              id: '3.2-A1-01',
              title: '意思決定者マッピング',
              tasks: [
                { title: '経営陣・部門長のリストアップ' },
                { title: 'キーパーソンマップ作成' }
              ]
            }
          ]
        },
        {
          id: '3.2-B',
          title: 'B. 接点づくり',
          icon: 'fas fa-network-wired',
          issues: [
            {
              id: '3.2-B1-01',
              title: 'アプローチルート開拓',
              tasks: [
                { title: '業界イベント・カンファレンス調査' },
                { title: '紹介可能な人脈の棚卸し' },
                { title: 'LinkedIn等でのコンタクトリスト作成' }
              ]
            }
          ]
        },
        {
          id: '3.2-C',
          title: 'C. 信頼関係構築',
          icon: 'fas fa-heart',
          issues: [
            {
              id: '3.2-C1-01',
              title: '継続的価値提供',
              tasks: [
                { title: '業界レポート・知見の定期発信' },
                { title: '小さな相談への迅速対応' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '3.3',
      title: '3.3 案件獲得・実行',
      icon: 'fas fa-trophy',
      children: [
        {
          id: '3.3-A',
          title: 'A. 初期案件の提案',
          icon: 'fas fa-seedling',
          issues: [
            {
              id: '3.3-A1-01',
              title: 'スモールスタート案件提案',
              tasks: [
                { title: '初期案件候補のリストアップ' },
                { title: '提案資料作成' }
              ]
            }
          ]
        },
        {
          id: '3.3-B',
          title: 'B. パイロット実施',
          icon: 'fas fa-flask',
          issues: [
            {
              id: '3.3-B1-01',
              title: '実証実験の実施',
              tasks: [
                { title: 'パイロット計画策定' },
                { title: '実施・効果測定' },
                { title: '成果レポート作成' }
              ]
            }
          ]
        },
        {
          id: '3.3-C',
          title: 'C. 本格契約へ拡大',
          icon: 'fas fa-chart-line',
          issues: [
            {
              id: '3.3-C1-01',
              title: '本格提案・契約獲得',
              tasks: [
                { title: '本格提案書作成' },
                { title: '契約交渉・締結' }
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
