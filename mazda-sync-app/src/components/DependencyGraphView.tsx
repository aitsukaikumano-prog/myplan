import { useEffect, useRef, useState, useMemo } from 'react';
import mermaid from 'mermaid';
import { StrategyNode, Task, Issue, TASK_STATUS, STATUS_CONFIG, TaskOutput } from '../types';

interface Props {
  strategyData: StrategyNode;
}

// タスクツリーからID→ステータスのマップを構築
function extractTaskStatuses(node: StrategyNode): Map<string, string> {
  const map = new Map<string, string>();

  const walkTasks = (tasks: Task[]) => {
    for (const task of tasks) {
      if (task.id) {
        map.set(task.id, task.status || 'pending');
      }
      if (task.tasks) walkTasks(task.tasks);
    }
  };

  const walkNode = (n: StrategyNode) => {
    if (n.issues) {
      for (const issue of n.issues) {
        walkTasks(issue.tasks);
      }
    }
    if (n.children) {
      for (const child of n.children) {
        walkNode(child);
      }
    }
  };

  walkNode(node);
  return map;
}

// タスクIDで、タスク本体と親Issueを検索
function findTaskWithIssue(
  node: StrategyNode,
  taskId: string
): { task: Task; issue: Issue } | null {
  const searchTasks = (tasks: Task[], issue: Issue): { task: Task; issue: Issue } | null => {
    for (const task of tasks) {
      if (task.id === taskId) return { task, issue };
      if (task.tasks) {
        const found = searchTasks(task.tasks, issue);
        if (found) return found;
      }
    }
    return null;
  };

  const walkNode = (n: StrategyNode): { task: Task; issue: Issue } | null => {
    if (n.issues) {
      for (const issue of n.issues) {
        if (issue.tasks) {
          const found = searchTasks(issue.tasks, issue);
          if (found) return found;
        }
      }
    }
    if (n.children) {
      for (const child of n.children) {
        const found = walkNode(child);
        if (found) return found;
      }
    }
    return null;
  };

  return walkNode(node);
}

function statusClass(taskStatuses: Map<string, string>, id: string): string {
  const s = taskStatuses.get(id) || 'pending';
  if (s === 'completed') return 'done';
  if (s === 'in_progress') return 'wip';
  return 'todo';
}

function buildGraph(taskStatuses: Map<string, string>): string {
  const c = (id: string) => statusClass(taskStatuses, id);

  return `flowchart LR
    %% ===== 1-A: ブランディング（完了） =====

    subgraph A01["🎯 提供価値の明確化"]
      A01_1["スキル棚卸し<br>1-A-01-1"]:::${c('1-A-01-1')}
      A01_2["製造業課題リサーチ<br>1-A-01-2"]:::${c('1-A-01-2')}
      A01_3["サービス案3つ<br>1-A-01-3"]:::${c('1-A-01-3')}
      A01_1 --> A01_3
      A01_2 --> A01_3
    end

    subgraph A02["🛠️ 営業ツール整備"]
      A02_1["Webサイト<br>1-A-02-1"]:::${c('1-A-02-1')}
      A02_2["名刺<br>1-A-02-2"]:::${c('1-A-02-2')}
      A02_3["ピッチ<br>1-A-02-3"]:::${c('1-A-02-3')}
      A01_3 --> A02_1
      A01_3 --> A02_3
    end

    %% ===== 1-C: 実績構築 =====

    subgraph C01["🎨 和田酒店支援（アート系）"]
      C01_1["PR画像・動画<br>1-C-01-1"]:::${c('1-C-01-1')}
      C01_2["ラベルデザイン<br>1-C-01-2"]:::${c('1-C-01-2')}
      C01_3["ポートフォリオ化<br>1-C-01-3"]:::${c('1-C-01-3')}
      C01_1 --> C01_2 --> C01_3
    end

    subgraph C02["💻 地域イベントIT（業務系）"]
      C02_1["ソフトバレーアプリ<br>1-C-02-1"]:::${c('1-C-02-1')}
      C02_2["ポートフォリオ化<br>1-C-02-2"]:::${c('1-C-02-2')}
      C02_1 --> C02_2
    end

    subgraph C03["🤖 Cowork検証（共通基盤）"]
      C03_1["情報収集<br>1-C-03-1"]:::${c('1-C-03-1')}
      C03_2["検証会<br>1-C-03-2"]:::${c('1-C-03-2')}
      C03_3["デモ資料化<br>1-C-03-3"]:::${c('1-C-03-3')}
      C03_1 --> C03_2 --> C03_3
    end

    subgraph C04["🖼️ 熊野町AIアート（アート系）"]
      C04_1["作品制作・発信<br>1-C-04-1"]:::${c('1-C-04-1')}
      C04_2["コンセプト言語化<br>展示準備<br>1-C-04-2"]:::${c('1-C-04-2')}
      C04_1 --> C04_2
    end

    subgraph C05["💇 AI Hairstyle Salon（業務系）"]
      C05_1["アプリ開発・公開<br>1-C-05-1"]:::${c('1-C-05-1')}
      C05_2["美容院導入・QR設置<br>1-C-05-2"]:::${c('1-C-05-2')}
      C05_3["LT発表資料作成<br>1-C-05-3"]:::${c('1-C-05-3')}
      C05_4["ポートフォリオ化<br>1-C-05-4"]:::${c('1-C-05-4')}
      C05_1 --> C05_2 --> C05_3 --> C05_4
    end

    %% ===== 1-B: ニーズ調査・関係構築 =====

    subgraph B01_2g["🤝 関係構築"]
      B01_2_1["町民会館デモ<br>1-B-01-2-1"]:::${c('1-B-01-2-1')}
      B01_2_2["イベント調査<br>1-B-01-2-2"]:::${c('1-B-01-2-2')}
      B01_2_4["イベント参加<br>1-B-01-2-4"]:::${c('1-B-01-2-4')}
      B01_2_5["LT広島vol.2<br>登壇・交流<br>1-B-01-2-5"]:::${c('1-B-01-2-5')}
      B01_2_3["ヒアリング記録<br>1-B-01-2-3"]:::${c('1-B-01-2-3')}
      B01_2_2 --> B01_2_4
      B01_2_1 --> B01_2_3
      B01_2_4 --> B01_2_3
      B01_2_5 --> B01_2_3
    end

    subgraph B_analysis["📊 分析"]
      B01_1["産業調査<br>1-B-01-1"]:::${c('1-B-01-1')}
      B01_3["AI課題リスト<br>1-B-01-3"]:::${c('1-B-01-3')}
      B01_1 --> B01_3
    end

    subgraph B02g["🔍 コミュニティ調査"]
      B02_1["商工会リスト<br>1-B-02-1"]:::${c('1-B-02-1')}
      B02_2["勉強会調査<br>1-B-02-2"]:::${c('1-B-02-2')}
      B02_3["キーパーソンリスト<br>1-B-02-3"]:::${c('1-B-02-3')}
      B02_4["コンタクト<br>1-B-02-4"]:::${c('1-B-02-4')}
      B02_1 --> B02_3
      B02_2 --> B02_3
      B02_3 --> B02_4
    end

    subgraph B03g["📐 コミュニティ設計"]
      B03_1["候補整理<br>1-B-03-1"]:::${c('1-B-03-1')}
      B03_2["設計書<br>1-B-03-2"]:::${c('1-B-03-2')}
      B03_1 --> B03_2
    end

    %% ===== 1-A → 他カテゴリへの基盤提供 =====
    A02_1 -.->|ポートフォリオ| C01_3
    A02_1 -.->|ポートフォリオ| C02_2
    A02_1 -.->|ポートフォリオ| C05_4
    A02_2 -.->|名刺| B01_2_4
    A02_3 -.->|ピッチ| B02_4

    %% ===== カテゴリ間の依存 =====
    C03_3 -.->|デモ材料| B01_2_1
    C04_2 -.->|AI実例| B01_2_1
    C04_2 -.->|アート活動実績| B03_1
    C05_3 -.->|発表資料| B01_2_5
    B01_2_3 --> B01_3
    B02_2 -.-> B03_1

    %% ===== 移行条件 =====
    TC1{{"① 関係者2名以上"}}:::gate
    TC2{{"② ケーススタディ1件"}}:::gate
    TC3{{"③ 場所・形式決定"}}:::gate

    B02_4 --> TC1
    B01_2_1 --> TC1
    B01_2_5 --> TC1
    C01_3 --> TC2
    C02_2 --> TC2
    C05_4 --> TC2
    B03_2 --> TC3

    P2(("フェーズ2<br>コミュニティ確立")):::next
    TC1 --> P2
    TC2 --> P2
    TC3 --> P2

    %% ===== スタイル =====
    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d,stroke-width:2px
    classDef wip fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,stroke-width:2px
    classDef todo fill:#f1f5f9,stroke:#94a3b8,color:#475569
    classDef gate fill:#fef9c3,stroke:#ca8a04,color:#713f12,stroke-width:2px
    classDef next fill:#ede9fe,stroke:#7c3aed,color:#4c1d95,stroke-width:3px
`;
}

const TASK_ID_REGEX = /1-[A-C]-\d{2}-\d+(?:-\d+)*/;

let renderCounter = 0;

export const DependencyGraphView = ({ strategyData }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // 選択中タスクの情報
  const selectedInfo = useMemo(() => {
    if (!selectedTaskId) return null;
    return findTaskWithIssue(strategyData, selectedTaskId);
  }, [selectedTaskId, strategyData]);

  // Mermaid 描画
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 25,
        rankSpacing: 50,
      },
    });

    const render = async () => {
      const taskStatuses = extractTaskStatuses(strategyData);
      const graphDef = buildGraph(taskStatuses);

      try {
        renderCounter++;
        const id = `dep-graph-${renderCounter}`;
        const { svg } = await mermaid.render(id, graphDef);
        if (graphRef.current) {
          graphRef.current.innerHTML = svg;
          const svgEl = graphRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = 'none';

            // タスクノードにクリックハンドラを追加
            const nodes = svgEl.querySelectorAll('.node');
            nodes.forEach(node => {
              const text = node.textContent || '';
              const match = text.match(TASK_ID_REGEX);
              if (match) {
                (node as SVGElement).style.cursor = 'pointer';
                node.addEventListener('click', (e) => {
                  e.stopPropagation();
                  setSelectedTaskId(prev => prev === match[0] ? null : match[0]);
                });
              }
            });
          }
        }
        setRenderError(null);
      } catch (e) {
        console.error('Mermaid render error:', e);
        setRenderError(String(e));
      }
    };

    render();
  }, [strategyData]);

  // ピンチズーム（Ctrl+ホイール / トラックパッドピンチ）
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();

        const delta = -e.deltaY * 0.01;
        const oldScale = scale;
        const newScale = Math.max(0.2, Math.min(2.5, oldScale + delta));

        if (oldScale === newScale) return;

        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left + container.scrollLeft;
        const cursorY = e.clientY - rect.top + container.scrollTop;

        const scaleRatio = newScale / oldScale;
        const newScrollLeft = cursorX * scaleRatio - (e.clientX - rect.left);
        const newScrollTop = cursorY * scaleRatio - (e.clientY - rect.top);

        setScale(newScale);

        requestAnimationFrame(() => {
          container.scrollLeft = newScrollLeft;
          container.scrollTop = newScrollTop;
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [scale]);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.2, Math.min(2.5, prev + delta)));
  };

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー + 凡例 + ズーム */}
      <div className="px-6 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-6">
          <h2 className="text-base font-bold text-slate-800">
            <i className="fas fa-project-diagram mr-2 text-blue-600"></i>
            フェーズ1 依存関係
          </h2>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-100 border-2 border-green-500 inline-block"></span>
              <span className="text-slate-500">完了</span>
            </span>
            <span className="flex items-center space-x-1 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-100 border-2 border-blue-500 inline-block"></span>
              <span className="text-slate-500">進行中</span>
            </span>
            <span className="flex items-center space-x-1 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-400 inline-block"></span>
              <span className="text-slate-500">未着手</span>
            </span>
            <span className="flex items-center space-x-1 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-yellow-100 border-2 border-yellow-500 inline-block rotate-45"></span>
              <span className="text-slate-500">移行条件</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleZoom(-0.1)}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-colors"
          >
            −
          </button>
          <span className="w-12 text-center text-xs font-mono text-slate-500">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-colors"
          >
            +
          </button>
          <button
            onClick={() => setScale(0.8)}
            className="ml-1 px-2 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs transition-colors"
          >
            <i className="fas fa-compress-arrows-alt"></i>
          </button>
        </div>
      </div>

      {/* グラフ + 詳細パネル */}
      <div className="flex-1 flex overflow-hidden">
        {/* グラフ本体 */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto bg-white"
          style={{ position: 'relative' }}
          onClick={() => setSelectedTaskId(null)}
        >
          {renderError ? (
            <div className="p-6 text-red-600">
              <p className="font-bold">グラフの描画に失敗しました</p>
              <pre className="text-xs mt-2 bg-red-50 p-3 rounded-lg overflow-auto">{renderError}</pre>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-block',
                minWidth: '100%',
                minHeight: '100%',
                padding: '24px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                <div ref={graphRef} />
              </div>
            </div>
          )}
        </div>

        {/* タスク詳細パネル */}
        {selectedInfo && (
          <TaskDetailPanel
            task={selectedInfo.task}
            issue={selectedInfo.issue}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </div>
  );
};

// --- タスク詳細サイドパネル ---

const TaskDetailPanel = ({
  task,
  issue,
  onClose,
}: {
  task: Task;
  issue: Issue;
  onClose: () => void;
}) => {
  const status = task.status || TASK_STATUS.PENDING;
  const config = STATUS_CONFIG[status];

  return (
    <div className="w-80 border-l border-slate-200 bg-white overflow-y-auto shrink-0">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
        <span className="text-sm font-bold text-slate-700">タスク詳細</span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
        >
          <i className="fas fa-times text-xs"></i>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* ステータス + ID */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${config.color}`}>
            <i className={`${config.icon} mr-1`}></i>
            {config.label}
          </span>
          <span className="text-xs font-mono text-slate-400">{task.id}</span>
        </div>

        {/* タイトル */}
        <h3 className="text-base font-black text-slate-800 leading-tight">
          {task.title}
        </h3>

        {/* 親Issue */}
        <div className="px-3 py-2 bg-slate-50 rounded-lg">
          <span className="text-xs text-slate-400 block mb-0.5">Issue</span>
          <span className="text-sm font-bold text-slate-600">
            #{issue.id} {issue.title}
          </span>
        </div>

        {/* 完了日 */}
        {task.completedDate && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <i className="fas fa-calendar-check"></i>
            <span className="font-medium">{task.completedDate} 完了</span>
          </div>
        )}

        {/* 説明 */}
        {task.description && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">説明</h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* 完了条件 */}
        {task.successCriteria && task.successCriteria.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">完了条件</h4>
            <ul className="space-y-1">
              {task.successCriteria.map((sc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <i className={`fas fa-${status === TASK_STATUS.COMPLETED ? 'check-circle text-green-500' : 'circle text-slate-300'} mt-0.5 text-xs`}></i>
                  <span>{sc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 成果物 */}
        {task.outputs && task.outputs.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">成果物</h4>
            <div className="space-y-1.5">
              {task.outputs.map((output, i) => {
                if (typeof output === 'string') {
                  return (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <i className="fas fa-paperclip text-slate-400 mt-0.5 text-xs"></i>
                      <span>{output}</span>
                    </div>
                  );
                }
                const o = output as TaskOutput;
                return (
                  <div key={i} className="px-3 py-2 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-700 block">{o.title}</span>
                    {o.summary && <p className="text-xs text-blue-600 mt-0.5">{o.summary}</p>}
                    {o.file && <span className="text-xs text-blue-400 font-mono">{o.file}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* メモ */}
        {task.notes && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">メモ</h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{task.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
