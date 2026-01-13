import { useState, useEffect, useCallback } from 'react';
import { TaskStates, TaskStatusType, StrategyNode, Deliverable, TASK_STATUS } from '../types';

const STORAGE_KEY = 'mazda-sync-task-states';

// LocalStorageからタスク状態を読み込む
const loadTaskStates = (): TaskStates => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// タスク状態をLocalStorageに保存
const saveTaskStates = (states: TaskStates): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
};

// タスク状態を戦略データに適用
export const applyTaskStates = (data: StrategyNode, taskStates: TaskStates): StrategyNode => {
  const apply = (node: StrategyNode): StrategyNode => {
    const newNode = { ...node };
    
    if (node.issues) {
      newNode.issues = node.issues.map(issue => ({
        ...issue,
        tasks: issue.tasks.map((task, idx) => ({
          ...task,
          ...(taskStates[issue.id]?.[idx] || {})
        }))
      }));
    }
    
    if (node.children) {
      newNode.children = node.children.map(child => apply(child));
    }
    
    return newNode;
  };
  
  return apply(data);
};

// 変更されたファイルを取得
export const getChangedFiles = (
  originalData: StrategyNode,
  taskStates: TaskStates,
  projectId: string
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
  
  const yamlContent = `# ${projectId === 'brand' ? 'ブランド価値向上' : '燃費改善'}プロジェクト Issues\n\nissues:\n${collectIssues(applyTaskStates(originalData, taskStates)).join('\n')}`;
  
  changes.push({
    path: `github_sim${projectId === 'brand' ? '2' : '3'}/issues.yaml`,
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
