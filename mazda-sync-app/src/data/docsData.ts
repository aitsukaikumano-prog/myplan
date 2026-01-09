import { Meeting } from '../types';

export const DOCS_DATA: Record<string, { meetings: Meeting[] }> = {
  brand: {
    meetings: [
      {
        id: '20260109_brand_fan_community_workshop',
        date: '2026-01-09',
        title: 'ファンコミュニティ設計ワークショップ',
        type: 'workshop',
        attendees: ['CX推進チーム', 'デジタルマーケティング部', 'ファンコミュニティ運営'],
        summary: 'ファンコミュニティの設計方針とMyMazda連携について議論。イベント管理、ポイントシステム、ランク制度の詳細を決定。',
        relatedIssue: '2.3-C1-01',
        decisions: [
          'ファン活動をポイントとして可視化する仕組みを導入',
          'ランクに応じた特典（試乗会優先招待等）を設計',
          'MyMazdaアプリとの連携でシームレスな体験を実現'
        ]
      },
      {
        id: '20260108_brand_cx_audit_design',
        date: '2026-01-08',
        title: 'CX監査スコアカード設計ワークショップ',
        type: 'workshop',
        attendees: ['品質管理部', 'CX推進チーム', 'データ分析チーム', '店舗開発部'],
        summary: 'CX監査スコアカードの設計について議論。評価指標、測定方法、フィードバックプロセスを定義。',
        relatedIssue: '2.1-A2-01',
        decisions: [
          '6つの評価カテゴリを定義（第一印象、商品説明、試乗体験、提案力、アフターケア、総合満足）',
          '各カテゴリに3-5の具体的評価項目を設定',
          '月次での店舗ランキング公開を実施'
        ]
      },
      {
        id: '20260107_brand_resale_value_planning',
        date: '2026-01-07',
        title: 'リセールバリュー監視システム要件定義',
        type: 'planning',
        attendees: ['商品企画部', 'データサイエンスチーム', 'CPO事業部', 'マーケティング部'],
        summary: 'リセールバリュー監視システムの要件定義。データソース、分析手法、アラート機能について議論。',
        relatedIssue: '2.2-B1-01',
        decisions: [
          '主要中古車サイト5社のデータを日次で自動収集',
          '機械学習を用いた予測モデルの開発着手',
          '競合比較ダッシュボードの要件確定'
        ]
      },
      {
        id: '20260106_brand_storytelling_review',
        date: '2026-01-06',
        title: 'ブランド・ストーリーテリング中間レビュー',
        type: 'review',
        attendees: ['ブランド戦略室', 'コンテンツ制作チーム', '広報部', '販売店教育部'],
        summary: 'ブランド・ストーリーテリング施策の中間レビュー。制作進捗、店舗展開計画、効果測定方法を確認。',
        relatedIssue: '2.1-A2-02',
        decisions: [
          '2026年3月末までに全車種の物語を完成',
          '販売店スタッフ向け研修プログラムを開発',
          'VR体験コンテンツのパイロット導入を決定'
        ]
      },
      {
        id: '20251215_brand_mymazda_kickoff',
        date: '2025-12-15',
        title: 'MyMazdaデータ連携プロジェクト キックオフ',
        type: 'kickoff',
        attendees: ['IT基盤チーム', 'CRM推進室', 'データサイエンスチーム', 'セキュリティ統括部'],
        summary: 'MyMazdaアプリとCRMのデータ連携プロジェクトのキックオフ。目的、スコープ、スケジュールを共有。',
        relatedIssue: '2.1-A1-01',
        decisions: [
          '2026年Q2までにPhase1（基盤構築）を完了',
          'プライバシーポリシーの改定を法務部と連携',
          '週次での進捗確認会議を設定'
        ]
      }
    ]
  },
  powertrain: {
    meetings: []
  }
};
