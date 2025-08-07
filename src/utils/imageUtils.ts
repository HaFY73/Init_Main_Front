/**
 * 🔥 이미지 처리 유틸리티 함수들
 * Cloudinary 이미지 URL 처리 및 기본 아바타 생성
 */

/**
 * 아바타 데이터 타입 정의
 */
export interface AvatarData {
  hasImage: boolean;
  imageUrl: string;
  fallbackChar: string;
}

/**
 * 🔥 아바타 데이터 생성 통합 함수
 * 프로필 이미지가 있으면 사용하고, 없으면 이름 기반 기본 아바타 생성
 */
export const getAvatarData = (profileImageUrl?: string | null, displayName?: string | null): AvatarData => {
  console.log('🔍 [getAvatarData] 입력:', { profileImageUrl, displayName });
  
  // 🔥 더 엄격한 프로필 이미지 유효성 검사 - 백엔드에서 null로 처리되는 경우 포함
  const isValidImageUrl = profileImageUrl && 
      typeof profileImageUrl === 'string' &&
      profileImageUrl.trim() !== '' && 
      profileImageUrl !== 'null' && 
      profileImageUrl !== 'undefined' &&
      profileImageUrl !== 'http://localhost:8080/null' && // 백엔드에서 잘못된 URL 생성 시
      profileImageUrl !== 'https://initmainback-production.up.railway.app/null' && // 프로덕션 잘못된 URL
      (profileImageUrl.startsWith('http') || profileImageUrl.startsWith('/'));

  // 🔥 프로필 이미지가 있는 경우
  if (isValidImageUrl) {
    
    let imageUrl = profileImageUrl.trim();
    
    // 🔥 Cloudinary URL 최적화
    if (imageUrl.includes('cloudinary.com')) {
      // Cloudinary 변환 파라미터 추가 (크기 최적화, 품질 개선)
      if (!imageUrl.includes('/w_') && !imageUrl.includes('/c_')) {
        const uploadIndex = imageUrl.indexOf('/upload/');
        if (uploadIndex !== -1) {
          imageUrl = imageUrl.substring(0, uploadIndex + 8) + 
                    'c_fill,w_96,h_96,q_auto,f_auto/' + 
                    imageUrl.substring(uploadIndex + 8);
        }
      }
    }
    
    console.log('✅ [getAvatarData] 유효한 이미지 URL:', imageUrl);
    
    return {
      hasImage: true,
      imageUrl: imageUrl,
      fallbackChar: getDisplayNameFirstChar(displayName)
    };
  }
  
  // 🔥 프로필 이미지가 없는 경우 - 이름 기반 기본 아바타
  const fallbackChar = getDisplayNameFirstChar(displayName);
  
  console.log('⚠️ [getAvatarData] 이미지 없음, fallback 사용:', fallbackChar);
  
  return {
    hasImage: false,
    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackChar)}&background=6366f1&color=fff&size=96`,
    fallbackChar: fallbackChar
  };
};

/**
 * 🔥 표시 이름에서 첫 글자 추출 (한글/영문 지원)
 */
const getDisplayNameFirstChar = (displayName?: string | null): string => {
  if (!displayName || displayName.trim() === '') {
    return 'U'; // 기본값
  }
  
  const name = displayName.trim();
  
  // 첫 번째 문자 추출
  const firstChar = name.charAt(0).toUpperCase();
  
  // 한글, 영문, 숫자만 허용 (특수문자는 기본값 사용)
  if (/[가-힣a-zA-Z0-9]/.test(firstChar)) {
    return firstChar;
  }
  
  return 'U'; // 기본값
};

/**
 * 🔥 게시글 이미지 URL 처리
 */
export const getPostImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return '/placeholder_image.png'; // 기본 플레이스홀더
  }
  
  let processedUrl = imageUrl.trim();
  
  // 🔥 Cloudinary URL 최적화
  if (processedUrl.includes('cloudinary.com')) {
    // 게시글 이미지용 변환 파라미터 (더 큰 크기, 자동 포맷)
    if (!processedUrl.includes('/w_') && !processedUrl.includes('/c_')) {
      const uploadIndex = processedUrl.indexOf('/upload/');
      if (uploadIndex !== -1) {
        processedUrl = processedUrl.substring(0, uploadIndex + 8) + 
                      'c_limit,w_800,h_600,q_auto,f_auto/' + 
                      processedUrl.substring(uploadIndex + 8);
      }
    }
  }
  
  return processedUrl;
};

/**
 * 🔥 전체 이미지 URL 처리 (일반적인 용도)
 */
export const getFullImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return '/placeholder_image.png';
  }
  
  const url = imageUrl.trim();
  
  // 🔥 이미 완전한 URL인 경우 그대로 반환
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 🔥 상대 경로인 경우 절대 경로로 변환
  if (url.startsWith('/')) {
    return `https://initmainback-production.up.railway.app${url}`;
  }
  
  // 🔥 기타 경우 기본 서버 경로 추가
  return `https://initmainback-production.up.railway.app/api/uploads/${url}`;
};

/**
 * 🔥 프로필 이미지 캐시 새로고침
 * 프로필 업데이트 후 이미지 캐시 문제 해결
 */
export const refreshAllProfileImages = () => {
  console.log('🔄 프로필 이미지 캐시 새로고침 시작...');
  
  try {
    // 🔥 1. 모든 img 태그의 src 새로고침
    const allImages = document.querySelectorAll('img[src*="cloudinary.com"], img[src*="ui-avatars.com"]');
    
    allImages.forEach((img, index) => {
      const imageElement = img as HTMLImageElement;
      const originalSrc = imageElement.src;
      
      if (originalSrc) {
        // 🔥 타임스탬프 추가로 캐시 무효화
        const separator = originalSrc.includes('?') ? '&' : '?';
        const newSrc = `${originalSrc}${separator}_t=${Date.now()}`;
        
        console.log(`🖼️ 이미지 ${index + 1} 새로고침:`, newSrc);
        
        // 🔥 새로운 src로 설정
        imageElement.src = newSrc;
      }
    });
    
    // 🔥 2. React 컴포넌트 state 강제 업데이트를 위한 커스텀 이벤트 발송
    window.dispatchEvent(new CustomEvent('profileImageRefresh', {
      detail: { timestamp: Date.now() }
    }));
    
    // 🔥 3. 브라우저 이미지 캐시 강제 새로고침
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image') || cacheName.includes('cloudinary')) {
            caches.delete(cacheName);
            console.log('🗑️ 이미지 캐시 삭제:', cacheName);
          }
        });
      });
    }
    
    console.log('✅ 프로필 이미지 캐시 새로고침 완료');
    
  } catch (error) {
    console.error('❌ 프로필 이미지 캐시 새로고침 오류:', error);
  }
};

/**
 * 🔥 Object URL 정리
 * @param url - 정리할 Object URL
 */
export const revokeImagePreviewUrl = (url: string) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * 🔥 이미지 로딩 에러 핸들러
 */
export const handleImageLoadError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackUrl?: string,
  fallbackChar?: string
) => {
  const imgElement = event.currentTarget;
  
  console.log('🖼️ 이미지 로딩 실패:', imgElement.src);
  
  if (fallbackUrl) {
    // 🔥 지정된 fallback URL 사용
    imgElement.src = fallbackUrl;
  } else if (fallbackChar) {
    // 🔥 이름 기반 기본 아바타 생성
    imgElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackChar)}&background=6366f1&color=fff&size=96`;
  } else {
    // 🔥 일반적인 플레이스홀더
    imgElement.src = '/placeholder_person.svg';
  }
  
  // 🔥 무한 루프 방지
  imgElement.onerror = null;
};

/**
 * 🔥 이미지 URL 유효성 검사
 */
export const isValidImageUrl = (url?: string | null): boolean => {
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
    return false;
  }
  
  const trimmedUrl = url.trim();
  
  // HTTP/HTTPS URL 검사
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return true;
  }
  
  // 상대 경로 검사
  if (trimmedUrl.startsWith('/')) {
    return true;
  }
  
  return false;
};

/**
 * 🔥 이미지 미리보기 URL 생성
 */
export const createImagePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};
