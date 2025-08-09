'use client';

import { useState, useCallback, useEffect } from 'react';
import styles from '../style.module.css';

interface QuestionBlockProps {
  id: string;
  index: number;
  title: string;
  content: string;
  showHeader: boolean;
  isFirstQuestion: boolean;
  onUpdateTitle: (value: string) => void;
  onUpdateContent: (value: string) => void;
}

export default function QuestionBlock({
                                        index,
                                        title,
                                        content,
                                        showHeader,
                                        isFirstQuestion,
                                        onUpdateTitle,
                                        onUpdateContent
                                      }: QuestionBlockProps) {
  const [charCount, setCharCount] = useState(content.length);
  
  // 토글 상태에 따른 글자수 제한 설정
  // showHeader가 true면 단일 문항 모드 (2000자)
  // showHeader가 false면 다중 문항 모드 (1000자)
  const maxLength = showHeader ? 2000 : 1000;

  // content가 변경될 때 charCount 업데이트
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    
    // 글자수 제한 체크
    if (newContent.length <= maxLength) {
      setCharCount(newContent.length);
      onUpdateContent(newContent);
    }
  }, [onUpdateContent, maxLength]);

  const getPlaceholderText = () => {
    if (showHeader) {
      return `내용을 입력해주세요 (최대 ${maxLength.toLocaleString()}자)`;
    } else {
      return `내용을 입력해주세요 (최대 ${maxLength.toLocaleString()}자)`;
    }
  };

  return (
      <div
          className={styles.questionBlock}
          id={`question-${index}`}
      >
        {/* showHeader가 false일 때만 문항 제목 영역 표시 */}
        {!showHeader && (
            <div className={styles.questionHeader}>
              <label className={styles.questionLabel}>문항 {index}</label>
              <input
                  type="text"
                  className={styles.questionTitleInput}
                  placeholder="지원 동기, 입사 후 포부 등 입력"
                  value={title}
                  onChange={(e) => onUpdateTitle(e.target.value)}
              />
            </div>
        )}

        <textarea
            className={styles.content}
            value={content}
            onChange={handleContentChange}
            maxLength={maxLength}
            placeholder={getPlaceholderText()}
        />

        <div className={styles.charCount}>
          <span className={charCount > maxLength * 0.9 ? styles.charCountWarning : ''}>
            {charCount.toLocaleString()} / {maxLength.toLocaleString()}자
          </span>
        </div>
      </div>
  );
}
