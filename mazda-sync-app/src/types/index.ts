// タスクのステータス
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  PENDING_APPROVAL: 'pending_approval',
  COMPLETED: 'completed'
} as const;

export type TaskStatusType = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// ステータス設定
export const STATUS_CONFIG: Record<TaskStatusType, { label: string; color: string; icon: string }> = {
  [TASK_STATUS.PENDING]: { label: '未着手', color: 'border-slate-300 bg-slate-50 text-slate-500', icon: 'far fa-circle' },
  [TASK_STATUS.IN_PROGRESS]: { label: '作業中', color: 'border-blue-400 bg-blue-50 text-blue-600', icon: 'fas fa-spinner' },
  [TASK_STATUS.PENDING_APPROVAL]: { label: '承認待ち', color: 'border-amber-400 bg-amber-50 text-amber-600', icon: 'fas fa-clock' },
  [TASK_STATUS.COMPLETED]: { label: '完了', color: 'border-green-500 bg-green-50 text-green-600', icon: 'fas fa-check' }
};

// 成果物
export interface Deliverable {
  type: string;
  url: string;
  description?: string;
  submittedAt?: string;
}

// タスクの成果物（構造化）
export interface TaskOutput {
  type?: 'document' | 'link' | 'file';
  file?: string;    // ファイルパス (docs/xxx.md)
  url?: string;     // 外部URL
  title: string;
  summary?: string; // 成果物のサマリ
}

// タスク詳細ファイルのデータ構造
export interface TaskDetailData {
  successCriteria?: string[];
  completedDate?: string;
  outputs?: TaskOutput[];
  outputsSummary?: string;  // 成果物全体のサマリー
  description?: string;  // Markdown本文から抽出
  notes?: string;        // Markdown本文から抽出
}

// タスクのリンク
export interface TaskLink {
  url: string;
  title: string;
}

// サブタスクアイテム（6階層目対応）
export interface SubtaskItem {
  title: string;
  outputs?: (string | TaskOutput)[];  // 文字列とオブジェクト両方サポート
}

// サブタスク（5階層目対応）
export interface Subtask {
  title: string;
  items?: (string | SubtaskItem)[];  // 文字列とオブジェクト両方サポート
}

// タスク
export interface Task {
  id?: string;                          // タスクID（オプション）
  title: string;
  status?: TaskStatusType;
  deliverable?: Deliverable;
  subtasks?: (string | Subtask)[];      // 文字列とオブジェクト両方サポート
  outputs?: (string | TaskOutput)[];    // 成果物（文字列とオブジェクト両対応）
  outputsSummary?: string;              // 成果物全体のサマリー
  links?: TaskLink[];                   // 参考リンク
  notes?: string;                       // メモ・備考
  description?: string;                 // 詳細説明
  successCriteria?: string[];           // 完了条件（チェックリスト）
  completedDate?: string;               // 完了日
}

// Issue
export interface Issue {
  id: string;
  title: string;
  tasks: Task[];
  status?: string;
  context?: string;
  description?: string;
  successCriteria?: string[];
  outputs?: (string | TaskOutput)[];
  outputsSummary?: string;
  notes?: string;
  completedDate?: string;
}

// 戦略ノード
export interface StrategyNode {
  id: string;
  title: string;
  icon?: string;
  children?: StrategyNode[];
  issues?: Issue[];
}

// 議事録
export interface Meeting {
  id: string;
  date: string;
  title: string;
  type: 'kickoff' | 'review' | 'planning' | 'workshop';
  attendees: string[];
  summary: string;
  relatedIssue?: string;
  decisions: string[];
  rawContent?: string;
}

// 統合ドキュメント型
export type DocumentCategory = 'meeting' | 'proposal' | 'report';

export interface Document {
  id: string;
  date: string;
  title: string;
  category: DocumentCategory;
  type: string;  // meeting type, proposal type, etc.
  author?: string;
  summary: string;
  relatedIssue?: string;
  status?: 'draft' | 'review' | 'approved' | 'archived';
  rawContent?: string;
  // Meeting specific
  attendees?: string[];
  decisions?: string[];
  // Proposal/Report specific
  sections?: { title: string; content: string }[];
}

// メール
export interface Email {
  id: string;
  date: string;
  subject: string;
  type: 'decision' | 'report' | 'request' | 'info';
  from: string;
  to: string[];
  cc?: string[];
  summary: string;
  body: string;
  relatedIssue?: string;
  rawContent?: string;
}

// プロジェクト
export interface Project {
  id: string;
  name: string;
  icon: string;
  data: StrategyNode;
}

// ビュー状態
export interface ViewState {
  type: 'main' | 'detail';
  tab: 'tree' | 'search' | 'progress' | 'docs' | 'emails';
  issue: Issue | null;
}

// タスク状態（LocalStorage用）
export interface TaskStates {
  [issueId: string]: {
    [taskIndex: number]: {
      status: TaskStatusType;
      deliverable?: Deliverable;
    };
  };
}
