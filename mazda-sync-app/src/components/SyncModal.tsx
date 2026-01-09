import { useState } from 'react';

interface ChangedFile {
  path: string;
  content: string;
}

interface SyncModalProps {
  changedFiles: ChangedFile[];
  onClose: () => void;
}

export const SyncModal = ({ changedFiles, onClose }: SyncModalProps) => {
  const [copied, setCopied] = useState(false);
  
  const generateCommands = () => {
    const commands = changedFiles.map(f => `# ${f.path}\ncat << 'EOF' > ${f.path}\n${f.content}\nEOF`).join('\n\n');
    return `cd /Users/daiki/plan\n\n${commands}\n\ngit add .\ngit commit -m "update: タスク状態を更新"\ngit push origin main`;
  };
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateCommands());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-100 shrink-0">
          <h3 className="text-2xl font-black text-slate-900">
            <i className="fab fa-github mr-3"></i>GitHubに変更を反映
          </h3>
          <p className="text-sm text-slate-500 mt-2">以下のコマンドをターミナルで実行してください</p>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1">
          <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
              {generateCommands()}
            </pre>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="text-sm font-bold text-blue-800 mb-2">
              <i className="fas fa-info-circle mr-2"></i>変更対象ファイル
            </h4>
            <ul className="space-y-1">
              {changedFiles.map((f, i) => (
                <li key={i} className="text-sm text-blue-700">
                  <i className="fas fa-file-code mr-2"></i>{f.path}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="p-8 bg-slate-50 flex justify-end space-x-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            閉じる
          </button>
          <button
            onClick={handleCopy}
            className={`px-6 py-3 rounded-xl font-bold transition-colors ${
              copied 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <i className={`${copied ? 'fas fa-check' : 'fas fa-copy'} mr-2`}></i>
            {copied ? 'コピーしました！' : 'コマンドをコピー'}
          </button>
        </div>
      </div>
    </div>
  );
};
