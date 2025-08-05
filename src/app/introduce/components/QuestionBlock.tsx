'use client';

import { useState, useCallback } from 'react';
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
  const maxLength = 500;

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setCharCount(newContent.length);
    onUpdateContent(newContent);
  }, [onUpdateContent]);

  return (
      <div
          className={styles.questionBlock}
          id={`question-${index}`}
      >
        {/* showHeader가 true일 때만 문항 제목 영역 표시 */}
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
            placeholder="내용을 입력해주세요 (최대 500자)"
        />

        <div className={styles.charCount}>
          {charCount} / {maxLength}자
        </div>
      </div>
  );
}