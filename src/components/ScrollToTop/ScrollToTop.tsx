"use client";

import { useState, useEffect } from "react";
import styles from './ScrollToTop.module.css';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치에 따라 버튼 표시 여부 결정
  useEffect(() => {
    const toggleVisibility = () => {
      // 300px 이상 스크롤 시 버튼 표시
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // 맨 위로 스크롤하는 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // 부드러운 스크롤 효과
    });
  };

  return (
    <div className={`${styles.scrollToTop} ${isVisible ? styles.visible : ''}`}>
      <button
        onClick={scrollToTop}
        className={styles.scrollButton}
        aria-label="맨 위로 스크롤"
        title="맨 위로"
      >
        ↑
      </button>
    </div>
  );
}