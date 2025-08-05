'use client';

import { useState, useEffect } from 'react';
import styles from './FloatingMenu.module.css';

interface FloatingMenuProps {
  questionCount: number;
  onAddQuestion: () => void;
  onRemoveQuestion: () => void;
  onScrollToQuestion: (index: number) => void;
  visible: boolean;
}

export default function FloatingMenu({
  questionCount,
  onAddQuestion,
  onRemoveQuestion,
  onScrollToQuestion,
  visible
}: FloatingMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치에 따라 메뉴 표시 여부 결정
  useEffect(() => {
    const toggleVisibility = () => {
      // 200px 이상 스크롤 시 메뉴 표시
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.floatingMenu} ${isVisible ? styles.visible : ''}`}>
      {/* 메인 토글 버튼 */}
      <button
        className={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
        title="문항 메뉴"
      >
        {isExpanded ? '×' : '☰'}
      </button>

      {/* 확장 메뉴 */}
      <div className={`${styles.menuContainer} ${isExpanded ? styles.expanded : ''}`}>
        {/* 문항 번호 버튼들 */}
        <div className={styles.questionNumbers}>
          {Array.from({ length: questionCount }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              className={styles.questionButton}
              onClick={() => {
                onScrollToQuestion(num);
                setIsExpanded(false);
              }}
              title={`문항 ${num}로 이동`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* 추가/삭제 버튼 */}
        <div className={styles.actionButtons}>
          <button
            className={styles.addButton}
            onClick={() => {
              onAddQuestion();
              setIsExpanded(false);
            }}
            title="문항 추가"
          >
            +
          </button>
          
          <button
            className={styles.removeButton}
            onClick={() => {
              onRemoveQuestion();
              setIsExpanded(false);
            }}
            disabled={questionCount <= 1}
            title="문항 삭제"
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
}