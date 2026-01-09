import { useState, useEffect, useRef } from 'react';
import { StrategyNode, Issue } from '../types';

interface TreeViewProps {
  strategyData: StrategyNode;
  onNavigate: (issue: Issue) => void;
}

const Node = ({ node, onNavigate }: { node: StrategyNode; onNavigate: (issue: Issue) => void }) => {
  const hasChildren = node.children && node.children.length > 0;
  const hasIssues = node.issues && node.issues.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* ノード */}
      <div className={`px-6 py-4 rounded-2xl border-2 text-center min-w-[180px] max-w-[280px] shadow-sm ${
        node.id === 'root' 
          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-400' 
          : hasIssues 
            ? 'bg-white border-slate-200 hover:border-blue-300 cursor-pointer' 
            : 'bg-slate-50 border-slate-200'
      }`}>
        {node.icon && <i className={`${node.icon} text-lg mb-2 ${node.id === 'root' ? 'text-white/80' : 'text-blue-500'}`}></i>}
        <h3 className={`text-sm font-bold leading-tight ${node.id === 'root' ? 'text-white' : 'text-slate-700'}`}>
          {node.title}
        </h3>
        {hasIssues && (
          <div className="mt-2 text-xs text-slate-400">
            {node.issues!.length} Issues
          </div>
        )}
      </div>

      {/* 子ノードまたはIssues */}
      {(hasChildren || hasIssues) && (
        <div className="mt-4 relative">
          {/* 縦線 */}
          <div className="absolute left-1/2 -top-4 w-0.5 h-4 bg-slate-300 -translate-x-1/2"></div>
          
          <div className="flex gap-8 relative">
            {/* 横線 */}
            {((hasChildren && node.children!.length > 1) || (hasIssues && node.issues!.length > 1)) && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-300" style={{
                left: 'calc(50% - 50% + 90px)',
                right: 'calc(50% - 50% + 90px)',
                width: 'calc(100% - 180px)'
              }}></div>
            )}
            
            {hasChildren && node.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center relative">
                <div className="w-0.5 h-4 bg-slate-300"></div>
                <Node node={child} onNavigate={onNavigate} />
              </div>
            ))}
            
            {hasIssues && node.issues!.map((issue) => (
              <div key={issue.id} className="flex flex-col items-center relative">
                <div className="w-0.5 h-4 bg-slate-300"></div>
                <button
                  onClick={() => onNavigate(issue)}
                  className="px-4 py-3 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all min-w-[160px] max-w-[200px] text-left"
                >
                  <div className="text-[10px] font-bold text-blue-500 mb-1">#{issue.id}</div>
                  <div className="text-xs font-semibold text-slate-700 leading-tight">{issue.title}</div>
                  <div className="mt-2 text-[10px] text-slate-400">{issue.tasks.length} tasks</div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const TreeView = ({ strategyData, onNavigate }: TreeViewProps) => {
  const [scale, setScale] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const autoScaleAndCenter = () => {
      if (containerRef.current && treeRef.current) {
        setScale(1);
        
        requestAnimationFrame(() => {
          if (!containerRef.current || !treeRef.current) return;
          
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;
          const treeWidth = treeRef.current.offsetWidth;
          const treeHeight = treeRef.current.offsetHeight;
          
          const padding = 80;
          const scaleX = (containerWidth - padding) / treeWidth;
          const scaleY = (containerHeight - padding) / treeHeight;
          
          const optimalScale = Math.min(1.0, Math.max(0.4, Math.min(scaleX, scaleY)));
          setScale(optimalScale);
          
          requestAnimationFrame(() => {
            if (containerRef.current && treeRef.current) {
              const scaledWidth = treeWidth * optimalScale;
              const offsetX = Math.max(0, (containerWidth - scaledWidth) / 2);
              containerRef.current.scrollLeft = 0;
              treeRef.current.style.marginLeft = `${offsetX}px`;
            }
            setInitialized(true);
          });
        });
      }
    };
    
    setInitialized(false);
    const timer = setTimeout(autoScaleAndCenter, 100);
    window.addEventListener('resize', autoScaleAndCenter);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', autoScaleAndCenter);
    };
  }, [strategyData]);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(1.5, Math.max(0.3, prev + delta)));
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-auto relative">
      <main className="absolute inset-0 flex justify-center items-start pt-10">
        <div 
          ref={treeRef} 
          className={`tree-wrapper ${!initialized ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            transform: `scale(${scale})`,
            transition: initialized ? 'opacity 0.3s ease-out, transform 0.2s ease-out' : 'none',
            transformOrigin: 'top left'
          }}
        >
          <Node node={strategyData} onNavigate={onNavigate} />
        </div>
        
        {/* ズームコントロール */}
        <div className="fixed bottom-8 right-8 flex items-center space-x-2 bg-white rounded-2xl shadow-lg border border-slate-200 p-2">
          <button 
            onClick={() => handleZoom(-0.1)}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
          >
            <i className="fas fa-minus"></i>
          </button>
          <span className="px-3 text-sm font-bold text-slate-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => handleZoom(0.1)}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
          >
            <i className="fas fa-plus"></i>
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button 
            onClick={() => {
              setInitialized(false);
              setTimeout(() => setInitialized(true), 100);
            }}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            title="リセット"
          >
            <i className="fas fa-compress-arrows-alt"></i>
          </button>
        </div>
      </main>
    </div>
  );
};
