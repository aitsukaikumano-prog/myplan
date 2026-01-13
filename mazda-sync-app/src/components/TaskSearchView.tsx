import { useState, useMemo } from 'react';
import { StrategyNode, Issue, Task, TaskOutput, TASK_STATUS, STATUS_CONFIG } from '../types';

interface TaskSearchViewProps {
  strategyData: StrategyNode;
  onNavigate: (issue: Issue) => void;
}

interface IssueWithPath {
  issue: Issue;
  path: string[];
}

// 成果物の数を取得
const getOutputsCount = (outputs?: (string | TaskOutput)[]): number => {
  return outputs?.length || 0;
};

// 成果物のタイトルを取得
const getOutputTitle = (output: string | TaskOutput): string => {
  if (typeof output === 'string') {
    return output;
  }
  return output.title;
};

// 成果物のファイルパスまたはURLを取得
const getOutputPath = (output: string | TaskOutput): string | undefined => {
  if (typeof output === 'string') {
    const match = output.match(/^([^\s-]+)/);
    return match?.[1];
  }
  return output.file || output.url;
};

// ベースパス
const BASE_PATH = import.meta.env.BASE_URL;

// タスク詳細サイドパネル
const TaskDetailPanel = ({ task, onClose }: { task: Task; onClose: () => void }) => {
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
    <div className="h-full flex flex-col bg-white border-l-2 border-slate-200">
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
            <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed">
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
            <div className="text-sm text-slate-700 bg-emerald-50 p-4 rounded-xl leading-relaxed border border-emerald-100">
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
                const filePath = getOutputPath(output);
                const isExpanded = expandedOutputs.has(i);
                const isLoading = loadingOutputs.has(i);
                const content = outputContents[i];

                return (
                  <div key={i}>
                    {/* ヘッダー（クリックで展開/折りたたみ） */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOutputExpand(i, filePath || null);
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

export const TaskSearchView = ({ strategyData, onNavigate }: TaskSearchViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const allIssues = useMemo(() => {
    const issues: IssueWithPath[] = [];

    const traverse = (node: StrategyNode, path: string[]) => {
      const currentPath = [...path, node.title];

      if (node.issues) {
        node.issues.forEach(issue => {
          issues.push({ issue, path: currentPath });
        });
      }

      if (node.children) {
        node.children.forEach(child => traverse(child, currentPath));
      }
    };

    traverse(strategyData, []);
    return issues;
  }, [strategyData]);

  const filteredIssues = useMemo(() => {
    if (!searchTerm.trim()) return allIssues;
    const term = searchTerm.toLowerCase();
    return allIssues.filter(item =>
      item.issue.title.toLowerCase().includes(term) ||
      item.issue.id.toLowerCase().includes(term) ||
      item.issue.tasks.some(t => t.title.toLowerCase().includes(term))
    );
  }, [allIssues, searchTerm]);

  return (
    <div className="h-full flex">
      {/* 左側: タスク一覧 */}
      <div className={`${selectedTask ? 'w-[60%]' : 'w-full'} h-full overflow-y-auto transition-all duration-300`}>
        <div className="p-10 max-w-4xl mx-auto pb-20">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-6">タスク検索</h2>
            <div className="relative">
              <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-xl text-slate-400"></i>
              <input
                type="text"
                placeholder="タスク名、Issue ID で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 text-lg border-2 border-slate-200 rounded-3xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-6 pb-10">
            {filteredIssues.map((item, idx) => {
              const completedCount = item.issue.tasks.filter(t => (t.status || TASK_STATUS.PENDING) === TASK_STATUS.COMPLETED).length;
              const totalCount = item.issue.tasks.length;
              const progress = Math.round((completedCount / totalCount) * 100);

              return (
                <div key={idx} className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden hover:border-blue-200 transition-all">
                  {/* Issueヘッダー */}
                  <div className="p-6 border-b border-slate-100">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                      {item.path.slice(1).join(' > ')}
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onNavigate(item.issue)}
                        className="text-xl font-bold text-blue-600 hover:text-blue-700 text-left"
                      >
                        {item.issue.title} <i className="fas fa-external-link-alt text-xs ml-2"></i>
                      </button>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-slate-500">{completedCount}/{totalCount}</span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* タスク一覧 */}
                  <div className="p-4 space-y-2">
                    {item.issue.tasks.map((task, taskIdx) => {
                      const status = task.status || TASK_STATUS.PENDING;
                      const config = STATUS_CONFIG[status];
                      const outputsCount = getOutputsCount(task.outputs);
                      const linksCount = task.links?.length || 0;
                      const isSelected = selectedTask === task;

                      return (
                        <div
                          key={taskIdx}
                          className={`flex items-center space-x-3 p-3 rounded-xl transition-colors cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100 ring-2 ring-blue-300' : ''}`}
                          onClick={() => setSelectedTask(isSelected ? null : task)}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 shrink-0 ${config.color}`}>
                            <i className={`${config.icon} text-xs`}></i>
                          </div>
                          <span className={`text-sm font-medium flex-1 ${status === TASK_STATUS.COMPLETED ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.title}
                          </span>
                          <div className="flex items-center space-x-2 shrink-0">
                            {outputsCount > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <i className="fas fa-file-alt mr-1"></i>{outputsCount}
                              </span>
                            )}
                            {linksCount > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                                <i className="fas fa-link mr-1"></i>{linksCount}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.color}`}>
                              {config.label}
                            </span>
                            <i className={`fas fa-chevron-right text-slate-300 ${isSelected ? 'text-blue-400' : ''}`}></i>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredIssues.length === 0 && (
              <div className="text-center py-20">
                <i className="fas fa-search text-6xl text-slate-200 mb-4"></i>
                <p className="text-xl text-slate-400 font-semibold">
                  {searchTerm ? '該当するタスクが見つかりませんでした' : '検索キーワードを入力してください'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右側: タスク詳細パネル */}
      {selectedTask && (
        <div className="w-[40%] h-full">
          <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
        </div>
      )}
    </div>
  );
};
