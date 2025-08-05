'use client';

import styles from '../style.module.css';

interface SidebarProps {
  questionCount: number;
  onAddQuestion: () => void;
  onRemoveQuestion: () => void;
  onScrollToQuestion: (index: number) => void;
  visible: boolean;
}

export default function Sidebar({
  questionCount,
  onAddQuestion,
  onRemoveQuestion,
  onScrollToQuestion,
  visible
}: SidebarProps) {
  const sidebarStyle = {
    visibility: visible ? 'visible' : 'hidden',
    opacity: visible ? '1' : '0',
    pointerEvents: visible ? 'auto' : 'none'
  } as React.CSSProperties;

  return (
    <div className={styles.sidebar} style={sidebarStyle}>
      {Array.from({ length: questionCount }, (_, i) => i + 1).map(num => (
        <button
          key={num}
          className={styles.sidebarButton}
          onClick={() => onScrollToQuestion(num)}
        >
          {num}
        </button>
      ))}
      
      <button
        className={styles.sidebarButton}
        onClick={onAddQuestion}
        title="문항 추가"
      >
        +
      </button>
      
      <button
        className={styles.sidebarButton}
        onClick={onRemoveQuestion}
        disabled={questionCount <= 1}
        title="문항 삭제"
        style={{ 
          opacity: questionCount <= 1 ? 0.5 : 1,
          cursor: questionCount <= 1 ? 'not-allowed' : 'pointer'
        }}
      >
        -
      </button>
    </div>
  );
}