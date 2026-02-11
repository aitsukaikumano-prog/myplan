import { useState, useEffect, useRef, useMemo } from 'react';
import { StrategyNode, Issue, Subtask, SubtaskItem, TaskOutput, Task, TASK_STATUS, STATUS_CONFIG, TaskStatusType } from '../types';
import './TreeView.css';

interface TreeViewProps {
  strategyData: StrategyNode;
  onNavigate?: (issue: Issue) => void;
}

// ツリーの最大深度を計算（パディング計算用）
const calculateTreeDepth = (node: StrategyNode): number => {
  let maxDepth = 1; // root

  // 子ノードの深さ
  if (node.children) {
    for (const child of node.children) {
      maxDepth = Math.max(maxDepth, 1 + calculateTreeDepth(child));
    }
  }

  // Issueの深さ（Issue -> Task -> ChildTask -> Subtask -> SubtaskItem）
  if (node.issues) {
    for (const issue of node.issues) {
      let issueDepth = 1; // Issue自体
      if (issue.tasks) {
        for (const task of issue.tasks) {
          issueDepth = Math.max(issueDepth, 1 + calculateTaskDepth(task));
        }
      }
      maxDepth = Math.max(maxDepth, 1 + issueDepth);
    }
  }

  return maxDepth;
};

// タスクの深さを再帰的に計算
const calculateTaskDepth = (task: Task): number => {
  let depth = 1; // Task自体

  // 子タスク
  if (task.tasks && task.tasks.length > 0) {
    for (const childTask of task.tasks) {
      depth = Math.max(depth, 1 + calculateTaskDepth(childTask));
    }
  }

  // サブタスク
  if (task.subtasks && task.subtasks.length > 0) {
    let subtaskDepth = 1;
    for (const subtask of task.subtasks) {
      if (typeof subtask === 'object' && subtask.items && subtask.items.length > 0) {
        subtaskDepth = 2; // Subtask + SubtaskItem
      }
    }
    depth = Math.max(depth, subtaskDepth);
  }

  return depth;
};

// SubTaskCard: タスクカード（5階層目以降）- outputsは展開しない
const SubTaskCard = ({
  item,
  onSelectTask,
}: {
  item: string | SubtaskItem;
  parentId: string;
  index: number;
  onSelectTask?: (task: Task) => void;
}) => {
  // itemがオブジェクトかどうかを判定
  const isObject = typeof item === 'object';
  const title = isObject ? item.title : item;
  const outputs = isObject ? item.outputs : undefined;
  const hasOutputs = outputs && outputs.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasOutputs && onSelectTask) {
      onSelectTask({ title, outputs: outputs! } as Task);
    }
  };

  return (
    <div className="tree-node">
      <div
        onClick={handleClick}
        className={`issue-card subtask-card ${hasOutputs ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded font-bold">タスク</span>
          {hasOutputs && (
            <span className="text-[10px] text-purple-500 font-bold">
              📎 {outputs!.length}
            </span>
          )}
        </div>
        <div className="text-xs font-semibold text-slate-700 leading-tight">{title}</div>
      </div>
    </div>
  );
};

// TaskCard: 展開可能なカード（4階層目）
const TaskCard = ({
  subtask,
  parentId,
  index,
  onSelectTask,
  highlightCompleted,
  parentCompleted
}: {
  subtask: string | Subtask;
  parentId: string;
  index: number;
  onSelectTask?: (task: Task) => void;
  highlightCompleted?: boolean;
  parentCompleted?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const cardId = `${parentId}-${index + 1}`;

  // subtaskがオブジェクトかどうかを判定
  const isObject = typeof subtask === 'object';
  const title = isObject ? subtask.title : subtask;
  const items = isObject ? subtask.items : undefined;
  const hasItems = items && items.length > 0;

  // 親タスクが完了していればsubtaskも完了扱い
  const isCompleted = parentCompleted;

  // 完了ハイライト時のスタイル
  const completedStyle = highlightCompleted && isCompleted
    ? 'completed-highlight'
    : '';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasItems) {
      setExpanded(!expanded);
    }
  };

  return (
    <div className={`tree-node ${highlightCompleted && isCompleted ? 'completed-connector' : ''}`}>
      <div
        onClick={handleClick}
        className={`issue-card task-card ${expanded ? 'issue-card-expanded' : ''} ${hasItems ? 'cursor-pointer' : ''} ${completedStyle}`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-emerald-500">#{cardId}</span>
          {hasItems && (
            <span className="text-[10px] text-slate-400">
              {expanded ? '▼' : '▶'} {items!.length}
            </span>
          )}
        </div>
        <div className="text-xs font-semibold text-slate-700 leading-tight">{title}</div>
      </div>

      {expanded && hasItems && (
        <div className="tree-children">
          <div className="connector-vertical"></div>
          <div className={`children-container ${items!.length > 1 ? 'has-multiple' : ''}`}>
            {items!.map((item, idx) => (
              <div key={idx} className="child-wrapper">
                <div className="connector-vertical"></div>
                <SubTaskCard
                  item={item}
                  parentId={cardId}
                  index={idx}
                  onSelectTask={onSelectTask}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// SubIssueCard: 展開可能なカード（3階層目）
const SubIssueCard = ({
  task,
  issueId,
  index,
  onSelectTask,
  highlightCompleted,
  selectedTaskId
}: {
  task: Task;
  issueId: string;
  index: number;
  onSelectTask?: (task: Task) => void;
  highlightCompleted?: boolean;
  selectedTaskId?: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasChildTasks = task.tasks && task.tasks.length > 0;  // 子タスク対応
  const hasDetails = task.outputs || task.description || task.successCriteria;
  const cardId = task.id || `${issueId}-${index + 1}`;
  const isCompleted = task.status === TASK_STATUS.COMPLETED;
  const isSelected = selectedTaskId === task.id;

  // ▶︎アイコンクリック → 展開/折りたたみ
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildTasks || hasSubtasks) {
      setExpanded(!expanded);
    }
  };

  // カード本体クリック → 詳細パネル表示
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDetails && onSelectTask) {
      onSelectTask(task);
    }
  };

  // 完了ハイライト時のスタイル（キラキラ効果）
  const completedStyle = highlightCompleted && isCompleted
    ? 'completed-highlight'
    : '';

  // 選択中のスタイル
  const selectedStyle = isSelected
    ? 'outline outline-4 outline-yellow-400 outline-offset-2 shadow-[0_0_12px_rgba(250,204,21,0.7)]'
    : '';

  return (
    <div className={`tree-node ${highlightCompleted && isCompleted ? 'completed-connector' : ''}`}>
      <div
        onClick={handleCardClick}
        className={`issue-card sub-issue-card ${expanded ? 'issue-card-expanded' : ''} ${hasDetails ? 'cursor-pointer' : ''} ${completedStyle} ${selectedStyle}`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-blue-500">#{cardId}</span>
          <div className="flex items-center gap-2">
            {hasDetails && (
              <span className="text-[10px] text-blue-500 font-bold">
                <i className="fas fa-info-circle"></i>
              </span>
            )}
            {hasChildTasks && (
              <span
                onClick={handleExpandClick}
                className="text-[10px] text-slate-400 hover:text-blue-500 cursor-pointer px-1"
              >
                {expanded ? '▼' : '▶'} {task.tasks!.length}
              </span>
            )}
            {hasSubtasks && !hasChildTasks && (
              <span
                onClick={handleExpandClick}
                className="text-[10px] text-slate-400 hover:text-blue-500 cursor-pointer px-1"
              >
                {expanded ? '▼' : '▶'} {task.subtasks!.length}
              </span>
            )}
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-700 leading-tight">{task.title}</div>
      </div>

      {/* 子タスク（task.tasks）の描画 */}
      {expanded && hasChildTasks && (
        <div className="tree-children">
          <div className="connector-vertical"></div>
          <div className={`children-container ${task.tasks!.length > 1 ? 'has-multiple' : ''}`}>
            {task.tasks!.map((childTask, idx) => (
              <div key={idx} className="child-wrapper">
                <div className="connector-vertical"></div>
                <SubIssueCard
                  task={childTask}
                  issueId={cardId}
                  index={idx}
                  onSelectTask={onSelectTask}
                  highlightCompleted={highlightCompleted}
                  selectedTaskId={selectedTaskId}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* サブタスク（task.subtasks）の描画 */}
      {expanded && hasSubtasks && !hasChildTasks && (
        <div className="tree-children">
          <div className="connector-vertical"></div>
          <div className={`children-container ${task.subtasks!.length > 1 ? 'has-multiple' : ''} ${highlightCompleted && isCompleted ? 'has-completed' : ''}`}>
            {task.subtasks!.map((subtask, idx) => (
              <div key={idx} className={`child-wrapper ${highlightCompleted && isCompleted ? 'completed-connector' : ''}`}>
                <div className="connector-vertical"></div>
                <TaskCard
                  subtask={subtask}
                  parentId={cardId}
                  index={idx}
                  onSelectTask={onSelectTask}
                  highlightCompleted={highlightCompleted}
                  parentCompleted={isCompleted}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const IssueCard = ({
  issue,
  onSelectIssue,
  onSelectTask,
  highlightCompleted,
  selectedIssueId,
  selectedTaskId,
  forceExpand
}: {
  issue: Issue;
  onSelectIssue?: (issue: Issue) => void;
  onSelectTask?: (task: Task) => void;
  highlightCompleted?: boolean;
  selectedIssueId?: string;
  selectedTaskId?: string;
  forceExpand?: boolean | null;
}) => {
  const [expanded, setExpanded] = useState(false);

  // forceExpandが変更されたら同期
  useEffect(() => {
    if (forceExpand !== null && forceExpand !== undefined) {
      setExpanded(forceExpand);
    }
  }, [forceExpand]);
  const isCompleted = issue.status === TASK_STATUS.COMPLETED;
  const isSelected = selectedIssueId === issue.id;

  // ▶アイコンクリック → 展開/折りたたみ
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // カード本体クリック → 詳細パネル表示
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectIssue) {
      onSelectIssue(issue);
    }
  };

  // 完了ハイライト時のスタイル
  const completedStyle = highlightCompleted && isCompleted
    ? 'completed-highlight'
    : '';

  // 選択中のスタイル
  const selectedStyle = isSelected
    ? 'outline outline-4 outline-yellow-400 outline-offset-2 shadow-[0_0_12px_rgba(250,204,21,0.7)]'
    : '';

  return (
    <div className={`tree-node ${highlightCompleted && isCompleted ? 'completed-connector' : ''}`}>
      <div
        onClick={handleCardClick}
        className={`issue-card ${expanded ? 'issue-card-expanded' : ''} ${completedStyle} ${selectedStyle} cursor-pointer`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-blue-500">#{issue.id}</span>
          <span
            onClick={handleExpandClick}
            className="text-sm text-slate-400 hover:text-blue-500 px-2 -mr-2 cursor-pointer"
          >
            {expanded ? '▼' : '▶'} <span className="text-[10px]">{issue.tasks.length}</span>
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-700 leading-tight">{issue.title}</div>
      </div>

      {expanded && issue.tasks.length > 0 && (
        <div className="tree-children">
          <div className="connector-vertical"></div>
          <div className={`children-container ${issue.tasks.length > 1 ? 'has-multiple' : ''} ${highlightCompleted && issue.tasks.some(t => t.status === 'completed') ? 'has-completed' : ''}`}>
            {issue.tasks.map((task, idx) => {
              const isTaskCompleted = highlightCompleted && task.status === 'completed';
              return (
                <div key={idx} className={`child-wrapper ${isTaskCompleted ? 'completed-connector' : ''}`}>
                  <div className="connector-vertical"></div>
                  <SubIssueCard
                    task={task}
                    issueId={issue.id}
                    index={idx}
                    onSelectTask={onSelectTask}
                    highlightCompleted={highlightCompleted}
                    selectedTaskId={selectedTaskId}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Node = ({
  node,
  onSelectIssue,
  onSelectTask,
  onSelectCategory,
  highlightCompleted,
  selectedIssueId,
  selectedTaskId,
  selectedCategoryId,
  forceExpand,
  depth = 0
}: {
  node: StrategyNode;
  onSelectIssue?: (issue: Issue) => void;
  onSelectTask?: (task: Task) => void;
  onSelectCategory?: (category: StrategyNode) => void;
  highlightCompleted?: boolean;
  selectedIssueId?: string;
  selectedTaskId?: string;
  selectedCategoryId?: string;
  forceExpand?: boolean | null;
  depth?: number;
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const hasIssues = node.issues && node.issues.length > 0;
  const hasChildElements = hasChildren || hasIssues;
  const isCompleted = node.status === TASK_STATUS.COMPLETED;
  const isSelected = selectedCategoryId === node.id;

  // 戦略レベル（depth=1）は初期折りたたみ
  const isStrategyLevel = depth === 1;
  const [localExpanded, setLocalExpanded] = useState(!isStrategyLevel);

  // forceExpand が指定されている場合はそちらを優先
  const isExpanded = forceExpand !== null && forceExpand !== undefined
    ? forceExpand
    : localExpanded;

  const allChildren = [
    ...(node.children || []).map(c => ({ type: 'node' as const, id: c.id, data: c })),
    ...(node.issues || []).map(i => ({ type: 'issue' as const, id: i.id, data: i }))
  ];

  // カテゴリカードクリック → 詳細パネル表示
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasIssues && onSelectCategory) {
      onSelectCategory(node);
    }
  };

  // 戦略レベルのクリック → 展開/折りたたみ
  const handleStrategyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalExpanded(prev => !prev);
  };

  // 完了ハイライト時のスタイル（キラキラ効果）
  const completedStyle = highlightCompleted && isCompleted
    ? 'completed-highlight'
    : '';

  // 選択中のスタイル
  const selectedStyle = isSelected
    ? 'outline outline-4 outline-yellow-400 outline-offset-2 shadow-[0_0_12px_rgba(250,204,21,0.7)]'
    : '';

  return (
    <div className={`tree-node ${highlightCompleted && isCompleted ? 'completed-connector' : ''}`}>
      <div
        onClick={isStrategyLevel ? handleStrategyClick : (hasIssues ? handleCategoryClick : undefined)}
        className={`node-box ${
          node.id === 'root' ? 'node-root' : hasIssues ? 'node-with-issues' : 'node-default'
        } ${(hasIssues || isStrategyLevel) ? 'cursor-pointer' : ''} ${completedStyle} ${selectedStyle}`}
      >
        {isStrategyLevel && hasChildElements && (
          <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-slate-400 text-xs mr-1.5`}></i>
        )}
        {node.icon && <i className={`${node.icon} node-icon ${node.id === 'root' ? 'text-white/80' : 'text-blue-500'}`}></i>}
        <h3 className={`node-title ${node.id === 'root' ? 'text-white' : 'text-slate-700'}`}>
          {node.title}
        </h3>
      </div>

      {hasChildElements && isExpanded && (
        <div className="tree-children">
          <div className="connector-vertical"></div>
          <div className={`children-container ${allChildren.length > 1 ? 'has-multiple' : ''}`}>
            {allChildren.map((child) => (
              <div key={child.id} className="child-wrapper">
                <div className="connector-vertical"></div>
                {child.type === 'node' ? (
                  <Node
                    node={child.data}
                    onSelectIssue={onSelectIssue}
                    onSelectTask={onSelectTask}
                    onSelectCategory={onSelectCategory}
                    highlightCompleted={highlightCompleted}
                    selectedIssueId={selectedIssueId}
                    selectedTaskId={selectedTaskId}
                    selectedCategoryId={selectedCategoryId}
                    forceExpand={forceExpand}
                    depth={depth + 1}
                  />
                ) : (
                  <IssueCard
                    issue={child.data}
                    onSelectIssue={onSelectIssue}
                    onSelectTask={onSelectTask}
                    highlightCompleted={highlightCompleted}
                    selectedIssueId={selectedIssueId}
                    selectedTaskId={selectedTaskId}
                    forceExpand={forceExpand}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 成果物からファイルパスを抽出
const extractFilePath = (output: string | TaskOutput): string | null => {
  if (typeof output === 'object') {
    return output.file || null;
  }
  const match = output.match(/^(docs\/[^\s]+\.md)/);
  return match ? match[1] : null;
};

// 成果物のタイトルを取得
const getOutputTitle = (output: string | TaskOutput): string => {
  if (typeof output === 'object') {
    return output.title;
  }
  return output;
};

// 成果物のURLを取得
const getOutputUrl = (output: string | TaskOutput): string | null => {
  if (typeof output === 'object') {
    return output.url || null;
  }
  return null;
};

// 成果物のサマリーを取得
const getOutputSummary = (output: string | TaskOutput): string | null => {
  if (typeof output === 'object') {
    return output.summary || null;
  }
  return null;
};

// ベースパス
const BASE_PATH = import.meta.env.BASE_URL;

// タスク詳細サイドパネル
const TaskDetailPanel = ({
  task,
  onClose,
  width,
  onResizeStart
}: {
  task: Task;
  onClose: () => void;
  width: number;
  onResizeStart: (e: React.MouseEvent) => void;
}) => {
  const status = task.status || TASK_STATUS.PENDING;
  const config = STATUS_CONFIG[status];

  // 成果物の展開状態と内容を管理
  const [expandedOutputs, setExpandedOutputs] = useState<Set<number>>(new Set());
  const [outputContents, setOutputContents] = useState<Record<number, string>>({});
  const [loadingOutputs, setLoadingOutputs] = useState<Set<number>>(new Set());

  // 成果物の内容を取得
  const fetchOutputContent = async (index: number, filePath: string) => {
    if (outputContents[index] || loadingOutputs.has(index)) return;

    setLoadingOutputs(prev => new Set(prev).add(index));
    try {
      const url = `${BASE_PATH}data/github_sim3/${filePath}`;
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        setOutputContents(prev => ({ ...prev, [index]: text }));
      }
    } catch (err) {
      console.error('成果物の取得に失敗:', err);
    } finally {
      setLoadingOutputs(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  // 成果物の展開/折りたたみ
  const toggleOutputExpand = (index: number, filePath: string | null) => {
    const isExpanded = expandedOutputs.has(index);
    if (isExpanded) {
      setExpandedOutputs(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    } else {
      setExpandedOutputs(prev => new Set(prev).add(index));
      if (filePath) {
        fetchOutputContent(index, filePath);
      }
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: `${width}px`,
        background: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* リサイズハンドル */}
      <div
        onMouseDown={onResizeStart}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '6px',
          cursor: 'col-resize',
          background: 'transparent',
          zIndex: 10
        }}
        className="hover:bg-blue-400 transition-colors"
      />
      {/* ヘッダー */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${config.color}`}>
            {config.label}
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <h3 className="text-xl font-bold text-slate-800 leading-tight">{task.title}</h3>
        {task.completedDate && (
          <div className="mt-2 text-sm text-slate-500">
            <i className="fas fa-calendar-check mr-2 text-green-500"></i>
            {task.completedDate} 完了
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 詳細説明 */}
        {task.description && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-align-left mr-2 text-blue-500"></i>
              詳細説明
            </div>
            <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed whitespace-pre-line">
              {task.description}
            </div>
          </div>
        )}

        {/* 成果物サマリー */}
        {task.outputsSummary && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-clipboard-check mr-2 text-emerald-500"></i>
              成果物サマリー
            </div>
            <div className="text-sm text-slate-700 bg-emerald-50 p-4 rounded-xl leading-relaxed border border-emerald-100 whitespace-pre-line">
              {task.outputsSummary}
            </div>
          </div>
        )}

        {/* 完了条件 */}
        {task.successCriteria && task.successCriteria.length > 0 && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-check-circle mr-2 text-amber-500"></i>
              完了条件
            </div>
            <div className="space-y-2">
              {task.successCriteria.map((criteria, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 text-sm bg-amber-50 p-3 rounded-xl border border-amber-100"
                >
                  <i className={`fas ${status === TASK_STATUS.COMPLETED ? 'fa-check-square text-green-500' : 'fa-square text-slate-300'} mt-0.5`}></i>
                  <span className={status === TASK_STATUS.COMPLETED ? 'text-slate-500' : 'text-slate-700'}>
                    {criteria}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 成果物 */}
        {task.outputs && task.outputs.length > 0 && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-file-alt mr-2 text-emerald-500"></i>
              成果物
            </div>
            <div className="space-y-2">
              {task.outputs.map((output, i) => {
                const filePath = extractFilePath(output);
                const outputUrl = getOutputUrl(output);
                const outputSummary = getOutputSummary(output);
                const isExpanded = expandedOutputs.has(i);
                const isLoading = loadingOutputs.has(i);
                const content = outputContents[i];
                const hasFile = !!filePath;
                const hasUrl = !!outputUrl;

                // URLのみの場合はシンプル表示（展開なし）
                if (hasUrl && !hasFile) {
                  return (
                    <a
                      key={i}
                      href={outputUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-external-link-alt text-emerald-500"></i>
                        <div>
                          <div className="text-sm font-medium text-slate-700">{getOutputTitle(output)}</div>
                          {outputSummary && (
                            <div className="text-xs text-slate-500">{outputSummary}</div>
                          )}
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-emerald-300"></i>
                    </a>
                  );
                }

                return (
                  <div key={i}>
                    {/* ヘッダー（クリックで展開/折りたたみ） */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOutputExpand(i, filePath);
                      }}
                      className={`flex items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors ${isExpanded ? 'rounded-b-none border-b-0' : ''}`}
                    >
                      <i className={`fas ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'} text-emerald-500 w-4 mr-3`}></i>
                      <div>
                        <div className="text-sm font-medium text-slate-700">{getOutputTitle(output)}</div>
                        {filePath && (
                          <div className="text-xs text-slate-400">{filePath}</div>
                        )}
                      </div>
                    </div>

                    {/* 展開時の内容表示 */}
                    {isExpanded && (
                      <div className="p-4 bg-white border border-emerald-100 rounded-b-xl border-t-0 max-h-80 overflow-y-auto">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-4 text-slate-400">
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            読み込み中...
                          </div>
                        ) : content ? (
                          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">{content}</pre>
                        ) : (
                          <div className="text-sm text-slate-400">内容を取得できませんでした</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* リンク */}
        {task.links && task.links.length > 0 && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-link mr-2 text-purple-500"></i>
              参考リンク
            </div>
            <div className="space-y-2">
              {task.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-external-link-alt text-purple-500"></i>
                    <span className="text-sm font-medium text-slate-700">{link.title}</span>
                  </div>
                  <i className="fas fa-chevron-right text-purple-300"></i>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* メモ */}
        {task.notes && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-sticky-note mr-2 text-slate-400"></i>
              メモ
            </div>
            <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
              {task.notes}
            </div>
          </div>
        )}

        {/* 何も情報がない場合 */}
        {!task.description && (!task.successCriteria || task.successCriteria.length === 0) &&
         (!task.outputs || task.outputs.length === 0) && (!task.links || task.links.length === 0) && !task.notes && (
          <div className="text-center py-10">
            <i className="fas fa-info-circle text-4xl text-slate-200 mb-3"></i>
            <p className="text-slate-400">詳細情報がありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

// カテゴリ詳細パネル
const CategoryDetailPanel = ({
  category,
  onClose,
  onSelectIssue,
  width,
  onResizeStart
}: {
  category: StrategyNode;
  onClose: () => void;
  onSelectIssue?: (issue: Issue) => void;
  width: number;
  onResizeStart: (e: React.MouseEvent) => void;
}) => {
  const status = category.status || TASK_STATUS.PENDING;
  const config = STATUS_CONFIG[status as TaskStatusType];

  // Issue の進捗計算
  const issues = category.issues || [];
  const completedIssues = issues.filter(i => i.status === TASK_STATUS.COMPLETED).length;
  const totalIssues = issues.length;
  const progressPercent = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

  // 全タスクの進捗計算
  const allTasks = issues.flatMap(i => i.tasks || []);
  const completedTasks = allTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
  const totalTasks = allTasks.length;
  const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: `${width}px`,
        background: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* リサイズハンドル */}
      <div
        onMouseDown={onResizeStart}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '6px',
          cursor: 'col-resize',
          background: 'transparent',
          zIndex: 10
        }}
        className="hover:bg-blue-400 transition-colors"
      />
      {/* ヘッダー */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${config.color}`}>
            {config.label}
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="text-[10px] font-bold text-purple-500 mb-1">#{category.id}</div>
        <h3 className="text-xl font-bold text-slate-800 leading-tight">{category.title}</h3>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Issue進捗 */}
        <div>
          <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
            <i className="fas fa-folder mr-2 text-blue-500"></i>
            Issue進捗 ({completedIssues}/{totalIssues})
          </div>
          <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-right text-xs text-slate-400 mt-1">{progressPercent}% 完了</div>
        </div>

        {/* タスク進捗 */}
        <div>
          <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
            <i className="fas fa-tasks mr-2 text-emerald-500"></i>
            タスク進捗 ({completedTasks}/{totalTasks})
          </div>
          <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${taskProgressPercent}%` }}
            />
          </div>
          <div className="text-right text-xs text-slate-400 mt-1">{taskProgressPercent}% 完了</div>
        </div>

        {/* Issue一覧 */}
        {issues.length > 0 && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-list mr-2 text-purple-500"></i>
              Issue一覧
            </div>
            <div className="space-y-2">
              {issues.map((issue, i) => {
                const issueStatus = issue.status || TASK_STATUS.PENDING;
                const issueConfig = STATUS_CONFIG[issueStatus as TaskStatusType];
                return (
                  <div
                    key={i}
                    onClick={() => onSelectIssue?.(issue)}
                    className={`flex items-center p-3 rounded-xl border cursor-pointer hover:bg-slate-50 ${
                      issueStatus === TASK_STATUS.COMPLETED
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <i className={`${issueConfig.icon} ${issueConfig.color.split(' ')[2]} w-4 mr-3`}></i>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">{issue.title}</div>
                      <div className="text-[10px] text-slate-400">#{issue.id}</div>
                    </div>
                    <i className="fas fa-chevron-right text-slate-300"></i>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 何も情報がない場合 */}
        {issues.length === 0 && (
          <div className="text-center py-10">
            <i className="fas fa-info-circle text-4xl text-slate-200 mb-3"></i>
            <p className="text-slate-400">Issueがありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Issue詳細パネル
const IssueDetailPanel = ({
  issue,
  onClose,
  onSelectTask,
  width,
  onResizeStart
}: {
  issue: Issue;
  onClose: () => void;
  onSelectTask?: (task: Task) => void;
  width: number;
  onResizeStart: (e: React.MouseEvent) => void;
}) => {
  const status = issue.status || TASK_STATUS.PENDING;
  const config = STATUS_CONFIG[status as TaskStatusType];

  // タスクの進捗計算
  const completedTasks = issue.tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
  const totalTasks = issue.tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: `${width}px`,
        background: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* リサイズハンドル */}
      <div
        onMouseDown={onResizeStart}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '6px',
          cursor: 'col-resize',
          background: 'transparent',
          zIndex: 10
        }}
        className="hover:bg-blue-400 transition-colors"
      />
      {/* ヘッダー */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${config.color}`}>
            {config.label}
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="text-[10px] font-bold text-blue-500 mb-1">#{issue.id}</div>
        <h3 className="text-xl font-bold text-slate-800 leading-tight">{issue.title}</h3>
        {issue.completedDate && (
          <div className="mt-2 text-sm text-slate-500">
            <i className="fas fa-calendar-check mr-2 text-green-500"></i>
            {issue.completedDate} 完了
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 説明（context） */}
        {issue.context && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-info-circle mr-2 text-blue-500"></i>
              概要
            </div>
            <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed">
              {issue.context}
            </div>
          </div>
        )}

        {/* 詳細説明 */}
        {issue.description && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-align-left mr-2 text-blue-500"></i>
              詳細説明
            </div>
            <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed whitespace-pre-line">
              {issue.description}
            </div>
          </div>
        )}

        {/* 成果物サマリー */}
        {issue.outputsSummary && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-clipboard-check mr-2 text-emerald-500"></i>
              成果物サマリー
            </div>
            <div className="text-sm text-slate-700 bg-emerald-50 p-4 rounded-xl leading-relaxed border border-emerald-100 whitespace-pre-line">
              {issue.outputsSummary}
            </div>
          </div>
        )}

        {/* 完了条件 */}
        {issue.successCriteria && issue.successCriteria.length > 0 && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-check-circle mr-2 text-amber-500"></i>
              完了条件
            </div>
            <div className="space-y-2">
              {issue.successCriteria.map((criteria, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 text-sm bg-amber-50 p-3 rounded-xl border border-amber-100"
                >
                  <i className={`fas ${status === TASK_STATUS.COMPLETED ? 'fa-check-square text-green-500' : 'fa-square text-slate-300'} mt-0.5`}></i>
                  <span className={status === TASK_STATUS.COMPLETED ? 'text-slate-500' : 'text-slate-700'}>
                    {criteria}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* メモ */}
        {issue.notes && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-sticky-note mr-2 text-slate-400"></i>
              メモ
            </div>
            <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl whitespace-pre-line">
              {issue.notes}
            </div>
          </div>
        )}

        {/* 進捗 */}
        <div>
          <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
            <i className="fas fa-tasks mr-2 text-emerald-500"></i>
            進捗 ({completedTasks}/{totalTasks})
          </div>
          <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-right text-xs text-slate-400 mt-1">{progressPercent}% 完了</div>
        </div>

        {/* タスク一覧 */}
        {issue.tasks.length > 0 && (
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
              <i className="fas fa-list mr-2 text-purple-500"></i>
              タスク一覧
            </div>
            <div className="space-y-2">
              {issue.tasks.map((task, i) => {
                const taskStatus = task.status || TASK_STATUS.PENDING;
                const taskConfig = STATUS_CONFIG[taskStatus];
                const hasDetails = task.outputs || task.description || task.successCriteria;
                return (
                  <div
                    key={i}
                    onClick={() => hasDetails && onSelectTask?.(task)}
                    className={`flex items-center p-3 rounded-xl border ${hasDetails ? 'cursor-pointer hover:bg-slate-50' : ''} ${
                      taskStatus === TASK_STATUS.COMPLETED
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <i className={`${taskConfig.icon} ${taskConfig.color.split(' ')[2]} w-4 mr-3`}></i>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">{task.title}</div>
                      {task.id && (
                        <div className="text-[10px] text-slate-400">#{task.id}</div>
                      )}
                    </div>
                    {hasDetails && (
                      <i className="fas fa-chevron-right text-slate-300"></i>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 何も情報がない場合 */}
        {!issue.context && issue.tasks.length === 0 && (
          <div className="text-center py-10">
            <i className="fas fa-info-circle text-4xl text-slate-200 mb-3"></i>
            <p className="text-slate-400">詳細情報がありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const TreeView = ({ strategyData, onNavigate: _onNavigate }: TreeViewProps) => {
  const [scale, setScale] = useState(1);
  const [treeDimensions, setTreeDimensions] = useState({ width: 0, height: 0 });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<StrategyNode | null>(null);
  const [panelWidth, setPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [highlightCompleted, setHighlightCompleted] = useState(false);
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const treeContentRef = useRef<HTMLDivElement>(null);
  const userZoomedRef = useRef(false); // ユーザーが手動でズームしたかどうか

  // パネルリサイズ処理
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.min(window.innerWidth * 0.75, Math.max(400, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // パディング設定（定数）
  const PADDING = 40;
  const DEPTH_PADDING = 80; // 1階層あたりの追加パディング

  // ツリーの最大深度を計算
  const treeDepth = useMemo(() => calculateTreeDepth(strategyData), [strategyData]);
  const dynamicBottomPadding = PADDING + (treeDepth * DEPTH_PADDING);

  // 自動フィット計算
  const calculateFit = (force = false) => {
    // ユーザーが手動でズームした場合は自動フィットしない（forceでない限り）
    if (userZoomedRef.current && !force) return;
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const rect = measure.getBoundingClientRect();
    const treeWidth = Math.max(rect.width, measure.scrollWidth);
    const treeHeight = Math.max(rect.height, measure.scrollHeight);
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (treeWidth === 0 || treeHeight === 0) {
      setTimeout(calculateFit, 100);
      return;
    }

    setTreeDimensions({ width: treeWidth, height: treeHeight });

    const scrollBarWidth = 20;
    const availableWidth = containerWidth - (PADDING * 2) - scrollBarWidth;
    const availableHeight = containerHeight - (PADDING * 2);

    const scaleX = availableWidth / treeWidth;
    const scaleY = availableHeight / treeHeight;
    let newScale = Math.min(scaleX, scaleY);

    newScale = newScale * 0.90;
    newScale = Math.max(0.1, Math.min(1.0, newScale));

    setScale(newScale);
  };

  useEffect(() => {
    const timer = setTimeout(calculateFit, 100);

    const handleResize = () => calculateFit();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => calculateFit());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [strategyData]);

  // ツリーコンテンツのサイズ変化を監視（展開/折りたたみ対応）
  useEffect(() => {
    const el = treeContentRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width > 0 && height > 0) {
        setTreeDimensions({ width, height });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ピンチズーム
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();

        const delta = -e.deltaY * 0.01;
        const oldScale = scale;
        const newScale = Math.max(0.1, Math.min(1.5, oldScale + delta));

        if (oldScale === newScale) return;

        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left + container.scrollLeft;
        const cursorY = e.clientY - rect.top + container.scrollTop;

        const scaleRatio = newScale / oldScale;
        const newScrollLeft = cursorX * scaleRatio - (e.clientX - rect.left);
        const newScrollTop = cursorY * scaleRatio - (e.clientY - rect.top);

        setScale(newScale);
        userZoomedRef.current = true; // ユーザーが手動でズーム

        requestAnimationFrame(() => {
          container.scrollLeft = newScrollLeft;
          container.scrollTop = newScrollTop;
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scale]);

  const handleZoom = (delta: number) => {
    userZoomedRef.current = true; // ユーザーが手動でズーム
    setScale(prev => Math.max(0.1, Math.min(1.5, prev + delta)));
  };

  const handleFit = () => {
    userZoomedRef.current = false; // フィットボタンでリセット
    calculateFit(true);
  };

  return (
    <div
      ref={containerRef}
      onClick={() => { setSelectedTask(null); setSelectedIssue(null); setSelectedCategory(null); }}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: '#f8fafc',
        position: 'relative'
      }}
    >
      {/* 非表示の測定用 */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          left: 0,
          top: 0
        }}
      >
        <Node node={strategyData} onSelectIssue={() => {}} onSelectTask={() => {}} onSelectCategory={() => {}} />
      </div>

      {/* 表示用：スクロール可能なコンテンツ */}
      <div
        style={{
          display: 'inline-block',
          minWidth: '100%',
          minHeight: '100%',
          padding: PADDING,
          paddingBottom: dynamicBottomPadding,
          boxSizing: 'border-box',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            display: 'inline-block',
            width: treeDimensions.width * scale,
            height: treeDimensions.height * scale,
            position: 'relative',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            <div ref={treeContentRef}>
              <Node node={strategyData} onSelectIssue={(issue) => { setSelectedIssue(issue); setSelectedTask(null); setSelectedCategory(null); }} onSelectTask={(task) => { setSelectedTask(task); setSelectedIssue(null); setSelectedCategory(null); }} onSelectCategory={(category) => { setSelectedCategory(category); setSelectedTask(null); setSelectedIssue(null); }} highlightCompleted={highlightCompleted} selectedIssueId={selectedIssue?.id} selectedTaskId={selectedTask?.id} selectedCategoryId={selectedCategory?.id} forceExpand={expandAll} />
            </div>
          </div>
        </div>
      </div>

      {/* タスク詳細パネル */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          width={panelWidth}
          onResizeStart={handleResizeStart}
        />
      )}

      {/* Issue詳細パネル */}
      {selectedIssue && (
        <IssueDetailPanel
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onSelectTask={(task) => { setSelectedTask(task); setSelectedIssue(null); }}
          width={panelWidth}
          onResizeStart={handleResizeStart}
        />
      )}

      {/* カテゴリ詳細パネル */}
      {selectedCategory && (
        <CategoryDetailPanel
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          onSelectIssue={(issue) => { setSelectedIssue(issue); setSelectedCategory(null); }}
          width={panelWidth}
          onResizeStart={handleResizeStart}
        />
      )}

      {/* リサイズ中のオーバーレイ */}
      {isResizing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            cursor: 'col-resize',
            zIndex: 150
          }}
        />
      )}

      {/* ズームコントロール */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          padding: '8px',
          zIndex: 50
        }}
      >
        <button
          onClick={() => handleZoom(-0.05)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}
        >
          <i className="fas fa-minus"></i>
        </button>
        <span style={{
          padding: '0 8px',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#475569',
          minWidth: '45px',
          textAlign: 'center'
        }}>
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => handleZoom(0.05)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}
        >
          <i className="fas fa-plus"></i>
        </button>
        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }}></div>
        <button
          onClick={handleFit}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#3b82f6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
          title="画面にフィット"
        >
          <i className="fas fa-expand"></i>
        </button>
        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }}></div>
        <button
          onClick={() => setExpandAll(true)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}
          title="全て展開"
        >
          <i className="fas fa-angle-double-down"></i>
        </button>
        <button
          onClick={() => setExpandAll(false)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}
          title="全て折りたたむ"
        >
          <i className="fas fa-angle-double-up"></i>
        </button>
        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }}></div>
        <button
          onClick={() => setHighlightCompleted(!highlightCompleted)}
          style={{
            height: '36px',
            borderRadius: '10px',
            background: highlightCompleted ? '#10b981' : '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 12px',
            gap: '6px',
            color: highlightCompleted ? 'white' : '#475569',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          title="完了タスクをハイライト"
        >
          <i className="fas fa-check-circle"></i>
          <span>完了</span>
        </button>
      </div>
    </div>
  );
};
