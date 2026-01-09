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

// タスク
export interface Task {
  title: string;
  status?: TaskStatusType;
  deliverable?: Deliverable;
}

// Issue
export interface Issue {
  id: string;
  title: string;
  tasks: Task[];
}

// 戦略ノード
export interface StrategyNode {
  id: string;
  title: string;
  icon?: string;
  children?: StrategyNode[];
  issues?: Issue[];
}

// ドキュメント
export interface Meeting {
  id: string;
  date: string;
  title: string;
  type: 'kickoff' | 'review' | 'planning' | 'workshop';
  attendees: string[];
  summary: string;
  relatedIssue?: string;
  decisions: string[];
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
  tab: 'tree' | 'search' | 'progress' | 'docs';
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
