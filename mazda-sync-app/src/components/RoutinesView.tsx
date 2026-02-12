import { useState, useCallback } from 'react';
import { Routine, RoutineLogEntry, WeeklyFocus, FocusHorizon, CalendarEvent, StrategyNode, TASK_STATUS } from '../types';

interface RoutinesViewProps {
  routines: Routine[];
  weeklyFocus: WeeklyFocus | null;
  strategyData: StrategyNode | null;
}

const STORAGE_KEY = 'mazda-routines-log';

// --- LocalStorage helpers ---

type RoutineLog = Record<string, Record<string, RoutineLogEntry>>;
// { "R-01": { "2026-W07": { completed: true, date: "2026-02-13", note: "" }, ... } }

const loadLog = (): RoutineLog => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveLog = (log: RoutineLog) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
};

// --- Date helpers ---

const today = () => {
  // 日本時間 (JST: UTC+9) で今日の日付を返す
  // toISOString()はUTC日付を返すので、UTC時刻に9時間加算してからsliceする
  const d = new Date();
  const jst = new Date(d.getTime() + 9 * 60 * 60000);
  return jst.toISOString().slice(0, 10);
};

const getISOWeek = (d: Date): string => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const currentWeek = () => getISOWeek(new Date());

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

// ストリーク計算（daily用）
const calcStreak = (routineId: string, log: RoutineLog): number => {
  const entries = log[routineId];
  if (!entries) return 0;

  let streak = 0;
  const d = new Date();
  // 今日が完了していればそこからカウント、なければ昨日から遡る
  const todayStr = d.toISOString().slice(0, 10);
  if (!entries[todayStr]?.completed) {
    d.setDate(d.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if (entries[key]?.completed) {
      streak++;
      d.setDate(d.getDate() - 1);
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

export const RoutinesView = ({ routines, weeklyFocus, strategyData }: RoutinesViewProps) => {
  const [log, setLog] = useState<RoutineLog>(loadLog);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const updateLog = useCallback((next: RoutineLog) => {
    setLog(next);
    saveLog(next);
  }, []);

  const toggleComplete = (routineId: string, key: string) => {
    const next = { ...log };
    if (!next[routineId]) next[routineId] = {};
    const current = next[routineId][key];
    next[routineId] = {
      ...next[routineId],
      [key]: {
        completed: !current?.completed,
        date: today(),
        note: current?.note || ''
      }
    };
    updateLog(next);
  };

  const saveNote = (routineId: string, key: string) => {
    const next = { ...log };
    if (!next[routineId]) next[routineId] = {};
    const current = next[routineId][key] || { completed: false, date: today() };
    next[routineId] = {
      ...next[routineId],
      [key]: { ...current, note: noteText }
    };
    updateLog(next);
    setEditingNote(null);
    setNoteText('');
  };

  const isCompleted = (routineId: string, key: string): boolean => {
    return log[routineId]?.[key]?.completed || false;
  };

  const getNote = (routineId: string, key: string): string => {
    return log[routineId]?.[key]?.note || '';
  };

  const dailyRoutines = routines.filter(r => r.frequency === 'daily');
  const weeklyRoutines = routines.filter(r => r.frequency === 'weekly');
  const todayStr = today();
  const weekKey = currentWeek();

  // 最大ストリーク
  const maxStreak = dailyRoutines.reduce((max, r) => {
    const s = calcStreak(r.id, log);
    return s > max.streak ? { streak: s, title: r.title } : max;
  }, { streak: 0, title: '' });

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* 上段: ルーティン（左） + フォーカスタスク（右） */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 左カラム: フォーカスタスク */}
        <div>
          <FocusSection weeklyFocus={weeklyFocus} strategyData={strategyData} />
        </div>

        {/* 右カラム: ルーティン */}
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-6">
            <i className="fas fa-redo-alt text-indigo-500 mr-3"></i>
            ルーティン
          </h2>

          {/* ストリーク表示 */}
          {maxStreak.streak > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl">
              <span className="text-lg font-black text-orange-600">
                <i className="fas fa-fire text-orange-500 mr-2"></i>
                {maxStreak.title} {maxStreak.streak}日連続
              </span>
            </div>
          )}

          {/* 今日のルーティン（daily） */}
          {dailyRoutines.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                今日のルーティン
              </h3>
              <div className="space-y-2">
                {dailyRoutines.map(r => {
                  const key = todayStr;
                  const done = isCompleted(r.id, key);
                  const note = getNote(r.id, key);
                  const streak = calcStreak(r.id, log);
                  return (
                    <div key={r.id} className={`p-4 border-2 rounded-xl transition-colors ${done ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleComplete(r.id, key)}
                          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${done ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-blue-500'}`}
                        >
                          {done && <i className="fas fa-check text-white text-xs"></i>}
                        </button>
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
                        <button
                          onClick={() => {
                            if (editingNote === `${r.id}-${key}`) {
                              setEditingNote(null);
                            } else {
                              setEditingNote(`${r.id}-${key}`);
                              setNoteText(note);
                            }
                          }}
                          className={`text-sm transition-colors ${note ? 'text-blue-400' : 'text-slate-300 hover:text-slate-400'}`}
                          title="メモ"
                        >
                          <i className="fas fa-comment-dots"></i>
                        </button>
                      </div>
                      {note && editingNote !== `${r.id}-${key}` && (
                        <p className="mt-2 ml-9 text-xs text-slate-500 italic">{note}</p>
                      )}
                      {editingNote === `${r.id}-${key}` && (
                        <div className="mt-3 ml-9 flex gap-2">
                          <input
                            type="text"
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveNote(r.id, key)}
                            placeholder="メモを入力..."
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-400"
                            autoFocus
                          />
                          <button
                            onClick={() => saveNote(r.id, key)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                          >
                            保存
                          </button>
                        </div>
                      )}
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
                今週のルーティン ({weekKey})
              </h3>
              <div className="space-y-2">
                {weeklyRoutines.map(r => {
                  const key = weekKey;
                  const done = isCompleted(r.id, key);
                  const note = getNote(r.id, key);
                  return (
                    <div key={r.id} className={`p-4 border-2 rounded-xl transition-colors ${done ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleComplete(r.id, key)}
                          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${done ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-blue-500'}`}
                        >
                          {done && <i className="fas fa-check text-white text-xs"></i>}
                        </button>
                        <div className="flex-1">
                          <span className={`text-sm font-bold ${done ? 'text-green-700' : 'text-slate-700'}`}>
                            {r.title}
                          </span>
                          <p className="text-xs text-slate-400 mt-0.5">{r.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (editingNote === `${r.id}-${key}`) {
                              setEditingNote(null);
                            } else {
                              setEditingNote(`${r.id}-${key}`);
                              setNoteText(note);
                            }
                          }}
                          className={`text-sm transition-colors ${note ? 'text-blue-400' : 'text-slate-300 hover:text-slate-400'}`}
                          title="メモ"
                        >
                          <i className="fas fa-comment-dots"></i>
                        </button>
                      </div>
                      {note && editingNote !== `${r.id}-${key}` && (
                        <p className="mt-2 ml-9 text-xs text-slate-500 italic">{note}</p>
                      )}
                      {editingNote === `${r.id}-${key}` && (
                        <div className="mt-3 ml-9 flex gap-2">
                          <input
                            type="text"
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveNote(r.id, key)}
                            placeholder="メモを入力..."
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-400"
                            autoFocus
                          />
                          <button
                            onClick={() => saveNote(r.id, key)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                          >
                            保存
                          </button>
                        </div>
                      )}
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
          toggleComplete={toggleComplete}
          events={weeklyFocus?.events || []}
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
  strategyData
}: {
  weeklyFocus: WeeklyFocus | null;
  strategyData: StrategyNode | null;
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
                    <span className="text-xs text-slate-400">（{deadline}）</span>
                  )}
                </div>
                {/* タスクリスト */}
                <div className="space-y-1.5 ml-1">
                  {tasks.map(task => {
                    const si = getStatusIcon(task.status);
                    return (
                      <div
                        key={task.id}
                        className={`px-3 py-2.5 border rounded-lg transition-colors ${getStatusBorder(task.status)}`}
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
  toggleComplete,
  events,
}: {
  dailyRoutines: Routine[];
  isCompleted: (routineId: string, key: string) => boolean;
  toggleComplete: (routineId: string, key: string) => void;
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
                      <button
                        key={r.id}
                        onClick={() => toggleComplete(r.id, dateStr)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          done
                            ? color.bg
                            : 'bg-slate-200 hover:bg-slate-300'
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
