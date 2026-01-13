import { useState, useEffect, useRef } from 'react';
import { StrategyNode, Issue, Subtask, SubtaskItem, TaskOutput } from '../types';
import './TreeView.css';

interface TreeViewProps {
  strategyData: StrategyNode;
  onNavigate: (issue: Issue) => void;
}

// 成果物表示用の型
interface SelectedTask {
  title: string;
  outputs: (string | TaskOutput)[];
}

// SubTaskCard: タスクカード（5階層目以降）- outputsは展開しない
const SubTaskCard = ({
  item,
  onSelectTask,
}: {
  item: string | SubtaskItem;
  parentId: string;
  index: number;
  onSelectTask?: (task: SelectedTask) => void;
}) => {
  // itemがオブジェクトかどうかを判定
  const isObject = typeof item === 'object';
  const title = isObject ? item.title : item;
  const outputs = isObject ? item.outputs : undefined;
  const hasOutputs = outputs && outputs.length > 0;

  const handleClick = () => {
    if (hasOutputs && onSelectTask) {
      onSelectTask({ title, outputs: outputs! });
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
  onSelectTask
}: {
  subtask: string | Subtask;
  parentId: string;
  index: number;
  onSelectTask?: (task: SelectedTask) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const cardId = `${parentId}-${index + 1}`;

  // subtaskがオブジェクトかどうかを判定
  const isObject = typeof subtask === 'object';
  const title = isObject ? subtask.title : subtask;
  const items = isObject ? subtask.items : undefined;
  const hasItems = items && items.length > 0;

  const handleClick = () => {
    if (hasItems) {
      setExpanded(!expanded);
    }
  };

  return (
    <div className="tree-node">
      <div
        onClick={handleClick}
        className={`issue-card task-card ${expanded ? 'issue-card-expanded' : ''} ${hasItems ? 'cursor-pointer' : ''}`}
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
  onSelectTask
}: {
  task: { title: string; status?: string; subtasks?: (string | Subtask)[]; outputs?: (string | TaskOutput)[] };
  issueId: string;
  index: number;
  onSelectTask?: (task: SelectedTask) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasOutputs = task.outputs && task.outputs.length > 0;
  const cardId = `${issueId}-${index + 1}`;

  const handleClick = () => {
    // outputsがある場合は詳細パネルを開く
    if (hasOutputs && onSelectTask) {
      onSelectTask({ title: task.title, outputs: task.outputs! });
    } else if (hasSubtasks) {
      setExpanded(!expanded);
    }
  };

  return (
    <div className="tree-node">
      <div
        onClick={handleClick}
        className={`issue-card sub-issue-card ${expanded ? 'issue-card-expanded' : ''} ${(hasSubtasks || hasOutputs) ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-blue-500">#{cardId}</span>
          {hasOutputs ? (
            <span className="text-[10px] text-purple-500 font-bold">
              📎 {task.outputs!.length}
            </span>
          ) : hasSubtasks ? (
            <span className="text-[10px] text-slate-400">
              {expanded ? '▼' : '▶'} {task.subtasks!.length}
            </span>
          ) : null}
        </div>
        <div className="text-xs font-semibold text-slate-700 leading-tight">{task.title}</div>
      </div>

      {expanded && hasSubtasks && !hasOutputs && (
        <div className="tree-children">
          <div className="connector-vertical"></div>
          <div className={`children-container ${task.subtasks!.length > 1 ? 'has-multiple' : ''}`}>
            {task.subtasks!.map((subtask, idx) => (
              <div key={idx} className="child-wrapper">
                <div className="connector-vertical"></div>
                <TaskCard
                  subtask={subtask}
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

const IssueCard = ({
  issue,
  onNavigate: _onNavigate,
  onSelectTask
}: {
  issue: Issue;
  onNavigate: (issue: Issue) => void;
  onSelectTask?: (task: SelectedTask) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  // _onNavigate は将来の詳細表示機能用に保持

  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="tree-node">
      <div
        onClick={handleClick}
        className={`issue-card ${expanded ? 'issue-card-expanded' : ''}`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-blue-500">#{issue.id}</span>
          <span className="text-[10px] text-slate-400">
            {expanded ? '▼' : '▶'} {issue.tasks.length}
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-700 leading-tight">{issue.title}</div>
      </div>

      {expanded && issue.tasks.length > 0 && (
        <div className="tree-children">
          <div className="connector-vertical"></div>
          <div className={`children-container ${issue.tasks.length > 1 ? 'has-multiple' : ''}`}>
            {issue.tasks.map((task, idx) => (
              <div key={idx} className="child-wrapper">
                <div className="connector-vertical"></div>
                <SubIssueCard
                  task={task}
                  issueId={issue.id}
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

const Node = ({
  node,
  onNavigate,
  onSelectTask
}: {
  node: StrategyNode;
  onNavigate: (issue: Issue) => void;
  onSelectTask?: (task: SelectedTask) => void;
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const hasIssues = node.issues && node.issues.length > 0;
  const hasChildElements = hasChildren || hasIssues;

  const allChildren = [
    ...(node.children || []).map(c => ({ type: 'node' as const, id: c.id, data: c })),
    ...(node.issues || []).map(i => ({ type: 'issue' as const, id: i.id, data: i }))
  ];

  return (
    <div className="tree-node">
      <div className={`node-box ${
        node.id === 'root' ? 'node-root' : hasIssues ? 'node-with-issues' : 'node-default'
      }`}>
        {node.icon && <i className={`${node.icon} node-icon ${node.id === 'root' ? 'text-white/80' : 'text-blue-500'}`}></i>}
        <h3 className={`node-title ${node.id === 'root' ? 'text-white' : 'text-slate-700'}`}>
          {node.title}
        </h3>
      </div>

      {hasChildElements && (
        <div className="tree-children">
          <div className="connector-vertical"></div>
          <div className={`children-container ${allChildren.length > 1 ? 'has-multiple' : ''}`}>
            {allChildren.map((child) => (
              <div key={child.id} className="child-wrapper">
                <div className="connector-vertical"></div>
                {child.type === 'node' ? (
                  <Node
                    node={child.data}
                    onNavigate={onNavigate}
                    onSelectTask={onSelectTask}
                  />
                ) : (
                  <IssueCard
                    issue={child.data}
                    onNavigate={onNavigate}
                    onSelectTask={onSelectTask}
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

// GitHub URL を構築
const getGitHubUrl = (filePath: string): string => {
  return `https://github.com/aitsukaikumano-prog/myplan/blob/main/github_sim3/${filePath}`;
};

// 詳細パネル: 成果物を表示
const DetailPanel = ({
  task,
  onClose
}: {
  task: SelectedTask;
  onClose: () => void;
}) => {
  const handleOutputClick = (output: string | TaskOutput) => {
    // URLがある場合はそのまま開く
    if (typeof output === 'object' && output.url) {
      window.open(output.url, '_blank');
      return;
    }
    const filePath = extractFilePath(output);
    if (filePath) {
      window.open(getGitHubUrl(filePath), '_blank');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '360px',
        background: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* ヘッダー */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f8fafc'
      }}>
        <div>
          <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-600 rounded font-bold">成果物</span>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#1e293b',
            marginTop: '8px',
            lineHeight: 1.4
          }}>
            {task.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* 成果物リスト */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          marginBottom: '12px'
        }}>
          {task.outputs.length}件の成果物
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {task.outputs.map((output, idx) => {
            const filePath = extractFilePath(output);
            const hasUrl = typeof output === 'object' && output.url;
            const isLink = !!filePath || hasUrl;
            const title = getOutputTitle(output);

            return (
              <div
                key={idx}
                onClick={() => isLink && handleOutputClick(output)}
                style={{
                  padding: '12px 14px',
                  background: '#faf5ff',
                  borderRadius: '10px',
                  border: '1px solid #e9d5ff',
                  fontSize: '13px',
                  color: '#581c87',
                  lineHeight: 1.5,
                  cursor: isLink ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  if (isLink) {
                    e.currentTarget.style.background = '#f3e8ff';
                    e.currentTarget.style.borderColor = '#c084fc';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#faf5ff';
                  e.currentTarget.style.borderColor = '#e9d5ff';
                }}
              >
                <div>
                  <span style={{ marginRight: '8px', opacity: 0.6 }}>📎</span>
                  {title}
                  {filePath && (
                    <span style={{ marginLeft: '8px', fontSize: '11px', opacity: 0.6 }}>({filePath})</span>
                  )}
                </div>
                {isLink && (
                  <i className="fas fa-external-link-alt" style={{ opacity: 0.5, fontSize: '11px' }}></i>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const TreeView = ({ strategyData, onNavigate }: TreeViewProps) => {
  const [scale, setScale] = useState(1);
  const [treeDimensions, setTreeDimensions] = useState({ width: 0, height: 0 });
  const [selectedTask, setSelectedTask] = useState<SelectedTask | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const userZoomedRef = useRef(false); // ユーザーが手動でズームしたかどうか

  // パディング設定（定数）
  const PADDING = 40;

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
        <Node node={strategyData} onNavigate={() => {}} onSelectTask={() => {}} />
      </div>

      {/* 表示用：スクロール可能なコンテンツ */}
      <div
        style={{
          display: 'inline-block',
          minWidth: '100%',
          minHeight: '100%',
          padding: PADDING,
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
            <Node node={strategyData} onNavigate={onNavigate} onSelectTask={setSelectedTask} />
          </div>
        </div>
      </div>

      {/* 詳細パネル */}
      {selectedTask && (
        <DetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {/* ズームコントロール */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
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
      </div>
    </div>
  );
};
