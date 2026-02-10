import { useState } from 'react';

interface MemoItem {
  id: string;
  text: string;
  done: boolean;
}

const STORAGE_KEY = 'mazda-sync-memo';

const DEFAULT_MEMOS: MemoItem[] = [
  { id: '1', text: '町民会館の予約', done: false },
  { id: '2', text: 'ホームページの改修（活動履歴がわかりにくい問題を解決）', done: false },
  { id: '3', text: '和田酒店さんのオリジナルラベルの画像を作る', done: false },
  { id: '4', text: '和田酒店さんに対戦表の印刷物を提出する', done: false },
  { id: '5', text: 'BAR BER LODGEにデジタルカルテを提案する', done: false },
  { id: '6', text: 'G検定の勉強をする', done: false },
];

const loadMemos = (): MemoItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    // 初回は初期データを保存して返す
    saveMemos(DEFAULT_MEMOS);
    return DEFAULT_MEMOS;
  } catch {
    return DEFAULT_MEMOS;
  }
};

const saveMemos = (memos: MemoItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
};

export const MemoView = () => {
  const [memos, setMemos] = useState<MemoItem[]>(loadMemos);
  const [newText, setNewText] = useState('');

  const update = (next: MemoItem[]) => {
    setMemos(next);
    saveMemos(next);
  };

  const addMemo = () => {
    const text = newText.trim();
    if (!text) return;
    update([...memos, { id: Date.now().toString(), text, done: false }]);
    setNewText('');
  };

  const toggleDone = (id: string) => {
    update(memos.map(m => m.id === id ? { ...m, done: !m.done } : m));
  };

  const removeMemo = (id: string) => {
    update(memos.filter(m => m.id !== id));
  };

  const pending = memos.filter(m => !m.done);
  const done = memos.filter(m => m.done);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-slate-800 mb-6">
          <i className="fas fa-sticky-note text-amber-500 mr-3"></i>
          メモ
        </h2>

        {/* 入力欄 */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMemo()}
            placeholder="新しいメモを追加..."
            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 transition-colors"
          />
          <button
            onClick={addMemo}
            className="px-5 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-1"></i>追加
          </button>
        </div>

        {/* 未完了 */}
        {pending.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              やること ({pending.length})
            </h3>
            <div className="space-y-2">
              {pending.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                  <button
                    onClick={() => toggleDone(m.id)}
                    className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-blue-500 transition-colors flex-shrink-0"
                  />
                  <span className="flex-1 text-sm font-medium text-slate-700">{m.text}</span>
                  <button
                    onClick={() => removeMemo(m.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <i className="fas fa-trash-alt text-sm"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 完了済み */}
        {done.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              完了 ({done.length})
            </h3>
            <div className="space-y-2">
              {done.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-100 rounded-xl">
                  <button
                    onClick={() => toggleDone(m.id)}
                    className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-500 flex-shrink-0 flex items-center justify-center"
                  >
                    <i className="fas fa-check text-white text-xs"></i>
                  </button>
                  <span className="flex-1 text-sm font-medium text-slate-400 line-through">{m.text}</span>
                  <button
                    onClick={() => removeMemo(m.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <i className="fas fa-trash-alt text-sm"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {memos.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <i className="fas fa-sticky-note text-4xl mb-4 block"></i>
            <p className="font-bold">メモはまだありません</p>
            <p className="text-sm mt-1">上の入力欄からメモを追加してください</p>
          </div>
        )}
      </div>
    </div>
  );
};
