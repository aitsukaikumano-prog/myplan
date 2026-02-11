import { useState } from 'react';
import { ViewState, Project } from '../types';

interface HeaderProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  currentProject: string;
  setCurrentProject: (id: string) => void;
  projects: Record<string, Project>;
}

export const Header = ({
  view,
  setView,
  currentProject,
  setCurrentProject,
  projects
}: HeaderProps) => {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50 shrink-0">
      {/* 1行目: ロゴ + プロジェクト選択 + 同期ボタン */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-black italic tracking-tighter text-slate-900">
            MAZDA <span className="text-blue-600">SYNC</span>
          </h1>
          <div className="h-5 w-[1px] bg-slate-200"></div>

          {/* プロジェクト選択ドロップダウン */}
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <i className={`${projects[currentProject].icon} text-blue-600 text-sm`}></i>
              <span className="font-bold text-slate-700 text-sm">{projects[currentProject].name}</span>
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

      </div>

      {/* 2行目: ナビゲーションタブ */}
      <div className="h-12 flex items-center px-6">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setView({ type: 'main', tab: 'tree', issue: null })}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view.tab === 'tree' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fas fa-sitemap mr-2"></i>ツリー表示
          </button>
          <button
            onClick={() => setView({ type: 'main', tab: 'graph', issue: null })}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view.tab === 'graph' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fas fa-project-diagram mr-2"></i>依存関係
          </button>
          <button
            onClick={() => setView({ type: 'main', tab: 'search', issue: null })}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view.tab === 'search' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fas fa-search mr-2"></i>タスク検索
          </button>
          <button
            onClick={() => setView({ type: 'main', tab: 'progress', issue: null })}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view.tab === 'progress' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fas fa-chart-line mr-2"></i>進捗率確認
          </button>
          <button
            onClick={() => setView({ type: 'main', tab: 'docs', issue: null })}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view.tab === 'docs' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fas fa-folder-open mr-2"></i>ドキュメント
          </button>
          <button
            onClick={() => setView({ type: 'main', tab: 'emails', issue: null })}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view.tab === 'emails' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fas fa-envelope mr-2"></i>メール
          </button>
          <button
            onClick={() => setView({ type: 'main', tab: 'memo', issue: null })}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view.tab === 'memo' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fas fa-sticky-note mr-2"></i>メモ
          </button>
        </div>
      </div>
    </header>
  );
};
