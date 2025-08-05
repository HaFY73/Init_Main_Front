// hooks/useAuth.ts
import { useEffect, useState } from 'react';

export const useAuth = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null); // 🔥 역할 정보 추가
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 쿠키 읽기 헬퍼 함수
    const getCookie = (name: string): string | null => {
        if (typeof window === 'undefined') return null;

        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                return parts.pop()?.split(';').shift() || null;
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        // 🔥 JWT 토큰 확인 (가장 중요!)
        const token = localStorage.getItem('authToken') ||
            localStorage.getItem('accessToken') ||
            getCookie('authToken');

        // 사용자 정보 확인
        const storedUserId = localStorage.getItem('userId') || getCookie('userId');
        const storedUserName = localStorage.getItem('userName') || getCookie('userName');
        const storedUserRole = localStorage.getItem('userRole') || getCookie('userRole'); // 🔥 역할 정보

        console.log('👤 useAuth: 인증 정보 확인', {
            hasToken: !!token,
            storedUserId,
            storedUserName,
            storedUserRole // 🔥 역할 정보 로그
        });

        // 🔥 토큰과 사용자 정보가 모두 있어야 인증 성공
        if (token && storedUserId && storedUserId !== 'undefined') {
            setUserId(storedUserId);
            setUserName(storedUserName || 'Unknown User');
            setUserRole(storedUserRole || 'USER'); // 🔥 역할 정보 설정 (기본값: USER)
            setIsAuthenticated(true);
            console.log('✅ 인증 성공');
        } else {
            setIsAuthenticated(false);
            console.log('❌ 인증 실패 - 토큰 또는 사용자 정보 없음');

            // 불완전한 데이터가 있다면 정리
            if (!token && (storedUserId || storedUserName || storedUserRole)) {
                console.log('🧹 불완전한 인증 데이터 정리');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('userRole'); // 🔥 역할 정보도 정리
                localStorage.removeItem('authToken');
                localStorage.removeItem('accessToken');
            }
        }

        setIsLoading(false);
    }, []);

    // 🔥 역할 확인 헬퍼 함수들
    const isAdmin = () => userRole === 'ADMIN';
    const isUser = () => userRole === 'USER';

    return {
        userId,
        userName,
        userRole, // 🔥 역할 정보 반환
        isLoading,
        isAuthenticated,
        isAdmin, // 🔥 관리자 확인 함수
        isUser   // 🔥 일반 사용자 확인 함수
    };
};