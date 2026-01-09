import { useState, useMemo } from 'react';
import { StrategyNode, Issue, TASK_STATUS, STATUS_CONFIG } from '../types';

interface TaskSearchViewProps {
  strategyData: StrategyNode;
  onNavigate: (issue: Issue) => void;
}

interface IssueWithPath {
  issue: Issue;
  path: string[];
}

export const TaskSearchView = ({ strategyData, onNavigate }: TaskSearchViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="h-full overflow-y-auto">
      <div className="p-10 max-w-5xl mx-auto pb-20">
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
                    return (
                      <div key={taskIdx} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 shrink-0 ${config.color}`}>
                          <i className={`${config.icon} text-xs`}></i>
                        </div>
                        <span className={`text-sm font-medium flex-1 ${status === TASK_STATUS.COMPLETED ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {task.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${config.color}`}>
                          {config.label}
                        </span>
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
  );
};
