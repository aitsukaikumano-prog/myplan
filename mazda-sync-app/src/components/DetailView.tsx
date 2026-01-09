import { useState } from 'react';
import { Issue, Task, TaskStatusType, Deliverable, TASK_STATUS, STATUS_CONFIG } from '../types';

interface DetailViewProps {
  issue: Issue;
  onBack: () => void;
  onUpdateTaskStatus: (issueId: string, taskIndex: number, status: TaskStatusType, deliverable?: Deliverable) => void;
  onApproveTask: (issueId: string, taskIndex: number) => void;
}

interface DeliverableModalProps {
  task: Task;
  taskIndex: number;
  issueId: string;
  onSubmit: (issueId: string, taskIndex: number, deliverable: Deliverable) => void;
  onClose: () => void;
}

const DeliverableModal = ({ task, taskIndex, issueId, onSubmit, onClose }: DeliverableModalProps) => {
  const [deliverableType, setDeliverableType] = useState('url');
  const [deliverableUrl, setDeliverableUrl] = useState(task.deliverable?.url || '');
  const [deliverableDescription, setDeliverableDescription] = useState(task.deliverable?.description || '');
  
  const handleSubmit = () => {
    if (!deliverableUrl.trim()) {
      alert('成果物のURLまたはパスを入力してください');
      return;
    }
    onSubmit(issueId, taskIndex, {
      type: deliverableType,
      url: deliverableUrl.trim(),
      description: deliverableDescription.trim(),
      submittedAt: new Date().toISOString()
    });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-2xl font-black text-slate-900">成果物を提出</h3>
          <p className="text-sm text-slate-500 mt-1">タスク完了のため、成果物を設定して上司の承認を依頼します</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-sm font-bold text-slate-600">{task.title}</p>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">成果物の種類</label>
            <div className="flex space-x-4">
              {[
                { value: 'url', label: 'URL / リンク', icon: 'fas fa-link' },
                { value: 'file', label: 'ファイルパス', icon: 'fas fa-file' },
                { value: 'document', label: 'ドキュメント', icon: 'fas fa-file-alt' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDeliverableType(opt.value)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${deliverableType === opt.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <i className={`${opt.icon} text-lg mb-2 ${deliverableType === opt.value ? 'text-blue-600' : 'text-slate-400'}`}></i>
                  <p className={`text-sm font-bold ${deliverableType === opt.value ? 'text-blue-600' : 'text-slate-600'}`}>{opt.label}</p>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {deliverableType === 'url' ? 'URL' : deliverableType === 'file' ? 'ファイルパス' : 'ドキュメントURL'}
            </label>
            <input
              type="text"
              value={deliverableUrl}
              onChange={(e) => setDeliverableUrl(e.target.value)}
              placeholder={deliverableType === 'url' ? 'https://...' : '/path/to/file...'}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">説明・コメント（任意）</label>
            <textarea
              value={deliverableDescription}
              onChange={(e) => setDeliverableDescription(e.target.value)}
              placeholder="成果物についての補足説明..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>
        </div>
        
        <div className="p-8 bg-slate-50 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            <i className="fas fa-paper-plane mr-2"></i>承認依頼を送信
          </button>
        </div>
      </div>
    </div>
  );
};

export const DetailView = ({ issue, onBack, onUpdateTaskStatus, onApproveTask }: DetailViewProps) => {
  const [showDeliverableModal, setShowDeliverableModal] = useState<{ task: Task; index: number } | null>(null);
  
  const handleStartTask = (index: number) => {
    onUpdateTaskStatus(issue.id, index, TASK_STATUS.IN_PROGRESS);
  };
  
  const handleSubmitDeliverable = (issueId: string, taskIndex: number, deliverable: Deliverable) => {
    onUpdateTaskStatus(issueId, taskIndex, TASK_STATUS.PENDING_APPROVAL, deliverable);
  };
  
  const handleApprove = (index: number) => {
    onApproveTask(issue.id, index);
  };

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
                    
                    {/* アクションボタン */}
                    <div className="flex items-center space-x-3">
                      {status === TASK_STATUS.PENDING && (
                        <button
                          onClick={() => handleStartTask(idx)}
                          className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        >
                          <i className="fas fa-play mr-2"></i>作業開始
                        </button>
                      )}
                      
                      {status === TASK_STATUS.IN_PROGRESS && (
                        <button
                          onClick={() => setShowDeliverableModal({ task, index: idx })}
                          className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                        >
                          <i className="fas fa-upload mr-2"></i>成果物を提出
                        </button>
                      )}
                      
                      {status === TASK_STATUS.PENDING_APPROVAL && (
                        <button
                          onClick={() => handleApprove(idx)}
                          className="px-4 py-2 rounded-xl text-sm font-bold bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                        >
                          <i className="fas fa-check mr-2"></i>承認する
                        </button>
                      )}
                      
                      {status === TASK_STATUS.COMPLETED && (
                        <span className="text-sm text-slate-400">
                          <i className="fas fa-check-circle mr-1"></i>完了済み
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {showDeliverableModal && (
        <DeliverableModal
          task={showDeliverableModal.task}
          taskIndex={showDeliverableModal.index}
          issueId={issue.id}
          onSubmit={handleSubmitDeliverable}
          onClose={() => setShowDeliverableModal(null)}
        />
      )}
    </div>
  );
};
