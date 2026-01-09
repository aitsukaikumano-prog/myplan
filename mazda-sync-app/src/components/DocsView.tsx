import { useState } from 'react';
import { Meeting } from '../types';
import { DOCS_DATA } from '../data/docsData';

interface DocsViewProps {
  currentProject: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  kickoff: { label: 'キックオフ', color: 'bg-green-100 text-green-700 border-green-300' },
  review: { label: 'レビュー', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  planning: { label: '計画', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  workshop: { label: 'ワークショップ', color: 'bg-orange-100 text-orange-700 border-orange-300' }
};

export const DocsView = ({ currentProject }: DocsViewProps) => {
  const [selectedDoc, setSelectedDoc] = useState<Meeting | null>(null);
  const [filterType, setFilterType] = useState('all');
  
  const docs = DOCS_DATA[currentProject]?.meetings || [];
  const filteredDocs = filterType === 'all' ? docs : docs.filter(d => d.type === filterType);

  if (selectedDoc) {
    const typeConfig = TYPE_LABELS[selectedDoc.type] || { label: selectedDoc.type, color: 'bg-slate-100 text-slate-700' };
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-10 max-w-4xl mx-auto pb-20">
          <button 
            onClick={() => setSelectedDoc(null)}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            <span className="font-bold">議事録一覧に戻る</span>
          </button>
          
          <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center space-x-3 mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                <span className="text-sm text-slate-400">{selectedDoc.date}</span>
                {selectedDoc.relatedIssue && (
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                    関連: #{selectedDoc.relatedIssue}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-black text-slate-900">{selectedDoc.title}</h2>
            </div>
            
            <div className="p-8 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <i className="fas fa-users mr-2"></i>参加者
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDoc.attendees.map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-sm font-semibold text-slate-600">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <i className="fas fa-file-alt mr-2"></i>概要
                </h3>
                <p className="text-lg text-slate-700 leading-relaxed">{selectedDoc.summary}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <i className="fas fa-check-circle mr-2"></i>決定事項
                </h3>
                <div className="space-y-3">
                  {selectedDoc.decisions.map((d, i) => (
                    <div key={i} className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                      <i className="fas fa-check text-green-600 mt-1"></i>
                      <span className="text-slate-700 font-medium">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  <i className="fas fa-folder mr-2"></i>
                  保存先: github_sim2/docs/meetings/{selectedDoc.id}.md
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-10 max-w-5xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-black text-slate-900">議事録・ドキュメント</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              すべて
            </button>
            {Object.entries(TYPE_LABELS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterType === key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {filteredDocs.length === 0 ? (
          <div className="text-center py-20">
            <i className="fas fa-file-alt text-6xl text-slate-200 mb-4"></i>
            <p className="text-xl text-slate-400 font-semibold">このプロジェクトにはまだ議事録がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map(doc => {
              const typeConfig = TYPE_LABELS[doc.type] || { label: doc.type, color: 'bg-slate-100 text-slate-700' };
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full text-left bg-white rounded-2xl border-2 border-slate-100 p-6 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <span className="text-sm text-slate-400">{doc.date}</span>
                        {doc.relatedIssue && (
                          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                            #{doc.relatedIssue}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{doc.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{doc.summary}</p>
                    </div>
                    <i className="fas fa-chevron-right text-slate-300 ml-4"></i>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
