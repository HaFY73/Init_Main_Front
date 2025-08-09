'use client';

import { useEffect, useRef, useState } from 'react';
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
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // IntersectionObserver를 사용하여 sticky 상태 감지
  useEffect(() => {
    if (!sidebarRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '-40px 0px 0px 0px', // top: 40px와 맞춤
        threshold: 0
      }
    );

    // sticky 감지를 위한 센티넬 요소 생성
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    sentinel.style.left = '0';
    sentinel.style.right = '0';
    
    const sidebarParent = sidebarRef.current.parentElement;
    if (sidebarParent) {
      sidebarParent.insertBefore(sentinel, sidebarRef.current);
      observer.observe(sentinel);
    }

    return () => {
      observer.disconnect();
      if (sentinel.parentElement) {
        sentinel.parentElement.removeChild(sentinel);
      }
    };
  }, []);

  // visibility 스타일을 더 명확하게 처리
  const sidebarStyle = {
    visibility: visible ? 'visible' : 'hidden',
    opacity: visible ? '1' : '0',
    pointerEvents: visible ? 'auto' : 'none',
    transition: 'all 0.3s ease',
    // sticky 상태에 따른 추가 스타일
    ...(isSticky && {
      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)'
    })
  } as React.CSSProperties;

  return (
    <div 
      ref={sidebarRef}
      className={styles.sidebar} 
      style={sidebarStyle}
      data-sticky={isSticky}
    >
      {Array.from({ length: questionCount }, (_, i) => i + 1).map(num => (
        <button
          key={num}
          className={styles.sidebarButton}
          onClick={() => onScrollToQuestion(num)}
          aria-label={`문항 ${num}번으로 이동`}
        >
          {num}
        </button>
      ))}
      
      <button
        className={styles.sidebarButton}
        onClick={onAddQuestion}
        title="문항 추가"
        aria-label="문항 추가"
      >
        +
      </button>
      
      <button
        className={styles.sidebarButton}
        onClick={onRemoveQuestion}
        disabled={questionCount <= 1}
        title="문항 삭제"
        aria-label="문항 삭제"
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