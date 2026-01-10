import { useState, useEffect } from 'react';
import { Document, DocumentCategory } from '../types';

interface DocsViewProps {
  currentProject: string;
  documents: Document[];
}

const CATEGORY_LABELS: Record<DocumentCategory, { label: string; icon: string; color: string; bgColor: string }> = {
  meeting: { label: '議事録', icon: 'fas fa-users', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  proposal: { label: '提案書', icon: 'fas fa-lightbulb', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  report: { label: '報告書', icon: 'fas fa-chart-line', color: 'text-emerald-600', bgColor: 'bg-emerald-100' }
};

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
  kickoff: { label: 'キックオフ', icon: 'fas fa-rocket', color: 'text-green-600', bgColor: 'bg-green-100' },
  review: { label: 'レビュー', icon: 'fas fa-search', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  planning: { label: '計画', icon: 'fas fa-calendar-alt', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  workshop: { label: 'ワークショップ', icon: 'fas fa-users', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  proposal: { label: '提案書', icon: 'fas fa-lightbulb', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  report: { label: '報告書', icon: 'fas fa-chart-line', color: 'text-emerald-600', bgColor: 'bg-emerald-100' }
};

const STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: '下書き', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  review: { label: 'レビュー中', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  approved: { label: '承認済', color: 'text-green-600', bgColor: 'bg-green-100' },
  archived: { label: 'アーカイブ', color: 'text-slate-400', bgColor: 'bg-slate-50' }
};

export const DocsView = ({ documents }: DocsViewProps) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | DocumentCategory>('all');
  const [viewMode, setViewMode] = useState<'summary' | 'raw'>('summary');

  const filteredDocs = filterCategory === 'all' ? documents : documents.filter(d => d.category === filterCategory);

  // 最初のドキュメントを自動選択
  useEffect(() => {
    if (filteredDocs.length > 0 && !selectedDoc) {
      setSelectedDoc(filteredDocs[0]);
    }
  }, [filteredDocs]);

  // フィルタ変更時に選択をリセット
  useEffect(() => {
    if (filteredDocs.length > 0) {
      setSelectedDoc(filteredDocs[0]);
    } else {
      setSelectedDoc(null);
    }
  }, [filterCategory]);

  // 日付をフォーマット
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
        <span className="text-sm font-semibold text-slate-500 mr-2">カテゴリ:</span>
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
            filterCategory === 'all'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          すべて ({documents.length})
        </button>
        {(Object.entries(CATEGORY_LABELS) as [DocumentCategory, typeof CATEGORY_LABELS['meeting']][]).map(([key, { label, icon }]) => {
          const count = documents.filter(d => d.category === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                filterCategory === key
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
        {/* 左: ドキュメント一覧 */}
        <div className="w-[350px] border-r border-slate-200 flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto">
            {filteredDocs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <i className="fas fa-file-alt text-4xl mb-2"></i>
                  <p className="text-sm">ドキュメントがありません</p>
                </div>
              </div>
            ) : (
              <div>
                {filteredDocs.map(doc => {
                  const categoryConfig = CATEGORY_LABELS[doc.category];
                  const isSelected = selectedDoc?.id === doc.id;

                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoc(doc);
                        setViewMode('summary');
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* カテゴリアイコン */}
                        <div className={`w-8 h-8 rounded-full ${categoryConfig.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                          <i className={`${categoryConfig.icon} ${categoryConfig.color} text-xs`}></i>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* タイトル */}
                          <div className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {doc.title}
                          </div>

                          {/* 日付・ステータス */}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-slate-400">
                              {formatDate(doc.date)}
                              {doc.author && <span className="ml-2">{doc.author}</span>}
                            </span>
                            {doc.status && (
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${STATUS_LABELS[doc.status]?.bgColor || 'bg-slate-100'} ${STATUS_LABELS[doc.status]?.color || 'text-slate-600'}`}>
                                {STATUS_LABELS[doc.status]?.label || doc.status}
                              </span>
                            )}
                            {doc.relatedIssue && (
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                #{doc.relatedIssue}
                              </span>
                            )}
                          </div>

                          {/* 概要（1行） */}
                          <p className="text-xs text-slate-400 truncate mt-1">
                            {doc.summary}
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

        {/* 右: ドキュメント詳細 */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {selectedDoc ? (
            <>
              {/* ヘッダー */}
              <div className="p-6 border-b border-slate-200 shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {(() => {
                        const typeConfig = TYPE_LABELS[selectedDoc.type] || {
                          label: selectedDoc.type,
                          icon: 'fas fa-file',
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
                      <span className="text-sm text-slate-400">{selectedDoc.date}</span>
                      {selectedDoc.status && (
                        <span className={`text-xs font-bold px-2 py-1 rounded ${STATUS_LABELS[selectedDoc.status]?.bgColor || 'bg-slate-100'} ${STATUS_LABELS[selectedDoc.status]?.color || 'text-slate-600'}`}>
                          {STATUS_LABELS[selectedDoc.status]?.label || selectedDoc.status}
                        </span>
                      )}
                      {selectedDoc.relatedIssue && (
                        <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-600">
                          #{selectedDoc.relatedIssue}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedDoc.title}</h2>
                    {selectedDoc.author && (
                      <p className="text-sm text-slate-500 mt-1">
                        <i className="fas fa-user mr-1"></i>作成者: {selectedDoc.author}
                      </p>
                    )}
                  </div>
                </div>

                {/* 議事録の場合: 参加者表示 */}
                {selectedDoc.category === 'meeting' && selectedDoc.attendees && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-500 text-sm">
                        <i className="fas fa-users mr-1"></i>参加者:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedDoc.attendees.map((a, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white rounded text-xs font-medium text-slate-600 border border-slate-200">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 表示切り替え */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('summary')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                      viewMode === 'summary'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <i className="fas fa-list-ul mr-1"></i>サマリー
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

              {/* 本文 */}
              <div className="flex-1 overflow-y-auto p-6">
                {viewMode === 'summary' ? (
                  <div className="space-y-6">
                    {/* 概要 */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <i className="fas fa-file-alt mr-2"></i>概要
                      </h3>
                      <p className="text-slate-700 leading-relaxed">{selectedDoc.summary}</p>
                    </div>

                    {/* 議事録の場合: 決定事項 */}
                    {selectedDoc.category === 'meeting' && selectedDoc.decisions && selectedDoc.decisions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                          <i className="fas fa-check-circle mr-2"></i>決定事項
                        </h3>
                        <div className="space-y-2">
                          {selectedDoc.decisions.map((d, i) => (
                            <div key={i} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <i className="fas fa-check text-green-600 mt-0.5"></i>
                              <span className="text-slate-700 text-sm">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 提案書・報告書の場合: セクション表示 */}
                    {(selectedDoc.category === 'proposal' || selectedDoc.category === 'report') && selectedDoc.sections && (
                      <div className="space-y-4">
                        {selectedDoc.sections.map((section, i) => (
                          <div key={i}>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                              <i className="fas fa-bookmark mr-2"></i>{section.title}
                            </h3>
                            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg p-4">
                              {section.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* フッター */}
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400">
                        <i className="fas fa-github mr-2"></i>
                        GitHubから取得: docs/{selectedDoc.category === 'meeting' ? 'meetings' : selectedDoc.category === 'proposal' ? 'proposals' : 'reports'}/{selectedDoc.id.replace(/^(meeting|proposal|report)-/, '')}.md
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
                      {selectedDoc.rawContent || '原文データがありません'}
                    </pre>
                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400">
                        <i className="fas fa-github mr-2"></i>
                        GitHubから取得: docs/{selectedDoc.category === 'meeting' ? 'meetings' : selectedDoc.category === 'proposal' ? 'proposals' : 'reports'}/{selectedDoc.id.replace(/^(meeting|proposal|report)-/, '')}.md
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <i className="fas fa-file-alt text-6xl mb-4"></i>
                <p className="text-lg font-semibold">ドキュメントを選択してください</p>
                <p className="text-sm mt-1">左側のリストからドキュメントを選択すると、ここに内容が表示されます</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
