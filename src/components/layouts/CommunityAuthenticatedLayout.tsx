// components/layouts/CommunityAuthenticatedLayout.tsx
"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import './CommunityLayout.css'

// 동적 임포트로 클라이언트 전용 컴포넌트들 로드
const GlobalSidebar = dynamic(() => import('@/components/GlobalSidebar'), {
    ssr: false,
    loading: () => null
});

const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), {
    ssr: false,
    loading: () => null
});

interface CommunityAuthenticatedLayoutProps {
    children: React.ReactNode;
    pathname: string;
}

export default function CommunityAuthenticatedLayout({ children, pathname }: CommunityAuthenticatedLayoutProps) {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // 🔥 화면 크기 체크
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 🔥 일반 사용자(USER) 전용 경로
    const userPaths = [
        '/dashboard',
        '/profile',
        '/resume',
        '/introduce',
        '/spec-management',
        '/job-calendar',
        '/community',
        '/statistics',
        '/settings'
    ]

    // 🔥 관리자(ADMIN) 전용 경로
    const adminPaths = ['/admin']

    // 🔥 공개 경로 (인증 불필요) - find-account 추가
    const publicPaths = ['/', '/login', '/signup', '/find-account']

    // 쿠키 읽기 헬퍼
    const getCookie = (name: string): string | null => {
        try {
            const value = `; ${document.cookie}`
            const parts = value.split(`; ${name}=`)
            if (parts.length === 2) {
                return parts.pop()?.split(';').shift() || null
            }
            return null
        } catch (error) {
            return null
        }
    }

    // 🔥 인증 상태 확인
    useEffect(() => {
        const checkAuth = () => {
            try {
                const userId = localStorage.getItem('userId') || getCookie('userId')
                const role = localStorage.getItem('userRole') || getCookie('userRole')

                console.log('🔍 Community Auth check:', {
                    userId: userId ? '***' + userId.slice(-3) : null,
                    role,
                    pathname
                })

                const isAuth = !!(userId && userId.trim() && userId !== 'undefined')

                setIsAuthenticated(isAuth)
                setUserRole(role)
                setIsCheckingAuth(false)

                return { isAuth, role }
            } catch (error) {
                console.error('❌ Community Auth check error:', error)
                setIsAuthenticated(false)
                setUserRole(null)
                setIsCheckingAuth(false)
                return { isAuth: false, role: null }
            }
        }

        checkAuth()
    }, [])

    // 🔥 경로 체크 및 리다이렉트
    useEffect(() => {
        if (isCheckingAuth) return // 인증 체크 중이면 대기

        const isUserPath = userPaths.some(path => pathname.startsWith(path))
        const isAdminPath = adminPaths.some(path => pathname.startsWith(path))
        const isPublicPath = publicPaths.includes(pathname)

        console.log('🔐 Community Path check:', {
            pathname,
            isAuthenticated,
            userRole,
            isUserPath,
            isAdminPath,
            isPublicPath
        })

        // 인증되지 않은 사용자
        if (!isAuthenticated) {
            console.log('❌ Unauthenticated access to community, redirecting to login')
            setShouldRedirect(true)
            setTimeout(() => {
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
            }, 100)
            return
        }

        // 관리자 권한 체크
        if (userRole === 'ADMIN') {
            if (!isAdminPath && pathname.startsWith('/community')) {
                console.log('❌ Admin accessing community, redirecting to admin')
                setShouldRedirect(true)
                setTimeout(() => {
                    router.push('/admin')
                }, 100)
                return
            }
        }

        // 일반 사용자 권한 체크
        if (userRole === 'USER') {
            if (isAdminPath) {
                console.log('❌ User accessing admin path, redirecting to dashboard')
                setShouldRedirect(true)
                setTimeout(() => {
                    router.push('/dashboard')
                }, 100)
                return
            }
        }

        // 정상 접근
        setShouldRedirect(false)

    }, [isCheckingAuth, isAuthenticated, userRole, pathname, router])

    // 🔥 로딩 중이거나 리다이렉트 중
    if (isCheckingAuth || shouldRedirect) {
        return (
            <div className="community-app-layout">
                <main className="community-main-content-full">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1] mx-auto mb-4"></div>
                            <p className="text-gray-600">
                                {isCheckingAuth ? '인증 확인 중...' : '페이지 이동 중...'}
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // 🔥 정상적인 렌더링 - 커뮤니티 전용 레이아웃
    const isUserPath = userPaths.some(path => pathname.startsWith(path))
    const showSidebar = isAuthenticated && userRole === 'USER' && isUserPath

    return (
        <div className="community-app-layout">
            {showSidebar && <GlobalSidebar />}
            <main className={showSidebar ? "community-main-content" : "community-main-content-full"}>
                {children}
            </main>
            {showSidebar && <ScrollToTop />}
        </div>
    )
}