import { useState, useEffect } from 'react';
import { Email } from '../types';

interface EmailsViewProps {
  currentProject: string;
  emails: Email[];
}

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
  decision: { label: '決定', icon: 'fas fa-gavel', color: 'text-green-600', bgColor: 'bg-green-100' },
  report: { label: '報告', icon: 'fas fa-chart-bar', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  request: { label: '依頼', icon: 'fas fa-hand-paper', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  info: { label: 'お知らせ', icon: 'fas fa-info-circle', color: 'text-purple-600', bgColor: 'bg-purple-100' }
};

export const EmailsView = ({ emails }: EmailsViewProps) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'summary' | 'raw'>('summary');

  const filteredEmails = filterType === 'all' ? emails : emails.filter(e => e.type === filterType);

  // 最初のメールを自動選択
  useEffect(() => {
    if (filteredEmails.length > 0 && !selectedEmail) {
      setSelectedEmail(filteredEmails[0]);
    }
  }, [filteredEmails]);

  // フィルタ変更時に選択をリセット
  useEffect(() => {
    if (filteredEmails.length > 0) {
      setSelectedEmail(filteredEmails[0]);
    } else {
      setSelectedEmail(null);
    }
  }, [filterType]);

  // 日付をフォーマット（時刻部分を除去して短く）
  const formatDate = (dateStr: string) => {
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[2]}/${match[3]}`;
    }
    return dateStr;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* フィルタバー */}
      <div className="flex items-center space-x-2 px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
        <span className="text-sm font-semibold text-slate-500 mr-2">フィルタ:</span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
            filterType === 'all'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          すべて ({emails.length})
        </button>
        {Object.entries(TYPE_LABELS).map(([key, { label, icon }]) => {
          const count = emails.filter(e => e.type === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                filterType === key
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <i className={`${icon} mr-1`}></i>
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* メインコンテンツ: 2カラムレイアウト */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左: メール一覧 */}
        <div className="w-[350px] border-r border-slate-200 flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <i className="fas fa-inbox text-4xl mb-2"></i>
                  <p className="text-sm">メールがありません</p>
                </div>
              </div>
            ) : (
              <div>
                {filteredEmails.map(email => {
                  const typeConfig = TYPE_LABELS[email.type] || {
                    label: email.type,
                    icon: 'fas fa-envelope',
                    color: 'text-slate-600',
                    bgColor: 'bg-slate-100'
                  };
                  const isSelected = selectedEmail?.id === email.id;

                  return (
                    <button
                      key={email.id}
                      onClick={() => {
                        setSelectedEmail(email);
                        setViewMode('summary');
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* タイプアイコン */}
                        <div className={`w-8 h-8 rounded-full ${typeConfig.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                          <i className={`${typeConfig.icon} ${typeConfig.color} text-xs`}></i>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* 件名 */}
                          <div className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {email.subject}
                          </div>

                          {/* 送信者・日付 */}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-slate-500 truncate">
                              {email.from.split(' ').slice(-1)[0]}
                            </span>
                            <span className="text-xs text-slate-400 shrink-0 ml-2">
                              {formatDate(email.date)}
                            </span>
                          </div>

                          {/* 概要（1行） */}
                          <p className="text-xs text-slate-400 truncate mt-1">
                            {email.summary}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 右: メール詳細 */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {selectedEmail ? (
            <>
              {/* メールヘッダー */}
              <div className="p-6 border-b border-slate-200 shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {(() => {
                        const typeConfig = TYPE_LABELS[selectedEmail.type] || {
                          label: selectedEmail.type,
                          icon: 'fas fa-envelope',
                          color: 'text-slate-600',
                          bgColor: 'bg-slate-100'
                        };
                        return (
                          <span className={`text-xs font-bold px-2 py-1 rounded ${typeConfig.bgColor} ${typeConfig.color}`}>
                            <i className={`${typeConfig.icon} mr-1`}></i>
                            {typeConfig.label}
                          </span>
                        );
                      })()}
                      {selectedEmail.relatedIssue && (
                        <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-600">
                          #{selectedEmail.relatedIssue}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedEmail.subject}</h2>
                  </div>
                </div>

                {/* メタ情報 */}
                <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex">
                    <span className="font-semibold text-slate-500 w-14">From:</span>
                    <span className="text-slate-700">{selectedEmail.from}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-slate-500 w-14">To:</span>
                    <span className="text-slate-700">{selectedEmail.to.join(', ')}</span>
                  </div>
                  {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                    <div className="flex">
                      <span className="font-semibold text-slate-500 w-14">CC:</span>
                      <span className="text-slate-700">{selectedEmail.cc.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="font-semibold text-slate-500 w-14">Date:</span>
                    <span className="text-slate-700">{selectedEmail.date}</span>
                  </div>
                </div>

                {/* 表示切り替え */}
                <div className="flex items-center space-x-2 mt-4">
                  <button
                    onClick={() => setViewMode('summary')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                      viewMode === 'summary'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <i className="fas fa-eye mr-1"></i>内容
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                      viewMode === 'raw'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <i className="fas fa-code mr-1"></i>原文
                  </button>
                </div>
              </div>

              {/* メール本文 */}
              <div className="flex-1 overflow-y-auto p-6">
                {viewMode === 'summary' ? (
                  <div className="prose prose-slate max-w-none">
                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                      {selectedEmail.body}
                    </div>
                  </div>
                ) : (
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
                    {selectedEmail.rawContent || '原文データがありません'}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <i className="fas fa-envelope-open text-6xl mb-4"></i>
                <p className="text-lg font-semibold">メールを選択してください</p>
                <p className="text-sm mt-1">左側のリストからメールを選択すると、ここに内容が表示されます</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
