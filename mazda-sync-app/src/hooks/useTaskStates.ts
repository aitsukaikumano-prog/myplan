import { useState, useEffect, useCallback } from 'react';
import { TaskStates, TaskStatusType, StrategyNode, Deliverable, TASK_STATUS } from '../types';

// LocalStorageベースの進捗管理は廃止
// issues.yamlのステータスをそのまま使用する

const STORAGE_KEY = 'mazda-sync-task-states';

// 古いLocalStorageデータをクリア
if (typeof window !== 'undefined') {
  localStorage.removeItem(STORAGE_KEY);
}

// LocalStorageからタスク状態を読み込む（廃止：常に空を返す）
const loadTaskStates = (): TaskStates => {
  return {};
};

// タスク状態をLocalStorageに保存（廃止：何もしない）
const saveTaskStates = (_states: TaskStates): void => {
  // 廃止
};

// タスク状態を戦略データに適用（廃止：元データをそのまま返す）
export const applyTaskStates = (data: StrategyNode, _taskStates: TaskStates): StrategyNode => {
  // issues.yamlのステータスをそのまま使用
  return data;
};

// 変更されたファイルを取得
export const getChangedFiles = (
  originalData: StrategyNode,
  taskStates: TaskStates,
  _projectId: string
): { path: string; content: string }[] => {
  const changes: { path: string; content: string }[] = [];
  
  if (Object.keys(taskStates).length === 0) return changes;
  
  // issues.yamlの内容を生成
  const collectIssues = (node: StrategyNode): string[] => {
    const lines: string[] = [];
    
    if (node.issues) {
      node.issues.forEach(issue => {
        lines.push(`- id: "${issue.id}"`);
        lines.push(`  title: "${issue.title}"`);
        lines.push(`  tasks:`);
        issue.tasks.forEach((task, idx) => {
          const state = taskStates[issue.id]?.[idx];
          const status = state?.status || task.status || TASK_STATUS.PENDING;
          lines.push(`    - title: "${task.title}"`);
          lines.push(`      status: "${status}"`);
          if (state?.deliverable || task.deliverable) {
            const del = state?.deliverable || task.deliverable;
            lines.push(`      deliverable:`);
            lines.push(`        type: "${del?.type}"`);
            lines.push(`        url: "${del?.url}"`);
            if (del?.description) {
              lines.push(`        description: "${del.description}"`);
            }
          }
        });
        lines.push('');
      });
    }
    
    if (node.children) {
      node.children.forEach(child => {
        lines.push(...collectIssues(child));
      });
    }
    
    return lines;
  };
  
  const yamlContent = `# ブランド価値向上プロジェクト Issues\n\nissues:\n${collectIssues(applyTaskStates(originalData, taskStates)).join('\n')}`;

  changes.push({
    path: `github_sim2/issues.yaml`,
    content: yamlContent
  });
  
  return changes;
};

export const useTaskStates = () => {
  const [taskStates, setTaskStates] = useState<TaskStates>(loadTaskStates);

  useEffect(() => {
    saveTaskStates(taskStates);
  }, [taskStates]);

  const updateTaskStatus = useCallback((
    issueId: string,
    taskIndex: number,
    status: TaskStatusType,
    deliverable?: Deliverable
  ) => {
    setTaskStates(prev => ({
      ...prev,
      [issueId]: {
        ...prev[issueId],
        [taskIndex]: {
          status,
          deliverable: deliverable || prev[issueId]?.[taskIndex]?.deliverable
        }
      }
    }));
  }, []);

  const approveTask = useCallback((issueId: string, taskIndex: number) => {
    setTaskStates(prev => ({
      ...prev,
      [issueId]: {
        ...prev[issueId],
        [taskIndex]: {
          ...prev[issueId]?.[taskIndex],
          status: TASK_STATUS.COMPLETED
        }
      }
    }));
  }, []);

  const hasChanges = Object.keys(taskStates).length > 0;

  return {
    taskStates,
    updateTaskStatus,
    approveTask,
    hasChanges
  };
};
