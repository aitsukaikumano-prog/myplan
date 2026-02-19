import { useState, useEffect } from 'react';
import { MemoItem } from '../types';

export const MemoView = ({ memos }: { memos: MemoItem[] }) => {
  const [localMemos, setLocalMemos] = useState<MemoItem[]>(memos);

  useEffect(() => {
    setLocalMemos(memos);
  }, [memos]);

  const toggleDone = (id: string) => {
    setLocalMemos(prev => prev.map(m => m.id === id ? { ...m, done: !m.done } : m));
  };

  const pending = localMemos.filter(m => !m.done);
  const done = localMemos.filter(m => m.done);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-slate-800 mb-6">
          <i className="fas fa-sticky-note text-amber-500 mr-3"></i>
          メモ
        </h2>

        <p className="text-xs text-slate-400 mb-6">
          <i className="fas fa-info-circle mr-1"></i>
          メモの追加・削除は memos.yaml を編集してください
        </p>

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
                </div>
              ))}
            </div>
          </div>
        )}

        {localMemos.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <i className="fas fa-sticky-note text-4xl mb-4 block"></i>
            <p className="font-bold">メモはまだありません</p>
            <p className="text-sm mt-1">memos.yaml にメモを追加してください</p>
          </div>
        )}
      </div>
    </div>
  );
};
