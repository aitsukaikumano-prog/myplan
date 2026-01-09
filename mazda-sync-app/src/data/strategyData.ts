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

// パワートレイン燃費改善プロジェクトのデータ
export const STRATEGY_DATA_POWERTRAIN: StrategyNode = {
  id: 'root',
  title: 'パワートレインの燃費改善',
  icon: 'fas fa-gas-pump',
  children: [
    {
      id: '1.1',
      title: '1.1 エンジン効率の最適化',
      icon: 'fas fa-cogs',
      children: [
        {
          id: '1.1-A',
          title: 'A. 燃焼効率の向上',
          icon: 'fas fa-fire',
          children: [
            {
              id: '1.1-A1',
              title: 'A-1. SKYACTIV技術の進化',
              icon: 'fas fa-rocket',
              issues: [
                {
                  id: '1.1-A1-01',
                  title: 'SKYACTIV-X Gen2 開発',
                  tasks: [
                    { title: '圧縮比最適化シミュレーション' },
                    { title: 'SPCCI燃焼制御の高度化' },
                    { title: '排気システムの熱効率改善' }
                  ]
                }
              ]
            },
            {
              id: '1.1-A2',
              title: 'A-2. フリクション低減',
              icon: 'fas fa-oil-can',
              issues: [
                {
                  id: '1.1-A2-01',
                  title: 'エンジン内部フリクション低減プロジェクト',
                  tasks: [
                    { title: '低粘度オイル対応設計の検証' },
                    { title: 'ピストンリング摩擦低減コーティング評価' },
                    { title: 'ベアリング最適化テスト' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '1.2',
      title: '1.2 軽量化技術の推進',
      icon: 'fas fa-feather-alt',
      children: [
        {
          id: '1.2-B',
          title: 'B. 車体軽量化',
          icon: 'fas fa-car-side',
          children: [
            {
              id: '1.2-B1',
              title: 'B-1. 高張力鋼板の採用拡大',
              icon: 'fas fa-layer-group',
              issues: [
                {
                  id: '1.2-B1-01',
                  title: '超高張力鋼板適用範囲拡大',
                  tasks: [
                    { title: '1.5GPa級鋼板のプレス成形技術開発' },
                    { title: '衝突安全性能との両立検証' },
                    { title: 'コスト試算と量産計画' }
                  ]
                }
              ]
            },
            {
              id: '1.2-B2',
              title: 'B-2. マルチマテリアル設計',
              icon: 'fas fa-puzzle-piece',
              issues: [
                {
                  id: '1.2-B2-01',
                  title: 'アルミ・CFRP複合構造の開発',
                  tasks: [
                    { title: '異種材料接合技術の確立' },
                    { title: '耐久性・信頼性評価' },
                    { title: 'リサイクル性の検討' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '1.3',
      title: '1.3 空力性能の改善',
      icon: 'fas fa-wind',
      children: [
        {
          id: '1.3-C',
          title: 'C. 空気抵抗低減',
          icon: 'fas fa-drafting-compass',
          children: [
            {
              id: '1.3-C1',
              title: 'C-1. アクティブエアロダイナミクス',
              icon: 'fas fa-adjust',
              issues: [
                {
                  id: '1.3-C1-01',
                  title: 'アクティブグリルシャッター最適化',
                  tasks: [
                    { title: '速度別開閉制御ロジックの最適化' },
                    { title: '冷却性能との両立テスト' },
                    { title: '実走行燃費改善効果の測定' }
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

// プロジェクト定義
export const PROJECTS: Record<string, Project> = {
  brand: {
    id: 'brand',
    name: 'ブランド価値向上',
    icon: 'fas fa-gem',
    data: STRATEGY_DATA_BRAND
  },
  powertrain: {
    id: 'powertrain',
    name: '燃費改善',
    icon: 'fas fa-gas-pump',
    data: STRATEGY_DATA_POWERTRAIN
  }
};
