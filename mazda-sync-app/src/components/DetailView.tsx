import { Issue, TASK_STATUS, STATUS_CONFIG } from '../types';

// 進捗管理UIは廃止、issues.yamlで管理
interface DetailViewProps {
  issue: Issue;
  onBack: () => void;
}

export const DetailView = ({ issue, onBack }: DetailViewProps) => {

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-10 max-w-4xl mx-auto pb-20">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <i className="fas fa-arrow-left"></i>
          <span className="font-bold">戻る</span>
        </button>
        
        <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <div className="text-xs font-bold text-blue-600 mb-2">#{issue.id}</div>
            <h2 className="text-3xl font-black text-slate-900">{issue.title}</h2>
          </div>
          
          <div className="p-8">
            <h3 className="text-lg font-bold text-slate-700 mb-6">
              <i className="fas fa-tasks mr-2 text-blue-500"></i>
              タスク一覧
            </h3>
            
            <div className="space-y-4">
              {issue.tasks.map((task, idx) => {
                const status = task.status || TASK_STATUS.PENDING;
                const config = STATUS_CONFIG[status];
                
                return (
                  <div key={idx} className={`p-6 rounded-2xl border-2 ${config.color.replace('text-', 'border-').split(' ')[0]} bg-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 ${config.color}`}>
                          <i className={`${config.icon}`}></i>
                        </div>
                        <span className={`text-base font-semibold ${status === TASK_STATUS.COMPLETED ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {task.title}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    
                    {/* 成果物表示 */}
                    {task.deliverable && (
                      <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                        <div className="text-xs font-bold text-slate-500 mb-2">
                          <i className="fas fa-paperclip mr-1"></i>成果物
                        </div>
                        <a 
                          href={task.deliverable.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {task.deliverable.url}
                        </a>
                        {task.deliverable.description && (
                          <p className="text-xs text-slate-500 mt-1">{task.deliverable.description}</p>
                        )}
                      </div>
                    )}
                    
                    {/* ステータス表示（ボタンは廃止、issues.yamlで管理） */}
                    {status === TASK_STATUS.COMPLETED && (
                      <div className="text-sm text-green-600">
                        <i className="fas fa-check-circle mr-1"></i>完了済み
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* DeliverableModal は廃止（issues.yamlで管理） */}
    </div>
  );
};
