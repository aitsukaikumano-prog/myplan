import { useState } from 'react';
import { ViewState, Project } from '../types';

interface HeaderProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  currentProject: string;
  setCurrentProject: (id: string) => void;
  projects: Record<string, Project>;
  hasChanges: boolean;
  changedFilesCount: number;
  onSyncClick: () => void;
}

export const Header = ({
  view,
  setView,
  currentProject,
  setCurrentProject,
  projects,
  hasChanges,
  changedFilesCount,
  onSyncClick
}: HeaderProps) => {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-10 z-50 shrink-0">
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">
          MAZDA <span className="text-blue-600">SYNC</span>
        </h1>
        <div className="h-6 w-[1px] bg-slate-200"></div>
        
        {/* プロジェクト選択ドロップダウン */}
        <div className="relative">
          <button 
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center space-x-3 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-colors"
          >
            <i className={`${projects[currentProject].icon} text-blue-600`}></i>
            <span className="font-bold text-slate-700">{projects[currentProject].name}</span>
            <i className={`fas fa-chevron-down text-xs text-slate-400 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`}></i>
          </button>
          
          {showProjectDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden z-50 min-w-[200px]">
              {Object.values(projects).map(project => (
                <button
                  key={project.id}
                  onClick={() => {
                    setCurrentProject(project.id);
                    setShowProjectDropdown(false);
                    setView({ type: 'main', tab: 'tree', issue: null });
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${currentProject === project.id ? 'bg-blue-50' : ''}`}
                >
                  <i className={`${project.icon} ${currentProject === project.id ? 'text-blue-600' : 'text-slate-400'}`}></i>
                  <span className={`font-semibold ${currentProject === project.id ? 'text-blue-600' : 'text-slate-700'}`}>{project.name}</span>
                  {currentProject === project.id && <i className="fas fa-check text-blue-600 ml-auto"></i>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {view.type !== 'detail' && (
          <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setView({ ...view, tab: 'tree' })}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${view.tab === 'tree' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fas fa-sitemap mr-2"></i>ツリー表示
            </button>
            <button 
              onClick={() => setView({ ...view, tab: 'search' })}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${view.tab === 'search' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fas fa-search mr-2"></i>タスク検索
            </button>
            <button 
              onClick={() => setView({ ...view, tab: 'progress' })}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${view.tab === 'progress' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fas fa-chart-line mr-2"></i>進捗率確認
            </button>
            <button 
              onClick={() => setView({ ...view, tab: 'docs' })}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${view.tab === 'docs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fas fa-file-alt mr-2"></i>議事録
            </button>
          </div>
        )}
        
        {/* GitHub同期ボタン */}
        <button 
          onClick={onSyncClick}
          disabled={!hasChanges}
          className={`px-5 py-2 rounded-xl font-bold text-sm flex items-center transition-all ${
            hasChanges 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <i className="fab fa-github mr-2"></i>
          {hasChanges ? `変更を反映 (${changedFilesCount})` : '変更なし'}
        </button>
      </div>
    </header>
  );
};
