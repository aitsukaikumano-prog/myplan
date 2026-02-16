import { useState, useEffect, useMemo } from 'react';
import { Routine, RoutineLogs, WeeklyFocus, FocusHorizon, CalendarEvent, StrategyNode, Task, Issue, TaskOutput, TASK_STATUS, STATUS_CONFIG } from '../types';

interface RoutinesViewProps {
  routines: Routine[];
  weeklyFocus: WeeklyFocus | null;
  strategyData: StrategyNode | null;
  routineLogs: RoutineLogs;
}

// --- Date helpers ---

const today = () => {
  // 日本時間 (JST: UTC+9) で今日の日付を返す
  const d = new Date();
  const jst = new Date(d.getTime() + 9 * 60 * 60000);
  return jst.toISOString().slice(0, 10);
};

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

// ストリーク計算（daily用、YAMLログから）
const calcStreak = (routineId: string, logs: RoutineLogs): number => {
  const entries = logs[routineId];
  if (!entries) return 0;

  let streak = 0;
  const d = new Date();
  const jst = new Date(d.getTime() + 9 * 60 * 60000);
  const todayStr = jst.toISOString().slice(0, 10);
  if (!entries[todayStr]?.completed) {
    jst.setDate(jst.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const key = jst.toISOString().slice(0, 10);
    if (entries[key]?.completed) {
      streak++;
      jst.setDate(jst.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

// strategyDataからタスクIDでタスク情報を検索
const findTaskById = (node: StrategyNode, taskId: string): { title: string; status: string } | null => {
  if (node.issues) {
    for (const issue of node.issues) {
      // Issue自体のIDチェック
      if (issue.id === taskId) {
        return { title: issue.title, status: issue.status || TASK_STATUS.PENDING };
      }
      // Issue配下のタスクを検索
      if (issue.tasks) {
        const found = findTaskInTasks(issue.tasks, taskId);
        if (found) return found;
      }
    }
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findTaskById(child, taskId);
      if (found) return found;
    }
  }
  return null;
};

const findTaskInTasks = (tasks: any[], taskId: string): { title: string; status: string } | null => {
  for (const task of tasks) {
    if (task.id === taskId) {
      return { title: task.title, status: task.status || TASK_STATUS.PENDING };
    }
    if (task.tasks) {
      const found = findTaskInTasks(task.tasks, taskId);
      if (found) return found;
    }
  }
  return null;
};

// strategyDataからTask+Issueを検索（詳細パネル用）
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

export const RoutinesView = ({ routines, weeklyFocus, strategyData, routineLogs }: RoutinesViewProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  const isCompleted = (routineId: string, key: string): boolean => {
    return routineLogs[routineId]?.[key]?.completed || false;
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.min(window.innerWidth * 0.6, Math.max(280, newWidth)));
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const selectedInfo = useMemo(() => {
    if (!selectedTaskId || !strategyData) return null;
    return findTaskWithIssue(strategyData, selectedTaskId);
  }, [selectedTaskId, strategyData]);

  const dailyRoutines = routines.filter(r => r.frequency === 'daily');
  const weeklyRoutines = routines.filter(r => r.frequency === 'weekly');
  const todayStr = today();

  // 最大ストリーク
  const maxStreak = dailyRoutines.reduce((max, r) => {
    const s = calcStreak(r.id, routineLogs);
    return s > max.streak ? { streak: s, title: r.title } : max;
  }, { streak: 0, title: '' });

  return (
    <div className="h-full overflow-y-auto p-6" onClick={() => setSelectedTaskId(null)}>
      {/* 上段: ルーティン（左） + フォーカスタスク（右） */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 左カラム: フォーカスタスク */}
        <div>
          <FocusSection weeklyFocus={weeklyFocus} strategyData={strategyData} onTaskSelect={(id) => { setSelectedTaskId(id); }} />
        </div>

        {/* 右カラム: ルーティン */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800">
              <i className="fas fa-redo-alt text-indigo-500 mr-3"></i>
              ルーティン
            </h2>
            {maxStreak.streak > 0 && (
              <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                <i className="fas fa-fire mr-1"></i>
                {maxStreak.streak}日連続
              </span>
            )}
          </div>

          {/* 今日のルーティン（daily） */}
          {dailyRoutines.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                今日のルーティン
              </h3>
              <div className="space-y-2">
                {dailyRoutines.map(r => {
                  const done = isCompleted(r.id, todayStr);
                  const streak = calcStreak(r.id, routineLogs);
                  return (
                    <div key={r.id} className={`p-4 border-2 rounded-xl transition-colors ${done ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${done ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                          {done && <i className="fas fa-check text-white text-xs"></i>}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm font-bold ${done ? 'text-green-700' : 'text-slate-700'}`}>
                            {r.title}
                          </span>
                          {r.duration && (
                            <span className="ml-2 text-xs font-medium text-slate-400">({r.duration})</span>
                          )}
                          {streak > 1 && (
                            <span className="ml-2 text-xs font-bold text-orange-500">
                              <i className="fas fa-fire mr-1"></i>{streak}日
                            </span>
                          )}
                        </div>
                        {r.link && (
                          <a
                            href={r.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-600 transition-colors"
                            title="開く"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 今週のルーティン（weekly） */}
          {weeklyRoutines.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                今週のルーティン
              </h3>
              <div className="space-y-2">
                {weeklyRoutines.map(r => {
                  // 週次は今週の日付のどれかにログがあれば完了とみなす
                  const done = (() => {
                    const entries = routineLogs[r.id];
                    if (!entries) return false;
                    // 今週の月〜日の日付を生成してチェック
                    const d = new Date();
                    const jst = new Date(d.getTime() + 9 * 60 * 60000);
                    const day = jst.getUTCDay() || 7; // 月=1, 日=7
                    const monday = new Date(jst);
                    monday.setUTCDate(jst.getUTCDate() - day + 1);
                    for (let i = 0; i < 7; i++) {
                      const check = new Date(monday);
                      check.setUTCDate(monday.getUTCDate() + i);
                      const key = check.toISOString().slice(0, 10);
                      if (entries[key]?.completed) return true;
                    }
                    return false;
                  })();
                  return (
                    <div key={r.id} className={`p-4 border-2 rounded-xl transition-colors ${done ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${done ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                          {done && <i className="fas fa-check text-white text-xs"></i>}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm font-bold ${done ? 'text-green-700' : 'text-slate-700'}`}>
                            {r.title}
                          </span>
                          <p className="text-xs text-slate-400 mt-0.5">{r.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {routines.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <i className="fas fa-redo-alt text-4xl mb-4 block"></i>
              <p className="font-bold">ルーティンが定義されていません</p>
              <p className="text-sm mt-1">routines.yaml にルーティンを追加してください</p>
            </div>
          )}
        </div>

      </div>

      {/* 下段: 月間カレンダー（中央） */}
      {dailyRoutines.length > 0 && (
        <MonthlyCalendar
          dailyRoutines={dailyRoutines}
          isCompleted={isCompleted}
          events={weeklyFocus?.events || []}
        />
      )}

      {/* タスク詳細パネル（fixed position） */}
      {selectedInfo && (
        <RoutineTaskDetailPanel
          task={selectedInfo.task}
          issue={selectedInfo.issue}
          width={panelWidth}
          onResizeStart={handleResizeStart}
          onClose={() => setSelectedTaskId(null)}
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
            zIndex: 150,
          }}
        />
      )}
    </div>
  );
};

// --- ホライズン期限日を計算 ---

const getHorizonDeadline = (horizon: FocusHorizon, weekStr: string): string => {
  // weekStr = "2026-W07" → その週の日曜日を基準に計算
  const match = weekStr.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return '';

  const year = parseInt(match[1]);
  const week = parseInt(match[2]);

  // ISO週の月曜日を計算
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // 月=1, 日=7
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

  switch (horizon) {
    case 'this_week':
      return `~${fmt(sunday)}`;
    case 'next_week': {
      const nextSun = new Date(sunday);
      nextSun.setDate(sunday.getDate() + 7);
      return `~${fmt(nextSun)}`;
    }
    case 'this_month': {
      const lastDay = new Date(monday.getFullYear(), monday.getMonth() + 1, 0);
      return `~${fmt(lastDay)}`;
    }
    case 'next_month': {
      const lastDay = new Date(monday.getFullYear(), monday.getMonth() + 2, 0);
      return `~${fmt(lastDay)}`;
    }
    case 'later':
      return '';
  }
};

const HORIZON_CONFIG: Record<FocusHorizon, { label: string; icon: string; color: string }> = {
  this_week:  { label: '今週',     icon: 'fas fa-bolt',          color: 'text-amber-600' },
  next_week:  { label: '来週',     icon: 'fas fa-arrow-right',   color: 'text-blue-600' },
  this_month: { label: '今月',     icon: 'fas fa-calendar',      color: 'text-purple-600' },
  next_month: { label: '来月',     icon: 'fas fa-calendar-alt',  color: 'text-slate-600' },
  later:      { label: 'もっと先', icon: 'fas fa-clock',         color: 'text-slate-400' },
};

const HORIZONS: FocusHorizon[] = ['this_week', 'next_week', 'this_month', 'next_month', 'later'];

// --- フォーカスタスク セクション ---

const FocusSection = ({
  weeklyFocus,
  strategyData,
  onTaskSelect,
}: {
  weeklyFocus: WeeklyFocus | null;
  strategyData: StrategyNode | null;
  onTaskSelect?: (taskId: string) => void;
}) => {
  const getStatusIcon = (status: string) => {
    if (status === TASK_STATUS.COMPLETED) return { icon: 'fas fa-check-circle', color: 'text-green-500' };
    if (status === TASK_STATUS.IN_PROGRESS) return { icon: 'fas fa-circle-notch', color: 'text-blue-500' };
    return { icon: 'far fa-circle', color: 'text-slate-300' };
  };

  const getStatusBorder = (status: string) => {
    if (status === TASK_STATUS.COMPLETED) return 'border-green-200 bg-green-50';
    if (status === TASK_STATUS.IN_PROGRESS) return 'border-blue-200 bg-blue-50';
    return 'border-slate-200 bg-white';
  };

  // 全ホライズンのタスクを集約して情報を付与
  const allTasks = HORIZONS.flatMap(h =>
    (weeklyFocus?.[h] || []).map(taskId => {
      const info = strategyData ? findTaskById(strategyData, taskId) : null;
      return {
        id: taskId,
        title: info?.title || taskId,
        status: info?.status || TASK_STATUS.PENDING,
        horizon: h,
      };
    })
  );

  const totalCount = allTasks.length;
  const completedCount = allTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;

  // ホライズンごとにグループ化（タスクがあるホライズンのみ）
  const groups = HORIZONS
    .map(h => ({
      horizon: h,
      tasks: allTasks.filter(t => t.horizon === h),
    }))
    .filter(g => g.tasks.length > 0);

  const hasAnyTasks = totalCount > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800">
          <i className="fas fa-crosshairs text-amber-500 mr-3"></i>
          フォーカスタスク
        </h2>
        {hasAnyTasks && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${completedCount === totalCount ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
            {completedCount}/{totalCount} 完了
          </span>
        )}
      </div>

      {!weeklyFocus || !hasAnyTasks ? (
        <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center">
          <i className="fas fa-crosshairs text-2xl text-slate-300 mb-2 block"></i>
          <p className="text-sm font-bold text-slate-400">
            フォーカスタスクが未設定です
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Claude Code でタスクを選びましょう
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(({ horizon, tasks }) => {
            const config = HORIZON_CONFIG[horizon];
            const deadline = getHorizonDeadline(horizon, weeklyFocus.week);
            return (
              <div key={horizon}>
                {/* ホライズンヘッダー */}
                <div className="flex items-center gap-2 mb-3">
                  <i className={`${config.icon} ${config.color}`}></i>
                  <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                  {deadline && (
                    <span className={`text-xs font-bold ${config.color} opacity-70`}>（{deadline}）</span>
                  )}
                </div>
                {/* タスクリスト */}
                <div className="space-y-1.5 ml-1">
                  {tasks.map(task => {
                    const si = getStatusIcon(task.status);
                    return (
                      <div
                        key={task.id}
                        className={`px-3 py-2.5 border rounded-lg transition-colors cursor-pointer hover:shadow-md ${getStatusBorder(task.status)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskSelect?.(task.id);
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <i className={`${si.icon} ${si.color} text-sm`}></i>
                          <span className="flex-1 min-w-0 text-sm font-medium text-slate-700 truncate">
                            {task.title}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex-shrink-0">{task.id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- 月間カレンダー ---

const ROUTINE_COLORS = [
  { bg: 'bg-green-500', ring: 'ring-green-300' },
  { bg: 'bg-blue-500', ring: 'ring-blue-300' },
  { bg: 'bg-purple-500', ring: 'ring-purple-300' },
  { bg: 'bg-orange-500', ring: 'ring-orange-300' },
];

const MonthlyCalendar = ({
  dailyRoutines,
  isCompleted,
  events,
}: {
  dailyRoutines: Routine[];
  isCompleted: (routineId: string, key: string) => boolean;
  events: CalendarEvent[];
}) => {
  const [viewDate, setViewDate] = useState(() => new Date());
  const todayStr = today();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // 月の最初と最後
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // 月曜始まり: 0=月, 1=火, ..., 6=日
  const startOffset = (firstDay.getDay() + 6) % 7;

  // カレンダーのセル数
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date());

  const monthLabel = `${year}年${month + 1}月`;

  return (
    <div className="max-w-3xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          カレンダー
        </h3>
        {/* 凡例 */}
        <div className="flex items-center gap-3">
          {dailyRoutines.map((r, i) => (
            <div key={r.id} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${ROUTINE_COLORS[i % ROUTINE_COLORS.length].bg}`}></span>
              <span className="text-xs text-slate-500">{r.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 bg-white border-2 border-slate-200 rounded-xl">
        {/* ナビゲーション */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-slate-800">{monthLabel}</span>
            <button
              onClick={goToday}
              className="px-2 py-0.5 text-xs font-bold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
            >
              今日
            </button>
          </div>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 border-b-2 border-slate-200">
          {DAY_LABELS.map((label, i) => (
            <div key={label} className={`text-center text-xs font-bold py-2 ${i === 5 ? 'text-blue-400' : i === 6 ? 'text-red-400' : 'text-slate-400'}`}>
              {label}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 border-l border-slate-100">
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNum = i - startOffset + 1;
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;

            if (!isCurrentMonth) {
              return <div key={i} className="border-r border-b border-slate-100"></div>;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const completedCount = dailyRoutines.filter(r => isCompleted(r.id, dateStr)).length;
            const allDone = completedCount === dailyRoutines.length && completedCount > 0;
            const dayEvents = events.filter(e => e.date === dateStr);

            return (
              <div
                key={i}
                className={`px-1 py-2 flex flex-col items-center transition-colors min-h-[64px] border-r border-b border-slate-100 ${
                  isToday ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset rounded-lg' : ''
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${
                  isToday
                    ? 'text-blue-600'
                    : allDone
                      ? 'text-green-600'
                      : 'text-slate-600'
                }`}>
                  {dayNum}
                </span>
                {/* イベント */}
                {dayEvents.map((ev, ei) => (
                  <span
                    key={ei}
                    className="text-[10px] font-bold text-red-600 bg-red-50 px-1 rounded truncate max-w-full mb-0.5"
                    title={ev.title}
                  >
                    {ev.title}
                  </span>
                ))}
                {/* ルーティンドット */}
                <div className="flex items-center gap-0.5 mt-auto">
                  {dailyRoutines.map((r, ri) => {
                    const done = isCompleted(r.id, dateStr);
                    const color = ROUTINE_COLORS[ri % ROUTINE_COLORS.length];
                    return (
                      <span
                        key={r.id}
                        className={`w-3 h-3 rounded-full ${
                          done
                            ? color.bg
                            : 'bg-slate-200'
                        }`}
                        title={`${r.title}${done ? ' ✓' : ''}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- タスク詳細パネル（TreeViewと同一レイアウト） ---

const BASE_PATH = import.meta.env.BASE_URL || '/';

const extractFilePath = (output: string | TaskOutput): string | null => {
  if (typeof output === 'object') return output.file || null;
  const match = output.match(/^(docs\/[^\s]+\.md)/);
  return match ? match[1] : null;
};

const getOutputTitle = (output: string | TaskOutput): string => {
  if (typeof output === 'object') return output.title;
  return output;
};

const getOutputUrl = (output: string | TaskOutput): string | null => {
  if (typeof output === 'object') return output.url || null;
  return null;
};

const getOutputSummary = (output: string | TaskOutput): string | null => {
  if (typeof output === 'object') return output.summary || null;
  return null;
};

const RoutineTaskDetailPanel = ({
  task,
  issue,
  width,
  onResizeStart,
  onClose,
}: {
  task: Task;
  issue: Issue;
  width: number;
  onResizeStart: (e: React.MouseEvent) => void;
  onClose: () => void;
}) => {
  const status = task.status || TASK_STATUS.PENDING;
  const config = STATUS_CONFIG[status];

  const [expandedOutputs, setExpandedOutputs] = useState<Set<number>>(new Set());
  const [outputContents, setOutputContents] = useState<Record<number, string>>({});
  const [loadingOutputs, setLoadingOutputs] = useState<Set<number>>(new Set());

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
      if (filePath) fetchOutputContent(index, filePath);
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
        {task.id && (
          <div className="mt-1 text-xs font-mono text-slate-400">{task.id}</div>
        )}
        {task.completedDate && (
          <div className="mt-2 text-sm text-slate-500">
            <i className="fas fa-calendar-check mr-2 text-green-500"></i>
            {task.completedDate} 完了
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 親Issue */}
        <div>
          <div className="flex items-center text-sm font-bold text-slate-500 mb-2">
            <i className="fas fa-sitemap mr-2 text-indigo-500"></i>
            所属Issue
          </div>
          <div className="text-sm text-slate-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <span className="font-bold">#{issue.id}</span> {issue.title}
          </div>
        </div>

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
