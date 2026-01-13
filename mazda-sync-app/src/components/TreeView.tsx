import { useState, useEffect, useRef } from 'react';
import { StrategyNode, Issue } from '../types';
import './TreeView.css';

interface TreeViewProps {
  strategyData: StrategyNode;
  onNavigate: (issue: Issue) => void;
}

const IssueCard = ({ issue, onNavigate }: { issue: Issue; onNavigate: (issue: Issue) => void }) => (
  <button
    onClick={() => onNavigate(issue)}
    className="issue-card"
  >
    <div className="text-[10px] font-bold text-blue-500 mb-1">#{issue.id}</div>
    <div className="text-xs font-semibold text-slate-700 leading-tight">{issue.title}</div>
    <div className="mt-2 text-[10px] text-slate-400">{issue.tasks.length} tasks</div>
  </button>
);

const Node = ({ node, onNavigate }: { node: StrategyNode; onNavigate: (issue: Issue) => void }) => {
  const hasChildren = node.children && node.children.length > 0;
  const hasIssues = node.issues && node.issues.length > 0;
  const hasChildElements = hasChildren || hasIssues;
  
  const allChildren = [
    ...(node.children || []).map(c => ({ type: 'node' as const, id: c.id, data: c })),
    ...(node.issues || []).map(i => ({ type: 'issue' as const, id: i.id, data: i }))
  ];

  return (
    <div className="tree-node">
      <div className={`node-box ${
        node.id === 'root' ? 'node-root' : hasIssues ? 'node-with-issues' : 'node-default'
      }`}>
        {node.icon && <i className={`${node.icon} node-icon ${node.id === 'root' ? 'text-white/80' : 'text-blue-500'}`}></i>}
        <h3 className={`node-title ${node.id === 'root' ? 'text-white' : 'text-slate-700'}`}>
          {node.title}
        </h3>
      </div>

      {hasChildElements && (
        <div className="tree-children">
          <div className="connector-vertical"></div>
          <div className={`children-container ${allChildren.length > 1 ? 'has-multiple' : ''}`}>
            {allChildren.map((child) => (
              <div key={child.id} className="child-wrapper">
                <div className="connector-vertical"></div>
                {child.type === 'node' ? (
                  <Node node={child.data} onNavigate={onNavigate} />
                ) : (
                  <IssueCard issue={child.data} onNavigate={onNavigate} />
                )}
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
  const [treeDimensions, setTreeDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // パディング設定（定数）
  const PADDING = 40;

  // 自動フィット計算
  const calculateFit = () => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    // getBoundingClientRect で正確なサイズを取得
    const rect = measure.getBoundingClientRect();
    // scrollWidth/scrollHeight も考慮してより大きい方を使用
    const treeWidth = Math.max(rect.width, measure.scrollWidth);
    const treeHeight = Math.max(rect.height, measure.scrollHeight);
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (treeWidth === 0 || treeHeight === 0) {
      setTimeout(calculateFit, 100);
      return;
    }

    // ツリーサイズを保存
    setTreeDimensions({ width: treeWidth, height: treeHeight });

    // 利用可能なスペース（パディングを両側から引く + スクロールバー分）
    const scrollBarWidth = 20;
    const availableWidth = containerWidth - (PADDING * 2) - scrollBarWidth;
    const availableHeight = containerHeight - (PADDING * 2);

    // スケール計算：利用可能スペースに収まるように
    const scaleX = availableWidth / treeWidth;
    const scaleY = availableHeight / treeHeight;
    let newScale = Math.min(scaleX, scaleY);

    // 安全マージン（10%縮小）
    newScale = newScale * 0.90;

    // 範囲制限
    newScale = Math.max(0.1, Math.min(1.0, newScale));

    setScale(newScale);
  };

  useEffect(() => {
    const timer = setTimeout(calculateFit, 100);

    const handleResize = () => calculateFit();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => calculateFit());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [strategyData]);

  // 2本指スクロール（ピンチ）でのズーム（カーソル位置中心）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // ctrlKeyが押されている = ピンチジェスチャー（トラックパッド）
      if (e.ctrlKey) {
        e.preventDefault();

        const delta = -e.deltaY * 0.01;
        const oldScale = scale;
        const newScale = Math.max(0.1, Math.min(1.5, oldScale + delta));

        if (oldScale === newScale) return;

        // カーソル位置（コンテナ内の座標）
        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left + container.scrollLeft;
        const cursorY = e.clientY - rect.top + container.scrollTop;

        // スケール変更後のスクロール位置を計算
        const scaleRatio = newScale / oldScale;
        const newScrollLeft = cursorX * scaleRatio - (e.clientX - rect.left);
        const newScrollTop = cursorY * scaleRatio - (e.clientY - rect.top);

        setScale(newScale);

        // 次のフレームでスクロール位置を更新
        requestAnimationFrame(() => {
          container.scrollLeft = newScrollLeft;
          container.scrollTop = newScrollTop;
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scale]);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.1, Math.min(1.5, prev + delta)));
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: '#f8fafc',
        position: 'relative'
      }}
    >
      {/* 非表示の測定用 */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          left: 0,
          top: 0
        }}
      >
        <Node node={strategyData} onNavigate={() => {}} />
      </div>

      {/* 表示用：スクロール可能なコンテンツ */}
      <div
        style={{
          display: 'inline-block',
          minWidth: '100%',
          minHeight: '100%',
          padding: PADDING,
          boxSizing: 'border-box',
          textAlign: 'center'
        }}
      >
        {/* スケール後のサイズを持つラッパー */}
        <div
          style={{
            display: 'inline-block',
            width: treeDimensions.width * scale,
            height: treeDimensions.height * scale,
            position: 'relative',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            <Node node={strategyData} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
      
      {/* ズームコントロール */}
      <div 
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          padding: '8px',
          zIndex: 50
        }}
      >
        <button 
          onClick={() => handleZoom(-0.05)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}
        >
          <i className="fas fa-minus"></i>
        </button>
        <span style={{ 
          padding: '0 8px', 
          fontSize: '13px', 
          fontWeight: 'bold', 
          color: '#475569',
          minWidth: '45px',
          textAlign: 'center'
        }}>
          {Math.round(scale * 100)}%
        </span>
        <button 
          onClick={() => handleZoom(0.05)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}
        >
          <i className="fas fa-plus"></i>
        </button>
        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }}></div>
        <button 
          onClick={calculateFit}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#3b82f6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
          title="画面にフィット"
        >
          <i className="fas fa-expand"></i>
        </button>
      </div>
    </div>
  );
};
