import { StrategyNode, TASK_STATUS, STATUS_CONFIG, TaskStatusType } from '../types';

interface ProgressViewProps {
  strategyData: StrategyNode;
}

interface ProgressResult {
  total: number;
  completed: number;
  counts: Record<TaskStatusType, number>;
  percentage: number;
}

export const ProgressView = ({ strategyData }: ProgressViewProps) => {
  const calculateProgress = (node: StrategyNode): ProgressResult => {
    let total = 0;
    const counts: Record<TaskStatusType, number> = {
      [TASK_STATUS.PENDING]: 0,
      [TASK_STATUS.IN_PROGRESS]: 0,
      [TASK_STATUS.PENDING_APPROVAL]: 0,
      [TASK_STATUS.COMPLETED]: 0
    };
    
    const traverse = (n: StrategyNode) => {
      if (n.issues) {
        n.issues.forEach(issue => {
          issue.tasks.forEach(task => {
            total++;
            const status = task.status || TASK_STATUS.PENDING;
            counts[status]++;
          });
        });
      }
      if (n.children) {
        n.children.forEach(child => traverse(child));
      }
    };
    
    traverse(node);
    const completed = counts[TASK_STATUS.COMPLETED];
    return { total, completed, counts, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };
  
  const overallProgress = calculateProgress(strategyData);
  
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-10 max-w-5xl mx-auto pb-20">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-8">進捗率ダッシュボード</h2>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[3rem] p-12 border-2 border-blue-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-black text-slate-900">全体進捗</h3>
              <div className="text-6xl font-black text-blue-600">{overallProgress.percentage}%</div>
            </div>
            <div className="h-8 bg-white rounded-full overflow-hidden border-2 border-blue-200 mb-4">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${overallProgress.percentage}%` }}
              ></div>
            </div>
            <p className="text-lg font-semibold text-slate-600 mb-4">
              {overallProgress.completed} / {overallProgress.total} タスク完了
            </p>
            
            {/* ステータス別内訳 */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <div key={key} className={`p-4 rounded-xl border ${config.color}`}>
                  <div className="text-3xl font-black">{overallProgress.counts[key as TaskStatusType]}</div>
                  <div className="text-sm font-bold"><i className={`${config.icon} mr-1`}></i>{config.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {strategyData.children?.map(strategy => {
            const progress = calculateProgress(strategy);
            return (
              <div key={strategy.id} className="bg-white rounded-3xl border-2 border-slate-100 p-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-slate-800">{strategy.title}</h4>
                  <div className="text-4xl font-black text-slate-600">{progress.percentage}%</div>
                </div>
                <div className="h-6 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                
                {/* ステータス別表示 */}
                <div className="flex items-center space-x-4 mb-4">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <span key={key} className={`text-xs font-bold px-2 py-1 rounded-full border ${config.color}`}>
                      {config.label}: {progress.counts[key as TaskStatusType]}
                    </span>
                  ))}
                </div>
                
                {strategy.children && (
                  <div className="mt-6 pl-6 space-y-3 border-l-2 border-slate-200">
                    {strategy.children.map(category => {
                      const catProgress = calculateProgress(category);
                      return (
                        <div key={category.id} className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-600">{category.title}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500"
                                style={{ width: `${catProgress.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-slate-500 w-12 text-right">{catProgress.percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
