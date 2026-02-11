import { useState } from 'react';
import { ViewState, Issue } from './types';
import { useGitHubData, PROJECTS } from './hooks/useGitHubData';
import { useTaskStates, applyTaskStates } from './hooks/useTaskStates';
import {
  TreeView,
  TaskSearchView,
  ProgressView,
  DependencyGraphView,
  DocsView,
  EmailsView,
  DetailView,
  Header,
  MemoView
} from './components';

function App() {
  const [view, setView] = useState<ViewState>({ type: 'main', tab: 'tree', issue: null });
  const [currentProject, setCurrentProject] = useState('rescue');

  const { strategyData: rawStrategyData, documents, emails, loading, error } = useGitHubData(currentProject);
  const { taskStates } = useTaskStates();

  // タスク状態を適用
  const strategyData = rawStrategyData ? applyTaskStates(rawStrategyData, taskStates) : null;

  const handleNavigate = (issue: Issue) => {
    setView({ ...view, type: 'detail', issue });
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-lg font-bold text-slate-600">GitHubからデータを取得中...</p>
      </div>
    );
  }

  // エラー表示
  if (error || !strategyData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <i className="fas fa-exclamation-triangle text-6xl text-amber-500 mb-4"></i>
        <p className="text-xl font-bold text-slate-700 mb-2">データの取得に失敗しました</p>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-redo mr-2"></i>再読み込み
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (view.type === 'detail' && view.issue) {
      const currentIssue = (() => {
        const findIssue = (node: typeof strategyData): Issue | null => {
          if (node.issues) {
            const found = node.issues.find(i => i.id === view.issue!.id);
            if (found) return found;
          }
          if (node.children) {
            for (const child of node.children) {
              const found = findIssue(child);
              if (found) return found;
            }
          }
          return null;
        };
        return findIssue(strategyData) || view.issue;
      })();

      return (
        <DetailView
          issue={currentIssue}
          onBack={() => setView({ type: 'main', tab: view.tab, issue: null })}
        />
      );
    }

    return (
      <>
        {view.tab === 'tree' && <TreeView strategyData={strategyData} onNavigate={handleNavigate} />}
        {view.tab === 'search' && <TaskSearchView strategyData={strategyData} onNavigate={handleNavigate} />}
        {view.tab === 'progress' && <ProgressView strategyData={strategyData} />}
        {view.tab === 'graph' && <DependencyGraphView strategyData={strategyData} />}
        {view.tab === 'docs' && <DocsView currentProject={currentProject} documents={documents} />}
        {view.tab === 'emails' && <EmailsView currentProject={currentProject} emails={emails} />}
        {view.tab === 'memo' && <MemoView />}
      </>
    );
  };

  const projectsRecord = PROJECTS.reduce((acc, p) => {
    acc[p.id] = { id: p.id, name: p.name, icon: p.icon, data: strategyData };
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header
        view={view}
        setView={setView}
        currentProject={currentProject}
        setCurrentProject={(id) => {
          setCurrentProject(id);
          setView({ type: 'main', tab: 'tree', issue: null });
        }}
        projects={projectsRecord}
      />

      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
