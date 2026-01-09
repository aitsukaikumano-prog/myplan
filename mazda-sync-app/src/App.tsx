import { useState } from 'react';
import { ViewState, Issue } from './types';
import { PROJECTS } from './data/strategyData';
import { useTaskStates, applyTaskStates, getChangedFiles } from './hooks/useTaskStates';
import { 
  TreeView, 
  TaskSearchView, 
  ProgressView, 
  DocsView, 
  DetailView, 
  Header, 
  SyncModal 
} from './components';

function App() {
  const [view, setView] = useState<ViewState>({ type: 'main', tab: 'tree', issue: null });
  const [currentProject, setCurrentProject] = useState('brand');
  const [showSyncModal, setShowSyncModal] = useState(false);
  
  const { taskStates, updateTaskStatus, approveTask, hasChanges } = useTaskStates();
  
  const selectedProjectData = PROJECTS[currentProject].data;
  const strategyData = applyTaskStates(selectedProjectData, taskStates);
  const changedFiles = getChangedFiles(selectedProjectData, taskStates, currentProject);
  
  const handleNavigate = (issue: Issue) => {
    setView({ ...view, type: 'detail', issue });
  };

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
          onUpdateTaskStatus={updateTaskStatus}
          onApproveTask={approveTask}
        />
      );
    }
    
    return (
      <>
        {view.tab === 'tree' && <TreeView strategyData={strategyData} onNavigate={handleNavigate} />}
        {view.tab === 'search' && <TaskSearchView strategyData={strategyData} onNavigate={handleNavigate} />}
        {view.tab === 'progress' && <ProgressView strategyData={strategyData} />}
        {view.tab === 'docs' && <DocsView currentProject={currentProject} />}
      </>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header
        view={view}
        setView={setView}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        projects={PROJECTS}
        hasChanges={hasChanges}
        changedFilesCount={changedFiles.length}
        onSyncClick={() => setShowSyncModal(true)}
      />
      
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
      
      {showSyncModal && (
        <SyncModal
          changedFiles={changedFiles}
          onClose={() => setShowSyncModal(false)}
        />
      )}
    </div>
  );
}

export default App;
